import api from './api';

export const announcementsApi = {
  getAnnouncements: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/announcements${qs}`);
  },
  createAnnouncement: (payload) => api.post('/announcements', payload),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`)
};

export default announcementsApi;
