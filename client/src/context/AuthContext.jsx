import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../services/authApi';
import attendanceApi from '../services/attendanceApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('odoo_auth_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('odoo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem('odoo_company');
    return saved ? JSON.parse(saved) : null;
  });
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch today's attendance status
  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await attendanceApi.getMyAttendance({ limit: 1 });
      if (res.success) {
        setTodayAttendance(res.today);
      }
    } catch {
      // Ignored if not authenticated or error
    }
  }, []);

  // Hydrate user profile on load or token change
  const refreshMe = useCallback(async () => {
    const activeToken = localStorage.getItem('odoo_auth_token');
    if (!activeToken) {
      setLoading(false);
      return null;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setCompany(res.company);
        setLeaveBalance(res.leaveBalance);
        localStorage.setItem('odoo_user', JSON.stringify(res.user));
        if (res.company) {
          localStorage.setItem('odoo_company', JSON.stringify(res.company));
        }
        await fetchTodayAttendance();
        return res.user;
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, [fetchTodayAttendance]);

  useEffect(() => {
    refreshMe();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [refreshMe]);

  const login = async (identifierOrPayload, maybePassword) => {
    const res = await authApi.login(identifierOrPayload, maybePassword);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      setCompany(res.company);
      localStorage.setItem('odoo_auth_token', res.token);
      localStorage.setItem('odoo_user', JSON.stringify(res.user));
      if (res.company) {
        localStorage.setItem('odoo_company', JSON.stringify(res.company));
      }
      await refreshMe();
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      setCompany(res.company);
      localStorage.setItem('odoo_auth_token', res.token);
      localStorage.setItem('odoo_user', JSON.stringify(res.user));
      if (res.company) {
        localStorage.setItem('odoo_company', JSON.stringify(res.company));
      }
      await refreshMe();
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCompany(null);
    setLeaveBalance(null);
    setTodayAttendance(null);
    localStorage.removeItem('odoo_auth_token');
    localStorage.removeItem('odoo_user');
    localStorage.removeItem('odoo_company');
  };

  const handleCheckIn = async () => {
    const res = await attendanceApi.checkIn();
    if (res.success) {
      setTodayAttendance(res.attendance);
      await refreshMe();
      return res;
    }
  };

  const handleCheckOut = async () => {
    const res = await attendanceApi.checkOut();
    if (res.success) {
      setTodayAttendance(res.attendance);
      await refreshMe();
      return res;
    }
  };

  const value = {
    token,
    user,
    company,
    leaveBalance,
    todayAttendance,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    refreshMe,
    handleCheckIn,
    handleCheckOut,
    fetchTodayAttendance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
