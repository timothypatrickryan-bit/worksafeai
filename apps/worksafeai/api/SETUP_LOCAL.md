# Local Development Setup

## Prerequisites

- Node.js 18+ (use `node --version`)
- npm 9+ (use `npm --version`)
- Supabase account (free tier at https://supabase.com)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up / sign in
2. Create new project:
   - Name: `jtsa-dev`
   - Database Password: Save securely
   - Region: Choose closest to you
3. Wait for project to initialize (~2 min)
4. Go to **Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `anon` key → `SUPABASE_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Setup Database Schema

1. Go to Supabase **SQL Editor**
2. Copy entire contents of `src/db/schema.sql`
3. Paste into SQL editor
4. Click **Run**
5. Wait for tables to be created (~30 sec)

## Step 3: Install Dependencies

```bash
cd jtsa-backend
npm install
```

## Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Supabase (from Step 1)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT (use any long random string for development)
JWT_SECRET=your-random-secret-key-make-it-long
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# OpenAI (get API key from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-api-key

# Email (optional for local dev, use SendGrid or SMTP)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-key-or-leave-blank
# OR use SMTP:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Server
PORT=3000
NODE_ENV=development
```

## Step 5: Start Server

```bash
npm start
```

Expected output:
```
JTSA Backend running on port 3000
```

## Step 6: Test API (Optional)

### Register a Company

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "Password123!",
    "fullName": "John Doe",
    "companyName": "Test Company"
  }'
```

Save the `accessToken` from response.

### Create a Project

```bash
curl -X POST http://localhost:3000/api/companies/:companyId/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "name": "Test Project",
    "description": "Testing the API"
  }'
```

(Replace `:companyId` from register response, and `<accessToken>` with token from step 1)

## Useful Commands

### Run in Development Mode (with auto-reload)

```bash
npm install -g nodemon
npm run dev
```

### Check Syntax

```bash
node -c src/server.js
```

### View Database (Supabase UI)

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Browse tables (companies, users, projects, jtsas, etc.)

### View Logs

Server logs print to console. For persistent logs, redirect to file:

```bash
npm start > logs/server.log 2>&1 &
```

## Troubleshooting

### "SUPABASE_URL is missing"
Check `.env` file has `SUPABASE_URL=https://...`

### "Invalid Supabase key"
Make sure you used the **service_role** key, not **anon** key, for `SUPABASE_SERVICE_ROLE_KEY`

### "OpenAI API Error"
Verify `OPENAI_API_KEY` is correct from https://platform.openai.com/api-keys and has $ credit

### "Port 3000 already in use"
Change `PORT` in `.env` or kill existing process: `lsof -i :3000`

### "Email not sending"
- For SendGrid: verify API key in Supabase
- For SMTP: use app-specific password for Gmail (not account password)
- For local dev: leave EMAIL_PROVIDER blank, emails log to console

## Next Steps

1. Create a React web frontend (Week 2-3)
2. Build React Native mobile app (Week 3-4)
3. Deploy to production (Week 5)
4. Set up CI/CD pipeline

See `WEEK1_STATUS.md` for detailed progress and `ENDPOINTS.md` for full API reference.
