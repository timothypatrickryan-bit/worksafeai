# Mission Control Production Deployment — Quick Checklist

**Estimated time: 45 minutes**

---

## ✅ Pre-Deployment (Already Done)

- [x] Code complete & tested on localhost
- [x] All 5 projects visible in dashboard
- [x] Real-time updates working
- [x] Build passes (npm run build successful)
- [x] TypeScript strict mode passing
- [x] ESLint passing
- [x] No console errors

---

## 🚀 Deployment Checklist

### 1. Final Build & Commit (5 min)

```bash
cd /Users/timothyryan/.openclaw/workspace/apps/mission-control

# Final build test
npm run build
npm run type-check

# Verify no errors above ☝️

# Commit any final changes
git add .
git commit -m "Production deployment: Mission Control Unified Dashboard"
git push origin main
```

**Time:** ~5 minutes  
**Status:** ⏳ Ready to run

---

### 2. Configure Vercel (5 min)

1. Go to: https://vercel.com/timothypatrickryan-7139s-projects
2. Find "mission-control" project
3. Click "Settings" → "Environment Variables"
4. Add these variables:

```
NODE_ENV              = production
NEXT_PUBLIC_API_URL   = https://mission-control-api.elevationaiwork.com
NEXT_PUBLIC_WS_URL    = wss://mission-control-api.elevationaiwork.com
```

(Replace API URLs with your actual backend endpoints)

5. Click "Save"

**Time:** ~5 minutes  
**Status:** ⏳ Ready to do

---

### 3. Deploy to Vercel (10 min)

Vercel auto-deploys when you push to main, but you can also manually deploy:

**Option A: Auto-Deploy (Recommended)**
```bash
# Already deployed when you pushed to main
# Wait 2-3 minutes for build to complete
# Check progress: https://vercel.com/timothypatrickryan-7139s-projects → mission-control
```

**Option B: Manual Deploy**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy to production
cd /Users/timothyryan/.openclaw/workspace/apps/mission-control
vercel deploy --prod
```

**Time:** ~10 minutes  
**Status:** ⏳ Ready when you push to main

---

### 4. Configure Custom Domain (5 min)

1. Go to Vercel project Settings → Domains
2. Add domain: `mission-control.elevationaiwork.com`
3. Note the CNAME target (usually `cname.vercel-dns.com`)

Then in Cloudflare:
1. Go to: https://dash.cloudflare.com → elevationaiwork.com
2. DNS Records section
3. Add new CNAME record:
   - Name: `mission-control`
   - Target: `cname.vercel-dns.com`
   - TTL: Auto
   - Proxied: No (grey cloud)
4. Click Save

**Wait 2-5 minutes for DNS propagation**

**Time:** ~5 minutes + DNS propagation (~2-5 min)  
**Status:** ⏳ Ready to do

---

### 5. Verify Production (10 min)

```bash
# Test the production domain (wait if DNS not yet propagated)
curl https://mission-control.elevationaiwork.com

# Open in browser
open https://mission-control.elevationaiwork.com

# Verify these work:
- ✅ Dashboard loads in <2 seconds
- ✅ All 5 projects visible
- ✅ Can click into project
- ✅ Can create a new task
- ✅ Create task → instantly appears (real-time)
- ✅ No JavaScript errors (open DevTools)
- ✅ Mobile view works (resize browser)
- ✅ HTTPS lock icon appears
```

**Time:** ~5 minutes  
**Status:** ⏳ Ready to verify

---

## 📊 Deployment Status

| Step | Task | Time | Status |
|------|------|------|--------|
| 1️⃣ | Build & Commit | 5 min | ✅ Ready |
| 2️⃣ | Vercel Env Vars | 5 min | ⏳ Next |
| 3️⃣ | Deploy (auto or manual) | 10 min | ⏳ Next |
| 4️⃣ | Domain CNAME | 5 min | ⏳ Next |
| 5️⃣ | Verification | 10 min | ⏳ Next |
| **Total** | | **~45 min** | **⏳ Ready** |

---

## 🚨 Rollback (If Needed)

If something goes wrong in production:

```bash
# Option 1: Revert to previous version
vercel rollback

# Option 2: Redeploy from git
git revert HEAD
git push origin main
# Wait for Vercel auto-deploy

# Option 3: Check Vercel deployments
# https://vercel.com/timothypatrickryan-7139s-projects/mission-control/deployments
# Click any previous deployment to restore it
```

**Rollback time:** 2-3 minutes

---

## 📈 Monitoring (After Deploy)

### First 24 Hours
- Check Vercel logs hourly: https://vercel.com/.../mission-control
- Look for errors in "Logs" tab
- Test dashboard every few hours
- Monitor response times

### First Week
- Review error logs daily
- Monitor performance metrics (Vercel Analytics)
- Test critical workflows (create project, edit task, etc.)
- Gather user feedback

### Ongoing
- Set up uptime alerts (optional)
- Review performance monthly
- Plan Phase 2 features (mobile notifications, advanced search)

---

## ✅ Success Criteria

Production is live when ALL these are true:

- [ ] Dashboard accessible at mission-control.elevationaiwork.com
- [ ] Page loads in <2 seconds
- [ ] All 5 projects visible
- [ ] Can create new task (instantly updates)
- [ ] Can edit task/project details
- [ ] WebSocket real-time updates working
- [ ] Mobile view responsive
- [ ] HTTPS working (green lock)
- [ ] No JavaScript errors in console
- [ ] Vercel build successful (green checkmark)

---

## 🎉 Done!

Once all ✅ are checked, Mission Control is in production.

**Continue building:**
- Keep making improvements in dev branch
- Test new features locally
- Merge to main when ready
- Vercel auto-deploys changes

---

## 📞 Quick Links

- Vercel Dashboard: https://vercel.com/timothypatrickryan-7139s-projects
- Cloudflare DNS: https://dash.cloudflare.com
- GitHub Repo: https://github.com/timothypatrickryan-bit/worksafeai
- Local Dev: `npm run dev` in apps/mission-control (http://localhost:3000)

---

**Next Steps After Deployment:**
1. Monitor production 24/7 for 48 hours
2. Start Phase 2 development in dev branch
3. Plan feature rollout (A/B testing, gradual rollout)
4. Set up production metrics & alerting
5. Regular security audits

---

**Version:** 0.1.0  
**Status:** Ready for Production  
**Risk Level:** LOW (feature complete, tested, no breaking changes)  
**Rollback Available:** YES (2-3 minutes)

🚀 **You're ready to go live!**
