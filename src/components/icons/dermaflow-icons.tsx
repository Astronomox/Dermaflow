// src/components/icons/dermaflow-icons.tsx
// DermaFlow V5 — Monochrome light icon set

import React from 'react';

const iconBoxStyle: React.CSSProperties = {
  width: 56, height: 56,
  borderRadius: 8,
  background: 'rgba(0,0,0,0.035)',
  border: '1px solid rgba(0,0,0,0.12)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const INK = '#0A0A0A';
const INK_DIM = 'rgba(10,10,10,0.5)';

export function DermaFlowLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="9" fill="#0A0A0A" />
      <circle cx="18" cy="18" r="10" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="18" cy="18" r="5"  fill="#FFFFFF" />
      <circle cx="20" cy="16" r="1.5" fill="#0A0A0A" opacity="0.9" />
    </svg>
  );
}

export function AnalysisIcon() {
  return (
    <div style={iconBoxStyle}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="11" fill="none" stroke={INK} strokeWidth="1.8" />
        <line x1="11" y1="17" x2="23" y2="17" stroke={INK_DIM} strokeWidth="1.3" strokeLinecap="round" />
        <line x1="17" y1="11" x2="17" y2="23" stroke={INK_DIM} strokeWidth="1.3" strokeLinecap="round" />
        <line x1="25" y1="25" x2="33" y2="33" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="17" cy="17" r="4" fill="none" stroke={INK} strokeWidth="1.1" opacity="0.5" />
      </svg>
    </div>
  );
}

export function ExplainableAIIcon() {
  return (
    <div style={iconBoxStyle}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20 C4 20 12 8 20 8 C28 8 36 20 36 20 C36 20 28 32 20 32 C12 32 4 20 4 20Z" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="20" r="7.5" fill="none" stroke={INK} strokeWidth="1.4" />
        <circle cx="20" cy="20" r="3.5" fill={INK} />
        <circle cx="22" cy="18" r="1.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function PersonalizedCareIcon() {
  return (
    <div style={iconBoxStyle}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 34 C20 34 5 24 5 14 C5 9.5 8.5 6 13 6 C16 6 18.5 7.5 20 9.5 C21.5 7.5 24 6 27 6 C31.5 6 35 9.5 35 14 C35 24 20 34 20 34Z" fill="none" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <line x1="20" y1="13" x2="20" y2="21" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="16" y1="17" x2="24" y2="17" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function BioLLMIcon() {
  return (
    <div style={iconBoxStyle}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8 C4 5.8 5.8 4 8 4 L32 4 C34.2 4 36 5.8 36 8 L36 26 C36 28.2 34.2 30 32 30 L22 30 L16 37 L16 30 L8 30 C5.8 30 4 28.2 4 26 Z" fill="none" stroke={INK} strokeWidth="1.7" />
        <path d="M14 10 C16 13 22 13 24 16 C22 19 16 19 14 22" stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M26 10 C24 13 18 13 16 16 C18 19 24 19 26 22" stroke={INK_DIM} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="34" r="1.8" fill={INK} className="df-dot-1" />
        <circle cx="20" cy="34" r="1.8" fill={INK} className="df-dot-2" />
        <circle cx="28" cy="34" r="1.8" fill={INK} className="df-dot-3" />
      </svg>
    </div>
  );
}
