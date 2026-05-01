"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, User, Sparkles, AlertCircle, ChevronDown, Trash2 } from "lucide-react";
import { medicalQuestionAnswering } from "@/ai/flows/medical-question-answering";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/language-context";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

type Message = {
  role: "user" | "ai";
  text: string;
  answer?: string;
  recommendation?: string;
  timestamp?: string;
};

// ✅ COMPACT MEDICAL DISCLAIMER
const MedicalDisclaimer = () => (
  <div className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
    <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
      <span className="font-semibold">Disclaimer:</span> AI responses are educational only. 
      Not a substitute for professional medical advice. Consult a dermatologist for diagnosis.
    </p>
  </div>
);

// ✅ TYPING ANIMATION FOR AI RESPONSE
const TypingAnimation = () => (
  <div className="flex items-center gap-1.5 px-2 py-1">
    <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

// ✅ COLLAPSIBLE RECOMMENDATION COMPONENT
const AIMessage = ({ message, t }: { message: Message; t: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex items-start gap-4 justify-start w-full">
      <Avatar className="size-10 border border-primary/20 shadow-sm flex-shrink-0 mt-1">
        <AvatarFallback className="bg-card text-primary font-bold">
          <Bot className="size-5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[85%] space-y-2">
        {/* Main Answer */}
        <div className="bg-card border shadow-sm rounded-2xl rounded-tl-sm px-5 py-4">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {message.answer || message.text}
          </p>
        </div>

        {/* ✅ Collapsible Recommendation Section */}
        {message.recommendation && (
          <div className="bg-primary/5 rounded-xl border border-primary/20 overflow-hidden shadow-sm transition-all duration-200">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t('askAi.recommendationPrefix') || 'Clinical Recommendation'}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-primary transition-transform duration-300",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded && (
              <div className="px-4 py-4 border-t border-primary/10 bg-background/50">
                <p className="text-[14px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {message.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AskAiPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ LOAD CHAT HISTORY ON MOUNT
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadChatHistory(user.uid);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ LOAD CHAT FROM FIRESTORE
  const loadChatHistory = async (uid: string) => {
    try {
      const db = getFirestore();
      const chatRef = doc(db, 'users', uid, 'data', 'chatHistory');
      const snapshot = await getDoc(chatRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setMessages(data.messages || []);
        console.log('✅ [CHAT-HISTORY] Loaded', data.messages?.length || 0, 'messages');
      } else {
        console.log('📝 [CHAT-HISTORY] No history found, starting fresh');
      }
    } catch (error) {
      console.error('💥 [CHAT-HISTORY] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SAVE CHAT TO FIRESTORE
  const saveChatHistory = async (updatedMessages: Message[]) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const db = getFirestore();
      const chatRef = doc(db, 'users', userId, 'data', 'chatHistory');
      
      await setDoc(chatRef, {
        messages: updatedMessages,
        lastUpdated: new Date().toISOString(),
        totalMessages: updatedMessages.length,
      }, { merge: true });

      console.log('✅ [CHAT-HISTORY] Saved', updatedMessages.length, 'messages to Firestore');
    } catch (error) {
      console.error('💥 [CHAT-HISTORY] Save error:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Couldn't save chat history. Try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ DELETE CHAT HISTORY
  const handleDeleteChat = async () => {
    if (!userId) return;

    // In-app confirmation with toast
    const { dismiss } = toast({
      title: "Delete Chat History?",
      description: "This action cannot be undone. All conversations will be permanently removed.",
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              setIsDeleting(true);
              try {
                const db = getFirestore();
                const chatRef = doc(db, 'users', userId, 'data', 'chatHistory');
                
                await deleteDoc(chatRef);
                setMessages([]);
                
                console.log('✅ [CHAT-HISTORY] Deleted all messages');
                dismiss();
                toast({
                  title: "✓ Chat Cleared",
                  description: "All chat history has been deleted successfully.",
                });
              } catch (error) {
                console.error('💥 [CHAT-HISTORY] Delete error:', error);
                toast({
                  variant: "destructive",
                  title: "Delete Failed",
                  description: "Couldn't delete chat history. Try again later.",
                });
              } finally {
                setIsDeleting(false);
              }
            }}
          >
            Delete All
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => dismiss()}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const handleSend = async () => {
    if (input.trim() === "" || isGenerating) return;

    const userMessage: Message = {
      role: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsGenerating(true);

    try {
      // ✅ GET CURRENT LANGUAGE AND PASS TO AI
      const currentLanguage = localStorage.getItem('language') || 'en';
      
      // Pass the previous messages as history (limit to last 10 to avoid token limits)
      const historyToPass = messages.slice(-10).map(m => ({ role: m.role, text: m.text }));

      const result = await medicalQuestionAnswering({ 
        question: input,
        history: historyToPass,
        language: currentLanguage 
      });

      const aiMessage: Message = {
        role: "ai",
        text: result.answer,
        answer: result.answer,
        recommendation: result.recommendation,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // ✅ Save to Firestore
      if (userId) {
        await saveChatHistory(updatedMessages);
      }
    } catch (error) {
      console.error("AI question answering failed:", error);
      toast({
        variant: "destructive",
        title: t('askAi.toast.errorTitle'),
        description: t('askAi.toast.errorDesc'),
      });
      setMessages(newMessages.slice(0, -1));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 0);
      }
    }
  }, [messages, isGenerating]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col space-y-8">
        <PageHeader
          title={t('askAi.pageHeader.title')}
          subtitle={t('askAi.pageHeader.subtitle')}
        />
        <Card className="flex flex-1 flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <TypingAnimation />
            </div>
            <p className="text-muted-foreground">Loading your chat history...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <PageHeader
        title={t('askAi.pageHeader.title')}
        subtitle={t('askAi.pageHeader.subtitle')}
      />
      <Card className="flex flex-1 flex-col shadow-xl border-border bg-card overflow-hidden">
        <CardHeader className="border-b bg-secondary/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-lg flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Bot className="size-5 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span>{t('askAi.cardTitle')}</span>
                <span className="text-xs font-normal text-muted-foreground">Medical Assistant powered by AI</span>
              </div>
              {isSaving && (
                <span className="ml-4 text-xs font-medium text-muted-foreground flex items-center gap-1.5 bg-background px-2 py-1 rounded-full border shadow-sm">
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-primary"></div>
                  Saving...
                </span>
              )}
            </CardTitle>
            {/* ✅ DELETE CHAT BUTTON */}
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteChat}
                disabled={isDeleting}
                className="text-destructive border-destructive/20 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-2" />
                {isDeleting ? "Clearing..." : "Clear Chat"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-6 py-6" ref={scrollAreaRef}>
            <div className="space-y-8 pb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 text-center space-y-6">
                  <div className="p-4 rounded-full bg-primary/10 mb-2">
                    <Bot className="size-12 text-primary opacity-80" />
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-semibold text-foreground">
                      {t('askAi.emptyState.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                      {t('askAi.emptyState.example')}
                    </p>
                  </div>
                  <div className="w-full max-w-md mt-8">
                    <MedicalDisclaimer />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8 w-full max-w-xl mx-auto opacity-75">
                    <MedicalDisclaimer />
                  </div>
                  {messages.map((message, index) => (
                    <div key={index} className="flex flex-col w-full">
                      {message.role === "user" ? (
                        <div className="flex items-start gap-4 justify-end w-full">
                          <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-5 py-3 bg-primary text-primary-foreground shadow-md">
                            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.text}</p>
                          </div>
                          <Avatar className="size-10 border-2 border-primary/20 shadow-sm flex-shrink-0 mt-1">
                            <AvatarFallback className="bg-background text-primary">
                              <User className="size-5" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <AIMessage message={message} t={t} />
                      )}
                    </div>
                  ))}

                  {/* ✅ GENERATING ANIMATION */}
                  {isGenerating && (
                    <div className="flex items-start gap-4 justify-start w-full">
                      <Avatar className="size-10 border border-primary/20 shadow-sm flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-card text-primary font-bold">
                          <Bot className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-card border shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                        <TypingAnimation />
                        <span className="text-[14px] text-muted-foreground font-medium">Analyzing medical guidelines...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t bg-secondary/10 p-4">
          <div className="relative w-full max-w-4xl mx-auto flex items-end gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t('askAi.inputPlaceholder')}
                className="pr-12 py-6 text-md rounded-xl bg-background border-input shadow-sm focus-visible:ring-primary"
                disabled={isGenerating}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0 shadow-md transition-transform active:scale-95"
              onClick={handleSend}
              disabled={isGenerating || input.trim() === ""}
            >
              <Send className="size-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}