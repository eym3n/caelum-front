"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, X, Dices } from "lucide-react"
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
  // Image asset fields now store public URLs (uploaded via /v1/uploads/upload-image)
  logoUpload: string | null
  heroImage: string | null
  secondaryImages: string[]

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
        // Now already storing public URLs
        logo: fd.logoUpload || null,
        heroImage: fd.heroImage || null,
        secondaryImages: fd.secondaryImages || [],
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
    customPrompt: "Make copy highly technical emphasizing deployment velocity and reliability SLAs. Use a dark theme with code snippets in hero section, minimalist icons for features, and a bold gradient CTA button.",
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
    customPrompt: "Emphasize speed and ease of use. Keep tone upbeat and aspirational. Incorporate interactive data charts in the hero, use a light color scheme with green accents, and add animated progress bars for benefits.",
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
    customPrompt: "Focus on revenue impact and ease of setup. Include social proof prominently. Use a vibrant pink-purple gradient background, integrate product mockups in features, and add hover effects on CTAs for interactivity.",
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
    customPrompt: "Stress simplicity and team alignment. Use friendly, aspirational language. Design with a clean split-screen layout, blue-orange color scheme, and include drag-and-drop demo images for features.",
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
    customPrompt: "Emphasize trust, authority, and risk mitigation. Target enterprise decision-makers. Use a sleek dark theme with teal accents, incorporate security icons and badges, and add a prominent trust section with certifications.",
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
    customPrompt: "Inspire action and highlight career transformation. Use aspirational storytelling. Design with a purple-yellow palette, include student testimonial videos, and use a card-based layout for course previews.",
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
    customPrompt: "Emphasize ROI and measurable results. Target growth-focused marketers. Use a cyan-orange color scheme, feature interactive email templates, and add metric graphs in the benefits section.",
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
    customPrompt: "Focus on efficiency gains and customer satisfaction improvement. Use empathetic language. Design with a purple-green theme, include before-after comparison visuals, and use rounded buttons with soft shadows.",
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
    customPrompt: "Inspire action with transformation stories. Emphasize convenience and results. Use a red-orange energetic palette, showcase app screenshots prominently, and add parallax scrolling for a dynamic feel.",
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
    customPrompt: "Emphasize time savings and revenue growth. Use host success stories. Design with a cyan-orange scheme, include property listing mockups, and use a grid layout for benefits with hover animations.",
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
    customPrompt: "Target enterprise decision-makers. Emphasize security, reliability, and compliance. Use a blue-green corporate palette, feature video thumbnails, and incorporate a sleek, minimalist design with bold headings.",
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
    customPrompt: "Emphasize accuracy, speed, and cost savings. Target legal and compliance professionals. Design with a teal-amber color scheme, include document preview images, and use a clean, serif font for a trustworthy feel.",
  },
  // New 10 dummy data companies added below
  {
    campaignObjective: "Boost conversions for meal planning app",
    productServiceName: "MealMate",
    primaryOffer: "Free 7-day meal plan + premium trial",
    targetAudienceDescription: "Health-conscious families and busy professionals",
    buyerPersonaKeywords: "meal planning, nutrition, healthy eating, convenience",
    uniqueValueProposition: "Personalized meal plans and grocery lists delivered weekly to simplify healthy eating.",
    topBenefits: "Save time on meal prep\nEat healthier\nReduce food waste",
    featureList: "Customizable plans\nGrocery integration\nRecipe database\nNutritional tracking",
    emotionalTriggers: "Health\nFamily bonding\nConvenience\nSatisfaction",
    objections: "Cost of ingredients\nTime to learn app\nVariety concerns",
    testimonials: '"Lost 10 lbs and saved hours weekly" - S. Patel\n"Family loves the recipes" - J. Wong',
    trustIndicators: "1M+ users\nPartnered with nutritionists\n4.8/5 rating\nMoney-back guarantee",
    primaryCTAText: "Get Free Plan",
    secondaryCTAText: "Explore Recipes",
    primaryConversionKPI: "25% free-to-paid",
    toneOfVoice: "Friendly and approachable",
    targetSEOKeywords: "meal planning app, healthy recipes, nutrition tracker, grocery list",
    eventTrackingSetup: "plan_download, recipe_view, premium_signup",
    brandColorPalette: "Primary: #22C55E, Accent: #F97316, Neutral: #1F2937",
    fontStyleGuide: "Heading: Roboto Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Card-based grid",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive meal ideas and updates.",
    formFieldsConfig: "Name, Email, Dietary Preferences",
    analyticsIDs: "GA ID: G-MEALMATE, GTM ID: GTM-MATE01",
    gtagID: "G-MEALMATE99",
    customPrompt: "Highlight family-friendly aspects and ease of use. Use a green-orange vibrant palette, include recipe cards with images, and add a carousel for testimonials with smooth transitions.",
  },
  {
    campaignObjective: "Drive sign-ups for freelance marketplace",
    productServiceName: "GigConnect",
    primaryOffer: "Post your first job free",
    targetAudienceDescription: "Small businesses and freelancers seeking quick projects",
    buyerPersonaKeywords: "freelancing, gigs, remote work, networking",
    uniqueValueProposition: "Connect with vetted freelancers instantly for projects of any size.",
    topBenefits: "Find talent fast\nQuality guaranteed\nSecure payments",
    featureList: "Freelancer profiles\nProject bidding\nEscrow payments\nReview system",
    emotionalTriggers: "Opportunity\nTrust\nGrowth\nFreedom",
    objections: "Finding the right fit\nPayment security\nPlatform fees",
    testimonials: '"Hired a designer in 24 hours" - M. Lee\n"Best gigs I\'ve found" - A. Kumar',
    trustIndicators: "500K+ freelancers\n99% success rate\nVerified profiles\n24/7 support",
    primaryCTAText: "Post a Job",
    secondaryCTAText: "Browse Freelancers",
    primaryConversionKPI: "20% job postings",
    toneOfVoice: "Dynamic and engaging",
    targetSEOKeywords: "freelance marketplace, hire freelancers, remote jobs, gig economy",
    eventTrackingSetup: "job_post, freelancer_search, hire_click",
    brandColorPalette: "Primary: #6366F1, Accent: #EC4899, Neutral: #0F172A",
    fontStyleGuide: "Heading: Montserrat Bold, Body: Lato Regular",
    pageLayoutPreference: "Search-focused layout",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Terms and Privacy Policy.",
    formFieldsConfig: "Name, Email, Job Type",
    analyticsIDs: "GA ID: G-GIGCONN, GTM ID: GTM-CONN01",
    gtagID: "G-GIGCONNECT",
    customPrompt: "Emphasize speed and reliability. Use an indigo-pink color scheme, feature user avatars and project examples, and incorporate a live search bar in the hero.",
  },
  {
    campaignObjective: "Increase subscriptions for meditation app",
    productServiceName: "ZenMind",
    primaryOffer: "Free guided session + 14-day trial",
    targetAudienceDescription: "Stressed professionals and wellness enthusiasts",
    buyerPersonaKeywords: "meditation, mindfulness, stress relief, mental health",
    uniqueValueProposition: "Achieve inner peace with personalized meditation sessions and progress tracking.",
    topBenefits: "Reduce stress\nImprove focus\nBetter sleep",
    featureList: "Guided meditations\nProgress tracking\nSleep stories\nCommunity challenges",
    emotionalTriggers: "Calm\nClarity\nWellness\nBalance",
    objections: "Time commitment\nApp effectiveness\nSubscription cost",
    testimonials: '"Sleep better than ever" - R. Chen\n"Life-changing app" - L. Torres',
    trustIndicators: "3M+ downloads\nBacked by psychologists\n4.9/5 rating\nFree forever basic",
    primaryCTAText: "Start Free",
    secondaryCTAText: "View Sessions",
    primaryConversionKPI: "30% free-to-paid",
    toneOfVoice: "Calm and reassuring",
    targetSEOKeywords: "meditation app, mindfulness, stress relief, guided meditation",
    eventTrackingSetup: "session_start, progress_view, subscribe_click",
    brandColorPalette: "Primary: #06B6D4, Accent: #8B5CF6, Neutral: #1E293B",
    fontStyleGuide: "Heading: Serif Bold, Body: Sans Serif Regular",
    pageLayoutPreference: "Minimalist hero",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive wellness tips.",
    formFieldsConfig: "Name, Email, Stress Level",
    analyticsIDs: "GA ID: G-ZENMIND, GTM ID: GTM-MIND01",
    gtagID: "G-ZENMIND99",
    customPrompt: "Promote relaxation and mental health benefits. Use a cyan-purple soothing palette, include serene background images, and add subtle animations for a calming effect.",
  },
  {
    campaignObjective: "Generate leads for HR management software",
    productServiceName: "PeopleHub",
    primaryOffer: "Free HR audit + 30-day trial",
    targetAudienceDescription: "HR managers at mid-sized companies",
    buyerPersonaKeywords: "HR management, employee engagement, payroll, compliance",
    uniqueValueProposition: "Streamline HR processes with all-in-one employee management and analytics.",
    topBenefits: "Automate payroll\nBoost engagement\nEnsure compliance",
    featureList: "Employee database\nPayroll integration\nPerformance reviews\nCompliance tracking",
    emotionalTriggers: "Efficiency\nFairness\nGrowth\nSecurity",
    objections: "Data migration\nUser training\nIntegration costs",
    testimonials: '"Simplified our HR by 50%" - K. Johnson\n"Employees love the portal" - T. Nguyen',
    trustIndicators: "5K+ companies\nGDPR compliant\n99.9% uptime\nAward-winning support",
    primaryCTAText: "Get Free Audit",
    secondaryCTAText: "See Features",
    primaryConversionKPI: "18% trial starts",
    toneOfVoice: "Supportive and professional",
    targetSEOKeywords: "HR software, employee management, payroll automation, HR compliance",
    eventTrackingSetup: "audit_request, feature_demo, trial_signup",
    brandColorPalette: "Primary: #059669, Accent: #DC2626, Neutral: #111827",
    fontStyleGuide: "Heading: Helvetica Bold, Body: Arial Regular",
    pageLayoutPreference: "Dashboard preview",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Privacy Policy.",
    formFieldsConfig: "Name, Email, Company Size",
    analyticsIDs: "GA ID: G-PEOPLEHUB, GTM ID: GTM-HUB01",
    gtagID: "G-PEOPLEHUB",
    customPrompt: "Focus on employee satisfaction and operational efficiency. Use a green-red professional palette, showcase dashboard screenshots, and include interactive tooltips for features.",
  },
  {
    campaignObjective: "Boost downloads for language learning app",
    productServiceName: "LinguaLearn",
    primaryOffer: "Learn 5 languages free",
    targetAudienceDescription: "Globally-minded travelers and students",
    buyerPersonaKeywords: "language learning, travel, education, fluency",
    uniqueValueProposition: "Master new languages with AI-powered lessons and real conversations.",
    topBenefits: "Learn anywhere\nSpeak fluently fast\nCultural immersion",
    featureList: "AI tutors\nConversation practice\nVocabulary games\nProgress tracking",
    emotionalTriggers: "Adventure\nConfidence\nConnection\nAchievement",
    objections: "Consistency\nPronunciation accuracy\nFree vs paid",
    testimonials: '"Spoke Spanish on my trip" - D. Smith\n"Fun and effective" - H. Garcia',
    trustIndicators: "10M+ learners\nOxford partnership\n4.7/5 rating\nOffline mode",
    primaryCTAText: "Download Free",
    secondaryCTAText: "Try a Lesson",
    primaryConversionKPI: "35% free-to-paid",
    toneOfVoice: "Exciting and inclusive",
    targetSEOKeywords: "language learning app, learn languages, AI tutor, conversation practice",
    eventTrackingSetup: "download, lesson_start, premium_upgrade",
    brandColorPalette: "Primary: #F59E0B, Accent: #3B82F6, Neutral: #0F172A",
    fontStyleGuide: "Heading: Poppins Bold, Body: Inter Regular",
    pageLayoutPreference: "Interactive demo",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive language tips.",
    formFieldsConfig: "Name, Email, Target Language",
    analyticsIDs: "GA ID: G-LINGUA, GTM ID: GTM-LEARN01",
    gtagID: "G-LINGUALRN",
    customPrompt: "Inspire global exploration. Use an orange-blue adventurous palette, include language flags and maps, and add gamified elements like progress badges.",
  },
  {
    campaignObjective: "Drive sales for smart home security system",
    productServiceName: "HomeGuard",
    primaryOffer: "Free installation + 60-day trial",
    targetAudienceDescription: "Homeowners concerned about security",
    buyerPersonaKeywords: "home security, smart devices, monitoring, protection",
    uniqueValueProposition: "Protect your home with AI-powered cameras, sensors, and 24/7 monitoring.",
    topBenefits: "Real-time alerts\nRemote access\nEasy installation",
    featureList: "HD cameras\nMotion sensors\nMobile app\nProfessional monitoring",
    emotionalTriggers: "Safety\nPeace of mind\nControl\nSecurity",
    objections: "Installation hassle\nCost vs traditional\nPrivacy concerns",
    testimonials: '"Caught a burglar before entry" - J. Brown\n"Peace of mind every day" - S. Lee',
    trustIndicators: "100K+ homes protected\nUL certified\n24/7 support\nMoney-back guarantee",
    primaryCTAText: "Get Protected",
    secondaryCTAText: "View Demo",
    primaryConversionKPI: "12% installations",
    toneOfVoice: "Reassuring and confident",
    targetSEOKeywords: "smart home security, home monitoring, security cameras, AI protection",
    eventTrackingSetup: "quote_request, demo_watch, install_book",
    brandColorPalette: "Primary: #7C2D12, Accent: #16A34A, Neutral: #F8FAFC",
    fontStyleGuide: "Heading: Arial Black, Body: Verdana Regular",
    pageLayoutPreference: "Security-focused hero",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Privacy Policy.",
    formFieldsConfig: "Name, Email, Home Address",
    analyticsIDs: "GA ID: G-HOMEGRD, GTM ID: GTM-GUARD01",
    gtagID: "G-HOMEGUARD",
    customPrompt: "Emphasize safety and reliability. Use a dark green-white palette for trust, include security footage previews, and add a bold, protective design with shield icons.",
  },
  {
    campaignObjective: "Increase trials for virtual event platform",
    productServiceName: "EventVirtua",
    primaryOffer: "Host 1 event free + unlimited attendees",
    targetAudienceDescription: "Event planners and marketers",
    buyerPersonaKeywords: "virtual events, webinars, networking, engagement",
    uniqueValueProposition: "Host engaging virtual events with interactive features and analytics.",
    topBenefits: "Unlimited attendees\nInteractive tools\nDetailed analytics",
    featureList: "Live streaming\nPolls & Q&A\nNetworking lounges\nCustom branding",
    emotionalTriggers: "Connection\nInnovation\nSuccess\nExcitement",
    objections: "Technical issues\nAudience engagement\nCost per event",
    testimonials: '"Engaged 5K attendees seamlessly" - P. Davis\n"Best ROI for events" - R. Kim',
    trustIndicators: "50K+ events hosted\n99.99% uptime\nIntegrates with Zoom\nEnterprise security",
    primaryCTAText: "Host Free Event",
    secondaryCTAText: "See Templates",
    primaryConversionKPI: "22% event hosts",
    toneOfVoice: "Innovative and collaborative",
    targetSEOKeywords: "virtual event platform, webinar software, online events, event management",
    eventTrackingSetup: "event_create, template_view, upgrade_click",
    brandColorPalette: "Primary: #8B5CF6, Accent: #F97316, Neutral: #1F2937",
    fontStyleGuide: "Heading: Futura Bold, Body: Calibri Regular",
    pageLayoutPreference: "Event gallery",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive event tips.",
    formFieldsConfig: "Name, Email, Event Type",
    analyticsIDs: "GA ID: G-EVENTV, GTM ID: GTM-VIRTUA01",
    gtagID: "G-EVENTVIRT",
    customPrompt: "Highlight interactivity and scalability. Use a purple-orange creative palette, feature event screenshots and videos, and use a masonry layout for galleries.",
  },
  {
    campaignObjective: "Generate leads for financial planning app",
    productServiceName: "WealthWise",
    primaryOffer: "Free financial assessment",
    targetAudienceDescription: "Young professionals building wealth",
    buyerPersonaKeywords: "financial planning, investing, budgeting, retirement",
    uniqueValueProposition: "Build wealth with personalized plans, automated savings, and expert advice.",
    topBenefits: "Save automatically\nInvest wisely\nTrack progress",
    featureList: "Budget tracker\nInvestment portfolios\nRetirement calculator\nFinancial coaching",
    emotionalTriggers: "Security\nGrowth\nConfidence\nFuture-proofing",
    objections: "Investment risks\nApp complexity\nFee structure",
    testimonials: '"Saved $10K in a year" - M. Taylor\n"Confident about my future" - L. Singh',
    trustIndicators: "1M+ users\nSEC registered\n4.8/5 rating\nFDIC insured",
    primaryCTAText: "Get Assessment",
    secondaryCTAText: "Learn Investing",
    primaryConversionKPI: "15% assessments",
    toneOfVoice: "Empowering and educational",
    targetSEOKeywords: "financial planning app, investment tracker, budgeting tool, wealth management",
    eventTrackingSetup: "assessment_start, invest_learn, signup_click",
    brandColorPalette: "Primary: #0D9488, Accent: #F59E0B, Neutral: #0F172A",
    fontStyleGuide: "Heading: Georgia Bold, Body: Times New Roman Regular",
    pageLayoutPreference: "Educational layout",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Privacy Policy.",
    formFieldsConfig: "Name, Email, Income Range",
    analyticsIDs: "GA ID: G-WEALTHW, GTM ID: GTM-WISE01",
    gtagID: "G-WEALTHWISE",
    customPrompt: "Promote financial literacy and growth. Use a teal-amber trustworthy palette, include charts and graphs, and add a step-by-step wizard for assessments.",
  },
  {
    campaignObjective: "Boost subscriptions for productivity tool",
    productServiceName: "FocusFlow",
    primaryOffer: "Free productivity audit + 14-day trial",
    targetAudienceDescription: "Remote workers and teams",
    buyerPersonaKeywords: "productivity, time management, focus, collaboration",
    uniqueValueProposition: "Boost productivity with task automation, focus timers, and team insights.",
    topBenefits: "Eliminate distractions\nAutomate tasks\nImprove collaboration",
    featureList: "Focus timers\nTask automation\nTeam dashboards\nIntegration with tools",
    emotionalTriggers: "Achievement\nBalance\nEfficiency\nControl",
    objections: "Learning curve\nIntegration issues\nCost vs free tools",
    testimonials: '"Doubled my output" - A. Martinez\n"Team is more productive" - S. Gupta',
    trustIndicators: "2M+ users\n99.9% uptime\nIntegrates with Slack\nFree basic plan",
    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "Take Audit",
    primaryConversionKPI: "28% trial-to-paid",
    toneOfVoice: "Motivating and practical",
    targetSEOKeywords: "productivity app, time management, focus tools, team collaboration",
    eventTrackingSetup: "audit_take, timer_start, team_invite",
    brandColorPalette: "Primary: #2563EB, Accent: #10B981, Neutral: #F1F5F9",
    fontStyleGuide: "Heading: Oswald Bold, Body: Roboto Regular",
    pageLayoutPreference: "Workflow demo",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive productivity tips.",
    formFieldsConfig: "Name, Email, Team Size",
    analyticsIDs: "GA ID: G-FOCUSFL, GTM ID: GTM-FLOW02",
    gtagID: "G-FOCUSFLOW",
    customPrompt: "Emphasize work-life balance and results. Use a blue-green fresh palette, showcase workflow diagrams, and include interactive timers in the demo section.",
  },
  {
    campaignObjective: "Drive downloads for travel booking app",
    productServiceName: "TripEase",
    primaryOffer: "Book first trip free",
    targetAudienceDescription: "Frequent travelers and vacation planners",
    buyerPersonaKeywords: "travel booking, deals, itineraries, experiences",
    uniqueValueProposition: "Plan perfect trips with personalized recommendations and exclusive deals.",
    topBenefits: "Save on bookings\nCustom itineraries\nExclusive deals",
    featureList: "Flight & hotel search\nItinerary builder\nLocal experiences\nPrice alerts",
    emotionalTriggers: "Adventure\nSavings\nExcitement\nRelaxation",
    objections: "Booking fees\nDeal authenticity\nApp usability",
    testimonials: '"Saved $500 on my vacation" - C. Wilson\n"Best travel app ever" - N. Ahmed',
    trustIndicators: "5M+ bookings\nTrusted by airlines\n4.9/5 rating\n24/7 support",
    primaryCTAText: "Book Free",
    secondaryCTAText: "Find Deals",
    primaryConversionKPI: "40% downloads",
    toneOfVoice: "Adventurous and helpful",
    targetSEOKeywords: "travel booking app, flight deals, hotel reservations, trip planner",
    eventTrackingSetup: "booking_start, deal_search, download_click",
    brandColorPalette: "Primary: #EA580C, Accent: #06B6D4, Neutral: #0F172A",
    fontStyleGuide: "Heading: Bebas Neue, Body: Arial Regular",
    pageLayoutPreference: "Destination showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive travel deals.",
    formFieldsConfig: "Name, Email, Favorite Destination",
    analyticsIDs: "GA ID: G-TRIPEASE, GTM ID: GTM-EASE01",
    gtagID: "G-TRIPEASE",
    customPrompt: "Inspire wanderlust with visuals. Use an orange-cyan vibrant palette, feature destination photos and maps, and add a swipeable gallery for deals.",
  },
  {
    campaignObjective: "Drive sign-ups for online tutoring platform",
    productServiceName: "TutorLink",
    primaryOffer: "Free trial lesson + personalized matching",
    targetAudienceDescription: "Students and parents seeking academic support",
    buyerPersonaKeywords: "education, tutoring, learning, grades",
    uniqueValueProposition: "Connect with expert tutors for personalized, one-on-one learning experiences.",
    topBenefits: "Improve grades\nFlexible scheduling\nExpert tutors",
    featureList: "Subject matching\nVideo sessions\nProgress tracking\nParent dashboard",
    emotionalTriggers: "Success\nConfidence\nSupport\nAchievement",
    objections: "Cost per session\nTutor quality\nScheduling conflicts",
    testimonials: '"My math grade went from C to A" - B. Thompson\n"Great tutors and easy to use" - M. Lee',
    trustIndicators: "10K+ students\nVerified tutors\n4.9/5 rating\nMoney-back guarantee",
    primaryCTAText: "Find a Tutor",
    secondaryCTAText: "View Subjects",
    primaryConversionKPI: "20% trial conversions",
    toneOfVoice: "Encouraging and educational",
    targetSEOKeywords: "online tutoring, academic help, private tutors, homework assistance",
    eventTrackingSetup: "lesson_book, subject_search, signup_click",
    brandColorPalette: "Primary: #7C3AED, Accent: #10B981, Neutral: #1F2937",
    fontStyleGuide: "Heading: Lato Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Subject grid",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive educational updates.",
    formFieldsConfig: "Name, Email, Grade Level",
    analyticsIDs: "GA ID: G-TUTORLK, GTM ID: GTM-LINK01",
    gtagID: "G-TUTORLINK",
    customPrompt: "Emphasize personalized learning and success stories. Use a purple-green palette, include tutor profiles, and add a search filter for subjects.",
  },
  {
    campaignObjective: "Increase subscriptions for recipe sharing app",
    productServiceName: "RecipeShare",
    primaryOffer: "Upload unlimited recipes free",
    targetAudienceDescription: "Home cooks and food enthusiasts",
    buyerPersonaKeywords: "cooking, recipes, food sharing, community",
    uniqueValueProposition: "Discover and share delicious recipes with a global community of cooks.",
    topBenefits: "Endless inspiration\nCommunity feedback\nEasy sharing",
    featureList: "Recipe upload\nRating system\nIngredient lists\nCooking tips",
    emotionalTriggers: "Creativity\nConnection\nJoy\nSatisfaction",
    objections: "Recipe originality\nApp clutter\nPremium features",
    testimonials: '"Found my signature dish here" - L. Garcia\n"Love the community" - R. Patel',
    trustIndicators: "2M+ recipes\nUser-generated\n4.8/5 rating\nFree basic plan",
    primaryCTAText: "Share Recipe",
    secondaryCTAText: "Browse Recipes",
    primaryConversionKPI: "25% uploads",
    toneOfVoice: "Warm and inviting",
    targetSEOKeywords: "recipe app, cooking recipes, food sharing, meal ideas",
    eventTrackingSetup: "recipe_upload, search_query, premium_upgrade",
    brandColorPalette: "Primary: #F97316, Accent: #EC4899, Neutral: #0F172A",
    fontStyleGuide: "Heading: Playfair Display Bold, Body: Roboto Regular",
    pageLayoutPreference: "Recipe gallery",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive recipe ideas.",
    formFieldsConfig: "Name, Email, Favorite Cuisine",
    analyticsIDs: "GA ID: G-RECIPE, GTM ID: GTM-SHARE01",
    gtagID: "G-RECIPE99",
    customPrompt: "Foster community and creativity. Use an orange-pink palette, feature high-quality food photos, and include a masonry grid for recipes.",
  },
  {
    campaignObjective: "Generate leads for CRM software",
    productServiceName: "ClientHub",
    primaryOffer: "Free CRM setup + 30-day trial",
    targetAudienceDescription: "Small business owners and sales teams",
    buyerPersonaKeywords: "CRM, customer management, sales tracking, automation",
    uniqueValueProposition: "Streamline customer relationships with intuitive CRM tools and automation.",
    topBenefits: "Organize contacts\nAutomate follow-ups\nBoost sales",
    featureList: "Contact database\nEmail integration\nSales pipeline\nReporting",
    emotionalTriggers: "Efficiency\nGrowth\nControl\nSuccess",
    objections: "Data import\nLearning curve\nIntegration costs",
    testimonials: '"Closed 30% more deals" - S. Johnson\n"Easy to use and powerful" - T. Nguyen',
    trustIndicators: "5K+ businesses\n99.9% uptime\nGDPR compliant\nFree tier",
    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "See Demo",
    primaryConversionKPI: "18% trial starts",
    toneOfVoice: "Professional and efficient",
    targetSEOKeywords: "CRM software, customer management, sales automation, small business CRM",
    eventTrackingSetup: "trial_signup, demo_watch, contact_import",
    brandColorPalette: "Primary: #3B82F6, Accent: #F59E0B, Neutral: #111827",
    fontStyleGuide: "Heading: Montserrat Bold, Body: Lato Regular",
    pageLayoutPreference: "Dashboard preview",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Privacy Policy.",
    formFieldsConfig: "Name, Email, Business Type",
    analyticsIDs: "GA ID: G-CLIENTH, GTM ID: GTM-HUB01",
    gtagID: "G-CLIENTHUB",
    customPrompt: "Highlight sales growth and ease of use. Use a blue-orange palette, showcase CRM dashboards, and add interactive tooltips.",
  },
  {
    campaignObjective: "Boost downloads for fitness tracking app",
    productServiceName: "FitTrack",
    primaryOffer: "Track workouts free + premium insights",
    targetAudienceDescription: "Fitness enthusiasts and athletes",
    buyerPersonaKeywords: "fitness tracking, workouts, health metrics, goals",
    uniqueValueProposition: "Achieve your fitness goals with advanced tracking and personalized insights.",
    topBenefits: "Track progress\nPersonalized plans\nHealth insights",
    featureList: "Workout logging\nGoal setting\nWearable sync\nNutrition tracking",
    emotionalTriggers: "Motivation\nAchievement\nHealth\nProgress",
    objections: "App accuracy\nSubscription cost\nDevice compatibility",
    testimonials: '"Lost 20 lbs and kept it off" - J. Smith\n"Best tracking app" - A. Kim',
    trustIndicators: "1M+ users\nIntegrates with Apple Health\n4.9/5 rating\nFree core features",
    primaryCTAText: "Download Free",
    secondaryCTAText: "View Plans",
    primaryConversionKPI: "30% downloads",
    toneOfVoice: "Motivational and data-driven",
    targetSEOKeywords: "fitness tracker app, workout logging, health monitoring, fitness goals",
    eventTrackingSetup: "download, workout_log, premium_signup",
    brandColorPalette: "Primary: #EF4444, Accent: #22C55E, Neutral: #18181B",
    fontStyleGuide: "Heading: Oswald Bold, Body: Roboto Regular",
    pageLayoutPreference: "Progress dashboard",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive fitness tips.",
    formFieldsConfig: "Name, Email, Fitness Goal",
    analyticsIDs: "GA ID: G-FITTRK, GTM ID: GTM-TRACK01",
    gtagID: "G-FITTRACK",
    customPrompt: "Focus on goal achievement and data visualization. Use a red-green palette, include progress charts, and add gamification elements.",
  },
  {
    campaignObjective: "Drive sales for eco-friendly cleaning products",
    productServiceName: "GreenClean",
    primaryOffer: "Starter kit 50% off + free shipping",
    targetAudienceDescription: "Eco-conscious homeowners",
    buyerPersonaKeywords: "eco-friendly, cleaning, sustainable, natural",
    uniqueValueProposition: "Clean your home effectively with plant-based, biodegradable products.",
    topBenefits: "Safe for family\nEco-friendly\nEffective cleaning",
    featureList: "Plant-based formulas\nBiodegradable packaging\nMulti-surface cleaners\nRefill options",
    emotionalTriggers: "Responsibility\nHealth\nPurity\nSustainability",
    objections: "Effectiveness vs chemicals\nPrice premium\nAvailability",
    testimonials: '"Cleaner home, better planet" - M. Davis\n"Love the natural scent" - R. Lee',
    trustIndicators: "100% natural\nCruelty-free\nEco-certified\n30-day guarantee",
    primaryCTAText: "Shop Now",
    secondaryCTAText: "Learn More",
    primaryConversionKPI: "15% kit purchases",
    toneOfVoice: "Caring and informative",
    targetSEOKeywords: "eco-friendly cleaning, natural cleaners, biodegradable products, sustainable cleaning",
    eventTrackingSetup: "product_view, kit_purchase, subscribe_newsletter",
    brandColorPalette: "Primary: #16A34A, Accent: #06B6D4, Neutral: #F8FAFC",
    fontStyleGuide: "Heading: Arial Bold, Body: Helvetica Regular",
    pageLayoutPreference: "Product showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Privacy Policy.",
    formFieldsConfig: "Name, Email, Home Size",
    analyticsIDs: "GA ID: G-GREENC, GTM ID: GTM-CLEAN01",
    gtagID: "G-GREENCLEAN",
    customPrompt: "Emphasize environmental impact and safety. Use a green-cyan palette, feature product images with nature backgrounds, and include sustainability badges.",
  },
  {
    campaignObjective: "Increase trials for project management tool",
    productServiceName: "TaskMaster",
    primaryOffer: "Free for 5 users + unlimited projects",
    targetAudienceDescription: "Freelancers and small teams",
    buyerPersonaKeywords: "project management, task tracking, collaboration, productivity",
    uniqueValueProposition: "Manage projects effortlessly with intuitive tools and real-time collaboration.",
    topBenefits: "Organize tasks\nTeam collaboration\nTime tracking",
    featureList: "Kanban boards\nTime logs\nFile sharing\nNotifications",
    emotionalTriggers: "Organization\nTeamwork\nEfficiency\nRelief",
    objections: "Feature overload\nMobile app quality\nPricing tiers",
    testimonials: '"Keeps our team on track" - L. Brown\n"Simple yet powerful" - P. Singh',
    trustIndicators: "50K+ users\n99.9% uptime\nMobile apps\nFree plan",
    primaryCTAText: "Start Free",
    secondaryCTAText: "View Features",
    primaryConversionKPI: "22% trial-to-paid",
    toneOfVoice: "Straightforward and collaborative",
    targetSEOKeywords: "project management tool, task tracking, team collaboration, productivity software",
    eventTrackingSetup: "signup, project_create, invite_team",
    brandColorPalette: "Primary: #6366F1, Accent: #F97316, Neutral: #0F172A",
    fontStyleGuide: "Heading: Work Sans Bold, Body: Inter Regular",
    pageLayoutPreference: "Feature grid",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive productivity tips.",
    formFieldsConfig: "Name, Email, Team Size",
    analyticsIDs: "GA ID: G-TASKM, GTM ID: GTM-MASTER01",
    gtagID: "G-TASKMASTER",
    customPrompt: "Stress simplicity and collaboration. Use an indigo-orange palette, include board previews, and add drag-and-drop demos.",
  },
  {
    campaignObjective: "Generate leads for accounting software",
    productServiceName: "BookKeep",
    primaryOffer: "Free bookkeeping setup + 30-day trial",
    targetAudienceDescription: "Small business owners and accountants",
    buyerPersonaKeywords: "accounting, bookkeeping, finance, invoicing",
    uniqueValueProposition: "Simplify finances with automated bookkeeping and insightful reports.",
    topBenefits: "Automate entries\nAccurate reports\nTax ready",
    featureList: "Expense tracking\nInvoice generation\nFinancial reports\nBank sync",
    emotionalTriggers: "Security\nClarity\nSavings\nConfidence",
    objections: "Data security\nIntegration with banks\nCost vs manual",
    testimonials: '"Saved hours on bookkeeping" - K. Wilson\n"Accurate and easy" - N. Ahmed',
    trustIndicators: "10K+ businesses\nBank-level security\nCPA approved\nFree basic",
    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "See Reports",
    primaryConversionKPI: "16% trial starts",
    toneOfVoice: "Reliable and precise",
    targetSEOKeywords: "accounting software, bookkeeping app, small business finance, invoicing tool",
    eventTrackingSetup: "trial_signup, report_view, bank_connect",
    brandColorPalette: "Primary: #059669, Accent: #DC2626, Neutral: #111827",
    fontStyleGuide: "Heading: Georgia Bold, Body: Times Regular",
    pageLayoutPreference: "Report dashboard",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to the Privacy Policy.",
    formFieldsConfig: "Name, Email, Business Type",
    analyticsIDs: "GA ID: G-BOOKKP, GTM ID: GTM-KEEP01",
    gtagID: "G-BOOKKEEP",
    customPrompt: "Emphasize accuracy and time savings. Use a green-red palette, showcase financial charts, and include a setup wizard.",
  },
  {
    campaignObjective: "Boost subscriptions for streaming service",
    productServiceName: "StreamPlus",
    primaryOffer: "Free month + ad-free streaming",
    targetAudienceDescription: "Entertainment lovers and families",
    buyerPersonaKeywords: "streaming, movies, TV shows, entertainment",
    uniqueValueProposition: "Enjoy unlimited entertainment with exclusive content and no ads.",
    topBenefits: "Ad-free watching\nExclusive shows\nFamily profiles",
    featureList: "4K streaming\nOffline downloads\nParental controls\nMulti-device",
    emotionalTriggers: "Entertainment\nRelaxation\nFamily time\nExcitement",
    objections: "Content library\nSubscription cost\nDevice limits",
    testimonials: '"Best streaming service" - D. Martinez\n"Great for kids" - S. Gupta',
    trustIndicators: "5M+ subscribers\nAward-winning content\n99.9% uptime\nCancel anytime",
    primaryCTAText: "Start Free Trial",
    secondaryCTAText: "Browse Shows",
    primaryConversionKPI: "25% free-to-paid",
    toneOfVoice: "Fun and engaging",
    targetSEOKeywords: "streaming service, movies online, TV shows, entertainment platform",
    eventTrackingSetup: "trial_start, show_watch, subscribe_click",
    brandColorPalette: "Primary: #8B5CF6, Accent: #F59E0B, Neutral: #1F2937",
    fontStyleGuide: "Heading: Poppins Bold, Body: Roboto Regular",
    pageLayoutPreference: "Content carousel",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive entertainment updates.",
    formFieldsConfig: "Name, Email, Favorite Genre",
    analyticsIDs: "GA ID: G-STREAM, GTM ID: GTM-PLUS01",
    gtagID: "G-STREAMPLUS",
    customPrompt: "Highlight exclusive content and family features. Use a purple-orange palette, feature movie posters, and add a video trailer player.",
  },
  {
    campaignObjective: "Drive downloads for photo editing app",
    productServiceName: "EditPro",
    primaryOffer: "Edit 10 photos free + premium tools",
    targetAudienceDescription: "Photographers and social media users",
    buyerPersonaKeywords: "photo editing, filters, retouching, creativity",
    uniqueValueProposition: "Transform photos with professional editing tools and AI enhancements.",
    topBenefits: "Pro-level edits\nAI enhancements\nEasy sharing",
    featureList: "Filters & effects\nRetouching tools\nBatch editing\nCloud sync",
    emotionalTriggers: "Creativity\nPride\nImprovement\nSharing",
    objections: "Learning curve\nWatermark on free\nStorage limits",
    testimonials: '"Turned my photos pro" - C. Taylor\n"Amazing AI features" - H. Singh',
    trustIndicators: "2M+ downloads\nUsed by pros\n4.9/5 rating\nFree edits",
    primaryCTAText: "Download Free",
    secondaryCTAText: "View Tutorials",
    primaryConversionKPI: "35% downloads",
    toneOfVoice: "Creative and inspiring",
    targetSEOKeywords: "photo editing app, photo retouch, filters, AI photo editor",
    eventTrackingSetup: "download, edit_start, premium_buy",
    brandColorPalette: "Primary: #EC4899, Accent: #06B6D4, Neutral: #0F172A",
    fontStyleGuide: "Heading: Bebas Neue, Body: Arial Regular",
    pageLayoutPreference: "Before-after gallery",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive editing tips.",
    formFieldsConfig: "Name, Email, Photography Skill",
    analyticsIDs: "GA ID: G-EDITPRO, GTM ID: GTM-PRO01",
    gtagID: "G-EDITPRO",
    customPrompt: "Showcase editing power with visuals. Use a pink-cyan palette, include before-after sliders, and add tutorial videos.",
  },
  {
    campaignObjective: "Increase sign-ups for dating app",
    productServiceName: "MatchMe",
    primaryOffer: "Free to match + premium features",
    targetAudienceDescription: "Singles seeking relationships",
    buyerPersonaKeywords: "dating, relationships, matches, compatibility",
    uniqueValueProposition: "Find your perfect match with advanced compatibility algorithms.",
    topBenefits: "Quality matches\nSafe dating\nEasy communication",
    featureList: "Compatibility quiz\nVideo profiles\nIn-app messaging\nSafety features",
    emotionalTriggers: "Hope\nConnection\nRomance\nExcitement",
    objections: "Fake profiles\nSubscription cost\nPrivacy concerns",
    testimonials: '"Found my soulmate" - A. Johnson\n"Safe and fun" - B. Lee',
    trustIndicators: "1M+ matches\nVerified profiles\nGDPR compliant\nFree messaging",
    primaryCTAText: "Find Matches",
    secondaryCTAText: "Take Quiz",
    primaryConversionKPI: "30% premium upgrades",
    toneOfVoice: "Romantic and trustworthy",
    targetSEOKeywords: "dating app, find matches, online dating, relationship app",
    eventTrackingSetup: "signup, match_view, premium_upgrade",
    brandColorPalette: "Primary: #F97316, Accent: #EC4899, Neutral: #18181B",
    fontStyleGuide: "Heading: Nunito Bold, Body: Lato Regular",
    pageLayoutPreference: "Profile showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive match notifications.",
    formFieldsConfig: "Name, Email, Age",
    analyticsIDs: "GA ID: G-MATCHM, GTM ID: GTM-ME01",
    gtagID: "G-MATCHME",
    customPrompt: "Emphasize love stories and safety. Use an orange-pink palette, feature user profiles, and add a compatibility quiz demo.",
  },
  {
    campaignObjective: "Generate leads for real estate platform",
    productServiceName: "HomeFinder",
    primaryOffer: "Free property search + agent matching",
    targetAudienceDescription: "Home buyers and renters",
    buyerPersonaKeywords: "real estate, property search, homes, listings",
    uniqueValueProposition: "Find your dream home with personalized searches and expert agents.",
    topBenefits: "Personalized listings\nExpert advice\nVirtual tours",
    featureList: "Advanced search\nSaved searches\nAgent matching\nMarket reports",
    emotionalTriggers: "Home\nSecurity\nFuture\nExcitement",
    objections: "Agent fees\nListing accuracy\nMarket conditions",
    testimonials: '"Found our home quickly" - M. Davis\n"Great agent support" - R. Chen',
    trustIndicators: "500K+ users\nLicensed agents\n99% accuracy\nFree search",
    primaryCTAText: "Search Homes",
    secondaryCTAText: "Get Matched",
    primaryConversionKPI: "20% agent contacts",
    toneOfVoice: "Welcoming and informative",
    targetSEOKeywords: "real estate search, find homes, property listings, home buying",
    eventTrackingSetup: "search_start, listing_view, agent_contact",
    brandColorPalette: "Primary: #10B981, Accent: #3B82F6, Neutral: #F1F5F9",
    fontStyleGuide: "Heading: Raleway Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Listing grid",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive property updates.",
    formFieldsConfig: "Name, Email, Budget",
    analyticsIDs: "GA ID: G-HOMEF, GTM ID: GTM-FINDER01",
    gtagID: "G-HOMEFINDER",
    customPrompt: "Focus on dream homes and ease of search. Use a green-blue palette, include property images, and add a map-based search.",
  },
  {
    campaignObjective: "Boost trials for video editing software",
    productServiceName: "VidEdit",
    primaryOffer: "Edit 5 videos free + cloud storage",
    targetAudienceDescription: "Content creators and marketers",
    buyerPersonaKeywords: "video editing, content creation, marketing, tutorials",
    uniqueValueProposition: "Create stunning videos with intuitive editing tools and effects.",
    topBenefits: "Easy editing\nPro effects\nCloud collaboration",
    featureList: "Drag-and-drop\nTemplates\nAudio editing\nExport options",
    emotionalTriggers: "Creativity\nProfessionalism\nSharing\nSuccess",
    objections: "Learning time\nPerformance on devices\nCost vs free tools",
    testimonials: '"Made professional videos easily" - L. Brown\n"Amazing templates" - P. Kim',
    trustIndicators: "1M+ creators\nUsed in Hollywood\n4.8/5 rating\nFree tier",
    primaryCTAText: "Start Editing",
    secondaryCTAText: "View Templates",
    primaryConversionKPI: "28% trial conversions",
    toneOfVoice: "Innovative and user-friendly",
    targetSEOKeywords: "video editing software, content creation, video maker, editing tools",
    eventTrackingSetup: "trial_start, video_edit, premium_buy",
    brandColorPalette: "Primary: #6366F1, Accent: #F97316, Neutral: #0F172A",
    fontStyleGuide: "Heading: Futura Bold, Body: Calibri Regular",
    pageLayoutPreference: "Video gallery",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive editing tutorials.",
    formFieldsConfig: "Name, Email, Content Type",
    analyticsIDs: "GA ID: G-VIDED, GTM ID: GTM-EDIT01",
    gtagID: "G-VIDEDIT",
    customPrompt: "Demonstrate editing capabilities with demos. Use an indigo-orange palette, include video previews, and add a drag-and-drop interface mockup.",
  },
  {
    campaignObjective: "Drive subscriptions for music streaming app",
    productServiceName: "TuneIn",
    primaryOffer: "Free unlimited listening + offline mode",
    targetAudienceDescription: "Music lovers and audiophiles",
    buyerPersonaKeywords: "music streaming, playlists, discovery, audio",
    uniqueValueProposition: "Discover and stream millions of songs with personalized playlists.",
    topBenefits: "Unlimited music\nPersonalized playlists\nOffline listening",
    featureList: "Song discovery\nArtist radio\nLyrics sync\nHigh-quality audio",
    emotionalTriggers: "Joy\nDiscovery\nRelaxation\nConnection",
    objections: "Ad interruptions\nData usage\nSubscription cost",
    testimonials: '"Endless music discovery" - S. Martinez\n"Best sound quality" - T. Nguyen',
    trustIndicators: "10M+ songs\nAd-free premium\n99.9% uptime\nFree with ads",
    primaryCTAText: "Listen Free",
    secondaryCTAText: "Create Playlist",
    primaryConversionKPI: "25% ad-to-premium",
    toneOfVoice: "Energetic and musical",
    targetSEOKeywords: "music streaming app, song playlists, music discovery, audio streaming",
    eventTrackingSetup: "listen_start, playlist_create, premium_upgrade",
    brandColorPalette: "Primary: #EF4444, Accent: #8B5CF6, Neutral: #18181B",
    fontStyleGuide: "Heading: Oswald Bold, Body: Roboto Regular",
    pageLayoutPreference: "Music player interface",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive music recommendations.",
    formFieldsConfig: "Name, Email, Favorite Genre",
    analyticsIDs: "GA ID: G-TUNEIN, GTM ID: GTM-IN01",
    gtagID: "G-TUNEIN",
    customPrompt: "Celebrate music and discovery. Use a red-purple palette, feature album art, and include a mini player widget.",
  },
  {
    campaignObjective: "Increase downloads for budgeting app",
    productServiceName: "BudgetBuddy",
    primaryOffer: "Track expenses free + financial goals",
    targetAudienceDescription: "Individuals managing personal finances",
    buyerPersonaKeywords: "budgeting, expenses, savings, finance",
    uniqueValueProposition: "Take control of your finances with easy tracking and goal setting.",
    topBenefits: "Track spending\nSave money\nFinancial goals",
    featureList: "Expense categories\nBudget alerts\nSavings goals\nReports",
    emotionalTriggers: "Control\nSecurity\nAchievement\nPeace",
    objections: "Manual entry\nPrivacy of data\nApp complexity",
    testimonials: '"Saved $200/month" - J. Wilson\n"Simple and effective" - A. Patel',
    trustIndicators: "500K+ users\nBank-level security\nFree forever\nNo ads",
    primaryCTAText: "Start Tracking",
    secondaryCTAText: "Set Goals",
    primaryConversionKPI: "40% active users",
    toneOfVoice: "Supportive and empowering",
    targetSEOKeywords: "budgeting app, expense tracker, personal finance, savings goals",
    eventTrackingSetup: "download, expense_add, goal_set",
    brandColorPalette: "Primary: #22C55E, Accent: #F59E0B, Neutral: #1F2937",
    fontStyleGuide: "Heading: Lato Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Dashboard overview",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive finance tips.",
    formFieldsConfig: "Name, Email, Monthly Income",
    analyticsIDs: "GA ID: G-BUDGET, GTM ID: GTM-BUDDY01",
    gtagID: "G-BUDGETBUDDY",
    customPrompt: "Promote financial freedom and simplicity. Use a green-orange palette, include spending charts, and add goal progress bars.",
  },
  {
    campaignObjective: "Generate leads for e-learning platform",
    productServiceName: "LearnHub",
    primaryOffer: "Free course preview + lifetime access",
    targetAudienceDescription: "Lifelong learners and professionals",
    buyerPersonaKeywords: "e-learning, courses, skills, certification",
    uniqueValueProposition: "Learn new skills with expert-led courses and certifications.",
    topBenefits: "Expert instructors\nFlexible learning\nCertifications",
    featureList: "Video lessons\nQuizzes\nDiscussion forums\nCertificates",
    emotionalTriggers: "Growth\nKnowledge\nConfidence\nOpportunity",
    objections: "Course quality\nTime commitment\nCost vs value",
    testimonials: '"Advanced my career" - M. Lee\n"High-quality content" - R. Singh',
    trustIndicators: "1M+ learners\nIndustry experts\n4.9/5 rating\nFree previews",
    primaryCTAText: "Enroll Free",
    secondaryCTAText: "Browse Courses",
    primaryConversionKPI: "18% enrollments",
    toneOfVoice: "Inspirational and educational",
    targetSEOKeywords: "e-learning platform, online courses, skill development, certifications",
    eventTrackingSetup: "course_view, enroll_click, certificate_earn",
    brandColorPalette: "Primary: #7C3AED, Accent: #10B981, Neutral: #1F2937",
    fontStyleGuide: "Heading: Montserrat Bold, Body: Lato Regular",
    pageLayoutPreference: "Course catalog",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive learning updates.",
    formFieldsConfig: "Name, Email, Skill Interest",
    analyticsIDs: "GA ID: G-LEARNH, GTM ID: GTM-HUB02",
    gtagID: "G-LEARNHUB",
    customPrompt: "Highlight career advancement and accessibility. Use a purple-green palette, feature course thumbnails, and include progress tracking demos.",
  },
  {
    campaignObjective: "Boost sign-ups for coworking space booking",
    productServiceName: "CoWorkSpace",
    primaryOffer: "Book desk free + community events",
    targetAudienceDescription: "Freelancers and remote workers",
    buyerPersonaKeywords: "coworking, workspace, networking, productivity",
    uniqueValueProposition: "Find the perfect workspace with flexible bookings and community perks.",
    topBenefits: "Flexible spaces\nNetworking events\nHigh-speed internet",
    featureList: "Desk booking\nMeeting rooms\nCommunity perks\n24/7 access",
    emotionalTriggers: "Community\nProductivity\nInspiration\nBalance",
    objections: "Location availability\nMembership cost\nNoise levels",
    testimonials: '"Great community vibe" - L. Garcia\n"Productive environment" - P. Chen',
    trustIndicators: "100+ locations\nVerified spaces\n4.8/5 rating\nFree trial",
    primaryCTAText: "Book Desk",
    secondaryCTAText: "Find Location",
    primaryConversionKPI: "22% bookings",
    toneOfVoice: "Community-focused and professional",
    targetSEOKeywords: "coworking space, workspace booking, remote work, office rental",
    eventTrackingSetup: "booking_start, location_search, membership_signup",
    brandColorPalette: "Primary: #3B82F6, Accent: #F97316, Neutral: #0F172A",
    fontStyleGuide: "Heading: Work Sans Bold, Body: Inter Regular",
    pageLayoutPreference: "Location map",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive workspace updates.",
    formFieldsConfig: "Name, Email, Work Type",
    analyticsIDs: "GA ID: G-COWORK, GTM ID: GTM-SPACE01",
    gtagID: "G-COWORKSPACE",
    customPrompt: "Emphasize community and flexibility. Use a blue-orange palette, include space photos, and add an interactive map.",
  },
  {
    campaignObjective: "Drive trials for AI writing assistant",
    productServiceName: "WriteAI",
    primaryOffer: "Generate 100 words free + templates",
    targetAudienceDescription: "Writers, marketers, and content creators",
    buyerPersonaKeywords: "AI writing, content creation, copywriting, productivity",
    uniqueValueProposition: "Create high-quality content faster with AI-powered writing assistance.",
    topBenefits: "Faster writing\nBetter quality\nIdea generation",
    featureList: "Content templates\nGrammar check\nTone adjustment\nPlagiarism detection",
    emotionalTriggers: "Creativity\nEfficiency\nConfidence\nInnovation",
    objections: "AI originality\nOver-reliance\nCost per use",
    testimonials: '"Doubled my writing speed" - S. Johnson\n"Amazing suggestions" - T. Lee',
    trustIndicators: "500K+ users\nTrained on quality data\n4.9/5 rating\nFree words",
    primaryCTAText: "Start Writing",
    secondaryCTAText: "View Templates",
    primaryConversionKPI: "30% trial-to-paid",
    toneOfVoice: "Innovative and helpful",
    targetSEOKeywords: "AI writing assistant, content generator, copywriting tool, writing AI",
    eventTrackingSetup: "write_start, template_use, premium_buy",
    brandColorPalette: "Primary: #EC4899, Accent: #06B6D4, Neutral: #0F172A",
    fontStyleGuide: "Heading: Poppins Bold, Body: Roboto Regular",
    pageLayoutPreference: "Writing demo",
    videoURL: "",
    privacyPolicyURL: "https://example.com/privacy",
    gdprCcpaConsentText: "I agree to receive writing tips.",
    formFieldsConfig: "Name, Email, Writing Type",
    analyticsIDs: "GA ID: G-WRITEAI, GTM ID: GTM-AI02",
    gtagID: "G-WRITEAI",
    customPrompt: "Showcase AI capabilities with examples. Use a pink-cyan palette, include text generation demos, and add a live editor interface.",
  },
  {
    campaignObjective: "زيادة التنزيلات لتطبيق توصيل الطعام",
    productServiceName: "جوعان (Jou3an)",
    primaryOffer: "التوصيل المجاني للطلب الأول + خصم 20%",
    targetAudienceDescription: "الشباب الجزائري والعائلات في المدن الكبرى",
    buyerPersonaKeywords: "توصيل طعام، مطاعم، وجبات سريعة، الجزائر",
    uniqueValueProposition: "اطلب من أفضل المطاعم الجزائرية مع توصيل سريع وآمن.",
    topBenefits: "توصيل سريع\nمطاعم متنوعة\nدفع آمن",
    featureList: "تتبع الطلب\nدفع عند الاستلام\nتقييم المطاعم\nعروض يومية",
    emotionalTriggers: "راحة\nجودة\nسرعة\nثقة",
    objections: "رسوم التوصيل\nوقت الانتظار\nجودة الطعام",
    testimonials: '"خدمة ممتازة وسريعة" - أحمد ب.\n"أفضل تطبيق توصيل في الجزائر" - سارة م.',
    trustIndicators: "500+ مطعم\n50K+ مستخدم\nتوصيل في 30 دقيقة\nدفع آمن",
    primaryCTAText: "اطلب الآن",
    secondaryCTAText: "تصفح المطاعم",
    primaryConversionKPI: "35% first-order conversions",
    toneOfVoice: "ودي وسريع",
    targetSEOKeywords: "توصيل طعام الجزائر، مطاعم، delivery Algerie, food delivery",
    eventTrackingSetup: "app_download, order_place, restaurant_view",
    brandColorPalette: "Primary: #DC2626, Accent: #F59E0B, Neutral: #18181B",
    fontStyleGuide: "Heading: Cairo Bold, Body: Tajawal Regular",
    pageLayoutPreference: "Restaurant grid",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي عروض خاصة.",
    formFieldsConfig: "الاسم، البريد الإلكتروني، رقم الهاتف",
    analyticsIDs: "GA ID: G-JOU3AN, GTM ID: GTM-DZ01",
    gtagID: "G-JOU3AN",
    customPrompt: "Use a vibrant dark theme with red and orange accents. Feature Algerian cuisine photos, include order tracking interface, and add restaurant carousel.",
  },
  {
    campaignObjective: "Générer des inscriptions pour plateforme de freelancing algérienne",
    productServiceName: "Qool",
    primaryOffer: "Menu numérique gratuit + QR code & NFC stickers",
    targetAudienceDescription: "Restaurants et cafés en Algérie",
    buyerPersonaKeywords: "menu digital, QR code, restaurant tech, Algeria",
    uniqueValueProposition: "Transformez votre menu papier en expérience digitale moderne avec QR et NFC.",
    topBenefits: "Menu sans contact\nMises à jour instantanées\nAnalytiques clients",
    featureList: "QR code personnalisé\nStickers NFC\nMultilingue (AR/FR)\nPhotos plats\nGestion prix",
    emotionalTriggers: "Modernité\nHygiène\nProfessionnalisme\nInnovation",
    objections: "Coût initial\nFormation staff\nConnexion internet",
    testimonials: '"Nos clients adorent le menu digital" - Restaurant El Bahia\n"Setup rapide et facile" - Café Djurdjura',
    trustIndicators: "200+ restaurants\nUtilisé à Alger, Oran, Constantine\nSupport 24/7\nGratuit 30 jours",
    primaryCTAText: "Essai Gratuit",
    secondaryCTAText: "Voir Démo",
    primaryConversionKPI: "28% restaurant signups",
    toneOfVoice: "Professionnel et moderne",
    targetSEOKeywords: "menu digital Algérie, QR code restaurant, menu sans contact, digital menu Algeria",
    eventTrackingSetup: "demo_request, signup_start, menu_created",
    brandColorPalette: "Primary: #84CC16, Accent: #22C55E, Neutral: #0F172A",
    fontStyleGuide: "Heading: Plus Jakarta Sans Bold, Body: Inter Regular",
    pageLayoutPreference: "Product showcase",
    videoURL: "",
    privacyPolicyURL: "https://qool.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des conseils pour restaurants.",
    formFieldsConfig: "Nom Restaurant, Email, Téléphone, Wilaya",
    analyticsIDs: "GA ID: G-QOOL, GTM ID: GTM-QOOL01",
    gtagID: "G-QOOL",
    customPrompt: "Use a fresh light theme with lime green (#84CC16) as primary color. Feature QR code and NFC sticker mockups, include menu preview on phone, and add restaurant dashboard interface.",
  },
  {
    campaignObjective: "تعزيز التسجيل في منصة التعليم الإلكتروني",
    productServiceName: "علم (3ilm)",
    primaryOffer: "دورة مجانية في البرمجة + شهادة معتمدة",
    targetAudienceDescription: "الطلاب والباحثون عن عمل في الجزائر",
    buyerPersonaKeywords: "تعليم، دورات، مهارات، شهادات، الجزائر",
    uniqueValueProposition: "تعلم مهارات رقمية من خبراء جزائريين بشهادات معترف بها.",
    topBenefits: "دورات باللغة العربية\nشهادات معتمدة\nأسعار معقولة",
    featureList: "فيديوهات تفاعلية\nمشاريع عملية\nمنتدى طلاب\nدعم مباشر",
    emotionalTriggers: "نجاح\nمستقبل\nمعرفة\nفرص",
    objections: "تكلفة الدورات\nجودة المحتوى\nاعتراف الشهادات",
    testimonials: '"حصلت على وظيفة بفضل الدورات" - كريم ع.\n"محتوى عالي الجودة" - ليلى د.',
    trustIndicators: "10K+ متعلم\n50+ دورة\nشهادات معترف بها\nتجربة مجانية",
    primaryCTAText: "ابدأ التعلم",
    secondaryCTAText: "تصفح الدورات",
    primaryConversionKPI: "22% course enrollments",
    toneOfVoice: "تحفيزي وتعليمي",
    targetSEOKeywords: "دورات تعليمية الجزائر، تعلم برمجة، شهادات معتمدة، formation Algerie",
    eventTrackingSetup: "course_view, enroll_click, certificate_download",
    brandColorPalette: "Primary: #2563EB, Accent: #FBBF24, Neutral: #F9FAFB",
    fontStyleGuide: "Heading: Cairo Bold, Body: Noto Kufi Arabic Regular",
    pageLayoutPreference: "Course catalog",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي تحديثات الدورات.",
    formFieldsConfig: "الاسم، البريد الإلكتروني، التخصص المهتم به",
    analyticsIDs: "GA ID: G-3ILM, GTM ID: GTM-EDU01",
    gtagID: "G-3ILM",
    customPrompt: "Use a light theme with blue and yellow accents. Feature course cards with Arabic text, include student testimonials, and add learning progress dashboard.",
  },
  {
    campaignObjective: "Augmenter téléchargements pour app de covoiturage",
    productServiceName: "Flicks",
    primaryOffer: "Premier trajet gratuit + points fidélité",
    targetAudienceDescription: "Étudiants et professionnels urbains en Algérie",
    buyerPersonaKeywords: "covoiturage, transport, partage, Algérie",
    uniqueValueProposition: "Voyagez moins cher et plus écologique en partageant vos trajets.",
    topBenefits: "Économies\nÉcologique\nRencontres\nSécurité",
    featureList: "Vérification conducteurs\nTrajets programmés\nChat intégré\nPaiement flexible",
    emotionalTriggers: "Économie\nCommunauté\nEnvironnement\nConfiance",
    objections: "Sécurité\nPonctualité\nConfort",
    testimonials: '"J\'économise 50% sur mes trajets" - Yasmine K.\n"Conducteurs sympas et ponctuels" - Mehdi B.',
    trustIndicators: "20K+ utilisateurs\nConducteurs vérifiés\n4.7/5 rating\nAssurance incluse",
    primaryCTAText: "Trouver Trajet",
    secondaryCTAText: "Devenir Conducteur",
    primaryConversionKPI: "30% first-ride completions",
    toneOfVoice: "Amical et rassurant",
    targetSEOKeywords: "covoiturage Algérie, partage trajet, transport Alger, rideshare Algeria",
    eventTrackingSetup: "search_ride, book_ride, complete_trip",
    brandColorPalette: "Primary: #8B5CF6, Accent: #EC4899, Neutral: #1F2937",
    fontStyleGuide: "Heading: Urbanist Bold, Body: Inter Regular",
    pageLayoutPreference: "Map interface",
    videoURL: "",
    privacyPolicyURL: "https://flicks.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des offres de trajets.",
    formFieldsConfig: "Nom, Email, Téléphone, Ville",
    analyticsIDs: "GA ID: G-FLICKS, GTM ID: GTM-RIDE01",
    gtagID: "G-FLICKS",
    customPrompt: "Use a dark theme with purple and pink gradients. Feature map with routes, include driver profiles, and add ride booking interface.",
  },
  {
    campaignObjective: "زيادة مبيعات متجر الإلكترونيات",
    productServiceName: "تك (Tek)",
    primaryOffer: "خصم 15% على أول طلب + توصيل مجاني",
    targetAudienceDescription: "عشاق التكنولوجيا والشباب في الجزائر",
    buyerPersonaKeywords: "إلكترونيات، هواتف، كمبيوتر، أجهزة، الجزائر",
    uniqueValueProposition: "أحدث الأجهزة الإلكترونية بأفضل الأسعار مع ضمان حقيقي.",
    topBenefits: "أسعار منافسة\nضمان رسمي\nتوصيل سريع",
    featureList: "دفع بالتقسيط\nخدمة ما بعد البيع\nمقارنة أسعار\nعروض أسبوعية",
    emotionalTriggers: "ابتكار\nجودة\nوفورات\nموثوقية",
    objections: "أسعار مرتفعة\nأصالة المنتجات\nخدمة الصيانة",
    testimonials: '"منتجات أصلية وأسعار ممتازة" - رشيد ح.\n"خدمة عملاء رائعة" - نادية ب.',
    trustIndicators: "ضمان رسمي\n1000+ منتج\nتوصيل لكل الولايات\nدفع آمن",
    primaryCTAText: "تسوق الآن",
    secondaryCTAText: "العروض الأسبوعية",
    primaryConversionKPI: "18% purchase conversions",
    toneOfVoice: "احترافي وموثوق",
    targetSEOKeywords: "شراء إلكترونيات الجزائر، هواتف ذكية، ordinateurs Algerie, electronics store",
    eventTrackingSetup: "product_view, cart_add, purchase_complete",
    brandColorPalette: "Primary: #0EA5E9, Accent: #F97316, Neutral: #F1F5F9",
    fontStyleGuide: "Heading: Almarai Bold, Body: Noto Sans Arabic Regular",
    pageLayoutPreference: "Product grid",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي عروض المنتجات.",
    formFieldsConfig: "الاسم، البريد الإلكتروني، رقم الهاتف، الولاية",
    analyticsIDs: "GA ID: G-TEK, GTM ID: GTM-TECH01",
    gtagID: "G-TEK",
    customPrompt: "Use a light theme with cyan and orange accents. Feature product cards with tech specs, include comparison tool, and add shopping cart interface.",
  },
  {
    campaignObjective: "Booster réservations pour salles de sport",
    productServiceName: "Fit",
    primaryOffer: "1 mois d'essai gratuit + coaching personnalisé",
    targetAudienceDescription: "Personnes actives cherchant fitness en Algérie",
    buyerPersonaKeywords: "fitness, musculation, sport, santé, Algérie",
    uniqueValueProposition: "Atteignez vos objectifs fitness avec des équipements modernes et coaches certifiés.",
    topBenefits: "Équipements modernes\nCoaches certifiés\nHoraires flexibles",
    featureList: "Musculation\nCardio\nCours collectifs\nSauna\nVestiaires modernes",
    emotionalTriggers: "Santé\nConfiance\nÉnergie\nTransformation",
    objections: "Prix abonnement\nDistance\nEngagement durée",
    testimonials: '"J\'ai perdu 10kg en 3 mois" - Karim A.\n"Meilleure salle d\'Alger" - Sara L.',
    trustIndicators: "5 salles en Algérie\nCoaches certifiés\n2000+ membres\nEssai gratuit",
    primaryCTAText: "Réserver Essai",
    secondaryCTAText: "Voir Tarifs",
    primaryConversionKPI: "25% trial-to-member",
    toneOfVoice: "Motivant et énergique",
    targetSEOKeywords: "salle de sport Algérie, fitness Alger, gym Algeria, musculation",
    eventTrackingSetup: "trial_book, membership_buy, class_reserve",
    brandColorPalette: "Primary: #EF4444, Accent: #1F2937, Neutral: #0F172A",
    fontStyleGuide: "Heading: Bebas Neue Bold, Body: Roboto Regular",
    pageLayoutPreference: "Image gallery",
    videoURL: "",
    privacyPolicyURL: "https://fit.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des conseils fitness.",
    formFieldsConfig: "Nom, Prénom, Téléphone, Objectif Fitness",
    analyticsIDs: "GA ID: G-FIT, GTM ID: GTM-GYM01",
    gtagID: "G-FIT",
    customPrompt: "Use a dark theme with red and gray accents. Feature gym photos and equipment, include class schedules, and add body transformation before/after gallery.",
  },
  {
    campaignObjective: "تعزيز حجوزات خدمة النظافة المنزلية",
    productServiceName: "نظيف (Nadhif)",
    primaryOffer: "أول خدمة مجانية + خصم 25% للعملاء الجدد",
    targetAudienceDescription: "العائلات والمهنيين المشغولين في الجزائر",
    buyerPersonaKeywords: "تنظيف منزل، خدمات منزلية، نظافة، الجزائر",
    uniqueValueProposition: "منزل نظيف دون عناء مع فريق محترف ومنتجات صديقة للبيئة.",
    topBenefits: "فريق محترف\nمنتجات آمنة\nمواعيد مرنة",
    featureList: "تنظيف شامل\nتعقيم\nكي الملابس\nتنظيف النوافذ\nحجز سريع",
    emotionalTriggers: "راحة\nصحة\nوقت\nنظافة",
    objections: "الثقة في الفريق\nالتكلفة\nجودة الخدمة",
    testimonials: '"خدمة ممتازة وفريق موثوق" - فاطمة م.\n"منزلي أصبح لامعاً" - محمد ل.',
    trustIndicators: "فريق مدرب\n5000+ منزل نظيف\nتأمين شامل\nضمان الجودة",
    primaryCTAText: "احجز الآن",
    secondaryCTAText: "احسب السعر",
    primaryConversionKPI: "32% booking conversions",
    toneOfVoice: "موثوق ومهني",
    targetSEOKeywords: "تنظيف منازل الجزائر، خدمات منزلية، ménage Algerie, cleaning service",
    eventTrackingSetup: "quote_request, booking_complete, service_review",
    brandColorPalette: "Primary: #10B981, Accent: #06B6D4, Neutral: #F9FAFB",
    fontStyleGuide: "Heading: Tajawal Bold, Body: Cairo Regular",
    pageLayoutPreference: "Service showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي تذكيرات الحجز.",
    formFieldsConfig: "الاسم، رقم الهاتف، المنطقة، نوع الخدمة",
    analyticsIDs: "GA ID: G-NADHIF, GTM ID: GTM-CLEAN01",
    gtagID: "G-NADHIF",
    customPrompt: "Use a light theme with green and cyan accents. Feature before/after cleaning photos, include service pricing calculator, and add team member profiles.",
  },
  {
    campaignObjective: "Générer leads pour agence immobilière digitale",
    productServiceName: "Livrz",
    primaryOffer: "Livraison express gratuite premier colis + tracking temps réel",
    targetAudienceDescription: "E-commerçants et particuliers en Algérie",
    buyerPersonaKeywords: "livraison, colis, express, Algérie, shipping",
    uniqueValueProposition: "Livraison rapide et fiable dans toute l'Algérie avec tracking en temps réel.",
    topBenefits: "Livraison 24-48h\nTracking temps réel\nTarifs compétitifs",
    featureList: "Ramassage gratuit\nEmballage sécurisé\nAssurance colis\nAPI pour e-commerce\nPaiement COD",
    emotionalTriggers: "Rapidité\nFiabilité\nSécurité\nCroissance",
    objections: "Délais livraison\nColis endommagés\nTarifs",
    testimonials: '"Livraisons toujours à temps" - Boutique Zahra\n"Service client réactif" - Mohamed E.',
    trustIndicators: "48 wilayas couvertes\n50K+ colis/mois\nAssurance incluse\nSuivi SMS",
    primaryCTAText: "Expédier Maintenant",
    secondaryCTAText: "Calculer Prix",
    primaryConversionKPI: "28% shipment conversions",
    toneOfVoice: "Efficace et professionnel",
    targetSEOKeywords: "livraison Algérie, express delivery, shipping Algeria, colis",
    eventTrackingSetup: "quote_calc, shipment_book, tracking_view",
    brandColorPalette: "Primary: #6366F1, Accent: #FBBF24, Neutral: #1F2937",
    fontStyleGuide: "Heading: Montserrat Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Tracking interface",
    videoURL: "",
    privacyPolicyURL: "https://livrz.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des notifications de livraison.",
    formFieldsConfig: "Nom, Téléphone, Wilaya Départ, Wilaya Destination",
    analyticsIDs: "GA ID: G-LIVRZ, GTM ID: GTM-SHIP01",
    gtagID: "G-LIVRZ",
    customPrompt: "Use a dark theme with indigo and yellow accents. Feature delivery map with routes, include package tracking timeline, and add pricing calculator.",
  },
  {
    campaignObjective: "زيادة تحميلات تطبيق سوق الخضار والفواكه",
    productServiceName: "طازج (Tazaj)",
    primaryOffer: "توصيل مجاني + خصم 20% على الطلب الأول",
    targetAudienceDescription: "العائلات التي تبحث عن خضار وفواكه طازجة",
    buyerPersonaKeywords: "خضار، فواكه، طازج، سوق، الجزائر",
    uniqueValueProposition: "خضار وفواكه طازجة من المزارع مباشرة إلى بابك.",
    topBenefits: "طازجة يومياً\nأسعار عادلة\nتوصيل سريع",
    featureList: "مزارع محلية\nانتقاء دقيق\nتوصيل صباحي\nجودة مضمونة",
    emotionalTriggers: "صحة\nعائلة\nطبيعة\nثقة",
    objections: "جودة المنتجات\nسعر التوصيل\nنضج الفواكه",
    testimonials: '"خضار طازجة كأنها من الحقل" - عائشة ك.\n"جودة ممتازة وتوصيل سريع" - علي س.',
    trustIndicators: "50+ مزارع شريك\nطازجة يومياً\n10K+ عميل\nضمان الجودة",
    primaryCTAText: "اطلب الآن",
    secondaryCTAText: "المنتجات اليومية",
    primaryConversionKPI: "40% first-order rate",
    toneOfVoice: "طبيعي وصحي",
    targetSEOKeywords: "خضار طازجة الجزائر، توصيل فواكه، légumes frais Algerie, fresh produce",
    eventTrackingSetup: "app_download, order_create, delivery_complete",
    brandColorPalette: "Primary: #22C55E, Accent: #F59E0B, Neutral: #F9FAFB",
    fontStyleGuide: "Heading: Cairo Bold, Body: Tajawal Regular",
    pageLayoutPreference: "Product catalog",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي عروض المنتجات الموسمية.",
    formFieldsConfig: "الاسم، رقم الهاتف، العنوان، الولاية",
    analyticsIDs: "GA ID: G-TAZAJ, GTM ID: GTM-FRESH01",
    gtagID: "G-TAZAJ",
    customPrompt: "Use a light theme with green and orange accents. Feature fresh produce photos, include daily deals section, and add farm-to-table journey graphic.",
  },
  {
    campaignObjective: "Augmenter inscriptions plateforme freelance algérienne",
    productServiceName: "Vitesse",
    primaryOffer: "Inscription gratuite + 0% commission premier projet",
    targetAudienceDescription: "Freelancers et entreprises algériennes",
    buyerPersonaKeywords: "freelance, travail, projets, compétences, Algérie",
    uniqueValueProposition: "Connectez talents algériens et projets locaux sur la première plateforme freelance 100% algérienne.",
    topBenefits: "Projets locaux\nPaiement sécurisé\nCommission basse",
    featureList: "Profil vérifié\nChat intégré\nPaiement escrow\nDispute resolution\nPortfolio",
    emotionalTriggers: "Opportunité\nIndépendance\nCroissance\nConfiance",
    objections: "Paiement sécurisé\nQualité freelancers\nCommissions",
    testimonials: '"Trouvé 10+ projets en 2 mois" - Amine D.\n"Freelancers qualifiés et pros" - Startup DZ',
    trustIndicators: "5K+ freelancers\n1K+ projets complétés\nPaiement garanti\n4.6/5 rating",
    primaryCTAText: "Créer Profil",
    secondaryCTAText: "Trouver Talents",
    primaryConversionKPI: "22% profile completions",
    toneOfVoice: "Dynamique et encourageant",
    targetSEOKeywords: "freelance Algérie, travail indépendant, projets Algeria, talents algériens",
    eventTrackingSetup: "signup_start, profile_complete, project_apply",
    brandColorPalette: "Primary: #7C3AED, Accent: #10B981, Neutral: #0F172A",
    fontStyleGuide: "Heading: Space Grotesk Bold, Body: Inter Regular",
    pageLayoutPreference: "Talent showcase",
    videoURL: "",
    privacyPolicyURL: "https://vitesse.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des offres de projets.",
    formFieldsConfig: "Nom, Email, Compétences, Ville",
    analyticsIDs: "GA ID: G-VITESSE, GTM ID: GTM-FREE01",
    gtagID: "G-VITESSE",
    customPrompt: "Use a dark theme with purple and green accents. Feature freelancer profiles with ratings, include project listings, and add skills matching interface.",
  },
  {
    campaignObjective: "تعزيز حجوزات تطبيق حجز المواعيد الطبية",
    productServiceName: "صحتي (Sihati)",
    primaryOffer: "حجز مجاني + استشارة عن بعد مخفضة 50%",
    targetAudienceDescription: "المرضى والعائلات في الجزائر",
    buyerPersonaKeywords: "طبيب، موعد، صحة، عيادة، الجزائر",
    uniqueValueProposition: "احجز موعدك مع أفضل الأطباء في الجزائر بكل سهولة.",
    topBenefits: "حجز فوري\nأطباء معتمدين\nتذكير بالموعد",
    featureList: "بحث بالتخصص\nاستشارة عن بعد\nسجل طبي\nتقييمات الأطباء\nتذكيرات SMS",
    emotionalTriggers: "صحة\nراحة\نسرعة\nثقة",
    objections: "توفر المواعيد\nجودة الأطباء\nخصوصية البيانات",
    testimonials: '"حجزت موعد في دقائق" - سعاد ب.\n"أطباء ممتازين وخدمة رائعة" - ياسين م.',
    trustIndicators: "500+ طبيب\n20 تخصص\n50K+ موعد\nبيانات آمنة",
    primaryCTAText: "احجز موعد",
    secondaryCTAText: "ابحث عن طبيب",
    primaryConversionKPI: "35% booking completions",
    toneOfVoice: "مطمئن ومهني",
    targetSEOKeywords: "حجز موعد طبيب الجزائر، استشارة طبية، rendez-vous médecin Algerie, doctor booking",
    eventTrackingSetup: "doctor_search, appointment_book, teleconsult_start",
    brandColorPalette: "Primary: #0EA5E9, Accent: #EC4899, Neutral: #F1F5F9",
    fontStyleGuide: "Heading: Almarai Bold, Body: Cairo Regular",
    pageLayoutPreference: "Doctor directory",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي تذكيرات المواعيد.",
    formFieldsConfig: "الاسم، رقم الهاتف، التخصص المطلوب",
    analyticsIDs: "GA ID: G-SIHATI, GTM ID: GTM-HEALTH01",
    gtagID: "G-SIHATI",
    customPrompt: "Use a light theme with cyan and pink accents. Feature doctor profiles with specialties, include appointment calendar interface, and add teleconsult video preview.",
  },
  {
    campaignObjective: "Booster ventes marketplace mode algérienne",
    productServiceName: "Chic",
    primaryOffer: "Livraison gratuite + retours sous 14 jours",
    targetAudienceDescription: "Jeunes femmes et hommes fashion-conscious en Algérie",
    buyerPersonaKeywords: "mode, vêtements, fashion, style, Algérie",
    uniqueValueProposition: "Mode tendance et locale à prix abordables, livrée chez vous.",
    topBenefits: "Tendances locales\nPrix abordables\nRetours faciles",
    featureList: "Collections exclusives\nGuide des tailles\nLooks stylés\nPaiement COD\nPromos hebdo",
    emotionalTriggers: "Style\nConfiance\nAppartenance\nModernité",
    objections: "Qualité produits\nTailles disponibles\nRetours",
    testimonials: '"Vêtements de qualité et style unique" - Lina B.\n"Ma boutique préférée" - Rayan K.',
    trustIndicators: "50+ marques locales\n10K+ articles\nRetours gratuits\nPaiement sécurisé",
    primaryCTAText: "Découvrir",
    secondaryCTAText: "Nouveautés",
    primaryConversionKPI: "20% purchase rate",
    toneOfVoice: "Branché et accessible",
    targetSEOKeywords: "mode Algérie, vêtements fashion, boutique en ligne Algeria, clothing",
    eventTrackingSetup: "product_view, cart_add, checkout_complete",
    brandColorPalette: "Primary: #EC4899, Accent: #8B5CF6, Neutral: #1F2937",
    fontStyleGuide: "Heading: Playfair Display Bold, Body: Lato Regular",
    pageLayoutPreference: "Fashion grid",
    videoURL: "",
    privacyPolicyURL: "https://chic.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir les nouveautés mode.",
    formFieldsConfig: "Nom, Email, Taille Préférée, Style",
    analyticsIDs: "GA ID: G-CHIC, GTM ID: GTM-FASHION01",
    gtagID: "G-CHIC",
    customPrompt: "Use a dark theme with pink and purple gradients. Feature fashion model photos, include outfit lookbooks, and add virtual fitting room interface.",
  },
  {
    campaignObjective: "زيادة الاشتراكات في تطبيق اللياقة المنزلية",
    productServiceName: "نشاط (Nachat)",
    primaryOffer: "7 أيام مجانية + برنامج تدريب شخصي",
    targetAudienceDescription: "الأشخاص الذين يريدون اللياقة في المنزل",
    buyerPersonaKeywords: "لياقة، تمارين، صحة، منزل، الجزائر",
    uniqueValueProposition: "تمارين فعالة في المنزل مع مدربين جزائريين ودون معدات.",
    topBenefits: "بدون معدات\nمدربين جزائريين\nبرامج مخصصة",
    featureList: "فيديوهات تدريبية\nخطط غذائية\nتتبع تقدم\nتحديات جماعية",
    emotionalTriggers: "صحة\nقوة\nثقة\nإنجاز",
    objections: "التحفيز\nصعوبة التمارين\nالسعر",
    testimonials: '"فقدت 8 كيلو في شهرين" - سامي ع.\n"تمارين فعالة ومريحة" - هند د.',
    trustIndicators: "50K+ مستخدم\nمدربين معتمدين\nبرامج متنوعة\nتجربة مجانية",
    primaryCTAText: "ابدأ مجاناً",
    secondaryCTAText: "تصفح البرامج",
    primaryConversionKPI: "30% trial-to-paid",
    toneOfVoice: "تحفيزي ومشجع",
    targetSEOKeywords: "تمارين منزلية الجزائر، لياقة بدنية، fitness maison Algerie, home workout",
    eventTrackingSetup: "trial_start, workout_complete, subscription_buy",
    brandColorPalette: "Primary: #F97316, Accent: #1F2937, Neutral: #F9FAFB",
    fontStyleGuide: "Heading: Tajawal Bold, Body: Noto Kufi Arabic Regular",
    pageLayoutPreference: "Workout showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي نصائح اللياقة.",
    formFieldsConfig: "الاسم، البريد الإلكتروني، الهدف من اللياقة",
    analyticsIDs: "GA ID: G-NACHAT, GTM ID: GTM-FIT02",
    gtagID: "G-NACHAT",
    customPrompt: "Use a light theme with orange and gray accents. Feature workout videos and trainer profiles, include progress tracking charts, and add nutrition plan preview.",
  },
  {
    campaignObjective: "Générer leads pour assurance auto digitale",
    productServiceName: "Protej",
    primaryOffer: "Devis gratuit en 2 min + réduction nouveaux clients 15%",
    targetAudienceDescription: "Propriétaires de véhicules en Algérie",
    buyerPersonaKeywords: "assurance auto, voiture, protection, Algérie",
    uniqueValueProposition: "Assurez votre véhicule en ligne rapidement avec les meilleures garanties.",
    topBenefits: "Devis instantané\nPrix compétitifs\nAssistance 24/7",
    featureList: "Souscription en ligne\nDéclaration sinistre app\nAssistance dépannage\nGarantie tous risques",
    emotionalTriggers: "Sécurité\nSérénité\nProtection\nConfiance",
    objections: "Prix des primes\nProcessus déclaration\nCouverture",
    testimonials: '"Souscription en 5 minutes" - Kamel H.\n"Service sinistre rapide" - Samia F.',
    trustIndicators: "Agréé par autorités\n30K+ assurés\nAssistance 24/7\nDevis gratuit",
    primaryCTAText: "Devis Gratuit",
    secondaryCTAText: "Nos Garanties",
    primaryConversionKPI: "25% quote-to-policy",
    toneOfVoice: "Rassurant et professionnel",
    targetSEOKeywords: "assurance auto Algérie, assurance voiture, car insurance Algeria, protection véhicule",
    eventTrackingSetup: "quote_start, quote_complete, policy_buy",
    brandColorPalette: "Primary: #3B82F6, Accent: #22C55E, Neutral: #0F172A",
    fontStyleGuide: "Heading: Inter Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Quote calculator",
    videoURL: "",
    privacyPolicyURL: "https://protej.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des informations sur mes garanties.",
    formFieldsConfig: "Nom, Téléphone, Type Véhicule, Wilaya",
    analyticsIDs: "GA ID: G-PROTEJ, GTM ID: GTM-INSURE01",
    gtagID: "G-PROTEJ",
    customPrompt: "Use a dark theme with blue and green accents. Feature car protection graphics, include instant quote calculator, and add coverage comparison table.",
  },
  {
    campaignObjective: "تعزيز مبيعات متجر الحرف اليدوية الجزائرية",
    productServiceName: "أصيل (Asil)",
    primaryOffer: "خصم 20% على المنتجات التقليدية + توصيل مجاني",
    targetAudienceDescription: "محبي الحرف اليدوية والهدايا الأصيلة",
    buyerPersonaKeywords: "حرف يدوية، تقليدي، هدايا، جزائري، صناعة محلية",
    uniqueValueProposition: "منتجات جزائرية أصيلة مصنوعة يدوياً من حرفيين محليين.",
    topBenefits: "صناعة يدوية\nتصاميم أصيلة\nدعم الحرفيين",
    featureList: "منتجات فريدة\nتخصيص الطلبات\nشهادة الأصالة\nتغليف فاخر",
    emotionalTriggers: "أصالة\nفخر\nتقاليد\nجودة",
    objections: "السعر\nوقت الإنتاج\nالشحن",
    testimonials: '"منتجات رائعة وأصيلة" - نبيلة ش.\n"هدية مثالية ومميزة" - عمر ف.',
    trustIndicators: "100+ حرفي\nمنتجات أصلية\nتوصيل آمن\nإرجاع مجاني",
    primaryCTAText: "تسوق الآن",
    secondaryCTAText: "الحرفيون",
    primaryConversionKPI: "15% purchase rate",
    toneOfVoice: "تراثي وفخور",
    targetSEOKeywords: "حرف يدوية جزائرية، منتجات تقليدية، artisanat algérien, handmade Algeria",
    eventTrackingSetup: "product_view, artisan_view, purchase_complete",
    brandColorPalette: "Primary: #D97706, Accent: #DC2626, Neutral: #F9FAFB",
    fontStyleGuide: "Heading: Amiri Bold, Body: Cairo Regular",
    pageLayoutPreference: "Artisan showcase",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي عروض المنتجات الحرفية.",
    formFieldsConfig: "الاسم، البريد الإلكتروني، رقم الهاتف",
    analyticsIDs: "GA ID: G-ASIL, GTM ID: GTM-CRAFT01",
    gtagID: "G-ASIL",
    customPrompt: "Use a light theme with amber and red accents. Feature artisan product photos with traditional patterns, include craftsmen stories, and add product customization interface.",
  },
  {
    campaignObjective: "Augmenter téléchargements app parking intelligent",
    productServiceName: "Park",
    primaryOffer: "1ère heure gratuite + paiement mobile sans contact",
    targetAudienceDescription: "Conducteurs urbains en Algérie cherchant parking",
    buyerPersonaKeywords: "parking, stationnement, Alger, voiture, smart parking",
    uniqueValueProposition: "Trouvez et réservez votre place de parking facilement dans toute l'Algérie.",
    topBenefits: "Places disponibles temps réel\nRéservation instantanée\nPaiement mobile",
    featureList: "Carte parkings\nRéservation\nNavigation GPS\nHistorique\nAbonnements mensuels",
    emotionalTriggers: "Gain de temps\nConfort\nSérénité\nEfficacité",
    objections: "Disponibilité places\nTarifs\nCouverture zones",
    testimonials: '"Plus de stress pour trouver parking" - Nabil M.\n"Application très pratique" - Lynda S.',
    trustIndicators: "200+ parkings\nAlger, Oran, Constantine\n15K+ utilisateurs\nPaiement sécurisé",
    primaryCTAText: "Télécharger App",
    secondaryCTAText: "Voir Parkings",
    primaryConversionKPI: "35% app-to-booking",
    toneOfVoice: "Pratique et moderne",
    targetSEOKeywords: "parking Alger, stationnement Algérie, smart parking, réserver place",
    eventTrackingSetup: "app_download, search_parking, booking_complete",
    brandColorPalette: "Primary: #059669, Accent: #0EA5E9, Neutral: #1F2937",
    fontStyleGuide: "Heading: DM Sans Bold, Body: Inter Regular",
    pageLayoutPreference: "Map with markers",
    videoURL: "",
    privacyPolicyURL: "https://park.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des notifications de disponibilité.",
    formFieldsConfig: "Nom, Email, Téléphone, Ville",
    analyticsIDs: "GA ID: G-PARK, GTM ID: GTM-PARKING01",
    gtagID: "G-PARK",
    customPrompt: "Use a dark theme with emerald and cyan accents. Feature interactive parking map, include real-time availability indicators, and add payment flow interface.",
  },
  {
    campaignObjective: "تعزيز حجوزات منصة السياحة الداخلية",
    productServiceName: "رحلة (Rihla)",
    primaryOffer: "خصم 30% على أول حجز + دليل سياحي مجاني",
    targetAudienceDescription: "الجزائريين الراغبين في استكشاف بلدهم",
    buyerPersonaKeywords: "سياحة، سفر، الجزائر، رحلات، معالم",
    uniqueValueProposition: "اكتشف جمال الجزائر مع باقات سياحية مميزة وأدلاء محترفين.",
    topBenefits: "وجهات متنوعة\nأسعار شاملة\nأدلاء محليين",
    featureList: "باقات سياحية\nحجز فنادق\nنقل مريح\nبرامج مخصصة\nجولات جماعية",
    emotionalTriggers: "مغامرة\nاكتشاف\nذكريات\nفخر",
    objections: "السعر\nجودة الخدمة\nالأمان",
    testimonials: '"رحلة رائعة إلى تيمقاد" - حسين ب.\n"تنظيم ممتاز وخدمة مميزة" - سلمى ر.',
    trustIndicators: "100+ وجهة\n5K+ مسافر\nأدلاء معتمدين\nضمان أفضل سعر",
    primaryCTAText: "استكشف الآن",
    secondaryCTAText: "الوجهات السياحية",
    primaryConversionKPI: "20% booking conversions",
    toneOfVoice: "ملهم ومشوق",
    targetSEOKeywords: "سياحة الجزائر، رحلات داخلية، tourisme Algérie, travel Algeria",
    eventTrackingSetup: "destination_view, package_select, booking_complete",
    brandColorPalette: "Primary: #0891B2, Accent: #F59E0B, Neutral: #F1F5F9",
    fontStyleGuide: "Heading: Cairo Bold, Body: Almarai Regular",
    pageLayoutPreference: "Destination gallery",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي عروض الرحلات السياحية.",
    formFieldsConfig: "الاسم، رقم الهاتف، الوجهة المفضلة، عدد الأشخاص",
    analyticsIDs: "GA ID: G-RIHLA, GTM ID: GTM-TRAVEL01",
    gtagID: "G-RIHLA",
    customPrompt: "Use a light theme with cyan and amber accents. Feature stunning Algerian destination photos (Sahara, Kabylie, Timgad), include package cards with itineraries, and add booking calendar.",
  },
  {
    campaignObjective: "Booster inscriptions plateforme éducation enfants",
    productServiceName: "Dars",
    primaryOffer: "1 mois gratuit + suivi personnalisé des progrès",
    targetAudienceDescription: "Parents d'enfants 6-14 ans en Algérie",
    buyerPersonaKeywords: "éducation enfants, soutien scolaire, cours, Algérie",
    uniqueValueProposition: "Aidez vos enfants à exceller avec des cours interactifs et enseignants qualifiés.",
    topBenefits: "Programme algérien\nEnseignants qualifiés\nSuivi personnalisé",
    featureList: "Cours vidéo\nExercices interactifs\nQuizzes\nRapports progrès\nSessions live",
    emotionalTriggers: "Réussite\nFierté\nAvenir\nSoutien",
    objections: "Coût\nEngagement enfant\nQualité enseignement",
    testimonials: '"Notes améliorées en 2 mois" - Parent de Yacine\n"Enfant plus motivé" - Mère de Lina',
    trustIndicators: "50+ enseignants\n5K+ élèves\nProgramme officiel\nEssai gratuit",
    primaryCTAText: "Essayer Gratuit",
    secondaryCTAText: "Nos Cours",
    primaryConversionKPI: "28% trial-to-paid",
    toneOfVoice: "Encourageant et éducatif",
    targetSEOKeywords: "soutien scolaire Algérie, cours en ligne enfants, éducation Algeria, online learning kids",
    eventTrackingSetup: "trial_start, lesson_complete, subscription_buy",
    brandColorPalette: "Primary: #8B5CF6, Accent: #F59E0B, Neutral: #F9FAFB",
    fontStyleGuide: "Heading: Quicksand Bold, Body: Open Sans Regular",
    pageLayoutPreference: "Course library",
    videoURL: "",
    privacyPolicyURL: "https://dars.dz/privacy",
    gdprCcpaConsentText: "J'accepte de recevoir des rapports de progrès.",
    formFieldsConfig: "Nom Parent, Email, Niveau Enfant, Matières",
    analyticsIDs: "GA ID: G-DARS, GTM ID: GTM-EDU02",
    gtagID: "G-DARS",
    customPrompt: "Use a light theme with purple and amber accents. Feature friendly educational illustrations, include progress tracking dashboard for parents, and add interactive lesson preview.",
  },
  {
    campaignObjective: "زيادة التنزيلات لتطبيق تأجير السيارات",
    productServiceName: "كار (Kar)",
    primaryOffer: "يوم مجاني على الحجز الأول + تأمين شامل",
    targetAudienceDescription: "المسافرين والمهنيين في الجزائر",
    buyerPersonaKeywords: "تأجير سيارات، إيجار، سفر، الجزائر",
    uniqueValueProposition: "استأجر سيارتك بكل سهولة من مطار أو أي مكان في الجزائر.",
    topBenefits: "أسطول حديث\nأسعار شفافة\nتأمين شامل",
    featureList: "حجز فوري\nسيارات متنوعة\nتوصيل للمطار\nبدون كفيل\nإلغاء مجاني",
    emotionalTriggers: "حرية\nراحة\nمغامرة\nموثوقية",
    objections: "السعر\nشروط التأجير\nحالة السيارات",
    testimonials: '"سيارات نظيفة وخدمة ممتازة" - رضا ح.\n"حجز سهل وسريع" - مريم ك.',
    trustIndicators: "200+ سيارة\nتأمين شامل\n24/7 دعم\nبدون رسوم خفية",
    primaryCTAText: "احجز سيارة",
    secondaryCTAText: "تصفح الأسطول",
    primaryConversionKPI: "25% booking rate",
    toneOfVoice: "احترافي وموثوق",
    targetSEOKeywords: "تأجير سيارات الجزائر، location voiture Algérie, car rental Algeria",
    eventTrackingSetup: "car_search, booking_start, reservation_complete",
    brandColorPalette: "Primary: #1F2937, Accent: #F97316, Neutral: #F9FAFB",
    fontStyleGuide: "Heading: Tajawal Bold, Body: Cairo Regular",
    pageLayoutPreference: "Car catalog",
    videoURL: "",
    privacyPolicyURL: "https://example.dz/privacy",
    gdprCcpaConsentText: "أوافق على تلقي عروض التأجير الخاصة.",
    formFieldsConfig: "الاسم، رقم الهاتف، تاريخ الاستلام، المدة",
    analyticsIDs: "GA ID: G-KAR, GTM ID: GTM-RENT01",
    gtagID: "G-KAR",
    customPrompt: "Use a light theme with dark gray and orange accents. Feature car fleet photos with specs, include booking calendar and pricing calculator, and add pickup location map.",
  },
  {
    campaignObjective: "Launch universal agentic AI landing page builder",
    productServiceName: "Caelum.ai",
    primaryOffer: "Free 7-day agentic build sprint + unlimited niche templates",
    targetAudienceDescription: "Founders, marketers, and product teams across SaaS, eCommerce, services, and emerging niches",
    buyerPersonaKeywords: "agentic AI, landing page builder, GPT-5, multi-niche, autonomous generation",
    uniqueValueProposition: "Autonomous GPT-5 powered agent swarm that plans, composes, designs, and deploys conversion-tuned landing pages for any niche in minutes.",
    topBenefits: "Multi-niche coverage\nAutonomous optimization\nBuilt-in experimentation\nIntegrated deployment",
    featureList: "Agentic brief parsing\nSemantic niche expansion\nDynamic component library\nReal-time copy refinement\nMulti-variant testing orchestrator\nOne-click deploy",
    emotionalTriggers: "Speed\nConfidence\nInnovation\nScale",
    objections: "AI originality concerns\nQuality control\nBrand voice alignment\nComplexity",
    testimonials: '"Generated 3 niche pages in under 10 minutes" - L. Ortega\n"Agent swarm increased conversions 34%" - P. Singh',
    trustIndicators: "GPT-5 core\nAgent orchestration layer\nSOC2 roadmap\nEarly adopter community",
    primaryCTAText: "Start Free Sprint",
    secondaryCTAText: "View Templates",
    primaryConversionKPI: "30% sprint-to-plan activation",
    toneOfVoice: "Visionary yet practical",
    targetSEOKeywords: "agentic AI landing page builder, GPT-5 marketing, autonomous page generation, AI deployment builder",
    eventTrackingSetup: "brief_submit, agent_plan, variant_publish, deploy_complete",
    brandColorPalette: "Primary: #7F5AF0, Accent: #00D8A4, Neutral: #0D1117",
    fontStyleGuide: "Heading: Space Grotesk Bold, Body: Inter Regular",
    pageLayoutPreference: "Hero + Agent timeline + Variant grid",
    logoUpload: null,
    heroImage: null,
    secondaryImages: [],
    videoURL: "",
    privacyPolicyURL: "https://caelum.ai/privacy",
    gdprCcpaConsentText: "I agree to receive agentic build updates.",
    formFieldsConfig: "Name, Email, Company, Use Case",
    analyticsIDs: "GA ID: G-CAELOM, GTM ID: GTM-CAE01",
    gtagID: "G-CAELOM",
    customPrompt: "Use a dark cosmos theme with aurora gradient (purple→teal). Showcase autonomous agent timeline, multi-niche template carousel, conversion uplift stats cards, real-time variant panel, and prominent deploy button.",
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

  // Upload single file or multiple (secondaryImages) to backend to obtain public URLs
  const handleFileUpload = async (field: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/tiff',
      'image/bmp',
      'image/heic',
      'image/avif',
      'image/ico'
    ]

    const toUpload = Array.from(files).filter(f => allowedTypes.includes(f.type))
    if (toUpload.length === 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Unsupported file type' }))
      return
    }

    const uploadOne = async (file: File): Promise<string | null> => {
      try {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('https://builder-agent-api-934682636966.europe-southwest1.run.app/v1/uploads/upload-image', {
          method: 'POST',
          body: form,
        })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        // Assume API returns { url: string }
        return data.url || null
      } catch (e) {
        console.error('Upload error', e)
        return null
      }
    }

    if (field === 'secondaryImages') {
      const uploaded: string[] = []
      for (const f of toUpload) {
        const url = await uploadOne(f)
        if (url) uploaded.push(url)
      }
      setFormData(prev => ({
        ...prev,
        secondaryImages: [...(prev.secondaryImages || []), ...uploaded]
      }))
    } else {
      const url = await uploadOne(toUpload[0])
      if (!url) {
        setErrors(prev => ({ ...prev, [field]: 'Upload failed' }))
        return
      }
      setFormData(prev => ({
        ...prev,
        [field]: url
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
    if (field === 'secondaryImages' && index !== undefined) {
      setFormData(prev => ({
        ...prev,
        secondaryImages: prev.secondaryImages?.filter((_, i) => i !== index) || []
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: null
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
        <div className="bg-card/50 border border-border/50 rounded-2xl p-8 sm:p-10 backdrop-blur-sm relative">
          {/* Dice button in top right */}
          <button
            onClick={fillDummyData}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors opacity-30 hover:opacity-100"
            type="button"
            title="Fill with random data"
          >
            <Dices className="w-5 h-5" />
          </button>

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

                      {/* Display uploaded URLs */}
                      {Array.isArray(value) && value.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {value.map((url: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-border/50"
                            >
                              <span className="text-sm text-muted-foreground truncate">{url.split('/').pop()}</span>
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

                    {/* Display uploaded URL */}
                    {typeof value === 'string' && value.trim().length > 0 && (
                      <div className="mt-3 flex items-center justify-between bg-background/50 p-3 rounded-lg border border-border/50">
                        <span className="text-sm text-muted-foreground truncate">{value.split('/').pop()}</span>
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
