const OpenAI = require('openai');
const axios = require('axios');

class AIService {
  constructor() {
    this._client = null;
    this._ollamaHealthy = null;
    this._lastHealthCheck = 0;
    this._healthCheckInterval = 30000;

    this.systemPrompt = `You are Space-Eye AI, an expert space education assistant built into a mobile app that tracks the International Space Station and a curated set of satellites in real time.

Your capabilities:
- Answer space-related questions with clear, engaging explanations
- Explain ISS operations, orbital mechanics, astronaut life, and space science
- Help users understand satellite tracking, visibility passes, and sky observation
- Explain rocket launches, docking procedures, and space missions
- Discuss astronomy, planets, stars, and celestial phenomena

Guidelines:
- Keep responses concise but informative for mobile users
- When discussing ISS visibility, mention direction, timing, and brightness
- If the user asks about current ISS position, reference the real-time data provided in context
- If the user is on a simulation or learning screen, tailor the explanation to what they are viewing
- If user location or next pass data is available, use it directly instead of speaking in generalities
- Be educational, approachable, and accurate over being dramatic
- For complex topics, break them into simple, digestible steps
- If you are unsure about something, say so rather than making things up
- Convert technical jargon into plain language

You may receive real-time tracking data in the conversation context.`;

    this.fallbackResponses = {
      default:
        "I'm currently in offline mode and can't process that fully right now. Quick space fact: the ISS travels at about 27,600 km/h and completes one orbit roughly every 92 minutes.",
      iss:
        "The ISS usually orbits about 408 km above Earth at around 27,600 km/h. It circles Earth about every 92 minutes, so astronauts see many sunrises and sunsets each day.",
      astronauts:
        "There are usually 6 to 7 crew members aboard the ISS at a time. They run science experiments and exercise daily to reduce muscle and bone loss in microgravity.",
      visibility:
        "The ISS often looks like a bright, fast-moving star crossing the sky. It is easiest to see around dawn or dusk when it is sunlit but your sky is darker.",
      speed:
        "The ISS travels at roughly 27,600 km/h, which is about 7.66 km every second.",
      gravity:
        "Astronauts float because they are in continuous free fall around Earth, not because gravity disappears. Gravity is still strong at ISS altitude.",
    };
  }

  get client() {
    if (!this._client) {
      this._client = new OpenAI({
        apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || 'ollama',
        baseURL: process.env.AI_BASE_URL || 'http://localhost:11434/v1',
      });
    }

    return this._client;
  }

  get model() {
    return process.env.AI_MODEL || 'llama3';
  }

  async checkHealth() {
    const now = Date.now();

    if (
      this._ollamaHealthy !== null &&
      now - this._lastHealthCheck < this._healthCheckInterval
    ) {
      return this._ollamaHealthy;
    }

    try {
      const baseUrl = process.env.AI_BASE_URL || 'http://localhost:11434/v1';
      const ollamaRoot = baseUrl.replace('/v1', '');
      const response = await axios.get(ollamaRoot, { timeout: 3000 });
      this._ollamaHealthy = response.status === 200;
    } catch {
      this._ollamaHealthy = false;
    }

    this._lastHealthCheck = now;
    return this._ollamaHealthy;
  }

  getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('iss') && (lowerMsg.includes('where') || lowerMsg.includes('position'))) {
      return this.fallbackResponses.iss;
    }
    if (
      lowerMsg.includes('astronaut') ||
      lowerMsg.includes('crew') ||
      lowerMsg.includes('people in space')
    ) {
      return this.fallbackResponses.astronauts;
    }
    if (
      lowerMsg.includes('see') ||
      lowerMsg.includes('visible') ||
      lowerMsg.includes('watch') ||
      lowerMsg.includes('pass')
    ) {
      return this.fallbackResponses.visibility;
    }
    if (lowerMsg.includes('speed') || lowerMsg.includes('fast') || lowerMsg.includes('km/h')) {
      return this.fallbackResponses.speed;
    }
    if (
      lowerMsg.includes('float') ||
      lowerMsg.includes('gravity') ||
      lowerMsg.includes('weightless')
    ) {
      return this.fallbackResponses.gravity;
    }

    return this.fallbackResponses.default;
  }

  async chat(messages, context = null) {
    const isHealthy = await this.checkHealth();

    if (!isHealthy) {
      const lastUserMsg = messages.filter((message) => message.role === 'user').pop();
      return {
        content: this.getFallbackResponse(lastUserMsg?.content || ''),
        usage: null,
        offline: true,
      };
    }

    try {
      const systemMessages = [{ role: 'system', content: this.systemPrompt }];

      if (context) {
        let contextStr = '\n\n--- REAL-TIME DATA ---\n';

        if (context.issPosition) {
          contextStr += `ISS Current Position: Lat ${context.issPosition.latitude} deg, Lng ${context.issPosition.longitude} deg\n`;
        }

        if (context.astronauts) {
          contextStr += `People in space: ${context.astronauts.number} (${context.astronauts.people?.map((person) => `${person.name} on ${person.craft}`).join(', ')})\n`;
        }

        if (context.userLocation) {
          contextStr += `User Location: Lat ${context.userLocation.latitude} deg, Lng ${context.userLocation.longitude} deg`;

          if (context.userLocation.city) {
            contextStr += `, City ${context.userLocation.city}`;
          }

          if (context.userLocation.country) {
            contextStr += `, Country ${context.userLocation.country}`;
          }

          contextStr += '\n';
        }

        if (context.nextPass) {
          contextStr += `Next ISS pass: ${context.nextPass.startTime}, Direction ${context.nextPass.startDirection} to ${context.nextPass.endDirection}, Duration ${context.nextPass.durationFormatted}, Minutes until ${context.nextPass.minutesUntil}, Visible now ${context.nextPass.visibleNow}\n`;
        }

        if (context.appScreen) {
          contextStr += `Current App Screen: ${context.appScreen}\n`;
        }

        if (context.userTimezone) {
          contextStr += `User Timezone: ${context.userTimezone}\n`;
        }

        contextStr += '--- END DATA ---';

        systemMessages.push({
          role: 'system',
          content: contextStr,
        });
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [...systemMessages, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        content: response.choices[0].message.content,
        usage: response.usage,
        offline: false,
      };
    } catch (error) {
      console.error('AI chat error:', error.message);

      if (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT'
      ) {
        this._ollamaHealthy = false;
        const lastUserMsg = messages.filter((message) => message.role === 'user').pop();
        return {
          content: this.getFallbackResponse(lastUserMsg?.content || ''),
          usage: null,
          offline: true,
        };
      }

      throw new Error('AI service unavailable');
    }
  }

  async generateTitle(firstMessage) {
    try {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        return 'Space-Eye Chat';
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'Generate a short title, maximum 5 words, for this space-related conversation. Return only the title.',
          },
          { role: 'user', content: firstMessage },
        ],
        max_tokens: 20,
        temperature: 0.5,
      });

      return response.choices[0].message.content.trim();
    } catch {
      return 'Space-Eye Chat';
    }
  }
}

module.exports = new AIService();
