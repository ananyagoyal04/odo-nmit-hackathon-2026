import api from './api';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (identifierOrPayload, maybePassword) => {
    const payload =
      typeof identifierOrPayload === 'object' && identifierOrPayload !== null
        ? identifierOrPayload
        : { identifier: identifierOrPayload, password: maybePassword };
    return api.post('/auth/login', payload);
  },
  getMe: () => api.get('/auth/me'),
  changePassword: (payload) => api.post('/auth/change-password', payload)
};

export default authApi;
