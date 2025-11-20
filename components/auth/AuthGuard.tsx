"use client";

import React, { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function AuthGuardInner({ children, fallback }: AuthGuardProps) {
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
        <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/30 blur-xl" />
            <Image
              src="/logo.svg"
              alt="Ayor Landing Pages logo"
              width={64}
              height={64}
              className="relative size-14 animate-pulse"
              priority
            />
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  return (
    <Suspense
      fallback={
        fallback ?? (
          <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/30 blur-xl" />
              <Image
                src="/logo.svg"
                alt="Ayor Landing Pages logo"
                width={64}
                height={64}
                className="relative size-14 animate-pulse"
                priority
              />
            </div>
          </div>
        )
      }
    >
      <AuthGuardInner fallback={fallback}>{children}</AuthGuardInner>
    </Suspense>
  );
}

