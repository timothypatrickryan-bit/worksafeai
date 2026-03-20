# Quick Start Guide

Get Mission Control Backend running in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment

```bash
cp .env.example .env
```

The `.env` file is pre-configured for development. For production, generate secure secrets:

```bash
# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Initialize Database

```bash
npm run seed
```

This creates the SQLite database and populates it with:
- 2 test users (tim@elevationaiwork.com, test@example.com)
- 6 sample tasks in various states

Test credentials:
- Email: `tim@elevationaiwork.com`
- Password: `SecurePassword123`

## Step 4: Start the Server

**Development (with hot reload):**
```bash
npm run dev
```

**Production (compiled):**
```bash
npm run build
npm start
```

Server runs on `http://localhost:3000`

## Step 5: Test the API

### Health Check (no auth required)
```bash
curl http://localhost:3000/api/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tim@elevationaiwork.com",
    "password": "SecurePassword123"
  }'
```

This returns a token. Save it as `TOKEN`.

### Get Tasks (requires token)
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Get Status
```bash
curl http://localhost:3000/api/status \
  -H "Authorization: Bearer $TOKEN"
```

### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Task",
    "description": "A test task",
    "priority": "high",
    "project": "TestProject"
  }'
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/status` | Yes | Dashboard stats |
| GET | `/api/gap-analysis/scores` | Yes | System health |
| GET | `/api/tasks` | Yes | List tasks |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/:id` | Yes | Get task |
| PATCH | `/api/tasks/:id` | Yes | Update task |

## Test Users (after seed)

| Email | Password | Purpose |
|-------|----------|---------|
| tim@elevationaiwork.com | SecurePassword123 | Main user |
| test@example.com | TestPassword123 | Testing |

## Common Tasks

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "NewPassword123"
  }'
```

Password requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Update a Task
Get the task ID first, then:
```bash
curl -X PATCH http://localhost:3000/api/tasks/{task_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "executing",
    "started_at": "2024-03-20T12:00:00.000Z"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refresh_token_from_login}"
  }'
```

## Troubleshooting

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

**Database errors:**
```bash
# Reset database
rm -rf data/
npm run seed
```

**TypeScript errors:**
```bash
npm run type-check
```

**Dependencies issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check environment variables in `.env`
- Review security checklist in README
- Set up CORS for your Cloudflare tunnel domain
- Deploy to production with proper secrets

## Support

All endpoints follow REST conventions. Errors return JSON with `success: false` and `error` message.

For detailed API documentation, see [README.md](./README.md).
