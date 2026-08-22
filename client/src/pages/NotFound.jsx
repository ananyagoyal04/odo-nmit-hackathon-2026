import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      flexDirection: 'column',
      textAlign: 'center',
      gap: '1.25rem'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: 'var(--danger-bg)',
        color: 'var(--danger)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <AlertCircle size={36} />
      </div>

      <div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: 380 }}>
          The workforce resource you requested does not exist or has been moved.
        </p>
      </div>

      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> Return to Dashboard
      </button>
    </div>
  );
}
