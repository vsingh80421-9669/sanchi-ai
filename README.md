# SANCHI - AI Voice Assistant

A Jarvis-style AI voice assistant built with Next.js, featuring voice interaction, intelligent conversation, and real-time information.

## Features

- **Voice Interaction**: Speak to SANCHI using Web Speech API
- **Natural Voice Responses**: ElevenLabs text-to-speech for human-like voice
- **Intelligent Conversation**: Powered by ChatGPT-4o mini with Jarvis-inspired personality
- **Real-time Search**: Google Search API integration for current information and weather
- **Weather Information**: Get weather forecasts through natural conversation
- **Notes**: Create and manage voice or text notes
- **Reminders**: Set time-based reminders

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4o mini
- **Voice Input**: Web Speech API (browser-based, free)
- **Voice Output**: ElevenLabs API
- **Search & Weather**: Google Custom Search API

## Setup

### 1. Environment Variables

Create a `.env.local` file with:

```env
OPENAI_API_KEY=your_openai_key
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_ENGINE_ID=your_cx_id
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### 2. Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Google Search**: https://developers.google.com/custom-search/v1/overview
- **ElevenLabs**: https://elevenlabs.io/


### 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Usage

1. Click "Start Voice" to begin speaking
2. SANCHI will transcribe your speech and respond
3. The assistant speaks responses using natural voice
4. Use tabs to access Weather, Notes, and Reminders
5. Chat interface supports both voice and text input

## Features Guide

### Voice Commands
- Ask questions naturally
- Request weather: "What's the weather in New York?"
- Create notes: "Take a note that..."
- Set reminders: "Remind me to..."
- Search web: "Search for latest tech news"

### Chat Interface
- Type or speak your messages
- Automatic web search for current info
- Conversation history maintained
- Voice responses for all replies

### Weather
- Ask about weather in any city through chat
- Get current temperature, conditions, and forecasts
- Real-time data from Google Search
- Examples: "What's the weather in Delhi?", "Tell me about Mumbai's current weather"

### Notes & Reminders
- Create notes via voice or text
- Set time-based reminders
- Mark reminders as complete
- Stored locally in browser

## Browser Support

- Chrome (recommended)
- Edge
- Safari (limited voice support)
- Firefox (limited voice support)

## Deployment

Deploy to Vercel:

```bash
vercel
```

Add environment variables in Vercel dashboard.

## License

MIT
