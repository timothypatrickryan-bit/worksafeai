# Mission Control Backend - Setup Instructions for Tim

## What You Got

A complete, production-ready Mission Control backend API built with Node.js, Express, and TypeScript. It's secure, fast, and ready to serve your iOS app through Cloudflare tunnel at `mission-api.elevationaiwork.com`.

## Files & Folders

```
mission-control-backend/
├── src/                    # TypeScript source code (12 files)
├── dist/                   # Compiled JavaScript (ready to run)
├── node_modules/           # Dependencies (installed)
├── data/                   # SQLite database (created when you seed)
├── package.json            # Dependencies list
├── .env.example            # Configuration template
├── README.md               # Full API documentation
├── QUICKSTART.md           # 5-minute setup guide
├── DEPLOYMENT.md           # Production deployment guide
├── PROJECT.md              # Project overview
└── This file               # Quick reference
```

## Quick Start (2 minutes)

```bash
cd /Users/timothyryan/.openclaw/workspace/mission-control-backend

# 1. Copy configuration
cp .env.example .env

# 2. Initialize database with test data
npm run seed

# 3. Start the server
npm run dev
```

**Server will run on:** `http://localhost:3000`

**Test endpoint:**
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-03-20T...",
    "uptime": 12.345
  }
}
```

## Login & Test API

### 1. Login (get token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tim@elevationaiwork.com",
    "password": "SecurePassword123"
  }'
```

Copy the `token` value from the response.

### 2. Get Your Tasks
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <paste-token-here>"
```

### 3. Get Dashboard Stats
```bash
curl http://localhost:3000/api/status \
  -H "Authorization: Bearer <paste-token-here>"
```

## What's Built In

✅ **User Authentication**
- Register new users: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Refresh token: `POST /api/auth/refresh`

✅ **Task Management**
- List tasks: `GET /api/tasks`
- Create task: `POST /api/tasks`
- Get one task: `GET /api/tasks/:id`
- Update task: `PATCH /api/tasks/:id`

✅ **Dashboard**
- Status: `GET /api/status` (task counts, system health)
- Gap Analysis: `GET /api/gap-analysis/scores` (completion rates)
- Health: `GET /api/health` (no auth required)

✅ **Security**
- JWT token authentication
- Password hashing (bcrypt)
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation (Zod)
- CORS configured for your domain

## Configuration

The `.env` file controls everything:

```env
PORT=3000                    # Server port
NODE_ENV=development         # or "production"
DATABASE_PATH=./data/mission.db  # SQLite location
JWT_SECRET=<your-secret>     # Keep secret!
JWT_REFRESH_SECRET=<your-secret> # Keep secret!
CORS_ORIGIN=https://mission-api.elevationaiwork.com
```

**For production**, generate new secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database

- **Type:** SQLite (file-based, no server needed)
- **Location:** `./data/mission.db` (auto-created)
- **Schema:** Users & Tasks tables (auto-created)
- **Test data:** Run `npm run seed` to add sample data

## Project Commands

```bash
npm run dev        # Start server with hot reload (development)
npm run build      # Compile TypeScript to JavaScript
npm run start      # Run compiled version (production)
npm run seed       # Initialize database with test data
npm run type-check # Verify TypeScript types
```

## Connecting Your iOS App

1. **Configure Cloudflare Tunnel**
   - Tunnel: `mission-api.elevationaiwork.com`
   - Points to: `localhost:3000` (or your VPS IP:3000)
   - TLS: Enabled

2. **In iOS App**
   - API URL: `https://mission-api.elevationaiwork.com`
   - All endpoints under `/api/`
   - Example: `https://mission-api.elevationaiwork.com/api/tasks`

3. **Authentication**
   - Login to get JWT token
   - Include in all requests: `Authorization: Bearer <token>`

## File Structure

### Source Code (TypeScript)
- `src/index.ts` - Main server file
- `src/auth.ts` - JWT & password utilities
- `src/config.ts` - Configuration
- `src/database.ts` - SQLite operations
- `src/middleware.ts` - Express middleware
- `src/validation.ts` - Input validation schemas
- `src/logger.ts` - Structured logging
- `src/types.ts` - TypeScript types
- `src/routes/` - API endpoints

### Documentation
- `README.md` - Complete API reference
- `QUICKSTART.md` - Quick setup (5 min)
- `DEPLOYMENT.md` - Production setup
- `PROJECT.md` - Technical overview

## Test Users (after seed)

| Email | Password | Purpose |
|-------|----------|---------|
| tim@elevationaiwork.com | SecurePassword123 | Main user |
| test@example.com | TestPassword123 | Testing |

## Deployment

When ready for production, see **DEPLOYMENT.md**:
- VPS with systemd service
- Docker/docker-compose
- Cloudflare tunnel direct

## Troubleshooting

**Q: "Port 3000 already in use"**
```bash
# Kill the process using port 3000
lsof -i :3000
kill -9 <PID>
```

**Q: Database errors**
```bash
# Reset database
rm -rf data/
npm run seed
```

**Q: TypeScript errors**
```bash
# Check types
npm run type-check
```

**Q: Module not found**
```bash
# Reinstall deps
rm -rf node_modules package-lock.json
npm install
```

## What Comes Next

1. ✅ **Test locally** - Run `npm run dev` and test endpoints
2. ✅ **Connect iOS app** - Configure Cloudflare tunnel
3. ✅ **Test integration** - Hit API from your iOS app
4. ✅ **Go to production** - Follow DEPLOYMENT.md
5. ✅ **Monitor** - Check logs, set up alerts

## Key Files to Remember

- **Configuration:** `.env` (generate new secrets for production)
- **Database:** `data/mission.db` (back this up)
- **Routes:** `src/routes/` (add new endpoints here)
- **Types:** `src/types.ts` (define data models here)
- **Validation:** `src/validation.ts` (update schemas here)

## Documentation Map

| Doc | Use For |
|-----|---------|
| **README.md** | Full API reference, all endpoints, errors |
| **QUICKSTART.md** | 5-minute setup, basic testing |
| **DEPLOYMENT.md** | Production setup, systemd/Docker/PM2 |
| **PROJECT.md** | Technical details, architecture |
| This file | Quick reference for Tim |

## Support

All the code is:
- ✅ Type-safe (TypeScript)
- ✅ Well-documented (comments in code)
- ✅ Production-ready (error handling, logging)
- ✅ Secure (JWT, rate limiting, validation)

If something breaks, check:
1. Error messages in terminal/logs
2. Relevant documentation file (README, QUICKSTART, etc.)
3. Configuration in `.env`
4. Database permissions
5. Node/npm versions

## Summary

You have a complete backend API:
- **Ready to run:** `npm run dev`
- **Ready to test:** Seed database, use curl/Postman
- **Ready to deploy:** Follow DEPLOYMENT.md
- **Ready to integrate:** Connect your iOS app

Everything is documented. Enjoy! 🚀
