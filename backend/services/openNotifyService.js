const axios = require('axios');
const { OPEN_NOTIFY_BASE_URL } = require('../config/constants');

class OpenNotifyService {
  constructor() {
    this.baseUrl = OPEN_NOTIFY_BASE_URL;
  }

  /**
   * Get current ISS position (fallback/lightweight)
   * Returns: { iss_position: { latitude, longitude }, timestamp, message }
   */
  async getISSPosition() {
    try {
      const response = await axios.get(`${this.baseUrl}/iss-now.json`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('Open Notify ISS position error:', error.message);
      throw new Error('Failed to fetch ISS position from Open Notify');
    }
  }

  /**
   * Get people currently in space
   * Returns: { people: [{ name, craft }], number, message }
   */
  async getAstronauts() {
    try {
      const response = await axios.get(`${this.baseUrl}/astros.json`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('Open Notify astronauts error:', error.message);
      throw new Error('Failed to fetch astronaut data');
    }
  }
}

module.exports = new OpenNotifyService();
