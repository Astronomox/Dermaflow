"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!isUserLoading && !user) {

      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  // While checking auth, show a loading screen.
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, render the children (the dashboard).
  if (user) {
    return <>{children}</>;
  }

  // If no user and not loading (i.e., redirecting), return null.
  return null;
}
