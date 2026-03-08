// API Endpoints configuration for WorkSafeAI Admin

export const ENDPOINTS = {
  // Admin Companies
  COMPANIES: {
    LIST: '/api/admin/companies',
    CREATE: '/api/admin/companies',
    GET: (id) => `/api/admin/companies/${id}`,
    UPDATE: (id) => `/api/admin/companies/${id}`,
    DELETE: (id) => `/api/admin/companies/${id}`,
    PROFILE: (id) => `/api/admin/companies/${id}/profile`,
  },

  // Admin Employees
  EMPLOYEES: {
    LIST: '/api/admin/employees',
    CREATE: (companyId) => `/api/admin/companies/${companyId}/employees`,
    GET: (id) => `/api/admin/employees/${id}`,
    UPDATE: (id) => `/api/admin/employees/${id}`,
    DELETE: (id) => `/api/admin/employees/${id}`,
    INVITE: '/api/admin/employees/invite',
    BULK_INVITE: '/api/admin/employees/bulk-invite',
    RESET_PASSWORD: (id) => `/api/admin/employees/${id}/reset-password`,
  },

  // Admin Subscriptions
  SUBSCRIPTIONS: {
    LIST: '/api/admin/subscriptions',
    GET: (id) => `/api/admin/subscriptions/${id}`,
    UPDATE: (id) => `/api/admin/subscriptions/${id}`,
    REFUND: (id) => `/api/admin/subscriptions/${id}/refund`,
    EXTEND_TRIAL: (id) => `/api/admin/subscriptions/${id}/extend-trial`,
  },

  // Admin Analytics
  ANALYTICS: {
    SUMMARY: '/api/admin/analytics/summary',
    COMPANIES: '/api/admin/analytics/companies',
    EMPLOYEES: '/api/admin/analytics/employees',
    SUBSCRIPTIONS: '/api/admin/analytics/subscriptions',
    JTSAS: '/api/admin/analytics/jtsas',
    REVENUE: '/api/admin/analytics/revenue',
    CHURN: '/api/admin/analytics/churn',
  },

  // Admin Audit Logs
  AUDIT_LOGS: {
    LIST: '/api/admin/audit-logs',
    GET: (id) => `/api/admin/audit-logs/${id}`,
  },

  // Admin Support
  SUPPORT: {
    TICKETS: '/api/admin/support/tickets',
    GET: (id) => `/api/admin/support/tickets/${id}`,
    CREATE: '/api/admin/support/tickets',
    UPDATE: (id) => `/api/admin/support/tickets/${id}`,
  },

  // Admin Settings
  SETTINGS: {
    GENERAL: '/api/admin/settings/general',
    USERS: '/api/admin/settings/users',
    API_KEYS: '/api/admin/settings/api-keys',
    WEBHOOKS: '/api/admin/settings/webhooks',
    EMAIL_TEMPLATES: '/api/admin/settings/email-templates',
    FEATURE_FLAGS: '/api/admin/settings/feature-flags',
  },

  // Health & Status
  HEALTH: '/api/health',
};

// Flat API_ENDPOINTS for use in services
export const API_ENDPOINTS = {
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
    update: '/api/admin/employees/:id',
  },
  subscriptions: {
    list: '/api/admin/subscriptions',
    get: '/api/admin/subscriptions/:id',
    upgrade: '/api/admin/subscriptions/:id/upgrade',
    refund: '/api/admin/subscriptions/:id/refund',
    cancel: '/api/admin/subscriptions/:id/cancel',
    extendTrial: '/api/admin/subscriptions/:id/extend-trial',
  },
  analytics: {
    summary: '/api/admin/analytics/summary',
    revenue: '/api/admin/analytics/revenue',
    plans: '/api/admin/analytics/plan-distribution',
    metrics: '/api/admin/analytics/metrics',
  },
  audit: {
    list: '/api/admin/audit-logs',
    get: '/api/admin/audit-logs/:id',
  },
};

export default ENDPOINTS;
