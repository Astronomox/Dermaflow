"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Microscope,
  Sparkles,
  MessageSquareQuote,
  Map,
  ThermometerSun,
  Stethoscope,
  Network,
  Orbit,
} from "lucide-react";
import { useTranslation } from "@/context/language-context";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t('sidebar.dashboard'), icon: <Home /> },
    { href: "/dashboard/analysis", label: t('sidebar.skinAnalysis'), icon: <Microscope /> },
    {
      href: "/dashboard/recommendations",
      label: t('sidebar.recommendations'),
      icon: <Sparkles />,
    },
    {
      href: "/dashboard/ask-ai",
      label: t('sidebar.askBioLLM'),
      icon: <MessageSquareQuote />,
    },
    { href: "/dashboard/triage", label: t('sidebar.oncoConnect'), icon: <Map /> },
  ];

  const newNavItems = [
      { href: "/dashboard/uv-risk", label: t('sidebar.uvEnvironment'), icon: <ThermometerSun /> },
      { href: "/dashboard/tele-derm", label: t('sidebar.teleDermHub'), icon: <Stethoscope /> },
      { href: "/dashboard/genetic-risk", label: t('sidebar.geneticRisk'), icon: <Network /> },
      { href: "/dashboard/digital-twin", label: t('sidebar.digitalTwin'), icon: <Orbit /> },
  ];

  return (
    <SidebarMenu className="gap-2">
      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest group-data-[collapsible=icon]:hidden">
        Main
      </div>
      <div className="flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.label}
                className={`transition-all duration-200 rounded-md py-5 ${
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <div className={`${isActive ? "text-primary" : "opacity-80"}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </div>

      <div className="mt-4 px-4 py-2 text-xs font-semibold text-primary/80 uppercase tracking-widest flex items-center gap-2 group-data-[collapsible=icon]:hidden">
        <Sparkles className="size-3" />
        {t('sidebar.sparkFeatures')}
      </div>
      <div className="relative mx-2 rounded-xl bg-gradient-to-b from-primary/5 to-transparent p-2 border border-primary/10 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none">
        <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-data-[collapsible=icon]:hidden" />
        <div className="flex flex-col gap-1">
          {newNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={`transition-all duration-200 rounded-md py-4 ${
                    isActive
                      ? "bg-primary/20 text-primary shadow-sm"
                      : "bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <div className={`${isActive ? "text-primary" : "opacity-70"}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </div>
      </div>
    </SidebarMenu>
  );
}

    