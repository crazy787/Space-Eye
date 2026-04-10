const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');
const openNotifyService = require('../services/openNotifyService');
const n2yoService = require('../services/n2yoService');
const ChatHistory = require('../models/ChatHistory');
const { protect, optionalAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');
const { NORAD_IDS } = require('../config/constants');
const { azimuthToCompass, formatDuration, getTimeUntil } = require('../utils/timeUtils');

const generateSessionId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

const normalizeLocation = (rawLocation) => {
  if (!rawLocation) return null;

  const latitude = Number(rawLocation.latitude);
  const longitude = Number(rawLocation.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    altitude: Number(rawLocation.altitude || 0),
    city: rawLocation.city || '',
    country: rawLocation.country || '',
  };
};

const getRequestLocation = (req) =>
  normalizeLocation(req.body.userLocation) || normalizeLocation(req.user?.location);

const buildNextPassContext = async (userLocation) => {
  if (!userLocation) return null;

  const data = await n2yoService.getVisualPasses(
    NORAD_IDS.ISS,
    userLocation.latitude,
    userLocation.longitude,
    userLocation.altitude || 0,
    1,
    60
  );

  const nextPass = data.passes?.[0];
  if (!nextPass) return null;

  const nowTimestamp = Math.floor(Date.now() / 1000);
  const timeUntil = getTimeUntil(nextPass.startUTC);

  return {
    startTime: new Date(nextPass.startUTC * 1000).toISOString(),
    endTime: new Date(nextPass.endUTC * 1000).toISOString(),
    startDirection: azimuthToCompass(nextPass.startAz),
    endDirection: azimuthToCompass(nextPass.endAz),
    duration: nextPass.duration,
    durationFormatted: formatDuration(nextPass.duration),
    minutesUntil: timeUntil.totalMinutes,
    visibleNow: nextPass.startUTC <= nowTimestamp && nextPass.endUTC >= nowTimestamp,
    magnitude: nextPass.mag,
  };
};

router.post('/chat', aiLimiter, optionalAuth, async (req, res, next) => {
  try {
    const {
      message,
      sessionId,
      includeContext = true,
      currentScreen = 'AI',
      userTimezone = 'UTC',
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    let context = null;

    if (includeContext) {
      const userLocation = getRequestLocation(req);

      const [issDataResult, astronautDataResult, nextPassResult] = await Promise.allSettled([
        openNotifyService.getISSPosition(),
        openNotifyService.getAstronauts(),
        buildNextPassContext(userLocation),
      ]);

      context = {
        appScreen: currentScreen,
        userTimezone,
      };

      if (issDataResult.status === 'fulfilled') {
        context.issPosition = {
          latitude: issDataResult.value.iss_position.latitude,
          longitude: issDataResult.value.iss_position.longitude,
        };
      }

      if (astronautDataResult.status === 'fulfilled') {
        context.astronauts = astronautDataResult.value;
      }

      if (userLocation) {
        context.userLocation = userLocation;
      }

      if (nextPassResult.status === 'fulfilled' && nextPassResult.value) {
        context.nextPass = nextPassResult.value;
      }
    }

    let conversationMessages = [];
    const currentSessionId = sessionId || generateSessionId();

    if (req.user && sessionId) {
      const history = await ChatHistory.findOne({
        user: req.user._id,
        sessionId,
      });

      if (history) {
        conversationMessages = history.messages.map((entry) => ({
          role: entry.role,
          content: entry.content,
        }));
      }
    }

    conversationMessages.push({ role: 'user', content: message });

    const aiResponse = await openaiService.chat(conversationMessages, context);

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

      history.context = context || history.context;
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
        context,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history', protect, async (req, res, next) => {
  try {
    const histories = await ChatHistory.find({ user: req.user._id })
      .select('sessionId title updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);

    const summary = histories.map((history) => ({
      sessionId: history.sessionId,
      title: history.title,
      lastMessage: history.messages[history.messages.length - 1]?.content?.substring(0, 100),
      messageCount: history.messages.length,
      updatedAt: history.updatedAt,
    }));

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

router.get('/suggestions', (req, res) => {
  const suggestions = [
    { text: 'Where is the ISS right now?', icon: 'ISS', category: 'tracking' },
    { text: 'Can I see the ISS tonight?', icon: 'MOON', category: 'visibility' },
    { text: 'How many people are in space?', icon: 'CREW', category: 'crew' },
    { text: 'Why do astronauts float?', icon: 'ZERO G', category: 'science' },
    { text: 'How fast does the ISS move?', icon: 'SPEED', category: 'tracking' },
    { text: 'What do astronauts eat?', icon: 'LIFE', category: 'life' },
    { text: 'Explain the docking process', icon: 'DOCK', category: 'operations' },
    { text: 'Show me Starlink near me', icon: 'SAT', category: 'tracking' },
  ];

  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  res.json({ success: true, data: shuffled.slice(0, 4) });
});

module.exports = router;
