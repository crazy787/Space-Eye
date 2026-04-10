# 🛰️ Space Companion (Space-Eye)

A comprehensive mobile application for real-time ISS tracking, satellite visibility alerts, AI-powered space education, and immersive space exploration.

## ✨ Features

### Phase 1 (MVP) - Current
- 🛰️ **Real-time ISS Tracking** — Live map with position, speed, altitude
- 🔔 **Pass Alerts** — Location-based ISS visibility predictions
- 🤖 **AI Assistant** — Space-aware chatbot powered by OpenAI
- 🌍 **Space Explorer** — NASA APOD, live streams, space facts
- 👨‍🚀 **Astronaut Tracker** — People currently in space

### Phase 2 (Coming Soon)
- 🌐 4D Space Visualization
- 🏠 ISS 360° Interior Tour
- 🚀 Rocket Launch & Docking Simulation

### Phase 3 (Future)
- 📡 Multi-satellite tracking
- 🔭 Telescope simulation
- 📺 Live space media feeds

## 🏗️ Architecture

```
Mobile App (React Native / Expo)
        ↓
Backend API (Node.js / Express)
        ↓
External APIs: N2YO, NASA, OpenAI
        ↓
Database: MongoDB
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
- **OpenAI** — [platform.openai.com](https://platform.openai.com/)

## 📁 Project Structure

```
isstracker/
├── backend/          # Node.js + Express API
│   ├── config/       # Database & constants
│   ├── middleware/    # Auth, rate limiting, errors
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route handlers
│   ├── services/     # API integration services
│   └── utils/        # Helper functions
│
├── mobile/           # React Native (Expo)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       ├── navigation/   # App navigation
│       ├── screens/      # App screens
│       ├── services/     # API client
│       └── styles/       # Design system
```

## 📱 Tech Stack
- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **AI:** OpenAI GPT-4o-mini
- **APIs:** N2YO, Open Notify, NASA
- **Maps:** react-native-maps

## 📄 License
MIT