import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verifying workforce session...</p>
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
        minHeight: '70vh',
        flexDirection: 'column',
        gap: '1.25rem',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'rgba(220, 88, 109, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--rose)'
        }}>
          <ShieldAlert size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Management Access Restricted</h2>
          <p style={{ maxWidth: 460, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            This section is reserved for <b>{allowedRoles.join(' / ')}</b> privileges. Your current active role is <b>{user.role}</b>.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Return to Workspace Dashboard
        </button>
      </div>
    );
  }

  return children;
}
