# Space-Eye

Space-Eye is a mobile app for real-time ISS tracking, location-based pass alerts, space education, immersive simulations, and an AI assistant that explains what users are seeing in context.

## Product Focus

Space-Eye is designed to feel real-time, interactive, and educational without becoming a heavy scientific simulator. The primary audience includes space enthusiasts, students, parents, teachers, and curious users in India and globally.

## Phase 1 Scope

- AI assistant powered by OpenAI with real-time ISS and visibility context
- Live ISS tracking with N2YO as the primary source and Open Notify as fallback
- 4D space view with Earth, ISS orbit, Moon motion, and sunlight simulation
- Selective satellite tracking focused on ISS and a small curated set of satellites
- Location-based pass alerts with backend caching and notification support
- Clean mobile onboarding and smooth core navigation

## Phase 2 Scope

- ISS 360 tour with hotspot-based exploration
- Rocket launch and docking simulation
- Astronaut life and health learning module
- Telescope-style simulation mode

## Optional Phase 1 Add-On

- Live space media, including NASA or ISS video when available, with image fallbacks

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
Firebase Cloud Messaging (alerts)
```

## Development Notes

- N2YO usage should stay heavily cached because of rate limits
- GPS-based visibility should include accuracy disclaimers
- Timezone handling needs to stay explicit and testable
- The app should remain performant on mid-range Android devices common in India

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

- [docs/PRD.md](/C:/Users/22vam/Downloads/isstracker/docs/PRD.md): finalized product requirements
- [backend](/C:/Users/22vam/Downloads/isstracker/backend): Express API, MongoDB models, integrations
- [mobile](/C:/Users/22vam/Downloads/isstracker/mobile): Expo app, navigation, screens, hooks, styles
