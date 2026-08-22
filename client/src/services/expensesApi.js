import api from './api';

export const expensesApi = {
  getExpenses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.category) query.append('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/expenses${qs}`);
  },
  createExpense: (payload) => api.post('/expenses', payload),
  reviewExpense: (id, action, rejectionReason = '') =>
    api.patch(`/expenses/${id}/action`, { action, rejectionReason })
};

export default expensesApi;
