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

  refund: async (id, reason = '') => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.subscriptions.refund.replace(':id', id),
      { reason }
    );
    return data;
  },

  cancel: async (id) => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.subscriptions.cancel.replace(':id', id)
    );
    return data;
  },

  extendTrial: async (id, days) => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.subscriptions.extendTrial.replace(':id', id),
      { days }
    );
    return data;
  },
};

export default subscriptionsAPI;
