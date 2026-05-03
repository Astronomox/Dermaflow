// src/components/ui/dermaflow-spinner.tsx
// Branded loading spinner using the DermaFlow logo
// Usage: <DermaFlowSpinner /> or <DermaFlowSpinner size={48} />

import React from 'react';

export function DermaFlowSpinner({ size = 40, label }: { size?: number; label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: size, height: size,
        animation: 'df-spinnerRotate 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      }}>
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dfSpinGrad" x1="0" y1="0" x2="36" y2="36">
              <stop stopColor="#E8735A" />
              <stop offset="1" stopColor="#2A7B7B" />
            </linearGradient>
            <radialGradient id="dfSpinCircle" cx="50%" cy="50%" r="50%">
              <stop stopColor="#F4A89A" />
              <stop offset="1" stopColor="#2A7B7B" />
            </radialGradient>
          </defs>
          <rect width="36" height="36" rx="10" fill="url(#dfSpinGrad)" />
          <circle cx="18" cy="18" r="10" fill="url(#dfSpinCircle)" opacity="0.9" />
          <circle cx="18" cy="18" r="6" fill="rgba(255,255,255,0.25)" />
          <circle cx="18" cy="18" r="3" fill="rgba(255,255,255,0.5)" />
        </svg>
      </div>
      {label && (
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.85rem',
          color: 'rgba(45,27,14,0.5)',
          fontWeight: 500,
          margin: 0,
        }}>{label}</p>
      )}

      <style>{`
        @keyframes df-spinnerRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
}

// Inline spinner for buttons (smaller, no label)
export function DermaFlowButtonSpinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 36 36" fill="none"
      style={{ animation: 'df-spinnerRotate 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
    >
      <defs>
        <linearGradient id="dfBtnSpinGrad" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#FFF8F0" />
          <stop offset="1" stopColor="rgba(255,248,240,0.5)" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#dfBtnSpinGrad)" opacity="0.3" />
      <circle cx="18" cy="18" r="10" fill="rgba(255,255,255,0.4)" />
      <circle cx="18" cy="18" r="6" fill="rgba(255,255,255,0.2)" />
      <circle cx="18" cy="18" r="3" fill="rgba(255,255,255,0.5)" />

      <style>{`
        @keyframes df-spinnerRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </svg>
  );
}
