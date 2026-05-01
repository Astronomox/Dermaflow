// src/components/icons/dermaflow-icons.tsx
// Custom SVG icons for DermaFlow V2 claymorphism design
// Usage: import { DermaFlowLogo, AnalysisIcon, ... } from '@/components/icons/dermaflow-icons';

import React from 'react';

const iconCircleStyle: React.CSSProperties = {
  width: 72, height: 72,
  borderRadius: '50%',
  background: 'linear-gradient(145deg, #ffffff, #f0e6dc)',
  boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export function DermaFlowLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill="url(#dfLogoGrad)" />
      <circle cx="18" cy="18" r="10" fill="url(#dfLogoCircle)" opacity="0.9" />
      <circle cx="18" cy="18" r="6" fill="rgba(255,255,255,0.25)" />
      <circle cx="18" cy="18" r="3" fill="rgba(255,255,255,0.5)" />
      <defs>
        <linearGradient id="dfLogoGrad" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#E8735A" />
          <stop offset="1" stopColor="#2A7B7B" />
        </linearGradient>
        <radialGradient id="dfLogoCircle" cx="50%" cy="50%" r="50%">
          <stop stopColor="#F4A89A" />
          <stop offset="1" stopColor="#2A7B7B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function AnalysisIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="11" fill="#F4A89A" opacity="0.35" stroke="#E8735A" strokeWidth="2" />
        <line x1="11" y1="17" x2="23" y2="17" stroke="#E8735A" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="17" y1="11" x2="17" y2="23" stroke="#E8735A" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="13" y1="13" x2="21" y2="21" stroke="#E8735A" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="21" y1="13" x2="13" y2="21" stroke="#E8735A" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="25" y1="25" x2="33" y2="33" stroke="#E8735A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="17" cy="17" r="4" fill="none" stroke="#E8735A" strokeWidth="1.5" opacity="0.6" />
      </svg>
    </div>
  );
}

export function ExplainableAIIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="dfIrisGrad" cx="50%" cy="50%" r="50%">
            <stop stopColor="#E8735A" />
            <stop offset="1" stopColor="#2A7B7B" />
          </radialGradient>
        </defs>
        <path d="M4 20 C4 20 12 8 20 8 C28 8 36 20 36 20 C36 20 28 32 20 32 C12 32 4 20 4 20Z" fill="none" stroke="#2A7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="8" fill="url(#dfIrisGrad)" opacity="0.8" />
        <circle cx="20" cy="20" r="3.5" fill="#1a5c5c" />
        <circle cx="22" cy="18" r="1.5" fill="white" opacity="0.7" />
        <line x1="20" y1="2" x2="20" y2="5" stroke="#2A7B7B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="20" y1="35" x2="20" y2="38" stroke="#2A7B7B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="2" y1="20" x2="5" y2="20" stroke="#E8735A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="35" y1="20" x2="38" y2="20" stroke="#E8735A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  );
}

export function PersonalizedCareIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 34 C20 34 5 24 5 14 C5 9.5 8.5 6 13 6 C16 6 18.5 7.5 20 9.5 C21.5 7.5 24 6 27 6 C31.5 6 35 9.5 35 14 C35 24 20 34 20 34Z" fill="#E8735A" opacity="0.85" stroke="#D4543A" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="20" y1="12" x2="20" y2="22" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="17" x2="25" y2="17" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="33" cy="8" r="1.5" fill="#E8735A" />
        <circle cx="36" cy="13" r="1" fill="#F4A89A" />
        <circle cx="30" cy="5" r="1" fill="#D4543A" />
      </svg>
    </div>
  );
}

export function BioLLMIcon() {
  return (
    <div style={iconCircleStyle}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8 C4 5.8 5.8 4 8 4 L32 4 C34.2 4 36 5.8 36 8 L36 26 C36 28.2 34.2 30 32 30 L22 30 L16 37 L16 30 L8 30 C5.8 30 4 28.2 4 26 Z" fill="#2A7B7B" opacity="0.9" />
        <path d="M14 10 C16 13 22 13 24 16 C22 19 16 19 14 22" stroke="#FFF8F0" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M26 10 C24 13 18 13 16 16 C18 19 24 19 26 22" stroke="#F4A89A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />
        <line x1="14" y1="10" x2="26" y2="10" stroke="rgba(255,248,240,0.5)" strokeWidth="1" strokeLinecap="round" />
        <line x1="14" y1="16" x2="26" y2="16" stroke="rgba(255,248,240,0.5)" strokeWidth="1" strokeLinecap="round" />
        <line x1="14" y1="22" x2="26" y2="22" stroke="rgba(255,248,240,0.5)" strokeWidth="1" strokeLinecap="round" />
        <circle cx="12" cy="34" r="2" fill="#E8735A" className="df-dot-1" />
        <circle cx="20" cy="34" r="2" fill="#E8735A" className="df-dot-2" />
        <circle cx="28" cy="34" r="2" fill="#E8735A" className="df-dot-3" />
      </svg>
    </div>
  );
}
