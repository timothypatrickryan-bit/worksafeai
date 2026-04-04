# Mission Control iOS Companion App

Native iOS companion app for Mission Control Dashboard. Provides real-time project tracking, task notifications, and briefing access on iOS devices.

## Status

- **Version:** 0.1.0
- **Platform:** iOS 15+
- **Framework:** React Native + Expo
- **Start Date:** April 4, 2026

## Architecture

### Tech Stack
- **Runtime:** React Native via Expo
- **Navigation:** React Navigation (bottom tab)
- **State:** Zustand (persistent store)
- **API:** Mission Control backend via REST
- **Auth:** JWT (from web app)

### Directory Structure
```
src/
├── screens/           # Tab screens (Dashboard, Projects, Tasks, Settings)
├── components/        # Reusable UI components
├── stores/           # Zustand state management
├── api/              # API client & services
├── navigation/       # React Navigation configuration
└── types/            # TypeScript definitions

docs/
├── ARCHITECTURE.md   # App design decisions
├── SETUP.md         # Local development setup
└── DEPLOYMENT.md    # TestFlight & App Store process

scripts/
├── build.sh         # iOS build automation
├── deploy.sh        # TestFlight upload
```

## Quick Start

### Development
```bash
cd apps/ios-companion
npm install
npm run dev           # Start Expo dev server
# Scan QR code with Expo Go app
```

### Testing
```bash
npm run test          # Run Jest test suite
npm run lint          # Check code quality
```

### Building
```bash
npm run build         # Create iOS build
# Follow Expo prompts for development/production build
```

## Key Features (Planned)

- 📊 Real-time project dashboard
- ✅ Task list with notifications
- 📰 Live briefing feed
- 🔔 Push notifications for updates
- 📱 Offline support (basic)
- 🔐 Secure JWT authentication

## Development Phases

### Phase 1: MVP (Week 1)
- ✅ Project setup & Expo config
- 🔄 Basic screens (Dashboard, Projects, Tasks)
- 🔄 API client & authentication

### Phase 2: Polish (Week 2)
- 📋 Notifications system
- 📋 Offline caching
- 📋 Unit test coverage

### Phase 3: Release (Week 3)
- 📋 TestFlight beta
- 📋 Performance optimization
- 📋 App Store submission

## API Integration

Connects to Mission Control backend:
- Base URL: `https://mission-control.elevationaiwork.com`
- Endpoints: `/api/projects`, `/api/tasks`, `/api/briefings`
- Auth: JWT token (stored in Zustand + AsyncStorage)

## Status Updates

- **Created:** April 4, 2026
- **Last Update:** April 4, 2026
- **Next Milestone:** Phase 1 screens complete (Week 1)

## References

- [Mission Control Dashboard](../mission-control-express-organized)
- [API Documentation](./docs/API.md)
- [React Native Guide](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
