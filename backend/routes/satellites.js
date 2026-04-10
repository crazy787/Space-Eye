const express = require('express');
const router = express.Router();
const n2yoService = require('../services/n2yoService');
const { NORAD_IDS, SATELLITE_CATEGORIES } = require('../config/constants');

// @route   GET /api/satellites/above
// @desc    Get satellites above a location
router.get('/above', async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, radius = 70, category = 0 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const data = await n2yoService.getSatellitesAbove(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(alt),
      parseInt(radius),
      parseInt(category)
    );

    res.json({
      success: true,
      data: {
        info: data.info,
        satellites: data.above?.map((sat) => ({
          id: sat.satid,
          name: sat.satname,
          intDesignator: sat.intDesignator,
          launchDate: sat.launchDate,
          latitude: sat.satlat,
          longitude: sat.satlng,
          altitude: sat.satalt,
        })),
        count: data.info?.satcount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/satellites/position/:noradId
// @desc    Get position of a specific satellite
router.get('/position/:noradId', async (req, res, next) => {
  try {
    const { noradId } = req.params;
    const { lat = 0, lng = 0, alt = 0, seconds = 2 } = req.query;

    const data = await n2yoService.getPositions(
      parseInt(noradId),
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(alt),
      parseInt(seconds)
    );

    res.json({
      success: true,
      data: {
        info: data.info,
        positions: data.positions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/satellites/categories
// @desc    Get available satellite categories
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(SATELLITE_CATEGORIES).map(([name, id]) => ({
      name: name.replace(/_/g, ' '),
      id,
    })),
  });
});

// @route   GET /api/satellites/popular
// @desc    Get NORAD IDs of popular satellites
router.get('/popular', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(NORAD_IDS).map(([name, id]) => ({
      name,
      noradId: id,
    })),
  });
});

module.exports = router;
