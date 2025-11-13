"use client"

import * as React from "react"
import { 
  Sparkles, 
  Star, 
  Code, 
  MessageSquare, 
  MousePointerClick, 
  HelpCircle,
  BarChart3,
  Users,
  Shield,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SectionType = "hero" | "benefits" | "features" | "testimonials" | "cta" | "faq" | "stats" | "pricing" | "team"

interface SectionPreviewProps {
  type: SectionType
  className?: string
  isSelected?: boolean
  isLocked?: boolean
}

const sectionConfig: Record<SectionType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; accentColor: string }> = {
  hero: { label: "Hero", icon: Sparkles, color: "rgba(59, 130, 246, 0.15)", accentColor: "#3B82F6" },
  benefits: { label: "Benefits", icon: Star, color: "rgba(234, 179, 8, 0.15)", accentColor: "#EAB308" },
  features: { label: "Features", icon: Code, color: "rgba(34, 197, 94, 0.15)", accentColor: "#22C55E" },
  testimonials: { label: "Testimonials", icon: MessageSquare, color: "rgba(168, 85, 247, 0.15)", accentColor: "#A855F7" },
  cta: { label: "CTA", icon: MousePointerClick, color: "rgba(239, 68, 68, 0.15)", accentColor: "#EF4444" },
  faq: { label: "FAQ", icon: HelpCircle, color: "rgba(99, 102, 241, 0.15)", accentColor: "#6366F1" },
  stats: { label: "Stats", icon: BarChart3, color: "rgba(249, 115, 22, 0.15)", accentColor: "#F97316" },
  pricing: { label: "Pricing", icon: Users, color: "rgba(236, 72, 153, 0.15)", accentColor: "#EC4899" },
  team: { label: "Team", icon: Shield, color: "rgba(20, 184, 166, 0.15)", accentColor: "#14B8A6" },
}

// Mini mockup components for each section type
const HeroMockup = () => (
  <div className="w-full space-y-2">
    <div className="h-3 w-3/4 rounded bg-gradient-to-r from-primary/40 to-primary/20" />
    <div className="h-2 w-full rounded bg-muted/40" />
    <div className="h-2 w-5/6 rounded bg-muted/30" />
    <div className="h-6 w-20 rounded-md bg-primary/20" />
  </div>
)

const BenefitsMockup = () => (
  <div className="w-full grid grid-cols-3 gap-1.5">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-1">
        <div className="h-4 w-4 rounded-full bg-primary/30 mx-auto" />
        <div className="h-1.5 w-full rounded bg-muted/40" />
        <div className="h-1 w-3/4 rounded bg-muted/30 mx-auto" />
      </div>
    ))}
  </div>
)

const FeaturesMockup = () => (
  <div className="w-full space-y-1.5">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="h-3 w-3 rounded border border-primary/30" />
        <div className="flex-1 h-2 rounded bg-muted/40" />
      </div>
    ))}
  </div>
)

const TestimonialsMockup = () => (
  <div className="w-full space-y-1.5">
    <div className="h-2.5 w-full rounded bg-muted/40" />
    <div className="flex items-center gap-1.5">
      <div className="h-3 w-3 rounded-full bg-muted/50" />
      <div className="h-1.5 w-16 rounded bg-muted/30" />
    </div>
  </div>
)

const CTAMockup = () => (
  <div className="w-full flex items-center justify-center">
    <div className="h-5 w-24 rounded-md bg-primary/30" />
  </div>
)

const FAQMockup = () => (
  <div className="w-full space-y-1">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-primary/40" />
        <div className="flex-1 h-1.5 rounded bg-muted/40" />
      </div>
    ))}
  </div>
)

const StatsMockup = () => (
  <div className="w-full grid grid-cols-3 gap-1">
    {[1, 2, 3].map((i) => (
      <div key={i} className="text-center">
        <div className="h-3 w-full rounded bg-primary/20 mb-0.5" />
        <div className="h-1 w-2/3 rounded bg-muted/30 mx-auto" />
      </div>
    ))}
  </div>
)

const PricingMockup = () => (
  <div className="w-full grid grid-cols-2 gap-1">
    {[1, 2].map((i) => (
      <div key={i} className="space-y-0.5 p-1 rounded border border-border/50">
        <div className="h-2 w-full rounded bg-primary/20" />
        <div className="h-1 w-3/4 rounded bg-muted/30" />
      </div>
    ))}
  </div>
)

const TeamMockup = () => (
  <div className="w-full grid grid-cols-3 gap-1">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex flex-col items-center gap-0.5">
        <div className="h-4 w-4 rounded-full bg-muted/50" />
        <div className="h-1 w-full rounded bg-muted/30" />
      </div>
    ))}
  </div>
)

const mockupComponents: Record<SectionType, React.ComponentType> = {
  hero: HeroMockup,
  benefits: BenefitsMockup,
  features: FeaturesMockup,
  testimonials: TestimonialsMockup,
  cta: CTAMockup,
  faq: FAQMockup,
  stats: StatsMockup,
  pricing: PricingMockup,
  team: TeamMockup,
}

export function SectionPreview({ type, className, isSelected, isLocked }: SectionPreviewProps) {
  const config = sectionConfig[type]
  const Icon = config.icon
  const Mockup = mockupComponents[type]

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border-2 p-5 transition-all cursor-pointer w-full min-w-[160px]",
        "hover:shadow-md hover:-translate-y-0.5",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
          : "border-border/60 bg-card/50 hover:border-primary/40 hover:bg-card",
        isLocked && "opacity-90",
        className
      )}
    >
      {/* Lock badge */}
      {isLocked && (
        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted/80 backdrop-blur-sm">
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* Icon with gradient background */}
      <div className="flex items-center justify-center">
        <div 
          className="flex h-16 w-16 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ 
            backgroundColor: config.color,
            border: `2px solid ${config.accentColor}20`
          }}
        >
          <Icon className="h-8 w-8" style={{ color: config.accentColor }} />
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className={cn(
          "text-base font-semibold transition-colors",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {config.label}
        </div>
      </div>

      {/* Mini mockup */}
      <div className="h-20 w-full rounded-lg border border-border/40 bg-background/80 p-3 flex items-center justify-center">
        <Mockup />
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-2 border-primary/30 pointer-events-none" />
      )}
    </div>
  )
}

