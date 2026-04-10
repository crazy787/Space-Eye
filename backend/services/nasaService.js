const axios = require('axios');
const { NASA_BASE_URL } = require('../config/constants');

class NASAService {
  constructor() {
    this.apiKey = process.env.NASA_API_KEY;
    this.baseUrl = NASA_BASE_URL;
  }

  /**
   * Get Astronomy Picture of the Day
   */
  async getAPOD(date = null, count = null) {
    try {
      const params = { api_key: this.apiKey };
      if (date) params.date = date;
      if (count) params.count = count;

      const response = await axios.get(`${this.baseUrl}/planetary/apod`, {
        params,
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('NASA APOD error:', error.message);
      throw new Error('Failed to fetch APOD');
    }
  }

  /**
   * Get Earth Polychromatic Imaging Camera (EPIC) images
   */
  async getEPIC(date = null) {
    try {
      const endpoint = date
        ? `${this.baseUrl}/EPIC/api/natural/date/${date}`
        : `${this.baseUrl}/EPIC/api/natural`;

      const response = await axios.get(endpoint, {
        params: { api_key: this.apiKey },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('NASA EPIC error:', error.message);
      throw new Error('Failed to fetch EPIC images');
    }
  }

  /**
   * Search NASA image/video library
   */
  async searchMedia(query, mediaType = 'image') {
    try {
      const response = await axios.get('https://images-api.nasa.gov/search', {
        params: {
          q: query,
          media_type: mediaType,
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('NASA media search error:', error.message);
      throw new Error('Failed to search NASA media');
    }
  }

  /**
   * Get Mars Rover photos
   */
  async getMarsPhotos(rover = 'curiosity', sol = 1000) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/mars-photos/api/v1/rovers/${rover}/photos`,
        {
          params: { sol, api_key: this.apiKey },
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error) {
      console.error('NASA Mars photos error:', error.message);
      throw new Error('Failed to fetch Mars photos');
    }
  }
}

module.exports = new NASAService();
