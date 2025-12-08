'use client';

import { AuthLayout } from '@/components/layout/auth-layout';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  Languages,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import Logo from '@/components/icons/logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LogoutButton } from '@/components/auth/logout-button';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  // 🔍 DEBUG: Log user state changes
  useEffect(() => {
    console.log('🔍 [DASHBOARD] Current user state:', {
      displayName: user?.displayName || 'No displayName',
      email: user?.email || 'No email',
      uid: user?.uid || 'No uid',
      photoURL: user?.photoURL || 'No photoURL',
      isLoading: user === undefined, // undefined = loading
      userExists: !!user
    });
  }, [user]);

  const userAvatar = user?.photoURL || PlaceHolderImages.find((p) => p.id === 'user-avatar')?.imageUrl;
  const userName = user?.displayName || 'Gabriel Idahosa'; // ✅ Real Firebase username
  const userEmail = user?.email || 'gabriel.idahosa@example.com';

  // 🔍 DEBUG: Log final display values
  console.log('📊 [DASHBOARD] Display values:', {
    finalUserName: userName,
    finalUserEmail: userEmail,
    finalUserAvatar: userAvatar ? '✅ Has avatar' : '❌ No avatar'
  });

  return (
    <AuthLayout>
      <SidebarProvider>
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo className="size-7 text-primary" />
              <span className="font-headline text-lg font-bold text-primary">
                Dermaflow AI
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-12 w-full justify-start gap-2 px-2">
                  <Avatar className="size-8">
                    {userAvatar ? (
                      <AvatarImage src={userAvatar} alt={`${userName} avatar`} />
                    ) : (
                      <AvatarFallback>
                        {userName ? userName.charAt(0).toUpperCase() : 'GI'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      <a href={`mailto:${userEmail}`}>{userEmail}</a>
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:justify-end">
            <SidebarTrigger className="sm:hidden" />
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button variant="ghost" size="icon">
                <Bell className="size-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthLayout>
  );
}
