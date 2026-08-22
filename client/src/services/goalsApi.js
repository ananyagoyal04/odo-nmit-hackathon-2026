import api from './api';

export const goalsApi = {
  getGoals: (params = {}) => {
    const query = new URLSearchParams();
    if (params.quarter) query.append('quarter', params.quarter);
    if (params.employeeId) query.append('employeeId', params.employeeId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/goals${qs}`);
  },
  createGoal: (payload) => api.post('/goals', payload),
  updateProgress: (id, progress, status) => api.patch(`/goals/${id}/progress`, { progress, status })
};

export default goalsApi;
