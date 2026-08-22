import api from './api';

export const employeesApi = {
  getEmployees: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/employees${qs}`);
  },
  exportEmployees: async () => {
    const token = localStorage.getItem('odoo_auth_token');
    const response = await fetch('/api/employees/export', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_directory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  createEmployee: (payload) => api.post('/employees', payload),
  updateEmployee: (id, payload) => api.patch(`/employees/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/employees/${id}/status`, { status }),
  deleteEmployee: (id) => api.delete(`/employees/${id}`)
};

export default employeesApi;
