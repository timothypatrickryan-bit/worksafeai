import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

const auditLogsAPI = {
  list: async (params = {}) => {
    const { data } = await apiClient.get(API_ENDPOINTS.audit.list, {
      params,
    });
    return data;
  },

  get: async (id) => {
    const { data } = await apiClient.get(`/api/admin/audit-logs/${id}`);
    return data;
  },

  filter: async (filters = {}) => {
    const { data } = await apiClient.get(API_ENDPOINTS.audit.list, {
      params: filters,
    });
    return data;
  },

  search: async (query) => {
    const { data } = await apiClient.get(API_ENDPOINTS.audit.list, {
      params: { search: query },
    });
    return data;
  },

  export: async (format = 'csv') => {
    const { data } = await apiClient.get('/api/admin/audit-logs/export', {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json',
    });
    return data;
  },
};

export default auditLogsAPI;
