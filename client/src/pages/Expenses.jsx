import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  FileCheck,
  Receipt,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import expensesApi from '../services/expensesApi';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import Tilt3DCard from '../components/Tilt3DCard';

export default function Expenses() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Equipment',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    receiptUrl: ''
  });

  const isAdminOrHR = ['SUPER_ADMIN', 'HR'].includes(user?.role);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expensesApi.getExpenses({ status: statusFilter });
      if (res.success) {
        setExpenses(res.expenses);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitBusy(true);
    try {
      const res = await expensesApi.createExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      if (res.success) {
        success('Expense claim submitted for approval!');
        setIsSubmitOpen(false);
        setFormData({
          title: '',
          category: 'Equipment',
          amount: '',
          expenseDate: new Date().toISOString().split('T')[0],
          description: '',
          receiptUrl: ''
        });
        fetchExpenses();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to submit claim');
    } finally {
      setSubmitBusy(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await expensesApi.reviewExpense(id, 'approve');
      if (res.success) {
        success('Expense claim approved for reimbursement!');
        fetchExpenses();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to approve claim');
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    try {
      const res = await expensesApi.reviewExpense(selectedExpenseId, 'reject', rejectionReason);
      if (res.success) {
        success('Expense claim rejected.');
        setRejectModalOpen(false);
        setRejectionReason('');
        fetchExpenses();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to reject claim');
    }
  };

  // Calculations for stats
  const totalClaimed = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses.filter((e) => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Expenses & Reimbursements</h1>
          <p className="page-subtitle">
            Submit business expense claims, track reimbursement status, and manage corporate spend.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsSubmitOpen(true)}>
          <Plus size={16} /> Submit Expense Claim
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          title="Total Claims Submitted"
          value={`₹${totalClaimed.toLocaleString()}`}
          subtext={`${expenses.length} claims on record`}
          icon={Receipt}
          variant="copper"
        />
        <StatCard
          title="Approved & Reimbursed"
          value={`₹${approvedTotal.toLocaleString()}`}
          subtext="Processed by finance & HR"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          subtext="Awaiting administrator action"
          icon={CreditCard}
          variant="warning"
        />
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {['all', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
            onClick={() => setStatusFilter(st)}
            style={{ textTransform: 'capitalize' }}
          >
            {st === 'all' ? 'All Claims' : st}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Receipt size={36} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Expense Claims Found</h3>
          <p style={{ marginTop: '0.25rem' }}>Submit a claim for travel, hardware, or training reimbursements.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Expense Item</th>
                <th>Employee</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                {isAdminOrHR && <th>Review Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.title}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        className="avatar"
                        style={{
                          backgroundImage: item.employeeId?.avatarUrl ? `url(${item.employeeId.avatarUrl})` : 'none',
                          backgroundColor: item.employeeId?.avatarColor || 'var(--rose)',
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem'
                        }}
                      >
                        {!item.employeeId?.avatarUrl && item.employeeId?.firstName?.[0]}
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.employeeId?.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-copper">{item.category}</span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--peach)', fontSize: '0.95rem' }}>
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-${item.status}`}>{item.status}</span>
                  </td>
                  {isAdminOrHR && (
                    <td>
                      {item.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleApprove(item._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedExpenseId(item._id);
                              setRejectModalOpen(true);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {item.status === 'approved' ? `Approved by ${item.approvedBy?.firstName || 'Admin'}` : 'Declined'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit Claim Modal */}
      {isSubmitOpen && (
        <Modal
          title="Submit Expense Claim"
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Expense Title *</label>
              <input
                type="text"
                placeholder="e.g. Flight to Bangalore Client Site"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Equipment">Equipment</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals & Entertainment">Meals & Entertainment</option>
                  <option value="Training & Certifications">Training & Certifications</option>
                  <option value="Software & Tools">Software & Tools</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="8500"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Date of Expense</label>
              <input
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Description & Business Justification</label>
              <textarea
                rows={3}
                placeholder="Provide context on the business purpose for this claim..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsSubmitOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitBusy}>
                {submitBusy ? <span className="spinner" /> : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal
          title="Decline Expense Claim"
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
        >
          <form onSubmit={handleRejectConfirm}>
            <div className="field">
              <label>Reason for Rejection</label>
              <textarea
                rows={3}
                placeholder="Explain why this expense cannot be approved..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger">
                Decline Claim
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
