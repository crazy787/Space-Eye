# Space-Eye v3.0

Tagline: `See Space From Your World`

Space-Eye is a real-time, AI-powered, offline-capable space experience platform that helps users observe, explore, and understand space from their own perspective.

## Product Summary

Space-Eye lets users:

- Track the ISS and selected satellites in real time
- Receive visibility alerts based on their location
- Explore space through interactive 4D visualization
- Experience the ISS through a 360 degree virtual tour
- Simulate rocket launch and docking
- Learn about astronaut life and health in space
- Interact with an offline-capable AI assistant powered by Ollama

## Core Modules

- AI assistant powered by Ollama using `llama3` by default, with `mistral` as a lighter alternative
- ISS live tracking using N2YO with Open Notify fallback
- Selective satellite tracking with a hard cap to avoid clutter and API abuse
- Nearby visibility alerts using N2YO pass data plus scheduled notifications
- 4D space visualization with Earth rotation, ISS orbit, Moon motion, and sunlight
- ISS 360 tour using Pannellum inside a WebView
- Rocket launch and docking simulation
- Astronaut life and health learning module
- Telescope-style simulation mode
- User preferences, settings, and offline fallback behavior

## Technical Stack

- Frontend: React Native with Expo
- Backend: Node.js with Express
- Database: MongoDB
- APIs: N2YO, NASA Open APIs, Open Notify
- AI: Ollama
- Notifications: Firebase Cloud Messaging

## Architecture

```text
Mobile App (React Native)
        ->
Backend (Node.js)
        ->
Context Builder (ISS + Location)
        ->
Ollama (Local AI)
        ->
Database (MongoDB Cache)
        ->
Scheduler (Cron Jobs)
        ->
Firebase Notifications
```

## Backend Responsibilities

- API aggregation
- Data caching
- Rate limiting
- AI context injection
- Notification scheduling
- Timezone conversion

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

### Ollama

```bash
ollama pull llama3
ollama serve
```

## Environment

Use [backend/.env.example](/C:/Users/22vam/Downloads/isstracker/backend/.env.example) as the backend template.

## Repo Guide

- [docs/PRD.md](/C:/Users/22vam/Downloads/isstracker/docs/PRD.md): final Space-Eye v3.0 master PRD
- [docs/OFFLINE_RESILIENCE_PRD.md](/C:/Users/22vam/Downloads/isstracker/docs/OFFLINE_RESILIENCE_PRD.md): offline data and resilience system PRD
- [backend](/C:/Users/22vam/Downloads/isstracker/backend): Express API, MongoDB models, integrations, scheduler
- [mobile](/C:/Users/22vam/Downloads/isstracker/mobile): Expo app, screens, navigation, context providers, services
