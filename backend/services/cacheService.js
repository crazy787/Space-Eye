const openNotifyService = require('../services/openNotifyService');
const n2yoService = require('../services/n2yoService');
const { NORAD_IDS } = require('../config/constants');

class CacheService {
  constructor() {
    this.issPosition = null;
    this.astronauts = null;
    this.issLastUpdated = null;
    this.astronautsLastUpdated = null;
    this.cacheTTL = 5000; // 5 seconds for ISS position
    this.astronautsTTL = 300000; // 5 minutes for astronauts
  }

  async getISSPosition() {
    const now = Date.now();
    if (this.issPosition && this.issLastUpdated && (now - this.issLastUpdated) < this.cacheTTL) {
      return { ...this.issPosition, cached: true, lastUpdated: this.issLastUpdated };
    }

    try {
      const data = await openNotifyService.getISSPosition();
      this.issPosition = data;
      this.issLastUpdated = now;
      return { ...data, cached: false, lastUpdated: now };
    } catch (error) {
      // Return stale cache if available
      if (this.issPosition) {
        return { ...this.issPosition, cached: true, stale: true, lastUpdated: this.issLastUpdated };
      }
      throw error;
    }
  }

  async getAstronauts() {
    const now = Date.now();
    if (this.astronauts && this.astronautsLastUpdated && (now - this.astronautsLastUpdated) < this.astronautsTTL) {
      return { ...this.astronauts, cached: true };
    }

    try {
      const data = await openNotifyService.getAstronauts();
      this.astronauts = data;
      this.astronautsLastUpdated = now;
      return { ...data, cached: false };
    } catch (error) {
      if (this.astronauts) {
        return { ...this.astronauts, cached: true, stale: true };
      }
      throw error;
    }
  }

  getLastUpdated() {
    return {
      issPosition: this.issLastUpdated ? new Date(this.issLastUpdated).toISOString() : null,
      astronauts: this.astronautsLastUpdated ? new Date(this.astronautsLastUpdated).toISOString() : null,
    };
  }
}

module.exports = new CacheService();
