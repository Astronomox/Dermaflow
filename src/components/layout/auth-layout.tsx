"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { DermaFlowSpinner } from "@/components/ui/dermaflow-spinner";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#FFF8F0' }}>
        <DermaFlowSpinner size={48} label="Loading your dashboard..." />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
