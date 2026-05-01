'use client';

// src/app/signup/page.tsx
// DermaFlow V2 — Signup page with claymorphism mirrored split layout
// Preserves existing Firebase auth (initiateEmailSignUp)

import { useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignUp } from '@/firebase';
import { DermaFlowLogo } from '@/components/icons/dermaflow-icons';

const FONT_HEADLINE = '"Bricolage Grotesque", sans-serif';
const FONT_BODY = '"DM Sans", sans-serif';
const COLOR_DARK = '#2D1B0E';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be less than 20 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

// ── Sub-components ──
function DecorCircleTeal({ children, size, opacity }: { children: React.ReactNode; size: number; opacity: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `rgba(255,248,240,${opacity})`,
      boxShadow: '5px 5px 12px rgba(0,0,0,0.15), -2px -2px 8px rgba(255,255,255,0.15), inset 1px 1px 2px rgba(255,255,255,0.25)',
      border: '1px solid rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</div>
  );
}

function TealFloatingEl({ children, top, bottom, left, right, parallax, scale, duration, delay }: {
  children: React.ReactNode; top?: string; bottom?: string; left?: string; right?: string;
  parallax: { x: number; y: number }; scale: number; duration: string; delay: string;
}) {
  const posStyle: React.CSSProperties = {};
  if (top) posStyle.top = top;
  if (bottom) posStyle.bottom = bottom;
  if (left) posStyle.left = left;
  if (right) posStyle.right = right;
  return (
    <div style={{
      position: 'absolute', ...posStyle,
      transform: `translate(${-parallax.x * scale}px, ${-parallax.y * scale}px)`,
      transition: 'transform 0.12s ease',
      animation: `df-iconBob ${duration} ${delay} ease-in-out infinite`,
    }}>{children}</div>
  );
}

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [focused, setFocused] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.02,
      y: (e.clientY - rect.top - rect.height / 2) * 0.02,
    });
  }, []);

  const inputStyle = (id: string): React.CSSProperties => ({
    width: '100%', padding: '0.85rem 1.1rem', borderRadius: 16,
    border: focused === id ? '1.5px solid rgba(42,123,123,0.5)' : '1.5px solid rgba(255,255,255,0.4)',
    outline: 'none', fontFamily: FONT_BODY, fontSize: '0.95rem', color: COLOR_DARK,
    background: 'linear-gradient(145deg, #ede4db, #f7efe6)',
    boxShadow: focused === id
      ? 'inset 3px 3px 6px rgba(0,0,0,0.07), inset -2px -2px 4px rgba(255,255,255,0.7), 0 0 0 3px rgba(42,123,123,0.18)'
      : 'inset 3px 3px 6px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.7)',
    transition: 'all 0.2s ease', boxSizing: 'border-box' as const,
  });

  const formFields = [
    { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { id: 'username', label: 'Username', type: 'text', placeholder: 'your_handle' },
    { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ] as const;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      initiateEmailSignUp(
        values.email, values.password, values.username,
        () => {
          toast({ title: 'Account created!', description: 'Welcome to DermaFlow AI. Redirecting...' });
          router.push('/dashboard');
        },
        (error: any) => {
          let errorMessage = 'Failed to create account. Please try again.';
          if (error.code === 'auth/email-already-in-use') errorMessage = 'This email is already registered.';
          else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email format.';
          else if (error.code === 'auth/weak-password') errorMessage = 'Password is too weak.';
          else if (error.code === 'auth/too-many-requests') errorMessage = 'Too many attempts. Try again later.';
          toast({ variant: 'destructive', title: 'Signup Failed', description: errorMessage });
        }
      );
    });
  };

  return (
    <div className="df-login-grid" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* ── LEFT: Decorative teal ── */}
      <div className="df-login-decor"
        onMouseMove={handleMouseMove}
        style={{ background: 'linear-gradient(135deg, #2A7B7B 0%, #1a5c5c 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.18) 100%)', zIndex: 2, pointerEvents: 'none' }} />

        {/* Abstract face silhouette */}
        <svg viewBox="0 0 200 280" style={{ position: 'absolute', width: '55%', opacity: 0.07, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
          <ellipse cx="100" cy="120" rx="70" ry="90" stroke="#FFF8F0" strokeWidth="2" fill="none" />
          {[0,1,2,3,4,5,6,7,8].map(i => <line key={`h${i}`} x1="30" y1={50+i*20} x2="170" y2={50+i*20} stroke="#FFF8F0" strokeWidth="0.7" />)}
          {[0,1,2,3,4,5,6,7].map(i => <line key={`v${i}`} x1={30+i*20} y1="30" x2={30+i*20} y2="210" stroke="#FFF8F0" strokeWidth="0.7" />)}
          <ellipse cx="78" cy="105" rx="12" ry="7" stroke="#FFF8F0" strokeWidth="1.5" fill="none" />
          <ellipse cx="122" cy="105" rx="12" ry="7" stroke="#FFF8F0" strokeWidth="1.5" fill="none" />
          <path d="M100 115 C96 125 88 132 94 135 C100 138 106 135 112 132 C118 129 104 125 100 115Z" stroke="#FFF8F0" strokeWidth="1.5" fill="none" />
          <path d="M84 155 C92 162 108 162 116 155" stroke="#FFF8F0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>

        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <TealFloatingEl top="12%" right="15%" parallax={mousePos} scale={1.5} duration="4s" delay="0s">
            <DecorCircleTeal size={80} opacity={0.2}>
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                <circle cx="21" cy="21" r="14" stroke="rgba(255,248,240,0.85)" strokeWidth="2" fill="rgba(255,248,240,0.1)" />
                <circle cx="21" cy="21" r="6" stroke="rgba(255,248,240,0.5)" strokeWidth="1.5" fill="rgba(255,248,240,0.15)" />
                <circle cx="21" cy="21" r="2" fill="rgba(255,248,240,0.6)" />
              </svg>
            </DecorCircleTeal>
          </TealFloatingEl>
          <TealFloatingEl bottom="20%" left="12%" parallax={mousePos} scale={1} duration="5.5s" delay="0.8s">
            <DecorCircleTeal size={65} opacity={0.18}>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M10 4 C14 9 22 9 26 15 C22 21 14 21 10 27" stroke="rgba(255,248,240,0.85)" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M26 4 C22 9 14 9 10 15 C14 21 22 21 26 27" stroke="rgba(168,230,207,0.8)" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </DecorCircleTeal>
          </TealFloatingEl>
          <TealFloatingEl top="50%" right="8%" parallax={mousePos} scale={0.8} duration="3.5s" delay="1.2s">
            <DecorCircleTeal size={52} opacity={0.15}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" stroke="rgba(255,248,240,0.8)" strokeWidth="1.5" fill="rgba(255,248,240,0.08)" />
                <circle cx="14" cy="14" r="3" fill="rgba(255,248,240,0.4)" />
              </svg>
            </DecorCircleTeal>
          </TealFloatingEl>
        </div>

        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, textAlign: 'center', width: '80%' }}>
          <p style={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: '1rem', color: 'rgba(255,248,240,0.78)', margin: 0 }}>
            &ldquo;Your skin tells a story. Let AI help you understand it.&rdquo;
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div style={{ background: '#FFF8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3.5rem 3.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        {[
          { size: 100, top: '5%', left: '-8%', opacity: 0.05 },
          { size: 70, top: '75%', left: '85%', opacity: 0.04 },
        ].map((f, i) => (
          <div key={i} style={{
            position: 'absolute', top: f.top, left: f.left,
            width: f.size, height: f.size,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
            background: 'radial-gradient(circle, #2A7B7B, #E8735A)',
            opacity: f.opacity,
            animation: `df-blob-morph ${12 + i * 2}s ease-in-out infinite`,
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', cursor: 'pointer', textDecoration: 'none' }}>
            <DermaFlowLogo size={30} />
            <span style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: '1.1rem', color: COLOR_DARK }}>DermaFlow AI</span>
          </Link>

          <h1 style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: COLOR_DARK, margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>Join DermaFlow</h1>
          <p style={{ fontFamily: FONT_BODY, fontSize: '0.95rem', color: 'rgba(45,27,14,0.55)', margin: '0 0 1.75rem' }}>Create your free account today.</p>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {formFields.map(f => (
                <div key={f.id}>
                  <label style={{ fontFamily: FONT_BODY, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(45,27,14,0.65)', display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    {...form.register(f.id)}
                    onFocus={() => setFocused(f.id)}
                    onBlur={() => setFocused('')}
                    style={inputStyle(f.id)} />
                  {form.formState.errors[f.id] && (
                    <p style={{ color: '#E8735A', fontSize: '0.8rem', marginTop: '0.25rem', fontFamily: FONT_BODY }}>
                      {form.formState.errors[f.id]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" disabled={isPending} style={{
              width: '100%', padding: '0.9rem', borderRadius: 16, border: 'none', cursor: isPending ? 'wait' : 'pointer',
              fontFamily: FONT_BODY, fontWeight: 700, fontSize: '1rem', color: '#FFF8F0',
              background: 'linear-gradient(145deg, #2A7B7B, #1a5c5c)',
              boxShadow: '8px 8px 16px rgba(0,0,0,0.09), -4px -4px 12px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.3)',
              transition: 'all 0.2s ease',
              animation: 'df-heartbeat 3s ease-in-out infinite',
              opacity: isPending ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              {isPending && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              Create Account
            </button>
          </form>

          <p style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', color: 'rgba(45,27,14,0.55)', textAlign: 'center', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#E8735A', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
