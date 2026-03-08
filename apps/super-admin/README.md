# SuperAdmin Console

**SuperAdmin Console** is a centralized management interface for super users (like Tim) to manage all apps in the ecosystem, with detailed controls for WorkSafeAI and extensibility for future apps.

## Features

### WorkSafeAI Management
- ✅ Create companies manually
- ✅ Manage company profiles (edit, delete)
- ✅ Create and manage employees
- ✅ View all companies, employees, JTSAs
- ✅ Manage subscriptions & billing
- ✅ View analytics & metrics
- ✅ Export data

### Future App Management
- Multi-app support (dashboard select which app)
- Extensible page structure for new apps
- Role-based access control
- Audit logging

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **HTTP:** Axios
- **UI Icons:** Lucide React
- **Backend:** Extends existing WorkSafeAI API + new admin endpoints

## Folder Structure

```
apps/super-admin/
├── README.md (this file)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── CompaniesPage.jsx
│   │   ├── CompanyDetailPage.jsx
│   │   ├── EmployeesPage.jsx
│   │   ├── SubscriptionsPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── AuditLogsPage.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Form.jsx
│   │   └── DataTable.jsx
│   ├── api/
│   │   └── client.js
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── appStore.js
│   │   └── filterStore.js
│   └── hooks/
│       ├── useFetch.js
│       └── useForm.js
├── .env.example
└── .gitignore
```

## Getting Started

```bash
cd apps/super-admin
npm install
npm run dev
```

Opens on `http://localhost:5174` (or next available port)

## API Integration

### Required Backend Endpoints (extend existing WorkSafeAI API)

```
# Companies Management
POST   /api/admin/companies                    # Create company
GET    /api/admin/companies                    # List all companies
GET    /api/admin/companies/:id                # Get company details
PUT    /api/admin/companies/:id                # Update company
DELETE /api/admin/companies/:id                # Delete company
POST   /api/admin/companies/:id/profile        # Set company profile
GET    /api/admin/companies/:id/profile        # Get company profile

# Employees Management
POST   /api/admin/companies/:id/employees      # Create employee in company
GET    /api/admin/companies/:id/employees      # List employees
GET    /api/admin/employees/:id                # Get employee details
PUT    /api/admin/employees/:id                # Update employee
DELETE /api/admin/employees/:id                # Delete employee

# Subscriptions Management
GET    /api/admin/subscriptions                # List all subscriptions
GET    /api/admin/subscriptions/:id            # Get subscription details
PUT    /api/admin/subscriptions/:id            # Update subscription
POST   /api/admin/subscriptions/:id/refund     # Refund subscription

# Analytics & Data
GET    /api/admin/analytics/summary            # Overview stats
GET    /api/admin/analytics/companies          # Company metrics
GET    /api/admin/analytics/jtsas              # JTSA metrics
GET    /api/admin/audit-logs                   # Audit trail

# System
GET    /api/admin/health                       # System health check
```

## Pages Overview

### Dashboard
- System overview (total companies, users, revenue, JTSAs)
- Recent activity feed
- Quick stats cards
- System health

### Companies
- List all companies with search/filter
- Create new company form
- Quick actions (edit, view details, delete)
- Bulk actions (export, archive)

### Company Details
- Full company profile editor
- Employee roster
- Subscription info
- Activity history
- JTSA history

### Employees
- List all employees across all companies
- Filter by company, role, status
- Create employee form
- Bulk invite via email
- Deactivate/activate employees

### Subscriptions
- List all active/past subscriptions
- View subscription details
- Upgrade/downgrade tiers
- Process refunds
- View usage metrics

### Analytics
- Dashboard metrics
- Company metrics
- JTSA analysis
- User engagement
- Export reports

### Audit Logs
- All admin actions logged
- Filter by user, action, date
- Track data changes
- Compliance reporting

### Settings
- App selection (switch between apps)
- User preferences
- API integrations
- Backup & export

## Authentication & Security

- ✅ JWT-based auth (token from WorkSafeAI API)
- ✅ Super user role verification (only admins can access)
- ✅ Audit logging for all actions
- ✅ CORS configured for backend
- ✅ Input validation on all forms
- ✅ Confirmation modals for destructive actions

## Extending for Future Apps

To add a new app to SuperAdmin:

1. **Create app endpoints** in new app's backend:
   ```
   GET /api/admin/health
   GET /api/admin/stats
   GET /api/admin/entities (generic data endpoint)
   ```

2. **Add app to config** in `src/config/apps.js`:
   ```javascript
   {
     id: 'new-app',
     name: 'New App Name',
     baseUrl: 'http://localhost:3001',
     icon: 'Settings',
     pages: [
       { path: 'dashboard', name: 'Dashboard' },
       { path: 'entities', name: 'Entities' },
       { path: 'settings', name: 'Settings' }
     ]
   }
   ```

3. **Create app-specific pages** in `src/pages/apps/new-app/`

4. **Extend AppLayout** to conditionally render pages based on selected app

## Development Workflow

1. Start SuperAdmin console: `npm run dev`
2. Start WorkSafeAI backend: `npm run dev` in `/apps/worksafeai/api`
3. Both services run independently
4. SuperAdmin communicates with WorkSafeAI API via axios

## Deployment

SuperAdmin can be deployed:
- Same as WorkSafeAI frontend (Vercel, Netlify, AWS)
- Protected by IP whitelist (admin only)
- Domain: `admin.worksafeai.com` or `super-admin.worksafeai.com`
- Requires strong authentication for production

## Security Notes

⚠️ **This is a super-user admin console - handle with care!**

- [ ] Rate limit admin endpoints
- [ ] Log all admin actions (audit trail)
- [ ] Require strong 2FA for admin access
- [ ] Regular backups before bulk operations
- [ ] Review audit logs regularly
- [ ] Restrict network access to admin IPs

---

**Owner:** Tim Ryan
**Status:** Development
**Version:** 1.0
