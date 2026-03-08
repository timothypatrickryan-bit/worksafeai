# GitHub Actions Setup Guide

Complete instructions to enable auto-deploy on both repositories.

---

## What We Added

✅ **Main Repo** (`worksafeai`)
- `.github/workflows/deploy-worksafeai.yml`
- Deploys: API + Frontend + Admin Console
- Triggers on push to main

✅ **Super Admin Repo** (`worksafeai-super-admin`)
- `.github/workflows/deploy.yml`
- Deploys: Admin Console only
- Triggers on push to main

---

## Step 1: Add GitHub Secrets (Required)

Both repos need your Vercel token as a GitHub Secret.

### For `timothypatrickryan-bit/worksafeai`

1. Go to: https://github.com/timothypatrickryan-bit/worksafeai/settings/secrets/actions
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: `vcp_your_vercel_token_here` (Get from https://vercel.com/account/tokens)
5. Click **Add secret**

### For `timothypatrickryan-bit/worksafeai-super-admin`

1. Go to: https://github.com/timothypatrickryan-bit/worksafeai-super-admin/settings/secrets/actions
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: `vcp_your_vercel_token_here` (Get from https://vercel.com/account/tokens)
5. Click **Add secret**

---

## Step 2: Test the Workflow

### Test Deploy (Don't Push Yet!)

The workflows are now live. Next time you push to `main`:

```bash
git push origin main
```

**What happens:**
1. ✅ GitHub Actions workflow triggers
2. ✅ Tests run (if configured)
3. ✅ If tests pass → Auto-deploys to Vercel
4. ✅ You see status in GitHub → Actions tab

### View Deployment Status

After pushing:
1. Go to: https://github.com/timothypatrickryan-bit/worksafeai/actions
2. Click the latest workflow run
3. See real-time deploy logs
4. Green check = success, red X = failure

---

## How It Works

```
You: git push main
    ↓
GitHub Actions: Triggers workflow
    ↓
Step 1: Checkout code
Step 2: Install Node 18
Step 3: Run tests (if any)
    ↓
If tests pass:
Step 4: Deploy API → Vercel
Step 5: Deploy Frontend → Vercel
Step 6: Deploy Admin → Vercel
    ↓
Result: All apps live in production!
```

---

## What Gets Deployed

### `worksafeai` (Main Repo)

| App | Vercel Project | Domain |
|-----|----------------|--------|
| API | `api` | worksafeai-api.elevationaiwork.com |
| Frontend | `web` | worksafeai.elevationaiwork.com |
| Admin | `super-admin` | superadmin.elevationaiwork.com |

### `worksafeai-super-admin` (Standalone)

| App | Vercel Project | Domain |
|-----|----------------|--------|
| Admin | `super-admin` | superadmin.elevationaiwork.com |

**Note:** Super admin is also in main repo, so both workflows deploy it. Only one pushes at a time, so no conflicts.

---

## Monitoring Deployments

### GitHub Actions Dashboard
- https://github.com/timothypatrickryan-bit/worksafeai/actions
- See all deploys
- Real-time logs
- Rollback button (revert commit)

### Vercel Dashboard
- https://vercel.com/timothypatrickryan-7139s-projects
- See deployment history
- Rollback any deploy
- Preview old versions

---

## Troubleshooting

### Deploy Failed?

1. **Check GitHub Actions logs:**
   - https://github.com/timothypatrickryan-bit/worksafeai/actions
   - Click the failed run
   - Read the error

2. **Common issues:**
   - `VERCEL_TOKEN not found` → Secret not added (see Step 1)
   - `npm test failed` → Fix test errors before deploying
   - `vercel deploy failed` → Check Vercel project settings

3. **Manual rollback:**
   - Go to Vercel dashboard
   - Find the previous good deploy
   - Click "Rollback to this"

---

## Next: Env Variable Setup Script

Once GitHub Actions is working, we'll add the environment setup script:

```bash
export VERCEL_TOKEN=vcp_xxxxx
./scripts/setup-vercel-env.sh myapp apps/myapp/api/.env.production
```

This eliminates the 15-minute manual env var configuration.

---

## Final Checklist

- [ ] Add `VERCEL_TOKEN` secret to `worksafeai` repo
- [ ] Add `VERCEL_TOKEN` secret to `worksafeai-super-admin` repo
- [ ] Test by making a small commit and pushing to main
- [ ] Watch deploy in GitHub Actions tab
- [ ] Verify app is updated at domain URL
- [ ] Celebrate 🎉

---

## Commands Reference

```bash
# View recent actions
gh workflow list

# View specific workflow
gh workflow view deploy-worksafeai.yml

# Re-run a failed deploy
gh run rerun <RUN_ID>

# See logs
gh run view <RUN_ID> --log
```

---

**Status:** ✅ Workflows added, pushed to GitHub  
**Next:** Add GitHub Secrets (you do this manually on GitHub.com)  
**Then:** Auto-deploy on every push!
