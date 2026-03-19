# Local Tunnel Setup Guide

## Overview

This guide explains how to configure Mission Control iOS app to communicate with your local development machine through a tunnel. This is the key feature that allows remote access to local APIs.

## What is a Tunnel?

A tunnel creates a secure connection from your iPhone app to your local machine:

```
iPhone App ──(HTTPS)──> Tunnel Provider ──(Local)──> Your Computer
```

This allows you to:
- Develop on your local machine
- Test on your iPhone/physical device
- Avoid port forwarding complexity
- Use local URLs (localhost:3000) from remote devices

## Tunnel Options

### Option 1: ngrok (Recommended for Development)

**What it is:** Quick, free tunnel service. Perfect for development.

**Setup:**

1. Install ngrok:
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com
   ```

2. Start your local Mission Control API:
   ```bash
   npm run dev  # or your dev command
   # Should be running on http://localhost:3000
   ```

3. Create ngrok tunnel:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. In Mission Control iOS app:
   - Go to **Settings** → **API Configuration**
   - Paste the ngrok URL
   - Tap **Connect**
   - App will test the connection

6. You're done! The app now talks to your local machine via ngrok.

**Pros:**
- One command setup
- Fast (~100ms latency)
- No configuration needed
- Free tier available

**Cons:**
- URL changes on restart (use `--domain` flag to get permanent URL)
- Rate limited on free tier

**Keep it persistent:**
```bash
ngrok http 3000 --domain=your-subdomain.ngrok.io
```

---

### Option 2: Cloudflare Tunnel (Recommended for Production)

**What it is:** Enterprise-grade tunnel. Great for long-term access.

**Setup:**

1. Install cloudflared:
   ```bash
   brew install cloudflare/cloudflare/cloudflared  # macOS
   # or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
   ```

2. Authenticate:
   ```bash
   cloudflared tunnel login
   # Opens browser to authorize
   ```

3. Create tunnel:
   ```bash
   cloudflared tunnel create mission-control
   ```

4. Route traffic to local API:
   ```bash
   cloudflared tunnel route dns mission-control subdomain.elevationaiwork.com
   ```

5. Start tunnel:
   ```bash
   cloudflared tunnel run mission-control \
     --url http://localhost:3000
   ```

6. In Mission Control iOS app:
   - Go to **Settings** → **API Configuration**
   - Paste: `https://mission-control-api.elevationaiwork.com`
   - Tap **Connect**

**Pros:**
- Persistent URLs
- Better security
- Integrated with Cloudflare DNS
- No rate limits

**Cons:**
- Requires Cloudflare account
- More setup

---

### Option 3: SSH Tunnel (Advanced)

If you have a VPS, you can tunnel through SSH:

```bash
# From your local machine
ssh -R 3000:localhost:3000 user@vps.example.com

# Then access via: https://your-vps.example.com:3000
```

---

### Option 4: Local Network (Same WiFi)

If developing on same WiFi network:

1. Find your machine's local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # e.g., 192.168.1.100
   ```

2. Make sure your dev server allows local network access

3. In app settings, use: `http://192.168.1.100:3000`

**Note:** Only works on same network. Not recommended for team development.

---

## Using Tunnel in the App

### Settings Screen

The Mission Control iOS app has a dedicated tunnel configuration section:

```
⚙️ Settings
├─ API Configuration
│  ├─ Current Tunnel: [Your URL or "Not Connected"]
│  ├─ Connection Status: ✅ Connected (12ms) / ❌ Disconnected
│  ├─ Tunnel Type: [Custom / ngrok / Cloudflare]
│  │
│  ├─ Configure Tunnel
│  │  ├─ [Text Field: Paste URL here]
│  │  ├─ [Test Connection Button]
│  │  └─ [Save Button]
│  │
│  ├─ Presets (Quick Setup)
│  │  ├─ http://localhost:3000 (Local)
│  │  ├─ https://abc123.ngrok.io (ngrok)
│  │  └─ https://mission-control-api.elevationaiwork.com (Cloudflare)
│  │
│  └─ Disable Tunnel (Fallback to default API)
│
├─ Connection Health
│  ├─ Last Check: 30 seconds ago
│  ├─ Response Time: 45ms
│  └─ Auto-check: Every 30s
```

### Programmatic Configuration

```typescript
import { tunnelService } from './src/services/tunnelService';

// Set tunnel
await tunnelService.setTunnelURL('https://abc123.ngrok.io', 'ngrok');

// Check status
const status = tunnelService.getStatus();
console.log(status.isConnected); // true/false

// Disable tunnel
await tunnelService.disableTunnel();

// Listen for changes
tunnelService.onStatusChange(status => {
  console.log('Tunnel status:', status);
});
```

---

## Troubleshooting

### "Connection Failed" Error

**Problem:** App can't reach tunnel URL

**Solutions:**
1. Verify tunnel is running (check terminal)
2. Check URL is correct (copy from terminal output)
3. Verify local API is running on correct port
4. Check firewall isn't blocking traffic
5. Try with phone on same WiFi to rule out network issues

### "Invalid URL Format"

**Problem:** URL validation failed

**Solutions:**
1. Make sure URL starts with `http://` or `https://`
2. No trailing slash: Use `https://abc.ngrok.io` not `https://abc.ngrok.io/`
3. No spaces or special characters

### Tunnel Works but Slow

**Problem:** Responses taking >1 second

**Solutions:**
1. **Network:** Check phone internet speed
2. **Location:** Tunnel provider might be far away
3. **Server:** Local API might be slow (check backend logs)
4. **Load:** Too many requests? Implement rate limiting
5. **ngrok free:** Free tier is slower. Upgrade or use Cloudflare

### "Tunnel keeps disconnecting"

**Problem:** Intermittent connection issues

**Solutions:**
1. **ngrok:** Restart tunnel (free tier has limits)
2. **WiFi:** Switch to stable network
3. **Firewall:** Check corporate firewall blocks ngrok IPs
4. **Port:** Make sure nothing else is using port 3000

### Can't Test Connection

**Problem:** Test button returns error

**Solutions:**
1. Check API has a `/api/status` endpoint
2. API must respond within 5 seconds
3. CORS headers must allow requests from iOS bundle ID
4. Try accessing tunnel URL from web browser first

---

## Health Checks

The app automatically checks tunnel health every 30 seconds:

```
✅ Connected (45ms)    - Tunnel is working great
⚠️  Connected (500ms)  - Tunnel is slow but working
❌ Disconnected       - Tunnel is down or unreachable
```

If tunnel disconnects:
- App falls back to default API automatically
- Queues pending operations
- Auto-retries when tunnel reconnects

---

## Production Deployment

When deploying to App Store:

1. **Remove tunnel:** Disable tunnel in settings
2. **Use production API:** Set default API to `https://mission-control-api.elevationaiwork.com`
3. **CORS:** Verify CORS headers allow your app's bundle ID
4. **Certificates:** Ensure SSL certificates are valid

Users can still configure tunnels in app settings if they want to test with local versions.

---

## Advanced: Tunnel API Reference

### TunnelService Methods

```typescript
// Set tunnel URL
await tunnelService.setTunnelURL(url, type)

// Disable tunnel (fallback to default)
await tunnelService.disableTunnel()

// Get current configuration
const config = tunnelService.getConfig()

// Get connection status
const status = tunnelService.getStatus()

// Check tunnel health
const isHealthy = await tunnelService.checkHealth()

// Subscribe to changes
const unsubscribe = tunnelService.onStatusChange(callback)

// Clear all config
await tunnelService.clear()
```

### Tunnel Config Format

```typescript
interface TunnelConfig {
  name: string              // e.g., "ngrok Tunnel"
  url: string               // e.g., "https://abc123.ngrok.io"
  isActive: boolean
  enabledAt?: string        // ISO timestamp
  type: 'ngrok' | 'cloudflare' | 'custom'
  description?: string
  testUrl?: string          // Custom health check URL
}
```

---

## Tips & Best Practices

### Development

- ✅ Use ngrok for quick iterations
- ✅ Keep tunnel URL in team Slack/Wiki
- ✅ Test on real device, not just simulator
- ✅ Watch for ngrok URL changes (use permanent domains)

### Team Collaboration

- ✅ Document your tunnel URL for teammates
- ✅ Share ngrok domain for persistent access
- ✅ Use Cloudflare for team development
- ✅ Rotate passwords/tokens regularly

### Security

- ❌ Don't commit real tunnel URLs to git
- ❌ Don't share ngrok URLs publicly
- ✅ Use HTTPS (all tunnels support it)
- ✅ Implement authentication (JWT)
- ✅ Use strong refresh tokens

### Performance

- ✅ Monitor response times in app
- ✅ Use ngrok `--traffic` to debug requests
- ✅ Check local API performance (not tunnel's fault)
- ✅ Implement caching on client

---

## Common Tunnel URLs

These are examples. Replace with your actual URLs:

```
Development:    http://localhost:3000
ngrok:          https://abc123.ngrok.io
Cloudflare:     https://mission-control-api.elevationaiwork.com
Production:     https://api.missioncontrol.io
Staging:        https://staging-api.missioncontrol.io
```

---

## Quick Reference Card

```bash
# Start local API
npm run dev

# Start ngrok
ngrok http 3000

# Start Cloudflare tunnel
cloudflared tunnel run mission-control --url http://localhost:3000

# Test tunnel (from terminal)
curl https://your-tunnel-url/api/status
```

Then paste the tunnel URL in app settings! 🎉

---

**Need help?** Check the API documentation at `/DOCS/API.md`
