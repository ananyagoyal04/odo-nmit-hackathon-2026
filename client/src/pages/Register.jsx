import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import RevolvingFrames3D from '../components/RevolvingFrames3D';

export default function Register() {
  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    companyEmail: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    logo: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [registeredResult, setRegisteredResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'companyName' && !prev.companyCode) {
        next.companyCode = value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setBusy(true);
    try {
      const res = await register({
        ...formData,
        companyCode: formData.companyCode || formData.companyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'CO'
      });
      success('Organization created and administrator registered successfully!');
      setRegisteredResult(res?.company || { name: formData.companyName, code: formData.companyCode });
    } catch (err) {
      setError(err?.data?.message || err.message || 'Registration failed. Please verify inputs.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell" style={{ position: 'relative', overflow: 'hidden' }}>
      <RevolvingFrames3D />
      {/* Left visual */}
      <div className="auth-visual">
        <div className="brandmark">
          <div className="logo-chip">OI</div>
          <div className="name">Odoo India <span>· Workforce</span></div>
        </div>

        <div>
          <p className="quote">
            Launch your company workspace in seconds with <span>multi-tenant isolation</span> and atomic ID generation.
          </p>
          <p className="quote-sub">Enterprise-grade HRMS architecture</p>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          {registeredResult ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }} data-testid="registration-success-card">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Organization Registered!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                Your company workspace is fully provisioned with isolated tenant schemas.
              </p>
              <div style={{
                background: 'var(--bg-elevated)', padding: '1rem',
                borderRadius: 'var(--radius-md)', textAlign: 'left',
                marginBottom: '1.5rem', border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organization Name</div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{formData.companyName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Super Admin Email</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formData.adminEmail}</div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => navigate('/admin/login')}
                data-testid="go-to-admin-btn"
              >
                Sign In to Admin Workspace <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <h1>Register Organization</h1>
              <p className="sub">Set up your company workspace and Super Admin account.</p>

              {error && <div className="banner-error" data-testid="register-error-banner">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '0.75rem' }}>
                  <div className="field">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="e.g. Acme Corp"
                      value={formData.companyName}
                      onChange={handleChange}
                      data-testid="company-name-input"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Company Code</label>
                    <input
                      type="text"
                      name="companyCode"
                      placeholder="e.g. ACME"
                      value={formData.companyCode}
                      onChange={handleChange}
                      data-testid="company-code-input"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Company Work Email</label>
                  <input
                    type="email"
                    name="companyEmail"
                    placeholder="contact@acme.com"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    data-testid="company-email-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="field">
                    <label>Admin Full Name</label>
                    <input
                      type="text"
                      name="adminName"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.adminName}
                      onChange={handleChange}
                      data-testid="admin-name-input"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Admin Email</label>
                    <input
                      type="email"
                      name="adminEmail"
                      placeholder="admin@acme.com"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      data-testid="admin-email-input"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Contact Phone (Optional)</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    data-testid="phone-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="field">
                    <label>Password (min 6)</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      data-testid="password-input"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      data-testid="confirm-password-input"
                      required
                    />
                  </div>
                </div>

                <PasswordStrengthMeter password={formData.password} />

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  disabled={busy}
                  data-testid="register-submit-btn"
                >
                  {busy ? <span className="spinner" /> : <>Create Organization <ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="switch-line">
                Already registered?{' '}
                <Link to="/login" data-testid="login-redirect-link">
                  <b>Sign in instead</b>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
