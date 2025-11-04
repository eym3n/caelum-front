"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, X } from "lucide-react"
import Link from "next/link"

interface FormData {
  // Step 1: Campaign Basics
  campaignObjective: string
  productServiceName: string
  primaryOffer: string

  // Step 2: Audience & Value
  targetAudienceDescription: string
  buyerPersonaKeywords: string
  uniqueValueProposition: string

  // Step 3: Benefits & Features
  topBenefits: string
  featureList: string
  emotionalTriggers: string

  // Step 4: Trust & Objections
  objections: string
  testimonials: string
  trustIndicators: string

  // Step 5: CTAs & Conversion
  primaryCTAText: string
  secondaryCTAText: string
  primaryConversionKPI: string

  // Step 6: Content & Messaging
  toneOfVoice: string
  targetSEOKeywords: string
  eventTrackingSetup: string

  // Step 7: Branding & Visual
  brandColorPalette: string
  fontStyleGuide: string
  pageLayoutPreference: string
  logoUpload: File | null
  heroImage: File | null
  secondaryImages: File[]

  // Step 8: Media & URLs
  videoURL: string
  privacyPolicyURL: string
  gdprCcpaConsentText: string

  // Step 9: Advanced
  formFieldsConfig: string
  analyticsIDs: string
  gtagID: string
  customPrompt: string
}

const STEPS = [
  {
    id: 1,
    title: "Campaign Basics",
    description: "What are you launching?",
    fields: ["campaignObjective", "productServiceName", "primaryOffer"],
  },
  {
    id: 2,
    title: "Audience & Value",
    description: "Who are you targeting?",
    fields: ["targetAudienceDescription", "buyerPersonaKeywords", "uniqueValueProposition"],
  },
  {
    id: 3,
    title: "Benefits & Features",
    description: "What makes you special?",
    fields: ["topBenefits", "featureList", "emotionalTriggers"],
  },
  {
    id: 4,
    title: "Trust & Credibility",
    description: "Build confidence",
    fields: ["objections", "testimonials", "trustIndicators"],
  },
  {
    id: 5,
    title: "Conversions",
    description: "Drive action",
    fields: ["primaryCTAText", "secondaryCTAText", "primaryConversionKPI"],
  },
  {
    id: 6,
    title: "Messaging & SEO",
    description: "Set the tone and reach",
    fields: ["toneOfVoice", "targetSEOKeywords", "eventTrackingSetup"],
  },
  {
    id: 7,
    title: "Branding & Visual",
    description: "Your visual identity",
    fields: [
      "brandColorPalette",
      "fontStyleGuide",
      "pageLayoutPreference",
      "logoUpload",
      "heroImage",
      "secondaryImages",
    ],
  },
  {
    id: 8,
    title: "Media & Legal",
    description: "Videos, URLs & compliance",
    fields: ["videoURL", "privacyPolicyURL", "gdprCcpaConsentText"],
  },
  {
    id: 9,
    title: "Final Setup",
    description: "Analytics & AI prompt",
    fields: ["formFieldsConfig", "analyticsIDs", "gtagID", "customPrompt"],
  },
]

const FIELD_LABELS: Record<
  string,
  { label: string; placeholder?: string; description?: string; type: "text" | "textarea" | "file" }
> = {
  campaignObjective: {
    label: "Campaign Objective",
    placeholder: "e.g., Lead generation, Sales, Signups",
    type: "text",
  },
  productServiceName: {
    label: "Product / Service Name",
    placeholder: "e.g., CloudSync Pro",
    type: "text",
  },
  primaryOffer: {
    label: "Primary Offer",
    placeholder: "e.g., 30-day free trial, 50% off first month",
    type: "text",
  },
  targetAudienceDescription: {
    label: "Target Audience Description",
    placeholder: "e.g., SaaS founders, product managers, 25-40 years old",
    type: "textarea",
  },
  buyerPersonaKeywords: {
    label: "Buyer Persona Keywords",
    placeholder: "e.g., scaling, automation, efficiency",
    type: "text",
  },
  uniqueValueProposition: {
    label: "Unique Value Proposition (UVP)",
    placeholder: "e.g., Only AI platform that combines X and Y",
    type: "textarea",
  },
  topBenefits: {
    label: "Top 3–5 Benefits",
    placeholder: "e.g., 10x faster deployment, 99.9% uptime, 24/7 support",
    type: "textarea",
  },
  featureList: {
    label: "Feature List",
    placeholder: "e.g., Real-time analytics, API-first, Multi-tenant",
    type: "textarea",
  },
  emotionalTriggers: {
    label: "Emotional Triggers",
    placeholder: "e.g., Trust, Urgency, Exclusivity, Community",
    type: "textarea",
  },
  objections: {
    label: "Objections to Overcome",
    placeholder: "e.g., Too expensive, Complex setup, Limited support",
    type: "textarea",
  },
  testimonials: {
    label: "Testimonials",
    placeholder: "e.g., Quote + attribution, or leave blank if you have none yet",
    type: "textarea",
  },
  trustIndicators: {
    label: "Trust Indicators",
    placeholder: "e.g., 10K+ customers, 4.9/5 stars, ISO certified",
    type: "textarea",
  },
  primaryCTAText: {
    label: "Primary CTA Text",
    placeholder: "e.g., Start Free Trial, Get Started Now",
    type: "text",
  },
  secondaryCTAText: {
    label: "Secondary CTA Text",
    placeholder: "e.g., See Pricing, Watch Demo",
    type: "text",
  },
  primaryConversionKPI: {
    label: "Primary Conversion KPI",
    placeholder: "e.g., 5% sign-ups, 10% conversion rate",
    type: "text",
  },
  toneOfVoice: {
    label: "Tone of Voice",
    placeholder: "e.g., Formal, Friendly, Playful, Technical",
    type: "text",
  },
  targetSEOKeywords: {
    label: "Target SEO Keywords",
    placeholder: "e.g., AI landing page builder, SaaS marketing tool",
    type: "text",
  },
  eventTrackingSetup: {
    label: "Event Tracking Setup",
    placeholder: "e.g., Button clicks, Form submissions, Video plays",
    type: "textarea",
  },
  brandColorPalette: {
    label: "Brand Color Palette",
    placeholder: "e.g., Primary: #0EA5E9, Accent: #8B5CF6, Neutral: #0F172A",
    type: "text",
  },
  fontStyleGuide: {
    label: "Font Style Guide",
    placeholder: "e.g., Heading: Inter Bold, Body: Geist Regular",
    type: "text",
  },
  pageLayoutPreference: {
    label: "Page Layout Preference",
    placeholder: "e.g., Single scroll hero, Multi-section storytelling, Modular cards",
    type: "text",
  },
  logoUpload: {
    label: "Company Logo",
    description: "Upload your company logo (PNG, JPG, SVG)",
    type: "file",
  },
  heroImage: {
    label: "Hero Image",
    description: "Main hero image for the landing page (PNG, JPG, GIF up to 5MB)",
    type: "file",
  },
  secondaryImages: {
    label: "Secondary Asset Images",
    description: "Additional images, features showcase, or UI screenshots (multiple files)",
    type: "file",
  },
  videoURL: {
    label: "Demo Video URL (Optional)",
    placeholder: "e.g., https://youtube.com/watch?v=... or Vimeo link",
    type: "text",
  },
  privacyPolicyURL: {
    label: "Privacy Policy URL",
    placeholder: "e.g., https://yoursite.com/privacy",
    type: "text",
  },
  gdprCcpaConsentText: {
    label: "GDPR/CCPA Consent Text",
    placeholder: "e.g., I agree to the privacy policy and terms of service",
    type: "textarea",
  },
  formFieldsConfig: {
    label: "Form Fields & Configuration",
    placeholder: "e.g., Name, Email, Company, Phone, API endpoint",
    type: "textarea",
  },
  analyticsIDs: {
    label: "Analytics IDs",
    placeholder: "e.g., GA ID: G-XXXXXX, GTM ID: GTM-XXXXXX",
    type: "text",
  },
  gtagID: {
    label: "Google Tag (GTag) ID",
    placeholder: "e.g., G-XXXXXXXXXX",
    type: "text",
  },
  customPrompt: {
    label: "Custom AI Prompt",
    description: "Provide specific instructions for how the AI should generate your landing page",
    placeholder: "e.g., Make it highly technical with dark mode theme, focus on performance metrics...",
    type: "textarea",
  },
}

// Map flat form data to normalized payload used by the builder streaming endpoint.
function buildPayload(fd: Partial<FormData>) {
  const split = (val?: string) => (val ? val.split(/[\n,]/).map((s) => s.trim()).filter(Boolean) : [])
  return {
    campaign: {
      objective: fd.campaignObjective || "",
      productName: fd.productServiceName || "",
      primaryOffer: fd.primaryOffer || "",
    },
    audience: {
      description: fd.targetAudienceDescription || "",
      personaKeywords: split(fd.buyerPersonaKeywords),
      uvp: fd.uniqueValueProposition || "",
    },
    benefits: {
      topBenefits: split(fd.topBenefits),
      features: split(fd.featureList),
      emotionalTriggers: split(fd.emotionalTriggers),
    },
    trust: {
      objections: split(fd.objections),
      testimonials: split(fd.testimonials),
      indicators: split(fd.trustIndicators),
    },
    conversion: {
      primaryCTA: fd.primaryCTAText || "",
      secondaryCTA: fd.secondaryCTAText || null,
      primaryKPI: fd.primaryConversionKPI || "",
    },
    messaging: {
      tone: fd.toneOfVoice || "",
      seoKeywords: split(fd.targetSEOKeywords),
      eventTracking: split(fd.eventTrackingSetup),
    },
    branding: {
      colorPalette: { raw: fd.brandColorPalette || "" },
      fonts: fd.fontStyleGuide || "",
      layoutPreference: fd.pageLayoutPreference || "",
    },
    media: {
      videoUrl: fd.videoURL?.trim() ? fd.videoURL : null,
      privacyPolicyUrl: fd.privacyPolicyURL || "",
      consentText: fd.gdprCcpaConsentText || "",
    },
    advanced: {
      formFields: split(fd.formFieldsConfig),
      analytics: { rawIDs: fd.analyticsIDs || "", gtag: fd.gtagID || "" },
      customPrompt: fd.customPrompt || "",
    },
    assets: {
      // We cannot serialize File objects directly in URL – pass file name placeholders; actual upload handled later.
      logo: fd.logoUpload ? { name: fd.logoUpload.name } : null,
      heroImage: fd.heroImage ? { name: fd.heroImage.name } : null,
      secondaryImages: (fd.secondaryImages || []).map((f) => ({ name: f.name })),
    },
  }
}

export function LandingPageForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({
    // Prefilled sample data for faster testing
    campaignObjective: "Generate high-conversion landing page for SaaS platform",
    productServiceName: "DeployPro",
    primaryOffer: "14-day enterprise trial",

    targetAudienceDescription: "Senior DevOps engineers at scaling SaaS companies",
    buyerPersonaKeywords: "DevOps, automation, multi-cloud, reliability",
    uniqueValueProposition: "Policy-driven multi-region deployments with real-time rollback capabilities.",

    topBenefits: "10x faster deployments\n99.99% uptime\nZero-config rollback",
    featureList: "Declarative pipelines\nReal-time analytics\nMulti-cloud orchestration\nAPI-first integration",
    emotionalTriggers: "Trust\nConfidence\nControl\nUrgency",

    objections: "Too expensive\nComplex setup\nVendor lock-in",
    testimonials: '"Cut deployment time from hours to minutes" - A. Patel\n"Rock-solid reliability" - J. Gomez',
    trustIndicators: "10K+ customers\nISO 27001\nSOC 2 Type II\n99.99% SLA",

    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "View Pricing",
    primaryConversionKPI: "5% sign-ups",

    toneOfVoice: "Technical",
    targetSEOKeywords: "DevOps automation, multi-region deployment, rollback, SLA",
    eventTrackingSetup: "button_click, form_submit, cta_hover",

    brandColorPalette: "Primary: #0EA5E9, Accent: #8B5CF6, Neutral: #0F172A",
    fontStyleGuide: "Heading: Inter Bold, Body: Manrope Regular",
    pageLayoutPreference: "Single scroll hero",
    logoUpload: null,
    heroImage: null,
    secondaryImages: [],

    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Terms and Privacy Policy.",

    formFieldsConfig: "Name, Email, Company, Role",
    analyticsIDs: "GA ID: G-XXXXXXX, GTM ID: GTM-YYYYYYY",
    gtagID: "G-ABCDEF1234",
    customPrompt: "Make copy highly technical emphasizing deployment velocity and reliability SLAs.",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentStepData = STEPS.find((s) => s.id === currentStep)!
  const progress = (currentStep / STEPS.length) * 100

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (!files) return

    if (field === "secondaryImages") {
      setFormData((prev) => ({
        ...prev,
        secondaryImages: [...(prev.secondaryImages || []), ...Array.from(files)],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: files[0],
      }))
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const removeFile = (field: string, index?: number) => {
    if (field === "secondaryImages" && index !== undefined) {
      setFormData((prev) => ({
        ...prev,
        secondaryImages: prev.secondaryImages?.filter((_, i) => i !== index) || [],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: null,
      }))
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    currentStepData.fields.forEach((field) => {
      if (field === "videoURL" || field === "secondaryCTAText" || field === "heroImage") {
        // These are optional
        return
      }

      const value = formData[field as keyof FormData]

      if (field === "secondaryImages") {
        // Optional
        return
      }

      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field] = "This field is required"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    // Build normalized payload and navigate to builder route with encoded data
    const payload = buildPayload(formData)
    try {
      const encoded = encodeURIComponent(JSON.stringify(payload))
      router.push(`/builder?payload=${encoded}`)
    } catch (err) {
      console.error('Failed to encode payload', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-accent transition-colors mb-4 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-sans">Create Your Landing Page</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {STEPS.length} — {currentStepData.title}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1 bg-card rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-accent to-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Form Card */}
        <div className="bg-card/50 border border-border/50 rounded-2xl p-8 sm:p-10 backdrop-blur-sm">
          {/* Step Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 font-sans">{currentStepData.title}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 mb-8">
            {currentStepData.fields.map((field) => {
              const config = FIELD_LABELS[field]
              const value = formData[field as keyof FormData]
              const stringValue = typeof value === "string" ? value : ""
              const error = errors[field]

              if (config.type === "file") {
                if (field === "secondaryImages") {
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-2">{config.label}</label>
                      {config.description && <p className="text-xs text-muted-foreground mb-3">{config.description}</p>}

                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-accent transition-colors bg-background/50 group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload images</p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(field, e.target.files)}
                          className="hidden"
                        />
                      </label>

                      {/* Display uploaded files */}
                      {(value as File[])?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {(value as File[]).map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-border/50"
                            >
                              <span className="text-sm text-muted-foreground truncate">{file.name}</span>
                              <button
                                onClick={() => removeFile(field, idx)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2">{config.label}</label>
                    {config.description && <p className="text-xs text-muted-foreground mb-3">{config.description}</p>}

                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-accent transition-colors bg-background/50 group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(field, e.target.files)}
                        className="hidden"
                      />
                    </label>

                    {/* Display uploaded file */}
                    {value && (
                      <div className="mt-3 flex items-center justify-between bg-background/50 p-3 rounded-lg border border-border/50">
                        <span className="text-sm text-muted-foreground truncate">{(value as File).name}</span>
                        <button
                          onClick={() => removeFile(field)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                  </div>
                )
              }

              return (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2">{config.label}</label>
                  {config.description && <p className="text-xs text-muted-foreground mb-2">{config.description}</p>}
                  {config.type === "textarea" ? (
                    <Textarea
                      placeholder={config.placeholder}
                      value={stringValue}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className={`min-h-24 rounded-lg bg-background/50 border ${error ? "border-destructive" : "border-border/50"} focus:border-accent transition-colors`}
                    />
                  ) : (
                    <Input
                      placeholder={config.placeholder}
                      value={stringValue}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className={`rounded-lg bg-background/50 border ${error ? "border-destructive" : "border-border/50"} focus:border-accent transition-colors`}
                    />
                  )}
                  {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                </div>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1}
              variant="outline"
              className="flex-1 rounded-lg border-border hover:border-accent hover:bg-card/50 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Generate Landing Page
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Step indicators */}
          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all ${
                    step.id <= currentStep ? "bg-accent w-6" : "bg-border w-2"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStep}/{STEPS.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
