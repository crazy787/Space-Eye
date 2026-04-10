/**
 * Convert Unix timestamp to local time string
 */
const unixToLocal = (timestamp, timezone = 'UTC') => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', { timeZone: timezone });
};

/**
 * Get time until a future timestamp
 * @returns {{ hours, minutes, seconds, totalMinutes }}
 */
const getTimeUntil = (futureTimestamp) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = futureTimestamp - now;

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 };

  return {
    hours: Math.floor(diff / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    totalMinutes: Math.floor(diff / 60),
  };
};

/**
 * Convert azimuth degrees to compass direction
 */
const azimuthToCompass = (azimuth) => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
};

/**
 * Format duration in seconds to human-readable string
 */
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

/**
 * Check if a pass event is upcoming (within alertBeforeMinutes)
 */
const isUpcoming = (startTimestamp, alertBeforeMinutes = 10) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = startTimestamp - now;
  return diff > 0 && diff <= alertBeforeMinutes * 60;
};

module.exports = {
  unixToLocal,
  getTimeUntil,
  azimuthToCompass,
  formatDuration,
  isUpcoming,
};
