# Space-Eye

Space-Eye is a real-time, interactive, AI-powered space experience platform that brings space closer to users through tracking, visualization, simulation, and intelligent guidance.

## Product Focus

Space-Eye is designed to feel interactive, educational, and real-time without becoming a scientific-grade simulator. The primary audience includes space enthusiasts, students, parents, teachers, and curious users in India and globally.

## Production Scope

- AI assistant powered by OpenAI with screen-aware and location-aware context
- Live ISS tracking with N2YO as the primary source and Open Notify as fallback
- 4D space view with Earth rotation, ISS orbit, Moon motion, and sunlight simulation
- Selective satellite tracking focused on ISS and a curated set of satellites
- Location-based pass alerts with backend caching and notification support
- ISS 360 tour, launch simulation, astronaut learning content, and telescope-style exploration
- Optional login, stored preferences, offline fallbacks, and analytics instrumentation

## Backend Priorities

- API aggregation and rate limiting
- Caching for ISS positions and pass predictions
- AI context injection with ISS position, next pass, location, and current screen
- Notification scheduling and timezone-aware formatting
- Secure server-side API key handling

## Stack

- Frontend: React Native with Expo
- Backend: Node.js with Express
- Database: MongoDB Atlas with Mongoose
- 3D: Three.js based mobile visualizations
- Notifications: Firebase Cloud Messaging
- APIs: N2YO, Open Notify, NASA Open APIs, OpenAI

## Architecture

```text
Mobile App (React Native)
        ->
Backend API (Node.js + Express)
        ->
External APIs (N2YO, NASA, OpenAI)
        ->
MongoDB (cache, user preferences, chat history)
        ->
Scheduler (cron jobs)
        ->
Firebase Cloud Messaging (alerts)
```

## Development Notes

- N2YO usage should stay heavily cached because of rate limits
- GPS-based visibility should include accuracy disclaimers
- Timezone handling needs to stay explicit and testable
- The app should remain performant on mid-range Android devices common in India
- The app should keep useful last-known data and last-updated timestamps when live APIs fail

## Quick Start

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

## Environment

Use [backend/.env.example](/C:/Users/22vam/Downloads/isstracker/backend/.env.example) as the template for backend configuration.

## Repo Guide

- [docs/PRD.md](/C:/Users/22vam/Downloads/isstracker/docs/PRD.md): Space-Eye v1.1 production PRD
- [backend](/C:/Users/22vam/Downloads/isstracker/backend): Express API, MongoDB models, integrations
- [mobile](/C:/Users/22vam/Downloads/isstracker/mobile): Expo app, navigation, screens, hooks, styles
