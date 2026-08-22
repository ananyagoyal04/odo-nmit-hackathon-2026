import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  Save,
  CheckCircle2,
  Image,
  Award,
  BookOpen,
  DollarSign,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import employeesApi from '../services/employeesApi';
import Tilt3DCard from '../components/Tilt3DCard';

export default function MyProfile() {
  const { user, setUser } = useAuth();
  const { success, error } = useToast();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    personalEmail: '',
    address: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    nationality: 'Indian',
    about: '',
    jobDescription: '',
    hobbies: '',
    skills: '',
    certifications: '',
    avatarUrl: '',
    bankInfo: {
      bankName: '',
      accountNumber: '',
      ifsc: '',
      pan: '',
      uan: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        personalEmail: user.personalEmail || '',
        address: user.address || '',
        gender: user.gender || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        maritalStatus: user.maritalStatus || '',
        nationality: user.nationality || 'Indian',
        about: user.about || '',
        jobDescription: user.jobDescription || '',
        hobbies: user.hobbies || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        certifications: Array.isArray(user.certifications) ? user.certifications.join(', ') : (user.certifications || ''),
        avatarUrl: user.avatarUrl || '',
        bankInfo: {
          bankName: user.bankInfo?.bankName || '',
          accountNumber: user.bankInfo?.accountNumber || '',
          ifsc: user.bankInfo?.ifsc || '',
          pan: user.bankInfo?.pan || '',
          uan: user.bankInfo?.uan || ''
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        personalEmail: formData.personalEmail,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dob || null,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        about: formData.about,
        jobDescription: formData.jobDescription,
        hobbies: formData.hobbies,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        certifications: formData.certifications ? formData.certifications.split(',').map((c) => c.trim()).filter(Boolean) : [],
        avatarUrl: formData.avatarUrl,
        bankInfo: formData.bankInfo
      };

      const res = await employeesApi.updateEmployee(user._id, payload);
      if (res.success) {
        success('Profile updated successfully!');
        if (setUser) {
          setUser((prev) => ({ ...prev, ...res.employee }));
        }
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>My Personal Profile & Account</h1>
          <p className="page-subtitle">
            Manage your employee profile details, bio, skills, portrait photo, and banking information.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? <span className="spinner" /> : <><Save size={16} /> Save Profile Changes</>}
        </button>
      </div>

      {/* Top Banner Card with Portrait Preview */}
      <Tilt3DCard style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div
            className="avatar"
            style={{
              width: 72,
              height: 72,
              backgroundImage: formData.avatarUrl ? `url(${formData.avatarUrl})` : 'none',
              backgroundColor: user?.avatarColor || 'var(--copper)',
              fontSize: '1.75rem',
              border: '3px solid var(--copper)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }}
          >
            {!formData.avatarUrl && (user?.firstName?.[0] + (user?.lastName?.[0] || ''))}
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.65rem' }}>{user?.fullName || user?.firstName}</h2>
              <span className="badge badge-copper">{user?.role}</span>
              <span className="badge badge-success">ID: {user?.loginId}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {user?.designation || 'Staff Member'} · {user?.email}
            </div>
          </div>
        </div>
      </Tilt3DCard>

      {/* Profile Form Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <User size={16} /> Personal Details & Photo
        </button>
        <button
          className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          <BookOpen size={16} /> About, Skills & Portfolio
        </button>
        <button
          className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          <DollarSign size={16} /> Banking & Statutory ID
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 1: General & Photo */}
        {activeTab === 'general' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <User size={18} color="var(--copper)" /> Personal Information & Portrait
              </div>
            </div>

            <div className="field">
              <label>Profile Portrait Photo URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or image link"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Paste any high-resolution image link to update your portrait avatar across the entire system.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Personal Email</label>
                <input
                  type="email"
                  placeholder="personal@gmail.com"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Residential Address</label>
              <textarea
                rows={2}
                placeholder="Street address, City, State..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Resume, Skills & About */}
        {activeTab === 'resume' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BookOpen size={18} color="var(--copper)" /> Professional Biography & Skills
              </div>
            </div>

            <div className="field">
              <label>About Me (Bio)</label>
              <textarea
                rows={4}
                placeholder="Share your background, passion, and professional journey..."
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Job Description & Responsibilities</label>
              <textarea
                rows={3}
                placeholder="Describe your daily scope and core deliverables..."
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, MongoDB, Figma, Leadership"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Certifications (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. AWS Certified Solutions Architect, Google UX"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Hobbies & Personal Interests</label>
              <input
                type="text"
                placeholder="e.g. Specialty Coffee, Photography, Classical Music, Running"
                value={formData.hobbies}
                onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Banking & Statutory IDs */}
        {activeTab === 'bank' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <DollarSign size={18} color="var(--copper)" /> Banking & Statutory Information
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  value={formData.bankInfo.bankName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankInfo: { ...formData.bankInfo, bankName: e.target.value }
                  })}
                />
              </div>

              <div className="field">
                <label>Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 50100482910293"
                  value={formData.bankInfo.accountNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankInfo: { ...formData.bankInfo, accountNumber: e.target.value }
                  })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>IFSC Code</label>
                <input
                  type="text"
                  placeholder="HDFC0000123"
                  value={formData.bankInfo.ifsc}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankInfo: { ...formData.bankInfo, ifsc: e.target.value.toUpperCase() }
                  })}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="field">
                <label>PAN Card Number</label>
                <input
                  type="text"
                  placeholder="ABCPS1234D"
                  value={formData.bankInfo.pan}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankInfo: { ...formData.bankInfo, pan: e.target.value.toUpperCase() }
                  })}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="field">
                <label>UAN Number (PF)</label>
                <input
                  type="text"
                  placeholder="100918273645"
                  value={formData.bankInfo.uan}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankInfo: { ...formData.bankInfo, uan: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> Save Profile Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
