import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building, ShieldCheck } from 'lucide-react';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setBusy(true);
    try {
      await register(formData);
      success('Company registered and admin workspace activated!');
      navigate('/dashboard');
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
          <h1>Register Organization</h1>
          <p className="sub">Set up your company workspace and Super Admin account.</p>

          {error && <div className="banner-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. Acme Corp"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Company Email</label>
                <input
                  type="email"
                  name="companyEmail"
                  placeholder="contact@acme.com"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  required
                />
              </div>
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
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Password (min 8)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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
                  required
                />
              </div>
            </div>

            <PasswordStrengthMeter password={formData.password} />

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={busy}
            >
              {busy ? <span className="spinner" /> : <>Create Organization <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="switch-line">
            Already registered?{' '}
            <Link to="/login">
              <b>Sign in instead</b>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
