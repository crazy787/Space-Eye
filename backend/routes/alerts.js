const express = require('express');
const router = express.Router();
const n2yoService = require('../services/n2yoService');
const notificationService = require('../services/notificationService');
const Alert = require('../models/Alert');
const { protect, optionalAuth } = require('../middleware/auth');
const { azimuthToCompass, formatDuration, getTimeUntil } = require('../utils/timeUtils');
const { NORAD_IDS } = require('../config/constants');

// @route   GET /api/alerts/passes
// @desc    Get upcoming ISS visual passes for a location
router.get('/passes', async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, days = 10, minVis = 60 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const data = await n2yoService.getVisualPasses(
      NORAD_IDS.ISS,
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(alt),
      parseInt(days),
      parseInt(minVis)
    );

    const passes = data.passes?.map((pass) => ({
      startTime: new Date(pass.startUTC * 1000).toISOString(),
      startTimestamp: pass.startUTC,
      endTime: new Date(pass.endUTC * 1000).toISOString(),
      endTimestamp: pass.endUTC,
      duration: pass.duration,
      durationFormatted: formatDuration(pass.duration),
      maxElevation: pass.maxEl,
      startAzimuth: pass.startAz,
      startDirection: azimuthToCompass(pass.startAz),
      endAzimuth: pass.endAz,
      endDirection: azimuthToCompass(pass.endAz),
      magnitude: pass.mag,
      timeUntil: getTimeUntil(pass.startUTC),
    })) || [];

    res.json({
      success: true,
      data: {
        satellite: data.info,
        transactionsCount: data.info?.transactionscount,
        passes,
        passCount: passes.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/alerts/subscribe
// @desc    Subscribe to pass alerts for the user's location
router.post('/subscribe', protect, async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, days = 10, minVis = 60 } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Fetch upcoming passes
    const data = await n2yoService.getVisualPasses(
      NORAD_IDS.ISS,
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(alt),
      parseInt(days),
      parseInt(minVis)
    );

    // Create alerts for each pass
    const alerts = [];
    for (const pass of data.passes || []) {
      const alert = await Alert.create({
        user: req.user._id,
        satelliteId: NORAD_IDS.ISS,
        satelliteName: 'ISS (ZARYA)',
        passData: {
          startTime: new Date(pass.startUTC * 1000),
          endTime: new Date(pass.endUTC * 1000),
          duration: pass.duration,
          maxElevation: pass.maxEl,
          startAzimuth: pass.startAz,
          startAzimuthCompass: azimuthToCompass(pass.startAz),
          endAzimuth: pass.endAz,
          endAzimuthCompass: azimuthToCompass(pass.endAz),
          magnitude: pass.mag,
        },
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
      });
      alerts.push(alert);
    }

    // Update user location
    req.user.location = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      altitude: parseFloat(alt),
    };
    await req.user.save();

    res.status(201).json({
      success: true,
      message: `Subscribed to ${alerts.length} upcoming ISS passes`,
      data: { alertCount: alerts.length, alerts },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/alerts/my
// @desc    Get user's alerts
router.get('/my', protect, async (req, res, next) => {
  try {
    const alerts = await Alert.find({
      user: req.user._id,
      'passData.startTime': { $gte: new Date() },
    }).sort({ 'passData.startTime': 1 });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete an alert
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
