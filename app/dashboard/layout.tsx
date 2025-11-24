"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  LogOut,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users2,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const generalNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/landing-pages", label: "Landing Pages", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const collaborationNav = [
  { href: "#", label: "Team", icon: Users2 },
];

const analyticsNav = [
  { href: "#", label: "Performance", icon: LineChart },
];

const supportNav = [
  { href: "#", label: "Help Center", icon: LifeBuoy },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <AuthGuard>
      <SidebarProvider
        style={{ "--sidebar-width": "256px" } as React.CSSProperties}
      >
        <div className="flex min-h-screen w-full bg-sidebar">
          <Sidebar className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="px-4 py-6">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <Image
                  src="/logo.svg"
                  alt="Ayor Landing Pages logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="font-bold text-lg tracking-tight text-sidebar-foreground">Ayor</span>
              </Link>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="h-9 w-full rounded-lg bg-muted/50 pl-9 text-sm border-input focus:border-primary focus:ring-primary"
                />
              </div>
            </SidebarHeader>
            <SidebarContent className="px-3">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {generalNav.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`h-10 gap-3 rounded-lg px-3 font-medium transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`}
                          >
                            <Link href={item.href}>
                              <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Collaboration</p>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {collaborationNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            asChild
                            className="h-10 gap-3 rounded-lg px-3 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <Link href={item.href}>
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tools</p>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {analyticsNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            asChild
                            className="h-10 gap-3 rounded-lg px-3 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <Link href={item.href}>
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
               <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-indigo-300 p-[2px]">
                    <div className="h-full w-full rounded-full bg-sidebar p-[2px]">
                         <div className="flex h-full w-full items-center justify-center rounded-full bg-muted font-bold text-primary">
                            {(user?.full_name || user?.email || "U").slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar bg-green-500"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.full_name || "User"}</p>
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-[#5D56E0] px-1.5 py-0.5 text-[10px] font-bold text-white">PRO</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="text-lg font-bold text-primary align-middle mr-1">&infin;</span>
                        <span> credits</span>
                    </div>
                  </div>
               </div>
               <div className="mt-2">
                  <SidebarMenuButton onClick={logout} className="w-full justify-center text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent">
                    <LogOut className="size-4 mr-2" />
                    <span>Sign out</span>
                  </SidebarMenuButton>
               </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="bg-gray-50 dark:bg-background transition-colors duration-200">
            <div className="flex min-h-screen flex-1 flex-col">
               <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-8 sticky top-0 z-10">
                   <div className="flex items-center gap-4 md:hidden">
                        <SidebarTrigger />
                   </div>
                   <div className="flex flex-1 justify-end items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        >
                           {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                            <Bell className="h-5 w-5" />
                        </Button>
                   </div>
               </header>
              <main className="flex-1 px-8 py-6">{children}</main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
