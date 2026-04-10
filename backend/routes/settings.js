const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

// Default user settings
const DEFAULT_SETTINGS = {
  alerts: {
    enabled: true,
    alertBefore: 10, // minutes
    minVisibility: 60, // seconds
  },
  satellites: ['ISS'],
  units: {
    speed: 'kmh', // kmh | mph
    altitude: 'km', // km | mi
    temperature: 'celsius', // celsius | fahrenheit
  },
  theme: 'dark', // dark | light | auto
  location: {
    useGPS: true,
    savedLat: null,
    savedLng: null,
    savedCity: null,
  },
};

// In-memory settings store (use MongoDB User model in production)
const settingsStore = new Map();

// @route   GET /api/settings
// @desc    Get user settings
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const settings = settingsStore.get(userId) || DEFAULT_SETTINGS;

  res.json({
    success: true,
    data: settings,
  });
});

// @route   PUT /api/settings
// @desc    Update user settings
router.put('/', optionalAuth, (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const current = settingsStore.get(userId) || { ...DEFAULT_SETTINGS };
  const updates = req.body;

  // Deep merge settings
  const merged = {
    alerts: { ...current.alerts, ...updates.alerts },
    satellites: updates.satellites || current.satellites,
    units: { ...current.units, ...updates.units },
    theme: updates.theme || current.theme,
    location: { ...current.location, ...updates.location },
  };

  settingsStore.set(userId, merged);

  res.json({
    success: true,
    data: merged,
    message: 'Settings updated',
  });
});

// @route   POST /api/settings/reset
// @desc    Reset settings to defaults
router.post('/reset', optionalAuth, (req, res) => {
  const userId = req.user?.id || 'anonymous';
  settingsStore.set(userId, { ...DEFAULT_SETTINGS });

  res.json({
    success: true,
    data: DEFAULT_SETTINGS,
    message: 'Settings reset to defaults',
  });
});

module.exports = router;
