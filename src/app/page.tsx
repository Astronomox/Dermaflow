'use client';

// src/app/page.tsx
// DermaFlow V4 — Monochrome / WebGL fluid water
// Hero: GLSL fragment-shader river (FBM flow noise), pure grayscale theme

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  DermaFlowLogo,
  AnalysisIcon,
  ExplainableAIIcon,
  PersonalizedCareIcon,
  BioLLMIcon,
} from '@/components/icons/dermaflow-icons';

// ── Monochrome tokens ──
const C = {
  bg:       '#FFFFFF',
  ink:      '#0A0A0A',
  inkMid:   'rgba(10,10,10,0.62)',
  inkDim:   'rgba(10,10,10,0.4)',
  inkFaint: 'rgba(10,10,10,0.12)',
  border:   'rgba(0,0,0,0.1)',
  card:     'rgba(0,0,0,0.025)',
} as const;

const FONT_DISPLAY = '"Montserrat", sans-serif';
const FONT_BODY    = '"Montserrat", sans-serif';
const FONT_MONO    = '"Montserrat", sans-serif';

// ══════════════════════════════════════════════════════
// WEBGL WATER — fragment shader fluid simulation
// ══════════════════════════════════════════════════════
const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y);
}

// 4 octaves (perf)
float fbmRiver(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= vec2(1.9, 2.3);
    a *= 0.5;
  }
  return v;
}

float ridge(vec2 p) {
  return 1.0 - abs(fbmRiver(p)) * 2.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p  = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime;

  vec2 rp = vec2(p.x * 1.0, p.y * 6.0);

  float channel = sin(uv.y * 3.14159);
  float speed   = 0.5 + 0.9 * channel;
  vec2 flow     = vec2(t * speed, 0.0);

  // single meander warp (perf)
  rp.y += fbmRiver(vec2(p.x * 0.7 - t * 0.18, p.y * 2.0)) * 2.0;

  // 3 wave layers (perf)
  float w1 = ridge(rp * vec2(1.2, 1.0) - flow * 1.0);
  float w2 = ridge(rp * vec2(2.3, 1.4) - flow * 1.55 + vec2(3.7, 8.1));
  float w3 = ridge(rp * vec2(4.5, 2.0) - flow * 2.4  + vec2(9.2, 1.7));

  float water = w1 * 0.48 + w2 * 0.32 + w3 * 0.20;

  float crest = smoothstep(0.6, 0.95, water);

  float dark = 0.0;
  dark += pow(max(water, 0.0), 1.35) * 0.72;
  dark += crest * 0.30;

  float edge = smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.78, uv.y);
  dark *= edge;
  dark *= 0.5 + 0.5 * channel;

  // ---- center deepening: darkest pool where the headline sits, so white text pops ----
  vec2 d = uv - vec2(0.5, 0.52);
  d.x *= uRes.x / uRes.y * 0.62;
  float pool = 1.0 - smoothstep(0.15, 0.6, length(d));
  dark = mix(dark, max(dark, 0.62) + crest * 0.15, pool);

  dark = clamp(dark, 0.0, 0.96);

  vec3 col = vec3(1.0 - dark);
  gl_FragColor = vec4(col, 1.0);
}
`;

function WaterGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
      || canvas.getContext('experimental-webgl');
    if (!gl) { setFailed(true); return; }
    const glc = gl as WebGLRenderingContext;

    // respect reduced motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function compile(type: number, src: string) {
      const sh = glc.createShader(type)!;
      glc.shaderSource(sh, src);
      glc.compileShader(sh);
      if (!glc.getShaderParameter(sh, glc.COMPILE_STATUS)) {
        console.error(glc.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    const vs = compile(glc.VERTEX_SHADER, VERT);
    const fs = compile(glc.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFailed(true); return; }

    const prog = glc.createProgram()!;
    glc.attachShader(prog, vs);
    glc.attachShader(prog, fs);
    glc.linkProgram(prog);
    if (!glc.getProgramParameter(prog, glc.LINK_STATUS)) { setFailed(true); return; }
    glc.useProgram(prog);

    // fullscreen quad
    const buf = glc.createBuffer();
    glc.bindBuffer(glc.ARRAY_BUFFER, buf);
    glc.bufferData(glc.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), glc.STATIC_DRAW);
    const aPos = glc.getAttribLocation(prog, 'aPos');
    glc.enableVertexAttribArray(aPos);
    glc.vertexAttribPointer(aPos, 2, glc.FLOAT, false, 0, 0);

    const uRes  = glc.getUniformLocation(prog, 'uRes');
    const uTime = glc.getUniformLocation(prog, 'uTime');

    let raf = 0;
    const RENDER_SCALE = 0.55; // render at ~half res, CSS upscales — huge perf win, water blur hides it
    const FRAME_MS = 1000 / 30; // cap at 30fps

    function resize() {
      if (!canvas) return;
      const w = Math.floor(canvas.clientWidth  * RENDER_SCALE);
      const h = Math.floor(canvas.clientHeight * RENDER_SCALE);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        glc.viewport(0, 0, w, h);
      }
    }

    const start = performance.now();
    let last = 0;
    let paused = false;

    function frame(now: number) {
      if (!reduced) raf = requestAnimationFrame(frame);
      if (paused) return;
      if (now - last < FRAME_MS) return; // 30fps throttle
      last = now;
      resize();
      const t = reduced ? 0 : (now - start) / 1000;
      glc.uniform2f(uRes, canvas!.width, canvas!.height);
      glc.uniform1f(uTime, t);
      glc.drawArrays(glc.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(frame);
    if (reduced) { resize(); glc.uniform2f(uRes, canvas.width, canvas.height); glc.uniform1f(uTime, 0); glc.drawArrays(glc.TRIANGLE_STRIP, 0, 4); }

    // pause when tab hidden or hero scrolled out of view
    const onVis = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(([e]) => { paused = !e.isIntersecting || document.hidden; }, { threshold: 0 });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, []);

  if (failed) {
    // graceful fallback: static gradient
    return <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 55%, #E8E8E8 0%, #FFFFFF 70%)' }} />;
  }

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, display: 'block', imageRendering: 'auto',
    }} />
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
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
      borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
        <DermaFlowLogo size={32} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.15rem', color: C.ink, letterSpacing: '-0.02em' }}>DermaFlow AI</span>
      </Link>

      <div className="df-nav-links" style={{ display: 'flex', gap: '2.4rem', alignItems: 'center' }}>
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
      style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', fontWeight: 500, color: hov ? C.ink : C.inkMid, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.01em' }}>
      {children}
    </span>
  );
}

function NavBtn({ children, href, outlined }: { children: React.ReactNode; href: string; outlined?: boolean }) {
  const [hov, setHov] = useState(false);
  const base: React.CSSProperties = {
    fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.85rem',
    padding: '0.5rem 1.3rem', borderRadius: 4, cursor: 'pointer',
    textDecoration: 'none', display: 'inline-block',
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    letterSpacing: '0.02em',
  };
  if (outlined) return (
    <Link href={href} style={{ ...base, background: 'transparent', color: C.ink, border: `1px solid ${hov ? 'rgba(0,0,0,0.45)' : C.border}` }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</Link>
  );
  return (
    <Link href={href} style={{ ...base, background: hov ? '#333333' : C.ink, color: '#FFFFFF', border: '1px solid transparent' }}
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
        textDecoration: 'none',
        fontFamily: FONT_BODY, fontWeight: 600, fontSize: '1rem',
        padding: '0.9rem 2.3rem', borderRadius: 4, cursor: 'pointer', display: 'inline-block',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        transform: press ? 'scale(0.97)' : hov ? 'translateY(-2px)' : 'none',
        letterSpacing: '0.01em',
        ...(primary ? {
          background: hov ? '#FFFFFF' : '#FAFAFA',
          color: '#0A0A0A',
          border: '1px solid transparent',
          boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.3)',
        } : {
          background: 'rgba(255,255,255,0.12)',
          color: '#FAFAFA',
          border: `1px solid ${hov ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'}`,
          backdropFilter: 'blur(12px)',
        }),
      }}
    >{children}</Link>
  );
}

// ── FEATURE CARD ──
function FeatureCard({ Icon, title, desc, delay, visible, index }: {
  Icon: React.ComponentType; title: string; desc: string; delay: number; visible: boolean; index: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '2rem 1.75rem',
        background: hov ? 'rgba(0,0,0,0.045)' : C.card,
        border: `1px solid ${hov ? 'rgba(0,0,0,0.25)' : C.border}`,
        borderRadius: 8,
        opacity: visible ? 1 : 0,
        transform: !visible ? 'translateY(32px)' : hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transitionDelay: visible ? `${delay}ms` : '0ms',
      }}
    >
      <div style={{ marginBottom: '1.4rem', opacity: hov ? 1 : 0.85, transition: 'opacity 0.3s' }}>
        <Icon />
      </div>
      <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.08rem', color: C.ink, margin: '0 0 0.6rem', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontFamily: FONT_BODY, fontSize: '0.88rem', color: C.inkMid, lineHeight: 1.7, margin: 0 }}>{desc}</p>
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
        fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.92rem',
        padding: '0.8rem 1.9rem', borderRadius: 4, cursor: 'pointer', textDecoration: 'none',
        display: 'inline-block',
        background: hov ? '#333333' : C.ink,
        color: '#FFFFFF',
        boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.22)' : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.22s ease',
        letterSpacing: '0.01em',
      }}
    >{children}</Link>
  );
}

// ── REFERRAL CARD ──
function ReferralCard() {
  return (
    <div className="df-card-float" style={{
      width: 300, borderRadius: 12,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      border: `1px solid rgba(0,0,0,0.12)`,
      boxShadow: '0 32px 80px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
      padding: '1.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.15rem', color: '#FFFFFF' }}>J</div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '0.92rem', color: C.ink }}>Patient Referral Card</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: '0.62rem', color: C.inkDim, letterSpacing: '0.07em' }}>ONCO-CONNECT #DF-2847</div>
        </div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)`, marginBottom: '1.1rem' }} />
      {[
        { label: 'Assessment', value: 'Benign Nevus' },
        { label: 'Confidence', value: '94.2%' },
        { label: 'Date', value: 'Apr 29, 2026' },
      ].map(f => (
        <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: C.inkDim, fontWeight: 500 }}>{f.label}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.74rem', color: C.ink, fontWeight: 700 }}>{f.value}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: C.inkDim, fontWeight: 500 }}>Risk Level</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div className="df-pulse-glow" style={{ width: 7, height: 7, borderRadius: '50%', background: C.ink }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: '0.74rem', color: C.ink, fontWeight: 700 }}>Low</span>
        </div>
      </div>
      <div style={{ borderRadius: 8, background: 'rgba(0,0,0,0.03)', padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${C.border}` }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {[0,1,2,3,4,5,6].map(row => [0,1,2,3,4,5,6].map(col => (
            <rect key={`${row}-${col}`} x={col*5+2} y={row*5+2} width="4" height="4" rx="0.5"
              fill={((row+col)%3===0||(row===0&&col===0)||(row===0&&col===6)||(row===6&&col===0)) ? '#0A0A0A' : 'transparent'} opacity="0.85" />
          )))}
        </svg>
        <span style={{ fontFamily: FONT_BODY, fontSize: '0.68rem', color: C.inkDim, lineHeight: 1.4 }}>Scan to verify<br />DermaFlow AI</span>
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
    { Icon: AnalysisIcon,         title: 'Instant Skin Analysis', desc: 'Upload a photo of any skin lesion and receive an instant AI-powered analysis with risk assessment scoring.',       delay: 0   },
    { Icon: ExplainableAIIcon,    title: 'Explainable AI',        desc: "Understand the 'why' behind every analysis with Grad-CAM heatmap visualizations highlighting areas of concern.", delay: 90  },
    { Icon: PersonalizedCareIcon, title: 'Personalized Care',     desc: 'Get custom hygiene tips, dietary advice, and product recommendations tailored to your unique skin profile.',      delay: 180 },
    { Icon: BioLLMIcon,           title: 'Ask a Bio-LLM',         desc: 'Chat with a medically-trained AI assistant. Get verified answers to your dermatology questions anytime.',         delay: 270 },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.ink }}>
      <Nav />

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: 72 }}>
        <WaterGL />

        {/* darkening overlay to keep text legible */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 60% 55% at 50% 52%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.15) 45%, transparent 75%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 840, padding: '0 2rem' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            borderRadius: 4, padding: '0.4rem 1rem', marginBottom: '2.4rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF', display: 'inline-block' }} className="df-pulse-glow" />
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)' }}>AI-POWERED SKIN HEALTH</span>
          </div>

          <h1 style={{ margin: 0, lineHeight: 1.02 }}>
            <span className="df-hero-word df-word-1" style={{
              display: 'block', fontFamily: FONT_DISPLAY, fontWeight: 800,
              fontSize: 'clamp(2.4rem, 6.5vw, 4.8rem)', color: '#FAFAFA', letterSpacing: '-0.04em',
              textShadow: '0 2px 24px rgba(0,0,0,0.45)',
            }}>Your Skin.</span>
            <span className="df-hero-word df-word-2" style={{
              display: 'block', fontFamily: FONT_DISPLAY, fontWeight: 800,
              fontSize: 'clamp(2.4rem, 6.5vw, 4.8rem)', letterSpacing: '-0.04em',
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.55) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.4))',
            }}>Understood.</span>
          </h1>

          <p style={{
            fontFamily: FONT_BODY, fontSize: 'clamp(1rem, 2.1vw, 1.15rem)',
            color: 'rgba(255,255,255,0.88)', maxWidth: 540, margin: '1.8rem auto 3rem', textShadow: '0 1px 12px rgba(0,0,0,0.5)', lineHeight: 1.75, fontWeight: 400,
          }}>
            AI-powered skin analysis, personalized care, and expert guidance — all in one place.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <HeroBtn primary href="/signup">Get Started →</HeroBtn>
            <HeroBtn href="/login">Returning User?</HeroBtn>
          </div>

          <div style={{ marginTop: '4.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)' }}>SCROLL</span>
            <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)' }} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} style={{ padding: '8rem 2rem', background: C.bg, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: `linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent)` }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: '0.66rem', fontWeight: 500, letterSpacing: '0.2em', color: C.inkDim, marginBottom: '1.1rem' }}>CAPABILITIES</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.9rem)', color: C.ink, letterSpacing: '-0.03em', margin: '0 0 1rem' }}>
              What DermaFlow Can Do
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: '1rem', color: C.inkMid, maxWidth: 460, margin: '0 auto' }}>
              A full suite of AI-powered tools for your skin health journey.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {features.map(({ Icon, title, desc, delay }, i) => (
              <FeatureCard key={title} Icon={Icon} title={title} desc={desc} delay={delay} visible={featuresVisible} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ONCO-CONNECT ── */}
      <section ref={oncoRef} style={{ background: '#F7F7F7', padding: '8rem 2rem', position: 'relative', overflow: 'hidden', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        {/* dot grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05, pointerEvents: 'none' }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.2" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 340px', opacity: oncoVisible ? 1 : 0, transform: oncoVisible ? 'none' : 'translateY(36px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'inline-block', fontFamily: FONT_MONO, fontSize: '0.64rem', fontWeight: 500, letterSpacing: '0.2em', color: C.inkMid, border: `1px solid ${C.border}`, borderRadius: 4, padding: '0.35rem 1rem', marginBottom: '1.6rem' }}>ONCO-CONNECT</div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.9rem)', color: C.ink, letterSpacing: '-0.03em', margin: '0 0 1.25rem' }}>
              Connecting You to Real Care
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: '1rem', color: C.inkMid, lineHeight: 1.8, marginBottom: '2.3rem' }}>
              Our triage system helps you take the next step. Generate a digital referral card and find verified oncology centers near you — bridging the gap between digital assessment and professional medical consultation.
            </p>
            <OncoBtn href="/signup">Learn About Onco-Connect →</OncoBtn>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', opacity: oncoVisible ? 1 : 0, transform: oncoVisible ? 'none' : 'translateY(36px)', transition: 'all 0.8s 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
            <ReferralCard />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.bg, padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <DermaFlowLogo size={28} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1rem', color: C.ink }}>DermaFlow AI</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['Features', 'About', 'Privacy', 'Contact'].map(l => (
              <span key={l} style={{ fontFamily: FONT_BODY, fontSize: '0.86rem', color: C.inkDim, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = C.ink)}
                onMouseOut={e  => (e.currentTarget.style.color = C.inkDim)}>{l}</span>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: '0.76rem', color: C.inkDim, margin: 0 }}>For informational purposes only. Not a substitute for professional medical advice.</p>
            <p style={{ fontFamily: FONT_BODY, fontSize: '0.76rem', color: C.inkDim, margin: '0.25rem 0 0' }}>© 2026 DermaFlow AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
