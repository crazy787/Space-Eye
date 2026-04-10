const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { optionalAuth, protect } = require('../middleware/auth');

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

// @route   GET /api/settings
// @desc    Get user settings (from User model if logged in, defaults if not)
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      // Build settings from User model preferences
      const user = await User.findById(req.user._id);
      const settings = {
        alerts: {
          enabled: user.preferences?.alertsEnabled ?? true,
          alertBefore: user.preferences?.alertBeforeMinutes ?? 10,
          minVisibility: user.preferences?.minVisibilitySeconds ?? 60,
        },
        satellites: user.preferences?.satellites || ['ISS'],
        units: {
          speed: user.preferences?.speedUnit || 'kmh',
          altitude: user.preferences?.altitudeUnit || 'km',
          temperature: user.preferences?.temperatureUnit || 'celsius',
        },
        theme: user.preferences?.theme || 'dark',
        location: {
          useGPS: user.preferences?.useGPS ?? true,
          savedLat: user.location?.latitude || null,
          savedLng: user.location?.longitude || null,
          savedCity: user.location?.city || null,
        },
      };

      return res.json({ success: true, data: settings });
    }

    // Anonymous user — return defaults
    res.json({ success: true, data: DEFAULT_SETTINGS });
  } catch (error) {
    console.error('Settings fetch error:', error.message);
    res.json({ success: true, data: DEFAULT_SETTINGS });
  }
});

// @route   PUT /api/settings
// @desc    Update user settings (persists to User model)
router.put('/', optionalAuth, async (req, res) => {
  try {
    const updates = req.body;

    if (req.user) {
      const user = await User.findById(req.user._id);

      // Map settings to the User model's preferences
      if (updates.alerts) {
        if (updates.alerts.enabled !== undefined) {
          user.preferences.alertsEnabled = updates.alerts.enabled;
        }
        if (updates.alerts.alertBefore !== undefined) {
          user.preferences.alertBeforeMinutes = updates.alerts.alertBefore;
        }
        if (updates.alerts.minVisibility !== undefined) {
          user.preferences.minVisibilitySeconds = updates.alerts.minVisibility;
        }
      }

      if (updates.satellites) {
        user.preferences.satellites = updates.satellites.slice(0, 10); // Max 10
      }

      if (updates.units) {
        if (updates.units.speed) user.preferences.speedUnit = updates.units.speed;
        if (updates.units.altitude) user.preferences.altitudeUnit = updates.units.altitude;
        if (updates.units.temperature) user.preferences.temperatureUnit = updates.units.temperature;
      }

      if (updates.theme) {
        user.preferences.theme = updates.theme;
      }

      if (updates.location) {
        if (updates.location.useGPS !== undefined) {
          user.preferences.useGPS = updates.location.useGPS;
        }
        if (updates.location.savedLat !== undefined) {
          user.location.latitude = updates.location.savedLat;
        }
        if (updates.location.savedLng !== undefined) {
          user.location.longitude = updates.location.savedLng;
        }
        if (updates.location.savedCity !== undefined) {
          user.location.city = updates.location.savedCity;
        }
      }

      await user.save();

      // Return the merged settings
      const merged = {
        alerts: {
          enabled: user.preferences.alertsEnabled,
          alertBefore: user.preferences.alertBeforeMinutes,
          minVisibility: user.preferences.minVisibilitySeconds,
        },
        satellites: user.preferences.satellites,
        units: {
          speed: user.preferences.speedUnit,
          altitude: user.preferences.altitudeUnit,
          temperature: user.preferences.temperatureUnit,
        },
        theme: user.preferences.theme,
        location: {
          useGPS: user.preferences.useGPS,
          savedLat: user.location?.latitude || null,
          savedLng: user.location?.longitude || null,
          savedCity: user.location?.city || null,
        },
      };

      return res.json({ success: true, data: merged, message: 'Settings updated' });
    }

    // Anonymous user - return the sent settings back (not persisted)
    const current = { ...DEFAULT_SETTINGS };
    const merged = {
      alerts: { ...current.alerts, ...updates.alerts },
      satellites: updates.satellites || current.satellites,
      units: { ...current.units, ...updates.units },
      theme: updates.theme || current.theme,
      location: { ...current.location, ...updates.location },
    };

    res.json({ success: true, data: merged, message: 'Settings updated (anonymous — not persisted)' });
  } catch (error) {
    console.error('Settings update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// @route   POST /api/settings/reset
// @desc    Reset settings to defaults
router.post('/reset', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);

      user.preferences = {
        alertsEnabled: true,
        alertBeforeMinutes: 10,
        minVisibilitySeconds: 60,
        darkMode: true,
        satellites: ['ISS'],
        speedUnit: 'kmh',
        altitudeUnit: 'km',
        temperatureUnit: 'celsius',
        theme: 'dark',
        useGPS: true,
      };

      await user.save();
    }

    res.json({
      success: true,
      data: DEFAULT_SETTINGS,
      message: 'Settings reset to defaults',
    });
  } catch (error) {
    console.error('Settings reset error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset settings' });
  }
});

module.exports = router;
