# Space-Eye v1.0 PRD

## 1. Product Summary

Space-Eye is a beautiful, educational mobile app that brings space closer to everyone.

It combines real-time satellite tracking, location-based visibility alerts, immersive visualizations, guided simulations, and a smart AI assistant in one clean mobile experience.

Core promise:
Real-time + Interactive + Educational

This product is not meant to be a complex NASA-grade simulator.

Target users:
- Space enthusiasts
- Students aged 12+
- Parents and teachers
- Curious users in India and globally

Key differentiators:
- Accurate ISS and limited satellite tracking with smart alerts
- 360 degree ISS interior tour
- Rocket launch and docking simulation
- Context-aware AI that explains what the user is seeing
- Telescope-style zoom simulation

## 2. Core Features

### 2.1 AI Assistant

- Powered by OpenAI using GPT-4o or GPT-4o-mini
- Answers general space questions
- Combines static knowledge with real-time tracking data
- Uses screen and feature context when available

Example queries:
- Can I see the ISS now from Hyderabad?
- Why do astronauts float?
- Explain the docking process
- Show me Starlink near me

### 2.2 ISS Live Tracking

- Primary source: N2YO API
- Fallback source: Open Notify
- Shows latitude, longitude, speed, altitude, and orbit path
- Backend should cache updates and refresh roughly every 5 to 10 seconds

### 2.3 4D Space View

- Interactive 3D space scene
- Earth with day and night rotation
- ISS orbit animation
- Simplified Moon orbit
- Dynamic Sun lighting
- Motion is pre-calculated and animation-driven, not physics-simulated

### 2.4 Selective Satellite Tracking

- Primary: ISS
- Secondary: 2 to 3 popular Starlink satellites
- Optional categories: weather satellites and GPS satellites
- Never track all satellites at once

### 2.5 Nearby Alert System

- Uses N2YO Visual Passes API
- Uses Firebase Cloud Messaging
- Sends alerts about 10 minutes before an ISS pass
- Includes pass direction, visibility duration, and visible-now status
- Flow: GPS -> pass lookup -> local time conversion -> notification

### 2.6 ISS 360 Tour

- Full 360 degree interior exploration
- Hotspots for sleeping quarters, Cupola, eating area, and labs
- Uses Pannellum or equivalent inside a React Native WebView
- Uses NASA public-domain assets

### 2.7 Rocket Launch and Docking Simulation

- Guided sequence from launch to docking
- Covers booster separation, orbit insertion, approach, and docking
- Uses animation-based visuals with educational progress indicators

### 2.8 Astronaut Life and Health Module

- Explains zero gravity, muscle loss, bone density loss, fluid shift, and routines
- Uses simple visuals and animations
- AI can elaborate when the user asks follow-up questions

### 2.9 Telescope Simulation Mode

- Simulated zoom into the ISS, Earth, and Moon
- No real telescope hardware feed
- Optimized for performance and believable presentation

### 2.10 Live Space Media

- Optional for phase 1
- Can embed NASA HDEV or similar live Earth view when available
- Should fall back to high-quality static media

## 3. Technical Stack

- Frontend: React Native with Expo
- Backend: Node.js with Express
- Database: MongoDB Atlas free tier
- 3D and visualization: Three.js based rendering
- 360 viewer: Pannellum via WebView
- Notifications: Firebase Cloud Messaging
- APIs: N2YO, Open Notify, NASA Open APIs, OpenAI

Performance targets:
- 60 FPS on mid-range Android devices
- App size under 120 MB
- Useful offline behavior through caching

## 4. System Architecture

```text
Mobile App (React Native)
        ->
Backend API (Node.js + Express)
        ->
External APIs (N2YO, NASA, OpenAI)
        ->
MongoDB (caching positions, user preferences)
        ->
Firebase Cloud Messaging (alerts)
```

## 5. Core User Flows

1. Home or Tracking -> live ISS position and 4D view
2. Alerts -> notification -> pass details
3. Explore -> ISS tour or Telescope mode
4. Simulate -> launch and docking flow
5. Learn -> astronaut health content and AI chat

## 6. Constraints and Non-Goals

Constraints:
- N2YO rate limits require backend caching
- 3D rendering must respect device performance
- GPS accuracy needs user-facing disclaimers
- Timezone handling must be correct across locales

Out of scope for v1.0:
- Full real-time solar system physics
- Real telescope control or live telescope hardware feeds
- Tracking thousands of satellites
- AR mode

## 7. Phased Plan

### Phase 1

- ISS live tracking and alerts
- Basic AI assistant
- Simple 4D space view
- Clean UI and onboarding

### Phase 2

- ISS 360 tour
- Rocket and docking simulation
- Astronaut health module
- Telescope simulation

### Phase 3

- Multi-satellite support
- Advanced AI and personalization
- Product polish and monetization

## 8. Positioning

Space-Eye is an interactive, real-time, educational space companion that should feel fun and premium.

It is not a scientific-grade simulator or satellite control system.

## 9. Success Factors

- Smooth UI and UX
- Accurate, timely alerts
- Simple and engaging explanations
- Strong context-aware AI responses
- Reliable experience on common phones in India
