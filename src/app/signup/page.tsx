'use client';

// src/app/signup/page.tsx
// DermaFlow V2 — Signup page with photo split layout (mirrored)

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [focused, setFocused] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

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
      {/* ── LEFT: Photo panel ── */}
      <div className="df-login-decor" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background photo — skincare routine, healthy radiant skin */}
        <Image
          src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200"
          alt="Beautiful healthy skin care routine"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
          sizes="50vw"
        />

        {/* Teal tinted overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(135deg, rgba(42,123,123,0.45) 0%, rgba(26,92,92,0.55) 100%)',
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
            fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: '1.15rem',
            color: 'rgba(255,248,240,0.95)', margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            &ldquo;Your skin tells a story. Let AI help you understand it.&rdquo;
          </p>
        </div>

        {/* Top-left floating badge */}
        <div style={{
          position: 'absolute', top: '2rem', left: '2rem', zIndex: 3,
          background: 'rgba(255,248,240,0.15)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50,
          padding: '0.5rem 1rem',
        }}>
          <span style={{
            fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 600,
            color: 'rgba(255,248,240,0.9)', letterSpacing: '0.05em',
          }}>
            Join 1000+ Users
          </span>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div style={{
        background: '#FFF8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3.5rem 3.5rem', position: 'relative', overflow: 'hidden',
      }}>
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
