import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  FileText,
  Lock,
  DollarSign,
  Shield,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Award,
  Layers,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import employeesApi from '../services/employeesApi';
import salaryApi from '../services/salaryApi';
import departmentsApi from '../services/departmentsApi';

/**
 * Client-side salary formula calculator for live simulation
 */
function simulateSalary(wageInput) {
  const wage = Number(wageInput) || 0;
  const basic = Number((wage * 0.5).toFixed(2));
  const hra = Number((basic * 0.5).toFixed(2));
  const standardAllowance = Number((wage * 0.1667).toFixed(2));
  const perfBonus = Number((wage * 0.0833).toFixed(2));
  const lta = Number((wage * 0.0833).toFixed(2));
  const fixed = Number((wage - (basic + hra + standardAllowance + perfBonus + lta)).toFixed(2));
  const pfEmployee = Number((basic * 0.12).toFixed(2));
  const pfEmployer = Number((basic * 0.12).toFixed(2));
  const professionalTax = 200;
  const netTakeHome = Number((wage - pfEmployee - professionalTax).toFixed(2));
  const yearlyWage = Number((wage * 12).toFixed(2));

  return {
    monthlyWage: wage,
    basic,
    hra,
    standardAllowance,
    perfBonus,
    lta,
    fixed,
    pfEmployee,
    pfEmployer,
    professionalTax,
    netTakeHome,
    yearlyWage
  };
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('resume');
  const [employee, setEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveBusy, setSaveBusy] = useState(false);

  // Form state
  const [editForm, setEditForm] = useState({});
  const [editingWage, setEditingWage] = useState(0);
  const [simulatedWage, setSimulatedWage] = useState(0);

  const isSelf = String(currentUser?._id) === String(id);
  const isAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isHR = currentUser?.role === 'HR';
  const canEditGeneral = isSelf || isAdmin || isHR;
  const canViewSalary = isSelf || isAdmin || isHR;
  const canEditSalary = isAdmin || isHR;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await employeesApi.getEmployeeById(id);
      if (res.success) {
        setEmployee(res.employee);
        setLeaveBalance(res.leaveBalance);
        setEditForm({
          firstName: res.employee.firstName || '',
          lastName: res.employee.lastName || '',
          phone: res.employee.phone || '',
          designation: res.employee.designation || '',
          department: typeof res.employee.department === 'object' ? res.employee.department?._id : (res.employee.department || ''),
          location: res.employee.location || '',
          status: res.employee.status || 'present',
          about: res.employee.about || '',
          jobDescription: res.employee.jobDescription || '',
          hobbies: res.employee.hobbies || '',
          skills: (res.employee.skills || []).join(', '),
          certifications: (res.employee.certifications || []).join(', '),
          gender: res.employee.gender || '',
          dob: res.employee.dob ? res.employee.dob.split('T')[0] : '',
          maritalStatus: res.employee.maritalStatus || '',
          nationality: res.employee.nationality || '',
          address: res.employee.address || '',
          personalEmail: res.employee.personalEmail || '',
          bankName: res.employee.bankInfo?.bankName || '',
          accountNumber: res.employee.bankInfo?.accountNumber || '',
          ifsc: res.employee.bankInfo?.ifsc || '',
          pan: res.employee.bankInfo?.pan || '',
          uan: res.employee.bankInfo?.uan || ''
        });

        if (res.employee.salary?.monthlyWage !== undefined) {
          setEditingWage(res.employee.salary.monthlyWage);
          setSimulatedWage(res.employee.salary.monthlyWage);
        }
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalary = async () => {
    if (!canViewSalary) return;
    try {
      const res = await salaryApi.getSalary(id);
      if (res.success) {
        setSalaryBreakdown(res.salary);
        setEditingWage(res.salary.monthlyWage);
        setSimulatedWage(res.salary.monthlyWage);
      }
    } catch {
      // Handled silently
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentsApi.getDepartments();
      if (res.success) {
        setDepartments(res.departments);
      }
    } catch {
      // Handled silently
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSalary();
    fetchDepartments();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveBusy(true);
    try {
      const payload = {
        ...editForm,
        skills: editForm.skills ? editForm.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        certifications: editForm.certifications ? editForm.certifications.split(',').map((s) => s.trim()).filter(Boolean) : []
      };

      const res = await employeesApi.updateEmployee(id, payload);
      if (res.success) {
        success('Profile updated successfully!');
        setEmployee(res.employee);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaveBusy(false);
    }
  };

  const handleUpdateSalary = async (wageToSave) => {
    setSaveBusy(true);
    try {
      const res = await salaryApi.updateSalary(id, Number(wageToSave) || 0);
      if (res.success) {
        success('Monthly wage updated and audit logged!');
        setSalaryBreakdown(res.salary);
        setEditingWage(res.salary.monthlyWage);
        setSimulatedWage(res.salary.monthlyWage);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to update salary');
    } finally {
      setSaveBusy(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await employeesApi.updateStatus(id, newStatus);
      if (res.success) {
        success(`Status changed to ${newStatus}`);
        setEmployee((prev) => ({ ...prev, status: newStatus }));
        setEditForm((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Employee Not Found</h2>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/employees')}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  const liveCalculated = simulateSalary(simulatedWage);

  return (
    <div>
      {/* Back Button */}
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem' }}
        onClick={() => navigate('/employees')}
      >
        <ArrowLeft size={14} /> Back to Directory
      </button>

      {/* Header Banner Card */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              className="avatar"
              style={{
                backgroundColor: employee.avatarColor || 'var(--copper)',
                width: 72,
                height: 72,
                fontSize: '1.85rem'
              }}
            >
              {employee.firstName?.[0]}
              {employee.lastName?.[0] || ''}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.6rem' }}>{employee.fullName || employee.firstName}</h1>
                <span className={`badge badge-${employee.status}`}>{employee.status}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {employee.designation || 'Staff Member'} · {typeof employee.department === 'object' ? employee.department?.name : 'General'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-copper" style={{ fontFamily: 'var(--font-mono)' }}>
                  ID: {employee.loginId}
                </span>
                <span className="badge badge-info">{employee.role}</span>
                {employee.location && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} /> {employee.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Status Control */}
          {canEditGeneral && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Set Status
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['present', 'absent', 'leave'].map((st) => (
                  <button
                    key={st}
                    className={`btn btn-sm ${employee.status === st ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleStatusChange(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          <FileText size={16} /> Resume & Role
        </button>

        <button
          className={`tab-btn ${activeTab === 'private' ? 'active' : ''}`}
          onClick={() => setActiveTab('private')}
        >
          <Lock size={16} /> Private & Bank Info
        </button>

        {canViewSalary && (
          <button
            className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`}
            onClick={() => setActiveTab('salary')}
          >
            <DollarSign size={16} /> Salary & Simulator
          </button>
        )}

        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16} /> Work & Security
        </button>
      </div>

      {/* =========================================================================
          TAB 1: RESUME & ROLE
          ========================================================================= */}
      {activeTab === 'resume' && (
        <form onSubmit={handleSaveProfile}>
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Briefcase size={18} color="var(--copper)" /> Professional Profile
                </div>
              </div>

              <div className="field">
                <label>About / Bio</label>
                <textarea
                  name="about"
                  value={editForm.about}
                  onChange={handleInputChange}
                  placeholder="Summary of professional background and key accomplishments..."
                  disabled={!canEditGeneral}
                  rows={4}
                />
              </div>

              <div className="field">
                <label>Job Description</label>
                <textarea
                  name="jobDescription"
                  value={editForm.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Primary roles, responsibilities, and team deliverables..."
                  disabled={!canEditGeneral}
                  rows={4}
                />
              </div>

              <div className="field">
                <label>Interests & Hobbies</label>
                <input
                  type="text"
                  name="hobbies"
                  value={editForm.hobbies}
                  onChange={handleInputChange}
                  placeholder="Photography, Cycling, Chess, Coffee Brewing"
                  disabled={!canEditGeneral}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Award size={18} color="var(--copper)" /> Skills & Certifications
                </div>
              </div>

              <div className="field">
                <label>Skills (Comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={editForm.skills}
                  onChange={handleInputChange}
                  placeholder="React, TypeScript, Node.js, MongoDB"
                  disabled={!canEditGeneral}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {editForm.skills.split(',').filter(Boolean).map((s, idx) => (
                  <span key={idx} className="badge badge-copper">{s.trim()}</span>
                ))}
              </div>

              <div className="field">
                <label>Certifications (Comma-separated)</label>
                <input
                  type="text"
                  name="certifications"
                  value={editForm.certifications}
                  onChange={handleInputChange}
                  placeholder="AWS Solutions Architect, CKA, PMP"
                  disabled={!canEditGeneral}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {editForm.certifications.split(',').filter(Boolean).map((c, idx) => (
                  <span key={idx} className="badge badge-info">{c.trim()}</span>
                ))}
              </div>
            </div>
          </div>

          {canEditGeneral && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saveBusy}>
                {saveBusy ? <span className="spinner" /> : <><Save size={16} /> Save Resume Details</>}
              </button>
            </div>
          )}
        </form>
      )}

      {/* =========================================================================
          TAB 2: PRIVATE INFO & BANK DETAILS
          ========================================================================= */}
      {activeTab === 'private' && (
        <form onSubmit={handleSaveProfile}>
          {!isSelf && !isAdmin && !isHR && (
            <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--warning-border)', backgroundColor: 'var(--warning-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                <AlertTriangle size={18} />
                <b>Field Visibility Restricted by Role (RBAC)</b>
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Sensitive personal and bank information is stripped server-side for privacy.
              </p>
            </div>
          )}

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <UserIcon size={18} color="var(--copper)" /> Personal Details
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleInputChange} disabled={!canEditGeneral}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={editForm.dob}
                    onChange={handleInputChange}
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Marital Status</label>
                  <select name="maritalStatus" value={editForm.maritalStatus} onChange={handleInputChange} disabled={!canEditGeneral}>
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>

                <div className="field">
                  <label>Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={editForm.nationality}
                    onChange={handleInputChange}
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>

              <div className="field">
                <label>Personal Email</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={editForm.personalEmail}
                  onChange={handleInputChange}
                  placeholder="personal@gmail.com"
                  disabled={!canEditGeneral}
                />
              </div>

              <div className="field">
                <label>Residential Address</label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  rows={2}
                  disabled={!canEditGeneral}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Lock size={18} color="var(--copper)" /> Statutory & Bank Details
                </div>
                {!isSelf && isHR && (
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Masked for HR</span>
                )}
              </div>

              <div className="field">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={editForm.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g. HDFC Bank"
                  disabled={!canEditGeneral}
                />
              </div>

              <div className="field">
                <label>Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={editForm.accountNumber}
                  onChange={handleInputChange}
                  placeholder="50100482910293"
                  disabled={!canEditGeneral}
                />
              </div>

              <div className="field">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifsc"
                  value={editForm.ifsc}
                  onChange={handleInputChange}
                  placeholder="HDFC0000123"
                  disabled={!canEditGeneral}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>PAN Card</label>
                  <input
                    type="text"
                    name="pan"
                    value={editForm.pan}
                    onChange={handleInputChange}
                    placeholder="ABCPS1234D"
                    disabled={!canEditGeneral}
                  />
                </div>

                <div className="field">
                  <label>UAN Number</label>
                  <input
                    type="text"
                    name="uan"
                    value={editForm.uan}
                    onChange={handleInputChange}
                    placeholder="100918273645"
                    disabled={!canEditGeneral}
                  />
                </div>
              </div>
            </div>
          </div>

          {canEditGeneral && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saveBusy}>
                {saveBusy ? <span className="spinner" /> : <><Save size={16} /> Save Private Details</>}
              </button>
            </div>
          )}
        </form>
      )}

      {/* =========================================================================
          TAB 3: SALARY & INTERACTIVE SIMULATOR
          ========================================================================= */}
      {activeTab === 'salary' && canViewSalary && (
        <div>
          {/* Interactive Live Simulator Range Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-copper)', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))' }}>
            <div className="card-header">
              <div className="card-title">
                <Sliders size={18} color="var(--copper)" /> Interactive Salary Simulator
              </div>
              <span className="badge badge-copper">Real-Time Payroll Calculation</span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Simulated Monthly Wage:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--copper)' }}>
                  ₹{Number(simulatedWage).toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>/ month</span>
                </span>
              </div>

              <input
                type="range"
                min="20000"
                max="350000"
                step="2500"
                value={simulatedWage}
                onChange={(e) => setSimulatedWage(Number(e.target.value))}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                <span>₹20,000</span>
                <span>₹100,000</span>
                <span>₹200,000</span>
                <span>₹350,000</span>
              </div>
            </div>

            {/* Visual Distribution Proportional Bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Earnings & Deductions Distribution
              </div>
              <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', gap: '2px' }}>
                <div style={{ flex: 50, backgroundColor: '#34d399' }} title="Basic (50%)" />
                <div style={{ flex: 25, backgroundColor: '#60a5fa' }} title="HRA (25%)" />
                <div style={{ flex: 16.67, backgroundColor: '#c98a4b' }} title="Standard Allowance (16.67%)" />
                <div style={{ flex: 8.33, backgroundColor: '#fbbf24' }} title="Bonus & LTA" />
                <div style={{ flex: 6, backgroundColor: '#f87171' }} title="PF Employee Deductions" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399' }} /> Basic 50%</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#60a5fa' }} /> HRA 25%</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c98a4b' }} /> Std Allow 16.67%</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f87171' }} /> PF Deductions</span>
              </div>
            </div>

            {canEditSalary && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleUpdateSalary(simulatedWage)}
                  disabled={saveBusy}
                >
                  {saveBusy ? <span className="spinner" /> : <><Save size={15} /> Save ₹{Number(simulatedWage).toLocaleString()} as Official Wage</>}
                </button>
              </div>
            )}
          </div>

          {/* Breakdown Cards */}
          <div className="grid-2">
            {/* Earnings Breakdown */}
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ color: 'var(--success)' }}>
                  Earnings & Allowances
                </div>
                <span className="badge badge-success">Gross: ₹{liveCalculated.monthlyWage?.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Basic Salary (50%)</span>
                  <span style={{ fontWeight: 600 }}>₹{liveCalculated.basic?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>House Rent Allowance / HRA (25%)</span>
                  <span style={{ fontWeight: 600 }}>₹{liveCalculated.hra?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Standard Allowance (16.67%)</span>
                  <span style={{ fontWeight: 600 }}>₹{liveCalculated.standardAllowance?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Performance Bonus (8.33%)</span>
                  <span style={{ fontWeight: 600 }}>₹{liveCalculated.perfBonus?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Leave Travel Allowance / LTA (8.33%)</span>
                  <span style={{ fontWeight: 600 }}>₹{liveCalculated.lta?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fixed Allowance Component</span>
                  <span style={{ fontWeight: 600 }}>₹{liveCalculated.fixed?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions & Net Take Home */}
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ color: 'var(--copper)' }}>
                  Deductions & Net Pay
                </div>
                <span className="badge badge-copper">Yearly CTC: ₹{liveCalculated.yearlyWage?.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Provident Fund (Employee 12% of Basic)</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>- ₹{liveCalculated.pfEmployee?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Provident Fund (Employer 12% of Basic)</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>₹{liveCalculated.pfEmployer?.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Professional Tax (Flat)</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>- ₹{liveCalculated.professionalTax}</span>
                </div>

                <div style={{
                  marginTop: '1rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-copper)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--copper)', fontWeight: 700 }}>
                    Estimated Net Monthly Take-Home
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                    ₹{liveCalculated.netTakeHome?.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: WORK & SECURITY
          ========================================================================= */}
      {activeTab === 'security' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Building size={18} color="var(--copper)" /> Employment Metadata
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Login Identifier</span>
                <span className="badge badge-copper" style={{ fontFamily: 'var(--font-mono)' }}>{employee.loginId}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Employee Code</span>
                <span style={{ fontWeight: 600 }}>{employee.employeeCode || '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Joining Date</span>
                <span style={{ fontWeight: 600 }}>{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>System Role</span>
                <span className="badge badge-info">{employee.role}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Active</span>
                <span className={`badge ${employee.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {employee.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>
            </div>
          </div>

          {leaveBalance && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Calendar size={18} color="var(--copper)" /> Current Leave Entitlements
                </div>
              </div>

              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Paid Time Off (PTO)</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--copper)', marginTop: '0.25rem' }}>
                    {leaveBalance.ptoRemaining}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {leaveBalance.pto?.used || 0} used of {leaveBalance.pto?.total || 24}
                  </span>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Sick Leave</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--copper)', marginTop: '0.25rem' }}>
                    {leaveBalance.sickRemaining}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {leaveBalance.sick?.used || 0} used of {leaveBalance.sick?.total || 10}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
