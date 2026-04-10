# Space-Eye v3.0 Master PRD

## 1. Product Overview

Product name: Space-Eye

Tagline:
`See Space From Your World`

Description:

Space-Eye is a mobile application that allows users to:

- Track the International Space Station and selected satellites in real time
- Receive personalized visibility alerts based on their location
- Explore space through interactive 4D visualization
- Experience the ISS through a 360 degree virtual tour
- Simulate rocket launch and docking
- Learn astronaut life and health in space
- Interact with an offline-capable AI assistant powered by Ollama

## 2. Product Vision

To create a personal space companion that makes space:

- Visible
- Understandable
- Interactive
- Accessible even without internet through offline AI capability

## 3. Target Users

- Students aged 12 and above
- Space enthusiasts
- General users curious about space

## 4. Core Value Proposition

Users can:

- See what is happening above them
- Know when they can observe satellites
- Understand space through visuals and AI
- Experience space in an interactive way

## 5. Core Modules

### 5.1 AI Assistant

Use:
- Ollama

Models:
- `llama3` recommended
- `mistral` as a faster alternative

Capabilities:
- Answer space-related questions
- Explain the ISS, satellites, and space physics
- Answer visibility queries
- Provide contextual responses

Context-aware backend logic must inject:
- User location
- Current ISS position
- Next pass timing
- Visibility status

Example API request:

```json
{
  "message": "Can I see ISS now?"
}
```

Example prompt structure:

```text
User location: Hyderabad
ISS visible: Yes
Next pass: 8:42 PM

Question: Can I see ISS now?
```

Response goals:
- Natural language
- Simple and educational

### 5.2 ISS Live Tracking Module

Use:
- N2YO API
- Open Notify API as fallback

Features:
- Real-time latitude and longitude
- Speed around 28,000 km/h
- Altitude
- Orbit path

Backend logic:
- Fetch data every 5 to 10 seconds
- Cache results
- Serve cached data

### 5.3 Satellite Tracking Module

Scope:
- ISS as primary
- Selected Starlink satellites, around 2 to 3
- Optional additional satellites

Constraints:
- Limit total tracked satellites to 10 or fewer
- Filter by visibility

### 5.4 Nearby Alert System

Components:
- N2YO Visual Pass API
- Firebase Cloud Messaging

Features:
- Notify before a satellite pass
- Display time, duration, and direction

Backend flow:
- Fetch pass predictions
- Store them in the database
- Convert UTC to local time
- Trigger notifications

Scheduler:
- Cron job every 5 to 10 minutes

### 5.5 4D Space Visualization Module

Features:
- Earth rotation with day and night cycle
- ISS orbit animation
- Simplified Moon orbit
- Sun lighting

Constraints:
- No real-time physics engine
- Pre-calculated animations

### 5.6 ISS 360 Tour Module

Features:
- 360 degree interior exploration
- Hotspots for sleeping, eating, Cupola, and lab areas

Tech:
- Pannellum plus WebView

### 5.7 Rocket Launch and Docking Simulation

Steps:
- Launch
- Booster separation
- Orbit insertion
- Approach ISS
- Docking

Features:
- Speed indicator
- Altitude progression

### 5.8 Astronaut Life and Health Module

Topics:
- Zero gravity effects
- Muscle loss
- Bone density loss
- Fluid shift
- Daily routines

Features:
- Visual explanations
- AI-based deeper answers

### 5.9 Telescope Simulation Module

Features:
- Zoom into ISS
- Zoom into Earth
- Zoom into Moon

Constraints:
- Fully simulated
- No real telescope integration

### 5.10 User and Preferences Module

Features:
- Optional login
- Store location
- Store alert preferences
- Store selected satellites

### 5.11 Settings Module

Features:
- Toggle notifications
- Select satellites
- Choose units such as km/h or mph
- Optional theme control

### 5.12 Offline Handling Module

Features:
- Cache the last ISS position
- Show last updated time
- Graceful fallback UI

## 6. Technical Architecture

Frontend:
- React Native with Expo

Backend:
- Node.js with Express

Database:
- MongoDB

APIs:
- N2YO API
- NASA Open APIs
- Open Notify API

AI:
- Ollama

Notifications:
- Firebase Cloud Messaging

## 7. System Architecture

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

## 8. Backend Responsibilities

- API aggregation
- Data caching
- Rate limiting
- AI context injection
- Notification scheduling
- Timezone conversion

## 9. Database Design

Users:

```json
{
  "userId": "...",
  "location": {},
  "preferences": {},
  "notificationsEnabled": true
}
```

Passes:

```json
{
  "satelliteId": 25544,
  "startTime": "2026-04-10T12:00:00.000Z",
  "endTime": "2026-04-10T12:05:00.000Z",
  "direction": "NW -> SE"
}
```

Cache:

```json
{
  "issPosition": {},
  "lastUpdated": "2026-04-10T12:00:00.000Z"
}
```

## 10. User Flows

- Tracking: open app, view ISS, check visibility
- Alerts: receive notification, open app, view details
- Exploration: enter ISS tour and interact
- Simulation: run rocket simulation
- AI: ask a question and receive a contextual answer

## 11. Constraints

- API limits from N2YO
- Device performance for 3D rendering
- Ollama RAM requirements

## 12. Non-Goals

- Full real-time physics engine
- Real telescope hardware integration
- Massive satellite tracking

## 13. Security

- Store API keys in backend environment files
- Use `.env`
- Validate requests

## 14. Analytics

Track:
- Feature usage
- Alert engagement
- AI usage

## 15. Development Phases

Phase 1:
- ISS tracking
- Alerts
- Ollama AI

Phase 2:
- 4D visualization
- ISS tour
- Simulation

Phase 3:
- Advanced features

## 16. Final Product Statement

Space-Eye is a real-time, AI-powered, offline-capable space experience platform that allows users to observe, explore, and understand space from their own perspective.
