# Mission Control Backend API

Production-ready backend API for Mission Control dashboard with JWT authentication, rate limiting, and SQLite database.

## Features

✅ **Security**
- JWT-based authentication (access + refresh tokens)
- bcrypt password hashing (12 salt rounds)
- Rate limiting (100 requests per 15 minutes per IP)
- CORS configured for Cloudflare tunnel
- Input validation with Zod schemas
- Secure error handling with no data leaks

✅ **Core Functionality**
- User registration and login
- Task management (CRUD)
- Dashboard statistics
- Gap analysis and system health scores
- Health check endpoint

✅ **Production Ready**
- TypeScript with strict type checking
- Structured logging with levels
- Graceful shutdown handling
- Comprehensive error handling
- SQLite with async database operations
- Environment variable configuration
- Request/response logging

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd mission-control-backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Generate secure secrets (for production):
```bash
# In Node REPL or your terminal:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

3. Update `.env` with your values:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-generated-secret
JWT_REFRESH_SECRET=your-generated-secret
CORS_ORIGIN=https://mission-api.elevationaiwork.com
```

### Database Setup

Initialize the database and seed with mock data:

```bash
npm run seed
```

This creates the SQLite database and populates it with sample users and tasks.

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "abc123...",
      "email": "user@example.com"
    }
  },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

**Validation:**
- Email: Valid email format
- Password: Minimum 8 characters, must include uppercase, lowercase, and number

#### POST /api/auth/login
Login and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "abc123...",
      "email": "user@example.com"
    }
  },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

#### POST /api/auth/refresh
Refresh an expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "abc123...",
      "email": "user@example.com"
    }
  },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

### Health & Status Endpoints

#### GET /api/health
Health check (no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-03-20T12:00:00.000Z",
    "uptime": 1234.567
  }
}
```

#### GET /api/status
Dashboard statistics (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTasks": 12,
    "executingTasks": 2,
    "completedTasks": 8,
    "activeAgents": 1,
    "systemHealth": 95
  },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

#### GET /api/gap-analysis/scores
System health scores (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overallHealth": 85,
    "executionRate": 25,
    "completionRate": 75,
    "activeAgents": 1,
    "timestamp": "2024-03-20T12:00:00.000Z"
  }
}
```

### Task Endpoints

All task endpoints require authentication (`Authorization: Bearer {token}`).

#### GET /api/tasks
List all tasks.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123...",
      "title": "Deploy WorkSafeAI",
      "description": "Deploy to production",
      "status": "completed",
      "priority": "high",
      "project": "WorkSafeAI",
      "created_at": "2024-03-15T10:00:00.000Z",
      "started_at": "2024-03-15T11:00:00.000Z",
      "completed_at": "2024-03-15T14:00:00.000Z",
      "output": "Deployed successfully"
    }
  ],
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

#### POST /api/tasks
Create a new task.

**Request:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "project": "ProjectName"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "xyz789...",
    "title": "New Task",
    "description": "Task description",
    "status": "pending",
    "priority": "high",
    "project": "ProjectName",
    "created_at": "2024-03-20T12:00:00.000Z",
    "started_at": null,
    "completed_at": null,
    "output": null
  },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

#### GET /api/tasks/:id
Get a single task by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "abc123...",
    "title": "Deploy WorkSafeAI",
    "description": "Deploy to production",
    "status": "completed",
    "priority": "high",
    "project": "WorkSafeAI",
    "created_at": "2024-03-15T10:00:00.000Z",
    "started_at": "2024-03-15T11:00:00.000Z",
    "completed_at": "2024-03-15T14:00:00.000Z",
    "output": "Deployed successfully"
  },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

#### PATCH /api/tasks/:id
Update a task.

**Request:**
```json
{
  "status": "executing",
  "started_at": "2024-03-20T12:00:00.000Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "abc123...",
    "title": "Deploy WorkSafeAI",
    "description": "Deploy to production",
    "status": "executing",
    "priority": "high",
    "project": "WorkSafeAI",
    "created_at": "2024-03-15T10:00:00.000Z",
    "started_at": "2024-03-20T12:00:00.000Z",
    "completed_at": null,
    "output": null
  },
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

## Task Status & Priority

**Status values:**
- `pending` - Not yet started
- `executing` - Currently in progress
- `completed` - Finished successfully
- `failed` - Failed execution

**Priority values:**
- `low`
- `medium`
- `high`
- `critical`

## Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

**Common status codes:**
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (token expired)
- `404` - Not found
- `409` - Conflict (e.g., user already exists)
- `429` - Too many requests (rate limited)
- `500` - Internal server error

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Exempt:** Health check endpoint
- **Header:** `RateLimit-*` included in responses

## Database

SQLite database stored at `./data/mission.db`

### Schema

**Users Table:**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login TEXT
)
```

**Tasks Table:**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  project TEXT NOT NULL,
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  output TEXT
)
```

## Cloudflare Tunnel Setup

For remote access via `mission-api.elevationaiwork.com`:

1. Ensure tunnel is configured in Cloudflare
2. Point tunnel to `localhost:3000`
3. Update `CORS_ORIGIN` in `.env` to match your domain
4. Restart the server

## Logging

Logging levels: `debug`, `info`, `warn`, `error`

Configure via `LOG_LEVEL` environment variable:
```env
LOG_LEVEL=info
```

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Initialize database with mock data
- `npm run type-check` - Check TypeScript types

## Security Checklist

- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS via Cloudflare tunnel
- [ ] Keep dependencies updated
- [ ] Monitor logs for errors
- [ ] Use strong passwords in tests
- [ ] Rotate tokens regularly
- [ ] Back up database regularly

## Deployment

### Docker (Optional)

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Environment Variables for Production

```env
PORT=3000
NODE_ENV=production
DATABASE_PATH=/data/mission.db
JWT_SECRET=<secure-random-string>
JWT_REFRESH_SECRET=<secure-random-string>
CORS_ORIGIN=https://mission-api.elevationaiwork.com
LOG_LEVEL=info
```

## Troubleshooting

**Database locked error:**
- Ensure only one instance of the server is running
- Check file permissions on data directory

**CORS errors:**
- Verify `CORS_ORIGIN` matches your iOS app's origin
- Check Cloudflare tunnel configuration

**Rate limiting blocking requests:**
- Check if IP is within rate limit (100/15min)
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed

**Token expired:**
- Use refresh endpoint to get new access token
- Refresh tokens valid for 7 days

## License

MIT

## Support

For issues, check logs with `LOG_LEVEL=debug` or contact Tim Ryan.
