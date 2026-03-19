# Local Tunnel Implementation Checklist

**Task:** task-ios-tunnel-001  
**Status:** Ready for Implementation  
**Created:** 2026-03-19

---

## Phase 1: Setup (Choose One Method)

### Option A: ngrok (Quick Testing)

- [ ] Install ngrok: `brew install ngrok/ngrok/ngrok`
- [ ] Create ngrok account: https://dashboard.ngrok.com
- [ ] Get auth token and save: `ngrok config add-authtoken YOUR_TOKEN`
- [ ] Start tunnel: `ngrok http 3000`
- [ ] Copy tunnel URL (e.g., `https://1a2b3c4d5e6f.ngrok.io`)
- [ ] Test with curl: `curl https://1a2b3c4d5e6f.ngrok.io/api/health`

### Option B: Cloudflare Tunnel (Recommended)

- [ ] Install cloudflared: `brew install cloudflare/cloudflare/cloudflared`
- [ ] Authenticate: `cloudflared tunnel login`
- [ ] Create tunnel: `cloudflared tunnel create mission-control-dev`
- [ ] Copy tunnel ID: `d1234567-abcd-1234-abcd-1234567890ab`
- [ ] Create `~/.cloudflared/config.yml` (see TUNNEL_SETUP_GUIDE.md)
- [ ] Add DNS CNAME record to Cloudflare dashboard:
  - Name: `mission-control-dev`
  - Content: `d1234567-abcd-1234-abcd-1234567890ab.cfargotunnel.com`
  - Proxy: Orange cloud (enabled)
- [ ] Test tunnel: `curl https://mission-control-dev.elevationaiwork.com/api/health`
- [ ] Wait 2 minutes for DNS propagation

---

## Phase 2: Verify Backend API

- [ ] Ensure Mission Control API is running on `localhost:3000`
- [ ] Check API responds: `curl http://localhost:3000/api/health`
- [ ] Verify JWT auth endpoint: `curl -X POST http://localhost:3000/api/auth/login`
- [ ] Check WebSocket endpoint: `curl http://localhost:3000/ws`
- [ ] Confirm CORS allows tunnel origin (see Part 5 in TUNNEL_SETUP_GUIDE.md)

---

## Phase 3: Update iOS App Configuration

### Environment Variables

- [ ] Create `.env.local` in React Native project root:
  ```bash
  REACT_APP_API_BASE_URL=https://mission-control-dev.elevationaiwork.com  # (or ngrok URL)
  REACT_APP_WS_URL=wss://mission-control-dev.elevationaiwork.com/ws
  ```

### API Client Code

- [ ] Update `src/services/api.ts`:
  ```typescript
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
  ```

- [ ] Verify WebSocket setup:
  ```typescript
  const wsURL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws';
  ```

- [ ] Implement JWT token storage (AsyncStorage):
  ```typescript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  // Save after login
  await AsyncStorage.setItem('jwt_token', token);
  
  // Load on app launch
  const token = await AsyncStorage.getItem('jwt_token');
  ```

### CORS & Headers

- [ ] Ensure `Authorization` header is set:
  ```typescript
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
  ```

---

## Phase 4: Build & Deploy to iPhone

### Rebuild App

- [ ] Clean build: `npm run clean`
- [ ] Install dependencies: `npm install`
- [ ] Rebuild for iOS: `npm run build:ios`

### Deploy to Device

**Via Xcode:**
- [ ] Open Xcode project: `ios/MissionControl.xcworkspace`
- [ ] Select target iPhone device
- [ ] Build and run: `Cmd + R`

**Via CLI:**
- [ ] Deploy: `react-native run-ios --device`

### Verify on Device

- [ ] App launches without errors
- [ ] Can navigate to login screen
- [ ] Can see tunnel URL in app logs (debug mode)
- [ ] WebSocket connection attempt visible in Xcode console

---

## Phase 5: Test Network Connectivity

### Local Wi-Fi Testing

- [ ] iPhone connected to same Wi-Fi as macOS
- [ ] Open Safari on iPhone
- [ ] Navigate to tunnel URL: `https://mission-control-dev.elevationaiwork.com`
- [ ] Should show Mission Control API landing page (or 401 if auth required)

### API Testing

- [ ] [ ] Launch app on iPhone
- [ ] [ ] Attempt login with test credentials
- [ ] [ ] Verify HTTP response 200 (token received)
- [ ] [ ] Check AsyncStorage saved token: `await AsyncStorage.getItem('jwt_token')`

### WebSocket Testing

- [ ] [ ] After login, WebSocket should connect
- [ ] [ ] Trigger task update in backend: `POST /api/tasks`
- [ ] [ ] iPhone should receive real-time update via WebSocket
- [ ] [ ] No console errors related to WebSocket

---

## Phase 6: Verify Offline-First Sync

### Offline Mode

- [ ] [ ] Disconnect iPhone from Wi-Fi (Airplane Mode)
- [ ] [ ] Attempt task action in app (e.g., approve task)
- [ ] [ ] Verify action queued locally (in SQLite)
- [ ] [ ] Reconnect to Wi-Fi
- [ ] [ ] Verify queued action syncs to backend

### Conflict Resolution

- [ ] [ ] Edit task on backend while iPhone offline
- [ ] [ ] Update same task on iPhone
- [ ] [ ] Reconnect and verify merge/resolution logic works

---

## Phase 7: Monitor & Debug

### Logging

- [ ] [ ] Enable debug logging in app:
  ```typescript
  if (__DEV__) {
    console.log('[API]', method, endpoint);
  }
  ```

- [ ] [ ] Monitor tunnel logs:
  **ngrok:** `ngrok http 3000` shows real-time requests
  **Cloudflare:** `cloudflared tunnel run mission-control-dev` shows requests

### Safari Web Inspector

- [ ] [ ] Enable on iPhone: Settings → Safari → Advanced → Web Inspector
- [ ] [ ] Connect to Mac: Safari → Develop → [Your iPhone] → Choose app
- [ ] [ ] Inspect console and network tabs
- [ ] [ ] Check for errors in WebSocket/HTTP requests

### Network Debugging (Optional)

- [ ] [ ] Install Charles Proxy (macOS)
- [ ] [ ] Configure iPhone to route through Charles
- [ ] [ ] Monitor API traffic and response times
- [ ] [ ] Verify headers and payloads

---

## Phase 8: Security Checklist

- [ ] [ ] JWT tokens are never logged to console
- [ ] [ ] Tokens stored in secure storage (iOS Keychain recommended)
- [ ] [ ] CORS headers explicitly whitelist tunnel origin
- [ ] [ ] HTTPS enforced (no fallback to HTTP)
- [ ] [ ] Token refresh implemented (before expiry)

---

## Phase 9: Edge Cases & Error Handling

- [ ] [ ] Network timeout: Implement 30s timeout on requests
- [ ] [ ] Retries: Exponential backoff (1s, 2s, 4s, 8s)
- [ ] [ ] WebSocket reconnection: Retry every 5s with max 5 retries
- [ ] [ ] Invalid token: Refresh token or re-login
- [ ] [ ] 4xx/5xx errors: Display user-friendly error messages

---

## Phase 10: Performance Testing

- [ ] [ ] Measure API response time from iPhone (target <500ms)
- [ ] [ ] WebSocket latency (target <100ms)
- [ ] [ ] App memory usage (target <50MB baseline)
- [ ] [ ] Battery impact (verify no constant polling)

---

## Rollback Plan

If tunnel setup fails:

1. [ ] Revert to `localhost:3000` for local testing only
2. [ ] Document failure reason in ticket
3. [ ] Escalate to Chief for troubleshooting
4. [ ] Consider alternative: **VPN tunnel** or **ngrok alternative (localtunnel.me)**

---

## Sign-Off

**Phase Completed By:** [Chief - Infrastructure]  
**Date:** 2026-03-19  
**Status:** ✅ Ready for Phase 4 Testing

---

**Notes:**
- Keep tunnel running in background during Phase 4 (Local Testing & Polish)
- Tunnel domain remains static (Cloudflare) or changes (ngrok) on restart
- Update CI/CD environment variables when deploying to staging
