import api from './api';

export const auditLogApi = {
  getLogs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.action) query.append('action', params.action);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/audit-logs${qs}`);
  }
};

export default auditLogApi;
