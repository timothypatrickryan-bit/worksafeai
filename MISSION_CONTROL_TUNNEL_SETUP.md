# Mission Control — Cloudflare Tunnel Setup ✅

**Status:** ACTIVE & RUNNING (March 20, 2026 @ 11:48 AM EST)

## Overview

Your Mission Control iOS app can now connect to `localhost:3000` from anywhere in the world via a Cloudflare Tunnel.

## Architecture

```
Your Mac (localhost:3000)
    ↓
Cloudflare Tunnel (encrypted)
    ↓
mission-api.elevationaiwork.com
    ↓
iOS App / Remote Client
```

## Access Points

### Local Network (Same WiFi)
- **URL:** `http://localhost:3000`
- **When to use:** Development, simulator testing
- **Setup:** Add to iOS Settings tab, or hardcode in dev

### Remote Network (Anywhere)
- **URL:** `https://mission-api.elevationaiwork.com`
- **When to use:** iPhone on 4G/LTE, different WiFi, production
- **Requires:** Tunnel running + backend on localhost:3000
- **Status:** ✅ Live and configured

## What's Running

### 1. Cloudflare Tunnel
- **Tunnel Name:** `mission-control`
- **Tunnel ID:** `1caf184f-de5c-4128-9939-3ad37746a28f`
- **Destination:** `http://localhost:3000`
- **Hostname:** `mission-api.elevationaiwork.com`
- **Status:** ✅ **RUNNING**
- **launchd Job:** `com.openclaw.cloudflare-tunnel-mission-api`

### 2. DNS Record
- **Type:** CNAME
- **Domain:** `mission-api.elevationaiwork.com`
- **Target:** Cloudflare Tunnel network
- **Status:** ✅ **PROPAGATED** (verified with nslookup)

### 3. iOS App Configuration
- **File:** `app/_layout.tsx`
- **API Base URL:** `https://mission-api.elevationaiwork.com`
- **Fallback:** Mock data when backend unavailable
- **Auto-connect:** On app launch

## How to Use

### Start Your Mission Control Backend

```bash
cd /path/to/mission-control-backend
npm install
npm start
# Backend runs on localhost:3000
```

### App Automatically Connects

1. **Local (Mac):** iOS Simulator will connect via tunnel
2. **Remote (iPhone):** Scan QR code from `npm start`, app connects via tunnel
3. **Settings Tab:** Shows 🟢 Connected when backend responds

### Verify Tunnel Status

```bash
# Check if running
launchctl list | grep mission-api
# Should show: exit code 0 (running)

# View logs
tail -50 ~/.openclaw/workspace/.cloudflare-tunnel-mission-api.error.log

# Test endpoint
curl https://mission-api.elevationaiwork.com/api/health
```

## Management

### Stop Tunnel
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.cloudflare-tunnel-mission-api.plist
```

### Start Tunnel
```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.cloudflare-tunnel-mission-api.plist
```

### Restart Tunnel
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.cloudflare-tunnel-mission-api.plist
sleep 2
launchctl load ~/Library/LaunchAgents/com.openclaw.cloudflare-tunnel-mission-api.plist
```

## Technical Details

### Config File
- **Location:** `~/.cloudflared/config/mission-api.yml`
- **Content:**
  ```yaml
  tunnel: mission-control
  credentials-file: /Users/timothyryan/.cloudflared/1caf184f-de5c-4128-9939-3ad37746a28f.json
  
  ingress:
    - hostname: mission-api.elevationaiwork.com
      service: http://localhost:3000
    - service: http_status:404
  ```

### Logs
- **Error Log:** `~/.openclaw/workspace/.cloudflare-tunnel-mission-api.error.log`
- **Output Log:** `~/.openclaw/workspace/.cloudflare-tunnel-mission-api.log`

### Authentication
- **Credentials:** `~/.cloudflared/1caf184f-de5c-4128-9939-3ad37746a28f.json`
- **Status:** ✅ Configured & Active

## Security Notes

✅ **What's Secure:**
- HTTPS encryption (Cloudflare SSL)
- No port forwarding needed
- Private tunnel (only you control it)
- Credentials stored locally (macOS keychain-compatible)

⚠️ **What's Not Secure:**
- `localhost:3000` traffic is unencrypted on your Mac
- Only add auth to your backend if needed for production

## Troubleshooting

### Tunnel not running?
```bash
# Check status
launchctl list | grep mission-api
# If exit code 78, it's unloaded

# Reload it
launchctl load ~/Library/LaunchAgents/com.openclaw.cloudflare-tunnel-mission-api.plist
```

### DNS not resolving?
```bash
# Clear DNS cache
sudo dscacheutil -flushcache

# Test DNS
nslookup mission-api.elevationaiwork.com
# Should return Cloudflare IPs
```

### Backend not reachable?
```bash
# Verify backend is running on 3000
lsof -i :3000
# Should show node process

# Test tunnel directly
curl -v https://mission-api.elevationaiwork.com/api/health
# Should return 200 if backend up, 503 if down
```

## Next Steps

1. ✅ Tunnel is running
2. ⏳ **Start your Mission Control backend** (`npm start` on localhost:3000)
3. ✅ iOS app will auto-connect to the tunnel
4. ✅ Open Settings tab to verify 🟢 Connected

Your setup is complete and ready to use! 🚀

---

**Files Changed:**
- `app/_layout.tsx` — Updated API base URL to tunnel domain
- Created `/Users/timothyryan/.cloudflared/config/mission-api.yml`
- Created launchd job: `com.openclaw.cloudflare-tunnel-mission-api.plist`
- Added DNS CNAME: `mission-api.elevationaiwork.com`
