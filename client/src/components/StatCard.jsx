import React from 'react';
import Tilt3DCard from './Tilt3DCard';

export default function StatCard({ title, value, subtext, icon: Icon, trend, variant = 'default' }) {
  const getBorderColor = () => {
    switch (variant) {
      case 'copper': return 'var(--border-copper)';
      case 'success': return 'var(--success-border)';
      case 'warning': return 'var(--warning-border)';
      case 'danger': return 'var(--danger-border)';
      default: return 'var(--border-color)';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'copper': return 'var(--copper)';
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      default: return 'var(--copper)';
    }
  };

  return (
    <Tilt3DCard style={{ borderColor: getBorderColor(), overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ transform: 'translateZ(15px)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem', fontFamily: 'var(--font-sans)' }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              {subtext}
            </div>
          )}
        </div>

        {Icon && (
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getIconColor(),
            transform: 'translateZ(25px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <Icon size={22} />
          </div>
        )}
      </div>

      {trend && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', transform: 'translateZ(10px)' }}>
          {trend}
        </div>
      )}
    </Tilt3DCard>
  );
}
