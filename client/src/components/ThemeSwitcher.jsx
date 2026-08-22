import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setOpen((o) => !o)}
        title="Change Visual Theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-serif)',
          cursor: 'pointer'
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: current.accent,
            boxShadow: `0 0 8px ${current.accent}`
          }}
        />
        <span>{current.name}</span>
        <ChevronDown size={13} color="var(--text-dim)" />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '240px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-copper)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '0.5rem',
            zIndex: 150,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div style={{ padding: '0.4rem 0.6rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
            Visual Themes
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {themes.map((t) => {
              const isActive = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.825rem',
                    fontFamily: 'var(--font-serif)',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: t.accent,
                        border: '2px solid var(--border-color)'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: isActive ? 800 : 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{t.description}</div>
                    </div>
                  </div>

                  {isActive && <Check size={14} color="var(--copper)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
