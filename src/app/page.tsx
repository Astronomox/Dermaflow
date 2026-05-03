'use client';

// src/app/page.tsx
// DermaFlow V2 — Landing page with claymorphism design
// Replaces the old landing page entirely

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  DermaFlowLogo,
  AnalysisIcon,
  ExplainableAIIcon,
  PersonalizedCareIcon,
  BioLLMIcon,
} from '@/components/icons/dermaflow-icons';

// ── Shared style constants ──
const CLAY_CARD: React.CSSProperties = {
  background: 'linear-gradient(145deg, #ffffff, #f0e6dc)',
  boxShadow: '8px 8px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.6)',
  borderRadius: 24,
};

const FONT_HEADLINE = '"Bricolage Grotesque", sans-serif';
const FONT_BODY = '"DM Sans", sans-serif';
const FONT_MONO = '"Space Mono", monospace';
const COLOR_DARK = '#2D1B0E';

// ── NAV (inline — only used on landing) ──
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="df-nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      background: scrolled ? 'rgba(255, 248, 240, 0.88)' : 'transparent',
      boxShadow: scrolled ? '0 1px 32px rgba(45,27,14,0.07)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
        <DermaFlowLogo size={34} />
        <span style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: '1.25rem', color: COLOR_DARK, letterSpacing: '-0.02em' }}>DermaFlow AI</span>
      </Link>

      <div className="df-nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {['Features', 'About', 'Contact'].map(label => (
          <NavLink key={label}>{label}</NavLink>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <NavBtn href="/login" outlined>Sign In</NavBtn>
        <NavBtn href="/signup">Get Started</NavBtn>
      </div>
    </nav>
  );
}

function NavLink({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: FONT_BODY, fontSize: '0.95rem', fontWeight: 500,
        color: COLOR_DARK, cursor: 'pointer', position: 'relative', padding: '0.25rem 0',
      }}
    >
      {children}
      <span style={{
        position: 'absolute', bottom: -2, left: '50%',
        transform: `translateX(-50%) scaleX(${hovered ? 1 : 0})`,
        width: '100%', height: 2,
        background: 'linear-gradient(90deg, #E8735A, #2A7B7B)',
        borderRadius: 2,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </span>
  );
}

function NavBtn({ children, href, outlined }: { children: React.ReactNode; href: string; outlined?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const base: React.CSSProperties = {
    fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.9rem',
    padding: '0.5rem 1.25rem', borderRadius: 50, cursor: 'pointer',
    border: 'none', whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: pressed ? 'scale(0.96)' : hovered ? 'translateY(-3px) scale(1.02)' : 'none',
  };

  const filled: React.CSSProperties = {
    ...base,
    background: 'linear-gradient(145deg, #E8735A, #d4614a)', color: '#FFF8F0',
    boxShadow: hovered
      ? '8px 8px 20px rgba(232,115,90,0.3), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.4)'
      : '6px 6px 14px rgba(0,0,0,0.08), -3px -3px 10px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.4)',
  };

  const outlinedStyle: React.CSSProperties = {
    ...base,
    background: 'linear-gradient(145deg, #ffffff, #f0ebe4)', color: '#2A7B7B',
    border: '1.5px solid #2A7B7B',
    boxShadow: hovered
      ? '6px 6px 14px rgba(42,123,123,0.15), -3px -3px 10px rgba(255,255,255,0.9)'
      : '4px 4px 10px rgba(0,0,0,0.06), -2px -2px 8px rgba(255,255,255,0.9)',
  };

  return (
    <Link href={href} style={outlined ? outlinedStyle : filled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >{children}</Link>
  );
}

// ── HERO BUTTON ──
function HeroBtn({ children, href, primary }: { children: React.ReactNode; href: string; primary?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <Link href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'relative', overflow: 'hidden', textDecoration: 'none',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: '1.05rem',
        padding: '0.85rem 2.1rem', borderRadius: 50, cursor: 'pointer', display: 'inline-block',
        border: primary ? 'none' : '2px solid #2A7B7B',
        background: primary ? 'linear-gradient(145deg, #E8735A, #d4614a)' : 'linear-gradient(145deg, #ffffff, #f0ebe4)',
        color: primary ? '#FFF8F0' : '#2A7B7B',
        boxShadow: primary
          ? (hovered ? '10px 10px 24px rgba(232,115,90,0.3), -5px -5px 14px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.3)' : '8px 8px 16px rgba(0,0,0,0.09), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.3)')
          : (hovered ? '8px 8px 20px rgba(42,123,123,0.15), -4px -4px 12px rgba(255,255,255,0.9)' : '6px 6px 14px rgba(0,0,0,0.07), -3px -3px 10px rgba(255,255,255,0.9)'),
        transform: pressed ? 'scale(0.96)' : hovered ? 'translateY(-4px) scale(1.02)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {primary && (
        <span style={{
          position: 'absolute', top: 0, left: '-100%', right: 0, bottom: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
          animation: 'df-shimmerSweep 4s ease-in-out infinite', borderRadius: 50,
        }} />
      )}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </Link>
  );
}

// ── FEATURE CARD ──
function FeatureCard({ Icon, title, desc, delay, visible, index }: {
  Icon: React.ComponentType; title: string; desc: string; delay: number; visible: boolean; index: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '2rem', borderRadius: 24,
        ...CLAY_CARD,
        boxShadow: hovered
          ? '12px 12px 28px rgba(0,0,0,0.1), -6px -6px 18px rgba(255,255,255,0.95), inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.04)'
          : CLAY_CARD.boxShadow,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        transform: !visible ? 'translateY(40px)' : hovered ? 'translateY(-8px)' : 'translateY(0)',
        opacity: visible ? 1 : 0,
        transitionDelay: visible ? `${delay}ms` : '0ms',
        filter: hovered ? 'drop-shadow(0 8px 32px rgba(232,115,90,0.12))' : 'none',
      }}
    >
      <div style={{ marginBottom: '1.25rem', animation: `df-iconBob ${3 + index * 0.4}s ease-in-out ${index * 0.5}s infinite` }}>
        <Icon />
      </div>
      <h3 style={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.15rem', color: COLOR_DARK, margin: '0 0 0.6rem', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontFamily: FONT_BODY, fontSize: '0.92rem', color: 'rgba(45,27,14,0.58)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ── ONCO BUTTON ──
function OncoBtn({ children, href }: { children: React.ReactNode; href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.95rem',
        padding: '0.75rem 1.75rem', borderRadius: 50, cursor: 'pointer', textDecoration: 'none',
        border: 'none', display: 'inline-block',
        background: 'linear-gradient(145deg, #E8735A, #d4614a)', color: '#FFF8F0',
        boxShadow: '8px 8px 16px rgba(0,0,0,0.2), -4px -4px 12px rgba(255,255,255,0.1), inset 1px 1px 2px rgba(255,255,255,0.3)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >{children}</Link>
  );
}

// ── REFERRAL CARD ──
function ReferralCard() {
  return (
    <div style={{
      width: 300, borderRadius: 24,
      background: 'linear-gradient(145deg, #ffffff, #f5ede3)',
      boxShadow: '16px 16px 32px rgba(0,0,0,0.18), -8px -8px 20px rgba(255,255,255,0.1), inset 1px 1px 3px rgba(255,255,255,0.9), inset -1px -1px 2px rgba(0,0,0,0.05)',
      border: '1px solid rgba(255,255,255,0.7)',
      padding: '1.75rem',
      animation: 'df-cardRock 6s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #E8735A, #d4614a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: '1.2rem', color: '#FFF8F0', boxShadow: '4px 4px 10px rgba(232,115,90,0.3)' }}>J</div>
        <div>
          <div style={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '0.95rem', color: COLOR_DARK }}>Patient Referral Card</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: '0.65rem', color: 'rgba(45,27,14,0.5)', letterSpacing: '0.05em' }}>ONCO-CONNECT #DF-2847</div>
        </div>
      </div>
      <div style={{ height: 1, background: 'linear-gradient(90deg, #E8735A22, #2A7B7B22)', marginBottom: '1.1rem' }} />
      {[
        { label: 'Assessment', value: 'Benign Nevus' },
        { label: 'Confidence', value: '94.2%' },
        { label: 'Date', value: 'Apr 29, 2026' },
      ].map(f => (
        <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: 'rgba(45,27,14,0.5)', fontWeight: 500 }}>{f.label}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.75rem', color: COLOR_DARK, fontWeight: 700 }}>{f.value}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: 'rgba(45,27,14,0.5)', fontWeight: 500 }}>Risk Level</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', animation: 'df-pulseGlow 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(76,175,80,0.6)' }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.75rem', color: '#4CAF50', fontWeight: 700 }}>Low</span>
        </div>
      </div>
      <div style={{ borderRadius: 12, background: 'linear-gradient(145deg, #f0e6dc, #e8ddd3)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(255,255,255,0.7)' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {[0,1,2,3,4,5,6].map(row => [0,1,2,3,4,5,6].map(col => (
            <rect key={`${row}-${col}`} x={col*5+2} y={row*5+2} width="4" height="4" rx="0.5"
              fill={((row+col)%3===0||(row===0&&col===0)||(row===0&&col===6)||(row===6&&col===0)) ? '#2D1B0E' : 'transparent'} opacity="0.8" />
          )))}
        </svg>
        <span style={{ fontFamily: FONT_BODY, fontSize: '0.68rem', color: 'rgba(45,27,14,0.5)', lineHeight: 1.4 }}>Scan to verify<br />DermaFlow AI</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ══════════════════════════════════════════════════════
export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const oncoRef = useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [oncoVisible, setOncoVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.target === featuresRef.current && e.isIntersecting) setFeaturesVisible(true);
        if (e.target === oncoRef.current && e.isIntersecting) setOncoVisible(true);
      });
    }, { threshold: 0.1 });
    if (featuresRef.current) obs.observe(featuresRef.current);
    if (oncoRef.current) obs.observe(oncoRef.current);
    return () => obs.disconnect();
  }, []);

  const features = [
    { Icon: AnalysisIcon, title: 'Instant Skin Analysis', desc: 'Upload a photo of any skin lesion and receive an instant AI-powered analysis with risk assessment scoring.', delay: 0 },
    { Icon: ExplainableAIIcon, title: 'Explainable AI', desc: "Understand the 'why' behind every analysis with Grad-CAM heatmap visualizations highlighting areas of concern.", delay: 100 },
    { Icon: PersonalizedCareIcon, title: 'Personalized Care', desc: 'Get custom hygiene tips, dietary advice, and product recommendations tailored to your unique skin profile.', delay: 200 },
    { Icon: BioLLMIcon, title: 'Ask a Bio-LLM', desc: 'Chat with a medically-trained AI assistant. Get verified answers to your dermatology questions anytime.', delay: 300 },
  ];

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100vh' }}>
      <Nav />

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: 72 }}>
        <div className="df-blob df-blob-1" />
        <div className="df-blob df-blob-2" />
        <div className="df-blob df-blob-3" />

        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className={`df-particle df-particle-${i % 6}`} style={{
            left: `${5 + (i * 5.2) % 90}%`,
            animationDelay: `${(i * 0.7) % 12}s`,
            width: `${3 + (i % 4)}px`,
            height: `${3 + (i % 4)}px`,
            animationDuration: `${8 + (i * 0.9) % 8}s`,
          }} />
        ))}

        {/* Grain overlay */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none', zIndex: 1 }}>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 820, padding: '0 2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            ...CLAY_CARD,
            boxShadow: '6px 6px 14px rgba(0,0,0,0.07), -3px -3px 10px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.8)',
            borderRadius: 50, padding: '0.4rem 1.1rem', marginBottom: '2rem',
          }}>
            <span style={{ color: '#E8735A', fontSize: 12 }}>✦</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: COLOR_DARK }}>AI-POWERED SKIN HEALTH</span>
          </div>

          <h1 style={{ margin: 0, lineHeight: 1.05 }}>
            <span className="df-hero-word df-word-1" style={{
              display: 'block', fontFamily: FONT_HEADLINE, fontWeight: 800,
              fontSize: 'clamp(3rem, 7vw, 5.5rem)', color: COLOR_DARK, letterSpacing: '-0.03em',
            }}>Your Skin.</span>
            <span className="df-hero-word df-word-2" style={{
              display: 'block', fontFamily: FONT_HEADLINE, fontWeight: 800,
              fontSize: 'clamp(3rem, 7vw, 5.5rem)', letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #E8735A 0%, #D4543A 60%, #c24030 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Understood.</span>
          </h1>

          <p style={{
            fontFamily: FONT_BODY, fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
            color: 'rgba(45,27,14,0.6)', maxWidth: 580, margin: '1.5rem auto 2.5rem', lineHeight: 1.7,
          }}>
            AI-powered skin analysis, personalized care, and expert guidance — all in one place.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <HeroBtn primary href="/signup">Get Started →</HeroBtn>
              <HeroBtn href="/login">Returning User?</HeroBtn>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} style={{ padding: '7rem 2rem', background: '#FFF8F0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: COLOR_DARK, letterSpacing: '-0.02em', margin: '0 0 1rem' }}>
              What DermaFlow Can Do
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: '1.1rem', color: 'rgba(45,27,14,0.6)', marginBottom: '1.5rem' }}>
              A full suite of AI-powered tools for your skin health journey.
            </p>
            <div style={{ width: 80, height: 4, borderRadius: 4, background: 'linear-gradient(90deg, #E8735A, #2A7B7B)', margin: '0 auto', animation: 'df-shimmer 3s ease-in-out infinite' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
            {features.map(({ Icon, title, desc, delay }, i) => (
              <FeatureCard key={title} Icon={Icon} title={title} desc={desc} delay={delay} visible={featuresVisible} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ONCO-CONNECT ── */}
      <section ref={oncoRef} style={{ background: 'linear-gradient(135deg, #2A7B7B 0%, #1a5c5c 100%)', padding: '7rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.5" fill="#FFF8F0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 340px', opacity: oncoVisible ? 1 : 0, transform: oncoVisible ? 'none' : 'translateY(40px)', transition: 'all 0.8s ease' }}>
            <div style={{ display: 'inline-block', fontFamily: FONT_MONO, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', color: '#A8E6CF', background: 'rgba(168,230,207,0.15)', border: '1px solid rgba(168,230,207,0.3)', borderRadius: 50, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>ONCO-CONNECT</div>
            <h2 style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FFF8F0', letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>
              Connecting You to Real Care
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: '1.05rem', color: 'rgba(255,248,240,0.75)', lineHeight: 1.75, marginBottom: '2rem' }}>
              Our triage system helps you take the next step. Generate a digital referral card and find verified oncology centers near you — bridging the gap between digital assessment and professional medical consultation.
            </p>
            <OncoBtn href="/signup">Learn About Onco-Connect →</OncoBtn>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', opacity: oncoVisible ? 1 : 0, transform: oncoVisible ? 'none' : 'translateY(40px)', transition: 'all 0.8s 0.2s ease' }}>
            <ReferralCard />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#f5ede3', padding: '3rem 2rem', borderTop: '1px solid rgba(232,115,90,0.15)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <DermaFlowLogo size={30} />
            <span style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: '1.1rem', color: COLOR_DARK }}>DermaFlow AI</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['Features', 'About', 'Privacy', 'Contact'].map(l => (
              <span key={l} style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', color: 'rgba(45,27,14,0.6)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = '#E8735A')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(45,27,14,0.6)')}
              >{l}</span>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: '0.8rem', color: 'rgba(45,27,14,0.45)', margin: 0 }}>For informational purposes only. Not a substitute for professional medical advice.</p>
            <p style={{ fontFamily: FONT_BODY, fontSize: '0.8rem', color: 'rgba(45,27,14,0.45)', margin: '0.25rem 0 0' }}>© 2026 DermaFlow AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
