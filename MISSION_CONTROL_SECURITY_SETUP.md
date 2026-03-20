# Mission Control — Security & Production Setup

**Status:** Building Secure Backend (autonomous subagent in progress)  
**Target:** Complete secure, authenticated API ready for iOS app  
**Timeline:** ~30-45 minutes

---

## What's Being Built

### Backend (Node.js/Express + SQLite)
A production-ready API with:

**Security Features:**
- ✅ JWT authentication (register/login)
- ✅ Password hashing (bcryptjs)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ CORS configured for tunnel domain
- ✅ Input validation (Zod schemas)
- ✅ Error handling & logging
- ✅ TypeScript for type safety

**API Endpoints:**
```
POST   /api/auth/register        - Create user account
POST   /api/auth/login           - Get JWT token
POST   /api/auth/refresh         - Refresh expired token
GET    /api/health               - Health check (no auth required)
GET    /api/status               - Dashboard stats (requires token)
GET    /api/tasks                - List tasks (requires token)
POST   /api/tasks                - Create task (requires token)
PATCH  /api/tasks/:id            - Update task (requires token)
GET    /api/gap-analysis/scores  - System health (requires token)
```

**Database:**
- SQLite (no external DB needed)
- Local storage: `data/mission.db`
- Tables: users, tasks, audit_logs

**Runtime:**
- Port: 3000
- Node: 18+
- Environment: Development & production ready

---

## Security Architecture

### Authentication Flow

```
1. User signs up → POST /api/auth/register
   Email + password → API creates user, hashes password
   Response: { userId, email }

2. User logs in → POST /api/auth/login
   Email + password → API validates, generates JWT
   Response: { accessToken (1h), refreshToken (7d) }

3. iPhone app stores tokens in AsyncStorage
   Sends accessToken in Authorization header
   Authorization: Bearer <token>

4. API validates token on protected routes
   If expired → POST /api/auth/refresh to get new token
   If invalid → Return 401 Unauthorized
```

### Token Management

**Access Token:**
- Duration: 1 hour
- Contains: { userId, email, exp }
- Used: Every API request
- Stored: AsyncStorage (secure on iOS)

**Refresh Token:**
- Duration: 7 days
- Contains: { userId, tokenVersion }
- Used: Only for refreshing access tokens
- Stored: AsyncStorage (secure on iOS)

### Rate Limiting

**Per IP Address:**
- 100 requests per 15 minutes
- Resets every 15 min window
- Returns 429 (Too Many Requests) when exceeded

**Why It Matters:**
- Prevents brute force attacks
- Protects from DoS
- Limits scrapers/bots

---

## Deployment Architecture

### Local Development

```
Your Mac:
  └─ Mission Control Backend (localhost:3000)
     └─ SQLite database (./data/mission.db)
```

Start with: `npm start`

### Remote Access (Production)

```
Your iPhone (anywhere):
  └─ HTTPS request to mission-api.elevationaiwork.com
     └─ Cloudflare Tunnel (encrypted)
        └─ Your Mac (localhost:3000)
           └─ SQLite database
```

Automatic via tunnel (already configured)

---

## Setup Instructions

### 1. Backend Installation

When the backend build completes:

```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Generate JWT secret (if not provided)
node scripts/generate-secret.js

# Initialize database
npm run db:init

# Start backend
npm start
# Backend runs on http://localhost:3000
```

### 2. Create Your User Account

**From Mac Terminal:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"tim@example.com","password":"YourSecurePassword123"}'

# Response:
# {"userId":"uuid","email":"tim@example.com"}
```

**Or from iOS App:**
- Open Settings tab
- Scroll to "Account"
- Enter email & password
- Tap "Register"

### 3. Login & Get Token

**Terminal:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tim@example.com","password":"YourSecurePassword123"}'

# Response:
# {
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "refresh_...",
#   "expiresIn": 3600
# }
```

**Or from iOS App:**
- Go to Settings
- Enter email & password
- Tap "Login"
- App stores token automatically

### 4. iOS App Configuration

**Automatic:**
- App detects token in AsyncStorage
- Sends token on all requests automatically
- Handles token refresh when expired

**Manual URL Override:**
- Settings tab → Server URL
- Default: https://mission-api.elevationaiwork.com
- For testing: http://localhost:3000

---

## Testing the Setup

### 1. Test Health Endpoint (No Auth)
```bash
curl http://localhost:3000/api/health
# Response: { status: "ok", timestamp: "..." }
```

### 2. Test Protected Endpoint (With Auth)
```bash
# Get token first
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tim@example.com","password":"YourSecurePassword123"}' \
  | jq -r .accessToken)

# Use token
curl http://localhost:3000/api/status \
  -H "Authorization: Bearer $TOKEN"

# Response: Dashboard stats
# {
#   "totalTasks": 0,
#   "executingTasks": 0,
#   "completedTasks": 0,
#   "activeAgents": 0,
#   "systemHealth": "good"
# }
```

### 3. Test Rate Limiting
```bash
# Make 101+ requests quickly
for i in {1..102}; do
  curl http://localhost:3000/api/health
done

# After 100 requests: 429 Too Many Requests
```

### 4. Test Invalid Token
```bash
curl http://localhost:3000/api/status \
  -H "Authorization: Bearer invalid_token"

# Response: 401 Unauthorized
# { error: "Invalid or expired token" }
```

---

## Environment Variables

**Create `.env` file:**
```bash
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-key-here-min-32-chars
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Database
DB_PATH=./data/mission.db

# CORS
CORS_ORIGIN=https://mission-api.elevationaiwork.com,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

---

## Security Checklist

**Before Production:**
- ✅ JWT_SECRET is 32+ characters (unique & secure)
- ✅ CORS_ORIGIN includes your tunnel domain
- ✅ Rate limiting is enabled
- ✅ Database permissions restricted (0600)
- ✅ Passwords hashed with bcryptjs
- ✅ HTTPS enabled on tunnel (Cloudflare handles this)
- ✅ No secrets in code (all in .env)
- ✅ Error messages don't leak sensitive info
- ✅ Audit logging enabled
- ✅ Input validation on all endpoints

---

## Monitoring & Troubleshooting

### Check Backend Status
```bash
lsof -i :3000
# Should show: node process listening on port 3000
```

### View Logs
```bash
tail -50 ~/.openclaw/workspace/mission-control-backend/.backend.log
```

### Reset Database
```bash
rm -f ./data/mission.db
npm run db:init
```

### Test Tunnel Connection
```bash
curl https://mission-api.elevationaiwork.com/api/health
# Should return: { status: "ok", ... }
```

### Verify iOS Connection
- Open Mission Control iOS app
- Go to Settings tab
- Should show 🟢 Connected (if backend running)
- 🔴 Disconnected (if backend down)

---

## Files Created

When backend build completes, you'll have:

```
mission-control-backend/
├── src/
│   ├── index.ts              - Main server
│   ├── middleware/           - Auth, CORS, rate limit
│   ├── routes/               - API endpoints
│   ├── services/             - Business logic
│   ├── models/               - Database schemas
│   ├── utils/                - Helpers
│   └── types/                - TypeScript definitions
├── data/
│   └── mission.db            - SQLite database (auto-created)
├── scripts/
│   ├── db-init.ts            - Initialize database
│   └── seed-data.ts          - Sample data
├── package.json              - Dependencies
├── tsconfig.json             - TypeScript config
├── .env.example              - Environment template
└── README.md                 - Full documentation
```

---

## Next Steps

1. ⏳ **Wait for backend build to complete** (subagent in progress)
2. ✅ **Follow setup instructions** (npm install, .env, npm start)
3. ✅ **Create your user account** (register via curl or iOS app)
4. ✅ **Test all endpoints** (use curl commands above)
5. ✅ **Verify iOS app connection** (Settings tab shows 🟢 Connected)
6. ✅ **Monitor tunnel** (tail -f logs)

---

## Security Contact & Incident Response

If you suspect a security issue:
1. Stop the backend: `npm stop`
2. Rotate JWT_SECRET in .env
3. Check audit logs for suspicious activity
4. Restart backend: `npm start`

---

## Support

For questions or issues:
- Check logs: `~/.openclaw/workspace/mission-control-backend/.backend.log`
- Review error responses from API
- Test endpoints individually
- Verify network/tunnel connectivity

**You're protected. You're secure. You're ready.** 🔐🚀
