"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, getAuth } from "firebase/auth";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const auth = getAuth();
      await signOut(auth);
      toast({
        title: t('auth.logout.toast.successTitle'),
      });
      router.push("/login");
    });
  };

  return (
    <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>{t('auth.logout.buttonText')}</span>
    </DropdownMenuItem>
  );
}
