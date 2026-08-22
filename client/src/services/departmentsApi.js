import api from './api';

export const departmentsApi = {
  getDepartments: () => api.get('/departments'),
  createDepartment: (payload) => api.post('/departments', payload),
  updateDepartment: (id, payload) => api.patch(`/departments/${id}`, payload),
  deleteDepartment: (id) => api.delete(`/departments/${id}`)
};

export default departmentsApi;
