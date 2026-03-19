# Cloudflare Tunnel Setup for Mission Control

**Date:** March 15, 2026  
**Purpose:** Secure remote access to Mission Control (localhost:3001) and API (localhost:3000)  
**Domain:** elevationaiwork.com  
**Tunnel Name:** mission-control

---

## What Is This?

Cloudflare Tunnel creates a secure, encrypted connection from your home Mac mini to Cloudflare's edge network. This lets you access Mission Control from anywhere (mobile, laptop, coffee shop) without:
- Opening ports on your home network
- Managing firewalls/NAT
- Exposing your IP address

Data stays encrypted in transit and on your machine.

---

## Installation

### Step 1: Install Cloudflared CLI

```bash
brew install cloudflare/cloudflare/cloudflared
```

Verify:
```bash
cloudflared --version
```

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser to authenticate. Click **Authorize** and select your domain (`elevationaiwork.com`).

You'll get a certificate file stored at:
```
~/.cloudflare/cert.pem
```

### Step 3: Create the Tunnel

```bash
cloudflared tunnel create mission-control
```

This outputs:
```
Tunnel credentials have been saved in:
/Users/timothyryan/.cloudflare/mission-control.json

Tunnel ID: <your-tunnel-id>
```

**Save the Tunnel ID** — you'll need it for DNS records.

---

## Configuration

### Step 4: Create Config File

Create `~/.cloudflare/config.yml`:

```yaml
tunnel: mission-control
credentials-file: /Users/timothyryan/.cloudflare/mission-control.json
logfile: /Users/timothyryan/.cloudflare/tunnel.log

ingress:
  # Frontend
  - hostname: mission-control.elevationaiwork.com
    service: http://localhost:3001
  
  # API
  - hostname: mission-control-api.elevationaiwork.com
    service: http://localhost:3000
  
  # Fallback
  - service: http_status:404
```

---

## DNS Configuration

### Step 5: Add DNS Records in Cloudflare

Go to: https://dash.cloudflare.com → DNS

Add two CNAME records:

**Record 1:**
- **Type:** CNAME
- **Name:** mission-control
- **Target:** `<tunnel-id>.cfargotunnel.com`
- **Proxy status:** Proxied (orange cloud)
- **TTL:** Auto

**Record 2:**
- **Type:** CNAME
- **Name:** mission-control-api
- **Target:** `<tunnel-id>.cfargotunnel.com`
- **Proxy status:** Proxied (orange cloud)
- **TTL:** Auto

---

## Running the Tunnel

### Step 6: Start the Tunnel

```bash
cloudflared tunnel run mission-control
```

You should see:
```
2026-03-15T22:00:00Z INF Starting tunnel session...
2026-03-15T22:00:01Z INF Registered tunnel connection
2026-03-15T22:00:02Z INF Connected to edge
```

### Step 7: Test It Out

From another device/network:
- **Frontend:** https://mission-control.elevationaiwork.com
- **API:** https://mission-control-api.elevationaiwork.com/api/status

You should see:
- ✅ Frontend loads with green "Connected" indicator
- ✅ API returns status JSON

---

## Automation (Optional)

To run the tunnel automatically on Mac startup:

### Create LaunchAgent

```bash
mkdir -p ~/Library/LaunchAgents
```

Create `~/Library/LaunchAgents/com.cloudflare.tunnel.mission-control.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.tunnel.mission-control</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>run</string>
        <string>mission-control</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardErrorPath</key>
    <string>/Users/timothyryan/.cloudflare/tunnel-error.log</string>
    
    <key>StandardOutPath</key>
    <string>/Users/timothyryan/.cloudflare/tunnel-out.log</string>
</dict>
</plist>
```

### Load the Agent

```bash
launchctl load ~/Library/LaunchAgents/com.cloudflare.tunnel.mission-control.plist
```

Verify:
```bash
launchctl list | grep cloudflare
```

---

## Verification Checklist

After setup:

- [ ] `cloudflared tunnel list` shows "mission-control" with status "healthy"
- [ ] DNS records show green proxied status in Cloudflare dashboard
- [ ] `https://mission-control.elevationaiwork.com` loads without warnings
- [ ] Frontend shows "Connected" status
- [ ] API endpoint returns valid JSON
- [ ] Can access from mobile device on different network

---

## Troubleshooting

### Tunnel won't connect
```bash
cloudflared tunnel logs mission-control
```

### DNS not propagating
```bash
dig mission-control.elevationaiwork.com
```

### Certificate issues
```bash
cloudflared tunnel delete mission-control
# Then re-run `cloudflared tunnel create mission-control`
```

### Check tunnel status
```bash
cloudflared tunnel info mission-control
```

---

## Security Notes

✅ **Encrypted in transit** (TLS 1.3)  
✅ **No port forwarding needed**  
✅ **IP address hidden** (uses Cloudflare edge)  
✅ **DDoS protection** included  
✅ **Data stays on your Mac** (not stored in cloud)  

You can optionally add:
- **Cloudflare Access** for authentication (free tier available)
- **WAF rules** for additional protection
- **Rate limiting** to prevent abuse

---

## Next Steps

1. **Immediate:** Set up tunnel and test
2. **Optional:** Add Cloudflare Access for auth
3. **Consider:** Run tunnel automatically via LaunchAgent
4. **Extend:** Add same pattern for other services (WorkSafeAI, Consensus)

---

**Status:** Ready for deployment  
**Time to completion:** ~10 minutes  
**Reversibility:** Fully reversible (just delete tunnel)
