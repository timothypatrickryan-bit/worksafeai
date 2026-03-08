# JTSA Backend API Endpoints

**Base URL:** `http://localhost:3000/api`

---

## Authentication

### POST /auth/register
Create company + owner account with 3-day trial.

**Request:**
```json
{
  "email": "owner@company.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "companyName": "Acme Corp"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "owner@company.com",
    "fullName": "John Doe",
    "role": "owner",
    "companyId": "uuid"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_token"
}
```

### POST /auth/login
Login with email + password.

**Request:**
```json
{
  "email": "owner@company.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as register

### GET /auth/me
Get current logged-in user (requires token).

### POST /auth/logout
Logout (client-side, clears token).

### POST /auth/refresh-token
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token"
}
```

---

## Companies

### GET /companies/:id
Get company details.

**Response:**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "subscription_tier": "starter",
  "trial_ends_at": "2026-03-09T...",
  "billing_active": false,
  "created_at": "...",
  "updated_at": "..."
}
```

### PATCH /companies/:id
Update company name.

**Request:**
```json
{
  "name": "Acme Corp Updated"
}
```

### POST /companies/:id/users
Invite new employee.

**Request:**
```json
{
  "email": "employee@company.com",
  "fullName": "Jane Smith",
  "role": "employee"
}
```

### GET /companies/:id/users
List all employees in company (admin/owner only).

---

## Projects

### POST /companies/:cid/projects
Create new project.

**Request:**
```json
{
  "name": "Warehouse Renovation",
  "description": "Q1 2026 renovation project"
}
```

### GET /companies/:cid/projects
List projects for company.

**Query:**
```
?status=active  (optional filter)
```

### GET /projects/:id
Get project details.

### PATCH /projects/:id
Update project.

**Request:**
```json
{
  "name": "Updated Name",
  "description": "...",
  "status": "active|completed|archived"
}
```

### DELETE /projects/:id
Archive project (soft delete).

---

## JTSAs (Job Task Safety Analysis)

### POST /projects/:pid/jtsa
Create JTSA for project (auto-generates AI hazards).

**Request:**
```json
{
  "taskDescription": "Install new electrical wiring in warehouse zone A with height work up to 15 feet"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "date": "2026-03-06",
  "task_description": "...",
  "status": "in_progress",
  "created_by": "uuid",
  "hazards": [
    {
      "id": "uuid",
      "description": "Risk of falls from height",
      "severity": "high",
      "ai_suggested": true,
      "user_acknowledged": false
    }
  ]
}
```

### GET /projects/:pid/jtsa
Get today's JTSA (or by date).

**Query:**
```
?date=2026-03-06  (optional, defaults to today)
```

### GET /jtsa/:id
Get full JTSA details with all relationships.

### PATCH /jtsa/:id
Update JTSA.

**Request:**
```json
{
  "taskDescription": "Updated task...",
  "status": "in_progress|completed"
}
```

### POST /jtsa/:id/participants
Add user to JTSA.

**Request:**
```json
{
  "userId": "uuid"
}
```

### GET /jtsa/:id/participants
List participants signed into JTSA.

### POST /jtsa/:id/complete
Mark JTSA complete, generate PDF, send emails to participants.

**Response:**
```json
{
  "message": "JTSA completed and PDF generated",
  "jtsa_id": "uuid",
  "pdf_url": "/pdfs/jtsa_uuid_2026-03-06.pdf",
  "emails_sent": 5
}
```

---

## Hazards

### POST /jtsa/:id/hazards
Create user-submitted hazard.

**Request:**
```json
{
  "description": "Falling tools from above",
  "severity": "high"
}
```

### GET /jtsa/:id/hazards
List all hazards for JTSA.

### PATCH /hazards/:id
Acknowledge hazard.

**Request:**
```json
{
  "userAcknowledged": true
}
```

### GET /hazards/:id
Get hazard details with mitigations.

---

## Mitigations

### POST /hazards/:id/mitigations
Create mitigation plan (triggers async AI review).

**Request:**
```json
{
  "mitigationPlan": "Install safety netting and require hard hats. Use fall harnesses for work above 10 feet."
}
```

**Response:**
```json
{
  "id": "uuid",
  "hazard_id": "uuid",
  "mitigation_plan": "...",
  "ai_reviewed": false,
  "ai_feedback": null,
  "user_accepted": false,
  "created_at": "..."
}
```

(AI feedback will be populated asynchronously)

### GET /hazards/:id/mitigations
List mitigations for hazard.

### PATCH /mitigations/:id
Accept or reject mitigation.

**Request:**
```json
{
  "userAccepted": true
}
```

### GET /mitigations/:id
Get mitigation details.

---

## Billing

### POST /billing/subscribe
Create subscription for company (3-day free trial).

**Request:**
```json
{
  "tier": "starter"
}
```

**Response:**
```json
{
  "subscription_id": "sub_xxxxx",
  "status": "trialing",
  "current_period_end": 1678608000,
  "trial_end": 1678608000,
  "message": "3-day free trial activated. Payment required after trial period."
}
```

**Tiers:**
- `starter`: 10 employees, 5 projects, $29.99/month
- `pro`: 50 employees, unlimited projects, $79.99/month
- `enterprise`: unlimited, custom pricing

### POST /billing/change-tier
Upgrade subscription tier.

**Request:**
```json
{
  "tier": "pro"
}
```

**Response:**
```json
{
  "subscription_id": "sub_xxxxx",
  "new_tier": "pro",
  "status": "active",
  "message": "Subscription tier updated successfully"
}
```

### GET /billing/status
Get billing status for company.

**Response:**
```json
{
  "current_tier": "starter",
  "status": "active",
  "billing_period_end": "2026-04-06T...",
  "tier_limits": {
    "max_employees": 10,
    "max_projects": 5
  },
  "stripe_subscription_id": "sub_xxxxx",
  "subscription_details": {
    "stripe_id": "sub_xxxxx",
    "status": "active",
    "current_period_end": 1678608000,
    "trial_end": null,
    "cancel_at_period_end": false
  }
}
```

### POST /billing/cancel
Cancel subscription (owner only).

**Response:**
```json
{
  "message": "Subscription cancelled",
  "status": "canceled",
  "cancel_at_period_end": false
}
```

### POST /billing/webhook
Stripe webhook endpoint (auto-called by Stripe).

**Webhook Events Handled:**
- `customer.subscription.created` — Update company tier to active
- `customer.subscription.updated` — Update tier/status
- `customer.subscription.deleted` — Mark cancelled
- `invoice.payment_succeeded` — Log audit event
- `invoice.payment_failed` — Log audit event

---

## Dashboard

### GET /companies/:id/dashboard
Get company overview stats.

**Response:**
```json
{
  "company": { ... },
  "stats": {
    "totalEmployees": 15,
    "totalProjects": 3,
    "todaysJtsas": 2,
    "completedThisWeek": 8
  }
}
```

### GET /companies/:id/jtsa-list
List all company JTSAs with filtering.

**Query:**
```
?status=completed
?date=2026-03-06
?limit=50
?offset=0
```

### GET /companies/:id/audit-log
Get audit trail (admin/owner only).

**Query:**
```
?action=created_jtsa
?user_id=uuid
?limit=100
?offset=0
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "taskDescription",
      "message": "Task description must be at least 10 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied to this company"
}
```

### 404 Not Found
```json
{
  "error": "JTSA not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Authentication Header

All endpoints except `/auth/register` and `/auth/login` require:

```
Authorization: Bearer <access_token>
```

Tokens expire in 1 hour. Use `/auth/refresh-token` to get a new token.
