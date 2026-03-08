# WorkSafeAI Local Development Quickstart

Get the full app running locally in 15 minutes.

---

## ✅ Prerequisites

- Node.js 18+ (`node --version`)
- PostgreSQL running (or Supabase account)
- Git
- An Anthropic API key (for AI hazards)
- A Gmail app password (for email)

---

## 🚀 START HERE

### Step 1: Clone & Setup (2 minutes)

```bash
cd /Users/timothyryan/.openclaw/workspace

# Backend
cd apps/worksafeai/api
cp .env.example .env.development
# Edit .env.development with your secrets:
# - ANTHROPIC_API_KEY
# - DATABASE_URL (Supabase or local PostgreSQL)
# - SMTP_PASS (Gmail app password)

# Frontend
cd ../web
cp .env.example .env.development
# Set VITE_API_BASE_URL=http://localhost:3000

# SuperAdmin
cd ../../../apps/super-admin
cp .env.example .env.development
# Set VITE_API_BASE_URL=http://localhost:3000
```

### Step 2: Install Dependencies (3 minutes)

```bash
# Backend
cd apps/worksafeai/api
npm install

# Frontend
cd ../web
npm install

# SuperAdmin
cd ../../../apps/super-admin
npm install
```

### Step 3: Start Services (5 minutes)

**Terminal 1 - Backend:**
```bash
cd apps/worksafeai/api
npm run dev
# Should output: "Server running on http://localhost:3000"
```

**Terminal 2 - Frontend:**
```bash
cd apps/worksafeai/web
npm run dev
# Should output: "Local: http://localhost:5173"
```

**Terminal 3 - SuperAdmin:**
```bash
cd apps/super-admin
npm run dev
# Should output: "Local: http://localhost:5174"
```

---

## 🧪 Test Everything

### Test 1: Backend Health

```bash
curl http://localhost:3000/health
# Expected: { "status": "ok" }
```

### Test 2: Create Account

1. Visit http://localhost:5173
2. Click "Sign Up"
3. Fill in:
   - Email: test@example.com
   - Password: TestPassword123!
   - Full Name: Test User
   - Company: Test Company
4. Click "Register"
5. You should be redirected to onboarding

### Test 3: Complete Onboarding

1. Step 1: Select industry (e.g., Telecommunications), company size, years
2. Step 2: Safety profile (certifications, compliance)
3. Step 3: Operations (work types auto-populate)
4. Step 4: Safety priorities (concerns, risk tolerance)
5. Click "Complete Onboarding"
6. You should see the dashboard

### Test 4: Create JTSA

1. Click "Create JTSA" on dashboard
2. Enter task description: "Operating forklift in warehouse with heavy loads"
3. Click "Generate Hazards"
4. Wait for AI to generate hazards
5. Verify hazards appear (Low/Medium/High/Critical severity)
6. Click "Complete JTSA"

### Test 5: SuperAdmin Dashboard

1. Visit http://localhost:5174
2. Login with:
   - Email: admin@example.com
   - Password: password
3. Click "Companies"
4. You should see your test company listed
5. Click the company name to view details
6. Click "Edit" to modify company info
7. Test pagination (if 20+ companies)
8. Test search (search for "Test")

### Test 6: Export Data

1. In SuperAdmin, go to Companies list
2. Click "Export"
3. Download should start (CSV file)
4. Open file in spreadsheet app
5. Verify data is correct

---

## 🔍 Verify Each Component

### Backend API Endpoints

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!","fullName":"Test","companyName":"Test Co"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'

# Get dashboard (requires JWT token from login)
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/dashboard

# List companies (admin)
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/admin/companies
```

### Frontend Features

- [ ] Login/Register pages load
- [ ] Forms validate correctly
- [ ] Onboarding wizard works
- [ ] JTSA creation works
- [ ] AI hazards generate
- [ ] Dashboard displays stats
- [ ] Sidebar navigation responsive
- [ ] Mobile menu works

### SuperAdmin Features

- [ ] Login works
- [ ] Companies list loads
- [ ] Create company wizard works
- [ ] Company detail page loads
- [ ] Edit mode works
- [ ] Delete with confirmation works
- [ ] Pagination works
- [ ] Search works
- [ ] Export works
- [ ] Toast notifications appear
- [ ] Error handling works

---

## 🐛 Debugging

### Backend Won't Start

```bash
# Check Node version
node --version
# Should be 18+

# Check port 3000 is free
lsof -i :3000
# If occupied: kill <PID>

# Check .env file exists
cat .env.development

# Check database connection
# Verify DATABASE_URL is correct

# Check API key
# Verify ANTHROPIC_API_KEY is set
```

### Frontend Won't Load

```bash
# Check port 5173 is free
lsof -i :5173

# Check .env file
cat .env.development
# VITE_API_BASE_URL=http://localhost:3000

# Clear cache
rm -rf .next node_modules/.vite

# Reinstall
npm install
npm run dev
```

### API Calls Failing

```bash
# Check backend is running
curl http://localhost:3000/health

# Check CORS config
# Backend .env: ALLOWED_ORIGINS should include localhost:5173

# Check auth token
# If 401 error, need to login first
```

### AI Hazards Not Generating

```bash
# Check Anthropic API key
echo $ANTHROPIC_API_KEY

# Test API key works
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/models

# If fails: regenerate key at console.anthropic.com
```

---

## 🚀 Next Steps After Local Testing

Once everything works locally:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy to Production:**
   ```bash
   ./scripts/deploy.sh all production
   ```

3. **Monitor Deployment:**
   - Check Railway dashboard for backend
   - Check Vercel dashboard for frontends
   - Run health checks

4. **Update DNS:**
   - Point app.worksafeai.com to Vercel
   - Point admin.worksafeai.com to Vercel
   - Point api.worksafeai.com to Railway

---

## 📱 Test on Mobile

```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# On your phone, visit:
# http://<YOUR_IP>:5173 (frontend)
# http://<YOUR_IP>:5174 (admin)

# Test:
# - Responsive layout works
# - Touch interactions work
# - Forms are usable
```

---

## ✅ Pre-Production Checklist

Before deploying to production:

**Local Testing**
- [ ] Backend health check passes
- [ ] Frontend loads
- [ ] SuperAdmin loads
- [ ] Register new account works
- [ ] Complete onboarding works
- [ ] Create JTSA with AI works
- [ ] SuperAdmin CRUD works
- [ ] Export works
- [ ] Mobile responsive

**Configuration**
- [ ] .env files filled with production values
- [ ] API keys not in git (in .env only)
- [ ] Database backups enabled
- [ ] Email service configured
- [ ] Error tracking ready

**Security**
- [ ] No console errors
- [ ] No hardcoded secrets
- [ ] HTTPS will be enabled
- [ ] CORS configured
- [ ] Rate limiting ready

**Documentation**
- [ ] Deployment guide updated
- [ ] Runbook created
- [ ] Team trained on procedure
- [ ] Rollback plan ready

---

## 📞 Common Issues

| Problem | Solution |
|---------|----------|
| Port already in use | `lsof -i :3000` then `kill -9 <PID>` |
| Module not found | `rm -rf node_modules && npm install` |
| Database connection refused | Check DATABASE_URL in .env, ensure Supabase is running |
| CORS errors | Check ALLOWED_ORIGINS in backend .env includes frontend URLs |
| 401 Unauthorized | Login first, verify JWT token is in Authorization header |
| AI hazards empty | Check ANTHROPIC_API_KEY is valid |
| Email not sending | Verify SMTP credentials in .env |

---

**Once everything passes locally, you're ready for production! 🚀**

Run: `./scripts/deploy.sh all production`

