# Vercel Environment Variables Setup

## Issue
The frontend is trying to call `localhost:3000/api` instead of the production API at `https://worksafeai-api.elevationaiwork.com/api`.

## Solution: Set Environment Variables in Vercel

### For the Web Project (worksafeai frontend)
1. Go to: https://vercel.com/timothypatrickryan-7139s-projects/web/settings/environment-variables
2. Add these environment variables for **Production**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://worksafeai-api.elevationaiwork.com/api` |
| `VITE_SUPABASE_URL` | `https://yajgvdolpynezwlwkvva.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhamd2ZG9scHluZXp3bHdrdnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODU4MzQsImV4cCI6MjA4ODQ2MTgzNH0.GFlys6BFyj607sH2d5thlWdOd6EPVeKhyaOL2sYUCkw` |

3. Click "Save"
4. Vercel will automatically redeploy the project

### For the Super Admin Project (superadmin)
1. Go to: https://vercel.com/timothypatrickryan-7139s-projects/super-admin/settings/environment-variables
2. Add the same environment variables for **Production**
3. Click "Save"

## How Vite Uses Environment Variables

Vite loads environment variables from:
1. `.env` files in the project directory (for local development)
2. Vercel's environment variables (for production builds)

Any environment variable prefixed with `VITE_` is available in the frontend code as:
```javascript
import.meta.env.VITE_API_URL
```

## Current Configuration

### Local Development (`.env`)
```
VITE_API_URL=http://localhost:3000/api
```

### Production (Vercel Environment Variables)
```
VITE_API_URL=https://worksafeai-api.elevationaiwork.com/api
```

## Verification

After setting the environment variables:
1. The frontend will automatically rebuild and redeploy
2. Navigate to https://worksafeai.elevationaiwork.com
3. Open DevTools → Console
4. You should NOT see any `ERR_CONNECTION_REFUSED` errors
5. The registration API calls should reach `https://worksafeai-api.elevationaiwork.com/api/auth/register`

## Project IDs (for reference)
- Web: `prj_OZTnYaFCGacHXZZbbRsB9vPq1mIt`
- Super Admin: `prj_ZqfxyOMkJtLisvgb78JkMDfTgkPv`
- API: `prj_fXyFmEuuC6COsVSmJ4iqKDJjbk5v`

---
**Last Updated:** March 9, 2026
