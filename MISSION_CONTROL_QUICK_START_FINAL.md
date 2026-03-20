# Mission Control iOS + Backend — Quick Start Guide

**Your Setup is Complete!** ✅

This guide shows you exactly how to get everything running.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the Backend

```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-backend
npm install
npm start
# Backend runs on http://localhost:3000
```

**Expected Output:**
```
✓ Server running on port 3000
✓ Database initialized at ./data/mission.db
✓ CORS enabled for tunnel domain
✓ Rate limiting active (100 req/15min)
```

### Step 2: Create Your Account

**Option A: From Terminal**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"tim@example.com","password":"MySecurePassword123"}'
```

**Option B: From iOS App**
- Open Simulator or scan QR code
- Go to Settings tab
- Tap "Register"
- Enter email & password

### Step 3: Test the App

**On Simulator:**
```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-ios/Mission
npm start
# Press `i` to open in iOS Simulator
```

**On iPhone:**
```bash
npm start
# Scan QR code with Camera app
# Opens in Expo Go
```

### Step 4: Verify Connection

Open Settings tab in app:
- Should show 🟢 **Connected** (green)
- Dashboard shows real data (not mock data)

---

## 🔐 Security Summary

**What's Protected:**
- ✅ All API endpoints require JWT token
- ✅ Passwords hashed with bcryptjs
- ✅ Rate limiting prevents brute force (100 req/15min)
- ✅ CORS configured for tunnel only
- ✅ TypeScript for type safety
- ✅ Input validation on all routes

**How Authentication Works:**
1. Register/Login → Get JWT token
2. Token stored in AsyncStorage (secure on iOS)
3. Token sent on every API request
4. Token expires after 1 hour (refresh token extends)
5. Invalid token → 401 Unauthorized

**Remote Access:**
- Your backend is NOT publicly accessible
- Only routable through Cloudflare Tunnel
- Only accessible with valid credentials
- Request logs available for audit

---

## 📱 iOS App Architecture

**API Base URL:**
- Local testing: `http://localhost:3000`
- Remote access: `https://mission-api.elevationaiwork.com` (default)
- Configurable in Settings tab

**Authentication:**
- Tokens stored in AsyncStorage
- Auto-added to all requests
- Auto-refreshed when expired
- Auto-cleared on logout

**Error Handling:**
- Falls back to mock data if backend down
- Shows connection status in Settings
- Logs errors to console for debugging

---

## 📊 API Endpoints Reference

### No Auth Required
```
GET  /api/health
     Status: 200 OK
     Response: { status: "ok", timestamp: "..." }
```

### Auth Required (Token)
```
POST /api/auth/register
  { email: "...", password: "..." }
  Response: { accessToken, refreshToken, userId, email }

POST /api/auth/login
  { email: "...", password: "..." }
  Response: { accessToken, refreshToken, userId, email }

GET  /api/status
     Response: { totalTasks, executingTasks, completedTasks, ... }

GET  /api/tasks
     Response: [ { id, title, status, priority, ... }, ... ]

POST /api/tasks
  { title: "...", description: "...", priority: "..." }
  Response: { id, title, ... }

PATCH /api/tasks/:id
  { status: "completed" }
  Response: { id, title, status, ... }

GET  /api/gap-analysis/scores
     Response: { score, status, timestamp }
```

---

## 🛠️ Troubleshooting

### Backend Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# If something is running, kill it
kill -9 <PID>

# Try again
npm start
```

### iOS App Shows "Disconnected"

```bash
# 1. Verify backend is running
curl http://localhost:3000/api/health

# 2. Check iOS app URL setting (Settings tab)
# Should be: http://localhost:3000 (for local)
# or: https://mission-api.elevationaiwork.com (for remote)

# 3. Verify network connectivity
# iPhone on same WiFi as Mac? Or using tunnel?
```

### Token Errors (401 Unauthorized)

```bash
# 1. Backend needs valid token
# 2. Token expires after 1 hour
# 3. App should auto-refresh, but if stuck:
#    → Go to Settings → Logout → Login again

# 4. Check token in curl:
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tim@example.com","password":"MySecurePassword123"}' \
  | jq -r .accessToken)

curl http://localhost:3000/api/status \
  -H "Authorization: Bearer $TOKEN"
```

### Rate Limited (429)

```bash
# Too many requests in 15 minutes
# Just wait 15 minutes, or:
# 1. Restart backend (clears rate limit)
# 2. Or hit different endpoint (limit is per-IP)
```

### Tunnel Not Working

```bash
# 1. Verify tunnel is running
launchctl list | grep mission-api
# Should show: exit code 0

# 2. Test tunnel connection
curl https://mission-api.elevationaiwork.com/api/health

# 3. Check tunnel logs
tail -50 ~/.openclaw/workspace/.cloudflare-tunnel-mission-api.error.log

# 4. Reload tunnel if needed
launchctl unload ~/Library/LaunchAgents/com.openclaw.cloudflare-tunnel-mission-api.plist
sleep 2
launchctl load ~/Library/LaunchAgents/com.openclaw.cloudflare-tunnel-mission-api.plist
```

---

## 📋 Monitoring

### Check What's Running

```bash
# Backend
lsof -i :3000
# Should show: node running on port 3000

# Tunnel
launchctl list | grep mission-api
# Should show: exit code 0 (running)

# Both together
ps aux | grep -E "node|cloudflared" | grep -v grep
```

### View Logs

```bash
# Backend logs
tail -50 ~/.openclaw/workspace/mission-control-backend/.backend.log

# Tunnel logs
tail -50 ~/.openclaw/workspace/.cloudflare-tunnel-mission-api.error.log

# iOS app logs (if using Xcode)
# Product → Scheme → Diagnostics → System Log
```

### Test Everything

```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. Login
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tim@example.com","password":"MySecurePassword123"}')
TOKEN=$(echo $RESPONSE | jq -r .accessToken)
echo "Token: $TOKEN"

# 3. Get dashboard
curl -s http://localhost:3000/api/status \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Test tunnel
curl -s https://mission-api.elevationaiwork.com/api/health | jq .
```

---

## 🎯 Features Ready to Use

- ✅ User registration (email + password)
- ✅ Login with JWT tokens
- ✅ Dashboard with system stats
- ✅ Task list viewing
- ✅ Task creation & updates
- ✅ Remote access via Cloudflare Tunnel
- ✅ Automatic token refresh
- ✅ Rate limiting protection
- ✅ Full error handling
- ✅ SQLite database (local, no external DB)

---

## 📚 Full Documentation

See these files for complete details:

- **MISSION_CONTROL_SECURITY_SETUP.md** — Security architecture & setup
- **MISSION_CONTROL_TUNNEL_SETUP.md** — Cloudflare tunnel configuration
- **IOS_TEST_REPORT.md** — iOS app testing results

---

## ⚡ You're Ready!

Everything is configured. All endpoints are secure. Your iOS app is tested.

**Next action:** Start the backend and open the app! 🚀

```bash
npm start  # in mission-control-backend directory
```

Questions? Check the logs or the detailed docs above.

---

**Autonomous Setup Completed:** March 20, 2026 @ 11:50 AM EST  
**Status:** ✅ READY FOR USE
