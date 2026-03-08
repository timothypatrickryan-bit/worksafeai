import client from './client';
import { ENDPOINTS } from './endpoints';

export const companiesAPI = {
  // List all companies
  list: async (params = {}) => {
    const response = await client.get(ENDPOINTS.COMPANIES.LIST, { params });
    return response.data;
  },

  // Get single company
  get: async (id) => {
    const response = await client.get(ENDPOINTS.COMPANIES.GET(id));
    return response.data;
  },

  // Create company
  create: async (data) => {
    const response = await client.post(ENDPOINTS.COMPANIES.CREATE, data);
    return response.data;
  },

  // Update company
  update: async (id, data) => {
    const response = await client.put(ENDPOINTS.COMPANIES.UPDATE(id), data);
    return response.data;
  },

  // Delete company
  delete: async (id) => {
    const response = await client.delete(ENDPOINTS.COMPANIES.DELETE(id));
    return response.data;
  },

  // Get/Update company profile
  getProfile: async (id) => {
    const response = await client.get(ENDPOINTS.COMPANIES.PROFILE(id));
    return response.data;
  },

  updateProfile: async (id, profile) => {
    const response = await client.put(ENDPOINTS.COMPANIES.PROFILE(id), profile);
    return response.data;
  },

  // Bulk operations
  bulkDelete: async (ids) => {
    const response = await client.post(`${ENDPOINTS.COMPANIES.LIST}/bulk-delete`, { ids });
    return response.data;
  },

  bulkArchive: async (ids) => {
    const response = await client.post(`${ENDPOINTS.COMPANIES.LIST}/bulk-archive`, { ids });
    return response.data;
  },

  bulkChangePlan: async (ids, plan) => {
    const response = await client.post(`${ENDPOINTS.COMPANIES.LIST}/bulk-change-plan`, { ids, plan });
    return response.data;
  },

  // Export
  export: async (format = 'csv') => {
    const response = await client.get(ENDPOINTS.COMPANIES.LIST, {
      params: { export: format },
      responseType: format === 'csv' ? 'blob' : 'json',
    });
    return response.data;
  },
};

export default companiesAPI;
