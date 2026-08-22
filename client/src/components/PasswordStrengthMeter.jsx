import React from 'react';
import { Check, X } from 'lucide-react';

export function calculatePasswordStrength(password = '') {
  let score = 0;
  if (!password) return { score: 0, label: 'Empty', color: 'var(--text-dim)' };

  const hasLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLength) score++;
  if (hasLower && hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--danger)', checks: { hasLength, hasUpper, hasNumber, hasSpecial } };
  if (score === 2) return { score: 2, label: 'Fair', color: 'var(--warning)', checks: { hasLength, hasUpper, hasNumber, hasSpecial } };
  if (score === 3) return { score: 3, label: 'Good', color: 'var(--info)', checks: { hasLength, hasUpper, hasNumber, hasSpecial } };
  return { score: 4, label: 'Strong', color: 'var(--success)', checks: { hasLength, hasUpper, hasNumber, hasSpecial } };
}

export default function PasswordStrengthMeter({ password = '' }) {
  if (!password) return null;

  const { score, label, color, checks = {} } = calculatePasswordStrength(password);

  return (
    <div style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
      {/* 4 Segmented Progress Bars */}
      <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '0.35rem' }}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              borderRadius: '2px',
              backgroundColor: step <= score ? color : 'var(--border-color)',
              transition: 'all 0.25s ease'
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>Password Strength:</span>
        <span style={{ fontWeight: 700, color }}>{label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem', marginTop: '0.4rem', fontSize: '0.7rem' }}>
        <div style={{ color: checks.hasLength ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {checks.hasLength ? <Check size={11} /> : <X size={11} />} 8+ Characters
        </div>
        <div style={{ color: checks.hasUpper ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {checks.hasUpper ? <Check size={11} /> : <X size={11} />} Upper & Lower
        </div>
        <div style={{ color: checks.hasNumber ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {checks.hasNumber ? <Check size={11} /> : <X size={11} />} Number (0-9)
        </div>
        <div style={{ color: checks.hasSpecial ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {checks.hasSpecial ? <Check size={11} /> : <X size={11} />} Symbol (!@#$)
        </div>
      </div>
    </div>
  );
}
