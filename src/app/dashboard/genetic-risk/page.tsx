"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Network, AlertCircle, CheckCircle, Info, TrendingUp } from "lucide-react";
import { useTransition, useState, useEffect } from "react";
import { useTranslation } from "@/context/language-context";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const riskSchema = z.object({
  age: z.coerce.number().min(1, "Age is required").max(150, "Please enter a valid age"),
  skinPhenotype: z.string().min(1, "Skin phenotype is required"),
  lesionRecurrence: z.enum(["yes", "no", "unsure"]),
  sunExposure: z.enum(["low", "moderate", "high"]),
  familyHistory: z.enum(["yes", "no", "unsure"]),
  geoLocation: z.string().min(2, "Geo-location is required"),
});

// ✅ TYPING ANIMATION
const TypingAnimation = () => (
  <div className="flex items-center gap-1">
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

// ✅ RISK LEVEL INDICATOR
const RiskIndicator = ({ level }: { level: "low" | "moderate" | "elevated" }) => {
  const config = {
    low: {
      color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50",
      icon: <CheckCircle className="size-5" />,
      label: "Low Risk",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    moderate: {
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      icon: <AlertCircle className="size-5" />,
      label: "Moderate Risk",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    elevated: {
      color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
      icon: <AlertCircle className="size-5" />,
      label: "Elevated Risk",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
  };

  return config[level];
};

export default function GeneticRiskPage() {
  const { t } = useTranslation();
  const [isAnalyzing, startAnalysis] = useTransition();
  const [riskResult, setRiskResult] = useState<{
    level: "low" | "moderate" | "elevated";
    score: number;
    factors: string[];
    recommendations: string[];
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const form = useForm<z.infer<typeof riskSchema>>({
    resolver: zodResolver(riskSchema),
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

  const onSubmit = (values: z.infer<typeof riskSchema>) => {
    setRiskResult(null);
    startAnalysis(async () => {
      // Simulate AI analysis with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      // ✅ REALISTIC RISK CALCULATION
      const riskFactors = [];
      let riskScore = 0;

      // Age factor
      if (values.age < 20) {
        riskScore += 10;
      } else if (values.age < 40) {
        riskScore += 20;
      } else if (values.age < 60) {
        riskScore += 35;
      } else {
        riskScore += 50;
      }

      // Skin phenotype (Fair skin = higher risk)
      const skinRiskMap: Record<string, number> = {
        I: 45,
        II: 40,
        III: 25,
        IV: 15,
        V: 10,
        VI: 8,
      };
      riskScore += skinRiskMap[values.skinPhenotype] || 0;

      // Lesion recurrence
      if (values.lesionRecurrence === "yes") {
        riskScore += 25;
        riskFactors.push("Previous lesion recurrence detected");
      } else if (values.lesionRecurrence === "unsure") {
        riskScore += 12;
        riskFactors.push("Uncertain lesion history");
      }

      // Sun exposure
      const sunMap = { low: 10, moderate: 25, high: 40 };
      riskScore += sunMap[values.sunExposure] || 0;
      riskFactors.push(
        `${values.sunExposure.charAt(0).toUpperCase() + values.sunExposure.slice(1)} sun exposure`
      );

      // Family history
      if (values.familyHistory === "yes") {
        riskScore += 30;
        riskFactors.push("Strong family history of melanoma");
      } else if (values.familyHistory === "unsure") {
        riskScore += 15;
        riskFactors.push("Unclear family history");
      }

      // Geographic location (Equatorial = higher risk)
      if (
        values.geoLocation.toLowerCase().includes("equator") ||
        values.geoLocation.toLowerCase().includes("tropical")
      ) {
        riskScore += 20;
        riskFactors.push("High UV exposure region");
      }

      // Normalize score to 0-100
      riskScore = Math.min(100, Math.max(0, riskScore));

      // Determine risk level
      let level: "low" | "moderate" | "elevated";
      if (riskScore < 35) {
        level = "low";
      } else if (riskScore < 65) {
        level = "moderate";
      } else {
        level = "elevated";
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (values.sunExposure !== "low") {
        recommendations.push("Apply SPF 50+ sunscreen daily, even on cloudy days");
      }
      if (values.familyHistory === "yes") {
        recommendations.push("Schedule regular dermatology checkups every 6 months");
      }
      if (riskScore > 50) {
        recommendations.push("Consider genetic counseling for melanoma risk assessment");
      }
      recommendations.push("Perform monthly self-examinations using the ABCDE method");
      if (values.geoLocation.toLowerCase().includes("equator")) {
        recommendations.push("Wear protective clothing during peak UV hours (10am-4pm)");
      }

      setRiskResult({
        level,
        score: Math.round(riskScore),
        factors: riskFactors,
        recommendations,
      });
    });
  };

  const userName = currentUser?.displayName || "User";
  const config = riskResult ? RiskIndicator(riskResult.level) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('geneticRisk.pageHeader.title')}
        subtitle={t('geneticRisk.pageHeader.subtitle')}
      />

      {/* ✅ HERO SECTION */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 md:gap-6">
            <Avatar className="size-16 border-4 border-primary/20 flex-shrink-0">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={userName} />
              ) : (
                <AvatarFallback className="text-lg font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userName}'s Genetic Risk Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Personalized melanoma and skin cancer risk assessment based on genetic and environmental factors
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                  🧬 AI-Powered Analysis
                </div>
                <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                  📊 Evidence-Based
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ MAIN GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT SIDE - FORM */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-5 text-primary" />
              Risk Assessment
            </CardTitle>
            <CardDescription>
              {t('geneticRisk.formCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Age */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('geneticRisk.form.age')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 35"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skin Phenotype */}
                <FormField
                  control={form.control}
                  name="skinPhenotype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('geneticRisk.form.skinPhenotype')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('geneticRisk.form.selectPlaceholder')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="I">
                            Type I - Very Fair (Always Burns)
                          </SelectItem>
                          <SelectItem value="II">
                            Type II - Fair (Usually Burns)
                          </SelectItem>
                          <SelectItem value="III">
                            Type III - Medium (Sometimes Burns)
                          </SelectItem>
                          <SelectItem value="IV">
                            Type IV - Olive (Rarely Burns)
                          </SelectItem>
                          <SelectItem value="V">
                            Type V - Brown (Very Rarely Burns)
                          </SelectItem>
                          <SelectItem value="VI">
                            Type VI - Dark (Never Burns)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lesion Recurrence */}
                <FormField
                  control={form.control}
                  name="lesionRecurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('geneticRisk.form.lesionRecurrence')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('geneticRisk.form.selectPlaceholder')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="unsure">Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sun Exposure */}
                <FormField
                  control={form.control}
                  name="sunExposure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('geneticRisk.form.sunExposure')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('geneticRisk.form.selectPlaceholder')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low (&lt;2 hours/day)</SelectItem>
                          <SelectItem value="moderate">
                            Moderate (2-4 hours/day)
                          </SelectItem>
                          <SelectItem value="high">&gt;4 hours/day</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Family History */}
                <FormField
                  control={form.control}
                  name="familyHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('geneticRisk.form.familyHistory')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('geneticRisk.form.selectPlaceholder')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">
                            Yes (Melanoma history)
                          </SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="unsure">Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Geographic Location */}
                <FormField
                  control={form.control}
                  name="geoLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('geneticRisk.form.geoLocation')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Sydney, Australia"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isAnalyzing && <Loader2 className="animate-spin size-4" />}
                  {isAnalyzing
                    ? "Analyzing..."
                    : t('geneticRisk.analyzeButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* RIGHT SIDE - RESULTS */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="size-5 text-primary" />
              Risk Assessment Results
            </CardTitle>
            <CardDescription>
              {t('geneticRisk.resultCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex h-80 flex-col items-center justify-center rounded-lg border-2 border-dashed gap-4">
                <TypingAnimation />
                <p className="font-medium text-muted-foreground">
                  {t('geneticRisk.resultCard.analyzing')}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Analyzing your genetic and environmental risk factors...
                </p>
              </div>
            ) : riskResult ? (
              <div className="space-y-6">
                {/* Risk Score Card */}
                <div className={`p-6 rounded-lg border ${config?.bgColor} ${config?.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold opacity-75 uppercase">
                        Risk Level
                      </p>
                      <p className="text-3xl font-bold mt-2">
                        {config?.label}
                      </p>
                    </div>
                    <div className="text-5xl font-bold opacity-30">
                      {config?.icon}
                    </div>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all`}
                      style={{
                        width: `${riskResult.score}%`,
                        backgroundColor:
                          riskResult.level === "low"
                            ? "hsl(120, 73%, 50%)"
                            : riskResult.level === "moderate"
                              ? "hsl(38, 92%, 50%)"
                              : "hsl(0, 100%, 50%)",
                      }}
                    ></div>
                  </div>
                  <p className="text-sm mt-2 opacity-75">
                    Risk Score: {riskResult.score}/100
                  </p>
                </div>

                {/* Risk Factors */}
                {riskResult.factors.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-semibold text-sm">Contributing Risk Factors</p>
                    <div className="space-y-2">
                      {riskResult.factors.map((factor, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                        >
                          <AlertCircle className="size-4 text-amber-500 flex-shrink-0" />
                          <p className="text-sm">{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {riskResult.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-semibold text-sm">Personalized Recommendations</p>
                    <div className="space-y-2">
                      {riskResult.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50"
                        >
                          <CheckCircle className="size-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-green-900 dark:text-green-200">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <p className="text-xs text-blue-900 dark:text-blue-200">
                    <span className="font-semibold">Disclaimer:</span> This
                    assessment is for educational purposes only and should not
                    replace professional medical consultation. Please consult with
                    a dermatologist or genetic counselor for formal risk evaluation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                <Network className="size-16 text-muted-foreground/50" />
                <p className="mt-4 font-medium text-muted-foreground">
                  {t('geneticRisk.resultCard.placeholder')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Fill out the form to generate your personalized risk profile
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}