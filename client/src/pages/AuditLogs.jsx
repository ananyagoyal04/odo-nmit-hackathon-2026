import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  Activity,
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import auditLogApi from '../services/auditLogApi';

export default function AuditLogs() {
  const { user } = useAuth();
  const { error } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditLogApi.getLogs({ action: actionFilter });
      if (res.success) {
        setLogs(res.logs);
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

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Security & System Audit Logs</h1>
          <p className="page-subtitle">
            Immutable organizational audit trail tracking employee creations, salary modifications, and permissions.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="field" style={{ margin: 0, maxWidth: 300 }}>
            <label>Filter by Action</label>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All System Actions</option>
              <option value="SALARY_UPDATE">SALARY_UPDATE</option>
              <option value="EMPLOYEE_CREATE">EMPLOYEE_CREATE</option>
              <option value="TIMEOFF_APPROVE">TIMEOFF_APPROVE</option>
              <option value="TIMEOFF_REJECT">TIMEOFF_REJECT</option>
              <option value="COMPANY_REGISTER">COMPANY_REGISTER</option>
              <option value="DEPARTMENT_CREATE">DEPARTMENT_CREATE</option>
              <option value="DEPARTMENT_DELETE">DEPARTMENT_DELETE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ShieldAlert size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Audit Records Match</h3>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Audit Details & Metadata</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        className="avatar"
                        style={{
                          backgroundColor: log.actorId?.avatarColor || 'var(--copper)',
                          width: 26,
                          height: 26,
                          fontSize: '0.7rem'
                        }}
                      >
                        {log.actorId?.firstName?.[0]}
                        {log.actorId?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.actorId?.fullName || 'System'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{log.actorId?.loginId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${log.action.includes('SALARY') ? 'badge-warning' : log.action.includes('DELETE') ? 'badge-danger' : 'badge-copper'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{log.targetType || '—'}</td>
                  <td>
                    <pre style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--bg-app)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-muted)',
                      maxWidth: 420,
                      overflowX: 'auto',
                      margin: 0
                    }}>
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {log.ip || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
