"use client";

import { useTransition, useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle, AlertCircle, Lightbulb, Droplet } from 'lucide-react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { personalizedHygieneTips } from '@/ai/flows/personalized-hygiene-tips';
import type { PersonalizedHygieneTipsOutput } from '@/ai/flows/personalized-hygiene-tips';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from '@/context/language-context';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const recommendationSchema = z.object({
  skinCondition: z.enum(["oily", "dry", "sensitive", "acne-prone", "combination", "normal"]),
  age: z.coerce.number().min(1, "Age must be a positive number.").max(120),
  lifestyle: z.enum(["active", "sedentary", "moderate"]),
  climate: z.enum(["humid", "dry", "cold", "hot", "temperate"]),
  concerns: z.string().min(3, "Please describe your concerns.").max(200),
});

// ✅ TYPING ANIMATION
const TypingAnimation = () => (
  <div className="flex items-center gap-1">
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

// ✅ SKIN CONDITION CONFIG
const getSkinConfig = (condition: string) => {
  const config: Record<string, { color: string; icon: React.ReactNode; description: string }> = {
    oily: { 
      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      icon: <Droplet className="size-5" />,
      description: "Excess sebum production"
    },
    dry: {
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      icon: <AlertCircle className="size-5" />,
      description: "Requires extra hydration"
    },
    sensitive: {
      color: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
      icon: <Lightbulb className="size-5" />,
      description: "Needs gentle care"
    },
    "acne-prone": {
      color: "bg-red-500/10 text-red-700 dark:text-red-400",
      icon: <AlertCircle className="size-5" />,
      description: "Prone to breakouts"
    },
    combination: {
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      icon: <Sparkles className="size-5" />,
      description: "Mixed skin characteristics"
    },
    normal: {
      color: "bg-green-500/10 text-green-700 dark:text-green-400",
      icon: <CheckCircle className="size-5" />,
      description: "Well-balanced skin"
    },
  };
  return config[condition] || config.normal;
};

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const [isGenerating, startGenerationTransition] = useTransition();
  const [recommendation, setRecommendation] = useState<PersonalizedHygieneTipsOutput | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [formValues, setFormValues] = useState<z.infer<typeof recommendationSchema> | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof recommendationSchema>>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      age: 25,
      concerns: "",
    },
  });

  // ✅ GET CURRENT USER
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = (values: z.infer<typeof recommendationSchema>) => {
    setRecommendation(null);
    setFormValues(values);
    startGenerationTransition(async () => {
      try {
        // Add language support
        const currentLanguage = localStorage.getItem('language') || 'en';
        const recentAnalysisResult = localStorage.getItem('recentAnalysisResult') || undefined;
        const result = await personalizedHygieneTips({ 
          ...values, 
          analysisResult: recentAnalysisResult,
          language: currentLanguage 
        });
        setRecommendation(result);
      } catch (error) {
        console.error("Failed to generate recommendations:", error);
        toast({
          variant: "destructive",
          title: t('recommendations.toast.failedTitle'),
          description: t('recommendations.toast.failedDesc'),
        });
      }
    });
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.displayName || "User";
  const skinConfig = formValues ? getSkinConfig(formValues.skinCondition) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('recommendations.pageHeader.title')}
        subtitle={t('recommendations.pageHeader.subtitle')}
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
              <h2 className="text-2xl font-bold">{userName}'s Personalized Skincare Plan</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI-generated skincare routine tailored to your skin type, lifestyle, and environmental conditions
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                  🤖 AI-Customized
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                  ✓ Evidence-Based
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ MAIN GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT: FORM */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Your Profile
            </CardTitle>
            <CardDescription>
              {t('recommendations.detailsCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Skin Condition */}
                <FormField control={form.control} name="skinCondition" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{t('recommendations.form.skinType.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('recommendations.form.skinType.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="oily">Oily (Excess sebum)</SelectItem>
                        <SelectItem value="dry">Dry (Needs moisture)</SelectItem>
                        <SelectItem value="sensitive">Sensitive (Easily irritated)</SelectItem>
                        <SelectItem value="acne-prone">Acne-Prone (Breakout-prone)</SelectItem>
                        <SelectItem value="combination">Combination (Mixed)</SelectItem>
                        <SelectItem value="normal">Normal (Balanced)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Age */}
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{t('recommendations.form.age.label')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 28" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Lifestyle */}
                <FormField control={form.control} name="lifestyle" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{t('recommendations.form.lifestyle.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('recommendations.form.lifestyle.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active (Regular exercise)</SelectItem>
                        <SelectItem value="moderate">Moderate (Some activity)</SelectItem>
                        <SelectItem value="sedentary">Sedentary (Low activity)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Climate */}
                <FormField control={form.control} name="climate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{t('recommendations.form.climate.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('recommendations.form.climate.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hot">Hot & sunny</SelectItem>
                        <SelectItem value="cold">Cold & dry</SelectItem>
                        <SelectItem value="humid">Humid & tropical</SelectItem>
                        <SelectItem value="dry">Dry & arid</SelectItem>
                        <SelectItem value="temperate">Temperate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Concerns */}
                <FormField control={form.control} name="concerns" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">{t('recommendations.form.concerns.label')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Sensitivity to sunscreen, hyperpigmentation, texture issues..."
                        className="min-h-24 resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  size="lg"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <TypingAnimation />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      {t('recommendations.generateButton')}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* RIGHT: RECOMMENDATIONS */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-5 text-primary" />
              Your Skincare Routine
            </CardTitle>
            <CardDescription>
              {t('recommendations.planCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <TypingAnimation />
                <p className="font-medium text-muted-foreground">Analyzing your skin profile...</p>
                <p className="text-sm text-muted-foreground max-w-xs text-center">
                  Creating personalized recommendations based on your answers
                </p>
              </div>
            ) : recommendation ? (
              <div className="space-y-6">
                {/* Skin Type Summary */}
                {formValues && (
                  <div className={`p-4 rounded-lg border ${skinConfig?.color}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {skinConfig?.icon}
                      <div>
                        <p className="font-semibold capitalize">{formValues.skinCondition.replace('-', ' ')} Skin</p>
                        <p className="text-sm opacity-75">{skinConfig?.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Recommendations */}
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none text-foreground prose-headings:font-headline prose-headings:text-foreground prose-strong:text-foreground">
                    <div dangerouslySetInnerHTML={{ 
                      __html: recommendation.hygieneTips
                        .replace(/\n/g, '<br />')
                        .replace(/^(#+\s)/gm, '<strong>$1</strong>')
                    }} />
                  </div>
                </div>

                {/* Implementation Tips */}
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 space-y-3">
                  <p className="font-semibold text-green-900 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle className="size-4" />
                    Quick Tips to Get Started
                  </p>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-2">
                    <li>✓ Start with the morning & evening routine outlined above</li>
                    <li>✓ Give products 2-4 weeks to show results</li>
                    <li>✓ Stay consistent with your skincare regimen</li>
                    <li>✓ Adjust based on seasonal changes in your climate</li>
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <p className="text-xs text-blue-900 dark:text-blue-200">
                    <span className="font-semibold">Note:</span> This is an AI-generated recommendation based on general dermatological practices. For persistent skin issues or severe conditions, consult a professional dermatologist.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24 text-center space-y-4">
                <Sparkles className="size-16 text-muted-foreground/50" />
                <div>
                  <p className="font-semibold text-muted-foreground">{t('recommendations.planCard.placeholder')}</p>
                  <p className="text-sm text-muted-foreground mt-1">Fill out your profile to get started</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}