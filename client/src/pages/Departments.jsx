import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  Building,
  DollarSign,
  Search,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import departmentsApi from '../services/departmentsApi';
import employeesApi from '../services/employeesApi';
import Modal from '../components/Modal';

export default function Departments() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', manager: '' });
  const [busy, setBusy] = useState(false);

  // Team Roster Modal
  const [selectedDeptForRoster, setSelectedDeptForRoster] = useState(null);
  const [rosterSearch, setRosterSearch] = useState('');

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentsApi.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
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
        setEmployees(res.employees || []);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployeesList();
  }, []);

  // Map employees into departments for rapid roster lookup and payroll aggregation
  const departmentMembersMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const deptId = emp.department?._id || emp.department?.id || emp.departmentId || emp.department;
      if (deptId) {
        if (!map[deptId]) map[deptId] = [];
        map[deptId].push(emp);
      }
    });
    return map;
  }, [employees]);

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
      manager: typeof dept.manager === 'object' ? (dept.manager?._id || dept.manager?.id || '') : (dept.manager || '')
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingDept) {
        const res = await departmentsApi.updateDepartment(editingDept._id || editingDept.id, formData);
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
      const res = await departmentsApi.deleteDepartment(deleteTarget._id || deleteTarget.id);
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

  // Filtered departments based on search
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.manager?.fullName && d.manager.fullName.toLowerCase().includes(q))
    );
  }, [departments, searchQuery]);

  // Overall statistics
  const totalDepartments = departments.length;
  const assignedLeadsCount = departments.filter((d) => d.manager).length;
  const totalAssignedStaff = employees.filter((e) => e.department).length;
  const totalMonthlyPayrollAllDepts = employees.reduce((acc, curr) => acc + (Number(curr.salary?.monthlyWage) || 0), 0);

  // Active roster for modal
  const activeRosterMembers = useMemo(() => {
    if (!selectedDeptForRoster) return [];
    const deptId = selectedDeptForRoster._id || selectedDeptForRoster.id;
    const members = departmentMembersMap[deptId] || [];
    if (!rosterSearch.trim()) return members;
    const q = rosterSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.designation && m.designation.toLowerCase().includes(q)) ||
        (m.loginId && m.loginId.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [selectedDeptForRoster, departmentMembersMap, rosterSearch]);

  const activeRosterTotalPayroll = useMemo(() => {
    if (!selectedDeptForRoster) return 0;
    const deptId = selectedDeptForRoster._id || selectedDeptForRoster.id;
    const members = departmentMembersMap[deptId] || [];
    return members.reduce((acc, curr) => acc + (Number(curr.salary?.monthlyWage) || 0), 0);
  }, [selectedDeptForRoster, departmentMembersMap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={26} color="var(--copper)" /> Department Architecture & Divisions
          </h1>
          <p className="page-subtitle">
            Manage organizational divisions, departmental leadership, headcount distribution, and team payroll allocation.
          </p>
        </div>

        {['SUPER_ADMIN', 'HR'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> New Department
          </button>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#d97706' }}>
            <Building2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Divisions</span>
            <div className="stat-value">{totalDepartments}</div>
            <span className="stat-meta">Enterprise Org Units</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Allocated Workforce</span>
            <div className="stat-value">{totalAssignedStaff} Members</div>
            <span className="stat-meta">Assigned Across Departments</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <UserCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Leadership Assigned</span>
            <div className="stat-value">{assignedLeadsCount} / {totalDepartments}</div>
            <span className="stat-meta">{totalDepartments > 0 ? `${Math.round((assignedLeadsCount / totalDepartments) * 100)}% Lead Coverage` : '0%'}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <DollarSign size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Monthly Dept CTC</span>
            <div className="stat-value">₹{(totalMonthlyPayrollAllDepts / 100000).toFixed(2)} L</div>
            <span className="stat-meta">Total Departmental Payroll</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 260 }}>
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search departments by name, lead manager, or mandate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              color: 'var(--text-main)',
              fontSize: '0.95rem'
            }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Showing <b>{filteredDepartments.length}</b> of <b>{departments.length}</b> departments
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35vh' }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Building2 size={48} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
          <h3>No Departments Found</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            {searchQuery ? 'No departments match your search criteria.' : 'Create departments to organize your corporate workforce.'}
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredDepartments.map((dept) => {
            const deptId = dept._id || dept.id;
            const deptMembers = departmentMembersMap[deptId] || [];
            const memberCount = deptMembers.length || dept.employeeCount || 0;
            const deptMonthlyCTC = deptMembers.reduce((acc, curr) => acc + (Number(curr.salary?.monthlyWage) || 0), 0);

            return (
              <div
                key={deptId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'rgba(217, 119, 6, 0.12)',
                          border: '1px solid rgba(217, 119, 6, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--copper)'
                        }}
                      >
                        <Building size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{dept.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span className="badge badge-copper" style={{ fontSize: '0.75rem' }}>
                            <Users size={12} style={{ marginRight: 4, display: 'inline' }} />
                            {memberCount} Member{memberCount === 1 ? '' : 's'}
                          </span>
                          {deptMonthlyCTC > 0 && (
                            <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                              ₹{(deptMonthlyCTC / 100000).toFixed(2)} L/mo CTC
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {['SUPER_ADMIN', 'HR'].includes(user?.role) && (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(dept)}
                          title="Edit Department"
                        >
                          <Edit2 size={13} />
                        </button>
                        {user?.role === 'SUPER_ADMIN' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(dept)}
                            title="Delete Department"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {dept.description || 'Core organizational function contributing to enterprise engineering and operations.'}
                  </p>

                  {/* Team Members Avatar Stack */}
                  {deptMembers.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {deptMembers.slice(0, 4).map((member, idx) => (
                          <div
                            key={member._id || member.id}
                            className="avatar"
                            style={{
                              width: 28,
                              height: 28,
                              fontSize: '0.7rem',
                              marginLeft: idx > 0 ? -8 : 0,
                              border: '2px solid var(--bg-surface)',
                              backgroundColor: member.avatarColor || 'var(--copper)',
                              backgroundImage: member.avatarUrl ? `url(${member.avatarUrl})` : 'none',
                              zIndex: 4 - idx
                            }}
                            title={`${member.fullName} (${member.designation || member.role})`}
                          >
                            {!member.avatarUrl && (member.firstName?.[0] + (member.lastName?.[0] || ''))}
                          </div>
                        ))}
                      </div>
                      {deptMembers.length > 4 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                          +{deptMembers.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Section: Manager Dossier & Roster Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {dept.manager ? (
                        <>
                          <div
                            className="avatar"
                            style={{
                              backgroundColor: dept.manager.avatarColor || 'var(--copper)',
                              backgroundImage: dept.manager.avatarUrl ? `url(${dept.manager.avatarUrl})` : 'none',
                              width: 32,
                              height: 32,
                              fontSize: '0.8rem'
                            }}
                          >
                            {!dept.manager.avatarUrl && (dept.manager.fullName?.[0] || 'M')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{dept.manager.fullName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              {dept.manager.designation || 'Head of Department'}
                            </div>
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>No Lead Assigned</span>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--copper)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Head of Dept
                    </span>
                  </div>

                  {/* View Roster Trigger */}
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}
                    onClick={() => {
                      setSelectedDeptForRoster(dept);
                      setRosterSearch('');
                    }}
                  >
                    <Users size={15} /> View Team Roster ({memberCount})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Roster Modal */}
      {selectedDeptForRoster && (
        <Modal
          title={`Team Roster · ${selectedDeptForRoster.name}`}
          isOpen={Boolean(selectedDeptForRoster)}
          onClose={() => setSelectedDeptForRoster(null)}
          maxWidth="720px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Department Summary Dossier */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Division Lead
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>
                  {selectedDeptForRoster.manager?.fullName || 'Not Assigned'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Staff
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>
                  {(departmentMembersMap[selectedDeptForRoster._id || selectedDeptForRoster.id] || []).length} Members
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Monthly Payroll Pool
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2, color: 'var(--copper)' }}>
                  ₹{(activeRosterTotalPayroll / 100000).toFixed(2)} Lakhs / mo
                </div>
              </div>
            </div>

            {/* Modal Internal Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                backgroundColor: 'var(--bg-base)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}
            >
              <Search size={16} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Filter members by name, designation, employee ID..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Roster Member List */}
            {activeRosterMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p>No team members found in this department matching filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '50vh', overflowY: 'auto' }}>
                {activeRosterMembers.map((member) => (
                  <div
                    key={member._id || member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        className="avatar"
                        style={{
                          width: 38,
                          height: 38,
                          backgroundColor: member.avatarColor || 'var(--copper)',
                          backgroundImage: member.avatarUrl ? `url(${member.avatarUrl})` : 'none',
                          fontSize: '0.85rem'
                        }}
                      >
                        {!member.avatarUrl && (member.firstName?.[0] + (member.lastName?.[0] || ''))}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{member.fullName}</span>
                          <span className="badge badge-copper" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                            {member.loginId}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 2 }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Briefcase size={12} /> {member.designation || member.role}
                          </span>
                          {member.location && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <MapPin size={12} /> {member.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--copper)' }}>
                          ₹{Number(member.salary?.monthlyWage || 0).toLocaleString('en-IN')}/mo
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          ₹{((Number(member.salary?.monthlyWage || 0) * 12) / 100000).toFixed(1)} LPA
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedDeptForRoster(null);
                          navigate('/employees');
                        }}
                        title="View in Employee Directory"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer" style={{ padding: '0.75rem 0 0 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedDeptForRoster(null)}
              >
                Close Roster
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Department Modal */}
      {modalOpen && (
        <Modal
          title={editingDept ? 'Edit Department' : 'Create Department'}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field">
              <label>Department Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Core Software Engineering, Cloud Architecture, Product Design"
                required
              />
            </div>

            <div className="field">
              <label>Mandate & Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this department's mission, responsibilities, and operational scope..."
                rows={3}
              />
            </div>

            <div className="field">
              <label>Assigned Department Lead / Manager</label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              >
                <option value="">Select Department Manager...</option>
                {employees.map((emp) => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.fullName} ({emp.loginId} - {emp.designation || emp.role})
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
            Employees assigned to this department will have their department unassigned automatically.
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
