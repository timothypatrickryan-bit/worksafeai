import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

const analyticsAPI = {
  getSummary: async () => {
    const { data } = await apiClient.get(API_ENDPOINTS.analytics.summary);
    return data;
  },

  getRevenueTrend: async (period = 'month') => {
    const { data } = await apiClient.get(API_ENDPOINTS.analytics.revenue, {
      params: { period },
    });
    return data;
  },

  getPlanDistribution: async () => {
    const { data } = await apiClient.get(API_ENDPOINTS.analytics.plans);
    return data;
  },

  getMetrics: async () => {
    const { data } = await apiClient.get(API_ENDPOINTS.analytics.metrics);
    return data;
  },

  getEmployeeStats: async () => {
    const { data } = await apiClient.get('/api/admin/analytics/employees');
    return data;
  },

  getCompanyStats: async () => {
    const { data } = await apiClient.get('/api/admin/analytics/companies');
    return data;
  },

  getChurnRate: async () => {
    const { data } = await apiClient.get('/api/admin/analytics/churn');
    return data;
  },

  getTrialConversion: async () => {
    const { data } = await apiClient.get('/api/admin/analytics/trial-conversion');
    return data;
  },
};

export default analyticsAPI;
