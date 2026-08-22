import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Mail,
  Phone,
  Building,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import employeesApi from '../services/employeesApi';
import departmentsApi from '../services/departmentsApi';
import Modal from '../components/Modal';
import Tilt3DCard from '../components/Tilt3DCard';

export default function Employees() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  // Quick Edit Employee Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    role: 'EMPLOYEE',
    status: 'present',
    location: '',
    avatarUrl: '',
    monthlyWage: 75000
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    employeeCode: '',
    joiningDate: new Date().toISOString().split('T')[0],
    location: 'Gandhinagar, Gujarat',
    role: 'EMPLOYEE',
    monthlyWage: 75000,
    gender: 'Male',
    dob: '1995-01-01',
    maritalStatus: 'Single',
    nationality: 'Indian',
    address: '',
    personalEmail: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    pan: '',
    uan: '',
    about: '',
    jobDescription: '',
    hobbies: '',
    skills: 'React, Node.js, MongoDB',
    certifications: 'AWS Certified',
    password: 'Password@123'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeesApi.getEmployees({
        search,
        department: departmentFilter,
        role: roleFilter,
        status: statusFilter
      });
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to fetch employee directory');
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
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, departmentFilter, roleFilter, statusFilter]);

  useEffect(() => {
    if (searchParams.get('add') === 'true' && ['SUPER_ADMIN', 'HR'].includes(user?.role)) {
      setIsAddModalOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [searchParams, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setCreateBusy(true);
    setCreatedResult(null);

    try {
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        certifications: formData.certifications ? formData.certifications.split(',').map((s) => s.trim()).filter(Boolean) : [],
        department: formData.department || null,
        monthlyWage: Number(formData.monthlyWage) || 0
      };

      const res = await employeesApi.createEmployee(payload);
      if (res.success) {
        success(`Employee created! Login ID: ${res.generatedLoginId}`);
        setCreatedResult(res);
        fetchEmployees();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setCreateBusy(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await employeesApi.exportEmployees();
      success('Employee directory CSV downloaded.');
    } catch (err) {
      error('Failed to export CSV');
    }
  };

  const openEditModal = (emp, e) => {
    if (e) e.stopPropagation();
    setEditingEmployee(emp);
    setEditFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      designation: emp.designation || '',
      department: typeof emp.department === 'object' ? emp.department?._id : (emp.department || ''),
      role: emp.role || 'EMPLOYEE',
      status: emp.status || 'present',
      location: emp.location || 'Gandhinagar, Gujarat',
      avatarUrl: emp.avatarUrl || '',
      monthlyWage: emp.salary?.monthlyWage || 75000
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setEditBusy(true);

    try {
      const payload = {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        email: editFormData.email.trim().toLowerCase(),
        phone: editFormData.phone.trim(),
        designation: editFormData.designation.trim(),
        department: editFormData.department || null,
        role: editFormData.role,
        status: editFormData.status,
        location: editFormData.location.trim(),
        avatarUrl: editFormData.avatarUrl.trim(),
        salary: { monthlyWage: Number(editFormData.monthlyWage) || 0 }
      };

      const res = await employeesApi.updateEmployee(editingEmployee._id, payload);
      if (res.success) {
        success(`Employee profile for ${res.employee.fullName || res.employee.firstName} updated!`);
        setIsEditModalOpen(false);
        setEditingEmployee(null);
        fetchEmployees();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to update employee details');
    } finally {
      setEditBusy(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard!');
  };

  const canAdd = ['SUPER_ADMIN', 'HR'].includes(user?.role);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Employee Directory</h1>
          <p className="page-subtitle">
            Browse, filter, and manage staff records across all departments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>

          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '0.2rem', border: '1px solid var(--border-color)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={15} />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setViewMode('table')}
            >
              <List size={15} />
            </button>
          </div>

          {canAdd && (
            <button className="btn btn-primary" onClick={() => { setIsAddModalOpen(true); setCreatedResult(null); }}>
              <Plus size={16} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
          <div className="input-wrap">
            <input
              type="text"
              placeholder="Search by name, Login ID, email, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="HR">HR Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
        </div>
      ) : employees.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Employees Found</h3>
          <p style={{ marginTop: '0.25rem' }}>Try adjusting your search filters or add a new team member.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-3">
          {employees.map((emp) => (
            <Tilt3DCard
              key={emp._id}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => navigate(`/employees/${emp._id}`)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', transform: 'translateZ(15px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      className="avatar"
                      style={{
                        backgroundImage: emp.avatarUrl ? `url(${emp.avatarUrl})` : 'none',
                        backgroundColor: emp.avatarColor || 'var(--rose)',
                        width: 48,
                        height: 48,
                        fontSize: '1.1rem',
                        transform: 'translateZ(10px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        border: '2px solid rgba(255, 187, 148, 0.4)'
                      }}
                    >
                      {!emp.avatarUrl && (emp.firstName?.[0] + (emp.lastName?.[0] || ''))}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {emp.fullName || emp.firstName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {emp.designation || 'Staff Member'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-${emp.status}`}>
                    {emp.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.825rem', color: 'var(--text-dim)', transform: 'translateZ(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-copper" style={{ fontSize: '0.7rem' }}>
                      ID: {emp.loginId}
                    </span>
                    {emp.role !== 'EMPLOYEE' && (
                      <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                        {emp.role}
                      </span>
                    )}
                    {emp.salary?.monthlyWage !== undefined && (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        ₹{emp.salary.monthlyWage.toLocaleString()} / mo
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <Mail size={14} color="var(--coral)" />
                    <span style={{ color: 'var(--text-muted)' }}>{emp.email}</span>
                  </div>

                  {emp.department && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={14} color="var(--coral)" />
                      <span>{typeof emp.department === 'object' ? emp.department.name : 'Department'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: 'translateZ(12px)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Joined: {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '—'}
                </span>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  {canAdd && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={(e) => openEditModal(emp, e)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--peach)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    View Profile <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            </Tilt3DCard>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Login ID</th>
                <th>Department</th>
                <th>Monthly Salary</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp._id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className="avatar"
                        style={{
                          backgroundImage: emp.avatarUrl ? `url(${emp.avatarUrl})` : 'none',
                          backgroundColor: emp.avatarColor || 'var(--rose)',
                          width: 34,
                          height: 34,
                          fontSize: '0.8rem'
                        }}
                      >
                        {!emp.avatarUrl && (emp.firstName?.[0] + (emp.lastName?.[0] || ''))}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-copper" style={{ fontFamily: 'var(--font-mono)' }}>
                      {emp.loginId}
                    </span>
                  </td>
                  <td>{typeof emp.department === 'object' ? emp.department?.name : '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--peach)' }}>
                    {emp.salary?.monthlyWage ? `₹${emp.salary.monthlyWage.toLocaleString()}` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${emp.role === 'SUPER_ADMIN' ? 'badge-rose' : emp.role === 'HR' ? 'badge-info' : 'badge-secondary'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${emp.status}`}>{emp.status}</span>
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {canAdd && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={(e) => openEditModal(emp, e)}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp._id}`); }}
                      >
                        Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <Modal
          title="Onboard New Employee"
          isOpen={isAddModalOpen}
          onClose={() => { setIsAddModalOpen(false); setCreatedResult(null); }}
          maxWidth={750}
        >
          {createdResult ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2>Employee Created Successfully!</h2>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                The atomic Login ID sequence has been generated and leave balances initialized.
              </p>

              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-copper)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                maxWidth: 420,
                margin: '0 auto 1.5rem',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Login ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--copper)', fontFamily: 'var(--font-mono)' }}>
                      {createdResult.generatedLoginId}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(createdResult.generatedLoginId)}>
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Initial Password</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {createdResult.defaultPassword}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(createdResult.defaultPassword)}>
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setCreatedResult(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      department: '',
                      designation: '',
                      employeeCode: '',
                      joiningDate: new Date().toISOString().split('T')[0],
                      location: 'Gandhinagar, Gujarat',
                      role: 'EMPLOYEE',
                      monthlyWage: 75000,
                      gender: 'Male',
                      dob: '1995-01-01',
                      maritalStatus: 'Single',
                      nationality: 'Indian',
                      address: '',
                      personalEmail: '',
                      bankName: '',
                      accountNumber: '',
                      ifsc: '',
                      pan: '',
                      uan: '',
                      about: '',
                      jobDescription: '',
                      hobbies: '',
                      skills: '',
                      certifications: '',
                      password: 'Password@123'
                    });
                  }}
                >
                  Add Another Employee
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    navigate(`/employees/${createdResult.employee._id}`);
                  }}
                >
                  Open Employee Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Shruthika"
                    required
                  />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Dutta"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Work Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="s.dutta@odooindia.com"
                    required
                  />
                </div>
                <div className="field">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleInputChange}>
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Senior Full Stack Engineer"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR Manager</option>
                    {user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                  </select>
                </div>
                <div className="field">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                  />
                </div>
                {user?.role === 'SUPER_ADMIN' && (
                  <div className="field">
                    <label>Monthly Wage (₹)</label>
                    <input
                      type="number"
                      name="monthlyWage"
                      value={formData.monthlyWage}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="field">
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, System Design"
                />
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createBusy}
                >
                  {createBusy ? <span className="spinner" /> : 'Generate ID & Create Employee'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Edit Employee / Alter Details Modal */}
      {isEditModalOpen && editingEmployee && (
        <Modal
          title={`Edit Details — ${editingEmployee.fullName || editingEmployee.firstName}`}
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingEmployee(null); }}
          maxWidth={700}
        >
          <form onSubmit={handleEditSave}>
            {/* Live Avatar Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              <div
                className="avatar"
                style={{
                  width: 52,
                  height: 52,
                  backgroundImage: editFormData.avatarUrl ? `url(${editFormData.avatarUrl})` : 'none',
                  backgroundColor: editingEmployee.avatarColor || 'var(--rose)',
                  fontSize: '1.25rem',
                  border: '2px solid var(--border-copper)'
                }}
              >
                {!editFormData.avatarUrl && (editFormData.firstName?.[0] + (editFormData.lastName?.[0] || ''))}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Profile Portrait URL (Image Link)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or any image link"
                  value={editFormData.avatarUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                  style={{ marginTop: '0.25rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>First Name *</label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Work Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Designation</label>
                <input
                  type="text"
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Department</label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                >
                  <option value="">No Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR">HR Manager</option>
                  {user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                </select>
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="field">
                <label>Monthly Salary (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.monthlyWage}
                  onChange={(e) => setEditFormData({ ...editFormData, monthlyWage: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label>Office Location</label>
              <input
                type="text"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setIsEditModalOpen(false); setEditingEmployee(null); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={editBusy}
              >
                {editBusy ? <span className="spinner" /> : 'Save Changes to Database'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
