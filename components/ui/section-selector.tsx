"use client"

import * as React from "react"
import { GripVertical, Lock, Settings, CheckCircle2, Sparkles, PlusCircle, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionPreview, type SectionType } from "./section-preview"
import { SectionDetailDialog } from "./section-detail-dialog"
import { Button } from "./button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CustomSection {
  id: string
  name: string
  description?: string
  notes?: string
}

interface SectionSelectorProps {
  selectedSections: SectionType[]
  onChange: (sections: SectionType[]) => void
  className?: string
  // Section-specific data handlers
  onFAQDataChange?: (data: { question: string; answer: string }[]) => void
  onPricingDataChange?: (data: { name: string; price: string; features: string[]; cta: string }[]) => void
  onStatsDataChange?: (data: { label: string; value: string; description?: string }[]) => void
  onTeamDataChange?: (data: { name: string; role: string; bio?: string; image?: string }[]) => void
  onTestimonialsDataChange?: (data: { quote: string; author: string; role?: string; company?: string; image?: string }[]) => void
  onCustomSectionsChange?: (sections: CustomSection[]) => void
  // Current section data
  faqData?: { question: string; answer: string }[]
  pricingData?: { name: string; price: string; features: string[]; cta: string }[]
  statsData?: { label: string; value: string; description?: string }[]
  teamData?: { name: string; role: string; bio?: string; image?: string }[]
  testimonialsData?: { quote: string; author: string; role?: string; company?: string; image?: string }[]
  customSections?: CustomSection[]
  sectionAssets?: Record<string, string[]>
  onSectionAssetsChange?: (assets: Record<string, string[]>) => void
  benefitsList?: string[]
  featuresList?: string[]
}

const SECTIONS_WITH_DETAILS: SectionType[] = [
  "hero",
  "benefits",
  "features",
  "faq",
  "pricing",
  "stats",
  "team",
  "testimonials",
  "cta",
]

const ALL_SECTIONS: SectionType[] = ["hero", "benefits", "features", "testimonials", "cta", "faq", "stats", "pricing", "team"]
const LOCKED_SECTIONS: SectionType[] = ["hero", "benefits", "features"]
const HERO_FIXED = true // Hero cannot be moved from first position

export function SectionSelector({
  selectedSections,
  onChange,
  className,
  onFAQDataChange,
  onPricingDataChange,
  onStatsDataChange,
  onTeamDataChange,
  onTestimonialsDataChange,
  onCustomSectionsChange,
  faqData = [],
  pricingData = [],
  statsData = [],
  teamData = [],
  testimonialsData = [],
  customSections = [],
  sectionAssets = {},
  onSectionAssetsChange,
  benefitsList = [],
  featuresList = [],
}: SectionSelectorProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogSection, setDialogSection] = React.useState<SectionType | null>(null)
  const [customDialogOpen, setCustomDialogOpen] = React.useState(false)
  const [editingCustomIndex, setEditingCustomIndex] = React.useState<number | null>(null)
  const [customDraft, setCustomDraft] = React.useState<{ name: string; description: string; notes: string }>({
    name: "",
    description: "",
    notes: "",
  })

  const createCustomId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
    return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  const toggleSection = (section: SectionType) => {
    if (LOCKED_SECTIONS.includes(section)) return // Can't deselect locked sections

    if (selectedSections.includes(section)) {
      onChange(selectedSections.filter((s) => s !== section))
    } else {
      onChange([...selectedSections, section])
      // Open dialog if section requires details
      if (SECTIONS_WITH_DETAILS.includes(section)) {
        setDialogSection(section)
        setDialogOpen(true)
      }
    }
  }

  const handleDialogSave = (data: any) => {
    if (dialogSection === "faq" && onFAQDataChange) {
      onFAQDataChange(data)
    } else if (dialogSection === "pricing" && onPricingDataChange) {
      onPricingDataChange(data)
    } else if (dialogSection === "stats" && onStatsDataChange) {
      onStatsDataChange(data)
    } else if (dialogSection === "team" && onTeamDataChange) {
      onTeamDataChange(data)
    } else if (dialogSection === "testimonials" && onTestimonialsDataChange) {
      onTestimonialsDataChange(data)
    }
  }

  const getDialogData = () => {
    if (dialogSection === "faq") return faqData.length > 0 ? faqData : [{ question: "", answer: "" }]
    if (dialogSection === "pricing") return pricingData.length > 0 ? pricingData : [{ name: "", price: "", features: [], cta: "" }]
    if (dialogSection === "stats") return statsData.length > 0 ? statsData : [{ label: "", value: "" }]
    if (dialogSection === "team") return teamData.length > 0 ? teamData : [{ name: "", role: "" }]
    if (dialogSection === "testimonials") return testimonialsData.length > 0 ? testimonialsData : [{ quote: "", author: "" }]
    return []
  }

  const openSectionDialog = (section: SectionType) => {
    setDialogSection(section)
    setDialogOpen(true)
  }

  const isSectionConfigured = (section: SectionType): boolean => {
    if (section === "faq") return faqData.length > 0 && faqData.some(item => item.question.trim() && item.answer.trim())
    if (section === "pricing") return pricingData.length > 0 && pricingData.some(item => item.name.trim() && item.price.trim())
    if (section === "stats") return statsData.length > 0 && statsData.some(item => item.label.trim() && item.value.trim())
    if (section === "team") return teamData.length > 0 && teamData.some(item => item.name.trim() && item.role.trim())
    if (section === "testimonials") return testimonialsData.length > 0 && testimonialsData.some(item => item.quote.trim() && item.author.trim())
    // treat hero/benefits/features as "configured" when they have any assets
    if (section === "hero") {
      const main = sectionAssets?.["hero:main"] || []
      const extra = sectionAssets?.["hero:extra"] || []
      return main.length > 0 || extra.length > 0
    }
    if (section === "benefits") return !!sectionAssets && Object.keys(sectionAssets).some(k => k.startsWith("benefits:"))
    if (section === "features") return !!sectionAssets && Object.keys(sectionAssets).some(k => k.startsWith("features:"))
    return false
  }

  const handleOpenNewCustom = () => {
    setEditingCustomIndex(null)
    setCustomDraft({ name: "", description: "", notes: "" })
    setCustomDialogOpen(true)
  }

  const handleOpenEditCustom = (index: number) => {
    const existing = customSections[index]
    setEditingCustomIndex(index)
    setCustomDraft({
      name: existing?.name ?? "",
      description: existing?.description ?? "",
      notes: existing?.notes ?? "",
    })
    setCustomDialogOpen(true)
  }

  const handleRemoveCustom = (index: number) => {
    if (!onCustomSectionsChange) return
    const next = customSections.filter((_, i) => i !== index)
    onCustomSectionsChange(next)
  }

  const handleSaveCustom = () => {
    if (!onCustomSectionsChange) {
      setCustomDialogOpen(false)
      return
    }
    const next = [...customSections]
    if (editingCustomIndex === null || editingCustomIndex < 0 || editingCustomIndex >= next.length) {
      next.push({
        id: createCustomId(),
        name: customDraft.name.trim() || "Custom section",
        description: customDraft.description.trim() || undefined,
        notes: customDraft.notes.trim() || undefined,
      })
    } else {
      next[editingCustomIndex] = {
        ...next[editingCustomIndex],
        name: customDraft.name.trim() || next[editingCustomIndex].name,
        description: customDraft.description.trim() || undefined,
        notes: customDraft.notes.trim() || undefined,
      }
    }
    onCustomSectionsChange(next)
    setCustomDialogOpen(false)
  }

  type OrderedItem =
    | { kind: "core"; section: SectionType }
    | { kind: "custom"; section: CustomSection }

  const getOrderedItems = (): OrderedItem[] => [
    ...selectedSections.map<OrderedItem>((s) => ({ kind: "core", section: s })),
    ...(customSections || []).map<OrderedItem>((cs) => ({ kind: "custom", section: cs })),
  ]

  const handleDragStart = (index: number) => {
    const items = getOrderedItems()
    const item = items[index]
    if (item && item.kind === "core" && item.section === "hero" && HERO_FIXED) return // Can't drag hero
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return
    if (index === 0 && HERO_FIXED) return // Can't drop on hero position
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    if (dropIndex === 0 && HERO_FIXED) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const items = getOrderedItems()
    const next = [...items]
    const [removed] = next.splice(draggedIndex, 1)
    next.splice(dropIndex, 0, removed)

    const nextSelected: SectionType[] = []
    const nextCustom: CustomSection[] = []

    next.forEach((item) => {
      if (item.kind === "core") {
        nextSelected.push(item.section)
      } else {
        nextCustom.push(item.section)
      }
    })

    onChange(nextSelected)
    if (onCustomSectionsChange) {
      onCustomSectionsChange(nextCustom)
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className={cn("space-y-8 w-full", className)}>
      {/* Available Sections */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Available Sections</h3>
          <span className="text-xs text-muted-foreground">
            {selectedSections.length} of {ALL_SECTIONS.length} selected
          </span>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {ALL_SECTIONS.map((section) => {
            const isSelected = selectedSections.includes(section)
            const isLocked = LOCKED_SECTIONS.includes(section)
            return (
              <button
                key={section}
                type="button"
                onClick={() => toggleSection(section)}
                disabled={isLocked}
                className="w-full cursor-pointer transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <SectionPreview type={section} isSelected={isSelected} isLocked={isLocked} className="w-full" />
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Required sections:</span> Hero, Benefits, and Features are mandatory and cannot be removed from your landing page.
          </p>
        </div>
      </div>

      {/* Custom Sections (before ordering) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Custom Sections</h3>
              <p className="text-[11px] text-muted-foreground">
                Define unique blocks like comparisons, galleries, FAQs, or anything else you want caelum.ai to generate.
              </p>
            </div>
          </div>
          <span className="ml-4 text-xs text-muted-foreground">
            {(customSections?.length ?? 0)} added
          </span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-3">
          {(!customSections || customSections.length === 0) && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border/60 bg-muted/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                No custom sections yet. Use this to capture ideas like{" "}
                <span className="font-medium text-foreground">“Comparison table”</span>,{" "}
                <span className="font-medium text-foreground">“Partners strip”</span>, or{" "}
                <span className="font-medium text-foreground">“Resources grid”</span>.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {customSections?.map((section, index) => (
              <div
                key={section.id || `custom-${index}`}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      C
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {section.name || `Custom Section ${index + 1}`}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Custom
                    </span>
                  </div>
                  {section.description && (
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 pl-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditCustom(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustom(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
              {["Comparison table", "Logos strip", "Feature gallery"].map((idea) => (
                <span
                  key={idea}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5"
                >
                  <Sparkles className="mr-1 h-3 w-3 text-primary/80" />
                  {idea}
                </span>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleOpenNewCustom}>
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Add Custom Section
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Sections Order */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Section Order</h3>
          <span className="text-xs text-muted-foreground">
            {selectedSections.length + (customSections?.length ?? 0)} sections
          </span>
        </div>
        <div className="space-y-2.5 rounded-xl border border-border/60 bg-card/50 p-4">
          {getOrderedItems().map((item, index) => {
            const isCore = item.kind === "core"
            const sectionKey = isCore ? item.section : item.section.id || `custom-${index}`
            const isHero = isCore && item.section === "hero"
            const isLocked = isCore && LOCKED_SECTIONS.includes(item.section)
            const isDragging = draggedIndex === index
            const isDragOver = dragOverIndex === index
            const isDetailSection = isCore && SECTIONS_WITH_DETAILS.includes(item.section)
            const configured = isCore && isSectionConfigured(item.section)

            const label = isCore
              ? item.section.charAt(0).toUpperCase() + item.section.slice(1)
              : item.section.name || `Custom Section ${index + 1}`

            return (
              <div
                key={`${sectionKey}-${index}`}
                draggable={!isHero}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group flex items-center gap-4 rounded-lg border-2 bg-background p-3 transition-all",
                  "hover:shadow-sm",
                  isDragging && "opacity-40 scale-95",
                  isDragOver && !isHero && "border-primary bg-primary/5 shadow-md",
                  isHero ? "border-border/40 bg-muted/30" : "border-border/60 hover:border-primary/40"
                )}
              >
                {/* Drag handle / Lock */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    isHero ? "bg-muted/50" : "bg-muted/30 group-hover:bg-muted/50 cursor-move"
                  )}
                >
                  {isHero ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Section number badge */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                    isHero ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>

                {/* Section preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {label}
                    </span>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <Lock className="h-2.5 w-2.5" />
                        Required
                      </span>
                    )}
                    {!isCore && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <Sparkles className="h-2.5 w-2.5" />
                        Custom
                      </span>
                    )}
                    {isCore && isDetailSection && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          configured
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {configured ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : (
                          <Settings className="h-2.5 w-2.5" />
                        )}
                        {configured ? "Configured" : "Configure"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: configure (includes assets) */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openSectionDialog(isCore ? item.section : "hero")}
                    className="h-8"
                  >
                    <Settings className="h-3.5 w-3.5 mr-1.5" />
                    Config
                  </Button>
                </div>

                {/* Visual indicator */}
                <div className="h-10 w-16 shrink-0 rounded border border-border/40 bg-muted/20" />
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Drag to reorder:</span> Click and drag sections (except Hero) to change their order. The Hero section must always remain first.
          </p>
        </div>
      </div>

      {/* Section Detail Dialog */}
      {dialogSection && (
        <SectionDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          sectionType={dialogSection}
          data={getDialogData()}
          onSave={handleDialogSave}
          sectionId={dialogSection}
          sectionAssets={sectionAssets}
          onSectionAssetsChange={onSectionAssetsChange}
          benefitsList={benefitsList}
          featuresList={featuresList}
        />
      )}

      {/* Custom Section Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingCustomIndex === null ? "Add Custom Section" : "Edit Custom Section"}
            </DialogTitle>
            <DialogDescription>
              Name and describe a custom section you want caelum.ai to generate on your page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="custom-name">Section name</Label>
              <Input
                id="custom-name"
                value={customDraft.name}
                onChange={(e) => setCustomDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g., Comparison Table, Feature Gallery, Resources"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-description">What should this section convey?</Label>
              <Textarea
                id="custom-description"
                value={customDraft.description}
                onChange={(e) => setCustomDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="High-level description of what this section is about."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-notes">Detailed notes for caelum.ai (optional)</Label>
              <Textarea
                id="custom-notes"
                value={customDraft.notes}
                onChange={(e) => setCustomDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="Bullets, copy ideas, layout preferences, or anything else you want the model to consider."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setCustomDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveCustom} disabled={!customDraft.name.trim()}>
              Save Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

