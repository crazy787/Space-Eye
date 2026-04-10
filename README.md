# 🛰️ Space Companion (Space-Eye)

A comprehensive mobile application for real-time ISS tracking, satellite visibility alerts, AI-powered space education, and immersive space exploration.

## ✨ Features

### Phase 1 — Core MVP
- 🛰️ **Real-time ISS Tracking** — Live map with position, speed, altitude
- 🔔 **Pass Alerts** — Location-based ISS visibility predictions
- 🤖 **AI Assistant** — Space-aware chatbot powered by Ollama
- 🌍 **Space Explorer** — NASA APOD, live streams, space facts
- 👨‍🚀 **Astronaut Tracker** — People currently in space

### Phase 2 — Immersive Experiences
- 🌐 **4D Space View** — Three.js Earth, ISS orbit, Moon with pan controls
- 🏠 **ISS 360° Tour** — Pannellum panorama + module map + ISS facts
- 🚀 **Rocket Simulator** — Falcon 9, Soyuz, Crew Dragon launch animations

### Phase 3 — Advanced Features
- 📡 **Multi-Satellite Tracker** — Track ISS, Hubble, Tiangong, Starlink simultaneously
- 🔭 **Telescope Simulation** — Pannable star map with real coordinates & constellations
- 📺 **Space Media Hub** — NASA TV, APOD gallery, Mars Rover photos, NASA image search

## 🏗️ Architecture

```
Mobile App (React Native / Expo)
        ↓
Backend API (Node.js / Express)
        ↓
External APIs: N2YO, NASA, Ollama
        ↓
Database: MongoDB Atlas
```

## 🚀 Quick Start

### Backend
```bash
cd backend
cp .env.example .env  # Add your API keys
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## 🔑 Required API Keys
- **N2YO** — [n2yo.com](https://www.n2yo.com/api/)
- **NASA** — [api.nasa.gov](https://api.nasa.gov/)
- **Ollama** — Local or cloud hosted LLM

## 📁 Project Structure

```
isstracker/
├── backend/                  # Node.js + Express API
│   ├── config/               # Database & constants
│   ├── middleware/            # Auth, rate limiting, errors
│   ├── models/               # Mongoose schemas (User, Alert, ChatHistory)
│   ├── routes/               # API routes (auth, iss, satellites, alerts, ai, media)
│   ├── services/             # API integrations (N2YO, NASA, Ollama, notifications)
│   └── utils/                # Helpers (time, geo)
│
├── mobile/                   # React Native (Expo)
│   └── src/
│       ├── components/       # GlassCard, GradientButton, LoadingSpinner
│       ├── hooks/            # useISSPosition, useLocation
│       ├── navigation/       # Bottom tabs + stack navigator
│       ├── screens/
│       │   ├── HomeScreen              # Dashboard
│       │   ├── ISSTrackerScreen        # Live ISS map
│       │   ├── AIAssistantScreen       # AI chat
│       │   ├── AlertsScreen            # Pass predictions
│       │   ├── ExploreScreen           # Feature hub
│       │   ├── SpaceViewScreen         # 4D Three.js visualization
│       │   ├── ISSTourScreen           # 360° ISS interior
│       │   ├── RocketSimScreen         # Launch simulator
│       │   ├── SatelliteTrackerScreen  # Multi-satellite tracking
│       │   ├── TelescopeScreen         # Star map & planets
│       │   └── SpaceMediaScreen        # NASA media & live feeds
│       ├── services/         # Axios API client
│       └── styles/           # Design system
```

## 📱 Tech Stack
- **Frontend:** React Native + Expo
- **3D Engine:** Three.js + expo-gl
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas + Mongoose
- **AI:** Ollama (OpenAI-compatible)
- **APIs:** N2YO, Open Notify, NASA
- **Maps:** react-native-maps
- **360° View:** Pannellum (react-native-webview)

## 📄 License
MIT