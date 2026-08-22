import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  Users,
  AlertCircle,
  Building,
  Timer,
  ChevronLeft,
  ChevronRight,
  Download,
  CalendarDays,
  List
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import attendanceApi from '../services/attendanceApi';
import departmentsApi from '../services/departmentsApi';

export default function Attendance() {
  const { user, todayAttendance, handleCheckIn, handleCheckOut } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'calendar' | 'company'
  const [myRecords, setMyRecords] = useState([]);
  const [companyRecords, setCompanyRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  // Calendar Heatmap State
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [monthlyMap, setMonthlyMap] = useState({});

  // Filters for company wide
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const isAdminOrHR = ['SUPER_ADMIN', 'HR'].includes(user?.role);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceApi.getMyAttendance();
      if (res.success) {
        setMyRecords(res.records);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to fetch personal attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      const res = await attendanceApi.getMonthlyAttendance({
        year: currentYear,
        month: String(currentMonth).padStart(2, '0')
      });
      if (res.success) {
        setMonthlyMap(res.attendanceMap || {});
      }
    } catch {
      // Handled silently
    }
  };

  const fetchCompanyAttendance = async () => {
    if (!isAdminOrHR) return;
    try {
      setLoading(true);
      const res = await attendanceApi.getCompanyAttendance({
        date: selectedDate,
        department: deptFilter,
        status: statusFilter
      });
      if (res.success) {
        setCompanyRecords(res.records);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to fetch company attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentsApi.getDepartments();
      if (res.success) {
        setDepartments(res.departments);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchMyAttendance();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchMonthlyAttendance();
    } else if (activeTab === 'company') {
      fetchCompanyAttendance();
    }
  }, [activeTab, currentYear, currentMonth, selectedDate, deptFilter, statusFilter]);

  const onCheckIn = async () => {
    try {
      setActionBusy(true);
      await handleCheckIn();
      success('Checked in successfully!');
      fetchMyAttendance();
      if (activeTab === 'calendar') fetchMonthlyAttendance();
      if (activeTab === 'company') fetchCompanyAttendance();
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
      fetchMyAttendance();
      if (activeTab === 'calendar') fetchMonthlyAttendance();
      if (activeTab === 'company') fetchCompanyAttendance();
    } catch (err) {
      error(err?.data?.message || err.message || 'Check-out failed');
    } finally {
      setActionBusy(false);
    }
  };

  // Calendar helpers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

  // Export attendance records as CSV
  const exportAttendanceCSV = () => {
    const recordsToExport = activeTab === 'company' ? companyRecords : myRecords;
    const headers = ['Date', 'Employee', 'Login ID', 'Check In', 'Check Out', 'Work Hours', 'Status'];
    const rows = recordsToExport.map((r) => [
      `"${r.date}"`,
      `"${r.employeeId?.fullName || user?.fullName}"`,
      `"${r.employeeId?.loginId || user?.loginId}"`,
      `"${r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : ''}"`,
      `"${r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : ''}"`,
      `"${r.totalWorkHours || 0}"`,
      `"${r.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    success('Attendance CSV downloaded.');
  };

  const isCheckedIn = Boolean(todayAttendance && todayAttendance.checkIn);
  const isCheckedOut = Boolean(todayAttendance && todayAttendance.checkOut);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Attendance & Time Tracking</h1>
          <p className="page-subtitle">
            Log daily work hours, review punch-in records, and analyze company attendance.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={exportAttendanceCSV}>
          <Download size={15} /> Export CSV Report
        </button>
      </div>

      {/* Check In / Out Banner Card */}
      <div className="card" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))', border: '1px solid var(--border-copper)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.3rem' }}>Today&apos;s Work Session</h2>
              <span className={`badge badge-${isCheckedIn ? (isCheckedOut ? 'success' : 'present') : 'warning'}`}>
                {isCheckedIn ? (isCheckedOut ? 'Completed' : 'Checked In') : 'Not Checked In'}
              </span>
            </div>

            <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Check In: </span>
                <span style={{ fontWeight: 600 }}>{todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString() : '—'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Check Out: </span>
                <span style={{ fontWeight: 600 }}>{todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString() : '—'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Work Hours: </span>
                <span style={{ fontWeight: 700, color: 'var(--copper)' }}>{todayAttendance?.totalWorkHours ? `${todayAttendance.totalWorkHours} hrs` : '—'}</span>
              </div>
            </div>
          </div>

          <div>
            {!isCheckedIn ? (
              <button className="btn btn-primary btn-lg" onClick={onCheckIn} disabled={actionBusy}>
                {actionBusy ? <span className="spinner" /> : <><CheckCircle2 size={18} /> Check In Now</>}
              </button>
            ) : !isCheckedOut ? (
              <button className="btn btn-danger btn-lg" onClick={onCheckOut} disabled={actionBusy}>
                {actionBusy ? <span className="spinner" /> : <><Clock size={18} /> Clock Out for the Day</>}
              </button>
            ) : (
              <div className="badge badge-success" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                ✓ Today&apos;s Shift Completed ({todayAttendance.totalWorkHours} hrs logged)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          <List size={16} /> My Attendance Logs
        </button>

        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarDays size={16} /> Monthly Heatmap Calendar
        </button>

        {isAdminOrHR && (
          <button
            className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            <Users size={16} /> Company-Wide Matrix
          </button>
        )}
      </div>

      {/* Tab 1: Personal Attendance History Table */}
      {activeTab === 'my' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Work Hours</th>
                <th>Idle / Deficit Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                    No attendance records found yet.
                  </td>
                </tr>
              ) : (
                myRecords.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.date}</td>
                    <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--copper)' }}>{r.totalWorkHours || 0} hrs</td>
                    <td style={{ color: r.idleHours > 0 ? 'var(--warning)' : 'var(--text-dim)' }}>{r.idleHours || 0} hrs</td>
                    <td>
                      <span className={`badge badge-${r.status}`}>{r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Monthly Calendar Heatmap View */}
      {activeTab === 'calendar' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Calendar size={18} color="var(--copper)" /> {monthName} {currentYear}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth}>
                <ChevronLeft size={15} /> Prev Month
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleNextMonth}>
                Next Month <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="calendar-header-cell">{day}</div>
            ))}

            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day-cell empty" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const log = monthlyMap[dateStr];
              const isWeekend = (firstDayIndex + i) % 7 === 0 || (firstDayIndex + i) % 7 === 6;

              return (
                <div
                  key={dateStr}
                  className={`calendar-day-cell ${log ? log.status : (isWeekend ? '' : '')}`}
                  title={log ? `${dateStr}: ${log.status} (${log.totalWorkHours || 0} hrs)` : `${dateStr}: ${isWeekend ? 'Weekend' : 'No record'}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="calendar-day-number" style={{ color: isWeekend ? 'var(--text-dim)' : 'var(--text-main)' }}>
                      {dayNum}
                    </span>
                    {log && (
                      <span className={`badge badge-${log.status}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                        {log.status === 'present' ? 'P' : log.status === 'leave' ? 'L' : 'A'}
                      </span>
                    )}
                  </div>

                  <div className="calendar-day-hours">
                    {log?.totalWorkHours ? `${log.totalWorkHours}h` : (isWeekend ? 'OFF' : '—')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)' }} /> Present
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }} /> On Leave
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }} /> Absent
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Company-Wide Attendance (Admin / HR) */}
      {activeTab === 'company' && isAdminOrHR && (
        <div>
          {/* Filter Toolbar */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Filter Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Department</label>
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Login ID</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {companyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                      No records found for date {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  companyRecords.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            className="avatar"
                            style={{
                              backgroundColor: r.employeeId?.avatarColor || 'var(--copper)',
                              width: 32,
                              height: 32,
                              fontSize: '0.8rem'
                            }}
                          >
                            {r.employeeId?.firstName?.[0]}
                            {r.employeeId?.lastName?.[0] || ''}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.employeeId?.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{r.employeeId?.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-copper" style={{ fontFamily: 'var(--font-mono)' }}>
                          {r.employeeId?.loginId}
                        </span>
                      </td>
                      <td>{typeof r.employeeId?.department === 'object' ? r.employeeId?.department?.name : '—'}</td>
                      <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--copper)' }}>{r.totalWorkHours || 0} hrs</td>
                      <td>
                        <span className={`badge badge-${r.status}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
