import Link from 'next/link';
import { ArrowRight, Bot, HeartPulse, Microscope, TestTube2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/icons/logo';

export default function LandingPage() {
  const features = [
    {
      icon: <Microscope className="size-8 text-primary" />,
      title: 'Instant Skin Analysis',
      description: 'Upload a photo of a skin lesion and get an instant AI-powered analysis and risk assessment.',
    },
    {
      icon: <TestTube2 className="size-8 text-primary" />,
      title: 'Explainable AI',
      description: "Understand the 'why' behind the analysis with heatmap visualizations highlighting areas of concern.",
    },
    {
      icon: <UserCheck className="size-8 text-primary" />,
      title: 'Personalized Care',
      description: 'Receive custom hygiene tips, dietary advice, and product recommendations tailored to your skin.',
    },
    {
      icon: <Bot className="size-8 text-primary" />,
      title: 'Ask a Bio-LLM',
      description: 'Get answers to your dermatology questions from a medical-trained AI, with verified information.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold text-primary">Dermaflow AI</h1>
        </Link>
        <Button asChild>
          <Link href="/login">
            Go to App <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-32 lg:py-40">
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Your Personal Skin Health Companion
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Leverage the power of AI to analyze skin conditions, receive personalized recommendations, and take control of your dermatological health.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-background py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Advanced Features for Proactive Care
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-lg">
                Dermaflow AI provides a suite of tools designed for comprehensive skin wellness.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Onco-Connect Section */}
        <section className="w-full bg-muted/50 py-12 md:py-24 lg:py-32">
          <div className="container mx-auto grid items-center gap-10 px-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Onco-Connect
              </div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Connecting You to Care
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Our Triage System helps you take the next step. Generate a digital referral card and find verified oncology centers near you, bridging the gap between digital assessment and professional medical consultation.
              </p>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-primary/5 p-12">
                <HeartPulse className="size-32 text-primary" strokeWidth={1.5}/>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <span className="font-headline text-lg font-bold">Dermaflow AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dermaflow AI. For informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}