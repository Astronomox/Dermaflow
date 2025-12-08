"use client";

import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Video, MapPin, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useTranslation } from "@/context/language-context";

const dermatologists = [
  {
    id: 1,
    name: "Dr. Amina Okoro",
    specialty: "Clinical Dermatology",
    location: "Lagos, Nigeria",
    rating: 4.9,
    reviews: 128,
    price: 5,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da60710?q=80&w=400",
    experience: "12 years",
    responseTime: "< 5 min",
    bio: "Specialist in melanoma detection and skin cancer prevention",
  },
  {
    id: 2,
    name: "Dr. Ben Carter",
    specialty: "Pediatric Dermatology",
    location: "Nairobi, Kenya",
    rating: 4.8,
    reviews: 94,
    price: 4,
    avatar: "https://images.unsplash.com/photo-1635894931818-a849d44c205f?q=80&w=400",
    experience: "8 years",
    responseTime: "< 10 min",
    bio: "Expert in treating skin conditions in children and teens",
  },
  {
    id: 3,
    name: "Dr. Fatima Al-Sayed",
    specialty: "Cosmetic Dermatology",
    location: "Cairo, Egypt",
    rating: 5.0,
    reviews: 210,
    price: 8,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400",
    experience: "15 years",
    responseTime: "< 3 min",
    bio: "Board-certified specialist in aesthetic and medical dermatology",
  },
];

export default function TeleDermPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [filteredDerms, setFilteredDerms] = useState(dermatologists);
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

  const handleSearch = (value: string) => {
    setSearchInput(value);
    const filtered = dermatologists.filter(
      (derm) =>
        derm.name.toLowerCase().includes(value.toLowerCase()) ||
        derm.specialty.toLowerCase().includes(value.toLowerCase()) ||
        derm.location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDerms(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dermatologists...</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.displayName || "User";

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('teleDerm.pageHeader.title')}
        subtitle={t('teleDerm.pageHeader.subtitle')}
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
              <h2 className="text-2xl font-bold">Connect with Expert Dermatologists</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get professional medical advice from board-certified dermatologists via video consultation
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                  ✓ Board Certified
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                  💬 Instant Response
                </div>
                <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                  🌍 Available 24/7
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ SEARCH & FILTER */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" />
            Find Your Dermatologist
          </CardTitle>
          <CardDescription>Search by name, specialty, or location</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search dermatologists, specialties, or locations..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* ✅ DERMATOLOGIST CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Available Specialists</h3>
            <p className="text-sm text-muted-foreground">{filteredDerms.length} dermatologists found</p>
          </div>
          <Badge variant="outline" className="text-base">{filteredDerms.length}</Badge>
        </div>

        {filteredDerms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDerms.map((derm) => (
              <Card key={derm.id} className="hover:shadow-xl transition-all hover:border-primary/50 overflow-hidden">
                {/* Header with avatar */}
                <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Avatar className="size-24 border-4 border-background">
                    <AvatarImage src={derm.avatar} alt={derm.name} />
                    <AvatarFallback className="text-2xl font-bold">
                      {derm.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <CardContent className="pt-6 space-y-4">
                  {/* Name & Specialty */}
                  <div className="text-center space-y-1">
                    <h3 className="font-headline text-lg font-semibold">{derm.name}</h3>
                    <p className="text-sm text-muted-foreground">{derm.specialty}</p>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground text-center">{derm.bio}</p>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1">
                    <Star className="size-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold">{derm.rating}</span>
                    <span className="text-xs text-muted-foreground">({derm.reviews} reviews)</span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 py-3 px-3 rounded-lg bg-secondary/50">
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Award className="size-3" />
                        <span className="text-xs">{derm.experience}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Clock className="size-3" />
                        <span className="text-xs">{derm.responseTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Response</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                    <MapPin className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-200">{derm.location}</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-baseline gap-1 justify-center">
                      <span className="text-2xl font-bold">${derm.price}</span>
                      <span className="text-sm text-muted-foreground">/ 30 min</span>
                    </div>
                    <Button className="w-full gap-2" size="lg">
                      <Video className="size-4" />
                      Start Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="size-12 text-muted-foreground/50 mb-4" />
              <p className="font-semibold text-muted-foreground">No dermatologists found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ✅ INFO SECTION */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="size-4" />
            How TeleDerm Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Select Doctor", desc: "Choose a specialist based on your needs" },
              { step: "2", title: "Schedule Call", desc: "Pick a time that works for you" },
              { step: "3", title: "Get Diagnosis", desc: "Receive professional medical advice" },
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