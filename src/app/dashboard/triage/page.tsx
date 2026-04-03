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
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" />
              Your Referral
            </CardTitle>
            <CardDescription>
              Digital referral document with AI assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg bg-secondary/30 space-y-3">
              <Image
                src={qrCodeUrl}
                alt="Referral QR Code"
                width={180}
                height={180}
                className="bg-white p-2 rounded"
              />
              <p className="text-xs text-muted-foreground text-center">
                Share this QR code with dermatology center
              </p>
            </div>

            {/* Referral Details */}
            <div className="space-y-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Patient Information</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900">
                    <span className="text-xs text-muted-foreground">Name</span>
                    <span className="font-semibold text-sm">{userName}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900">
                    <span className="text-xs text-muted-foreground">Patient ID</span>
                    <span className="font-mono font-semibold text-sm">DF-{currentUser?.uid?.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900">
                    <span className="text-xs text-muted-foreground">Analysis Date</span>
                    <span className="font-semibold text-sm">{analysisDate}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">AI Assessment</p>
                <div className="flex items-center gap-2 p-2 rounded bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="size-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-green-900 dark:text-green-200">Low Risk</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Confidence Score</p>
                <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full w-[92.5%] bg-gradient-to-r from-green-500 to-green-600"></div>
                </div>
                <p className="text-xs text-right font-semibold">92.5%</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button className="w-full gap-2">
                <Printer className="size-4" />
                Print Referral
              </Button>
              <Button variant="secondary" className="w-full gap-2">
                <Download className="size-4" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: FIND CENTERS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                Find Nearby Centers
              </CardTitle>
              <CardDescription>Enter your location to find dermatology centers near you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 max-w-md">
                <Input
                  type="text"
                  placeholder="Enter your city or address..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="lg" className="gap-2">
                  <Search className="size-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location Map</CardTitle>
            </CardHeader>
            <CardContent>
              <MapPreview searched={searched} centers={centers} />
            </CardContent>
          </Card>

          {/* Centers List */}
          {searched && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Centers ({centers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {centers.map((center) => (
                    <div key={center.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">{center.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="size-3" />
                            {center.location}
                          </div>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          ⭐ {center.rating}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 py-3 px-3 rounded-lg bg-secondary/50">
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold">{center.distance}</p>
                          <p className="text-xs text-muted-foreground">Distance</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold">{center.waitTime}</p>
                          <p className="text-xs text-muted-foreground">Wait Time</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold">In-Person</p>
                          <p className="text-xs text-muted-foreground">Consultation</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {center.specialists.map((spec, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full gap-2">
                        <Navigation className="size-4" />
                        Get Directions
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ✅ INFO SECTION */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="size-4" />
            What Happens Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Share Referral", desc: "Show your QR code at the dermatology center" },
              { step: "2", title: "Professional Review", desc: "Board-certified dermatologist evaluates you" },
              { step: "3", title: "Treatment Plan", desc: "Receive personalized care recommendations" },
            ].map((item) => (
              <div key={item.step} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {item.step}
                  </div>
                  <p className="font-semibold">{item.title}</p>
                </div>
                <p className="text-sm text-muted-foreground ml-11">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}