import api from './api';

export const attendanceApi = {
  checkIn: () => api.post('/attendance/check-in', {}),
  checkOut: () => api.post('/attendance/check-out', {}),
  getMyAttendance: (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/attendance/me${qs}`);
  },
  getMonthlyAttendance: (params = {}) => {
    const query = new URLSearchParams();
    if (params.year) query.append('year', params.year);
    if (params.month) query.append('month', params.month);
    if (params.employeeId) query.append('employeeId', params.employeeId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/attendance/monthly${qs}`);
  },
  getCompanyAttendance: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.department) query.append('department', params.department);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/attendance${qs}`);
  }
};

export default attendanceApi;
