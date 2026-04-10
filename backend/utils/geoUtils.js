/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

/**
 * Get the ground track region name for coordinates
 */
const getRegionName = (lat, lng) => {
  if (lat > 66.5) return 'Arctic';
  if (lat < -66.5) return 'Antarctic';
  if (lat > 23.5 && lat < 66.5) {
    if (lng > -30 && lng < 60) return 'Europe/Africa';
    if (lng >= 60 && lng < 150) return 'Asia';
    if (lng >= -170 && lng < -30) return 'Americas';
    return 'Pacific';
  }
  if (lat >= -23.5 && lat <= 23.5) return 'Tropics';
  if (lat < -23.5 && lat > -66.5) return 'Southern Hemisphere';
  return 'Unknown';
};

/**
 * Check if ISS is over land or ocean (simplified check)
 */
const isOverLand = (lat, lng) => {
  // Simplified bounding boxes for major landmasses
  const landMasses = [
    { name: 'North America', latMin: 15, latMax: 72, lngMin: -170, lngMax: -50 },
    { name: 'South America', latMin: -56, latMax: 15, lngMin: -82, lngMax: -34 },
    { name: 'Europe', latMin: 35, latMax: 72, lngMin: -10, lngMax: 40 },
    { name: 'Africa', latMin: -35, latMax: 37, lngMin: -18, lngMax: 52 },
    { name: 'Asia', latMin: 0, latMax: 75, lngMin: 40, lngMax: 180 },
    { name: 'Australia', latMin: -45, latMax: -10, lngMin: 110, lngMax: 155 },
  ];

  for (const land of landMasses) {
    if (
      lat >= land.latMin && lat <= land.latMax &&
      lng >= land.lngMin && lng <= land.lngMax
    ) {
      return { overLand: true, region: land.name };
    }
  }

  return { overLand: false, region: 'Ocean' };
};

/**
 * Check if it's currently nighttime at a location (simplified)
 */
const isNighttime = (lat, lng) => {
  const now = new Date();
  // Approximate solar hour based on longitude
  const solarHour = (now.getUTCHours() + lng / 15 + 24) % 24;
  return solarHour < 6 || solarHour > 18;
};

module.exports = {
  haversineDistance,
  toRad,
  toDeg,
  getRegionName,
  isOverLand,
  isNighttime,
};
