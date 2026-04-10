const axios = require('axios');
const { N2YO_BASE_URL, NORAD_IDS } = require('../config/constants');

class N2YOService {
  constructor() {
    this.apiKey = process.env.N2YO_API_KEY;
    this.baseUrl = N2YO_BASE_URL;
  }

  /**
   * Get real-time position of a satellite
   * @param {number} noradId - NORAD catalog ID
   * @param {number} lat - Observer latitude
   * @param {number} lng - Observer longitude
   * @param {number} alt - Observer altitude (meters)
   * @param {number} seconds - Seconds of prediction (max 300)
   */
  async getPositions(noradId = NORAD_IDS.ISS, lat = 0, lng = 0, alt = 0, seconds = 2) {
    try {
      const url = `${this.baseUrl}/positions/${noradId}/${lat}/${lng}/${alt}/${seconds}&apiKey=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error('N2YO getPositions error:', error.message);
      throw new Error('Failed to fetch satellite positions');
    }
  }

  /**
   * Get visual pass predictions for a satellite
   * @param {number} noradId - NORAD catalog ID
   * @param {number} lat - Observer latitude
   * @param {number} lng - Observer longitude
   * @param {number} alt - Observer altitude
   * @param {number} days - Number of days to predict (max 10)
   * @param {number} minVisibility - Minimum visibility in seconds
   */
  async getVisualPasses(noradId = NORAD_IDS.ISS, lat, lng, alt = 0, days = 10, minVisibility = 60) {
    try {
      const url = `${this.baseUrl}/visualpasses/${noradId}/${lat}/${lng}/${alt}/${days}/${minVisibility}&apiKey=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error('N2YO getVisualPasses error:', error.message);
      throw new Error('Failed to fetch visual passes');
    }
  }

  /**
   * Get radio pass predictions
   */
  async getRadioPasses(noradId = NORAD_IDS.ISS, lat, lng, alt = 0, days = 10, minElevation = 10) {
    try {
      const url = `${this.baseUrl}/radiopasses/${noradId}/${lat}/${lng}/${alt}/${days}/${minElevation}&apiKey=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error('N2YO getRadioPasses error:', error.message);
      throw new Error('Failed to fetch radio passes');
    }
  }

  /**
   * Get TLE data for a satellite
   */
  async getTLE(noradId = NORAD_IDS.ISS) {
    try {
      const url = `${this.baseUrl}/tle/${noradId}&apiKey=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error('N2YO getTLE error:', error.message);
      throw new Error('Failed to fetch TLE data');
    }
  }

  /**
   * Get satellites above a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} alt - Altitude
   * @param {number} radius - Search radius in degrees (max 90)
   * @param {number} categoryId - Satellite category
   */
  async getSatellitesAbove(lat, lng, alt = 0, radius = 70, categoryId = 0) {
    try {
      const url = `${this.baseUrl}/above/${lat}/${lng}/${alt}/${radius}/${categoryId}&apiKey=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 15000 });
      return response.data;
    } catch (error) {
      console.error('N2YO getSatellitesAbove error:', error.message);
      throw new Error('Failed to fetch satellites above');
    }
  }
}

module.exports = new N2YOService();
