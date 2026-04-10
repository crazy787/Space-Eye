const express = require('express');
const router = express.Router();
const n2yoService = require('../services/n2yoService');
const openNotifyService = require('../services/openNotifyService');
const { getRegionName, isOverLand, isNighttime } = require('../utils/geoUtils');
const { NORAD_IDS, ISS_ORBITAL_SPEED_KMH, ISS_ALTITUDE_KM } = require('../config/constants');

// @route   GET /api/iss/position
// @desc    Get current ISS position (uses Open Notify as primary, N2YO as enriched)
router.get('/position', async (req, res, next) => {
  try {
    // Get basic position from Open Notify (free, no API key needed)
    const openNotifyData = await openNotifyService.getISSPosition();

    const lat = parseFloat(openNotifyData.iss_position.latitude);
    const lng = parseFloat(openNotifyData.iss_position.longitude);

    // Enrich with geo data
    const region = getRegionName(lat, lng);
    const landCheck = isOverLand(lat, lng);
    const nighttime = isNighttime(lat, lng);

    res.json({
      success: true,
      data: {
        latitude: lat,
        longitude: lng,
        altitude: ISS_ALTITUDE_KM,
        speed: ISS_ORBITAL_SPEED_KMH,
        timestamp: openNotifyData.timestamp,
        region,
        overLand: landCheck.overLand,
        landRegion: landCheck.region,
        isNighttime: nighttime,
        visibility: nighttime ? 'Potentially visible' : 'Daytime (not visible)',
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/iss/position/detailed
// @desc    Get detailed ISS position with prediction (uses N2YO)
router.get('/position/detailed', async (req, res, next) => {
  try {
    const { lat = 0, lng = 0, alt = 0, seconds = 10 } = req.query;

    const data = await n2yoService.getPositions(
      NORAD_IDS.ISS,
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(alt),
      parseInt(seconds)
    );

    res.json({
      success: true,
      data: {
        info: data.info,
        positions: data.positions?.map((pos) => ({
          latitude: pos.satlatitude,
          longitude: pos.satlongitude,
          altitude: pos.sataltitude,
          azimuth: pos.azimuth,
          elevation: pos.elevation,
          rightAscension: pos.ra,
          declination: pos.dec,
          timestamp: pos.timestamp,
          eclipsed: pos.eclipsed,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/iss/astronauts
// @desc    Get people currently in space
router.get('/astronauts', async (req, res, next) => {
  try {
    const data = await openNotifyService.getAstronauts();

    // Group by spacecraft
    const byCraft = {};
    data.people?.forEach((person) => {
      if (!byCraft[person.craft]) byCraft[person.craft] = [];
      byCraft[person.craft].push(person.name);
    });

    res.json({
      success: true,
      data: {
        total: data.number,
        people: data.people,
        byCraft,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/iss/tle
// @desc    Get ISS TLE (Two-Line Element) data
router.get('/tle', async (req, res, next) => {
  try {
    const data = await n2yoService.getTLE(NORAD_IDS.ISS);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
