import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  Building2,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  Timer,
  Search,
  DollarSign,
  Bell,
  CreditCard,
  Target,
  Sparkles,
  Shield,
  Award,
  Code2,
  Palette
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import CommandPalette from './CommandPalette';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import AmbientLivingCanvas from './AmbientLivingCanvas';
import RevolvingFrames3D from './RevolvingFrames3D';
import SpatialStage from './SpatialStage';
import ThemeSwitcher from './ThemeSwitcher';
import authApi from '../services/authApi';

export default function Layout() {
  const { user, company, todayAttendance, handleCheckIn, handleCheckOut, logout, switchPersona } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [switchingPersona, setSwitchingPersona] = useState(false);

  const handleSwitchPersona = async (loginId, personaName) => {
    try {
      setSwitchingPersona(true);
      setDropdownOpen(false);
      try {
        await switchPersona(loginId, 'Password@123');
      } catch {
        // Fallback for primary admin
        await switchPersona(loginId, 'nutan@1979');
      }
      success(`Switched role to ${personaName} (${loginId})`);
    } catch (err) {
      error(err?.message || 'Failed to switch demo persona');
    } finally {
      setSwitchingPersona(false);
    }
  };

  // Live timer for elapsed work time if checked in today
  const [elapsed, setElapsed] = useState('');

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdkOpen((s) => !s);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!todayAttendance || !todayAttendance.checkIn) {
      setElapsed('');
      return;
    }

    const checkInTime = new Date(todayAttendance.checkIn).getTime();
    const updateTimer = () => {
      const now = todayAttendance.checkOut ? new Date(todayAttendance.checkOut).getTime() : Date.now();
      const diffMs = Math.max(0, now - checkInTime);
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setElapsed(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  const onCheckIn = async () => {
    try {
      setActionBusy(true);
      await handleCheckIn();
      success('Checked in successfully for today!');
    } catch (err) {
      error(err?.data?.message || err.message || 'Check-in failed');
    } finally {
      setActionBusy(false);
    }
  };

  const onCheckOut = async () => {
    try {
      setActionBusy(true);
      await handleCheckOut();
      success('Checked out successfully!');
    } catch (err) {
      error(err?.data?.message || err.message || 'Check-out failed');
    } finally {
      setActionBusy(false);
    }
  };

  const onLogout = () => {
    logout();
    navigate('/login');
    success('You have been signed out.');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmNewPw) {
      error('New passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      error('New password must be at least 8 characters');
      return;
    }

    setPwBusy(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
        confirmNewPassword: confirmNewPw
      });
      if (res.success) {
        success('Password changed successfully!');
        setPwModalOpen(false);
        setCurrentPw('');
        setNewPw('');
        setConfirmNewPw('');
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPwBusy(false);
    }
  };

  const isCheckedIn = Boolean(todayAttendance && todayAttendance.checkIn);
  const isCheckedOut = Boolean(todayAttendance && todayAttendance.checkOut);

  return (
    <div className="app-layout" style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Living Ambient 3D Atmosphere & Continuous Revolving Workspace Frames */}
      <AmbientLivingCanvas />
      <RevolvingFrames3D />

      {/* Topbar */}
      <header className="topbar" style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(21, 16, 13, 0.85)' }}>
        <div className="topbar-left">
          <div className="brandmark" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <div className="logo-chip">{company?.companyCode || 'OI'}</div>
            <div className="name" style={{ fontSize: '1.05rem' }}>
              {company?.name || 'Odoo Technologies India'} <span>· Workforce</span>
            </div>
          </div>

          <nav className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={16} /> Employees
            </NavLink>
            <NavLink to="/payroll" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <DollarSign size={16} /> Payroll
            </NavLink>
            <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Clock size={16} /> Attendance
            </NavLink>
            <NavLink to="/timeoff" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CalendarOff size={16} /> Time Off
            </NavLink>
            <NavLink to="/announcements" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Bell size={16} /> Notice Board
            </NavLink>
            <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CreditCard size={16} /> Expenses
            </NavLink>
            <NavLink to="/performance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Target size={16} /> OKRs
            </NavLink>
            {['SUPER_ADMIN', 'HR'].includes(user?.role) && (
              <NavLink to="/departments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Building2 size={16} /> Depts
              </NavLink>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShieldAlert size={16} /> Logs
              </NavLink>
            )}
          </nav>
        </div>

        <div className="topbar-right">
          {/* Quick Command Palette Button */}
          <button className="cmdk-btn" onClick={() => setCmdkOpen(true)}>
            <Search size={14} />
            <span>Search...</span>
            <span className="cmdk-kbd">Ctrl+K</span>
          </button>

          {/* Quick Check In / Check Out Widget */}
          <div className="attendance-widget">
            {isCheckedIn && !isCheckedOut && <div className="pulse-dot" />}
            <Timer size={16} color="var(--copper)" />
            {isCheckedIn ? (
              <>
                <span className="attendance-timer">{elapsed || '00:00:00'}</span>
                {!isCheckedOut ? (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={onCheckOut}
                    disabled={actionBusy}
                  >
                    Check Out
                  </button>
                ) : (
                  <span className="badge badge-success">Done ({todayAttendance.totalWorkHours}h)</span>
                )}
              </>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={onCheckIn}
                disabled={actionBusy}
              >
                <CheckCircle2 size={14} /> Check In
              </button>
            )}
          </div>

          {/* Global Theme Selector */}
          <ThemeSwitcher />

          {/* Profile Dropdown */}
          <div className="user-profile-menu">
            <button
              className="avatar-btn"
              onClick={() => setDropdownOpen((s) => !s)}
            >
              <div
                className="avatar"
                style={{
                  backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : 'none',
                  backgroundColor: user?.avatarColor || 'var(--rose)',
                  border: '2px solid rgba(255, 187, 148, 0.4)'
                }}
              >
                {!user?.avatarUrl && (user?.firstName?.[0] + (user?.lastName?.[0] || ''))}
              </div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user?.fullName || user?.firstName}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--copper)' }}>
                  {user?.role}
                </span>
              </div>
              <ChevronDown size={14} color="var(--text-dim)" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="user-dropdown">
                  <div className="dropdown-user-header">
                    <div className="name">{user?.fullName}</div>
                    <div className="email">{user?.email}</div>
                    <div style={{ marginTop: '0.35rem' }}>
                      <span className="badge badge-copper" style={{ fontSize: '0.7rem' }}>
                        ID: {user?.loginId}
                      </span>
                    </div>
                  </div>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <UserIcon size={16} /> Edit My Profile & Photo
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      setPwModalOpen(true);
                    }}
                  >
                    <KeyRound size={16} /> Change Password
                  </button>

                  <div style={{ height: 1, backgroundColor: 'var(--border-color)', margin: '0.35rem 0' }} />

                  {/* Portfolio Demo Quick Switcher */}
                  <div style={{ padding: '0.45rem 0.85rem 0.25rem', fontSize: '0.7rem', color: 'var(--copper)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={12} /> Switch Demo Persona
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 0.35rem' }}>
                    {[
                      { id: 'OI-ADM-001', name: 'Rajesh Sharma', role: 'Super Admin', icon: Shield, badge: 'Full Access' },
                      { id: 'OI-HR-001', name: 'Priya Patel', role: 'Head of HR', icon: Award, badge: 'HR Admin' },
                      { id: 'OI-ENG-001', name: 'Shruthika Dutta', role: 'Staff Architect', icon: Code2, badge: 'Eng Lead' },
                      { id: 'OI-DES-001', name: 'Aarav Mehta', role: 'Principal Designer', icon: Palette, badge: 'Design Lead' }
                    ].map((p) => {
                      const isActive = user?.loginId === p.id;
                      const IconComp = p.icon;
                      return (
                        <button
                          key={p.id}
                          className="dropdown-item"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.45rem 0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isActive ? 'rgba(217, 119, 6, 0.12)' : 'transparent',
                            color: isActive ? 'var(--copper)' : 'var(--text-main)',
                            fontWeight: isActive ? 700 : 500
                          }}
                          disabled={switchingPersona}
                          onClick={() => handleSwitchPersona(p.id, p.name)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconComp size={14} color={isActive ? 'var(--copper)' : 'var(--text-dim)'} />
                            <div style={{ textAlign: 'left' }}>
                              <div>{p.name}</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{p.role}</div>
                            </div>
                          </div>
                          <span
                            className={`badge ${isActive ? 'badge-copper' : 'badge-neutral'}`}
                            style={{ fontSize: '0.62rem', padding: '2px 5px' }}
                          >
                            {p.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ height: 1, backgroundColor: 'var(--border-color)', margin: '0.35rem 0' }} />

                  <button className="dropdown-item danger" onClick={onLogout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport wrapped in 3D Spatial Stage */}
      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <SpatialStage>
          <Outlet />
        </SpatialStage>
      </main>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdkOpen} onClose={() => setCmdkOpen(false)} />

      {/* Change Password Modal */}
      {pwModalOpen && (
        <Modal
          title="Change Account Password"
          isOpen={pwModalOpen}
          onClose={() => setPwModalOpen(false)}
        >
          <form onSubmit={handleChangePassword}>
            <div className="field">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="field">
              <label>New Password (min 8 characters)</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="••••••••"
                required
              />
              <PasswordStrengthMeter password={newPw} />
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPw}
                onChange={(e) => setConfirmNewPw(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPwModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pwBusy}
              >
                {pwBusy ? <span className="spinner" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
