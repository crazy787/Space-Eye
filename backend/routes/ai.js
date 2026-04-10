const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');
const openNotifyService = require('../services/openNotifyService');
const ChatHistory = require('../models/ChatHistory');
const { protect, optionalAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');
const { v4: uuidv4 } = require('crypto');

// Generate simple session ID
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// @route   POST /api/ai/chat
// @desc    Send a message to the AI assistant
router.post('/chat', aiLimiter, optionalAuth, async (req, res, next) => {
  try {
    const { message, sessionId, includeContext = true } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Build context with real-time data
    let context = null;
    if (includeContext) {
      try {
        const [issData, astronautData] = await Promise.all([
          openNotifyService.getISSPosition(),
          openNotifyService.getAstronauts(),
        ]);
        context = {
          issPosition: {
            latitude: issData.iss_position.latitude,
            longitude: issData.iss_position.longitude,
          },
          astronauts: astronautData,
        };

        if (req.body.userLocation) {
          context.userLocation = req.body.userLocation;
        }
      } catch (err) {
        console.warn('Could not fetch real-time context:', err.message);
      }
    }

    // Build message history
    let conversationMessages = [];
    const currentSessionId = sessionId || generateSessionId();

    // Load existing history if user is authenticated
    if (req.user && sessionId) {
      const history = await ChatHistory.findOne({
        user: req.user._id,
        sessionId,
      });
      if (history) {
        conversationMessages = history.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
    }

    // Add current message
    conversationMessages.push({ role: 'user', content: message });

    // Get AI response
    const aiResponse = await openaiService.chat(conversationMessages, context);

    // Save to history if authenticated
    if (req.user) {
      let history = await ChatHistory.findOne({
        user: req.user._id,
        sessionId: currentSessionId,
      });

      if (!history) {
        const title = await openaiService.generateTitle(message);
        history = new ChatHistory({
          user: req.user._id,
          sessionId: currentSessionId,
          title,
          messages: [],
          context: context || {},
        });
      }

      history.messages.push(
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse.content }
      );
      await history.save();
    }

    res.json({
      success: true,
      data: {
        response: aiResponse.content,
        sessionId: currentSessionId,
        usage: aiResponse.usage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/ai/history
// @desc    Get chat history
router.get('/history', protect, async (req, res, next) => {
  try {
    const histories = await ChatHistory.find({ user: req.user._id })
      .select('sessionId title updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);

    const summary = histories.map((h) => ({
      sessionId: h.sessionId,
      title: h.title,
      lastMessage: h.messages[h.messages.length - 1]?.content?.substring(0, 100),
      messageCount: h.messages.length,
      updatedAt: h.updatedAt,
    }));

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/ai/suggestions
// @desc    Get suggested questions
router.get('/suggestions', (req, res) => {
  const suggestions = [
    { text: 'Where is the ISS right now?', icon: '🛰️', category: 'tracking' },
    { text: 'Can I see the ISS tonight?', icon: '🌙', category: 'visibility' },
    { text: 'How many people are in space?', icon: '👨‍🚀', category: 'crew' },
    { text: 'Why do astronauts float?', icon: '🌌', category: 'science' },
    { text: 'How fast does the ISS move?', icon: '⚡', category: 'tracking' },
    { text: 'What do astronauts eat?', icon: '🍕', category: 'life' },
    { text: 'Explain the docking process', icon: '🔗', category: 'operations' },
    { text: 'How does the ISS get power?', icon: '☀️', category: 'engineering' },
  ];

  // Return 4 random suggestions
  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  res.json({ success: true, data: shuffled.slice(0, 4) });
});

module.exports = router;
