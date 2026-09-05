import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Building, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RevolvingFrames3D from '../components/RevolvingFrames3D';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [companyCode, setCompanyCode] = useState('OI');
  const [identifier, setIdentifier] = useState('OI220003');
  const [password, setPassword] = useState('Password@123');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
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
        success(`Welcome back, ${res.user.fullName || res.user.firstName}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const quickFillShruthika = () => {
    setCompanyCode('OI');
    setIdentifier('OI220003');
    setPassword('Password@123');
  };

  const quickFillAarav = () => {
    setCompanyCode('OI');
    setIdentifier('OI230004');
    setPassword('Password@123');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '1.5rem', overflow: 'hidden' }}>
      {/* 3D Revolving Architectural Workspace Background */}
      <RevolvingFrames3D />

      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(34, 27, 25, 0.95)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2.25rem',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          backdropFilter: 'blur(16px)'
        }}
      >
        {/* Brandmark */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--copper), var(--copper-dark))',
              color: '#120e0d',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              boxShadow: '0 4px 16px var(--copper-glow)',
              marginBottom: '0.85rem'
            }}
          >
            OI
          </div>

          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
            Employee Workspace
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Sign in to your workplace account and daily tools.
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
            style={{
              flex: 1,
              backgroundColor: 'var(--copper)',
              color: '#120e0d',
              fontWeight: 800,
              boxShadow: '0 2px 8px var(--copper-glow)'
            }}
          >
            💻 Employee Portal
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ flex: 1, backgroundColor: 'transparent', color: 'var(--text-dim)' }}
            onClick={() => navigate('/admin/login')}
            data-testid="switch-admin-portal-btn"
          >
            👑 Admin Portal
          </button>
        </div>

        {errorMessage && (
          <div className="banner-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-testid="login-error-banner">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                data-testid="company-code-input"
              />
            </div>
          </div>

          <div className="field">
            <label>Work Email or Employee Login ID *</label>
            <div className="input-wrap">
              <input
                type="text"
                placeholder="OI220003 or shruthika.dutta@odooindia.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                data-testid="identifier-input"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Password *</label>
            <div className="input-wrap">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={submitting}
            data-testid="login-submit-btn"
          >
            {submitting ? <span className="spinner" /> : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Demo Quick Fills */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
            Quick Demo Employee Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={quickFillShruthika}
              style={{ fontSize: '0.78rem' }}
              data-testid="demo-login-btn"
            >
              👩‍💻 Shruthika (Eng)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={quickFillAarav}
              style={{ fontSize: '0.78rem' }}
              data-testid="demo-login-aarav"
            >
              🎨 Aarav (Design)
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Register a new organization?{' '}
          <Link to="/register" style={{ color: 'var(--copper)', fontWeight: 700 }} data-testid="register-link">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
