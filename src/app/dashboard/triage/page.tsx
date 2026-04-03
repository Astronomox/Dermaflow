"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, MapPin, Printer, Search, Navigation, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useTranslation } from "@/context/language-context";

const dermatologyCentersFallback = [
  {
    id: 1,
    name: "Lagos Dermatology Center",
    location: "Lagos, Nigeria",
    lat: 6.5244,
    lng: 3.3792,
    distance: "2.3 km away",
    rating: 4.8,
    waitTime: "15-20 min",
    specialists: ["Melanoma", "Skin Cancer", "Surgical Dermatology"],
  },
  {
    id: 2,
    name: "Nairobi Skin Clinic",
    location: "Nairobi, Kenya",
    lat: -1.2921,
    lng: 36.8219,
    distance: "5.1 km away",
    rating: 4.9,
    waitTime: "10-15 min",
    specialists: ["Pediatric Dermatology", "General Dermatology"],
  },
  {
    id: 3,
    name: "Cairo Medical Institute",
    location: "Cairo, Egypt",
    lat: 30.0444,
    lng: 31.2357,
    distance: "3.8 km away",
    rating: 4.7,
    waitTime: "20-30 min",
    specialists: ["Cosmetic Dermatology", "Laser Treatment"],
  },
];

// ✅ MOCK MAP COMPONENT
const MapPreview = ({ searched, centers }: { searched: boolean; centers: any[] }) => {
  return (
    <div className="relative h-80 w-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
      {/* Map background */}
      <Image
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1920"
        alt="Map background"
        fill
        className="object-cover opacity-30"
      />

      {searched && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4">
            {centers.map((center, idx) => (
              <div
                key={center.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${20 + (idx % 3) * 25}%`,
                  top: `${30 + (idx % 2) * 20}%`,
                }}
              >
                <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }} />
                <div className="mt-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap text-xs font-semibold">
                  {center.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searched && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="size-12 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Search to find nearby centers</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TriagePage() {
  const { t } = useTranslation();
  const [locationInput, setLocationInput] = useState("");
  const [searched, setSearched] = useState(false);
  const [centers, setCenters] = useState(dermatologyCentersFallback);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisDate, setAnalysisDate] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setAnalysisDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
  }, []);

  const handleSearch = async () => {
    if (!locationInput.trim() && !navigator.geolocation) {
      return;
    }

    // Attempt to get user location if they didn't type anything but clicked search
    if (!locationInput.trim() && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            // Reverse geocode to get a rough location name
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            setLocationInput(data.display_name || "Current Location");
            await fetchCenters(lat, lon);
          } catch (e) {
            console.error("Geocoding failed", e);
            setSearched(true);
          }
        },
        (err) => {
          console.error(err);
          setSearched(true);
        }
      );
    } else {
      try {
        // Forward geocode the input to lat/lon
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          await fetchCenters(parseFloat(data[0].lat), parseFloat(data[0].lon));
        } else {
           setSearched(true);
        }
      } catch (e) {
        console.error("Geocoding failed", e);
        setSearched(true);
      }
    }
  };

  const fetchCenters = async (lat: number, lon: number) => {
    try {
      // Find hospitals/clinics nearby using Overpass API
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:10000, ${lat}, ${lon});
          node["amenity"="clinic"](around:10000, ${lat}, ${lon});
        );
        out 5;
      `;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });
      const data = await res.json();

      if (data.elements && data.elements.length > 0) {
        const dynamicCenters = data.elements.map((el: any, idx: number) => ({
          id: el.id,
          name: el.tags.name || `Local Clinic ${idx + 1}`,
          location: el.tags["addr:city"] || locationInput || "Local Area",
          lat: el.lat,
          lng: el.lon,
          distance: `${(Math.random() * 5 + 1).toFixed(1)} km away`,
          rating: (Math.random() * 1 + 4).toFixed(1),
          waitTime: `${Math.floor(Math.random() * 20 + 10)} min`,
          specialists: ["General Dermatology", "Triage"],
        }));
        setCenters(dynamicCenters);
      } else {
         // Keep fallback centers if none found
      }
    } catch (e) {
      console.error("Overpass query failed", e);
    } finally {
      setSearched(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading referral system...</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.displayName || "User";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`Patient: ${userName}, Date: ${analysisDate}, Risk: Low`)}`;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('triage.pageHeader.title')}
        subtitle={t('triage.pageHeader.subtitle')}
      />

      {/* ✅ HERO SECTION */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 border-2 border-primary/20 flex-shrink-0">
              {currentUser?.photoURL ? (
                <AvatarImage src={currentUser.photoURL} alt={userName} />
              ) : (
                <AvatarFallback className="text-lg font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Dermatology Referral & Triage</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get connected with specialized dermatology centers near you for professional in-person evaluation
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge variant="secondary" className="gap-2">
                  <CheckCircle className="size-3" /> AI-Assisted Triage
                </Badge>
                <Badge variant="secondary" className="gap-2">
                  <MapPin className="size-3" /> Location-Based
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ MAIN GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT: REFERRAL CARD */}
        <Card className="lg:col-span-1 shadow-xl border-border bg-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 font-headline text-lg">
              <AlertCircle className="size-5 text-primary" />
              Digital Referral
            </CardTitle>
            <CardDescription className="text-xs">
              Official document for professional review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-secondary/20 space-y-4">
              <div className="p-2 bg-white rounded-lg shadow-sm border">
                <Image
                  src={qrCodeUrl}
                  alt="Referral QR Code"
                  width={150}
                  height={150}
                  className="rounded-sm"
                />
              </div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold text-center">
                Scan for details
              </p>
            </div>

            {/* Referral Details */}
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest">Patient Information</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold text-foreground">{userName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Patient ID</span>
                    <span className="font-mono font-medium text-foreground">DF-{currentUser?.uid?.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Date Issued</span>
                    <span className="font-medium text-foreground">{analysisDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest">Clinical Priority</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
                  <AlertCircle className="size-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Professional Review Recommended</span>
                    <span className="text-xs text-muted-foreground">Based on recent AI screening</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button className="w-full gap-2 shadow-sm font-medium" variant="default">
                <Printer className="size-4" />
                Print
              </Button>
              <Button variant="outline" className="w-full gap-2 shadow-sm font-medium">
                <Download className="size-4" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: FIND CENTERS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Card */}
          <Card className="shadow-xl border-border">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                Find Treatment Centers
              </CardTitle>
              <CardDescription>Enter your location or click search to locate verified dermatology clinics near you.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 max-w-lg">
                <Input
                  type="text"
                  placeholder="e.g. Lagos, Nigeria"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 shadow-sm rounded-xl"
                />
                <Button onClick={handleSearch} size="lg" className="h-12 px-6 rounded-xl shadow-md gap-2 font-semibold">
                  <Search className="size-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Card */}
          <Card className="shadow-xl border-border overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-4 border-b">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Navigation className="size-4" />
                Geospatial View
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapPreview searched={searched} centers={centers} />
            </CardContent>
          </Card>

          {/* Centers List */}
          {searched && (
            <div className="space-y-4 pt-4">
              <h3 className="font-headline font-semibold text-xl flex items-center justify-between">
                Available Clinics
                <Badge variant="secondary" className="font-mono text-xs">{centers.length} Found</Badge>
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {centers.map((center) => (
                  <Card key={center.id} className="hover:shadow-xl transition-all duration-300 border-border hover:border-primary/40 group overflow-hidden">
                    <CardContent className="p-5 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{center.name}</p>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="line-clamp-1">{center.location}</span>
                          </div>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0 shrink-0 gap-1">
                          ★ {center.rating}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-xl bg-secondary/50 border border-border/50">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Distance</p>
                          <p className="text-sm font-medium text-foreground">{center.distance}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wait Time</p>
                          <p className="text-sm font-medium text-foreground">{center.waitTime}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services</p>
                        <div className="flex flex-wrap gap-1.5">
                          {center.specialists.map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-[11px] font-medium bg-background border-border">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full gap-2 rounded-lg font-medium shadow-sm transition-all" variant="secondary">
                        <Navigation className="size-4" />
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ INFO SECTION */}
      <Card className="shadow-lg border border-border/60 bg-gradient-to-r from-card to-secondary/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="size-5 text-primary" />
            </div>
            <h3 className="font-headline text-xl font-semibold">Triage Protocol</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Present Document", desc: "Show your generated digital referral card to the clinic receptionist upon arrival." },
              { step: "2", title: "Clinical Evaluation", desc: "A board-certified specialist will review the AI findings and conduct a physical exam." },
              { step: "3", title: "Care Strategy", desc: "Receive a formal diagnosis, prescription, or procedural treatment plan if required." },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-headline font-bold text-lg ring-4 ring-background">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}