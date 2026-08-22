import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--copper)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading workforce session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div className="badge badge-absent" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          Access Forbidden (403)
        </div>
        <h2>Insufficient Permissions</h2>
        <p style={{ maxWidth: 420, color: 'var(--text-muted)' }}>
          Your current role (<b>{user.role}</b>) does not have permission to view this section.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
}
