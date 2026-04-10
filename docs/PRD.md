# Space-Eye v1.1 Production PRD

## 1. Product Overview

Space-Eye is a mobile application that allows users to:

- Track the International Space Station and selected satellites in real time
- Receive location-based visibility alerts
- Explore space through 3D and 4D visualization
- Experience a 360 degree ISS interior tour
- Understand rocket launches and docking through guided simulation
- Learn about astronaut life and space health
- Interact with an AI assistant for contextual space queries

## 2. Product Positioning

- Interactive
- Educational
- Real-time
- Personal space companion based on user location

Space-Eye is not a scientific-grade simulator.

## 3. Core Features

### 3.1 AI Assistant

Use:
- OpenAI

Capabilities:
- Answer space-related questions
- Use real-time ISS and satellite data
- Provide contextual responses based on user state

Backend context injection before an AI request should include:
- User location, such as latitude and longitude or city
- Current ISS position
- Next ISS pass time
- Current app screen

Example:
- User asks, "Can I see ISS now?"
- System enriches the request with location and pass data before sending it to the model

### 3.2 ISS Live Tracking

Use:
- N2YO API
- Open Notify API as fallback

Features:
- Real-time latitude and longitude
- Speed around 28,000 km/h
- Altitude
- Orbit path visualization

Backend behavior:
- Cache position every 5 to 10 seconds
- Serve cached data to clients

### 3.3 4D Space Visualization

Definition:
- 3D space plus time-based motion

Features:
- Earth rotation with day and night cycle
- ISS orbit animation
- Simplified Moon orbit
- Sun lighting

Constraints:
- Pre-calculated animation
- No real-time physics engine

### 3.4 Satellite Tracking

Use:
- N2YO API

Scope:
- ISS as the primary object
- Limited Starlink satellites, roughly 2 to 3
- Optional weather and GPS satellites

Rules:
- Do not track all satellites
- Filter by visibility or relevance

### 3.5 Nearby Alert System

Components:
- N2YO Visual Passes API
- Firebase Cloud Messaging

Features:
- Upcoming ISS pass notifications
- 10-minute pre-alert
- Visible-now alert
- Direction such as NW to SE
- Duration

Backend flow:
- Fetch passes periodically
- Store upcoming passes
- Convert UTC to local time
- Trigger FCM

Scheduler:
- Cron job every 5 to 10 minutes

### 3.6 ISS 360 Tour

Features:
- 360 degree interior exploration
- Hotspots for sleeping area, eating area, Cupola, and lab modules

Tech:
- Pannellum inside a WebView

### 3.7 Rocket Launch and Docking Simulation

Flow:
- Launch
- Booster separation
- Orbit insertion
- Approach ISS
- Docking

Features:
- Speed indicator
- Altitude progression

Implementation:
- Animation-based using Lottie or Three.js

### 3.8 Astronaut Life and Health Module

Topics:
- Zero gravity effects
- Muscle atrophy
- Bone density loss
- Fluid shift
- Daily routines

Features:
- Visual explanations
- AI expansion on demand

### 3.9 Telescope Simulation Mode

Features:
- Zoom into ISS
- Zoom into Earth
- Zoom into Moon

Notes:
- Fully simulated
- No real telescope integration

### 3.10 User System and Preferences

Features:
- Optional login with Google or email
- Store preferred location
- Store alert settings
- Store selected satellites

### 3.11 Settings Module

Controls:
- Enable or disable alerts
- Select satellites
- Choose units such as km/h or mph
- Theme control as an optional feature

### 3.12 Offline and Fallback Handling

Features:
- Cache the last ISS position
- Show a last-updated timestamp
- Provide graceful fallback UI

### 3.13 Live Space Media

Optional feature:
- NASA ISS live Earth feed
- Embedded video streams

## 4. Technical Architecture

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
- OpenAI

Notifications:
- Firebase Cloud Messaging

## 5. System Architecture

```text
Mobile App (React Native)
        ->
Backend (Node.js + Express)
        ->
Caching Layer (MongoDB)
        ->
External APIs:
   - N2YO
   - NASA
   - OpenAI
        ->
Scheduler (Cron Jobs)
        ->
Firebase Cloud Messaging
```

## 6. Backend Responsibilities

- API aggregation
- Data caching
- Rate limiting
- AI context injection
- Notification scheduling
- Timezone conversion

## 7. User Flows

- Tracking: open app, view ISS live, explore orbit
- Alert: receive notification, open app, review direction and time
- Exploration: open ISS tour and interact with modules
- Simulation: run a rocket mission and observe docking
- AI: ask a question and receive a contextual response

## 8. Constraints

- API rate limits, especially from N2YO
- Device performance for 3D rendering
- GPS accuracy
- Timezone handling

## 9. Non-Goals

- Full real-time physics simulation
- Real telescope hardware integration
- Tracking thousands of satellites

## 10. Security and Reliability

- Store API keys in backend environment files
- Validate all requests
- Add rate limiting
- Cache API responses

## 11. Analytics

Track:
- Feature usage
- Alert engagement
- AI interactions

Use:
- Firebase Analytics

## 12. Phased Development

### Phase 1

- ISS tracking
- Alerts
- Basic AI
- Basic UI

### Phase 2

- 4D view
- ISS tour
- Simulation
- Health module

### Phase 3

- Multi-satellite support
- Advanced AI
- UI polish

## 13. Key Success Metrics

- Alert accuracy
- App performance
- AI response relevance
- User engagement

## 14. Final Product Statement

Space-Eye is a real-time, interactive, AI-powered space experience platform that brings space closer to the user through tracking, visualization, simulation, and intelligent guidance.
