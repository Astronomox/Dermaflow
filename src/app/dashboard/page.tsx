// 📁 app/dashboard/page.tsx
// ✅ PRODUCTION UI: Professional organization & visual hierarchy

'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Microscope,
  MessageSquareQuote,
  ThermometerSun,
  Stethoscope,
  Network,
  Orbit,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/context/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const primaryFeatures = [
  {
    titleKey: 'newSkinAnalysis',
    descriptionKey: 'newSkinAnalysisDesc',
    href: '/dashboard/analysis',
    icon: <Microscope className="size-5" />,
    badge: 'New',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200/50 dark:border-blue-900/50',
  },
  {
    titleKey: 'askBioLLM',
    descriptionKey: 'askBioLLMDesc',
    href: '/dashboard/ask-ai',
    icon: <MessageSquareQuote className="size-5" />,
    badge: 'AI',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200/50 dark:border-purple-900/50',
  },
];

const secondaryFeatures = [
  {
    titleKey: 'uvEnvironment',
    descriptionKey: 'uvEnvironmentDesc',
    href: '/dashboard/uv-risk',
    icon: <ThermometerSun className="size-5" />,
  },
  {
    titleKey: 'teleDermHub',
    descriptionKey: 'teleDermHubDesc',
    href: '/dashboard/tele-derm',
    icon: <Stethoscope className="size-5" />,
  },
  {
    titleKey: 'geneticRiskAnalyzer',
    descriptionKey: 'geneticRiskAnalyzerDesc',
    href: '/dashboard/genetic-risk',
    icon: <Network className="size-5" />,
  },
  {
    titleKey: 'dermatologyDigitalTwin',
    descriptionKey: 'dermatologyDigitalTwinDesc',
    href: '/dashboard/digital-twin',
    icon: <Orbit className="size-5" />,
  },
];

const statsData = [
  {
    label: 'Total Analyses',
    value: '3',
    subtext: 'This month',
    icon: <TrendingUp className="size-4" />,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Avg. Risk Level',
    value: 'Low',
    subtext: 'Healthy range',
    icon: <CheckCircle className="size-4" />,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    label: 'Confidence Score',
    value: '92.5%',
    subtext: 'Very high accuracy',
    icon: <Zap className="size-4" />,
    color: 'text-amber-600 dark:text-amber-400',
  },
];

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dashboardHero = PlaceHolderImages.find((p) => p.id === 'dashboard-hero');
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const userAvatar =
    currentUser?.photoURL ||
    PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl;

  const userName = currentUser?.displayName || 'User';
  const userEmail = currentUser?.email || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section with User Profile */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground text-base">
            Here's your skin health overview for today
          </p>
        </div>

        {/* User Card - Top Right */}
        <div className="hidden lg:flex items-center gap-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 min-w-80">
          <Avatar className="size-14 border-2 border-primary/20">
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={`${userName} avatar`} />
            ) : (
              <AvatarFallback className="text-lg font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <p className="font-semibold text-sm">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
            <div className="flex gap-2 pt-2">
              <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">
                ✓ Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsData.map((stat, idx) => (
          <Card key={idx} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg bg-secondary`}>
                  {stat.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none"></div>
          </Card>
        ))}
      </div>

      {/* Hero Banner */}
      <Card className="relative overflow-hidden border-0 shadow-lg">
        {dashboardHero && (
          <Image
            src={dashboardHero.imageUrl}
            alt={dashboardHero.description}
            fill
            className="object-cover brightness-50"
            data-ai-hint={dashboardHero.imageHint}
          />
        )}
        <div className="relative z-10 p-8 md:p-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold">
              FEATURED
            </div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              {t('advancedAiAnalysis')}
            </h2>
            <p className="text-lg text-white/90 drop-shadow">
              {t('advancedAiAnalysisDesc')}
            </p>
            <Button asChild size="lg" className="mt-4 gap-2 bg-primary hover:bg-primary/90">
              <Link href="/dashboard/analysis">
                {t('performNewAnalysis')}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Primary Features - High Priority */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Start with these powerful tools</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primaryFeatures.map((feature) => (
            <Link key={feature.titleKey} href={feature.href}>
              <Card className={`h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-2 ${feature.borderColor}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10`}>
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${feature.color} bg-opacity-10`}>
                        {feature.badge}
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-4">{t(feature.titleKey)}</CardTitle>
                  <CardDescription>{t(feature.descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2">
                    Start now <ArrowRight className="size-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Secondary Features - Lower Priority */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Explore More</h3>
          <p className="text-sm text-muted-foreground">Advanced analysis & insights</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {secondaryFeatures.map((feature) => (
            <Link key={feature.titleKey} href={feature.href}>
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-base">{t(feature.titleKey)}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {t(feature.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Help Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            New to Dermaflow? Start with a{' '}
            <Link href="/dashboard/analysis" className="text-primary font-semibold hover:underline">
              skin analysis
            </Link>
            {' '}to get personalized insights about your skin health.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}