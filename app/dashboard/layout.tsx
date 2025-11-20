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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-sidebar">
          <Sidebar collapsible="icon" className="bg-background">
            <SidebarHeader className="px-3 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full">
                  <Image
                    src="/logo.svg"
                    alt="Ayor Landing Pages logo"
                    width={28}
                    height={28}
                    className="size-7 object-contain"
                  />
                </span>
                <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="text-xs tracking-wider text-muted-foreground">Ayor Landing Pages</span>
                </div>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>General</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {generalNav.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link href={item.href}>
                              <Icon className="size-4" />
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
                <SidebarGroupLabel>Collaboration</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {collaborationNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton asChild>
                            <Link href={item.href}>
                              <Icon className="size-4" />
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
                <SidebarGroupLabel>Tools</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {analyticsNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton asChild>
                            <Link href={item.href}>
                              <Icon className="size-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>Support</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {supportNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton asChild>
                            <Link href={item.href}>
                              <Icon className="size-4" />
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
            <SidebarFooter className="border-t border-border/70">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild size="lg">
                    <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 px-3 py-2 text-left text-sm">
                      <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                        {(user?.full_name || user?.email || "U")
                          .trim()
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium leading-tight">{user?.full_name || user?.email}</span>
                        <span className="text-xs text-muted-foreground">Pro</span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={logout}>
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="bg-background">
            <div className="flex min-h-screen flex-1 flex-col">
              <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-sm">
                <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                  <SidebarTrigger className="text-muted-foreground" />
                  <Separator orientation="vertical" className="hidden h-5 md:block" />
                  <div className="relative flex flex-1 items-center">
                    <Search className="absolute left-3 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns, sessions, or commands..."
                      className="h-10 w-full max-w-md rounded-xl bg-muted/40 pl-10 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      aria-label="Toggle theme"
                    >
                      {mounted ? (
                        theme === "light" ? (
                          <Moon className="size-4" />
                        ) : (
                          <Sun className="size-4" />
                        )
                      ) : (
                        <Sun className="size-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Bell className="size-4" />
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </div>
                </div>
              </header>
              <main className="flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">{children}</main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

