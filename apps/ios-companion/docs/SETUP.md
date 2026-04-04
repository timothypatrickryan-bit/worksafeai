# iOS App Setup Guide

Complete instructions for setting up the Mission Control iOS companion app for local development.

## Prerequisites

- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)
- Xcode 15+ (for iOS simulator)
- Expo CLI (install: `npm install -g expo-cli`)
- macOS 13+ (Monterey or newer)

## Installation

### 1. Clone & Install Dependencies

```bash
cd apps/ios-companion
npm install
```

This installs:
- React Native & Expo
- React Navigation
- Zustand (state management)
- TypeScript
- Jest (testing)

### 2. Configure Environment

Create `.env.local`:

```env
API_URL=http://localhost:3001
NODE_ENV=development
```

For production:

```env
API_URL=https://mission-control.elevationaiwork.com
NODE_ENV=production
```

## Development

### Start Expo Dev Server

```bash
npm run dev
```

Output:
```
Expo Dev Server started on 192.168.x.x:19000
Scan QR code with Expo Go app or simulator
```

### iOS Simulator

Open Xcode and launch iOS simulator:

```bash
open -a Simulator
```

In Expo terminal, press `i` to open app in simulator.

### Android Emulator (Optional)

If using Android:

```bash
npm run dev
# Press 'a' in terminal to open Android emulator
```

## Testing

### Run Unit Tests

```bash
npm run test
```

Watch mode:

```bash
npm run test -- --watch
```

### Lint Code

```bash
npm run lint
```

## Build for iOS

### Development Build (for testing)

```bash
npm run build
# Select 'Development build'
# Follow Expo prompts
```

Build takes ~5-10 minutes. Result: `.ipa` file that can be deployed to TestFlight.

### Production Build (for App Store)

```bash
expo build:ios --release
```

Requires:
- Apple Developer account ($99/year)
- Signing certificate
- Provisioning profile

## Debugging

### Enable Debug Menu

In simulator:
- Press `Ctrl+Cmd+D` (macOS)
- Press `Ctrl+D` (Android)

Options:
- Reload
- Open DevTools
- Open Network Inspector
- Show/Hide Inspector

### Check Logs

Expo terminal shows real-time logs from device/simulator.

For detailed logs:

```bash
expo logs
```

## Troubleshooting

### "Module not found: zustand"

```bash
npm install --save zustand
```

### "Cannot find module '@react-navigation/native'"

```bash
npm install --save @react-navigation/native @react-navigation/bottom-tabs
```

### Simulator won't connect

1. Restart Expo: `Ctrl+C`, then `npm run dev`
2. Restart simulator: Xcode > Simulator > Reset Contents and Settings
3. Clear Expo cache: `rm -rf node_modules && npm install`

### Build fails with "No Apple Developer account"

If building for production, set up:
1. Apple Developer account at https://developer.apple.com
2. Signing certificate (Xcode handles this)
3. Team ID in `app.json`: `"owner": "your-expo-team"`

## Project Structure

```
src/
├── App.tsx                 # Root component & navigation
├── screens/               # Tab screen components
│   ├── DashboardScreen.tsx
│   ├── ProjectsScreen.tsx
│   ├── TasksScreen.tsx
│   └── SettingsScreen.tsx
├── components/            # Reusable UI components
│   ├── ProjectCard.tsx
│   ├── TaskItem.tsx
│   └── Header.tsx
├── stores/               # Zustand state stores
│   ├── authStore.ts
│   ├── projectStore.ts
│   └── taskStore.ts
├── api/                  # API client & services
│   ├── client.ts        # HTTP client setup
│   ├── projects.ts      # Project endpoints
│   └── tasks.ts         # Task endpoints
├── hooks/               # Custom React hooks
│   ├── useInitializeApp.ts
│   └── useProjectList.ts
└── types/               # TypeScript definitions
    └── index.ts
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Start dev server (`npm run dev`)
4. ✅ Open in simulator
5. ✅ Verify login flow works
6. 📋 Build Phase 1 screens (DashboardScreen, ProjectsScreen, TasksScreen)
7. 📋 Implement API client (connect to Mission Control backend)
8. 📋 Add notifications (push notifications for task updates)

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Guide](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Getting Help

Check `.ios/` directory for Xcode project files and build configuration.

For issues:
1. Check [Expo Forums](https://forums.expo.dev/)
2. Search [React Native docs](https://reactnative.dev/docs)
3. Run `expo doctor` to diagnose environment issues

---

**Last Updated:** April 4, 2026
