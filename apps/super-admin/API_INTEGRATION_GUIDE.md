# API Integration Guide — SuperAdmin to WorkSafeAI Backend

## 📡 Current Status

**Mock Data:** All pages use mock/simulated API responses  
**Target:** Connect to real WorkSafeAI backend at `localhost:3000` (production: `https://api.worksafeai.com`)

---

## 🔗 Available Backend Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Companies (Admin)
```
GET /api/admin/companies?page=1&pageSize=20&search=&status=&plan=
GET /api/admin/companies/:id
POST /api/admin/companies
PUT /api/admin/companies/:id
DELETE /api/admin/companies/:id
POST /api/admin/companies/bulk-export
```

### Employees (Admin)
```
GET /api/admin/employees?page=1&pageSize=20&search=
GET /api/admin/employees/:id
POST /api/admin/employees/invite
DELETE /api/admin/employees/:id
```

### Subscriptions (Admin)
```
GET /api/admin/subscriptions?page=1&pageSize=20
GET /api/admin/subscriptions/:id
POST /api/admin/subscriptions/:id/upgrade
POST /api/admin/subscriptions/:id/refund
```

### Analytics (Admin)
```
GET /api/admin/analytics/summary
GET /api/admin/analytics/revenue-trend?period=month
GET /api/admin/analytics/plan-distribution
GET /api/admin/analytics/metrics
```

### Audit Logs (Admin)
```
GET /api/admin/audit-logs?page=1&pageSize=20&filter=
```

---

## 🚀 Integration Steps

### Step 1: Update API Configuration

**File:** `src/api/endpoints.js`

Change from mock URLs to actual backend:

```javascript
// Current (mock)
const API_ENDPOINTS = {
  companies: {
    list: '/mock/companies',
  },
};

// Update to:
const API_ENDPOINTS = {
  companies: {
    list: '/api/admin/companies',
    get: '/api/admin/companies/:id',
    create: '/api/admin/companies',
    update: '/api/admin/companies/:id',
    delete: '/api/admin/companies/:id',
  },
  employees: {
    list: '/api/admin/employees',
    get: '/api/admin/employees/:id',
    invite: '/api/admin/employees/invite',
    delete: '/api/admin/employees/:id',
  },
  subscriptions: {
    list: '/api/admin/subscriptions',
    get: '/api/admin/subscriptions/:id',
    upgrade: '/api/admin/subscriptions/:id/upgrade',
  },
  analytics: {
    summary: '/api/admin/analytics/summary',
    revenue: '/api/admin/analytics/revenue-trend',
    plans: '/api/admin/analytics/plan-distribution',
  },
  audit: {
    list: '/api/admin/audit-logs',
  },
};
```

### Step 2: Create Real API Services

**File:** `src/api/subscriptions.js`

```javascript
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

const subscriptionsAPI = {
  list: async (params = {}) => {
    const { data } = await apiClient.get(API_ENDPOINTS.subscriptions.list, {
      params,
    });
    return data;
  },

  get: async (id) => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.subscriptions.get.replace(':id', id)
    );
    return data;
  },

  upgrade: async (id, plan) => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.subscriptions.upgrade.replace(':id', id),
      { plan }
    );
    return data;
  },

  refund: async (id) => {
    const { data } = await apiClient.post(
      `/api/admin/subscriptions/${id}/refund`
    );
    return data;
  },
};

export default subscriptionsAPI;
```

### Step 3: Create Services for Other Resources

Repeat the pattern for:
- `src/api/employees.js`
- `src/api/subscriptions.js`
- `src/api/analytics.js`
- `src/api/auditLogs.js`

### Step 4: Update Page Components

**File:** `src/pages/SubscriptionsPage.jsx`

Change from mock to real API:

```javascript
// Current
import { useMemo, useState } from 'react';
import useFetch from '../hooks/useFetch';

const mockSubscriptionsAPI = {
  list: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockData]);
      }, 1000);
    });
  },
};

// Update to
import subscriptionsAPI from '../api/subscriptions';

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: subscriptions = [], loading } = useFetch(
    () => subscriptionsAPI.list({ page, pageSize }),
    [page, pageSize]
  );

  // Rest of component...
}
```

### Step 5: Environment Configuration

**File:** `.env.local`

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
```

**File:** `src/api/client.js`

```javascript
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL,
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
});
```

---

## 📋 Integration Checklist

### Phase 1: Core APIs (High Priority)
- [ ] Companies API (list, create, update, delete)
- [ ] Employees API (list, invite, delete)
- [ ] Subscriptions API (list, get, upgrade)

### Phase 2: Analytics & Admin (Medium Priority)
- [ ] Analytics API (summary, revenue, plans)
- [ ] Audit Logs API (list, filter)
- [ ] Settings/Config API

### Phase 3: Advanced Features (Low Priority)
- [ ] Bulk operations
- [ ] CSV export (backend processing)
- [ ] Report generation
- [ ] Scheduled tasks

---

## 🧪 Testing Integration

### Before Going Live:

1. **Manual Testing:**
   ```bash
   # Start backend
   cd /Users/timothyryan/.openclaw/workspace/apps/worksafeai/api
   npm run dev

   # Start frontend
   cd /Users/timothyryan/.openclaw/workspace/apps/super-admin
   npm run dev

   # Visit localhost:5174, login, test CRUD operations
   ```

2. **API Response Verification:**
   ```javascript
   // In browser console
   const response = await fetch('http://localhost:3000/api/admin/companies');
   const data = await response.json();
   console.log(data);
   ```

3. **Error Handling:**
   - Test with network offline
   - Test with invalid tokens (should logout)
   - Test with server errors (5xx)
   - Verify toast notifications appear

4. **Performance:**
   - Test with large datasets (1000+ items)
   - Monitor pagination performance
   - Check for memory leaks (open DevTools)

---

## 🔐 Authentication

### Current (Mock)
```javascript
// Login store sets dummy token
const { token } = useAuthStore();
// "eyJhbGc..." (hardcoded)
```

### Update to Real Auth

**File:** `src/pages/LoginPage.jsx`

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await authAPI.login({
      email,
      password,
    });

    // Backend returns: { token, refreshToken, user, ... }
    setToken(response.token);
    setUser(response.user);
    setToken(response.refreshToken, 'refresh');

    navigate('/');
  } catch (err) {
    addNotification(`Login failed: ${err.message}`, 'error');
  }
};
```

---

## 📊 Expected Response Formats

### Companies List
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "ABC Construction",
      "email": "contact@abc.com",
      "phone": "(555) 123-4567",
      "plan": "pro",
      "status": "active",
      "employees": 45,
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### Subscriptions List
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "plan": "pro",
      "status": "active",
      "monthlyRevenue": 79.99,
      "trialEndsAt": null,
      "nextBillingDate": "2026-04-15T00:00:00Z",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
```
Error: Unauthorized
Solution: Token expired or invalid. Auto-logout should redirect to /login.
Check: useAuthStore() auto-refresh logic
```

### Issue: CORS Errors
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution: Backend should have CORS headers configured
Check: Backend .env ALLOWED_ORIGINS includes frontend URL
```

### Issue: Slow Pagination
```
Error: Loading takes >5 seconds
Solution: Implement backend query optimization
Check: Database indexes, pagination limits, filter efficiency
```

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| List Load | < 2s | Mocked (instant) |
| Create/Update | < 1s | Mocked (instant) |
| Delete | < 1s | Mocked (instant) |
| Pagination | < 500ms | N/A (mock) |
| API Timeout | 10s | Configured |

---

## 🚀 Deployment

### Local Development
```bash
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

### Staging
```bash
VITE_API_BASE_URL=https://staging-api.worksafeai.com npm run build
```

### Production
```bash
VITE_API_BASE_URL=https://api.worksafeai.com npm run build
```

---

## 📚 Backend API Documentation

For detailed backend API docs, see:
- `/apps/worksafeai/api/ENDPOINTS.md`
- `/apps/worksafeai/api/README.md`

---

**Status:** Ready for integration  
**Estimated Time:** 2-3 hours to fully integrate all endpoints  
**Next Step:** Create `src/api/subscriptions.js` and start integration tests

