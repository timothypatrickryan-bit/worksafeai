# Vercel Deployment Setup

## Projects Deployed ✅

| App | Vercel URL | Custom Domain |
|-----|-----------|---------------|
| WorkSafeAI | https://web-70n9fqpit-timothypatrickryan-7139s-projects.vercel.app | worksafeai.elevationaiwork.com |
| Super Admin | https://super-admin-2ssc9i365-timothypatrickryan-7139s-projects.vercel.app | superadmin.elevationaiwork.com |

---

## Manual Setup (5 minutes)

### For Main App (WorkSafeAI)

1. Go to: https://vercel.com/timothypatrickryan-7139s-projects/web
2. Click **Settings** → **Environment Variables**
3. Add these 3 variables (all Production):

```
VITE_API_URL = https://worksafeai-api.elevationaiwork.com
VITE_SUPABASE_URL = https://yajgvdolpynezwlwkvva.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhamd2ZG9scHluZXp3bHdrdnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODU4MzQsImV4cCI6MjA4ODQ2MTgzNH0.GFlys6BFyj607sH2d5thlWdOd6EPVeKhyaOL2sYUCkw
```

4. Go to **Settings** → **Domains**
5. Add domain: `worksafeai.elevationaiwork.com`
   - Note the CNAME: `cname.vercel.com`

### For Super Admin Console

1. Go to: https://vercel.com/timothypatrickryan-7139s-projects/super-admin
2. Click **Settings** → **Environment Variables**
3. Add these 3 variables (all Production):

```
VITE_API_URL = https://worksafeai-api.elevationaiwork.com
VITE_SUPABASE_URL = https://yajgvdolpynezwlwkvva.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhamd2ZG9scHluZXp3bHdrdnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODU4MzQsImV4cCI6MjA4ODQ2MTgzNH0.GFlys6BFyj607sH2d5thlWdOd6EPVeKhyaOL2sYUCkw
```

4. Go to **Settings** → **Domains**
5. Add domain: `superadmin.elevationaiwork.com`
   - Note the CNAME: `cname.vercel.com`

---

## DNS Configuration (Your Domain Provider)

For both domains, add CNAME records pointing to Vercel:

| Subdomain | Type | Value |
|-----------|------|-------|
| `worksafeai` | CNAME | `cname.vercel.com` |
| `superadmin` | CNAME | `cname.vercel.com` |

---

## Backend API

Don't forget to deploy the backend to: `https://worksafeai-api.elevationaiwork.com`

Current backend is at: `/Users/timothyryan/.openclaw/workspace/apps/worksafeai/api`

---

## Testing

Once domains resolve:
- Main: https://worksafeai.elevationaiwork.com
- Admin: https://superadmin.elevationaiwork.com
