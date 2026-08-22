import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  CalendarCheck,
  Clock,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Building2,
  CalendarOff,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import dashboardApi from '../services/dashboardApi';
import StatCard from '../components/StatCard';
import Tilt3DCard from '../components/Tilt3DCard';
import AestheticQuoteBanner from '../components/AestheticQuoteBanner';

export default function Dashboard() {
  const { user, company, todayAttendance, handleCheckIn, handleCheckOut } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const onCheckIn = async () => {
    try {
      setActionBusy(true);
      await handleCheckIn();
      success('Checked in successfully!');
      fetchStats();
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
      fetchStats();
    } catch (err) {
      error(err?.data?.message || err.message || 'Check-out failed');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  const isEmployee = user?.role === 'EMPLOYEE';
  const stats = data?.stats || {};

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.firstName}!</h1>
          <p className="page-subtitle">
            {company?.name} · {user?.designation || user?.role} · ID: <b>{user?.loginId}</b>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isEmployee ? (
            <button className="btn btn-primary" onClick={() => navigate('/timeoff')}>
              <CalendarOff size={16} /> Request Time Off
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => navigate('/timeoff')}>
                <CalendarCheck size={16} /> Review Leaves ({stats.pendingTimeOffCount || 0})
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/employees?add=true')}>
                <Plus size={16} /> Add Employee
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inspirational Daily Wisdom Quote Banner */}
      <AestheticQuoteBanner />

      {/* =========================================================================
          EMPLOYEE VIEW
          ========================================================================= */}
      {isEmployee && (
        <>
          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
            <StatCard
              title="Today Status"
              value={stats.isCheckedIn ? (stats.isCheckedOut ? 'Completed' : 'Present') : 'Not Checked In'}
              subtext={stats.isCheckedIn ? `In at ${new Date(stats.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Check in to start log'}
              icon={Clock}
              variant={stats.isCheckedIn ? 'success' : 'warning'}
            />
            <StatCard
              title="Paid Time Off (PTO)"
              value={`${stats.leaveBalance?.ptoRemaining ?? 24} Days`}
              subtext={`${stats.leaveBalance?.pto?.used || 0} / ${stats.leaveBalance?.pto?.total || 24} days used`}
              icon={CalendarCheck}
              variant="copper"
            />
            <StatCard
              title="Sick Leave Balance"
              value={`${stats.leaveBalance?.sickRemaining ?? 10} Days`}
              subtext={`${stats.leaveBalance?.sick?.used || 0} / ${stats.leaveBalance?.sick?.total || 10} days used`}
              icon={CalendarOff}
              variant="copper"
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingTimeOffCount || 0}
              subtext="Awaiting HR approval"
              icon={AlertCircle}
              variant={stats.pendingTimeOffCount > 0 ? 'warning' : 'default'}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
            {/* Live Today's Session Card */}
            <Tilt3DCard style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))', border: '1px solid var(--border-copper)' }}>
              <div className="card-header">
                <div className="card-title">
                  <Clock size={18} color="var(--copper)" /> Today's Attendance Session
                </div>
                <span className={`badge badge-${stats.isCheckedIn ? (stats.isCheckedOut ? 'success' : 'present') : 'warning'}`}>
                  {stats.isCheckedIn ? (stats.isCheckedOut ? 'Completed' : 'Checked In') : 'Not Checked In'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', transform: 'translateZ(15px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date</span>
                  <span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Punch-in Time</span>
                  <span style={{ fontWeight: 600 }}>
                    {todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Logged Today</span>
                  <span style={{ fontWeight: 700, color: 'var(--copper)' }}>
                    {stats.totalWorkHoursToday ? `${stats.totalWorkHoursToday} hrs` : '—'}
                  </span>
                </div>
              </div>

              <div style={{ transform: 'translateZ(20px)' }}>
                {!stats.isCheckedIn ? (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={onCheckIn}
                    disabled={actionBusy}
                  >
                    <CheckCircle2 size={18} /> Check In for Today
                  </button>
                ) : !stats.isCheckedOut ? (
                  <button
                    className="btn btn-danger btn-lg"
                    style={{ width: '100%' }}
                    onClick={onCheckOut}
                    disabled={actionBusy}
                  >
                    <Clock size={18} /> Clock Out & Submit Hours
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600, padding: '0.5rem' }}>
                    ✓ Work day hours logged successfully!
                  </div>
                )}
              </div>
            </Tilt3DCard>

            {/* Recent 7-day Attendance */}
            <Tilt3DCard>
              <div className="card-header">
                <div className="card-title">
                  <CalendarCheck size={18} color="var(--copper)" /> Recent Attendance History
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/attendance')}>
                  View All <ArrowUpRight size={14} />
                </button>
              </div>

              {stats.recentAttendance && stats.recentAttendance.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', transform: 'translateZ(10px)' }}>
                  {stats.recentAttendance.slice(0, 5).map((att) => (
                    <div
                      key={att._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.9rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{att.date}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          {' → '}
                          {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge badge-${att.status}`}>{att.status}</span>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {att.totalWorkHours ? `${att.totalWorkHours}h` : '0h'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent logs recorded yet.</p>
              )}
            </Tilt3DCard>
          </div>
        </>
      )}

      {/* =========================================================================
          ADMIN & HR VIEW
          ========================================================================= */}
      {!isEmployee && (
        <>
          {/* Top 4 Metrics Cards */}
          <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
            <StatCard
              title="Total Headcount"
              value={stats.headcount || 0}
              subtext="Active company employees"
              icon={Users}
              variant="copper"
            />
            <StatCard
              title="Present Today"
              value={stats.attendanceToday?.present || 0}
              subtext={`${stats.attendanceToday?.rate || 0}% attendance rate`}
              icon={UserCheck}
              variant="success"
            />
            <StatCard
              title="On Leave / Absent"
              value={`${stats.attendanceToday?.onLeave || 0} / ${stats.attendanceToday?.absent || 0}`}
              subtext={`${stats.attendanceToday?.onLeave || 0} on leave, ${stats.attendanceToday?.absent || 0} absent`}
              icon={UserX}
              variant="danger"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingTimeOffCount || 0}
              subtext="Time-off requests pending"
              icon={CalendarOff}
              variant={stats.pendingTimeOffCount > 0 ? 'warning' : 'default'}
            />
          </div>

          <div className="grid-2">
            {/* Department Distribution */}
            <Tilt3DCard>
              <div className="card-header">
                <div className="card-title">
                  <Building2 size={18} color="var(--copper)" /> Department Distribution
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/departments')}>
                  Manage <ArrowUpRight size={14} />
                </button>
              </div>

              {stats.departmentBreakdown && stats.departmentBreakdown.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', transform: 'translateZ(12px)' }}>
                  {stats.departmentBreakdown.map((d) => (
                    <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.name}</span>
                      <span className="badge badge-copper">{d.count} Member{d.count === 1 ? '' : 's'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No departments created yet.</p>
              )}
            </Tilt3DCard>

            {/* Recent Audit Activity */}
            <Tilt3DCard>
              <div className="card-header">
                <div className="card-title">
                  <ShieldCheck size={18} color="var(--copper)" /> Recent Workforce Activity
                </div>
                {user?.role === 'SUPER_ADMIN' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/audit-logs')}>
                    Audit Trail <ArrowUpRight size={14} />
                  </button>
                )}
              </div>

              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', transform: 'translateZ(10px)' }}>
                  {stats.recentActivity.slice(0, 5).map((log) => (
                    <div
                      key={log._id}
                      style={{
                        padding: '0.65rem 0.9rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {log.action.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          by {log.actorId?.fullName || 'System'} · {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge badge-copper" style={{ fontSize: '0.7rem' }}>
                        {log.targetType || 'Activity'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent activity records.</p>
              )}
            </Tilt3DCard>
          </div>
        </>
      )}
    </div>
  );
}
