"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, RefreshCw, FileEdit, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLandingPages } from "@/hooks/useLandingPages";
import type { LandingPageRecord } from "@/lib/types/landing-page";

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

export default function LandingPagesListPage() {
  const { items, loading, error, refresh } = useLandingPages({ pageSize: 50 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to overview
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">Landing Pages</h1>
          <p className="text-sm text-muted-foreground">
            Review everything you&apos;ve generated so far, jump back into the builder, or visit the live deployment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" className="gap-2">
            <Link href="/create">
              Create new landing page
              <FileEdit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching landing pages…
          </div>
        )}

        {!loading && error && (
          <div className="space-y-3 px-6 py-12 text-center text-sm text-destructive">
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={refresh}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0  animate-pulse rounded-full" />
              <Image
                src="/empty-landing-pages.webp"
                alt="No landing pages yet"
                width={820}
                height={520}
                className="relative max-w-[820px] rounded-3xl"
              />
            </div>
            <div className="space-y-3 max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight">Launch your first landing page</h2>
              <p className="text-sm text-muted-foreground">
                You haven’t generated any pages yet. Kick off a new build and let the AI assemble a polished,
                on-brand experience in minutes.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden rounded-full px-8 py-6 text-base font-semibold shadow-lg transition hover:scale-[1.02]"
            >
              <Link href="/create">
                <span className="absolute inset-0 animate-gradient bg-[linear-gradient(120deg,#7c3aed,#43b0ff,#22d3ee)] bg-[length:200%_200%] opacity-90" />
                <span className="relative text-primary-foreground">Create your first landing page</span>
              </Link>
            </Button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="hidden min-w-full divide-y divide-border/70 md:table">
            <div className="table-header-group bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <div className="table-row">
                <div className="table-cell px-6 py-3">Session ID</div>
                <div className="table-cell px-6 py-3">Status</div>
                <div className="table-cell px-6 py-3">Deployment</div>
                <div className="table-cell px-6 py-3">Updated</div>
                <div className="table-cell px-6 py-3 text-right">Actions</div>
              </div>
            </div>
            <div className="table-row-group">
              {items.map((page) => (
                <div key={page.id} className="table-row text-sm">
                  <div className="table-cell px-6 py-4 font-mono text-xs text-foreground">{page.session_id}</div>
                  <div className="table-cell px-6 py-4">
                    <Badge variant={statusVariant(page.status)} className="capitalize">
                      {page.status}
                    </Badge>
                  </div>
                  <div className="table-cell px-6 py-4">
                    {page.deployment_url ? (
                      <Link
                        href={page.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {page.deployment_url}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground/80">Pending deployment</span>
                    )}
                  </div>
                  <div className="table-cell px-6 py-4 text-xs text-muted-foreground">{formatDate(page.updated_at)}</div>
                  <div className="table-cell px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/builder/${encodeURIComponent(page.session_id)}`}>Edit</Link>
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
                          Visit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-border/70 md:hidden">
            {items.map((page) => (
              <div key={page.id} className="space-y-3 px-4 py-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-muted-foreground">Session {page.session_id}</div>
                  <Badge variant={statusVariant(page.status)} className="capitalize">
                    {page.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">Updated {formatDate(page.updated_at)}</div>
                <Separator className="my-2" />
                <div className="flex flex-col gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/builder/${encodeURIComponent(page.session_id)}`}>Edit in builder</Link>
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
                      Visit deployment
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

