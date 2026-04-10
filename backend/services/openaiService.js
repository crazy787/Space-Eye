const OpenAI = require('openai');

class AIService {
  constructor() {
    this._client = null;

    this.systemPrompt = `You are Space-Eye AI, an expert space education assistant built into a mobile app that tracks the International Space Station and a curated set of satellites in real-time.

Your capabilities:
- Answer any space-related questions with clear, engaging explanations
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
- Be educational, approachable, and accurate over being overly dramatic
- For complex topics, break them into simple, digestible steps
- Be enthusiastic about space exploration
- If unsure about something, say so rather than making things up
- Convert technical jargon into plain language

You may receive real-time tracking data in the conversation context.`;
  }

  get client() {
    if (!this._client) {
      this._client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
        ...(process.env.AI_BASE_URL ? { baseURL: process.env.AI_BASE_URL } : {}),
      });
    }

    return this._client;
  }

  get model() {
    return process.env.AI_MODEL || 'gpt-4o-mini';
  }

  async chat(messages, context = null) {
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
      };
    } catch (error) {
      console.error('AI chat error:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  async generateTitle(firstMessage) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Generate a short title (max 5 words) for this space-related conversation. Return only the title.',
          },
          { role: 'user', content: firstMessage },
        ],
        max_tokens: 20,
        temperature: 0.5,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      return 'Space-Eye Chat';
    }
  }
}

module.exports = new AIService();
