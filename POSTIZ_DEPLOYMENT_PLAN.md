# 🚀 Postiz Open Source Deployment Plan

**Status:** Ready for Setup  
**Repository:** `/Users/timothyryan/.openclaw/workspace/postiz-open-source` (cloned)  
**License:** AGPL-3.0 (100% free)  
**Cost:** $0 (self-hosted)

---

## 📋 What We Have

✅ **Source Code:** Cloned from GitHub (gitroomhq/postiz-app)  
✅ **Monorepo:** Pnpm workspaces (NextJS + NestJS)  
✅ **Tech Stack:** 
- Frontend: NextJS (React)
- Backend: NestJS
- Database: PostgreSQL (via Prisma)
- Cache: Redis
- Job Queue: Temporal

✅ **LinkedIn Writer:** Already generating daily posts @ 8 AM

---

## 🔧 What We Need to Deploy

### **Database: PostgreSQL**
```bash
# Option 1: Local PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Option 2: Docker PostgreSQL
docker run -d \
  --name postiz-db \
  -e POSTGRES_USER=postiz-user \
  -e POSTGRES_PASSWORD=postiz-password \
  -e POSTGRES_DB=postiz-db-local \
  -p 5432:5432 \
  postgres:15
```

### **Cache: Redis**
```bash
# Option 1: Local Redis (macOS)
brew install redis
brew services start redis

# Option 2: Docker Redis
docker run -d \
  --name postiz-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### **Environment Variables (.env)**
```bash
# Core
DATABASE_URL="postgresql://postiz-user:postiz-password@localhost:5432/postiz-db-local"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secure-random-string-here-make-it-long"

# URLs
FRONTEND_URL="http://localhost:4200"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
BACKEND_INTERNAL_URL="http://localhost:3000"

# LinkedIn OAuth (get from LinkedIn Developer)
LINKEDIN_CLIENT_ID="your-client-id"
LINKEDIN_CLIENT_SECRET="your-client-secret"

# Storage (local is fine for self-hosted)
STORAGE_PROVIDER="local"
UPLOAD_DIRECTORY="./uploads"
NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY="/uploads"

# Optional but recommended
OPENAI_API_KEY="sk-..." # For AI features
IS_GENERAL="true"
```

---

## 📦 Installation Steps

### **Step 1: Install Dependencies**
```bash
cd /Users/timothyryan/.openclaw/workspace/postiz-open-source

# Install pnpm (if not already installed)
npm install -g pnpm@9

# Install all dependencies
pnpm install
```

### **Step 2: Setup Environment**
```bash
# Copy example env and fill in values
cp .env.example .env

# Edit .env with:
# - Database credentials
# - URLs (localhost for dev, your domain for prod)
# - LinkedIn OAuth credentials
```

### **Step 3: Database Migrations**
```bash
# Run Prisma migrations
pnpm run db:migrate

# Seed database (optional)
pnpm run db:seed
```

### **Step 4: Build & Start**
```bash
# Development mode (hot reload)
pnpm run dev

# This starts:
# - Frontend: http://localhost:4200
# - Backend API: http://localhost:3000
# - Dashboard: http://localhost:4200
```

---

## 🔐 LinkedIn OAuth Setup

1. **Go to:** https://www.linkedin.com/developers/apps
2. **Create New App:**
   - Name: "Postiz LinkedIn Integration"
   - Company: Your company name
3. **Get Credentials:**
   - Client ID → `LINKEDIN_CLIENT_ID`
   - Client Secret → `LINKEDIN_CLIENT_SECRET`
4. **Set Redirect URI:**
   - Add: `http://localhost:3000/api/callback/linkedin` (for dev)
   - Add: `https://your-domain.com/api/callback/linkedin` (for prod)
5. **Request Access:**
   - Sign in with LinkedIn Product Access
   - Request `Sign In with LinkedIn` + `Share on LinkedIn`

---

## 🤖 Automation Integration

Once deployed, create workflow to auto-post your daily LinkedIn content:

### **Option A: Postiz REST API**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your post text",
    "platforms": ["LINKEDIN"],
    "scheduleTime": "2026-04-04T08:01:00Z"
  }'
```

### **Option B: N8N Workflow (Built-in)**
- Postiz has N8N integration
- Create workflow: Read `.linkedin-post-*.txt` → Post to Postiz API

### **Option C: Direct Database Insert** (For automation)
```sql
INSERT INTO posts (content, platform, scheduled_at, user_id)
VALUES ('Your post content', 'LINKEDIN', NOW(), 1);
```

---

## 🚀 Deployment Checklist

- [ ] PostgreSQL running locally or Docker
- [ ] Redis running locally or Docker
- [ ] `.env` file configured
- [ ] `pnpm install` completed
- [ ] `pnpm run db:migrate` completed
- [ ] `pnpm run dev` starts successfully
- [ ] Frontend loads at http://localhost:4200
- [ ] LinkedIn OAuth configured
- [ ] First test post created & scheduled
- [ ] Auto-posting workflow created

---

## 📊 Features Available (After Setup)

✅ Schedule posts to 28+ platforms (LinkedIn, Twitter, Facebook, TikTok, Instagram, etc.)  
✅ Bulk scheduling & team collaboration  
✅ Analytics & engagement tracking  
✅ AI-powered post suggestions  
✅ Hashtag recommendations  
✅ Multi-account management  
✅ REST API for automation  
✅ N8N integration  
✅ Webhooks & integrations  

---

## 💾 Data Persistence

```bash
# Database persists in PostgreSQL
# User data, posts, schedules = permanent storage

# If using Docker:
docker volume create postiz-db-data
# Add to docker-compose.yaml for persistence
```

---

## 🔧 Troubleshooting

### Build Errors
```bash
# Clean install
rm -rf node_modules
pnpm install
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
psql -U postiz-user -d postiz-db-local -c "SELECT 1"

# Verify Redis
redis-cli ping
```

### Port Conflicts
```bash
# If ports 4200/3000 are in use, edit apps/*/package.json
# Change PORT=4200 to PORT=4201, etc.
```

---

## 📝 Next Steps

**To start deployment, you need:**
1. ✅ PostgreSQL or Docker installed
2. ✅ Redis or Docker installed
3. ✅ LinkedIn Developer account created
4. ✅ LinkedIn OAuth credentials

**Timeline:**
- Setup: ~30 minutes
- Testing: ~15 minutes
- Automation setup: ~20 minutes
- **Total: ~1 hour for full deployment**

**Want me to proceed?** Just confirm:
1. Will you use Docker or local PostgreSQL/Redis?
2. Do you have LinkedIn Developer credentials ready?
3. Should I set up the automation workflow after deployment?

---

## 🎯 Long-term Automation

Once deployed, the workflow:
```
Daily @ 8:00 AM:
  1. LinkedIn Writer generates post
  2. Save to .linkedin-post-2026-04-XX.txt

Daily @ 8:01 AM:
  1. Read .linkedin-post-2026-04-XX.txt
  2. Post via Postiz API to LinkedIn
  3. Schedule for optimal posting time
  4. Track engagement in dashboard
```

**No manual copying needed — fully automated! 🤖**

---

**Repository:** https://github.com/gitroomhq/postiz-app  
**Docs:** https://docs.postiz.com  
**Discord:** https://discord.postiz.com  
**License:** AGPL-3.0 (Free, Open Source)
