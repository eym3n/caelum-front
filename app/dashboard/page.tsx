"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Factory, FileCode, Flame, Loader2, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLandingPages } from "@/hooks/useLandingPages";
import type { LandingPageRecord } from "@/lib/types/landing-page";

function formatDate(input?: string | null) {
  if (!input) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(input));
  } catch {
    return input;
  }
}

function statusVariant(status: LandingPageRecord["status"]) {
  switch (status) {
    case "generated":
      return "default";
    case "failed":
      return "destructive";
    case "generating":
      return "secondary";
    default:
      return "outline";
  }
}

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { items, loading, error, refresh } = useLandingPages({ pageSize: 50 });

  const latest = React.useMemo(() => items.slice(0, 5), [items]);
  const generatedCount = React.useMemo(
    () => items.filter((page) => page.status === "generated").length,
    [items]
  );
  const generatingCount = React.useMemo(
    () => items.filter((page) => page.status === "generating" || page.status === "pending").length,
    [items]
  );
  const failedCount = React.useMemo(
    () => items.filter((page) => page.status === "failed").length,
    [items]
  );

  return (
    <div className="space-y-8">
      <Card
        className="relative overflow-hidden border border-border/40 text-white [--strip-alpha:0.96] dark:[--strip-alpha:0.6]"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(124,58,237,var(--strip-alpha)), rgba(67,176,255,var(--strip-alpha)), rgba(34,211,238,var(--strip-alpha)))",
        }}
      >
        <div
          className="absolute inset-0 animate-gradient opacity-80"
          style={{ backgroundImage: "inherit" }}
        />
        <div className="absolute inset-0 hidden dark:block bg-black/30" />
        <div className="relative z-10 flex flex-col gap-8 overflow-hidden rounded-xl px-8 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80">Ayor Landing Pages Studio</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {user?.full_name?.length ? `Welcome back, ${user.full_name}` : "Welcome back"}
            </h1>
            <p className="text-sm text-white/80 lg:text-base">
              Craft conversion-ready landing pages in minutes. Launch a new build or revisit your existing
              sessions to keep iterating.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 text-sm font-semibold text-purple-700 hover:bg-white/90"
              >
                <Link href="/create">Create landing page</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/50 bg-white/10 px-8 text-sm font-semibold text-white hover:bg-white/20"
              >
                <Link href="/dashboard/landing-pages">View landing pages</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-52 w-full max-w-md shrink-0 overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-inner">
            <Image
              src="/landing-page-cta.png"
              alt="Landing page preview"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden border border-border/70 bg-card/70">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <p className="text-sm text-muted-foreground">
                The five most recent landing pages created by your team.
              </p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading landing pages…
            </div>
          )}
          {!loading && error && (
            <div className="space-y-3 px-6 py-10 text-center text-sm text-destructive">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Try again
              </Button>
            </div>
          )}
          {!loading && !error && latest.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <Image
                src="/empty.png"
                alt="No recent activity"
                width={360}
                height={240}
                className="h-auto w-[280px] opacity-90 sm:w-[360px]"
                priority
              />
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              <p className="text-xs text-muted-foreground/80">
                Create or update a landing page to see it appear here.
              </p>
            </div>
          )}
          {!loading && !error && latest.length > 0 && (
            <div className="divide-y divide-border/70">
              {latest.map((page) => (
                <div
                  key={page.id}
                  className="grid gap-4 px-6 py-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Session <span className="font-mono text-xs text-muted-foreground">{page.session_id}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Updated {formatDate(page.updated_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(page.status)} className="text-xs capitalize">
                      {page.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {page.deployment_url ? (
                      <Link
                        href={page.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        View deployment <ExternalLink className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="italic text-muted-foreground/80">Deployment pending</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/builder/${encodeURIComponent(page.session_id)}`}>Open builder</Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      disabled={!page.deployment_url}
                      variant={page.deployment_url ? "secondary" : "outline"}
                    >
                      <Link
                        href={page.deployment_url || "#"}
                        target={page.deployment_url ? "_blank" : undefined}
                        rel="noopener noreferrer"
                      >
                        Visit site
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="border border-border/70 bg-card/70 p-6">
          <h2 className="text-lg font-semibold">Status snapshot</h2>
          <p className="text-sm text-muted-foreground">Live view of deployment readiness.</p>
          <div className="mt-6 space-y-4">
            <StatusPill
              label="Ready & deployed"
              value={generatedCount}
              total={items.length}
              tone="success"
            />
            <StatusPill
              label="Generating"
              value={generatingCount}
              total={items.length}
              tone="default"
            />
            <StatusPill label="Requires retry" value={failedCount} total={items.length} tone="alert" />
          </div>
          <Separator className="my-5" />
          <Button asChild size="sm" className="w-full">
            <Link href="/dashboard/landing-pages">
              View all landing pages
              <ExternalLink className="ml-2 size-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "success" | "alert" | "default";
}) {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{percentage}% of total sessions</p>
      </div>
      <Badge
        variant={tone === "success" ? "secondary" : tone === "alert" ? "destructive" : "outline"}
        className="min-w-[3rem] justify-center rounded-full text-sm"
      >
        {value}
      </Badge>
    </div>
  );
}

