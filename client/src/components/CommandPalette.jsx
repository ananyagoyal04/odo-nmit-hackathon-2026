import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  Building2,
  ShieldAlert,
  Plus,
  Timer,
  ArrowRight,
  X,
  DollarSign,
  Bell,
  CreditCard,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import employeesApi from '../services/employeesApi';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, todayAttendance, handleCheckIn, handleCheckOut } = useAuth();
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  // Search employees when query is typed
  useEffect(() => {
    if (!query.trim()) {
      setEmployees([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await employeesApi.getEmployees({ search: query.trim(), limit: 5 });
        if (res.success) {
          setEmployees(res.employees);
        }
      } catch {
        // Ignored
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (path) => {
    onClose();
    navigate(path);
  };

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Employee Directory', path: '/employees', icon: Users },
    { title: 'Payroll & Statutory Payslips', path: '/payroll', icon: DollarSign },
    { title: 'Attendance & Tracking', path: '/attendance', icon: Clock },
    { title: 'Time Off & Leaves', path: '/timeoff', icon: CalendarOff },
    { title: 'Company Notice Board', path: '/announcements', icon: Bell },
    { title: 'Expenses & Reimbursements', path: '/expenses', icon: CreditCard },
    { title: 'Performance & OKRs', path: '/performance', icon: Target },
    ...(['SUPER_ADMIN', 'HR'].includes(user?.role) ? [{ title: 'Departments', path: '/departments', icon: Building2 }] : []),
    ...(user?.role === 'SUPER_ADMIN' ? [{ title: 'Security Audit Logs', path: '/audit-logs', icon: ShieldAlert }] : [])
  ];

  const filteredNav = navItems.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: 560,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-copper)',
          boxShadow: 'var(--shadow-glow), var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', gap: '0.75rem' }}>
          <Search size={18} color="var(--copper)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or search employee..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '1rem',
              boxShadow: 'none'
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <span className="cmdk-kbd">ESC</span>
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0.75rem' }}>
          {/* Quick Actions */}
          {!query && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, padding: '0.25rem 0.5rem' }}>
                Quick Actions
              </div>
              <div
                className="dropdown-item"
                style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem', cursor: 'pointer' }}
                onClick={() => {
                  onClose();
                  if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
                    handleCheckOut();
                  } else {
                    handleCheckIn();
                  }
                }}
              >
                <Timer size={16} color="var(--copper)" />
                <span style={{ flex: 1, fontWeight: 600 }}>
                  {todayAttendance?.checkIn && !todayAttendance?.checkOut ? 'Clock Out Shift' : 'Punch In Attendance'}
                </span>
                <span className="badge badge-copper" style={{ fontSize: '0.65rem' }}>PUNCH</span>
              </div>

              <div
                className="dropdown-item"
                style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem', cursor: 'pointer' }}
                onClick={() => navigateTo('/timeoff')}
              >
                <CalendarOff size={16} color="var(--warning)" />
                <span style={{ flex: 1, fontWeight: 600 }}>Submit Leave Request</span>
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          {filteredNav.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, padding: '0.25rem 0.5rem' }}>
                Navigation
              </div>
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    className="dropdown-item"
                    style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem', cursor: 'pointer' }}
                    onClick={() => navigateTo(item.path)}
                  >
                    <Icon size={16} color="var(--copper)" />
                    <span style={{ flex: 1, fontWeight: 600 }}>{item.title}</span>
                    <ArrowRight size={14} color="var(--text-dim)" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Employee Search Matches */}
          {employees.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, padding: '0.25rem 0.5rem' }}>
                Employees
              </div>
              {employees.map((emp) => (
                <div
                  key={emp._id}
                  className="dropdown-item"
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem', cursor: 'pointer' }}
                  onClick={() => navigateTo(`/employees/${emp._id}`)}
                >
                  <div
                    className="avatar"
                    style={{ backgroundColor: emp.avatarColor || 'var(--copper)', width: 26, height: 26, fontSize: '0.7rem' }}
                  >
                    {emp.firstName?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{emp.fullName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {emp.designation || 'Staff'} · {emp.loginId}
                    </div>
                  </div>
                  <span className={`badge badge-${emp.status}`}>{emp.status}</span>
                </div>
              ))}
            </div>
          )}

          {filteredNav.length === 0 && employees.length === 0 && query && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              No matching commands or employees found for &quot;{query}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
