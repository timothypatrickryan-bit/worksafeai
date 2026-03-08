# JTSA Backend

AI-powered Job Task Safety Analysis API.

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required:
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (for admin operations)
- `JWT_SECRET` — Random string for JWT signing
- `OPENAI_API_KEY` — Your OpenAI API key

### 2. Database Setup

1. Create a Supabase project at https://supabase.com
2. In Supabase SQL Editor, run the contents of `src/db/schema.sql`
3. This creates all tables, indexes, and Row Level Security policies

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Server runs on `http://localhost:3000`

## API Routes

### Auth
- `POST /api/auth/register` — Create company + owner account
- `POST /api/auth/login` — User login
- `GET /api/auth/me` — Get current user
- `POST /api/auth/logout` — Logout (client clears token)
- `POST /api/auth/refresh-token` — Refresh JWT

### Companies
- `GET /api/companies/:id` — Get company details
- `PATCH /api/companies/:id` — Update company
- `POST /api/companies/:id/users` — Invite employee
- `GET /api/companies/:id/users` — List employees

### Projects
- `POST /api/companies/:cid/projects` — Create project
- `GET /api/companies/:cid/projects` — List projects
- `GET /api/projects/:id` — Get project
- `PATCH /api/projects/:id` — Update project

### JTSAs
- `POST /api/projects/:pid/jtsa` — Create JTSA
- `GET /api/projects/:pid/jtsa` — Get today's JTSA
- `GET /api/jtsa/:id` — Get JTSA details
- `PATCH /api/jtsa/:id` — Update JTSA
- `POST /api/jtsa/:id/participants` — Add participant
- `GET /api/jtsa/:id/participants` — List participants

### Hazards
- `POST /api/jtsa/:id/hazards` — Create hazard (triggers AI)
- `GET /api/jtsa/:id/hazards` — List hazards
- `PATCH /api/hazards/:id` — Acknowledge hazard

### Mitigations
- `POST /api/hazards/:id/mitigations` — Create mitigation (triggers AI)
- `GET /api/hazards/:id/mitigations` — List mitigations
- `PATCH /api/mitigations/:id` — Accept/reject mitigation

## Authentication

All protected routes require JWT token in header:

```
Authorization: Bearer <token>
```

Tokens are obtained via login/register and expire after 1 hour. Use refresh token to get new access token.

## Next Steps

- [ ] Implement project routes
- [ ] Implement JTSA routes
- [ ] Implement hazard routes (with AI integration)
- [ ] Implement mitigation routes (with AI integration)
- [ ] Add email service (SendGrid for invites + PDF delivery)
- [ ] Add PDF generation service
- [ ] Add Stripe billing integration
- [ ] Add audit logging middleware
- [ ] Add input validation/error handling
- [ ] Write tests

