import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import departmentsApi from '../services/departmentsApi';
import employeesApi from '../services/employeesApi';
import Modal from '../components/Modal';

export default function Departments() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', manager: '' });
  const [busy, setBusy] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentsApi.getDepartments();
      if (res.success) {
        setDepartments(res.departments);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await employeesApi.getEmployees({ limit: 100 });
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployeesList();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', manager: '' });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      manager: typeof dept.manager === 'object' ? (dept.manager?._id || '') : (dept.manager || '')
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingDept) {
        const res = await departmentsApi.updateDepartment(editingDept._id, formData);
        if (res.success) {
          success('Department updated successfully!');
          setModalOpen(false);
          fetchDepartments();
        }
      } else {
        const res = await departmentsApi.createDepartment(formData);
        if (res.success) {
          success('Department created successfully!');
          setModalOpen(false);
          fetchDepartments();
        }
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to save department');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await departmentsApi.deleteDepartment(deleteTarget._id);
      if (res.success) {
        success('Department removed.');
        setDeleteTarget(null);
        fetchDepartments();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to delete department');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Department Management</h1>
          <p className="page-subtitle">
            Organize teams, assign department managers, and oversee employee distribution.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> New Department
        </button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
        </div>
      ) : departments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Departments Configured</h3>
          <p style={{ marginTop: '0.25rem' }}>Create departments to organize your company workforce.</p>
        </div>
      ) : (
        <div className="grid-2">
          {departments.map((dept) => (
            <div key={dept._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--copper)'
                    }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{dept.name}</h3>
                      <span className="badge badge-copper" style={{ marginTop: '0.2rem' }}>
                        {dept.employeeCount || 0} Member{dept.employeeCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(dept)}>
                      <Edit2 size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(dept)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              {/* Manager Card */}
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {dept.manager ? (
                    <>
                      <div
                        className="avatar"
                        style={{
                          backgroundColor: dept.manager.avatarColor || 'var(--copper)',
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem'
                        }}
                      >
                        {dept.manager.firstName?.[0]}
                        {dept.manager.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{dept.manager.fullName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{dept.manager.designation || 'Manager'}</div>
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No Manager Assigned</span>
                  )}
                </div>

                <span style={{ fontSize: '0.7rem', color: 'var(--copper)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Head of Dept
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingDept ? 'Edit Department' : 'Create Department'}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Department Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Engineering, Product Design, Marketing"
                required
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Core functions and organizational goals..."
                rows={3}
              />
            </div>

            <div className="field">
              <label>Department Manager</label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              >
                <option value="">Select Manager...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.designation || emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy}
              >
                {busy ? <span className="spinner" /> : (editingDept ? 'Save Changes' : 'Create Department')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          title="Delete Department"
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        >
          <p>
            Are you sure you want to delete <b>{deleteTarget.name}</b>?
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Employees assigned to this department will have their department unassigned.
          </p>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? <span className="spinner" /> : 'Confirm Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
