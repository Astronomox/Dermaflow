"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Shield, Gauge, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ComposedChart, Line } from "recharts";
import { useTranslation } from "@/context/language-context";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getScanHistory, getScanStats, type ScanRecord } from "@/lib/scan-history";

const chartConfig = {
  confidence: {
    label: "Confidence %",
    color: "hsl(175, 45%, 55%)",
  },
  riskScore: {
    label: "Risk Score",
    color: "hsl(0, 84%, 60%)",
  },
};

function riskToScore(level: string): number {
  switch (level) {
    case 'critical': return 90;
    case 'high': return 70;
    case 'moderate': return 45;
    case 'low': return 15;
    default: return 0;
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

export default function DigitalTwinPage() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [stats, setStats] = useState({ totalScans: 0, avgConfidence: 0, avgRiskLevel: 'N/A', lastScanDate: null as Date | null });

  useEffect(() => {
    let isMounted = true;
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (isMounted) {
        setCurrentUser(user);
        if (user) {
          try {
            const [history, scanStats] = await Promise.all([
              getScanHistory(50),
              getScanStats(),
            ]);
            if (isMounted) {
              setScans(history);
              setStats(scanStats);
            }
          } catch (err) {
            console.warn('[DERMAFLOW] Failed to load digital twin data:', err);
          }
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; unsubscribe(); };
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

  // Build chart data from real scans (reversed so oldest first)
  const chartData = [...scans].reverse().map((scan) => ({
    date: scan.createdAt instanceof Date ? formatDate(scan.createdAt) : 'Unknown',
    confidence: scan.confidence,
    riskScore: riskToScore(scan.riskLevel),
    assessment: scan.refinedAssessment || scan.assessment,
  }));

  // If no scans, show placeholder data
  const hasData = chartData.length > 0;
  const displayChartData = hasData ? chartData : [
    { date: 'No data', confidence: 0, riskScore: 0, assessment: 'Run your first scan' },
  ];

  // Health metrics derived from real data
  const healthMetrics = [
    {
      icon: <Gauge className="size-5" />,
      label: "Average Confidence",
      value: stats.avgConfidence > 0 ? `${stats.avgConfidence}%` : "N/A",
      status: stats.avgConfidence >= 80 ? 'healthy' : stats.avgConfidence >= 60 ? 'warning' : 'unknown',
      description: stats.avgConfidence >= 80 ? "High analysis accuracy" : stats.avgConfidence > 0 ? "Moderate accuracy" : "No scans yet",
      color: stats.avgConfidence >= 80 ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      icon: <Shield className="size-5" />,
      label: "Overall Risk Level",
      value: stats.avgRiskLevel,
      status: stats.avgRiskLevel === 'Low' ? 'healthy' : stats.avgRiskLevel === 'N/A' ? 'unknown' : 'warning',
      description: stats.avgRiskLevel === 'Low' ? "Low risk — keep monitoring" : stats.avgRiskLevel === 'N/A' ? "Run scans to assess" : "Consider professional consultation",
      color: stats.avgRiskLevel === 'Low' ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      icon: <TrendingUp className="size-5" />,
      label: "Total Scans",
      value: String(stats.totalScans),
      status: stats.totalScans > 0 ? 'healthy' : 'unknown',
      description: stats.totalScans > 0 ? `${stats.totalScans} analyses performed` : "Start scanning",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('digitalTwin.pageHeader.title')}
        subtitle={t('digitalTwin.pageHeader.subtitle')}
      />

      {/* User Profile */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <h2 className="text-2xl font-bold">{userName}&apos;s Digital Twin</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
                <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                    {stats.totalScans > 0 ? '✓ Active Monitoring' : '○ No Scans Yet'}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t('digitalTwin.userCard.scans') || 'Total Scans'}</p>
                <p className="text-3xl font-bold mt-2">{stats.totalScans}</p>
                <p className="text-xs text-muted-foreground mt-1">Since enrollment</p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg. Confidence</p>
                <p className="text-3xl font-bold mt-2">{stats.avgConfidence > 0 ? `${stats.avgConfidence}%` : 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">AI accuracy</p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg. Risk</p>
                <p className={`text-3xl font-bold mt-2 ${stats.avgRiskLevel === 'Low' ? 'text-green-600' : stats.avgRiskLevel === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{stats.avgRiskLevel}</p>
                <p className="text-xs text-muted-foreground mt-1">Overall health</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Metrics sidebar */}
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
                    ) : metric.status === 'warning' ? (
                      <AlertCircle className="size-5 text-amber-500" />
                    ) : (
                      <div className="size-5" />
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

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Scan History &amp; Confidence Tracking
              </CardTitle>
              <CardDescription>
                {hasData
                  ? `${chartData.length} scan${chartData.length > 1 ? 's' : ''} tracked`
                  : 'Run your first skin analysis to start tracking'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <ChartContainer config={chartConfig} className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={displayChartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <defs>
                        <linearGradient id="fillConfidence" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(175, 45%, 55%)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(175, 45%, 55%)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="confidence" fill="url(#fillConfidence)" stroke="hsl(175, 45%, 55%)" name="Confidence %" />
                      <Line type="monotone" dataKey="riskScore" stroke="hsl(0, 84%, 60%)" name="Risk Score" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-center">
                  <div className="space-y-3">
                    <AlertCircle className="size-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No scan data yet</p>
                    <p className="text-sm text-muted-foreground">Perform a skin analysis to see your health trends here.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans Table */}
          {scans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5 text-primary" />
                  Recent Scan Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scans.slice(0, 8).map((scan, idx) => (
                    <div key={scan.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{scan.refinedAssessment || scan.assessment}</p>
                        <p className="text-xs text-muted-foreground">
                          {scan.createdAt instanceof Date ? formatDate(scan.createdAt) : 'Unknown date'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold">{scan.confidence}%</span>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          scan.riskLevel === 'low' ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : scan.riskLevel === 'moderate' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}>
                          {scan.riskLevel.charAt(0).toUpperCase() + scan.riskLevel.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Last Scan</p>
              <p className="text-lg font-semibold mt-1">
                {stats.lastScanDate ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(stats.lastScanDate) : 'No scans yet'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Recommendation</p>
              <p className="text-lg font-semibold mt-1">
                {stats.totalScans === 0 ? 'Run your first scan' : stats.avgRiskLevel === 'Low' ? 'Continue monitoring' : 'Consult a professional'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Data Points</p>
              <p className="text-lg font-semibold mt-1">{stats.totalScans} scan{stats.totalScans !== 1 ? 's' : ''} recorded</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
