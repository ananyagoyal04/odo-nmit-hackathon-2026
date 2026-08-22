import React from 'react';
import { Printer, Download, X, Building2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

export default function PayslipModal({ isOpen, onClose, employee, company, salary }) {
  if (!isOpen || !employee) return null;

  const wage = salary?.monthlyWage || employee.salary?.monthlyWage || 0;
  const basic = salary?.basic || Math.round(wage * 0.5);
  const hra = salary?.hra || Math.round(basic * 0.5);
  const standardAllowance = salary?.standardAllowance || Math.round(wage * 0.1667);
  const perfBonus = salary?.perfBonus || Math.round(wage * 0.0833);
  const lta = salary?.lta || Math.round(wage * 0.0833);
  const fixed = salary?.fixed || Math.round(wage - (basic + hra + standardAllowance + perfBonus + lta));
  const pfEmployee = salary?.pfEmployee || Math.round(basic * 0.12);
  const professionalTax = 200;
  const totalDeductions = pfEmployee + professionalTax;
  const netPay = wage - totalDeductions;

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title={`Official Payslip — ${currentMonthName}`}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={720}
    >
      <div id="printable-payslip" style={{ padding: '0.5rem 0' }}>
        {/* Company Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--peach)' }}>
              {company?.name || 'Odoo India Pvt. Ltd.'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Infocity IT Park, Gandhinagar, Gujarat · {company?.email || 'contact@odooindia.com'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>CONFIDENTIAL</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
              Salary Slip: {currentMonthName}
            </div>
          </div>
        </div>

        {/* Employee Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <div>
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Employee Name: </span>
              <b>{employee.fullName || employee.firstName}</b>
            </div>
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Login / Employee ID: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--coral)' }}>{employee.loginId}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Department: </span>
              <span>{typeof employee.department === 'object' ? employee.department?.name : (employee.department || 'General')}</span>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Designation: </span>
              <b>{employee.designation || 'Staff Specialist'}</b>
            </div>
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Bank Account: </span>
              <span>{employee.bankInfo?.bankName || 'HDFC Bank'} (•••• {employee.bankInfo?.accountNumber?.slice(-4) || '9293'})</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>PAN Number: </span>
              <span>{employee.bankInfo?.pan || 'ABCPS1234D'}</span>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Earnings */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--success)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
              Earnings (Gross Allowances)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Basic Salary (50%)</span>
                <span>₹{basic.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>House Rent Allowance (HRA)</span>
                <span>₹{hra.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Standard Allowance</span>
                <span>₹{standardAllowance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Performance Bonus</span>
                <span>₹{perfBonus.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Leave Travel Allowance</span>
                <span>₹{lta.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fixed Component</span>
                <span>₹{fixed.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                <span>Total Gross Earnings</span>
                <span style={{ color: 'var(--peach)' }}>₹{wage.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--danger)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
              Statutory Deductions
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Provident Fund (Employee 12%)</span>
                <span style={{ color: 'var(--danger)' }}>- ₹{pfEmployee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Professional Tax (Flat)</span>
                <span style={{ color: 'var(--danger)' }}>- ₹{professionalTax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '2.5rem' }}>
                <span>Total Deductions</span>
                <span style={{ color: 'var(--danger)' }}>- ₹{totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Banner */}
        <div style={{
          backgroundColor: 'linear-gradient(135deg, var(--bg-surface), var(--bg-card))',
          border: '1.5px solid var(--border-rose)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--peach)', fontWeight: 700 }}>
              Net Disbursed Take-Home Pay
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              ₹{netPay.toLocaleString()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ gap: '0.35rem' }}>
              <CheckCircle2 size={13} /> Disbursed to Bank Account
            </span>
          </div>
        </div>
      </div>

      <div className="modal-footer" style={{ padding: '1.25rem 0 0 0' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-primary" onClick={handlePrint}>
          <Printer size={15} /> Print / Save Payslip PDF
        </button>
      </div>
    </Modal>
  );
}
