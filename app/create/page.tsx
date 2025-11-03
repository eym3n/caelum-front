"use client"
import { LandingPageForm } from "@/components/landing-page-form"

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background grid effect */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <LandingPageForm />
      </div>
    </div>
  )
}
