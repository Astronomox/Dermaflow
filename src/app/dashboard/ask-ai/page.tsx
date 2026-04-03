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
  <div className="flex items-center gap-1">
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

// ✅ COLLAPSIBLE RECOMMENDATION COMPONENT
const AIMessage = ({ message, t }: { message: Message; t: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex items-start gap-3 justify-start">
      <Avatar className="size-8 border flex-shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Bot className="size-5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-2xl space-y-2">
        {/* Main Answer */}
        <div className="bg-secondary rounded-lg px-4 py-3">
          <p className="whitespace-pre-wrap text-sm">
            {message.answer || message.text}
          </p>
        </div>

        {/* ✅ Collapsible Recommendation Section */}
        {message.recommendation && (
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50 overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-blue-900/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  {t('askAi.recommendationPrefix') || 'Recommendations'}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-blue-600 dark:text-blue-400 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded && (
              <div className="px-4 py-3 border-t border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
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
    <div className="flex h-[calc(100vh-10rem)] flex-col space-y-8">
      <PageHeader
        title={t('askAi.pageHeader.title')}
        subtitle={t('askAi.pageHeader.subtitle')}
      />
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="text-primary" />
              {t('askAi.cardTitle')}
              {isSaving && (
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  Saving...
                </span>
              )}
            </CardTitle>
            {/* ✅ DELETE CHAT BUTTON */}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteChat}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-2" />
                {isDeleting ? "Deleting..." : "Clear Chat"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-6 pr-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
                  <Bot className="size-16 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium text-muted-foreground">
                      {t('askAi.emptyState.title')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('askAi.emptyState.example')}
                    </p>
                  </div>
                  <div className="w-full max-w-md">
                    <MedicalDisclaimer />
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={index}>
                      {message.role === "user" ? (
                        <div className="flex items-start gap-3 justify-end">
                          <div className="max-w-xl rounded-lg px-4 py-3 bg-primary text-primary-foreground">
                            <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                          </div>
                          <Avatar className="size-8 border flex-shrink-0">
                            <AvatarFallback>
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
                    <div className="flex items-start gap-3 justify-start">
                      <Avatar className="size-8 border flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-xl rounded-lg px-4 py-3 bg-secondary flex items-center gap-2">
                        <TypingAnimation />
                        <span className="text-sm text-muted-foreground">Generating response...</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t">
                    <MedicalDisclaimer />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t pt-6">
          <div className="relative w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t('askAi.inputPlaceholder')}
              className="pr-12"
              disabled={isGenerating}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
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