// src/components/icons/dermaflow-icons.tsx
// DermaFlow V3 — Deep Water / Bioluminescent icon set

import React from 'react';

const iconCircleStyle: React.CSSProperties = {
  width: 64, height: 64,
  borderRadius: '16px',
  background: 'rgba(78,205,196,0.08)',
  border: '1px solid rgba(78,205,196,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 16px rgba(78,205,196,0.12)',
};

export function DermaFlowLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill="url(#dfLogoGrad)" />
      <circle cx="18" cy="18" r="10" fill="url(#dfLogoCircle)" opacity="0.9" />
      <circle cx="18" cy="18" r="6"  fill="rgba(255,255,255,0.18)" />
      <circle cx="18" cy="18" r="3"  fill="rgba(255,255,255,0.45)" />
      <defs>
        <linearGradient id="dfLogoGrad" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#4ECDC4" />
          <stop offset="1" stopColor="#1A6B6B" />
        </linearGradient>
        <radialGradient id="dfLogoCircle" cx="50%" cy="50%" r="50%">
          <stop stopColor="#7EEEE8" />
          <stop offset="1" stopColor="#2A7B7B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function AnalysisIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="11" fill="rgba(78,205,196,0.15)" stroke="#4ECDC4" strokeWidth="1.8" />
        <line x1="11" y1="17" x2="23" y2="17" stroke="#4ECDC4" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="17" y1="11" x2="17" y2="23" stroke="#4ECDC4" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="25" y1="25" x2="33" y2="33" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="17" cy="17" r="4" fill="none" stroke="#7EEEE8" strokeWidth="1.2" opacity="0.6" />
      </svg>
    </div>
  );
}

export function ExplainableAIIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="dfIrisGrad2" cx="50%" cy="50%" r="50%">
            <stop stopColor="#4ECDC4" />
            <stop offset="1" stopColor="#1A5C5C" />
          </radialGradient>
        </defs>
        <path d="M4 20 C4 20 12 8 20 8 C28 8 36 20 36 20 C36 20 28 32 20 32 C12 32 4 20 4 20Z" fill="none" stroke="#4ECDC4" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="20" r="8" fill="url(#dfIrisGrad2)" opacity="0.75" />
        <circle cx="20" cy="20" r="3.5" fill="#0A2A2A" />
        <circle cx="22" cy="18" r="1.5" fill="white" opacity="0.65" />
      </svg>
    </div>
  );
}

export function PersonalizedCareIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 34 C20 34 5 24 5 14 C5 9.5 8.5 6 13 6 C16 6 18.5 7.5 20 9.5 C21.5 7.5 24 6 27 6 C31.5 6 35 9.5 35 14 C35 24 20 34 20 34Z" fill="rgba(78,205,196,0.7)" stroke="#4ECDC4" strokeWidth="1.2" strokeLinejoin="round" />
        <line x1="20" y1="12" x2="20" y2="22" stroke="rgba(2,11,24,0.7)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="17" x2="25" y2="17" stroke="rgba(2,11,24,0.7)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function BioLLMIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8 C4 5.8 5.8 4 8 4 L32 4 C34.2 4 36 5.8 36 8 L36 26 C36 28.2 34.2 30 32 30 L22 30 L16 37 L16 30 L8 30 C5.8 30 4 28.2 4 26 Z" fill="rgba(78,205,196,0.18)" stroke="#4ECDC4" strokeWidth="1.5" />
        <path d="M14 10 C16 13 22 13 24 16 C22 19 16 19 14 22" stroke="#4ECDC4" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M26 10 C24 13 18 13 16 16 C18 19 24 19 26 22" stroke="#7EEEE8" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
        <circle cx="12" cy="34" r="2" fill="#4ECDC4" className="df-dot-1" />
        <circle cx="20" cy="34" r="2" fill="#4ECDC4" className="df-dot-2" />
        <circle cx="28" cy="34" r="2" fill="#4ECDC4" className="df-dot-3" />
      </svg>
    </div>
  );
}
