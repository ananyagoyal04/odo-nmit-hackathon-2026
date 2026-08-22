import api from './api';

export const salaryApi = {
  getSalary: (employeeId) => api.get(`/employees/${employeeId}/salary`),
  updateSalary: (employeeId, monthlyWage) => api.patch(`/employees/${employeeId}/salary`, { monthlyWage })
};

export default salaryApi;
