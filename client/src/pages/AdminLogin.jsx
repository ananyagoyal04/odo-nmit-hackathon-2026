import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Building, UserCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RevolvingFrames3D from '../components/RevolvingFrames3D';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [companyCode, setCompanyCode] = useState('OI');
  const [identifier, setIdentifier] = useState('ananya00476@gmail.com');
  const [password, setPassword] = useState('nutan@1979');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await login({
        companyCode: companyCode.trim().toUpperCase(),
        identifier: identifier.trim(),
        password
      });

      if (res.success) {
        // Enforce Admin / HR clearance
        if (!['SUPER_ADMIN', 'HR'].includes(res.user.role)) {
          setErrorMessage('Access Denied: Standard Employee accounts must sign in via the Employee Workspace portal.');
          return;
        }

        success(`Welcome back, ${res.user.fullName || res.user.firstName}! (Admin Clearance Active)`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err?.data?.message || err.message || 'Admin authentication failed.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const quickFillAdmin = () => {
    setCompanyCode('OI');
    setIdentifier('ananya00476@gmail.com');
    setPassword('nutan@1979');
  };

  const quickFillHR = () => {
    setCompanyCode('OI');
    setIdentifier('hr@odooindia.com');
    setPassword('Password@123');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '1.5rem', overflow: 'hidden' }}>
      {/* 3D Revolving Architectural Background */}
      <RevolvingFrames3D />

      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(34, 27, 25, 0.95)',
          border: '1.5px solid var(--border-copper)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2.25rem',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          backdropFilter: 'blur(16px)'
        }}
      >
        {/* Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--copper), var(--copper-dark))',
              color: '#120e0d',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px var(--copper-glow)',
              marginBottom: '1rem'
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
            Admin & Executive Portal
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            High-clearance security portal for Super Administrators & HR Managers.
          </p>
        </div>

        {/* Portal Switcher Pill Bar */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-pill)',
            padding: '0.25rem',
            marginBottom: '1.75rem'
          }}
        >
          <button
            type="button"
            className="btn btn-sm"
            style={{ flex: 1, backgroundColor: 'transparent', color: 'var(--text-dim)' }}
            onClick={() => navigate('/login')}
          >
            💻 Employee Portal
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              flex: 1,
              backgroundColor: 'var(--copper)',
              color: '#120e0d',
              fontWeight: 800,
              boxShadow: '0 2px 8px var(--copper-glow)'
            }}
          >
            👑 Admin Portal
          </button>
        </div>

        {errorMessage && (
          <div className="banner-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleAdminSubmit}>
          <div className="field">
            <label>Company Code *</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="e.g. OI"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                required
                style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div className="field">
            <label>Admin Work Email / Login ID *</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="admin@odooindia.com or OI..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Admin Security Password *</label>
            <div className="input-wrap">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={submitting}
          >
            {submitting ? <span className="spinner" /> : 'Authenticate & Access Admin Dashboard'}
          </button>
        </form>

        {/* Quick-fill credentials */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
            Quick Admin Clearance Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={quickFillAdmin}
              style={{ fontSize: '0.78rem' }}
            >
              👑 Super Admin (Ananya)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={quickFillHR}
              style={{ fontSize: '0.78rem' }}
            >
              💼 HR Manager (Priya)
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Are you an employee?{' '}
          <Link to="/login" style={{ color: 'var(--copper)', fontWeight: 700 }}>
            Go to Employee Sign In ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
