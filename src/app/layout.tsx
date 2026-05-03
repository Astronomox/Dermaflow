import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'DermaFlow AI — Your Skin, Understood',
  description: 'AI-powered skin analysis, personalized care recommendations, and expert guidance. Upload a photo, get instant results with explainable AI heatmaps, and connect with verified oncology centers when it matters.',
  metadataBase: new URL('https://dermaflow-zeta.vercel.app'),
  openGraph: {
    title: 'DermaFlow AI — Your Skin, Understood',
    description: 'AI-powered skin analysis, personalized care, and expert guidance. Instant results with explainable heatmaps.',
    url: 'https://dermaflow-zeta.vercel.app',
    siteName: 'DermaFlow AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DermaFlow AI — Your Skin, Understood',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DermaFlow AI — Your Skin, Understood',
    description: 'AI-powered skin analysis, personalized care, and expert guidance. Instant results with explainable heatmaps.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

const fontBody = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn('font-body antialiased', fontBody.variable)}>
        <FirebaseClientProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
