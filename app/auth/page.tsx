"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

type Mode = "login" | "register";

function AuthHeader({ mode }: { mode: Mode }) {
  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Sign in to continue building stunning landing pages."
      : "Join Ayor Landing Pages and start crafting high-converting landing pages.";

  return (
    <div className="space-y-3 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        <span>AI-powered builder</span>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground max-w-[32ch] mx-auto">{subtitle}</p>
      </div>
    </div>
  );
}

function AuthForm() {
  const { login, register, loading, user, initialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = React.useState<Mode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const nextPath = React.useMemo(() => {
    const next = searchParams?.get("next");
    if (!next || next.startsWith("/auth")) return "/create";
    return next;
  }, [searchParams]);

  React.useEffect(() => {
    if (!initialized) return;
    if (user) {
      router.replace(nextPath);
    }
  }, [user, router, initialized, nextPath]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (mode === "login") {
        await login({ email, password });
        setSuccess("Signed in successfully. Redirecting…");
      } else {
        await register({ email, password, fullName });
        setSuccess("Account created. Redirecting…");
      }
      router.replace(nextPath);
    } catch (err: any) {
      console.error("[auth] failed", err);
      setError(err?.message || "Something went wrong. Please try again.");
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError(null);
    setSuccess(null);
  };

  const isSubmitDisabled = loading || !email || !password || (mode === "register" && !fullName);

  return (
    <>
      <AuthHeader mode={mode} />
      <Card className="border-border/70 bg-card/70 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ada Lovelace"
                required={mode === "register"}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === "login" && (
                <span className="text-xs text-muted-foreground">Minimum 8 characters</span>
              )}
            </div>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitDisabled}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </Card>

      <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-center text-sm text-muted-foreground backdrop-blur">
        {mode === "login" ? (
          <>
            Need an account?{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-primary hover:underline"
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none fixed -top-48 -left-48 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(114,105,248,0.22),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none fixed -bottom-60 -right-48 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(114,105,248,0.16),transparent_60%)] blur-3xl" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="mb-10 flex items-center gap-2 text-sm font-semibold text-foreground/80">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            Ayor Landing Pages
          </Link>
        </div>
        <div className="grid w-full max-w-md gap-6">
          <Suspense fallback={<div className="h-96" />}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

