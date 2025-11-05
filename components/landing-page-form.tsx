"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, X } from "lucide-react"
import Link from "next/link"
import { usePayload } from "@/contexts/PayloadContext"

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
    label: "Company Logo (Optional)",
    description: "Upload your company logo (PNG, JPG, SVG)",
    type: "file",
  },
  heroImage: {
    label: "Hero Image (Optional)",
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
      // API expects string file names, not objects
      logo: fd.logoUpload ? fd.logoUpload.name : null,
      heroImage: fd.heroImage ? fd.heroImage.name : null,
      secondaryImages: (fd.secondaryImages || []).map((f) => f.name),
    },
  }
}

const DUMMY_DATA_SETS = [
  {
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
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Terms and Privacy Policy.",
    formFieldsConfig: "Name, Email, Company, Role",
    analyticsIDs: "GA ID: G-XXXXXXX, GTM ID: GTM-YYYYYYY",
    gtagID: "G-ABCDEF1234",
    customPrompt: "Make copy highly technical emphasizing deployment velocity and reliability SLAs.",
  },
  {
    campaignObjective: "Drive B2B demo bookings for AI analytics platform",
    productServiceName: "InsightAI",
    primaryOffer: "Free personalized demo + 30-day trial",
    targetAudienceDescription: "Data analysts and product managers at mid-market companies",
    buyerPersonaKeywords: "analytics, data-driven, insights, forecasting",
    uniqueValueProposition: "Turn raw data into actionable insights with AI-powered predictive analytics.",
    topBenefits: "5x faster insights\nPredictive accuracy\nNo-code setup",
    featureList: "Natural language queries\nAuto-generated dashboards\nAnomaly detection\nTeam collaboration",
    emotionalTriggers: "Clarity\nEmpowerment\nSpeed\nReassurance",
    objections: "Data security concerns\nIntegration complexity\nLearning curve",
    testimonials: '"Game-changer for quarterly planning" - M. Chen\n"Finally understand our metrics" - R. Singh',
    trustIndicators: "GDPR compliant\nSOC 2 Type II\n5K+ active users\n4.8/5 G2 rating",
    primaryCTAText: "Book a Demo",
    secondaryCTAText: "See How It Works",
    primaryConversionKPI: "10% demo bookings",
    toneOfVoice: "Friendly yet professional",
    targetSEOKeywords: "AI analytics, predictive insights, business intelligence, data visualization",
    eventTrackingSetup: "demo_request, video_play, pricing_view",
    brandColorPalette: "Primary: #10B981, Accent: #F59E0B, Neutral: #1F2937",
    fontStyleGuide: "Heading: Poppins SemiBold, Body: Inter Regular",
    pageLayoutPreference: "Two-column layout",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "By submitting, you agree to our Privacy Policy.",
    formFieldsConfig: "Full Name, Work Email, Company Size",
    analyticsIDs: "GA ID: G-YYYYYY, GTM ID: GTM-ZZZZZZ",
    gtagID: "G-INSGHT123",
    customPrompt: "Emphasize speed and ease of use. Keep tone upbeat and aspirational.",
  },
  {
    campaignObjective: "Increase free trial conversions for e-commerce personalization tool",
    productServiceName: "ShopBoost",
    primaryOffer: "Start free for 21 days - no credit card required",
    targetAudienceDescription: "E-commerce store owners using Shopify/WooCommerce",
    buyerPersonaKeywords: "conversion, personalization, revenue growth, A/B testing",
    uniqueValueProposition: "Increase AOV by 30% with AI-powered product recommendations and cart recovery.",
    topBenefits: "Boost conversions\nRecover abandoned carts\nPersonalize every visit",
    featureList: "Smart recommendations\nCart abandonment emails\nA/B testing\nReal-time analytics",
    emotionalTriggers: "Growth\nControl\nSuccess\nExcitement",
    objections: "Will it work with my store?\nPrice concerns\nSetup time",
    testimonials: '"Recovered $12K in abandoned carts in the first month" - L. Martinez\n"Setup took 10 minutes" - K. Patel',
    trustIndicators: "15K+ stores\n$50M+ revenue generated\nShopify Plus partner\n30-day guarantee",
    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "Watch Demo",
    primaryConversionKPI: "8% trial conversions",
    toneOfVoice: "Energetic and results-focused",
    targetSEOKeywords: "e-commerce personalization, cart recovery, product recommendations, Shopify app",
    eventTrackingSetup: "trial_start, demo_watch, pricing_click",
    brandColorPalette: "Primary: #EC4899, Accent: #8B5CF6, Neutral: #111827",
    fontStyleGuide: "Heading: Montserrat Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Hero + feature grid",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I accept the Terms of Service and Privacy Policy.",
    formFieldsConfig: "Name, Email, Store URL",
    analyticsIDs: "GA ID: G-SHOPBST, GTM ID: GTM-BOOST99",
    gtagID: "G-SHOPBST456",
    customPrompt: "Focus on revenue impact and ease of setup. Include social proof prominently.",
  },
  {
    campaignObjective: "Generate qualified leads for project management software",
    productServiceName: "TaskFlow",
    primaryOffer: "Free for teams up to 10 users",
    targetAudienceDescription: "Project managers and team leads at growing startups",
    buyerPersonaKeywords: "productivity, collaboration, deadlines, transparency",
    uniqueValueProposition: "Keep every project on track with visual boards, automated workflows, and real-time updates.",
    topBenefits: "Never miss a deadline\nTeam transparency\nEffortless collaboration",
    featureList: "Kanban & Gantt views\nAutomated task assignment\nTime tracking\nIntegrations with Slack & GitHub",
    emotionalTriggers: "Relief\nControl\nClarity\nProgress",
    objections: "Too complex for small teams\nMigration from current tool\nCost",
    testimonials: '"Brought our remote team together seamlessly" - T. Johnson\n"Finally ditched spreadsheets" - N. Kumar',
    trustIndicators: "50K+ teams\nTrusted by Fortune 500\n99.9% uptime\nFree forever plan",
    primaryCTAText: "Get Started Free",
    secondaryCTAText: "View Features",
    primaryConversionKPI: "12% trial-to-paid",
    toneOfVoice: "Clear and encouraging",
    targetSEOKeywords: "project management software, task tracking, team collaboration, agile tools",
    eventTrackingSetup: "signup, feature_tour, upgrade_click",
    brandColorPalette: "Primary: #3B82F6, Accent: #F97316, Neutral: #18181B",
    fontStyleGuide: "Heading: Work Sans SemiBold, Body: Source Sans Pro",
    pageLayoutPreference: "Split hero",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive product updates and accept the Privacy Policy.",
    formFieldsConfig: "Name, Email, Team Size",
    analyticsIDs: "GA ID: G-TASKFLW, GTM ID: GTM-FLOW001",
    gtagID: "G-TASKFLOW99",
    customPrompt: "Stress simplicity and team alignment. Use friendly, aspirational language.",
  },
  {
    campaignObjective: "Drive enterprise sales for cybersecurity compliance platform",
    productServiceName: "SecureShield",
    primaryOffer: "Schedule a personalized security audit",
    targetAudienceDescription: "CISOs and compliance officers at mid-to-large enterprises",
    buyerPersonaKeywords: "compliance, security, risk management, audit readiness",
    uniqueValueProposition: "Achieve SOC 2, ISO 27001, and GDPR compliance faster with automated evidence collection and monitoring.",
    topBenefits: "Continuous compliance\nReduce audit prep by 80%\nReal-time risk visibility",
    featureList: "Automated evidence collection\nCompliance dashboard\nRisk scoring\nIntegrations with AWS, Azure, GCP",
    emotionalTriggers: "Security\nConfidence\nPreparedness\nReassurance",
    objections: "Implementation time\nIntegration complexity\nCost justification",
    testimonials: '"Passed our SOC 2 audit on the first try" - D. Lee\n"Cut compliance overhead by 70%" - S. Brown',
    trustIndicators: "500+ enterprises\nSOC 2 Type II certified\nISO 27001 certified\nPenetration tested quarterly",
    primaryCTAText: "Request Security Audit",
    secondaryCTAText: "Download Compliance Guide",
    primaryConversionKPI: "15% audit requests",
    toneOfVoice: "Authoritative and reassuring",
    targetSEOKeywords: "compliance automation, SOC 2, ISO 27001, cybersecurity platform, audit preparation",
    eventTrackingSetup: "audit_request, guide_download, pricing_inquiry",
    brandColorPalette: "Primary: #0F172A, Accent: #14B8A6, Neutral: #64748B",
    fontStyleGuide: "Heading: IBM Plex Sans SemiBold, Body: IBM Plex Sans Regular",
    pageLayoutPreference: "Executive layout",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I consent to SecureShield contacting me about compliance solutions.",
    formFieldsConfig: "Full Name, Corporate Email, Company Name, Role",
    analyticsIDs: "GA ID: G-SECURE01, GTM ID: GTM-SHIELD99",
    gtagID: "G-SHIELD001",
    customPrompt: "Emphasize trust, authority, and risk mitigation. Target enterprise decision-makers.",
  },
  {
    campaignObjective: "Boost sign-ups for online course platform",
    productServiceName: "LearnVerse",
    primaryOffer: "First course free + 7-day trial of premium",
    targetAudienceDescription: "Working professionals seeking career advancement through upskilling",
    buyerPersonaKeywords: "learning, career growth, certification, skill development",
    uniqueValueProposition: "Master in-demand skills with expert-led courses, hands-on projects, and career mentorship.",
    topBenefits: "Learn at your own pace\nIndustry-recognized certificates\nCareer mentorship included",
    featureList: "5000+ courses\nHands-on projects\n1-on-1 mentorship\nCertificates of completion",
    emotionalTriggers: "Ambition\nEmpowerment\nProgress\nRecognition",
    objections: "Time commitment\nValue for money\nCourse quality",
    testimonials: '"Landed my dream job after completing 3 courses" - A. Williams\n"Best learning investment I made" - R. Patel',
    trustIndicators: "2M+ learners\n95% completion rate\nPartnerships with Google & AWS\n30-day refund guarantee",
    primaryCTAText: "Start Learning Free",
    secondaryCTAText: "Browse Courses",
    primaryConversionKPI: "18% free-to-premium",
    toneOfVoice: "Motivational and supportive",
    targetSEOKeywords: "online courses, career development, professional training, skill certifications",
    eventTrackingSetup: "course_start, certification_view, mentor_request",
    brandColorPalette: "Primary: #7C3AED, Accent: #FBBF24, Neutral: #1E293B",
    fontStyleGuide: "Heading: Nunito Bold, Body: Lato Regular",
    pageLayoutPreference: "Story-driven hero",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive course recommendations and newsletters.",
    formFieldsConfig: "Name, Email, Career Goal",
    analyticsIDs: "GA ID: G-LEARN123, GTM ID: GTM-VERSE01",
    gtagID: "G-LEARNVERSE",
    customPrompt: "Inspire action and highlight career transformation. Use aspirational storytelling.",
  },
  {
    campaignObjective: "Increase subscriptions for marketing automation platform",
    productServiceName: "CampaignGenius",
    primaryOffer: "Start with 1,000 free emails per month",
    targetAudienceDescription: "Marketing managers at B2B SaaS companies",
    buyerPersonaKeywords: "automation, lead nurturing, email marketing, conversion",
    uniqueValueProposition: "Turn leads into customers with AI-powered email campaigns, behavioral triggers, and deep analytics.",
    topBenefits: "Automate lead nurturing\n3x higher open rates\nPersonalization at scale",
    featureList: "Behavioral triggers\nA/B testing\nAdvanced segmentation\nCRM integrations",
    emotionalTriggers: "Efficiency\nResults\nConfidence\nInnovation",
    objections: "Integration complexity\nLearning curve\nPricing transparency",
    testimonials: '"Tripled our demo bookings in 2 months" - J. Carter\n"Best ROI of any marketing tool we use" - M. Zhao',
    trustIndicators: "20K+ companies\n1B+ emails sent\nIntegrates with Salesforce & HubSpot\n14-day trial",
    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "See Pricing",
    primaryConversionKPI: "10% free-to-paid",
    toneOfVoice: "Professional and results-driven",
    targetSEOKeywords: "marketing automation, email campaigns, lead nurturing, B2B marketing software",
    eventTrackingSetup: "trial_start, integration_click, template_preview",
    brandColorPalette: "Primary: #06B6D4, Accent: #FB923C, Neutral: #0F172A",
    fontStyleGuide: "Heading: DM Sans Bold, Body: Inter Regular",
    pageLayoutPreference: "Feature showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I consent to receive marketing insights and product updates.",
    formFieldsConfig: "Name, Work Email, Company Website",
    analyticsIDs: "GA ID: G-CAMPAIGN99, GTM ID: GTM-GENIUS01",
    gtagID: "G-GENIUS123",
    customPrompt: "Emphasize ROI and measurable results. Target growth-focused marketers.",
  },
  {
    campaignObjective: "Generate trials for AI-powered customer support platform",
    productServiceName: "HelpMateAI",
    primaryOffer: "Free for up to 100 tickets per month",
    targetAudienceDescription: "Customer success leaders at scaling SaaS startups",
    buyerPersonaKeywords: "customer support, AI automation, ticket management, customer satisfaction",
    uniqueValueProposition: "Resolve 60% of support tickets instantly with AI while keeping your team focused on complex issues.",
    topBenefits: "60% faster response time\nReduce support costs\n24/7 automated coverage",
    featureList: "AI-powered ticket routing\nSmart suggestions\nMulti-channel support\nSentiment analysis",
    emotionalTriggers: "Relief\nEfficiency\nCustomer satisfaction\nScalability",
    objections: "AI accuracy concerns\nIntegration with existing tools\nCustomer experience impact",
    testimonials: '"Our CSAT score jumped from 78% to 94%" - L. Garcia\n"Scaled support without hiring" - P. Nguyen',
    trustIndicators: "1K+ support teams\n10M+ tickets resolved\nIntegrates with Zendesk & Intercom\nGDPR compliant",
    primaryCTAText: "Try Free",
    secondaryCTAText: "See How It Works",
    primaryConversionKPI: "14% trial conversions",
    toneOfVoice: "Helpful and reassuring",
    targetSEOKeywords: "AI customer support, automated ticketing, help desk software, customer service automation",
    eventTrackingSetup: "trial_start, integration_setup, ai_demo_watch",
    brandColorPalette: "Primary: #8B5CF6, Accent: #34D399, Neutral: #111827",
    fontStyleGuide: "Heading: Outfit SemiBold, Body: Karla Regular",
    pageLayoutPreference: "Problem-solution layout",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Terms and Privacy Policy.",
    formFieldsConfig: "Name, Email, Monthly Ticket Volume",
    analyticsIDs: "GA ID: G-HELPMATE, GTM ID: GTM-AI001",
    gtagID: "G-HELPMATE01",
    customPrompt: "Focus on efficiency gains and customer satisfaction improvement. Use empathetic language.",
  },
  {
    campaignObjective: "Drive downloads for mobile fitness app",
    productServiceName: "FitSync",
    primaryOffer: "Download free + 30-day premium trial",
    targetAudienceDescription: "Busy professionals looking to stay fit without gym memberships",
    buyerPersonaKeywords: "fitness, wellness, home workouts, health tracking",
    uniqueValueProposition: "Get personalized workout plans, nutrition tracking, and live coaching—all from your phone.",
    topBenefits: "No gym required\nPersonalized plans\nLive coaching sessions",
    featureList: "AI workout planner\nNutrition tracker\nProgress analytics\nLive virtual classes",
    emotionalTriggers: "Health\nMotivation\nAchievement\nConfidence",
    objections: "Motivation concerns\nEquipment requirements\nPrice vs gym membership",
    testimonials: '"Lost 15 lbs in 2 months without a gym" - C. Roberts\n"Best fitness investment I made" - D. Kim',
    trustIndicators: "500K+ downloads\n4.9/5 App Store rating\nFeatured in Forbes & TechCrunch\n30-day guarantee",
    primaryCTAText: "Download Free",
    secondaryCTAText: "See Plans",
    primaryConversionKPI: "20% free-to-premium",
    toneOfVoice: "Energetic and motivational",
    targetSEOKeywords: "home workout app, fitness tracker, personal training app, nutrition planner",
    eventTrackingSetup: "app_download, workout_start, premium_upgrade",
    brandColorPalette: "Primary: #EF4444, Accent: #F59E0B, Neutral: #18181B",
    fontStyleGuide: "Heading: Poppins Bold, Body: Roboto Regular",
    pageLayoutPreference: "Mobile-first hero",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive workout tips and app updates.",
    formFieldsConfig: "Name, Email, Fitness Goal",
    analyticsIDs: "GA ID: G-FITSYNC01, GTM ID: GTM-FIT123",
    gtagID: "G-FITSYNC99",
    customPrompt: "Inspire action with transformation stories. Emphasize convenience and results.",
  },
  {
    campaignObjective: "Increase bookings for vacation rental management platform",
    productServiceName: "StayManager",
    primaryOffer: "First 3 months free for new hosts",
    targetAudienceDescription: "Property owners managing short-term vacation rentals",
    buyerPersonaKeywords: "rental management, automation, bookings, revenue optimization",
    uniqueValueProposition: "Maximize occupancy and revenue with automated pricing, guest communication, and channel management.",
    topBenefits: "Automate guest messaging\nDynamic pricing\nSync all booking channels",
    featureList: "Channel sync (Airbnb, Vrbo)\nSmart pricing\nAutomated messaging\nCleaning schedules",
    emotionalTriggers: "Freedom\nRevenue growth\nControl\nSimplicity",
    objections: "Setup complexity\nCost vs manual management\nChannel conflicts",
    testimonials: '"Increased bookings by 40% in first quarter" - B. Thompson\n"Saves me 10 hours per week" - F. Martinez',
    trustIndicators: "10K+ properties managed\n$500M+ revenue generated\nIntegrates with all major OTAs\n24/7 support",
    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "See Demo",
    primaryConversionKPI: "12% trial-to-paid",
    toneOfVoice: "Professional yet approachable",
    targetSEOKeywords: "vacation rental software, property management, Airbnb automation, channel manager",
    eventTrackingSetup: "trial_start, demo_request, pricing_view",
    brandColorPalette: "Primary: #0891B2, Accent: #F97316, Neutral: #1E293B",
    fontStyleGuide: "Heading: Raleway Bold, Body: Nunito Regular",
    pageLayoutPreference: "Benefit-driven layout",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Terms of Service and Privacy Policy.",
    formFieldsConfig: "Name, Email, Number of Properties",
    analyticsIDs: "GA ID: G-STAYMGR, GTM ID: GTM-STAY001",
    gtagID: "G-STAYMGR99",
    customPrompt: "Emphasize time savings and revenue growth. Use host success stories.",
  },
  {
    campaignObjective: "Drive enterprise sales for video conferencing platform",
    productServiceName: "MeetStream",
    primaryOffer: "Schedule a private demo for your team",
    targetAudienceDescription: "IT directors and executives at enterprise companies",
    buyerPersonaKeywords: "video conferencing, remote work, enterprise security, scalability",
    uniqueValueProposition: "Enterprise-grade video conferencing with end-to-end encryption, unlimited meetings, and white-glove support.",
    topBenefits: "Enterprise security\nUnlimited participants\nWhite-glove support",
    featureList: "End-to-end encryption\nCustom branding\nSSO integration\nAdvanced analytics",
    emotionalTriggers: "Security\nReliability\nControl\nTrust",
    objections: "Migration from current solution\nCost vs competitors\nUser adoption",
    testimonials: '"Seamless transition from our legacy system" - H. Anderson\n"Best reliability in the industry" - K. Foster',
    trustIndicators: "Fortune 100 customers\nSOC 2 & ISO 27001\n99.99% uptime SLA\n24/7/365 support",
    primaryCTAText: "Request Enterprise Demo",
    secondaryCTAText: "Download Security Whitepaper",
    primaryConversionKPI: "8% demo-to-deal",
    toneOfVoice: "Corporate and trustworthy",
    targetSEOKeywords: "enterprise video conferencing, secure video meetings, business communication platform",
    eventTrackingSetup: "demo_request, whitepaper_download, pricing_inquiry",
    brandColorPalette: "Primary: #1E40AF, Accent: #10B981, Neutral: #0F172A",
    fontStyleGuide: "Heading: Plus Jakarta Sans Bold, Body: Inter Regular",
    pageLayoutPreference: "Enterprise showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I consent to be contacted regarding enterprise solutions.",
    formFieldsConfig: "Full Name, Corporate Email, Company, Number of Employees",
    analyticsIDs: "GA ID: G-MEET001, GTM ID: GTM-STREAM99",
    gtagID: "G-MEETSTREAM",
    customPrompt: "Target enterprise decision-makers. Emphasize security, reliability, and compliance.",
  },
  {
    campaignObjective: "Generate leads for legal document automation SaaS",
    productServiceName: "ContractIQ",
    primaryOffer: "Generate 10 contracts free",
    targetAudienceDescription: "Legal ops teams and corporate counsel at growing companies",
    buyerPersonaKeywords: "contract automation, legal tech, document generation, compliance",
    uniqueValueProposition: "Generate, review, and e-sign contracts 10x faster with AI-powered legal automation.",
    topBenefits: "10x faster contract creation\nReduce legal spend\nBuilt-in compliance checks",
    featureList: "Template library\nAI clause suggestions\nE-signature integration\nCompliance alerts",
    emotionalTriggers: "Efficiency\nAccuracy\nControl\nPeace of mind",
    objections: "Legal accuracy concerns\nIntegration with current systems\nCost justification",
    testimonials: '"Cut contract turnaround from 5 days to 2 hours" - E. Davis\n"Reduced legal review costs by 60%" - A. Lopez',
    trustIndicators: "2K+ legal teams\nABA Tech Show winner\nSOC 2 certified\nBank-level encryption",
    primaryCTAText: "Try Free",
    secondaryCTAText: "Book Demo",
    primaryConversionKPI: "15% trial conversions",
    toneOfVoice: "Professional and precise",
    targetSEOKeywords: "contract automation, legal document software, AI legal tech, contract management",
    eventTrackingSetup: "trial_start, template_select, demo_book",
    brandColorPalette: "Primary: #0F766E, Accent: #F59E0B, Neutral: #18181B",
    fontStyleGuide: "Heading: Merriweather Bold, Body: Source Sans Pro",
    pageLayoutPreference: "Trust-first layout",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Terms of Service and Privacy Policy.",
    formFieldsConfig: "Name, Email, Company, Legal Team Size",
    analyticsIDs: "GA ID: G-CONTRACT, GTM ID: GTM-IQ001",
    gtagID: "G-CONTRACTIQ",
    customPrompt: "Emphasize accuracy, speed, and cost savings. Target legal and compliance professionals.",
  },
]

export function LandingPageForm() {
  const router = useRouter()
  const { setPayload } = usePayload()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({})
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
      if (field === "videoURL" || field === "secondaryCTAText" || field === "heroImage" || field === "logoUpload") {
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
    // Build normalized payload and set it in context
    const payload = buildPayload(formData)
    console.log('[form] Built payload from formData:', payload)
    console.log('[form] FormData state:', formData)
    setPayload(payload)
    router.push('/builder')
  }

  const fillDummyData = () => {
    const randomSet = DUMMY_DATA_SETS[Math.floor(Math.random() * DUMMY_DATA_SETS.length)]
    setFormData({
      ...randomSet,
      logoUpload: null,
      heroImage: null,
      secondaryImages: [],
    })
    setErrors({})
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={fillDummyData}
        className="fixed bottom-4 left-4 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-20 hover:opacity-100"
        type="button"
      >
        Fill Dummy
      </button>
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
