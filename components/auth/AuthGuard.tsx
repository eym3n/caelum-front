"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, initialized, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = React.useState(false);

  React.useEffect(() => {
    if (!initialized || loading) return;
    if (pathname?.startsWith("/auth")) return;
    if (!user) {
      setRedirecting(true);
      const params = new URLSearchParams();
      if (pathname && pathname !== "/") {
        const currentQuery = searchParams?.toString();
        const nextValue = currentQuery ? `${pathname}?${currentQuery}` : pathname;
        params.set("next", nextValue);
      }
      router.replace(`/auth${params.size ? `?${params.toString()}` : ""}`);
    }
  }, [initialized, loading, pathname, router, searchParams, user]);

  if (!initialized || loading || redirecting) {
    return (
      fallback ?? (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background text-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking authentication…</p>
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

