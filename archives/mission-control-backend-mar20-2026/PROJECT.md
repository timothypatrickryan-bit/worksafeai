# Mission Control Backend - Project Summary

## Overview

A production-ready, fully type-safe Node.js/Express backend API for Mission Control dashboard. Built with TypeScript, featuring JWT authentication, SQLite persistence, rate limiting, and comprehensive error handling.

## Project Structure

```
mission-control-backend/
├── src/
│   ├── index.ts           # Express app initialization & startup
│   ├── auth.ts            # JWT & password utilities
│   ├── config.ts          # Configuration & validation
│   ├── database.ts        # SQLite operations
│   ├── logger.ts          # Structured logging
│   ├── middleware.ts      # Express middleware (auth, CORS, rate limit)
│   ├── types.ts           # TypeScript type definitions
│   ├── validation.ts      # Zod schemas & validation
│   ├── routes/
│   │   ├── auth.ts        # /api/auth/* endpoints
│   │   ├── tasks.ts       # /api/tasks/* endpoints
│   │   └── system.ts      # /api/health, /api/status endpoints
│   └── scripts/
│       └── seed.ts        # Database initialization script
├── dist/                  # Compiled JavaScript (generated)
├── data/                  # SQLite database (generated at runtime)
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── README.md              # User documentation
├── QUICKSTART.md          # Quick setup guide
├── DEPLOYMENT.md          # Production deployment guide
└── PROJECT.md             # This file
```

## Key Features

### Authentication & Security ✅
- **JWT-based auth** with access & refresh tokens
- **Bcrypt password hashing** (12 salt rounds, OWASP compliant)
- **Rate limiting** (100 req/15min per IP, configurable)
- **CORS** configured for Cloudflare tunnel domain
- **Input validation** with Zod schemas
- **Error handling** with no sensitive data leakage
- **Environment-based secrets** management

### API Endpoints ✅

**Public:**
- `GET /api/health` - Health check (no auth)

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/refresh` - Refresh expired token

**Protected (require JWT):**
- `GET /api/status` - Dashboard statistics
- `GET /api/gap-analysis/scores` - System health scores
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PATCH /api/tasks/:id` - Update task

### Data Models ✅

**User:**
- `id` (text, PK)
- `email` (text, unique)
- `password_hash` (text)
- `created_at` (timestamp)
- `last_login` (timestamp, nullable)

**Task:**
- `id` (text, PK)
- `title` (text, required)
- `description` (text, optional)
- `status` (pending|executing|completed|failed)
- `priority` (low|medium|high|critical)
- `project` (text)
- `created_at` (timestamp)
- `started_at` (timestamp, nullable)
- `completed_at` (timestamp, nullable)
- `output` (text, nullable)

### Technology Stack ✅

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | ^4.18.2 | Web framework |
| TypeScript | ^5.3.3 | Type safety |
| SQLite3 | ^5.1.6 | Database |
| JWT | ^9.0.0 | Authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| Zod | ^3.22.0 | Validation |
| CORS | ^2.8.5 | Cross-origin support |
| express-rate-limit | ^7.1.5 | Rate limiting |
| tsx | ^4.7.0 | TypeScript runner (dev) |

## Development

### Setup

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

Server runs on `http://localhost:3000`

### Scripts

```bash
npm run dev        # Start with hot reload (tsx watch)
npm run build      # Compile TypeScript to JavaScript
npm run start      # Run compiled production build
npm run seed       # Initialize database with mock data
npm run type-check # Check TypeScript without building
```

### Database

- **Location:** `./data/mission.db` (SQLite)
- **Auto-init:** On first startup
- **Schema:** Created by `initDatabase()` in database.ts
- **Seed data:** 2 users, 6 sample tasks (run `npm run seed`)

## Production

### Deployment Options

1. **Direct VPS** - systemd service or PM2
2. **Docker** - Docker image or docker-compose
3. **Cloudflare Tunnel** - Already configured for mission-api.elevationaiwork.com

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Environment Variables

```env
PORT=3000
NODE_ENV=production
DATABASE_PATH=/var/mission/mission.db
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
CORS_ORIGIN=https://mission-api.elevationaiwork.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Security Checklist

- ✅ Generate secure JWT secrets (use `crypto.randomBytes(32)`)
- ✅ Set `NODE_ENV=production`
- ✅ Enable HTTPS via Cloudflare
- ✅ Configure CORS for your domain
- ✅ Set up automated backups
- ✅ Monitor logs for errors
- ✅ Keep dependencies updated
- ✅ Restrict SSH access
- ✅ Set up rate limiting appropriately
- ✅ Use strong database file permissions

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

## Testing

### Manual Testing (with curl)

1. **Health check:**
```bash
curl http://localhost:3000/api/health
```

2. **Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'
```

3. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'
```

4. **Get Tasks (use token from login):**
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>"
```

## Error Handling

- **Input validation:** 400 Bad Request with field-level errors
- **Authentication:** 401 Unauthorized or 403 Forbidden
- **Not found:** 404 Not Found
- **Conflict:** 409 Conflict (e.g., user already exists)
- **Rate limited:** 429 Too Many Requests
- **Server errors:** 500 Internal Server Error

All errors logged with context (path, method, IP, error details).

## Logging

Structured logging with timestamps and context:
- **debug** - Development details
- **info** - Application events (startup, login, etc.)
- **warn** - Warnings (invalid tokens, etc.)
- **error** - Errors with stack traces

Configure via `LOG_LEVEL` environment variable.

## Configuration

All configuration loaded from environment variables via `config.ts`:
- Server: PORT, NODE_ENV
- Database: DATABASE_PATH
- JWT: Secrets, expiration times
- CORS: Origin domain
- Rate limiting: Window, max requests
- Logging: Level

Validated at startup - missing required vars cause immediate failure.

## Files

- **README.md** - Full documentation & API reference
- **QUICKSTART.md** - 5-minute setup guide
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT.md** - This file (project overview)
- **.env.example** - Configuration template
- **package.json** - Dependencies & scripts
- **tsconfig.json** - TypeScript settings
- **.gitignore** - Git ignore rules

## Performance

- **SQLite:** Suitable for small-medium workloads
- **Rate limiting:** Prevents abuse (100 req/15min per IP)
- **JWT:** Stateless authentication (no session storage)
- **CORS:** Whitelist only trusted domain
- **Logging:** Async, non-blocking

For high-traffic production, consider:
- PostgreSQL instead of SQLite
- Redis for session/cache
- Load balancing
- Database connection pooling

## Known Limitations

1. **SQLite** - Not suitable for concurrent writes at very high volume
2. **Single server** - No built-in clustering (use load balancer)
3. **In-memory cache** - No persistent cache (add Redis if needed)
4. **Email** - No email notifications (would require integration)

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Elasticsearch integration for task search
- [ ] Email notifications
- [ ] Webhook triggers
- [ ] Advanced analytics
- [ ] Team/multi-tenant support
- [ ] Audit logging
- [ ] 2FA support
- [ ] OAuth2 integration
- [ ] GraphQL API

## Support & Troubleshooting

**Q: Database locked error?**
- Ensure only one server instance running
- Check database file permissions

**Q: CORS errors from iOS app?**
- Verify CORS_ORIGIN matches your domain
- Check Cloudflare tunnel routing

**Q: Token expired errors?**
- Use /api/auth/refresh endpoint
- Refresh tokens valid for 7 days

**Q: Rate limit blocking requests?**
- Check request rate (100/15min per IP)
- Adjust RATE_LIMIT_MAX_REQUESTS if needed

**Q: Connection refused?**
- Verify server is running
- Check port (default 3000)
- Verify firewall rules

See [README.md](./README.md) troubleshooting section for more.

## License

MIT

---

**Built for:** Tim Ryan  
**Domain:** mission-api.elevationaiwork.com  
**Created:** March 20, 2026
