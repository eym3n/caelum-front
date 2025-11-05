"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface PayloadData {
  campaign: {
    objective: string
    productName: string
    primaryOffer: string
  }
  audience: {
    description: string
    personaKeywords: string[]
    uvp: string
  }
  benefits: {
    topBenefits: string[]
    features: string[]
    emotionalTriggers: string[]
  }
  trust: {
    objections: string[]
    testimonials: string[]
    indicators: string[]
  }
  conversion: {
    primaryCTA: string
    secondaryCTA: string | null
    primaryKPI: string
  }
  messaging: {
    tone: string
    seoKeywords: string[]
    eventTracking: string[]
  }
  branding: {
    colorPalette: { raw: string }
    fonts: string
    layoutPreference: string
  }
  media: {
    videoUrl: string | null
    privacyPolicyUrl: string
    consentText: string
  }
  advanced: {
    formFields: string[]
    analytics: { rawIDs: string; gtag: string }
    customPrompt: string
  }
  assets: {
    logo: string | null
    heroImage: string | null
    secondaryImages: string[]
  }
}

interface PayloadContextType {
  payload: PayloadData | null
  setPayload: (payload: PayloadData) => void
  clearPayload: () => void
}

const PayloadContext = createContext<PayloadContextType | undefined>(undefined)

export function PayloadProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<PayloadData | null>(null)

  const clearPayload = () => setPayload(null)

  return (
    <PayloadContext.Provider value={{ payload, setPayload, clearPayload }}>
      {children}
    </PayloadContext.Provider>
  )
}

export function usePayload() {
  const context = useContext(PayloadContext)
  if (context === undefined) {
    throw new Error('usePayload must be used within a PayloadProvider')
  }
  return context
}
