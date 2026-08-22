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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import employeesApi from '../services/employeesApi';
import salaryApi from '../services/salaryApi';
import StatCard from '../components/StatCard';
import Tilt3DCard from '../components/Tilt3DCard';
import PayslipModal from '../components/PayslipModal';

export default function Payroll() {
  const { user, company } = useAuth();
  const { success, error } = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [payslipOpen, setPayslipOpen] = useState(false);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isHR = user?.role === 'HR';

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const res = await employeesApi.getEmployees({ limit: 100 });
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

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
  const totalNetTakeHome = totalMonthlyGross - totalPF - (employees.length * 200);
  const totalYearlyCTC = totalMonthlyGross * 12;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Payroll & Compensation Matrix</h1>
          <p className="page-subtitle">
            Company-wide salary distribution, statutory deductions, and official printable payslips.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Print Payroll Report
          </button>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          title="Monthly Payroll Budget"
          value={`₹${totalMonthlyGross.toLocaleString()}`}
          subtext="Total company gross wages"
          icon={DollarSign}
          variant="copper"
        />
        <StatCard
          title="Net Take-Home Disbursed"
          value={`₹${totalNetTakeHome.toLocaleString()}`}
          subtext="After PF & professional tax"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Total PF Reserve"
          value={`₹${totalPF.toLocaleString()}`}
          subtext="Monthly employee PF pool"
          icon={ShieldCheck}
          variant="warning"
        />
        <StatCard
          title="Annual CTC Run-Rate"
          value={`₹${(totalYearlyCTC / 10000000).toFixed(2)} Cr`}
          subtext="Projected annual compensation"
          icon={Building}
          variant="rose"
        />
      </div>

      {/* Employee Payroll Roster Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={18} color="var(--coral)" /> Employee Salary & Payslip Registry
          </div>
          <span className="badge badge-copper">{employees.length} Active Staff</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
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
                  <th>Annual CTC</th>
                  <th>Est. Net Take-Home</th>
                  <th>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const wage = emp.salary?.monthlyWage || 75000;
                  const basic = wage * 0.5;
                  const pf = basic * 0.12;
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
                        ₹{wage.toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{(wage * 12).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                        ₹{net.toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
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
