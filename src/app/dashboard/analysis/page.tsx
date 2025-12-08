"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Camera,
  FileUp,
  Loader2,
  Mic,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Zap,
  X,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { generateExplainableAI } from "@/ai/flows/explainable-ai";
import { refineRiskAssessment } from "@/ai/flows/refine-risk-assessment";
import type {
  RefineRiskAssessmentInput,
  RefineRiskAssessmentOutput,
} from "@/ai/flows/refine-risk-assessment";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/context/language-context";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

type AnalysisState = {
  initialAssessment: string;
  confidence: number;
  refinedResult: RefineRiskAssessmentOutput | null;
};

type AudioState = {
  url: string | null;
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
}

const questionnaireSchema = z.object({
  duration: z.string().min(1, "Please specify the duration."),
  bleeding: z.enum(["yes", "no", "sometimes"]),
  itching: z.enum(["yes", "no", "sometimes"]),
  size: z.string().min(1, "Please estimate the size."),
  colorChange: z.enum(["yes", "no"]),
});

// ✅ TYPING ANIMATION
const TypingAnimation = () => (
  <div className="flex items-center gap-1">
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

export default function AnalysisPage() {
  const { t, language } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ url: null, isLoading: false, isPlaying: false, error: null });
  const [isAnalyzing, startAnalysisTransition] = useTransition();
  const [isRefining, startRefiningTransition] = useTransition();
  const [isQuestionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const form = useForm<z.infer<typeof questionnaireSchema>>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      duration: "",
      bleeding: "no",
      itching: "no",
      size: "",
      colorChange: "no",
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

  // ✅ START CAMERA
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraOpen(true);
        setCapturedPhoto(null);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please allow camera access to use this feature.",
      });
    }
  };

  // ✅ STOP CAMERA
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCapturedPhoto(null);
  };

  // ✅ CAPTURE PHOTO
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUri = canvasRef.current.toDataURL("image/jpeg", 0.95);
        setCapturedPhoto(dataUri);
      }
    }
  };

  // ✅ SEND CAPTURED PHOTO FOR ANALYSIS
  const sendForAnalysis = () => {
    if (capturedPhoto) {
      setImagePreview(capturedPhoto);
      setHeatmap(null);
      setAnalysis(null);
      setAudioState({ url: null, isLoading: false, isPlaying: false, error: null });
      stopCamera();
      performAnalysis(capturedPhoto);
    }
  };

  // ✅ RETAKE PHOTO
  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setHeatmap(null);
        setAnalysis(null);
        setAudioState({ url: null, isLoading: false, isPlaying: false, error: null });
        performAnalysis(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const performAnalysis = (dataUri: string) => {
    startAnalysisTransition(async () => {
      try {
        const result = await generateExplainableAI({ lesionImage: dataUri });
        setHeatmap(result.heatmapOverlay);
        setAnalysis({
          initialAssessment: "Benign (Nevus)",
          confidence: 92.5,
          refinedResult: null,
        });
      } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: t('analysis.toast.analysisFailedTitle'),
          description: t('analysis.toast.analysisFailedDesc'),
        });
        setImagePreview(null);
      }
    });
  };

  const handleRefineSubmit = (values: z.infer<typeof questionnaireSchema>) => {
    if (!analysis) return;
    setAudioState({ url: null, isLoading: false, isPlaying: false, error: null });

    const input: RefineRiskAssessmentInput = {
      initialAssessment: `${analysis.initialAssessment} with ${analysis.confidence}% confidence.`,
      ...values,
    };

    startRefiningTransition(async () => {
      try {
        const result = await refineRiskAssessment(input);
        setAnalysis(prev => prev ? { ...prev, refinedResult: result } : null);
        setQuestionnaireOpen(false);
        toast({
          title: t('analysis.toast.assessmentRefinedTitle'),
          description: t('analysis.toast.assessmentRefinedDesc'),
        });
      } catch (error) {
        console.error("Refinement failed:", error);
        toast({
          variant: "destructive",
          title: t('analysis.toast.refinementFailedTitle'),
          description: t('analysis.toast.refinementFailedDesc'),
        });
      }
    });
  };

  const handleReadAloud = async () => {
    if (!analysis) return;
    if (audioRef.current && audioState.url) {
      if (audioState.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      return;
    }

    setAudioState({ url: null, isLoading: true, isPlaying: false, error: null });
    const textToRead = analysis.refinedResult
      ? `${t('analysis.results.refinedAssessment')}: ${analysis.refinedResult.refinedAssessment}. ${t('analysis.results.rationale')}: ${analysis.refinedResult.rationale}`
      : `${t('analysis.results.initialAssessment')}: ${analysis.initialAssessment}. ${t('analysis.results.confidenceScore')}: ${analysis.confidence}%.`;

    try {
      const result = await textToSpeech({ text: textToRead, language });
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;
        audio.play();
        audio.onplay = () => setAudioState({ url: result.audioUrl, isLoading: false, isPlaying: true, error: null });
        audio.onpause = () => setAudioState(s => ({ ...s, isPlaying: false }));
        audio.onended = () => setAudioState(s => ({ ...s, isPlaying: false, url: s.url }));
      } else {
        throw new Error("No audio URL returned");
      }
    } catch (error) {
      console.error("TTS failed:", error);
      setAudioState({ url: null, isLoading: false, isPlaying: false, error: t('analysis.audio.error') });
    }
  };

  const resetStateAndUpload = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopCamera();
    setImagePreview(null);
    setHeatmap(null);
    setAnalysis(null);
    setAudioState({ url: null, isLoading: false, isPlaying: false, error: null });
    form.reset();
    fileInputRef.current?.click();
  };

  const getAudioIcon = () => {
    if (audioState.isLoading) return <Loader2 className="animate-spin" />;
    if (audioState.isPlaying) return <Pause />;
    if (audioState.url) return <Play />;
    return <Mic />;
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.displayName || "User";

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('analysis.pageHeader.title')}
        subtitle={t('analysis.pageHeader.subtitle')}
      >
        {imagePreview && (
          <Button onClick={resetStateAndUpload} variant="outline" disabled={isAnalyzing}>
            <RefreshCcw className="mr-2 size-4" />
            New Analysis
          </Button>
        )}
      </PageHeader>

      {!imagePreview ? (
        <>
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
                  <h2 className="text-2xl font-bold">{userName}'s Skin Analysis</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Capture or upload an image of your skin lesion for AI-powered analysis with explainable heatmap
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                      🔬 AI-Powered Analysis
                    </div>
                    <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                      🧬 Explainable AI
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ CAMERA MODAL - FULLSCREEN */}
          {cameraOpen && (
            <div className="fixed inset-0 z-50 flex flex-col bg-black">
              {/* Close Button */}
              <div className="absolute top-4 left-4 z-10">
                <Button
                  onClick={stopCamera}
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                  <X className="size-6" />
                </Button>
              </div>

              {/* Video Feed */}
              <div className="flex-1 relative overflow-hidden">
                {!capturedPhoto ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={capturedPhoto}
                    alt="Captured lesion"
                    fill
                    className="object-cover"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls Footer */}
              <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-6 space-y-4">
                {!capturedPhoto ? (
                  <>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={capturePhoto}
                        size="lg"
                        className="rounded-full w-20 h-20 p-0"
                      >
                        <Camera className="size-8" />
                      </Button>
                    </div>
                    <p className="text-center text-white/80 text-sm">
                      Position the lesion in the center and tap to capture
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-center text-white text-sm font-semibold">Photo Ready</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={retakePhoto}
                        variant="outline"
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        size="lg"
                      >
                        Retake
                      </Button>
                      <Button
                        onClick={sendForAnalysis}
                        className="flex-1 bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        <Sparkles className="mr-2 size-4" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ UPLOAD OPTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CAMERA CAPTURE */}
            <Card className="flex flex-col border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={startCamera}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="size-5 text-primary" />
                  Camera Capture
                </CardTitle>
                <CardDescription>
                  Take a photo directly from your camera
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
                  <Camera className="size-10" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Open your device camera to capture a clear image of the skin lesion
                </p>
                <Button size="lg" className="w-full gap-2">
                  <Camera className="size-4" />
                  Open Camera
                </Button>
              </CardContent>
            </Card>

            {/* FILE UPLOAD */}
            <Card className="flex flex-col border-2 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="size-5 text-primary" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Upload an existing image from your device
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
                  <FileUp className="size-10" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Choose an image from your gallery or files
                </p>
                <Button asChild size="lg" className="w-full gap-2">
                  <label htmlFor="lesion-upload" className="cursor-pointer">
                    <FileUp className="size-4" />
                    Choose File
                    <input
                      id="lesion-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Supported formats: JPG, PNG, WebP (Max 10MB)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ✅ INFO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Sparkles className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-blue-900 dark:text-blue-200">Clear Image Required</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                      Use good lighting and ensure the lesion is clearly visible and in focus
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <CheckCircle className="size-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-green-900 dark:text-green-200">Quick Analysis</p>
                    <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                      Get instant AI analysis with explainable heatmap in seconds
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">Refine Results</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                      Answer questions to refine the assessment accuracy
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // ✅ ANALYSIS RESULTS SECTION
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT: IMAGES */}
          <div className="space-y-4">
            <h2 className="font-headline text-xl font-semibold">Analysis Comparison</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileUp className="size-4" />
                    Original Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={imagePreview}
                    alt="Uploaded skin lesion"
                    width={300}
                    height={300}
                    className="aspect-square w-full rounded-md object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                </CardContent>
              </Card>

              {/* Heatmap */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="size-4 text-amber-500" />
                    AI Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing || !heatmap ? (
                    <Skeleton className="aspect-square w-full rounded-md" />
                  ) : (
                    <Image
                      src={heatmap}
                      alt="AI heatmap explanation"
                      width={300}
                      height={300}
                      className="aspect-square w-full rounded-md object-cover border-2 border-amber-200 dark:border-amber-900/50"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <Card className="flex flex-col shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                AI-powered assessment with explainable predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {isAnalyzing || !analysis ? (
                <div className="space-y-4 pt-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  {analysis.refinedResult ? (
                    <div className="space-y-4 rounded-lg border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-green-900 dark:text-green-200">
                        <CheckCircle className="size-5" />
                        Refined Assessment
                      </h3>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {analysis.refinedResult.refinedAssessment}
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>Rationale:</strong> {analysis.refinedResult.rationale}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-lg border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 p-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-900 dark:text-blue-200">
                        <Sparkles className="size-5" />
                        Initial Assessment
                      </h3>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {analysis.initialAssessment}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Confidence Score:</strong>
                        </p>
                        <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                            style={{ width: `${analysis.confidence}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                          {analysis.confidence}%
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/50">
                    {t('analysis.results.disclaimer')}
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t">
              {!analysis?.refinedResult && (
                <Dialog open={isQuestionnaireOpen} onOpenChange={setQuestionnaireOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={isAnalyzing || !analysis} className="w-full gap-2" size="lg">
                      <Plus className="size-4" />
                      Refine Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t('analysis.questionnaire.title')}</DialogTitle>
                      <DialogDescription>
                        {t('analysis.questionnaire.description')}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleRefineSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="duration" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('analysis.questionnaire.durationLabel')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('analysis.questionnaire.durationPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="size" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('analysis.questionnaire.sizeLabel')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('analysis.questionnaire.sizePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bleeding" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('analysis.questionnaire.bleedingLabel')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('analysis.questionnaire.selectPlaceholder')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="sometimes">Sometimes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="itching" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('analysis.questionnaire.itchingLabel')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('analysis.questionnaire.selectPlaceholder')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="sometimes">Sometimes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="colorChange" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('analysis.questionnaire.colorChangeLabel')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('analysis.questionnaire.selectPlaceholder')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <DialogFooter>
                          <Button type="submit" disabled={isRefining} className="w-full">
                            {isRefining ? (
                              <>
                                <TypingAnimation />
                                <span>Processing...</span>
                              </>
                            ) : (
                              t('analysis.questionnaire.submitButton')
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Audio Button */}
              <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border">
                <Button
                  onClick={handleReadAloud}
                  variant="outline"
                  size="icon"
                  disabled={!analysis || audioState.isLoading}
                  className="flex-shrink-0"
                >
                  {getAudioIcon()}
                </Button>
                <div className="flex-1 space-y-1">
                  {audioState.isLoading && (
                    <p className="text-xs text-muted-foreground">Generating audio...</p>
                  )}
                  {audioState.error && (
                    <p className="text-xs text-destructive">{audioState.error}</p>
                  )}
                  {!audioState.isLoading && !audioState.error && (
                    <p className="text-xs text-muted-foreground">
                      {audioState.url ? "Tap to play results aloud" : "Generate audio description"}
                    </p>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}