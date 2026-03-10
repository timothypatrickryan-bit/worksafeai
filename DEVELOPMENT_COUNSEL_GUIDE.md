# Development Counsel Guide

> How to use Lucy effectively across multiple apps.
> Generated: 2026-03-08

---

## Lucy's Role in Multi-App Development

Lucy isn't just a coding assistant — she's the **consistency enforcer** and **architectural memory** across all of Tim's apps. Here's how to use her effectively.

---

## 1. Starting a New App

**Tell Lucy:**
> "I'm starting a new app called [Name]. It's a [type] for [audience]. Key features: [list]. Use the standard template."

**Lucy will:**
1. Scaffold the directory structure from the template
2. Set up shared package imports
3. Create the basic App.jsx, server.js, and routes
4. Generate .env.example with required variables
5. Create the initial README

**Lucy won't:**
- Guess your domain model — you need to describe what the app does
- Choose your database schema — but she'll suggest based on patterns

---

## 2. During Development

### Pattern Enforcement
When Tim writes code, Lucy should check:

- [ ] Using `@elevationai/ui` components, not creating new ones?
- [ ] Using `useFetch` / `useForm` hooks, not raw `useState` + `useEffect`?
- [ ] Validation done with Zod + `validateBody()` middleware?
- [ ] Routes protected with `authenticateToken` + `authorizeRole`?
- [ ] Errors handled by `errorHandler` middleware, not caught in routes?
- [ ] Audit logging on mutations?
- [ ] Rate limiting on auth and expensive endpoints?

### Code Review Prompts
Lucy should periodically ask:
- "This component looks similar to DataTable — can we use the shared one?"
- "This auth logic is duplicated — should we update the shared auth package?"
- "This API endpoint is missing rate limiting."
- "This mutation doesn't have audit logging."

---

## 3. Architecture Decisions

When Tim asks "should I..." questions, Lucy uses this decision framework:

### Shared vs Per-App
- **If 3+ apps would use it → shared package**
- **If only this app needs it → per-app**
- **If uncertain → per-app now, extract later**

### New Dependency
- **Already using an equivalent? → Use existing** (don't add a second modal library)
- **Widely adopted + maintained? → Probably fine**
- **Niche or unmaintained? → Suggest alternative or build minimal version**

### Performance
- **< 1000 records? → Client-side sort/filter is fine**
- **1000-10000? → Server-side pagination, client-side sort**
- **> 10000? → Full server-side with cursor pagination + caching**

---

## 4. Periodic Reviews

### Weekly (Lucy does automatically during heartbeats):
- Check for dependency version drift across apps
- Check for pattern divergence (new components that duplicate shared ones)
- Update MEMORY.md with architectural decisions

### Monthly:
- Full codebase scan for security patterns
- Shared package update proposals
- Performance audit (bundle sizes, API response times)
- Documentation freshness check

---

## 5. Deployment Workflow

### When Tim says "deploy [app]":
1. Lucy runs `npm run build` and verifies no errors
2. Checks that env vars are set in Vercel
3. Triggers deploy (or reminds Tim to push)
4. Verifies deployment health check
5. Updates CREDENTIALS_MAP.md if URLs changed

### When Tim says "deploy all":
1. Lucy builds each app in dependency order (packages → apps)
2. Deploys backends first, then frontends
3. Runs health checks on all endpoints
4. Reports status

---

## 6. Debugging Across Apps

**Tell Lucy:**
> "Users are getting 401 errors on [app]"

**Lucy will:**
1. Check the API client's token refresh logic
2. Check JWT expiry configuration
3. Check if the auth store's `initializeAuth` is running
4. Check CORS configuration
5. Check rate limiting (are they being rate-limited?)
6. Look at recent audit logs for anomalies

**The correlation ID pattern is crucial here** — every API response includes `X-Request-ID`, which Lucy can use to trace errors through logs.

---

## 7. Key Files Lucy Should Always Know About

| File | Purpose | Update frequency |
|------|---------|-----------------|
| `MULTI_APP_COUNSEL_FRAMEWORK.md` | Strategic architecture | Quarterly |
| `REUSABLE_COMPONENTS_INVENTORY.md` | What's shared | When new components are created |
| `SHARED_SERVICES_ARCHITECTURE.md` | Package structure | When architecture changes |
| `FUTURE_APP_TEMPLATE.md` | New app playbook | When template evolves |
| `CREDENTIALS_MAP.md` | All secrets/access | When infrastructure changes |
| `SCALING_CHECKLIST.md` | Scale readiness | Before launching new apps |

---

## 8. Communication Patterns

### Tim says: "Quick fix on [app]"
Lucy: Focuses on the fix, doesn't refactor unrelated code

### Tim says: "Build [feature] for [app]"
Lucy: Checks if it exists in another app first, suggests shared extraction if relevant

### Tim says: "Why is [app] slow?"
Lucy: Systematic check — bundle size → API response times → database queries → caching

### Tim says: "Update all apps to [new pattern]"
Lucy: Creates a migration plan, updates shared packages first, then app-by-app

### Tim says: "I'm stuck on [concept]"
Lucy: Explains with examples from existing apps (WorkSafeAI and Super Admin are the reference implementations)

---

## 9. Anti-Patterns Lucy Should Flag

🚫 **Copy-pasting components between apps** → Use shared package
🚫 **Inline HTML email templates** → Use email template library
🚫 **Raw `fetch()` instead of `apiClient`** → Use configured Axios instance
🚫 **`console.log` for error handling** → Use structured logger
🚫 **Missing `validateBody()` on POST routes** → Always validate
🚫 **Hardcoded URLs** → Use environment variables
🚫 **Missing rate limiting on auth endpoints** → Always rate limit
🚫 **Catching errors in route handlers instead of letting errorHandler do it** → Let middleware handle it
🚫 **`useState` + `useEffect` for data fetching** → Use `useFetch` hook
🚫 **Custom modal/toast implementations** → Use shared components
