"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Wind, Droplets, Sun, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useTranslation } from "@/context/language-context";

type RiskData = {
  location: string;
  uvIndex: number;
  uvLevel: string;
  recommendation: string;
  airPollution: string;
  heatExposure: string;
  humidity: string;
  melanomaRisk: "high" | "moderate" | "low";
  safeExposureTime: string;
};

const mockRiskData: { [key: string]: RiskData } = {
  "lagos": {
    location: "Lagos, Nigeria",
    uvIndex: 11,
    uvLevel: "Extreme",
    recommendation: "Avoid outdoor exposure. Wear SPF 50+ with protective clothing.",
    airPollution: "Moderate",
    heatExposure: "32°C",
    humidity: "85%",
    melanomaRisk: "high",
    safeExposureTime: "5-10 minutes",
  },
  "kabul": {
    location: "Kabul, Afghanistan",
    uvIndex: 8,
    uvLevel: "Very High",
    recommendation: "Limit sun exposure. Apply SPF 50+ every 2 hours.",
    airPollution: "Good",
    heatExposure: "25°C",
    humidity: "40%",
    melanomaRisk: "moderate",
    safeExposureTime: "15-20 minutes",
  },
  "nairobi": {
    location: "Nairobi, Kenya",
    uvIndex: 10,
    uvLevel: "Very High",
    recommendation: "High risk. Use SPF 50+, protective gear essential.",
    airPollution: "Moderate",
    heatExposure: "28°C",
    humidity: "65%",
    melanomaRisk: "high",
    safeExposureTime: "10-15 minutes",
  }
};

// ✅ UV LEVEL COLOR CONFIG
const getUVConfig = (uvIndex: number) => {
  if (uvIndex <= 2) return { label: "Low", color: "bg-green-500/10 text-green-700 dark:text-green-400", icon: "text-green-500" };
  if (uvIndex <= 5) return { label: "Moderate", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: "text-yellow-500" };
  if (uvIndex <= 7) return { label: "High", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400", icon: "text-orange-500" };
  if (uvIndex <= 10) return { label: "Very High", color: "bg-red-500/10 text-red-700 dark:text-red-400", icon: "text-red-500" };
  return { label: "Extreme", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: "text-purple-500" };
};

// ✅ RISK BADGE
const RiskBadge = ({ level }: { level: "high" | "moderate" | "low" }) => {
  const config = {
    high: { label: "High Risk", color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50", icon: <AlertTriangle className="size-4" /> },
    moderate: { label: "Moderate Risk", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50", icon: <AlertTriangle className="size-4" /> },
    low: { label: "Low Risk", color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50", icon: <CheckCircle className="size-4" /> },
  };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config[level].color}`}>
      {config[level].icon}
      <span className="text-sm font-semibold">{config[level].label}</span>
    </div>
  );
};

export default function UvRiskPage() {
  const { t } = useTranslation();
  const [locationInput, setLocationInput] = useState("");
  const [riskData, setRiskData] = useState<RiskData>(mockRiskData.lagos);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCheckRisk = () => {
    const searchKey = locationInput.toLowerCase().trim();
    const data = mockRiskData[searchKey] || mockRiskData.lagos;
    setRiskData(data);
  };

  const uvConfig = getUVConfig(riskData.uvIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading UV data...</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.displayName || "User";

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('uvRisk.pageHeader.title')}
        subtitle={t('uvRisk.pageHeader.subtitle')}
      />

      {/* ✅ HERO SECTION */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 border-2 border-primary/20 flex-shrink-0">
              <AvatarFallback className="text-lg font-bold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userName}'s UV Risk Assessment</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time UV index, environmental factors, and melanoma risk in your location
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                  ☀️ Real-Time Data
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                  📍 Location-Based
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ SEARCH & MAIN CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" />
            Check Your Location
          </CardTitle>
          <CardDescription>Enter your city to view current UV index and environmental conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="flex gap-2 max-w-md">
            <Input
              type="text"
              placeholder={t('uvRisk.searchPlaceholder')}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheckRisk()}
            />
            <Button onClick={handleCheckRisk} size="lg" className="gap-2">
              <Search className="size-4" />
              Search
            </Button>
          </div>

          {/* UV Index Display */}
          <div className={`p-8 rounded-xl text-center border-2 ${uvConfig.color.replace('text-', 'border-').replace('bg-', '')}`}>
            <p className="text-sm font-semibold opacity-75 uppercase tracking-wide">{riskData.location}</p>
            <div className="mt-4 space-y-2">
              <p className="text-6xl font-bold">{riskData.uvIndex}</p>
              <p className="text-lg font-semibold">{uvConfig.label} UV Index</p>
              <p className="text-sm opacity-75 max-w-md mx-auto">Safe exposure time: {riskData.safeExposureTime}</p>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-black/10">
              <p className="text-sm font-medium">{riskData.recommendation}</p>
            </div>
          </div>

          {/* Melanoma Risk Badge */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border">
            <div>
              <p className="font-semibold">Melanoma Risk Assessment</p>
              <p className="text-sm text-muted-foreground">Based on current UV exposure</p>
            </div>
            <RiskBadge level={riskData.melanomaRisk} />
          </div>

          {/* Environmental Metrics Grid */}
          <div className="space-y-3">
            <p className="font-semibold text-sm">Environmental Conditions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <Wind className={`size-6 ${uvConfig.icon}`} />
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-bold text-lg">{riskData.airPollution}</p>
                  <p className="text-xs text-muted-foreground">Air Quality</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <Sun className={`size-6 ${uvConfig.icon}`} />
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-bold text-lg">{riskData.heatExposure}</p>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <Droplets className={`size-6 ${uvConfig.icon}`} />
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-bold text-lg">{riskData.humidity}</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <TrendingUp className={`size-6 ${uvConfig.icon}`} />
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-bold text-lg">{riskData.uvIndex}</p>
                  <p className="text-xs text-muted-foreground">UV Index</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Protection Tips */}
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 space-y-3">
            <p className="font-semibold text-green-900 dark:text-green-200 flex items-center gap-2">
              <CheckCircle className="size-4" />
              Sun Protection Tips
            </p>
            <ul className="text-sm text-green-800 dark:text-green-300 space-y-2">
              <li>✓ Apply broad-spectrum SPF 50+ sunscreen every 2 hours</li>
              <li>✓ Wear protective clothing: hat, sunglasses, long sleeves</li>
              <li>✓ Seek shade during peak hours (10 AM - 4 PM)</li>
              <li>✓ Stay hydrated and check local UV forecasts daily</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ✅ QUICK REFERENCE LOCATIONS */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Quick Reference</h3>
          <p className="text-sm text-muted-foreground">Popular locations (try: Lagos, Kabul, Nairobi)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(mockRiskData).map((data) => (
            <Card key={data.location} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setRiskData(data)}>
              <CardContent className="pt-6 space-y-3">
                <p className="font-semibold">{data.location}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{data.uvIndex}</p>
                    <p className="text-xs text-muted-foreground">{data.uvLevel}</p>
                  </div>
                  <RiskBadge level={data.melanomaRisk} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}