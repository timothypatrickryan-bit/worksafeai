# SuperAdmin Console - Setup Guide

Welcome to the SuperAdmin Console! This guide will help you get it up and running.

## Quick Start

### 1. Install Dependencies
```bash
cd apps/super-admin
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=SuperAdmin
```

### 3. Start the Console
```bash
npm run dev
```

Opens on `http://localhost:5174` (or next available port)

### 4. Login
For now, use mock credentials (backend auth to be implemented):
- Email: `admin@example.com`
- Password: `password`

---

## Current Features (MVP)

✅ **Working:**
- Dashboard with system stats
- Company management (list, create, search)
- Navigation and sidebar
- App selector (switch between WorkSafeAI + future apps)
- Login page

🚧 **To Be Implemented:**
- Company detail page (edit company profile)
- Employee management (create, list, edit)
- Subscription management
- Analytics dashboard
- Audit logs viewer
- Settings page
- Real API integration

---

## Development Notes

### Pages to Complete

**Priority 1 (MVP):**
1. `/src/pages/CompanyDetailPage.jsx` - Edit company + profile
2. `/src/pages/EmployeesPage.jsx` - List, create, manage employees
3. `/src/pages/SubscriptionsPage.jsx` - View and manage subscriptions

**Priority 2 (Beta):**
4. `/src/pages/AnalyticsPage.jsx` - System analytics
5. `/src/pages/AuditLogsPage.jsx` - Admin action logs
6. `/src/pages/SettingsPage.jsx` - App settings

### API Integration

Replace all `// TODO: Fetch from API` comments with actual API calls.

**Example - Current Companies Page:**
```javascript
// TODO: Replace with real API call
useEffect(() => {
  fetchCompanies();
}, [selectedApp]);

const fetchCompanies = async () => {
  try {
    const response = await apiClient.get('/api/admin/companies');
    setCompanies(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Backend Endpoints Needed

Create these in `/apps/worksafeai/api/src/routes/admin.js`:

```javascript
// Super admin routes - require super-admin role

router.get('/api/admin/companies', verifyAdmin, listCompanies);
router.post('/api/admin/companies', verifyAdmin, createCompany);
router.get('/api/admin/companies/:id', verifyAdmin, getCompanyDetail);
router.put('/api/admin/companies/:id', verifyAdmin, updateCompany);
router.delete('/api/admin/companies/:id', verifyAdmin, deleteCompany);

router.get('/api/admin/employees', verifyAdmin, listEmployees);
router.post('/api/admin/companies/:id/employees', verifyAdmin, createEmployee);
router.put('/api/admin/employees/:id', verifyAdmin, updateEmployee);
router.delete('/api/admin/employees/:id', verifyAdmin, deleteEmployee);

router.get('/api/admin/subscriptions', verifyAdmin, listSubscriptions);
router.get('/api/admin/subscriptions/:id', verifyAdmin, getSubscription);
router.put('/api/admin/subscriptions/:id', verifyAdmin, updateSubscription);

router.get('/api/admin/analytics/summary', verifyAdmin, getAnalyticsSummary);
router.get('/api/admin/audit-logs', verifyAdmin, getAuditLogs);
```

### Mock vs Real Data

Currently using mock data for development. To switch to real data:

1. Implement backend admin routes
2. Update API client with proper error handling
3. Add loading states and error boundaries
4. Test each page

---

## Extending for Future Apps

When you create a new app (e.g., "ToolTracker", "SafetyPulse"):

### 1. Add to App Config
Update `/src/stores/appStore.js`:
```javascript
{
  id: 'new-app',
  name: 'New App Name',
  baseUrl: 'http://localhost:3001',
  icon: 'Settings',
  description: 'Description of the new app',
}
```

### 2. Create App-Specific Pages
Create folder: `/src/pages/apps/new-app/`
- `DashboardPage.jsx`
- `EntitiesPage.jsx`
- `SettingsPage.jsx`

### 3. Add Backend Endpoints
Create `/api/admin` routes in the new app's backend

### 4. Link in App.jsx
Add conditional routes based on `selectedApp`

---

## File Structure Breakdown

```
apps/super-admin/
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── index.html                # HTML entry point
├── src/
│   ├── main.jsx              # React entry
│   ├── App.jsx               # Main app + routing
│   ├── index.css             # Global styles
│   ├── pages/
│   │   ├── LoginPage.jsx     # ✅ Login (done)
│   │   ├── DashboardPage.jsx # ✅ Dashboard (done)
│   │   ├── CompaniesPage.jsx # ✅ List companies (done)
│   │   ├── CompanyDetailPage.jsx  # 🚧 TODO
│   │   ├── EmployeesPage.jsx      # 🚧 TODO
│   │   ├── SubscriptionsPage.jsx  # 🚧 TODO
│   │   ├── AnalyticsPage.jsx      # 🚧 TODO
│   │   ├── AuditLogsPage.jsx      # 🚧 TODO
│   │   └── SettingsPage.jsx       # 🚧 TODO
│   ├── components/
│   │   ├── Layout.jsx        # Main layout + sidebar (done)
│   │   ├── Sidebar.jsx       # 🚧 TODO (merge into Layout)
│   │   ├── Modal.jsx         # 🚧 TODO (reusable modal)
│   │   ├── Table.jsx         # 🚧 TODO (reusable table)
│   │   └── Form.jsx          # 🚧 TODO (reusable form)
│   ├── stores/
│   │   ├── authStore.js      # ✅ Auth state (done)
│   │   ├── appStore.js       # ✅ App selection (done)
│   │   └── filterStore.js    # 🚧 TODO (for filters)
│   ├── api/
│   │   └── client.js         # 🚧 TODO (axios client)
│   └── hooks/
│       ├── useFetch.js       # 🚧 TODO (data fetching)
│       └── useForm.js        # 🚧 TODO (form handling)
├── .env.example              # Environment template
└── README.md                 # Documentation
```

---

## Next Steps

1. **Test current setup:**
   ```bash
   npm run dev
   # Should open on http://localhost:5174
   ```

2. **Create remaining pages** (CompanyDetailPage, EmployeesPage, etc.)

3. **Implement API client** with proper error handling

4. **Build backend admin routes** in WorkSafeAI API

5. **Test each page** with real data

6. **Deploy** to production (same as WorkSafeAI frontend)

---

## Support

Questions? Check:
- README.md for feature overview
- App.jsx for routing structure
- stores/ folder for state management patterns
- pages/CompaniesPage.jsx for component example

---

**Created:** March 2026
**Status:** MVP Ready for Development
