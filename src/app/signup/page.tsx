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
import { initiateEmailSignUp } from "@/firebase";

const formSchema = z
  .object({
    email: z.string().email("Invalid email address."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(20, "Username must be less than 20 characters."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      initiateEmailSignUp(
        values.email,
        values.password,
        values.username,
        () => {
          // onSuccess

          toast({
            title: "Account created!",
            description: "Welcome to Dermaflow AI. Redirecting to dashboard...",
          });
          router.push("/dashboard");
        },
        (error: any) => {
          // onError
          console.error("💥 [DERMAFLOW-ERROR] Signup failed:", error);
          
          let errorMessage = "Failed to create account. Please try again.";
          
          if (error.code === "auth/email-already-in-use") {
            errorMessage = "This email is already registered. Please login instead.";
          } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email format. Please check your email address.";
          } else if (error.code === "auth/weak-password") {
            errorMessage = "Password is too weak. Please use a stronger password.";
          } else if (error.code === "auth/too-many-requests") {
            errorMessage = "Too many failed attempts. Please try again later.";
          }

          toast({
            variant: "destructive",
            title: "Signup Failed",
            description: errorMessage,
          });
        }
      );
    });
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1974"
          alt="Dermatology tools"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Logo className="size-8 text-primary" />
              <h1 className="font-headline text-2xl font-bold text-primary">
                Dermaflow AI
              </h1>
            </Link>
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to create your account.
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your username"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}