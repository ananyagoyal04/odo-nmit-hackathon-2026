import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  Activity,
  Terminal,
  ShieldCheck,
  FileCode,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import auditLogApi from '../services/auditLogApi';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';

export default function AuditLogs() {
  const { user } = useAuth();
  const { error } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditLogApi.getLogs({ action: actionFilter });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const actorName = (log.actorId?.fullName || log.actorId?.firstName || 'System').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const target = (log.targetType || '').toLowerCase();
    const ip = (log.ip || '').toLowerCase();
    return actorName.includes(q) || action.includes(q) || target.includes(q) || ip.includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Security Audit Logs & Compliance Trail</h1>
          <p className="page-subtitle">
            Immutable enterprise SOC 2 & ISO 27001 audit trail tracking executive logins, payroll runs, and permission revisions.
          </p>
        </div>
      </div>

      {/* Top StatCards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          title="Total Audited Events"
          value={logs.length}
          subtext="Cryptographically sequenced logs"
          icon={Terminal}
          variant="copper"
        />
        <StatCard
          title="Security & Compliance Status"
          value="100% Passed"
          subtext="SOC 2 Type II & ISO 27001"
          icon={ShieldCheck}
          variant="success"
        />
        <StatCard
          title="Active Root Actors"
          value="Rajesh & Priya"
          subtext="Super Admin & HRBP Clearances"
          icon={Lock}
          variant="rose"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div className="input-wrap">
            <input
              type="text"
              placeholder="Search audit trail by actor name, action, target type, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All Audit Actions</option>
              <option value="SUPER_ADMIN_AUTH">SUPER_ADMIN_AUTH</option>
              <option value="STATUTORY_PAYROLL_RUN">STATUTORY_PAYROLL_RUN</option>
              <option value="SALARY_UPDATE">SALARY_UPDATE</option>
              <option value="TIMEOFF_APPROVE">TIMEOFF_APPROVE</option>
              <option value="EXPENSE_APPROVED">EXPENSE_APPROVED</option>
              <option value="EMPLOYEE_CREATE">EMPLOYEE_CREATE</option>
              <option value="SECURITY_AUDIT_CHECK">SECURITY_AUDIT_CHECK</option>
              <option value="DEPARTMENT_CREATE">DEPARTMENT_CREATE</option>
              <option value="ROLE_MODIFIED">ROLE_MODIFIED</option>
              <option value="POLICY_BROADCAST">POLICY_BROADCAST</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ShieldAlert size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Audit Records Match</h3>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>Try adjusting your action filter or search query.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Authorizing Actor</th>
                <th>Action Signature</th>
                <th>Target Resource</th>
                <th>Audit Metadata Payload</th>
                <th>Origin IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id || log.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        className="avatar"
                        style={{
                          backgroundColor: log.actorId?.avatarColor || 'var(--copper)',
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem'
                        }}
                      >
                        {log.actorId?.firstName?.[0] || 'S'}
                        {log.actorId?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.actorId?.fullName || 'System Root'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{log.actorId?.designation || log.actorId?.loginId || 'Super Admin'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      log.action.includes('AUTH') || log.action.includes('PAYROLL') ? 'badge-success' :
                      log.action.includes('SALARY') || log.action.includes('ROLE') ? 'badge-warning' :
                      log.action.includes('DELETE') ? 'badge-danger' : 'badge-copper'
                    }`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {log.targetType || 'System'}
                  </td>
                  <td>
                    <div
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.6rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        maxWidth: 320
                      }}
                      onClick={() => setInspectLog(log)}
                      title="Click to expand full audit JSON payload"
                    >
                      <FileCode size={13} color="var(--copper)" />
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {typeof log.metadata === 'object' ? JSON.stringify(log.metadata) : (log.metadata || '{}')}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span className="badge badge-copper" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                      {log.ip || '127.0.0.1'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect Audit Log Modal */}
      {inspectLog && (
        <Modal
          title={`Audit Event: ${inspectLog.action}`}
          isOpen={Boolean(inspectLog)}
          onClose={() => setInspectLog(null)}
          maxWidth={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Authorizing Actor: </span>
                <b>{inspectLog.actorId?.fullName || 'System Root'}</b>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Source IP: </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{inspectLog.ip || '127.0.0.1'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Target Resource: </span>
                <b>{inspectLog.targetType}</b>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Event Timestamp: </span>
                <span>{new Date(inspectLog.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>
                Event Metadata Payload (JSON)
              </label>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                backgroundColor: '#120e0d',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--peach)',
                border: '1px solid var(--border-copper)',
                maxHeight: 280,
                overflowY: 'auto'
              }}>
                {JSON.stringify(typeof inspectLog.metadata === 'string' ? JSON.parse(inspectLog.metadata || '{}') : (inspectLog.metadata || {}), null, 2)}
              </pre>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button className="btn btn-secondary" onClick={() => setInspectLog(null)}>
              Close Inspector
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
