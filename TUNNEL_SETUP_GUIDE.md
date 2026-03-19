# Local Tunnel Configuration Guide - iOS Mission Control App

**Status:** Configuration Plan  
**Created:** 2026-03-19  
**For:** iOS Mission Control App (Project 1773878979812)  
**Objective:** Enable iPhone to reach local Mission Control API via ngrok or Cloudflare tunnel

---

## Quick Start (TL;DR)

**Choose one method:**
1. **ngrok** (simpler, faster to set up) → `ngrok http 3000`
2. **Cloudflare Tunnel** (more stable, better for production) → Full setup below

**Then update your iOS app:**
- `API_BASE_URL` → `https://your-tunnel-url.com`
- Rebuild and test on iPhone

---

## Part 1: ngrok Setup (Recommended for Quick Testing)

### 1.1 Install ngrok

```bash
# macOS with Homebrew
brew install ngrok/ngrok/ngrok

# Or download from https://ngrok.com/download
```

### 1.2 Create ngrok Account & Get Auth Token

```bash
# Sign up at https://dashboard.ngrok.com
# Get your auth token, then:

ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 1.3 Start Local Tunnel

```bash
# Assuming Mission Control API runs on localhost:3000
# (adjust port if different)

ngrok http 3000 \
  --domain=your-custom-domain.ngrok.io \
  --auth=your-basic-auth-username:password

# Or simple version (generates random subdomain):
ngrok http 3000

# Output will show:
# Forwarding     https://1a2b3c4d5e6f.ngrok.io -> http://localhost:3000
```

### 1.4 Save the Tunnel URL

The URL from step above becomes your `API_BASE_URL` in the iPhone app.

**Example:**
```
API_BASE_URL=https://1a2b3c4d5e6f.ngrok.io
```

### 1.5 Configure iPhone App

In your React Native app, update the API client:

```javascript
// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// For production/testing:
const API_BASE_URL = 'https://1a2b3c4d5e6f.ngrok.io';
```

**Or use environment variables:**

```bash
# .env.local
REACT_APP_API_BASE_URL=https://1a2b3c4d5e6f.ngrok.io
```

### 1.6 Test Connection

```bash
# From terminal, verify tunnel works:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://1a2b3c4d5e6f.ngrok.io/api/tasks

# Or open in browser:
# https://1a2b3c4d5e6f.ngrok.io/health
```

### 1.7 Build & Deploy to iPhone

```bash
# Rebuild app with new API_BASE_URL
cd ios-mission-control
npm run build

# Then build for iOS device:
# Via Xcode or: react-native run-ios --device
```

---

## Part 2: Cloudflare Tunnel Setup (Production Recommended)

### 2.1 Prerequisites

- **Cloudflare account** (elevationaiwork.com is already hosted here)
- **Cloudflare Zero Trust plan** (free tier includes tunnels)
- **cloudflared CLI** installed

### 2.2 Install cloudflared CLI

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Verify
cloudflared --version
```

### 2.3 Authenticate cloudflared

```bash
# This opens browser to authenticate
cloudflared tunnel login

# Creates config file at: ~/.cloudflared/cert.pem
```

### 2.4 Create Tunnel

```bash
# Create tunnel named "mission-control-dev"
cloudflared tunnel create mission-control-dev

# Output shows tunnel ID, e.g.:
# Tunnel credentials written to ~/.cloudflared/d1234567-abcd-1234-abcd-1234567890ab.json
# Tunnel d1234567-abcd-1234-abcd-1234567890ab created.
```

### 2.5 Configure Tunnel

Create config file: `~/.cloudflared/config.yml`

```yaml
tunnel: d1234567-abcd-1234-abcd-1234567890ab
credentials-file: /Users/yourname/.cloudflared/d1234567-abcd-1234-abcd-1234567890ab.json

ingress:
  # Route: mission-control-dev.elevationaiwork.com → local API
  - hostname: mission-control-dev.elevationaiwork.com
    service: http://localhost:3000

  # Catch-all (optional, for debugging)
  - service: http_status:404
```

### 2.6 DNS Configuration in Cloudflare

1. Go to **Cloudflare Dashboard** → **elevationaiwork.com** → **DNS**
2. Add CNAME record:
   ```
   Type:  CNAME
   Name:  mission-control-dev
   Content: d1234567-abcd-1234-abcd-1234567890ab.cfargotunnel.com
   Proxy: Orange cloud (Cloudflare proxy)
   TTL: Auto
   ```

### 2.7 Start Cloudflare Tunnel

```bash
# Run tunnel in background
cloudflared tunnel run mission-control-dev &

# Or foreground (better for debugging):
cloudflared tunnel run mission-control-dev

# Output should show:
# Registered tunnel connection
# Connection established
```

### 2.8 Verify DNS Propagation

```bash
# Wait 1-2 minutes, then test:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://mission-control-dev.elevationaiwork.com/api/tasks

# Should return task data if API is running
```

### 2.9 Configure iPhone App

Update API base URL:

```javascript
// src/services/api.ts
const API_BASE_URL = 'https://mission-control-dev.elevationaiwork.com';
```

Or `.env`:

```bash
# .env.production
REACT_APP_API_BASE_URL=https://mission-control-dev.elevationaiwork.com
```

### 2.10 iOS App Changes

Ensure your app trusts the Cloudflare domain:

```typescript
// For React Native, no special config needed if using standard HTTPS

// For web client:
// Add to Content Security Policy if applicable
// connect-src https://mission-control-dev.elevationaiwork.com
```

---

## Part 3: Authentication Setup

Both tunnels require **authentication** to the backend. Ensure your iOS app handles JWT tokens:

### 3.1 JWT Token Flow

```typescript
// src/services/api.ts

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async login(username: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const { token } = await response.json();
    this.token = token;
    return token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this.token}`,
    };
    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
  }
}
```

### 3.2 Store Token Securely (iOS)

```typescript
// iOS-specific: use React Native AsyncStorage or iOS Keychain

import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token after login
await AsyncStorage.setItem('jwt_token', token);

// Retrieve on app launch
const token = await AsyncStorage.getItem('jwt_token');
```

---

## Part 4: WebSocket Configuration

Mission Control uses WebSockets for real-time updates. Configure both tunnel types:

### 4.1 ngrok WebSocket

ngrok automatically proxies WebSocket connections. No special config needed:

```typescript
// Connect to WebSocket via ngrok tunnel
const wsURL = 'wss://1a2b3c4d5e6f.ngrok.io/ws';
const ws = new WebSocket(wsURL);
```

### 4.2 Cloudflare WebSocket

Cloudflare Tunnels support WebSocket by default. Update config:

```yaml
# ~/.cloudflared/config.yml
tunnel: d1234567-abcd-1234-abcd-1234567890ab
ingress:
  - hostname: mission-control-dev.elevationaiwork.com
    service: http://localhost:3000
    # WebSocket auto-configured for all services
```

Connect in app:

```typescript
// Connect to WebSocket via Cloudflare tunnel
const wsURL = 'wss://mission-control-dev.elevationaiwork.com/ws';
const ws = new WebSocket(wsURL);

ws.onopen = () => console.log('Connected to Mission Control');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

---

## Part 5: CORS Configuration

### 5.1 Server-Side (Node.js/Express)

Update your Mission Control API to allow requests from tunnel URLs:

```javascript
// src/server.ts
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:*', // For web development
  'https://1a2b3c4d5e6f.ngrok.io', // ngrok URL (if using)
  'https://mission-control-dev.elevationaiwork.com', // Cloudflare URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5.2 React Native (iOS)

React Native doesn't have CORS restrictions, but ensure headers are set:

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};

fetch(apiURL, {
  method: 'POST',
  headers,
  body: JSON.stringify(data),
});
```

---

## Part 6: Environment Configuration

### 6.1 Local Development (macOS)

Create `.env.local`:

```bash
# ngrok option
REACT_APP_API_BASE_URL=https://1a2b3c4d5e6f.ngrok.io

# OR Cloudflare option
REACT_APP_API_BASE_URL=https://mission-control-dev.elevationaiwork.com

REACT_APP_WS_URL=wss://mission-control-dev.elevationaiwork.com/ws
```

### 6.2 Staging

```bash
# .env.staging
REACT_APP_API_BASE_URL=https://mission-control-staging.elevationaiwork.com
REACT_APP_WS_URL=wss://mission-control-staging.elevationaiwork.com/ws
```

### 6.3 Production

```bash
# .env.production
REACT_APP_API_BASE_URL=https://api.elevationaiwork.com
REACT_APP_WS_URL=wss://api.elevationaiwork.com/ws
```

---

## Part 7: SSL/Certificate Management

### 7.1 ngrok Certificates

ngrok automatically generates valid SSL certificates. No action needed.

### 7.2 Cloudflare Certificates

Cloudflare handles SSL for all tunnel routes automatically via their origin certificate.

Verify in browser:
```
https://mission-control-dev.elevationaiwork.com
```

Should show Cloudflare cert with zero warnings.

---

## Part 8: Testing Checklist

- [ ] Local API runs on `localhost:3000`
- [ ] Tunnel is active (ngrok or Cloudflared)
- [ ] Can `curl` tunnel URL from terminal successfully
- [ ] DNS resolves correctly (Cloudflare)
- [ ] iPhone can reach tunnel URL on same Wi-Fi
- [ ] JWT login flow works
- [ ] WebSocket connects and receives updates
- [ ] Offline queue works and syncs when online
- [ ] Push notifications work (if applicable)
- [ ] No CORS errors in Safari DevTools

---

## Part 9: Troubleshooting

### Issue: iPhone Cannot Reach Tunnel

**ngrok:**
```bash
# Check tunnel status
curl -s http://localhost:4040/api/tunnels | jq .tunnels[0].public_url

# Verify firewall allows port 3000
lsof -i :3000
```

**Cloudflare:**
```bash
# Check tunnel status
cloudflared tunnel list

# Check DNS
dig mission-control-dev.elevationaiwork.com

# Test tunnel connectivity
curl https://mission-control-dev.elevationaiwork.com
```

### Issue: JWT Token Expires on iPhone

Solution: Implement token refresh:

```typescript
const refreshToken = async () => {
  const response = await fetch(`${baseURL}/api/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const { token: newToken } = await response.json();
  await AsyncStorage.setItem('jwt_token', newToken);
  return newToken;
};
```

### Issue: WebSocket Disconnects on Poor Network

Implement reconnection logic:

```typescript
const connectWebSocket = () => {
  const ws = new WebSocket(wsURL);
  
  ws.onclose = () => {
    console.log('WebSocket closed, reconnecting in 5s...');
    setTimeout(connectWebSocket, 5000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    ws.close();
  };
};
```

---

## Part 10: Transition to Production

### 10.1 When to Switch from Dev Tunnel

After **Phase 4 (Local Testing & Polish)** completes:

1. Deploy Mission Control API to **staging server** (e.g., Vercel)
2. Update iPhone app to connect to staging API
3. Run full E2E testing on iPhone connected to internet
4. Move to App Store testing before production

### 10.2 Production Tunnel URL

For production release:

```javascript
// Use actual production API domain (not a tunnel)
const API_BASE_URL = 'https://api.elevationaiwork.com';
```

---

## Summary: Choose Your Method

| Feature | ngrok | Cloudflare |
|---------|-------|-----------|
| Setup time | 5 minutes | 15 minutes |
| Custom domain | Premium only | Free (via elevationaiwork.com) |
| Stability | Good | Excellent |
| Cost | $5-20/mo | Free tier sufficient |
| Best for | Quick testing | Long-term dev + staging |
| Persistence | Tunnel URL changes | Fixed domain |

---

## Next Steps

1. **Choose ngrok or Cloudflare** (recommend Cloudflare for your setup)
2. **Follow the setup steps** for your choice (Part 1 or Part 2)
3. **Test from iPhone** on same Wi-Fi network
4. **Update environment variables** in React Native app
5. **Proceed to Phase 4: Local Testing & Polish** (iOS app tests on device)

---

**Created by:** Subagent - Chief (Infrastructure)  
**Last updated:** 2026-03-19  
**Status:** Ready for Implementation
