"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/language-context";
import Logo from "@/components/icons/logo";
import { initiateEmailSignIn } from "@/firebase";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      initiateEmailSignIn(
        values.email,
        values.password,
        () => {
          // onSuccess
          toast({
            title: t('auth.login.toast.successTitle'),
            description: t('auth.login.toast.successDescription'),
          });
          router.push("/dashboard");
        },
        (error) => {
          // onError - Updated with detailed logging and comprehensive error handling
          console.error('Full login error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          let errorMessage = t('auth.login.toast.errorDescription');
          if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
          }
          
          toast({
            variant: "destructive",
            title: t('auth.login.toast.errorTitle'),
            description: errorMessage,
          });
        }
      );
    });
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <Logo className="size-8 text-primary" />
              <h1 className="font-headline text-2xl font-bold text-primary">
                Dermaflow AI
              </h1>
            </Link>
            <h1 className="text-3xl font-bold">{t('auth.login.title')}</h1>
            <p className="text-balance text-muted-foreground">
              {t('auth.login.subtitle')}
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.form.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.form.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 animate-spin" />}
                {t('auth.login.buttonText')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('auth.login.noAccount')}{" "}
            <Link href="/signup" className="underline">
              {t('auth.login.signUpLink')}
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1581092912252-2516428a1b32?q=80&w=1974"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="medical technology lab"
        />
      </div>
    </div>
  );
}
