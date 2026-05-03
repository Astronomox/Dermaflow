'use client';

// src/app/login/page.tsx
// DermaFlow V2 — Login page with photo split layout

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function LoginPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

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

      {/* ── RIGHT: Photo panel ── */}
      <div className="df-login-decor" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background photo — hands touching healthy glowing skin */}
        <Image
          src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200"
          alt="Hands gently touching smooth healthy skin"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
          sizes="50vw"
        />

        {/* Warm tinted overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(135deg, rgba(244,168,154,0.4) 0%, rgba(232,115,90,0.5) 100%)',
        }} />

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.25) 100%)',
        }} />

        {/* Quote overlay */}
        <div style={{
          position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 3, textAlign: 'center', width: '80%',
        }}>
          <p style={{
            fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: '1.2rem',
            color: 'rgba(255,248,240,0.95)', margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            &ldquo;Early detection saves lives.&rdquo;
          </p>
        </div>

        {/* Top-right floating badge */}
        <div style={{
          position: 'absolute', top: '2rem', right: '2rem', zIndex: 3,
          background: 'rgba(255,248,240,0.15)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50,
          padding: '0.5rem 1rem',
        }}>
          <span style={{
            fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 600,
            color: 'rgba(255,248,240,0.9)', letterSpacing: '0.05em',
          }}>
            AI-Powered Skin Health
          </span>
        </div>
      </div>
    </div>
  );
}
