'use client';

// src/app/login/page.tsx
// DermaFlow V2 — Login page with claymorphism split layout
// Preserves existing Firebase auth (initiateEmailSignIn)

import { useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-context';
import { initiateEmailSignIn } from '@/firebase';
import { DermaFlowLogo } from '@/components/icons/dermaflow-icons';

const FONT_HEADLINE = '"Bricolage Grotesque", sans-serif';
const FONT_BODY = '"DM Sans", sans-serif';
const COLOR_DARK = '#2D1B0E';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

// ── Shared sub-components ──
function DecorCircle({ children, size, opacity }: { children: React.ReactNode; size: number; opacity: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `rgba(255,248,240,${opacity})`,
      boxShadow: '6px 6px 14px rgba(0,0,0,0.15), -3px -3px 10px rgba(255,255,255,0.2), inset 1px 1px 2px rgba(255,255,255,0.3)',
      border: '1px solid rgba(255,255,255,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</div>
  );
}

function FloatingEl({ children, top, bottom, left, right, parallax, scale, delay }: {
  children: React.ReactNode; top?: string; bottom?: string; left?: string; right?: string;
  parallax: { x: number; y: number }; scale: number; delay: string;
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
      animation: `df-iconBob ${3.5 + parseFloat(delay)}s ${delay} ease-in-out infinite`,
    }}>{children}</div>
  );
}

export function AuthButton({ label, coral }: { label: string; coral?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const bg = coral ? 'linear-gradient(145deg, #E8735A, #d4614a)' : 'linear-gradient(145deg, #2A7B7B, #1a5c5c)';
  const shadow = coral ? 'rgba(232,115,90,0.3)' : 'rgba(42,123,123,0.3)';
  return (
    <button type="submit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: '100%', padding: '0.9rem', borderRadius: 16, border: 'none', cursor: 'pointer',
        fontFamily: FONT_BODY, fontWeight: 700, fontSize: '1rem', color: '#FFF8F0',
        background: bg,
        boxShadow: hovered
          ? `10px 10px 22px ${shadow}, -5px -5px 14px rgba(255,255,255,0.6), inset 1px 1px 2px rgba(255,255,255,0.3)`
          : `8px 8px 16px rgba(0,0,0,0.09), -4px -4px 12px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.3)`,
        transform: pressed ? 'scale(0.97)' : hovered ? 'translateY(-3px) scale(1.01)' : 'none',
        transition: 'all 0.2s ease',
        animation: 'df-heartbeat 3s ease-in-out infinite',
      }}
    >{label}</button>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.02,
      y: (e.clientY - rect.top - rect.height / 2) * 0.02,
    });
  }, []);

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.85rem 1.1rem', borderRadius: 16,
    border: focused ? '1.5px solid rgba(232,115,90,0.5)' : '1.5px solid rgba(255,255,255,0.4)',
    outline: 'none', fontFamily: FONT_BODY, fontSize: '0.95rem', color: COLOR_DARK,
    background: 'linear-gradient(145deg, #ede4db, #f7efe6)',
    boxShadow: focused
      ? 'inset 3px 3px 6px rgba(0,0,0,0.07), inset -2px -2px 4px rgba(255,255,255,0.7), 0 0 0 3px rgba(232,115,90,0.2)'
      : 'inset 3px 3px 6px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.7)',
    transition: 'all 0.2s ease', boxSizing: 'border-box' as const,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      initiateEmailSignIn(
        values.email, values.password,
        () => {
          toast({ title: t('auth.login.toast.successTitle'), description: t('auth.login.toast.successDescription') });
          router.push('/dashboard');
        },
        (error: any) => {
          let errorMessage = t('auth.login.toast.errorDescription');
          if (error.code === 'auth/invalid-credential') errorMessage = 'Invalid email or password.';
          else if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email.';
          else if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
          else if (error.code === 'auth/too-many-requests') errorMessage = 'Too many failed attempts. Try again later.';
          toast({ variant: 'destructive', title: t('auth.login.toast.errorTitle'), description: errorMessage });
        }
      );
    });
  };

  return (
    <div className="df-login-grid" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* ── LEFT: Form ── */}
      <div style={{
        background: '#FFF8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem 3.5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blobs */}
        {[
          { size: 120, top: '10%', left: '-5%', opacity: 0.06 },
          { size: 80, top: '70%', left: '80%', opacity: 0.05 },
          { size: 60, top: '40%', left: '90%', opacity: 0.04 },
        ].map((f, i) => (
          <div key={i} style={{
            position: 'absolute', top: f.top, left: f.left,
            width: f.size, height: f.size,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
            background: 'radial-gradient(circle, #E8735A, #2A7B7B)',
            opacity: f.opacity,
            animation: `df-blob-morph ${10 + i * 2}s ease-in-out infinite`,
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem', cursor: 'pointer', textDecoration: 'none' }}>
            <DermaFlowLogo size={32} />
            <span style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: '1.2rem', color: COLOR_DARK }}>DermaFlow AI</span>
          </Link>

          <h1 style={{ fontFamily: FONT_HEADLINE, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: COLOR_DARK, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ fontFamily: FONT_BODY, fontSize: '1rem', color: 'rgba(45,27,14,0.55)', margin: '0 0 2rem' }}>Sign in to your skin health dashboard.</p>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', fontWeight: 600, color: 'rgba(45,27,14,0.65)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
              <input type="email" placeholder="you@example.com"
                {...form.register('email')}
                onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                style={inputStyle(emailFocused)} />
              {form.formState.errors.email && <p style={{ color: '#E8735A', fontSize: '0.8rem', marginTop: '0.25rem', fontFamily: FONT_BODY }}>{form.formState.errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', fontWeight: 600, color: 'rgba(45,27,14,0.65)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
              <input type="password" placeholder="••••••••"
                {...form.register('password')}
                onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
                style={inputStyle(passFocused)} />
              {form.formState.errors.password && <p style={{ color: '#E8735A', fontSize: '0.8rem', marginTop: '0.25rem', fontFamily: FONT_BODY }}>{form.formState.errors.password.message}</p>}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: '#E8735A', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
            </div>

            <button type="submit" disabled={isPending} style={{
              width: '100%', padding: '0.9rem', borderRadius: 16, border: 'none', cursor: isPending ? 'wait' : 'pointer',
              fontFamily: FONT_BODY, fontWeight: 700, fontSize: '1rem', color: '#FFF8F0',
              background: 'linear-gradient(145deg, #E8735A, #d4614a)',
              boxShadow: '8px 8px 16px rgba(0,0,0,0.09), -4px -4px 12px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.3)',
              transition: 'all 0.2s ease',
              animation: 'df-heartbeat 3s ease-in-out infinite',
              opacity: isPending ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              {isPending && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              Sign In
            </button>
          </form>

          <p style={{ fontFamily: FONT_BODY, fontSize: '0.9rem', color: 'rgba(45,27,14,0.55)', textAlign: 'center', marginTop: '1.5rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#2A7B7B', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Decorative coral ── */}
      <div className="df-login-decor"
        onMouseMove={handleMouseMove}
        style={{ background: 'linear-gradient(135deg, #F4A89A 0%, #E8735A 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.18) 100%)', zIndex: 2, pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <FloatingEl top="15%" left="20%" parallax={mousePos} scale={1.5} delay="0">
            <DecorCircle size={90} opacity={0.25}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="22" cy="22" r="14" stroke="rgba(255,248,240,0.9)" strokeWidth="3" fill="rgba(255,248,240,0.15)" />
                <line x1="32" y1="32" x2="42" y2="42" stroke="rgba(255,248,240,0.9)" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="16" y1="22" x2="28" y2="22" stroke="rgba(255,248,240,0.6)" strokeWidth="2" strokeLinecap="round" />
                <line x1="22" y1="16" x2="22" y2="28" stroke="rgba(255,248,240,0.6)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </DecorCircle>
          </FloatingEl>
          <FloatingEl bottom="25%" right="18%" parallax={mousePos} scale={1} delay="1">
            <DecorCircle size={70} opacity={0.2}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M12 4 C16 10 24 10 28 16 C24 22 16 22 12 28" stroke="rgba(255,248,240,0.9)" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M28 4 C24 10 16 10 12 16 C16 22 24 22 28 28" stroke="rgba(255,248,240,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </DecorCircle>
          </FloatingEl>
          <FloatingEl top="55%" left="10%" parallax={mousePos} scale={0.8} delay="0.5">
            <DecorCircle size={55} opacity={0.18}>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="10" stroke="rgba(255,248,240,0.8)" strokeWidth="2" fill="rgba(255,248,240,0.1)" />
                <circle cx="15" cy="15" r="4" fill="rgba(255,248,240,0.4)" />
              </svg>
            </DecorCircle>
          </FloatingEl>
          <FloatingEl top="10%" right="10%" parallax={mousePos} scale={1.2} delay="2">
            <DecorCircle size={50} opacity={0.15}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4 L24 14 L14 24 L4 14 Z" stroke="rgba(255,248,240,0.8)" strokeWidth="2" fill="rgba(255,248,240,0.1)" strokeLinejoin="round" />
              </svg>
            </DecorCircle>
          </FloatingEl>
        </div>

        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, textAlign: 'center', width: '80%' }}>
          <p style={{ fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(255,248,240,0.8)', margin: 0 }}>&ldquo;Early detection saves lives.&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
