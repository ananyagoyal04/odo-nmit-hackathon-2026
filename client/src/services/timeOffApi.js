import api from './api';

export const timeOffApi = {
  requestTimeOff: (payload) => api.post('/timeoff', payload),
  getMyTimeOff: () => api.get('/timeoff/me'),
  getCompanyTimeOff: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.type) query.append('type', params.type);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/timeoff${qs}`);
  },
  approveTimeOff: (id) => api.patch(`/timeoff/${id}/approve`, {}),
  rejectTimeOff: (id, rejectionReason) => api.patch(`/timeoff/${id}/reject`, { rejectionReason })
};

export default timeOffApi;
