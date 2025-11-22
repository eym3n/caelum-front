"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  ExternalLink,
  FileCode,
  Globe,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLandingPages } from "@/hooks/useLandingPages";
import type { LandingPageRecord } from "@/lib/types/landing-page";
import { cn } from "@/lib/utils";

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

function arrayFrom<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

const GRADIENT_PALETTES: Array<[string, string, string]> = [
  ["#7C3AED", "#4338CA", "#2563EB"],
  ["#F97316", "#EA580C", "#DB2777"],
  ["#0EA5E9", "#6366F1", "#8B5CF6"],
  ["#22C55E", "#10B981", "#14B8A6"],
  ["#F59E0B", "#EF4444", "#EC4899"],
  ["#9333EA", "#4C1D95", "#2563EB"],
  ["#14B8A6", "#06B6D4", "#3B82F6"],
  ["#F43F5E", "#EC4899", "#8B5CF6"],
];

const GRADIENT_ANGLES = ["130deg", "145deg", "160deg", "210deg"];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function gradientForName(name: string): React.CSSProperties {
  const hash = hashString(name || "landing-page");
  const palette = GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length];
  const angle = GRADIENT_ANGLES[Math.abs(hash) % GRADIENT_ANGLES.length];

  return {
    backgroundImage: `linear-gradient(${angle}, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
  };
}

function DetailsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
        {title}
      </h3>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

interface LandingPageCardProps {
  page: LandingPageRecord;
  expanded: boolean;
  onToggle: () => void;
}

function LandingPageCard({ page, expanded, onToggle }: LandingPageCardProps) {
  const productName =
    page.business_data?.campaign?.productName?.trim() || "Untitled landing page";
  const objective = page.business_data?.campaign?.objective?.trim() || null;
  const primaryOffer = page.business_data?.campaign?.primaryOffer?.trim() || null;
  const theme = page.business_data?.branding?.theme?.trim() || null;
  const personaKeywords = page.business_data?.audience?.personaKeywords ?? [];
  const audienceDescription = page.business_data?.audience?.description?.trim() || null;
  const uvp = page.business_data?.audience?.uvp?.trim() || null;
  const previewUrl = page.preview_url || page.deployment_url || null;
  const benefits = page.business_data?.benefits ?? {};
  const topBenefits = benefits.topBenefits ?? [];
  const features = benefits.features ?? [];
  const emotionalTriggers = benefits.emotionalTriggers ?? [];
  const trust = page.business_data?.trust ?? {};
  const objections = trust.objections ?? [];
  const trustTestimonials = trust.testimonials ?? [];
  const trustIndicators = trust.indicators ?? [];
  const conversion = page.business_data?.conversion ?? {};
  const messaging = page.business_data?.messaging ?? {};
  const advanced = page.business_data?.advanced ?? {};
  const formFields = advanced.formFields ?? [];
  const analytics = advanced.analytics ?? {};
  const sectionData = page.business_data?.branding?.sectionData as
    | Record<string, unknown>
    | undefined;
  const stats = arrayFrom<{ label?: string; value?: string; description?: string }>(
    sectionData?.["stats"]
  );
  const pricing = arrayFrom<{ name?: string; price?: string; features?: string[]; cta?: string }>(
    sectionData?.["pricing"]
  );
  const faq = arrayFrom<{ question?: string; answer?: string }>(sectionData?.["faq"]);
  const testimonialsRich = arrayFrom<{
    quote?: string;
    author?: string;
    role?: string;
    company?: string;
  }>(sectionData?.["testimonials"]);
  const hasPdf = Boolean(page.design_blueprint_pdf_url);
  const updatedAt = formatDate(page.updated_at);

  const gradientStyle = React.useMemo(() => gradientForName(productName), [productName]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  const renderList = React.useCallback(
    (items: string[], keyPrefix: string) => (
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${keyPrefix}-${index}`} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
    []
  );

  const detailSections: { key: string; node: React.ReactNode }[] = [];

  if (objective || primaryOffer || uvp) {
    detailSections.push({
      key: "campaign",
      node: (
        <DetailsSection title="Campaign overview">
          {objective && <p className="text-foreground">{objective}</p>}
          {primaryOffer && (
            <p className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              Offer: {primaryOffer}
            </p>
          )}
          {uvp && <p className="italic text-muted-foreground/90">UVP: {uvp}</p>}
        </DetailsSection>
      ),
    });
  }

  if (
    audienceDescription ||
    personaKeywords.length > 0 ||
    messaging.tone ||
    messaging.seoKeywords?.length ||
    messaging.eventTracking?.length
  ) {
    detailSections.push({
      key: "audience",
      node: (
        <DetailsSection title="Audience & Messaging">
          {audienceDescription && <p>{audienceDescription}</p>}
          {personaKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {personaKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="rounded-full text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
          {messaging.tone && (
            <p>
              <span className="font-medium text-foreground">Tone: </span>
              {messaging.tone}
            </p>
          )}
          {messaging.seoKeywords?.length ? (
            <div>
              <span className="font-medium text-foreground">SEO keywords</span>
              {renderList(messaging.seoKeywords, "seo")}
            </div>
          ) : null}
          {messaging.eventTracking?.length ? (
            <div>
              <span className="font-medium text-foreground">Tracked events</span>
              {renderList(messaging.eventTracking, "events")}
            </div>
          ) : null}
        </DetailsSection>
      ),
    });
  }

  if (topBenefits.length || features.length || emotionalTriggers.length) {
    detailSections.push({
      key: "value",
      node: (
        <DetailsSection title="Value proposition">
          {topBenefits.length ? (
            <div>
              <p className="font-medium text-foreground">Top benefits</p>
              {renderList(topBenefits, "benefits")}
            </div>
          ) : null}
          {features.length ? (
            <div>
              <p className="font-medium text-foreground">Key features</p>
              {renderList(features, "features")}
            </div>
          ) : null}
          {emotionalTriggers.length ? (
            <div>
              <p className="font-medium text-foreground">Emotional triggers</p>
              {renderList(emotionalTriggers, "emotions")}
            </div>
          ) : null}
        </DetailsSection>
      ),
    });
  }

  if (
    objections.length ||
    trustTestimonials.length ||
    trustIndicators.length ||
    testimonialsRich.length
  ) {
    detailSections.push({
      key: "trust",
      node: (
        <DetailsSection title="Trust & Proof">
          {trustIndicators.length ? (
            <div className="flex flex-wrap gap-2">
              {trustIndicators.map((indicator) => (
                <Badge key={indicator} variant="outline" className="rounded-full text-xs">
                  {indicator}
                </Badge>
              ))}
            </div>
          ) : null}
          {objections.length ? (
            <div>
              <p className="font-medium text-foreground">Top objections</p>
              {renderList(objections, "objections")}
            </div>
          ) : null}
          {trustTestimonials.length ? (
            <div>
              <p className="font-medium text-foreground">Testimonials</p>
              {renderList(trustTestimonials, "trust-testimonials")}
            </div>
          ) : null}
          {testimonialsRich.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {testimonialsRich.map((testimonial, index) => (
                <blockquote
                  key={`rich-testimonial-${index}`}
                  className="rounded-xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground"
                >
                  {testimonial.quote && (
                    <p className="text-foreground">“{testimonial.quote}”</p>
                  )}
                  <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground/80">
                    {[testimonial.author, testimonial.role, testimonial.company]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                </blockquote>
              ))}
            </div>
          ) : null}
        </DetailsSection>
      ),
    });
  }

  if (
    conversion.primaryCTA ||
    conversion.secondaryCTA ||
    conversion.primaryKPI ||
    formFields.length ||
    analytics.gtag ||
    analytics.rawIDs
  ) {
    detailSections.push({
      key: "conversion",
      node: (
        <DetailsSection title="Conversion setup">
          {conversion.primaryCTA && (
            <p>
              <span className="font-medium text-foreground">Primary CTA:</span>{" "}
              {conversion.primaryCTA}
            </p>
          )}
          {conversion.secondaryCTA && (
            <p>
              <span className="font-medium text-foreground">Secondary CTA:</span>{" "}
              {conversion.secondaryCTA}
            </p>
          )}
          {conversion.primaryKPI && (
            <p>
              <span className="font-medium text-foreground">Primary KPI:</span>{" "}
              {conversion.primaryKPI}
            </p>
          )}
          {formFields.length ? (
            <div>
              <p className="font-medium text-foreground">Form fields captured</p>
              {renderList(formFields, "forms")}
            </div>
          ) : null}
          {analytics.gtag || analytics.rawIDs ? (
            <div className="text-xs text-muted-foreground/90">
              {analytics.gtag && (
                <div>
                  <span className="font-medium text-foreground">Google Tag:</span>{" "}
                  {analytics.gtag}
                </div>
              )}
              {analytics.rawIDs && (
                <div>
                  <span className="font-medium text-foreground">Analytics IDs:</span>{" "}
                  {analytics.rawIDs}
                </div>
              )}
            </div>
          ) : null}
        </DetailsSection>
      ),
    });
  }

  if (stats.length) {
    detailSections.push({
      key: "stats",
      node: (
        <DetailsSection title="Performance stats">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={`stat-${index}`}
                className="rounded-xl border border-border/60 bg-card/60 p-4 text-center"
              >
                <p className="text-2xl font-semibold text-foreground">{stat.value || "—"}</p>
                {stat.label && (
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground/80">
                    {stat.label}
                  </p>
                )}
                {stat.description && (
                  <p className="mt-2 text-xs text-muted-foreground/90">{stat.description}</p>
                )}
              </div>
            ))}
          </div>
        </DetailsSection>
      ),
    });
  }

  if (pricing.length) {
    detailSections.push({
      key: "pricing",
      node: (
        <DetailsSection title="Pricing recommendations">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pricing.map((plan, index) => (
              <div
                key={`plan-${index}`}
                className="rounded-xl border border-border/60 bg-card/60 p-4"
              >
                <p className="text-sm font-semibold text-foreground">{plan.name || "Plan"}</p>
                {plan.price && (
                  <p className="text-lg font-medium text-primary">{plan.price}</p>
                )}
                {plan.features?.length ? (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {plan.features.map((feature, idx) => (
                      <li key={`feature-${index}-${idx}`} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {plan.cta && (
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">
                    {plan.cta}
                  </p>
                )}
              </div>
            ))}
          </div>
        </DetailsSection>
      ),
    });
  }

  if (faq.length) {
    detailSections.push({
      key: "faq",
      node: (
        <DetailsSection title="FAQs">
          <div className="space-y-3">
            {faq.map((item, index) => (
              <div
                key={`faq-${index}`}
                className="rounded-lg border border-border/60 bg-card/40 p-3"
              >
                {item.question && (
                  <p className="text-sm font-medium text-foreground">{item.question}</p>
                )}
                {item.answer && (
                  <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </DetailsSection>
      ),
    });
  }

  if (!detailSections.length) {
    detailSections.push({
      key: "empty",
      node: (
        <p className="text-sm text-muted-foreground">
          Enhanced business data for this landing page will appear once the build is completed.
        </p>
      ),
    });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-expanded={expanded}
      className={cn(
        "group relative rounded-2xl border border-border/70 bg-card/70 p-6 transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-0 hover:border-primary/50 hover:shadow-lg",
        expanded && "border-primary/60 bg-card"
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="w-full flex-shrink-0 lg:w-[280px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <div className="absolute inset-0" style={gradientStyle} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/70">Product</p>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold leading-tight">{productName}</h2>
                {(primaryOffer || objective) && (
                  <p className="text-sm text-white/85 line-clamp-3">
                    {primaryOffer || objective}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(page.status)} className="capitalize">
                  {page.status}
                </Badge>
                {theme && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/40 text-xs text-primary"
                  >
                    Theme: {theme}
                  </Badge>
                )}
              </div>
              {objective && (
                <p className="line-clamp-3 text-sm text-muted-foreground">{objective}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Updated {updatedAt}</span>
                {page.deployment_url && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Live deployment ready
                  </span>
                )}
              </div>
              {personaKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {personaKeywords.slice(0, 5).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="rounded-full text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {personaKeywords.length > 5 && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      +{personaKeywords.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300",
                expanded && "rotate-180"
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasPdf && (
              <Button
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <a
                  href={page.design_blueprint_pdf_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Design rationale PDF
                </a>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link
                href={`/builder/${encodeURIComponent(page.session_id)}`}
                onClick={(event) => event.stopPropagation()}
              >
                <FileCode className="mr-2 h-4 w-4" />
                Open builder
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={page.deployment_url ? "secondary" : "outline"}
              disabled={!page.deployment_url}
            >
              <Link
                href={page.deployment_url || "#"}
                target={page.deployment_url ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!page.deployment_url) {
                    event.preventDefault();
                  }
                }}
              >
                <Globe className="mr-2 h-4 w-4" />
                {page.deployment_url ? "Visit deployment" : "Waiting for deployment"}
              </Link>
            </Button>
            {previewUrl && (
              <Button asChild size="sm" variant="ghost">
                <Link
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open preview
                </Link>
              </Button>
            )}
          </div>

          {expanded && (
            <div className="space-y-6 rounded-xl border border-border/60 bg-background/70 p-6 backdrop-blur-sm">
              {detailSections.map((section, index) => (
                <React.Fragment key={section.key}>
                  {index > 0 && <Separator className="opacity-30" />}
                  {section.node}
                </React.Fragment>
              ))}
              {hasPdf && (
                <>
                  {detailSections.length > 0 && <Separator className="opacity-30" />}
                  <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-primary">Design rationale</p>
                        <p className="text-xs text-muted-foreground">
                          Download the blueprint that guided this landing page&apos;s aesthetic and layout decisions.
                        </p>
                      </div>
                      <Button asChild size="sm" className="gap-2">
                        <a
                          href={page.design_blueprint_pdf_url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LandingPagesListPage() {
  const { items, loading, error, refresh } = useLandingPages({ pageSize: 50 });
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (expandedId && !items.some((page) => page.id === expandedId)) {
      setExpandedId(null);
    }
  }, [items, expandedId]);

  const handleToggle = React.useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

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
            Explore every landing page your team has generated, inspect the AI business brief, and
            jump back into the builder in one click.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" className="gap-2">
            <Link href="/create">
              Create new landing page
              <FileCode className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fetching landing pages…
        </Card>
      )}

      {!loading && error && (
        <Card className="space-y-3 px-6 py-12 text-center text-sm text-destructive">
          <p>{error}</p>
          <Button size="sm" variant="outline" onClick={refresh}>
            Try again
          </Button>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <Card className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
            <Image
              src="/empty-landing-pages.webp"
              alt="No landing pages yet"
              width={820}
              height={520}
              className="relative max-w-[820px] rounded-3xl"
            />
          </div>
          <div className="max-w-xl space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Launch your first landing page</h2>
            <p className="text-sm text-muted-foreground">
              You haven’t generated any pages yet. Kick off a new build and let the AI assemble a
              polished, on-brand experience in minutes.
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
        </Card>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-5">
          {items.map((page) => (
            <LandingPageCard
              key={page.id}
              page={page}
              expanded={expandedId === page.id}
              onToggle={() => handleToggle(page.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

