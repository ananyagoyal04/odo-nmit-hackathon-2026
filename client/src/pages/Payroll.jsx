import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  Download,
  Users,
  Building,
  TrendingUp,
  ShieldCheck,
  Printer,
  ChevronRight,
  Search,
  Filter,
  CreditCard,
  Percent,
  Receipt
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import employeesApi from '../services/employeesApi';
import salaryApi from '../services/salaryApi';
import StatCard from '../components/StatCard';
import Tilt3DCard from '../components/Tilt3DCard';
import PayslipModal from '../components/PayslipModal';

// Helper function to format in Indian currency standard
function formatINR(val) {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

function formatLPA(annual) {
  const num = Number(annual) || 0;
  const lakhs = (num / 100000).toFixed(2);
  return `₹${lakhs} LPA`;
}

export default function Payroll() {
  const { user, company } = useAuth();
  const { success, error } = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [mySalaryBreakdown, setMySalaryBreakdown] = useState(null);

  const isAdminOrHR = ['SUPER_ADMIN', 'HR'].includes(user?.role);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      if (isAdminOrHR) {
        const res = await employeesApi.getEmployees({ limit: 100 });
        if (res.success) {
          setEmployees(res.employees || []);
        }
      }

      // Fetch user's own salary breakdown
      const mySalaryRes = await salaryApi.getSalary(user?._id);
      if (mySalaryRes.success) {
        setMySalaryBreakdown(mySalaryRes.salary);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [user]);

  const openPayslip = async (emp) => {
    try {
      setSelectedEmployee(emp);
      const res = await salaryApi.getSalary(emp._id);
      if (res.success) {
        setSelectedSalary(res.salary);
      }
      setPayslipOpen(true);
    } catch {
      setSelectedSalary(null);
      setPayslipOpen(true);
    }
  };

  // Calculations for summary stat cards
  const totalMonthlyGross = employees.reduce((sum, e) => sum + (e.salary?.monthlyWage || 75000), 0);
  const totalPF = Math.round(totalMonthlyGross * 0.5 * 0.12);
  const totalPT = employees.length * 200;
  const totalNetTakeHome = totalMonthlyGross - totalPF - totalPT;
  const totalYearlyCTC = totalMonthlyGross * 12;

  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.fullName?.toLowerCase().includes(q) ||
      e.loginId?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q)
    );
  });

  // User's own compensation figures
  const myMonthlyWage = user?.salary?.monthlyWage || (mySalaryBreakdown?.monthlyWage) || 280000;
  const myAnnualCTC = myMonthlyWage * 12;
  const myBasic = myMonthlyWage * 0.5;
  const myHRA = myMonthlyWage * 0.25;
  const myConveyance = 1600;
  const myMedical = 1250;
  const mySpecial = Math.max(0, myMonthlyWage - (myBasic + myHRA + myConveyance + myMedical));
  const myPF = Math.round(myBasic * 0.12);
  const myPT = 200;
  const myNet = myMonthlyWage - myPF - myPT;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Statutory Payroll & Compensation Matrix</h1>
          <p className="page-subtitle">
            Indian statutory labor compliance, CTC component breakdown, and certified printable payslips.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => openPayslip(user)}>
            <Printer size={15} /> My Official Payslip
          </button>
          {isAdminOrHR && (
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <FileText size={15} /> Print Roster Report
            </button>
          )}
        </div>
      </div>

      {/* Personal Compensation Dossier Card (Visible to all employees) */}
      <div className="card" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))', border: '1px solid var(--border-copper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              className="avatar"
              style={{
                backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : 'none',
                backgroundColor: user?.avatarColor || 'var(--rose)',
                width: 48,
                height: 48,
                fontSize: '1.1rem'
              }}
            >
              {!user?.avatarUrl && (user?.firstName?.[0] + (user?.lastName?.[0] || ''))}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{user?.fullName || user?.firstName}</h3>
                <span className="badge badge-copper">{user?.loginId}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {user?.designation || 'Staff'} · {typeof user?.department === 'object' ? user?.department?.name : 'Department'} · Pan: <b>{user?.bankInfo?.pan || 'ABCPS1234D'}</b>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>ANNUAL CTC PACKAGE</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--peach)' }}>{formatLPA(myAnnualCTC)}</span>
            </div>
            <div style={{ width: 1, height: 36, backgroundColor: 'var(--border-color)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>EST. MONTHLY IN-HAND</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>{formatINR(myNet)}</span>
            </div>
          </div>
        </div>

        {/* Detailed Indian Statutory Salary Breakdown Grid */}
        <div className="grid-4" style={{ gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Basic Salary (50%)</span>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatINR(myBasic)}</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>House Rent Allowance (25%)</span>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatINR(myHRA)}</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Special & Other Allowances</span>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatINR(mySpecial + myConveyance + myMedical)}</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(220, 88, 109, 0.08)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--rose)' }}>PF (12%) & Prof. Tax (PT)</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--rose)' }}>- {formatINR(myPF + myPT)}</div>
          </div>
        </div>
      </div>

      {/* Top Company Metrics (Visible for Super Admin & HR) */}
      {isAdminOrHR && (
        <>
          <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
            <StatCard
              title="Monthly Corporate Payroll"
              value={formatINR(totalMonthlyGross)}
              subtext={`₹${(totalMonthlyGross / 100000).toFixed(2)} Lakhs gross budget`}
              icon={DollarSign}
              variant="copper"
            />
            <StatCard
              title="Net Disbursed Take-Home"
              value={formatINR(totalNetTakeHome)}
              subtext="Direct bank transfers"
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Monthly EPF Statutory Pool"
              value={formatINR(totalPF)}
              subtext="12% Employee Provident Fund"
              icon={ShieldCheck}
              variant="warning"
            />
            <StatCard
              title="Annual Compensation Run-Rate"
              value={`₹${(totalYearlyCTC / 10000000).toFixed(2)} Cr`}
              subtext="Total annualized company CTC"
              icon={Building}
              variant="rose"
            />
          </div>

          {/* Employee Payroll Roster Table */}
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="card-title">
                <FileText size={18} color="var(--coral)" /> Staff Compensation Registry & Payslip Generator
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="input-wrap" style={{ minWidth: 260 }}>
                  <input
                    type="text"
                    placeholder="Search by name, ID, designation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  />
                </div>
                <span className="badge badge-copper">{filteredEmployees.length} Team Members</span>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No matching staff records found.
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Login ID</th>
                      <th>Department</th>
                      <th>Monthly Wage</th>
                      <th>Annual CTC (LPA)</th>
                      <th>PF (12%)</th>
                      <th>Est. Net Take-Home</th>
                      <th>Payslip Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => {
                      const wage = emp.salary?.monthlyWage || 75000;
                      const basic = wage * 0.5;
                      const pf = Math.round(basic * 0.12);
                      const net = wage - pf - 200;

                      return (
                        <tr key={emp._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                className="avatar"
                                style={{
                                  backgroundImage: emp.avatarUrl ? `url(${emp.avatarUrl})` : 'none',
                                  backgroundColor: emp.avatarColor || 'var(--rose)',
                                  width: 36,
                                  height: 36
                                }}
                              >
                                {!emp.avatarUrl && emp.firstName?.[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700 }}>{emp.fullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.designation}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-copper" style={{ fontFamily: 'var(--font-mono)' }}>
                              {emp.loginId}
                            </span>
                          </td>
                          <td>{typeof emp.department === 'object' ? emp.department?.name : 'General'}</td>
                          <td style={{ fontWeight: 700, color: 'var(--peach)' }}>
                            {formatINR(wage)}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--copper)' }}>
                            {formatLPA(wage * 12)}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--rose)' }}>
                            {formatINR(pf)}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                            {formatINR(net)}
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
                              onClick={() => openPayslip(emp)}
                            >
                              <Printer size={13} /> View Payslip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payslip Generator Modal */}
      {payslipOpen && selectedEmployee && (
        <PayslipModal
          isOpen={payslipOpen}
          onClose={() => { setPayslipOpen(false); setSelectedEmployee(null); }}
          employee={selectedEmployee}
          company={company}
          salary={selectedSalary}
        />
      )}
    </div>
  );
}
