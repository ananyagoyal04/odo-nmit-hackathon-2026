import React, { useState, useEffect } from 'react';
import {
  CalendarOff,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import timeOffApi from '../services/timeOffApi';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';

export default function TimeOff() {
  const { user, refreshMe } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'company'
  const [balance, setBalance] = useState({ pto: { total: 24, used: 0 }, sick: { total: 10, used: 0 }, ptoRemaining: 24, sickRemaining: 10 });
  const [myRequests, setMyRequests] = useState([]);
  const [companyRequests, setCompanyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestBusy, setRequestBusy] = useState(false);
  const [requestForm, setRequestForm] = useState({
    type: 'Paid Time Off',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // Reject Modal
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const isAdminOrHR = ['SUPER_ADMIN', 'HR'].includes(user?.role);

  const fetchMyTimeOff = async () => {
    try {
      setLoading(true);
      const res = await timeOffApi.getMyTimeOff();
      if (res.success) {
        const bal = res.balance || res.balances || {};
        const ptoUsed = bal.pto?.used ?? 0;
        const ptoTot = bal.pto?.total ?? 24;
        const sickUsed = bal.sick?.used ?? 0;
        const sickTot = bal.sick?.total ?? 10;

        setBalance({
          pto: { total: ptoTot, used: ptoUsed },
          sick: { total: sickTot, used: sickUsed },
          ptoRemaining: res.ptoRemaining ?? (ptoTot - ptoUsed),
          sickRemaining: res.sickRemaining ?? (sickTot - sickUsed)
        });
        setMyRequests(res.requests || []);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to fetch time-off details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyTimeOff = async () => {
    if (!isAdminOrHR) return;
    try {
      setLoading(true);
      const res = await timeOffApi.getCompanyTimeOff();
      if (res.success) {
        setCompanyRequests(res.requests || []);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to fetch company leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTimeOff();
  }, []);

  useEffect(() => {
    if (activeTab === 'company') {
      fetchCompanyTimeOff();
    }
  }, [activeTab]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestBusy(true);
    try {
      const payload = {
        leaveType: requestForm.type,
        type: requestForm.type,
        startDate: requestForm.startDate,
        endDate: requestForm.endDate,
        reason: requestForm.reason
      };

      const res = await timeOffApi.requestTimeOff(payload);
      if (res.success) {
        success('Time-off request submitted successfully!');
        setIsRequestModalOpen(false);
        setRequestForm({
          type: 'Paid Time Off',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: ''
        });
        fetchMyTimeOff();
        if (activeTab === 'company') fetchCompanyTimeOff();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to submit time-off request');
    } finally {
      setRequestBusy(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionBusy(true);
      const res = await timeOffApi.approveTimeOff(id);
      if (res.success) {
        success('Time-off request approved and leave days deducted.');
        fetchCompanyTimeOff();
        fetchMyTimeOff();
        await refreshMe();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to approve request');
    } finally {
      setActionBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      setActionBusy(true);
      const res = await timeOffApi.rejectTimeOff(rejectingId, rejectionReason);
      if (res.success) {
        success('Time-off request rejected.');
        setRejectingId(null);
        setRejectionReason('');
        fetchCompanyTimeOff();
        fetchMyTimeOff();
        await refreshMe();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to reject request');
    } finally {
      setActionBusy(false);
    }
  };

  const ptoRem = balance.ptoRemaining ?? (balance.pto?.total - balance.pto?.used) ?? 24;
  const sickRem = balance.sickRemaining ?? (balance.sick?.total - balance.sick?.used) ?? 10;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Time Off & Leaves</h1>
          <p className="page-subtitle">
            Manage personal annual leave quotas, casual leaves, and organizational absence workflows.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsRequestModalOpen(true)}>
          <Plus size={16} /> Request Time Off
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          title="Paid Time Off (PTO) Remaining"
          value={`${ptoRem} Days`}
          subtext={`Used: ${balance.pto?.used || 0} / ${balance.pto?.total || 24} annual days`}
          icon={Calendar}
          variant="copper"
        />

        <StatCard
          title="Sick & Medical Leave Remaining"
          value={`${sickRem} Days`}
          subtext={`Used: ${balance.sick?.used || 0} / ${balance.sick?.total || 10} annual days`}
          icon={CalendarOff}
          variant="copper"
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          <Calendar size={16} /> My Leave Requests
        </button>

        {isAdminOrHR && (
          <button
            className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            <Clock size={16} /> Approvals & Company Roster ({companyRequests.filter((r) => r.status === 'pending').length} Pending)
          </button>
        )}
      </div>

      {/* Tab 1: My Requests */}
      {activeTab === 'my' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Leave Category</th>
                <th>Dates & Duration</th>
                <th>Reason / Notes</th>
                <th>Approval Status</th>
                <th>Reviewer Information</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : myRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                    No time-off requests submitted yet. Click &quot;Request Time Off&quot; to apply for leaves.
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => (
                  <tr key={req._id || req.id}>
                    <td>
                      <span className="badge badge-copper">{req.leaveType || req.type || 'Paid Time Off'}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ''} ({req.days || 1}d)
                    </td>
                    <td style={{ maxWidth: 300, color: 'var(--text-muted)' }}>
                      {req.reason || '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}`}>
                        {req.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {req.status === 'approved' && (
                        <span style={{ color: 'var(--success)' }}>✓ Approved by Management</span>
                      )}
                      {req.status === 'rejected' && (
                        <span style={{ color: 'var(--danger)' }}>✗ {req.rejectionReason || 'Rejected by HR'}</span>
                      )}
                      {req.status === 'pending' && <span>Awaiting Manager Review</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Company Requests (Admin / HR) */}
      {activeTab === 'company' && isAdminOrHR && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Date Range & Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : companyRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                    No company time-off requests found.
                  </td>
                </tr>
              ) : (
                companyRequests.map((req) => (
                  <tr key={req._id || req.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div
                          className="avatar"
                          style={{
                            backgroundColor: req.employeeId?.avatarColor || 'var(--copper)',
                            width: 32,
                            height: 32,
                            fontSize: '0.8rem'
                          }}
                        >
                          {req.employeeId?.firstName?.[0] || 'U'}
                          {req.employeeId?.lastName?.[0] || ''}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{req.employeeId?.fullName || req.employeeId?.firstName || 'Team Member'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{req.employeeId?.email || req.employeeId?.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-copper">{req.leaveType || req.type || 'Paid Time Off'}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ''} ({req.days || 1}d)
                    </td>
                    <td style={{ maxWidth: 260, color: 'var(--text-muted)' }}>
                      {req.reason || '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}`}>
                        {req.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(req._id || req.id)}
                            disabled={actionBusy}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => { setRejectingId(req._id || req.id); setRejectionReason(''); }}
                            disabled={actionBusy}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {req.status === 'approved' ? '✓ Processed' : '✗ Declined'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Time Off Modal */}
      {isRequestModalOpen && (
        <Modal
          title="Submit Leave Application"
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        >
          <form onSubmit={handleRequestSubmit}>
            <div className="field">
              <label>Leave Category</label>
              <select
                value={requestForm.type}
                onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
              >
                <option value="Paid Time Off">Paid Time Off (PTO) — {ptoRem} days available</option>
                <option value="Sick Leave">Sick & Medical Leave — {sickRem} days available</option>
                <option value="Casual Leave">Casual Leave — Included in Annual Balance</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={requestForm.startDate}
                  onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>End Date</label>
                <input
                  type="date"
                  value={requestForm.endDate}
                  onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Reason / Absence Notes</label>
              <textarea
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                placeholder="Describe reason for leave..."
                rows={3}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsRequestModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={requestBusy}
              >
                {requestBusy ? <span className="spinner" /> : 'Submit Leave Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Reason Modal */}
      {rejectingId && (
        <Modal
          title="Decline Leave Application"
          isOpen={Boolean(rejectingId)}
          onClose={() => setRejectingId(null)}
        >
          <div className="field">
            <label>Reason for Declining (Optional)</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Critical release milestone during this window..."
              rows={3}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setRejectingId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleReject}
              disabled={actionBusy}
            >
              {actionBusy ? <span className="spinner" /> : 'Confirm Decline'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
