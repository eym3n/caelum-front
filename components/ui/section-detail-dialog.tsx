"use client"

import * as React from "react"
import { X, Plus, Trash2, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TagInput } from "@/components/ui/tag-input"
import type { SectionType } from "./section-preview"
import { useAuth } from "@/contexts/AuthContext"
import { API_BASE_URL } from "@/lib/config"

interface FAQData {
  question: string
  answer: string
}

interface PricingData {
  name: string
  price: string
  features: string[]
  cta: string
}

interface StatsData {
  label: string
  value: string
  description?: string
}

interface TeamData {
  name: string
  role: string
  bio?: string
  image?: string
}

interface TestimonialsData {
  quote: string
  author: string
  role?: string
  company?: string
  image?: string
}

interface SectionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionType: SectionType
  data: FAQData[] | PricingData[] | StatsData[] | TeamData[] | TestimonialsData[]
  onSave: (data: FAQData[] | PricingData[] | StatsData[] | TeamData[] | TestimonialsData[]) => void
  // Optional extra context for richer configs
  sectionId?: string
  sectionAssets?: Record<string, string[]>
  onSectionAssetsChange?: (assets: Record<string, string[]>) => void
  benefitsList?: string[]
  featuresList?: string[]
}

export function SectionDetailDialog({
  open,
  onOpenChange,
  sectionType,
  data,
  onSave,
  sectionId,
  sectionAssets,
  onSectionAssetsChange,
  benefitsList = [],
  featuresList = [],
}: SectionDetailDialogProps) {
  const [localData, setLocalData] = React.useState(data)
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null)
  const { authorizedFetch } = useAuth()

  React.useEffect(() => {
    setLocalData(data)
  }, [data, open])

  const handleSave = () => {
    onSave(localData)
    onOpenChange(false)
  }

  const addFAQ = () => {
    setLocalData([...localData as FAQData[], { question: "", answer: "" }])
  }

  const removeFAQ = (index: number) => {
    setLocalData((localData as FAQData[]).filter((_, i) => i !== index))
  }

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...localData as FAQData[]]
    updated[index] = { ...updated[index], [field]: value }
    setLocalData(updated)
  }

  const addPricing = () => {
    setLocalData([...localData as PricingData[], { name: "", price: "", features: [], cta: "" }])
  }

  const removePricing = (index: number) => {
    setLocalData((localData as PricingData[]).filter((_, i) => i !== index))
  }

  const updatePricing = (index: number, field: keyof PricingData, value: string | string[]) => {
    const updated = [...localData as PricingData[]]
    updated[index] = { ...updated[index], [field]: value }
    setLocalData(updated)
  }

  const addStat = () => {
    setLocalData([...localData as StatsData[], { label: "", value: "" }])
  }

  const removeStat = (index: number) => {
    setLocalData((localData as StatsData[]).filter((_, i) => i !== index))
  }

  const updateStat = (index: number, field: keyof StatsData, value: string) => {
    const updated = [...localData as StatsData[]]
    updated[index] = { ...updated[index], [field]: value }
    setLocalData(updated)
  }

  const addTeam = () => {
    setLocalData([...localData as TeamData[], { name: "", role: "" }])
  }

  const removeTeam = (index: number) => {
    setLocalData((localData as TeamData[]).filter((_, i) => i !== index))
  }

  const updateTeam = (index: number, field: keyof TeamData, value: string) => {
    const updated = [...localData as TeamData[]]
    updated[index] = { ...updated[index], [field]: value }
    setLocalData(updated)
  }

  const addTestimonial = () => {
    setLocalData([...localData as TestimonialsData[], { quote: "", author: "" }])
  }

  const removeTestimonial = (index: number) => {
    setLocalData((localData as TestimonialsData[]).filter((_, i) => i !== index))
  }

  const updateTestimonial = (index: number, field: keyof TestimonialsData, value: string) => {
    const updated = [...localData as TestimonialsData[]]
    updated[index] = { ...updated[index], [field]: value }
    setLocalData(updated)
  }

  const uploadImage = async (file: File, key: string): Promise<string | null> => {
    try {
      setUploadingKey(key)
      const form = new FormData()
      form.append("file", file)
      const res = await authorizedFetch(
        `${API_BASE_URL}/v1/uploads/upload-image`,
        {
          method: "POST",
          body: form,
        }
      )
      if (!res.ok) throw new Error("Upload failed")
      const json = await res.json()
      return json?.url || null
    } catch (e) {
      console.error("Upload error", e)
      return null
    } finally {
      setUploadingKey((prev) => (prev === key ? null : prev))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {sectionType === "hero" && "Hero Section Configuration"}
            {sectionType === "benefits" && "Benefits Section Configuration"}
            {sectionType === "features" && "Features Section Configuration"}
            {sectionType === "faq" && "FAQ Section Details"}
            {sectionType === "pricing" && "Pricing Section Details"}
            {sectionType === "stats" && "Stats Section Details"}
            {sectionType === "team" && "Team Section Details"}
            {sectionType === "testimonials" && "Testimonials Section Details"}
          </DialogTitle>
          <DialogDescription>
            {sectionType === "hero" && "Attach key imagery for the hero section."}
            {sectionType === "benefits" && "Review your benefits and optionally attach imagery to each one."}
            {sectionType === "features" && "Review your features and optionally attach imagery to each one."}
            {sectionType === "faq" && "Add questions and answers for your FAQ section"}
            {sectionType === "pricing" && "Configure your pricing tiers and plans"}
            {sectionType === "stats" && "Add statistics and metrics to showcase"}
            {sectionType === "team" && "Add team members and their information"}
            {sectionType === "testimonials" && "Add customer testimonials and reviews"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {sectionType === "hero" && sectionId === "hero" && (
            <div className="space-y-4">
              {/* Main hero image */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Main Hero Image</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  This image will be used as the primary hero visual (above the fold).
                </p>
                    <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = async (e: any) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = await uploadImage(file, "hero:main")
                        if (!url) return
                        if (onSectionAssetsChange) {
                          const next = { ...(sectionAssets || {}) }
                          next["hero:main"] = [url]
                          onSectionAssetsChange(next)
                        }
                      }
                      input.click()
                    }}
                  >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    {uploadingKey === "hero:main" ? "Uploading..." : "Upload image"}
                  </Button>
                  {sectionAssets?.["hero:main"]?.[0] && (
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {sectionAssets["hero:main"][0].split("/").pop()}
                      </span>
                      <img
                        src={sectionAssets["hero:main"][0]}
                        alt="Hero main preview"
                        className="h-8 w-8 rounded-md object-cover border border-border/70"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Other hero assets */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Other Hero Assets</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Additional UI screenshots, background shapes, or supporting visuals.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.multiple = true
                      input.onchange = async (e: any) => {
                        const files: FileList | null = e.target.files
                        if (!files || files.length === 0) return
                        const uploaded: string[] = []
                        for (const file of Array.from(files)) {
                          const url = await uploadImage(file, "hero:extra")
                          if (url) uploaded.push(url)
                        }
                        if (uploaded.length && onSectionAssetsChange) {
                          const next = { ...(sectionAssets || {}) }
                          const existing = next["hero:extra"] || []
                          next["hero:extra"] = [...existing, ...uploaded]
                          onSectionAssetsChange(next)
                        }
                      }
                      input.click()
                    }}
                  >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    {uploadingKey === "hero:extra" ? "Uploading..." : "Upload assets"}
                  </Button>
                </div>
                {sectionAssets?.["hero:extra"]?.length ? (
                  <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                    {sectionAssets["hero:extra"].map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className="flex items-center justify-between rounded-md border border-border/70 bg-muted/40 px-3 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={url}
                            alt="Hero asset preview"
                            className="h-7 w-7 rounded-md object-cover border border-border/70"
                          />
                          <span className="truncate mr-2 max-w-[120px]">{url.split("/").pop()}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!onSectionAssetsChange) return
                            const next = { ...(sectionAssets || {}) }
                            next["hero:extra"] = (next["hero:extra"] || []).filter((_, i) => i !== idx)
                            onSectionAssetsChange(next)
                          }}
                          className="text-destructive hover:text-destructive/80"
                          aria-label="Remove asset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    No additional assets yet. You can attach supporting visuals here.
                  </p>
                )}
              </div>
            </div>
          )}

          {sectionType === "benefits" && benefitsList.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-card/60 p-3 text-xs text-muted-foreground">
                Attach imagery to the benefits you defined earlier. We&apos;ll pair them in the benefits section.
              </div>
              {benefitsList.map((benefit, index) => {
                const key = `benefits:${index}`
                const current = sectionAssets?.[key]?.[0]
                return (
                  <div key={key} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{benefit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const url = await uploadImage(file, key)
                            if (!url || !onSectionAssetsChange) return
                            const next = { ...(sectionAssets || {}) }
                            next[key] = [url]
                            onSectionAssetsChange(next)
                          }
                          input.click()
                        }}
                        >
                          <Upload className="mr-2 h-3.5 w-3.5" />
                          {uploadingKey === key
                            ? "Uploading..."
                            : current
                            ? "Replace image"
                            : "Attach image"}
                        </Button>
                      {current && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <img
                              src={current}
                              alt="Benefit image preview"
                              className="h-6 w-6 rounded object-cover border border-border/70"
                            />
                            <span className="truncate text-[11px] text-muted-foreground max-w-[100px]">
                              {current.split("/").pop()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!onSectionAssetsChange) return
                              const next = { ...(sectionAssets || {}) }
                              delete next[key]
                              onSectionAssetsChange(next)
                            }}
                            className="text-destructive hover:text-destructive/80"
                            aria-label="Remove image"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {sectionType === "features" && featuresList.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-card/60 p-3 text-xs text-muted-foreground">
                Attach imagery or icons to your key features.
              </div>
              {featuresList.map((feature, index) => {
                const key = `features:${index}`
                const current = sectionAssets?.[key]?.[0]
                return (
                  <div key={key} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{feature}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const url = await uploadImage(file, key)
                            if (!url || !onSectionAssetsChange) return
                            const next = { ...(sectionAssets || {}) }
                            next[key] = [url]
                            onSectionAssetsChange(next)
                          }
                          input.click()
                        }}
                        >
                          <Upload className="mr-2 h-3.5 w-3.5" />
                          {uploadingKey === key
                            ? "Uploading..."
                            : current
                            ? "Replace image"
                            : "Attach image"}
                        </Button>
                      {current && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <img
                              src={current}
                              alt="Feature image preview"
                              className="h-6 w-6 rounded object-cover border border-border/70"
                            />
                            <span className="truncate text-[11px] text-muted-foreground max-w-[100px]">
                              {current.split("/").pop()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!onSectionAssetsChange) return
                              const next = { ...(sectionAssets || {}) }
                              delete next[key]
                              onSectionAssetsChange(next)
                            }}
                            className="text-destructive hover:text-destructive/80"
                            aria-label="Remove image"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {sectionType === "faq" && (
            <div className="space-y-4">
              {(localData as FAQData[]).map((item, index) => (
                <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">FAQ #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFAQ(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`faq-q-${index}`}>Question</Label>
                      <Input
                        id={`faq-q-${index}`}
                        value={item.question}
                        onChange={(e) => updateFAQ(index, "question", e.target.value)}
                        placeholder="e.g., What is your refund policy?"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`faq-a-${index}`}>Answer</Label>
                      <Textarea
                        id={`faq-a-${index}`}
                        value={item.answer}
                        onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                        placeholder="e.g., We offer a 30-day money-back guarantee..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addFAQ} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ Item
              </Button>
            </div>
          )}

          {sectionType === "pricing" && (
            <div className="space-y-4">
              {(localData as PricingData[]).map((item, index) => (
                <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Plan #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePricing(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`pricing-name-${index}`}>Plan Name</Label>
                      <Input
                        id={`pricing-name-${index}`}
                        value={item.name}
                        onChange={(e) => updatePricing(index, "name", e.target.value)}
                        placeholder="e.g., Starter, Pro, Enterprise"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`pricing-price-${index}`}>Price</Label>
                      <Input
                        id={`pricing-price-${index}`}
                        value={item.price}
                        onChange={(e) => updatePricing(index, "price", e.target.value)}
                        placeholder="e.g., $29/month, $299/year"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Features</Label>
                    <TagInput
                      value={item.features}
                      onChange={(features) => updatePricing(index, "features", features)}
                      placeholder="Add features..."
                    />
                  </div>
                  <div>
                    <Label htmlFor={`pricing-cta-${index}`}>CTA Text</Label>
                    <Input
                      id={`pricing-cta-${index}`}
                      value={item.cta}
                      onChange={(e) => updatePricing(index, "cta", e.target.value)}
                      placeholder="e.g., Get Started, Choose Plan"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPricing} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Pricing Plan
              </Button>
            </div>
          )}

          {sectionType === "stats" && (
            <div className="space-y-4">
              {(localData as StatsData[]).map((item, index) => (
                <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Stat #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStat(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`stats-label-${index}`}>Label</Label>
                      <Input
                        id={`stats-label-${index}`}
                        value={item.label}
                        onChange={(e) => updateStat(index, "label", e.target.value)}
                        placeholder="e.g., Happy Customers, Projects Completed"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stats-value-${index}`}>Value</Label>
                      <Input
                        id={`stats-value-${index}`}
                        value={item.value}
                        onChange={(e) => updateStat(index, "value", e.target.value)}
                        placeholder="e.g., 10,000+, 500+"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`stats-desc-${index}`}>Description (Optional)</Label>
                    <Input
                      id={`stats-desc-${index}`}
                      value={item.description || ""}
                      onChange={(e) => updateStat(index, "description", e.target.value)}
                      placeholder="e.g., Since 2020, Worldwide"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addStat} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Statistic
              </Button>
            </div>
          )}

          {sectionType === "team" && (
            <div className="space-y-4">
              {(localData as TeamData[]).map((item, index) => (
                <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Team Member #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeam(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`team-name-${index}`}>Name</Label>
                      <Input
                        id={`team-name-${index}`}
                        value={item.name}
                        onChange={(e) => updateTeam(index, "name", e.target.value)}
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`team-role-${index}`}>Role</Label>
                      <Input
                        id={`team-role-${index}`}
                        value={item.role}
                        onChange={(e) => updateTeam(index, "role", e.target.value)}
                        placeholder="e.g., CEO, CTO, Designer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`team-bio-${index}`}>Bio (Optional)</Label>
                    <Textarea
                      id={`team-bio-${index}`}
                      value={item.bio || ""}
                      onChange={(e) => updateTeam(index, "bio", e.target.value)}
                      placeholder="e.g., 10+ years of experience..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Profile Image (Optional)</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const url = await uploadImage(file, `team:${index}`)
                            if (!url) return
                            updateTeam(index, "image", url)
                          }
                          input.click()
                        }}
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        {uploadingKey === `team:${index}`
                          ? "Uploading..."
                          : item.image
                          ? "Replace image"
                          : "Upload image"}
                      </Button>
                      {item.image && (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={item.image}
                            alt="Team member preview"
                            className="h-6 w-6 rounded-full object-cover border border-border/70"
                          />
                          <span className="truncate text-[11px] text-muted-foreground max-w-[100px]">
                            {item.image.split("/").pop()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTeam} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          )}

          {sectionType === "testimonials" && (
            <div className="space-y-4">
              {(localData as TestimonialsData[]).map((item, index) => (
                <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Testimonial #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTestimonial(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`testimonial-quote-${index}`}>Quote</Label>
                    <Textarea
                      id={`testimonial-quote-${index}`}
                      value={item.quote}
                      onChange={(e) => updateTestimonial(index, "quote", e.target.value)}
                      placeholder="e.g., This product changed our workflow completely..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`testimonial-author-${index}`}>Author Name</Label>
                      <Input
                        id={`testimonial-author-${index}`}
                        value={item.author}
                        onChange={(e) => updateTestimonial(index, "author", e.target.value)}
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`testimonial-role-${index}`}>Role (Optional)</Label>
                      <Input
                        id={`testimonial-role-${index}`}
                        value={item.role || ""}
                        onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                        placeholder="e.g., CEO, Marketing Director"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`testimonial-company-${index}`}>Company (Optional)</Label>
                      <Input
                        id={`testimonial-company-${index}`}
                        value={item.company || ""}
                        onChange={(e) => updateTestimonial(index, "company", e.target.value)}
                        placeholder="e.g., Acme Inc."
                      />
                    </div>
                    <div>
                      <Label>Avatar Image (Optional)</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = "image/*"
                            input.onchange = async (e: any) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const url = await uploadImage(file, `testimonial:${index}`)
                              if (!url) return
                              updateTestimonial(index, "image", url)
                            }
                            input.click()
                          }}
                        >
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          {uploadingKey === `testimonial:${index}`
                            ? "Uploading..."
                            : item.image
                            ? "Replace image"
                            : "Upload image"}
                        </Button>
                        {item.image && (
                          <div className="flex items-center gap-1.5">
                            <img
                              src={item.image}
                              alt="Testimonial avatar preview"
                              className="h-6 w-6 rounded-full object-cover border border-border/70"
                            />
                            <span className="truncate text-[11px] text-muted-foreground max-w-[100px]">
                              {item.image.split("/").pop()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTestimonial} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

