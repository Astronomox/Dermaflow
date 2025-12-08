"use client";

import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar, Shield, Gauge, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ComposedChart, Bar, Line } from "recharts";
import { useTranslation } from "@/context/language-context";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ✅ REALISTIC SKIN HEALTH DATA (Monthly progression)
const generateRealisticChartData = () => [
  { month: "Jan", uvExposure: 35, skinDamage: 12, collagenLoss: 8, hydration: 78 },
  { month: "Feb", uvExposure: 38, skinDamage: 15, collagenLoss: 10, hydration: 75 },
  { month: "Mar", uvExposure: 52, skinDamage: 22, collagenLoss: 14, hydration: 72 },
  { month: "Apr", uvExposure: 68, skinDamage: 31, collagenLoss: 19, hydration: 68 },
  { month: "May", uvExposure: 82, skinDamage: 42, collagenLoss: 26, hydration: 65 },
  { month: "Jun", uvExposure: 95, skinDamage: 54, collagenLoss: 35, hydration: 60 },
];

const chartConfig = {
  uvExposure: {
    label: "UV Exposure",
    color: "hsl(0, 84%, 60%)",
  },
  skinDamage: {
    label: "Skin Damage Index",
    color: "hsl(0, 100%, 50%)",
  },
  collagenLoss: {
    label: "Collagen Loss %",
    color: "hsl(250, 100%, 50%)",
  },
  hydration: {
    label: "Skin Hydration %",
    color: "hsl(120, 73%, 50%)",
  },
};

// ✅ HEALTH METRICS DATA
const healthMetrics = [
  {
    icon: <Gauge className="size-5" />,
    label: "UV Exposure Score",
    value: "7.8/10",
    status: "warning",
    description: "Moderate exposure detected",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: <Shield className="size-5" />,
    label: "Skin Barrier Health",
    value: "84%",
    status: "healthy",
    description: "Strong protective barrier",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    icon: <TrendingUp className="size-5" />,
    label: "Aging Prediction",
    value: "Normal",
    status: "healthy",
    description: "Age-appropriate skin aging",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
];

export default function DigitalTwinPage() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar');
  const chartData = generateRealisticChartData();

  // ✅ GET CURRENT USER
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your digital twin...</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.displayName || 'User';
  const userEmail = currentUser?.email || '';

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('digitalTwin.pageHeader.title')}
        subtitle={t('digitalTwin.pageHeader.subtitle')}
      />

      {/* ✅ HERO SECTION - User Profile with Digital Twin */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="size-20 border-4 border-primary/20">
                {currentUser?.photoURL ? (
                  <AvatarImage src={currentUser.photoURL} alt={userName} />
                ) : (
                  <AvatarFallback className="text-2xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{userName}'s Digital Twin</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
                <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                    ✓ Active Monitoring
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                    6-Month Scan
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t('digitalTwin.userCard.scans') || 'Total Scans'}</p>
                <p className="text-3xl font-bold mt-2">28</p>
                <p className="text-xs text-muted-foreground mt-1">Since enrollment</p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t('digitalTwin.userCard.lesionsTracked') || 'Lesions Tracked'}</p>
                <p className="text-3xl font-bold mt-2">3</p>
                <p className="text-xs text-muted-foreground mt-1">Being monitored</p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg. Risk</p>
                <p className="text-3xl font-bold mt-2 text-amber-600">Low</p>
                <p className="text-xs text-muted-foreground mt-1">Overall health</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT SIDEBAR - METRICS */}
        <div className="lg:col-span-1 space-y-6">
          {healthMetrics.map((metric, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg ${metric.color}`}>
                      {metric.icon}
                    </div>
                    {metric.status === 'healthy' ? (
                      <CheckCircle className="size-5 text-green-500" />
                    ) : (
                      <AlertCircle className="size-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RIGHT CONTENT - CHARTS & PREDICTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ SKIN EVOLUTION CHART */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Skin Health Evolution
              </CardTitle>
              <CardDescription>6-month progression tracking with predictive analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <defs>
                      <linearGradient id="fillDamage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 100%, 50%)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(0, 100%, 50%)" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillHydration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(120, 73%, 50%)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(120, 73%, 50%)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="skinDamage"
                      fill="url(#fillDamage)"
                      stroke="hsl(0, 100%, 50%)"
                      name="Skin Damage"
                    />
                    <Line
                      type="monotone"
                      dataKey="hydration"
                      stroke="hsl(120, 73%, 50%)"
                      name="Hydration"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* ✅ LESION COMPARISON & PREDICTION */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-primary" />
                Lesion Evolution Analysis
              </CardTitle>
              <CardDescription>12-month prediction based on current trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Timeline comparison */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Initial Scan', month: 'Month 1', image: 'lesion1', status: 'baseline' },
                    { label: 'Current Status', month: 'Month 6', image: 'lesion1', status: 'current' },
                    { label: 'Predicted', month: 'Month 12', image: 'lesion2', status: 'predicted' },
                  ].map((item) => (
                    <div key={item.month} className="text-center space-y-2">
                      <div className="relative">
                        <Image
                          src={`https://picsum.photos/seed/${item.image}/150/150`}
                          alt={item.label}
                          width={150}
                          height={150}
                          className={cn(
                            "rounded-lg object-cover border-2 w-full aspect-square",
                            item.status === 'predicted' && 'opacity-60'
                          )}
                        />
                        {item.status === 'current' && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle className="size-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.month}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analysis */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Growth Rate</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+2.3%</p>
                    <p className="text-xs text-muted-foreground mt-1">Per month</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Risk Level</p>
                    <p className="text-2xl font-bold text-amber-600">Low</p>
                    <p className="text-xs text-muted-foreground mt-1">Stable trend</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 space-y-2">
                  <p className="font-semibold text-green-900 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle className="size-4" />
                    Recommendation
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Continue current SPF 50+ sunscreen routine. Schedule next scan in 3 months. Monitor for any changes in size, shape, or color.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ✅ FOOTER INFO */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Last Scan</p>
              <p className="text-lg font-semibold mt-1">June 15, 2025</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Next Scheduled</p>
              <p className="text-lg font-semibold mt-1">September 15, 2025</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Data Points Collected</p>
              <p className="text-lg font-semibold mt-1">2,847 measurements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ HELPER FUNCTION
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}