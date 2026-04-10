const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login-google
// @desc    Login with Google ID token
router.post('/login-google', authLimiter, async (req, res, next) => {
  try {
    const { idToken, location } = req.body;

    // In production, verify the Google ID token here
    // For now, generate a user based on token info
    const email = 'user@gmail.com'; // Extract from idToken in production
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: 'Google User',
        email: email,
        password: await bcrypt.hash('google-login-' + Date.now(), 12),
        location: location || { latitude: null, longitude: null },
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, location, preferences, fcmToken } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (location) user.location = { ...user.location, ...location };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (fcmToken) user.fcmToken = fcmToken;

    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
