import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import MyProfile from './pages/MyProfile';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import Announcements from './pages/Announcements';
import Expenses from './pages/Expenses';
import Performance from './pages/Performance';
import Departments from './pages/Departments';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Workspace Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="employees" element={<Employees />} />
                <Route path="employees/:id" element={<EmployeeProfile />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="timeoff" element={<TimeOff />} />
                <Route path="payroll" element={<Payroll />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="performance" element={<Performance />} />

                {/* Management Role-gated Routes */}
                <Route
                  path="departments"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR']}>
                      <Departments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <AuditLogs />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
