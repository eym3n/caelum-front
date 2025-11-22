export type LandingPageStatus = "pending" | "generating" | "generated" | "failed";

export interface LandingPageBusinessData {
  campaign?: {
    objective?: string | null;
    productName?: string | null;
    primaryOffer?: string | null;
  };
  audience?: {
    description?: string | null;
    personaKeywords?: string[];
    uvp?: string | null;
  };
  benefits?: {
    topBenefits?: string[];
    features?: string[];
    emotionalTriggers?: string[];
  };
  trust?: {
    objections?: string[];
    testimonials?: string[];
    indicators?: string[];
  };
  conversion?: {
    primaryCTA?: string | null;
    secondaryCTA?: string | null;
    primaryKPI?: string | null;
  };
  messaging?: {
    tone?: string | null;
    seoKeywords?: string[];
    eventTracking?: string[];
  };
  branding?: {
    theme?: string | null;
    colorPalette?: Record<string, string | undefined>;
    fonts?: string | null;
    layoutPreference?: string | null;
    sections?: string[];
    sectionData?: Record<string, unknown>;
  };
  media?: {
    videoUrl?: string | null;
    privacyPolicyUrl?: string | null;
    consentText?: string | null;
  };
  advanced?: {
    formFields?: string[];
    analytics?: {
      gtag?: string | null;
      rawIDs?: string | null;
    };
    customPrompt?: string | null;
  };
  assets?: {
    logo?: string | null;
    heroImage?: string | null;
    secondaryImages?: string[];
    favicon?: string | null;
    sectionAssets?: Record<string, unknown>;
  };
}

export interface LandingPageRecord {
  id: string;
  user_id: string;
  session_id: string;
  status: LandingPageStatus;
  preview_url?: string | null;
  deployment_url?: string | null;
  business_data?: LandingPageBusinessData | null;
  design_blueprint_pdf_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandingPagesResponse {
  items: LandingPageRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

