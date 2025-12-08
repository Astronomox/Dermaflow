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
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              {item.icon}
              <span>{item.label}</span>
            </Link>

          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      <div className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider group-data-[collapsible=icon]:hidden">
        {t('sidebar.sparkFeatures')}
      </div>
       <div className="relative mx-2 rounded-lg bg-primary/10 p-2 shadow-inner group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none">
        <div className="absolute -inset-2 -z-10 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 group-data-[collapsible=icon]:hidden" />
        {newNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href)}
              tooltip={item.label}
              className="bg-transparent hover:bg-primary/20 data-[active=true]:bg-primary/20"
            >
              <Link href={item.href}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </div>
    </SidebarMenu>
  );
}

    