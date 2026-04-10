const express = require('express');
const router = express.Router();
const nasaService = require('../services/nasaService');

// @route   GET /api/media/apod
// @desc    Get NASA Astronomy Picture of the Day
router.get('/apod', async (req, res, next) => {
  try {
    const { date, count } = req.query;
    const data = await nasaService.getAPOD(date, count ? parseInt(count) : null);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/media/epic
// @desc    Get Earth Polychromatic Imaging Camera images
router.get('/epic', async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await nasaService.getEPIC(date);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/media/search
// @desc    Search NASA media library
router.get('/search', async (req, res, next) => {
  try {
    const { q, type = 'image' } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    const data = await nasaService.searchMedia(q, type);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/media/mars
// @desc    Get Mars Rover photos
router.get('/mars', async (req, res, next) => {
  try {
    const { rover = 'curiosity', sol = 1000 } = req.query;
    const data = await nasaService.getMarsPhotos(rover, parseInt(sol));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/media/iss-stream
// @desc    Get ISS live stream URLs
router.get('/iss-stream', (req, res) => {
  res.json({
    success: true,
    data: {
      streams: [
        {
          name: 'ISS Live Earth Viewing',
          url: 'https://www.youtube.com/embed/P9C25Un7xaM',
          type: 'youtube',
          description: 'Live view of Earth from the ISS',
        },
        {
          name: 'NASA Live',
          url: 'https://www.youtube.com/embed/21X5lGlDOfg',
          type: 'youtube',
          description: 'NASA TV Public Channel',
        },
      ],
    },
  });
});

module.exports = router;
