import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

const employeesAPI = {
  list: async (params = {}) => {
    const { data } = await apiClient.get(API_ENDPOINTS.employees.list, {
      params,
    });
    return data;
  },

  get: async (id) => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.employees.get.replace(':id', id)
    );
    return data;
  },

  invite: async (email, companyId = null) => {
    const { data } = await apiClient.post(API_ENDPOINTS.employees.invite, {
      email,
      companyId,
    });
    return data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.employees.delete.replace(':id', id)
    );
    return data;
  },

  update: async (id, updates) => {
    const { data } = await apiClient.put(
      API_ENDPOINTS.employees.update.replace(':id', id),
      updates
    );
    return data;
  },
};

export default employeesAPI;
