'use client';

// src/app/page.tsx
// DermaFlow V3 — Deep Water / Bioluminescent redesign
// River canvas animation in hero, glassmorphism cards

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  DermaFlowLogo,
  AnalysisIcon,
  ExplainableAIIcon,
  PersonalizedCareIcon,
  BioLLMIcon,
} from '@/components/icons/dermaflow-icons';

// ── Design tokens ──
const C = {
  bg:        '#020B18',
  bgCard:    'rgba(255,255,255,0.04)',
  teal:      '#4ECDC4',
  tealDim:   '#2A7B7B',
  coral:     '#FF6B6B',
  coralDim:  '#D4453A',
  text:      '#E8F4F8',
  textMid:   'rgba(232,244,248,0.6)',
  textDim:   'rgba(232,244,248,0.38)',
  border:    'rgba(255,255,255,0.08)',
  borderHov: 'rgba(78,205,196,0.3)',
} as const;

const FONT_DISPLAY = '"Syne", sans-serif';
const FONT_BODY    = '"Inter", sans-serif';
const FONT_MONO    = '"JetBrains Mono", monospace';

// ── RIVER CANVAS ANIMATION ──
function RiverCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      if (!canvas) return;
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Wave streams ──
    const STREAMS = 28;
    type Stream = {
      y: number;
      speed: number;
      amplitude: number;
      frequency: number;
      phase: number;
      width: number;
      alpha: number;
      colorT: number; // 0=teal, 1=coral
    };

    const streams: Stream[] = Array.from({ length: STREAMS }, (_, i) => ({
      y:         (i / STREAMS) * 1.4 - 0.2,  // fraction of H
      speed:     0.0004 + Math.random() * 0.0006,
      amplitude: 18 + Math.random() * 60,
      frequency: 0.003 + Math.random() * 0.005,
      phase:     Math.random() * Math.PI * 2,
      width:     0.5 + Math.random() * 2.2,
      alpha:     0.06 + Math.random() * 0.18,
      colorT:    Math.random(),
    }));

    // ── Floating particles (bubbles) ──
    type Particle = { x: number; y: number; r: number; vy: number; vx: number; alpha: number; life: number; maxLife: number; };
    const particles: Particle[] = [];

    function spawnParticle() {
      particles.push({
        x:       Math.random() * W,
        y:       H + 10,
        r:       1 + Math.random() * 4,
        vy:      -(0.3 + Math.random() * 0.9),
        vx:      (Math.random() - 0.5) * 0.4,
        alpha:   0,
        life:    0,
        maxLife: 140 + Math.random() * 180,
      });
    }

    let t = 0;
    let spawnTimer = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Deep gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#020B18');
      bg.addColorStop(0.5, '#041525');
      bg.addColorStop(1,   '#020B18');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Draw streams ──
      for (const s of streams) {
        ctx.beginPath();
        ctx.lineWidth = s.width;

        const tealColor  = `rgba(78, 205, 196, ${s.alpha})`;
        const coralColor = `rgba(255, 107, 107, ${s.alpha * 0.7})`;
        ctx.strokeStyle  = s.colorT < 0.65 ? tealColor : coralColor;

        const baseY = s.y * H;
        for (let x = 0; x <= W; x += 3) {
          const y = baseY
            + Math.sin(x * s.frequency + t * s.speed * W + s.phase) * s.amplitude
            + Math.sin(x * s.frequency * 1.7 + t * s.speed * W * 0.6 + s.phase * 1.3) * s.amplitude * 0.35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ── Horizontal glow bands ──
      for (let i = 0; i < 3; i++) {
        const bandY = (0.25 + i * 0.25) * H + Math.sin(t * 0.0003 + i) * 30;
        const grd   = ctx.createLinearGradient(0, bandY - 40, 0, bandY + 40);
        grd.addColorStop(0,   'transparent');
        grd.addColorStop(0.5, `rgba(78,205,196,${0.018 + i * 0.006})`);
        grd.addColorStop(1,   'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, bandY - 40, W, 80);
      }

      // ── Particles ──
      spawnTimer++;
      if (spawnTimer % 6 === 0 && particles.length < 70) spawnParticle();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        // fade in / out
        if (p.life < 30)         p.alpha = p.life / 30;
        else if (p.life > p.maxLife - 40) p.alpha = (p.maxLife - p.life) / 40;
        else                     p.alpha = 1;

        if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78,205,196,${p.alpha * 0.55})`;
        ctx.fill();

        // glow ring on bigger particles
        if (p.r > 2.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(78,205,196,${p.alpha * 0.12})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }

      // ── Top & bottom fade-out vignette ──
      const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.22);
      topFade.addColorStop(0, '#020B18');
      topFade.addColorStop(1, 'transparent');
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, W, H * 0.22);

      const botFade = ctx.createLinearGradient(0, H * 0.78, 0, H);
      botFade.addColorStop(0, 'transparent');
      botFade.addColorStop(1, '#020B18');
      ctx.fillStyle = botFade;
      ctx.fillRect(0, H * 0.78, W, H * 0.22);

      t++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ── NAV ──
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className="df-nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5rem',
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
      background: scrolled ? 'rgba(2,11,24,0.82)' : 'transparent',
      boxShadow: scrolled ? '0 1px 0 rgba(78,205,196,0.12)' : 'none',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
        <DermaFlowLogo size={34} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.2rem', color: C.text, letterSpacing: '-0.02em' }}>DermaFlow AI</span>
      </Link>

      <div className="df-nav-links" style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
        {['Features', 'About', 'Contact'].map(l => <NavLink key={l}>{l}</NavLink>)}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <NavBtn href="/login" outlined>Sign In</NavBtn>
        <NavBtn href="/signup">Get Started</NavBtn>
      </div>
    </nav>
  );
}

function NavLink({ children }: { children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <span onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: FONT_BODY, fontSize: '0.92rem', fontWeight: 500, color: hov ? C.teal : C.textMid, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.01em' }}>
      {children}
    </span>
  );
}

function NavBtn({ children, href, outlined }: { children: React.ReactNode; href: string; outlined?: boolean }) {
  const [hov, setHov] = useState(false);
  const baseStyle: React.CSSProperties = {
    fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.88rem',
    padding: '0.5rem 1.3rem', borderRadius: 50, cursor: 'pointer',
    textDecoration: 'none', display: 'inline-block',
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    transform: hov ? 'translateY(-2px)' : 'none',
  };
  if (outlined) return (
    <Link href={href} style={{ ...baseStyle, background: 'transparent', color: C.teal, border: `1.5px solid ${hov ? C.teal : 'rgba(78,205,196,0.4)'}`, boxShadow: hov ? `0 0 16px rgba(78,205,196,0.2)` : 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</Link>
  );
  return (
    <Link href={href} style={{ ...baseStyle, background: hov ? '#3bb5ac' : C.teal, color: C.bg, border: 'none', boxShadow: hov ? `0 8px 24px rgba(78,205,196,0.35)` : `0 4px 12px rgba(78,205,196,0.2)` }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</Link>
  );
}

// ── HERO BUTTONS ──
function HeroBtn({ children, href, primary }: { children: React.ReactNode; href: string; primary?: boolean }) {
  const [hov, setHov] = useState(false);
  const [press, setPress] = useState(false);
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        position: 'relative', overflow: 'hidden', textDecoration: 'none',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: '1.05rem',
        padding: '0.95rem 2.4rem', borderRadius: 50, cursor: 'pointer', display: 'inline-block',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        transform: press ? 'scale(0.96)' : hov ? 'translateY(-4px) scale(1.02)' : 'none',
        ...(primary ? {
          background: `linear-gradient(135deg, ${C.teal}, #2AB5AC)`,
          color: C.bg,
          boxShadow: hov ? `0 12px 32px rgba(78,205,196,0.45), 0 0 0 1px rgba(78,205,196,0.3)` : `0 6px 20px rgba(78,205,196,0.25)`,
          border: 'none',
        } : {
          background: 'rgba(255,255,255,0.06)',
          color: C.text,
          border: `1.5px solid rgba(255,255,255,${hov ? 0.22 : 0.1})`,
          boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(12px)',
        }),
      }}
    >
      {primary && (
        <span style={{
          position: 'absolute', top: 0, left: '-100%', right: 0, bottom: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%)',
          animation: 'df-shimmerSweep 3.5s ease-in-out infinite', borderRadius: 50,
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
  const [hov, setHov] = useState(false);
  return (
    <div
      className="df-glass-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '2rem 1.75rem',
        opacity: visible ? 1 : 0,
        transform: !visible ? 'translateY(36px)' : hov ? 'translateY(-6px)' : 'translateY(0)',
        transitionDelay: visible ? `${delay}ms` : '0ms',
        boxShadow: hov ? `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(78,205,196,0.18), 0 0 32px rgba(78,205,196,0.06)` : '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ marginBottom: '1.25rem', animation: `df-iconBob ${3.2 + index * 0.45}s ease-in-out ${index * 0.4}s infinite` }}>
        <Icon />
      </div>
      <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: C.text, margin: '0 0 0.6rem', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', color: C.textMid, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ── ONCO BUTTON ──
function OncoBtn({ children, href }: { children: React.ReactNode; href: string }) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={href}
      onMouseOver={() => setHov(true)}
      onMouseOut={() => setHov(false)}
      style={{
        fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.95rem',
        padding: '0.8rem 1.9rem', borderRadius: 50, cursor: 'pointer', textDecoration: 'none',
        display: 'inline-block',
        background: `linear-gradient(135deg, ${C.coral}, ${C.coralDim})`,
        color: '#fff',
        boxShadow: hov ? `0 12px 28px rgba(255,107,107,0.4)` : `0 6px 16px rgba(255,107,107,0.22)`,
        transform: hov ? 'translateY(-3px)' : 'none',
        transition: 'all 0.22s ease',
      }}
    >{children}</Link>
  );
}

// ── REFERRAL CARD ──
function ReferralCard() {
  return (
    <div className="df-card-float" style={{
      width: 300, borderRadius: 24,
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(78,205,196,0.2)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(78,205,196,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
      padding: '1.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.tealDim})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.2rem', color: C.bg, boxShadow: `0 4px 14px rgba(78,205,196,0.35)` }}>J</div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: C.text }}>Patient Referral Card</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: '0.63rem', color: C.textDim, letterSpacing: '0.07em' }}>ONCO-CONNECT #DF-2847</div>
        </div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(78,205,196,0.3), transparent)`, marginBottom: '1.1rem' }} />
      {[
        { label: 'Assessment', value: 'Benign Nevus' },
        { label: 'Confidence', value: '94.2%' },
        { label: 'Date', value: 'Apr 29, 2026' },
      ].map(f => (
        <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: C.textDim, fontWeight: 500 }}>{f.label}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.75rem', color: C.text, fontWeight: 700 }}>{f.value}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: C.textDim, fontWeight: 500 }}>Risk Level</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="df-pulse-glow" style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.75rem', color: C.teal, fontWeight: 700 }}>Low</span>
        </div>
      </div>
      <div style={{ borderRadius: 12, background: 'rgba(78,205,196,0.07)', padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(78,205,196,0.15)' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {[0,1,2,3,4,5,6].map(row => [0,1,2,3,4,5,6].map(col => (
            <rect key={`${row}-${col}`} x={col*5+2} y={row*5+2} width="4" height="4" rx="0.5"
              fill={((row+col)%3===0||(row===0&&col===0)||(row===0&&col===6)||(row===6&&col===0)) ? '#4ECDC4' : 'transparent'} opacity="0.85" />
          )))}
        </svg>
        <span style={{ fontFamily: FONT_BODY, fontSize: '0.68rem', color: C.textDim, lineHeight: 1.4 }}>Scan to verify<br />DermaFlow AI</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ══════════════════════════════════════════════════════
export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const oncoRef     = useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [oncoVisible,     setOncoVisible]     = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.target === featuresRef.current && e.isIntersecting) setFeaturesVisible(true);
        if (e.target === oncoRef.current     && e.isIntersecting) setOncoVisible(true);
      });
    }, { threshold: 0.1 });
    if (featuresRef.current) obs.observe(featuresRef.current);
    if (oncoRef.current)     obs.observe(oncoRef.current);
    return () => obs.disconnect();
  }, []);

  const features = [
    { Icon: AnalysisIcon,       title: 'Instant Skin Analysis',  desc: 'Upload a photo of any skin lesion and receive an instant AI-powered analysis with risk assessment scoring.',                           delay: 0   },
    { Icon: ExplainableAIIcon,  title: 'Explainable AI',         desc: "Understand the 'why' behind every analysis with Grad-CAM heatmap visualizations highlighting areas of concern.",                     delay: 100 },
    { Icon: PersonalizedCareIcon, title: 'Personalized Care',    desc: 'Get custom hygiene tips, dietary advice, and product recommendations tailored to your unique skin profile.',                          delay: 200 },
    { Icon: BioLLMIcon,         title: 'Ask a Bio-LLM',          desc: 'Chat with a medically-trained AI assistant. Get verified answers to your dermatology questions anytime.',                             delay: 300 },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      <Nav />

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: 72 }}>
        <RiverCanvas />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 820, padding: '0 2rem' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(78,205,196,0.08)',
            border: '1px solid rgba(78,205,196,0.22)',
            borderRadius: 50, padding: '0.4rem 1.1rem', marginBottom: '2.2rem',
            animation: 'df-badgePulse 3s ease-in-out infinite',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal, display: 'inline-block', boxShadow: `0 0 8px ${C.teal}` }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', color: C.teal }}>AI-POWERED SKIN HEALTH</span>
          </div>

          <h1 style={{ margin: 0, lineHeight: 1.04 }}>
            <span className="df-hero-word df-word-1" style={{
              display: 'block', fontFamily: FONT_DISPLAY, fontWeight: 800,
              fontSize: 'clamp(3rem, 7.5vw, 5.8rem)', color: C.text, letterSpacing: '-0.035em',
            }}>Your Skin.</span>
            <span className="df-hero-word df-word-2" style={{
              display: 'block', fontFamily: FONT_DISPLAY, fontWeight: 800,
              fontSize: 'clamp(3rem, 7.5vw, 5.8rem)', letterSpacing: '-0.035em',
              background: `linear-gradient(135deg, ${C.teal} 0%, #7EEEE8 55%, ${C.teal} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Understood.</span>
          </h1>

          <p style={{
            fontFamily: FONT_BODY, fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: C.textMid, maxWidth: 560, margin: '1.6rem auto 2.8rem', lineHeight: 1.75, fontWeight: 400,
          }}>
            AI-powered skin analysis, personalized care, and expert guidance — all in one place.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <HeroBtn primary href="/signup">Get Started →</HeroBtn>
            <HeroBtn href="/login">Returning User?</HeroBtn>
          </div>

          {/* Scroll hint */}
          <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', opacity: 0.45 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.65rem', letterSpacing: '0.15em', color: C.textDim }}>SCROLL</span>
            <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${C.teal}, transparent)` }} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} style={{ padding: '8rem 2rem', background: C.bg, position: 'relative' }}>
        {/* subtle top border glow */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, rgba(78,205,196,0.3), transparent)` }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', color: C.teal, marginBottom: '1rem' }}>CAPABILITIES</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: C.text, letterSpacing: '-0.025em', margin: '0 0 1rem' }}>
              What DermaFlow Can Do
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: '1.05rem', color: C.textMid, marginBottom: '1.75rem', maxWidth: 480, margin: '0 auto 1.75rem' }}>
              A full suite of AI-powered tools for your skin health journey.
            </p>
            <div className="df-glow-line" style={{ width: 72, height: 3, borderRadius: 3, background: `linear-gradient(90deg, ${C.teal}, #7EEEE8)`, margin: '0 auto', boxShadow: `0 0 12px rgba(78,205,196,0.5)` }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {features.map(({ Icon, title, desc, delay }, i) => (
              <FeatureCard key={title} Icon={Icon} title={title} desc={desc} delay={delay} visible={featuresVisible} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ONCO-CONNECT ── */}
      <section ref={oncoRef} style={{ background: 'linear-gradient(135deg, #041A2E 0%, #020B18 100%)', padding: '8rem 2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Dot grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05, pointerEvents: 'none' }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.5" fill="#4ECDC4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* Glow orb */}
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,205,196,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 340px', opacity: oncoVisible ? 1 : 0, transform: oncoVisible ? 'none' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'inline-block', fontFamily: FONT_MONO, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', color: C.teal, background: 'rgba(78,205,196,0.1)', border: `1px solid rgba(78,205,196,0.25)`, borderRadius: 50, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>ONCO-CONNECT</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: C.text, letterSpacing: '-0.025em', margin: '0 0 1.25rem' }}>
              Connecting You to Real Care
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: '1.05rem', color: C.textMid, lineHeight: 1.8, marginBottom: '2.2rem' }}>
              Our triage system helps you take the next step. Generate a digital referral card and find verified oncology centers near you — bridging the gap between digital assessment and professional medical consultation.
            </p>
            <OncoBtn href="/signup">Learn About Onco-Connect →</OncoBtn>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', opacity: oncoVisible ? 1 : 0, transform: oncoVisible ? 'none' : 'translateY(40px)', transition: 'all 0.8s 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
            <ReferralCard />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#020B18', padding: '3rem 2rem', borderTop: '1px solid rgba(78,205,196,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <DermaFlowLogo size={30} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.05rem', color: C.text }}>DermaFlow AI</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['Features', 'About', 'Privacy', 'Contact'].map(l => (
              <span key={l} style={{ fontFamily: FONT_BODY, fontSize: '0.88rem', color: C.textDim, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = C.teal)}
                onMouseOut={e  => (e.currentTarget.style.color = C.textDim)}>{l}</span>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: C.textDim, margin: 0 }}>For informational purposes only. Not a substitute for professional medical advice.</p>
            <p style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: C.textDim, margin: '0.25rem 0 0' }}>© 2026 DermaFlow AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
