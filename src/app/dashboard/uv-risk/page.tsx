"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Wind, Droplets, Sun, AlertTriangle, CheckCircle, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useTranslation } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";

type WeatherResponse = {
  location: { latitude: number; longitude: number; timezone: string };
  current: {
    temperature: number; apparentTemperature: number; humidity: number;
    windSpeed: number; uvIndex: number; cloudCover: number;
    weatherCode: number; weatherDescription: string;
  };
  uv: {
    index: number; maxToday: number; level: string;
    safeExposureTime: string; recommendation: string;
    melanomaRisk: 'low' | 'moderate' | 'high';
  };
  environment: { temperature: string; humidity: string; airQuality: string; windSpeed: string };
  daily: { temperatureMax: number; temperatureMin: number; precipitationProbability: number };
};

// UV color config
const getUVConfig = (uvIndex: number) => {
  if (uvIndex <= 2) return { label: "Low", color: "bg-green-500/10 text-green-700 dark:text-green-400", icon: "text-green-500", border: "border-green-300 dark:border-green-800" };
  if (uvIndex <= 5) return { label: "Moderate", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: "text-yellow-500", border: "border-yellow-300 dark:border-yellow-800" };
  if (uvIndex <= 7) return { label: "High", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400", icon: "text-orange-500", border: "border-orange-300 dark:border-orange-800" };
  if (uvIndex <= 10) return { label: "Very High", color: "bg-red-500/10 text-red-700 dark:text-red-400", icon: "text-red-500", border: "border-red-300 dark:border-red-800" };
  return { label: "Extreme", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: "text-purple-500", border: "border-purple-300 dark:border-purple-800" };
};

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
  const { toast } = useToast();
  const [locationInput, setLocationInput] = useState("");
  const [locationName, setLocationName] = useState("Detecting location...");
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  // Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback to Lagos if geolocation unavailable
      fetchWeather(6.5244, 3.3792, "Lagos, Nigeria");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode to get city name
        try {
          const res = await fetch(`/api/geocode?q=${latitude},${longitude}`);
          const data = await res.json();
          const name = data.results?.[0]?.displayName || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          fetchWeather(latitude, longitude, name);
        } catch {
          fetchWeather(latitude, longitude, `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      },
      () => {
        // Geolocation denied — fallback to Lagos
        fetchWeather(6.5244, 3.3792, "Lagos, Nigeria");
        toast({
          title: "Location access denied",
          description: "Showing UV data for Lagos. Search any city for your location.",
        });
      },
      { timeout: 8000 }
    );
  }, []);

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setFetching(true);
    setLocationName(name);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error('Weather API error');
      const data: WeatherResponse = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error('[DERMAFLOW] Weather fetch failed:', err);
      toast({
        variant: "destructive",
        title: "Weather data unavailable",
        description: "Could not fetch live UV data. Please try again.",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = async () => {
    const q = locationInput.trim();
    if (!q) return;

    setFetching(true);
    try {
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        toast({ variant: "destructive", title: "Location not found", description: `Could not find "${q}". Try a different city name.` });
        setFetching(false);
        return;
      }

      const loc = geoData.results[0];
      await fetchWeather(loc.latitude, loc.longitude, loc.displayName);
    } catch (err) {
      console.error('[DERMAFLOW] Geocode failed:', err);
      toast({ variant: "destructive", title: "Search failed", description: "Could not search for that location." });
      setFetching(false);
    }
  };

  const userName = currentUser?.displayName || "User";

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

  const uvConfig = weatherData ? getUVConfig(weatherData.uv.maxToday) : getUVConfig(0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('uvRisk.pageHeader.title')}
        subtitle={t('uvRisk.pageHeader.subtitle')}
      />

      {/* Hero Section */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 border-2 border-primary/20 flex-shrink-0">
              <AvatarFallback className="text-lg font-bold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userName}&apos;s UV Risk Assessment</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Live UV index and environmental conditions for your location
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live Data
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold flex items-center gap-1">
                  <MapPin className="size-3" />
                  {locationName}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" />
            Check Your Location
          </CardTitle>
          <CardDescription>Enter any city to view current UV index and environmental conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 max-w-md">
            <Input
              type="text"
              placeholder="Search any city..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} size="lg" className="gap-2" disabled={fetching}>
              {fetching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Search
            </Button>
          </div>

          {/* Loading state */}
          {fetching && !weatherData && (
            <div className="p-8 text-center">
              <Loader2 className="size-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Fetching live weather data...</p>
            </div>
          )}

          {/* Results */}
          {weatherData && (
            <>
              {/* UV Index Display */}
              <div className={`p-8 rounded-xl text-center border-2 ${uvConfig.border}`}>
                <p className="text-sm font-semibold opacity-75 uppercase tracking-wide">{locationName}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-6xl font-bold">{weatherData.uv.maxToday}</p>
                  <p className="text-lg font-semibold">{uvConfig.label} UV Index</p>
                  <p className="text-sm opacity-75 max-w-md mx-auto">Safe exposure time: {weatherData.uv.safeExposureTime}</p>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-black/10">
                  <p className="text-sm font-medium">{weatherData.uv.recommendation}</p>
                </div>
              </div>

              {/* Melanoma Risk */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border">
                <div>
                  <p className="font-semibold">Melanoma Risk Assessment</p>
                  <p className="text-sm text-muted-foreground">Based on current UV exposure</p>
                </div>
                <RiskBadge level={weatherData.uv.melanomaRisk} />
              </div>

              {/* Environmental Metrics */}
              <div className="space-y-3">
                <p className="font-semibold text-sm">Live Environmental Conditions</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Wind className={`size-6 ${uvConfig.icon}`} />
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-bold text-lg">{weatherData.environment.airQuality}</p>
                      <p className="text-xs text-muted-foreground">Air Quality</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Sun className={`size-6 ${uvConfig.icon}`} />
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-bold text-lg">{weatherData.environment.temperature}</p>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Droplets className={`size-6 ${uvConfig.icon}`} />
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-bold text-lg">{weatherData.environment.humidity}</p>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <TrendingUp className={`size-6 ${uvConfig.icon}`} />
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-bold text-lg">{weatherData.environment.windSpeed}</p>
                      <p className="text-xs text-muted-foreground">Wind Speed</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Weather context */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground">High</p>
                  <p className="font-bold text-lg">{weatherData.daily.temperatureMax}°C</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p className="font-bold text-lg">{weatherData.daily.temperatureMin}°C</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground">Rain</p>
                  <p className="font-bold text-lg">{weatherData.daily.precipitationProbability}%</p>
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
                  <li>✓ Stay hydrated and monitor conditions throughout the day</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
