const OpenAI = require('openai');

class AIService {
  constructor() {
    this._client = null;

    this.systemPrompt = `You are Space Companion AI, an expert space education assistant built into a mobile app that tracks the International Space Station and satellites in real-time.

Your capabilities:
- Answer any space-related questions with clear, engaging explanations
- Explain ISS operations, orbital mechanics, astronaut life, and space science
- Help users understand satellite tracking, visibility passes, and sky observation
- Explain rocket launches, docking procedures, and space missions
- Discuss astronomy, planets, stars, and celestial phenomena

Guidelines:
- Keep responses concise but informative (mobile-friendly)
- Use emojis sparingly for engagement 🚀🌍🛰️
- When discussing ISS visibility, mention direction, timing, and brightness
- If the user asks about current ISS position, reference the real-time data provided in context
- For complex topics, break them into simple, digestible steps
- Be enthusiastic about space exploration
- If unsure about something, say so rather than making things up
- Convert technical jargon into plain language

You have access to real-time data that may be injected into the conversation context.`;
  }

  get client() {
    if (!this._client) {
      this._client = new OpenAI({
        apiKey: process.env.AI_API_KEY || 'ollama',
        baseURL: process.env.AI_BASE_URL || 'http://localhost:11434/v1',
      });
    }
    return this._client;
  }

  get model() {
    return process.env.AI_MODEL || 'llama3';
  }

  /**
   * Send a message to the AI and get a response
   * @param {Array} messages - Conversation history
   * @param {Object} context - Real-time data context (ISS position, etc.)
   */
  async chat(messages, context = null) {
    try {
      const systemMessages = [
        { role: 'system', content: this.systemPrompt },
      ];

      // Inject real-time context if available
      if (context) {
        let contextStr = '\n\n--- REAL-TIME DATA ---\n';
        if (context.issPosition) {
          contextStr += `ISS Current Position: Lat ${context.issPosition.latitude}°, Lng ${context.issPosition.longitude}°\n`;
        }
        if (context.astronauts) {
          contextStr += `People in space: ${context.astronauts.number} (${context.astronauts.people?.map((a) => `${a.name} on ${a.craft}`).join(', ')})\n`;
        }
        if (context.userLocation) {
          contextStr += `User Location: Lat ${context.userLocation.latitude}°, Lng ${context.userLocation.longitude}°\n`;
        }
        if (context.nextPass) {
          contextStr += `Next ISS pass for user: ${context.nextPass}\n`;
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

  /**
   * Generate a title for a conversation
   */
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
      return 'Space Chat';
    }
  }
}

module.exports = new AIService();
