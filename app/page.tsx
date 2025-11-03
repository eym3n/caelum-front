"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Code2, Rocket, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background grid effect */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 hover:border-accent/50 transition-colors">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-muted-foreground">AI-Powered Landing Pages</span>
        </div>

        {/* Main heading */}
        <h1 className="text-balance text-center text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-foreground">Create Stunning Landing Pages</span>
          <br />
          <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
            in Minutes with AI
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-balance text-center text-lg sm:text-xl text-muted-foreground mb-12 max-w-3xl leading-relaxed">
          No design skills needed. Answer a few questions about your product, and our AI generates a fully optimized,
          conversion-focused landing page tailored to your audience.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/create">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 rounded-xl glow-cyan-lg transition-all hover:shadow-2xl cursor-pointer w-full sm:w-auto"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Start Creating Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-border hover:bg-card/50 hover:border-accent/30 text-foreground font-semibold text-lg px-8 py-6 rounded-xl transition-all bg-transparent"
          >
            <Code2 className="mr-2 w-5 h-5" />
            See How It Works
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mb-16">
          <div className="p-6 rounded-xl bg-card/40 border border-border/30 hover:border-accent/20 transition-all backdrop-blur-sm">
            <Rocket className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-sm font-semibold mb-2">60 Seconds</h3>
            <p className="text-xs text-muted-foreground">Answer questions and get your page instantly generated</p>
          </div>
          <div className="p-6 rounded-xl bg-card/40 border border-border/30 hover:border-accent/20 transition-all backdrop-blur-sm">
            <BarChart3 className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-sm font-semibold mb-2">Conversion Optimized</h3>
            <p className="text-xs text-muted-foreground">AI-designed for maximum engagement and sales</p>
          </div>
          <div className="p-6 rounded-xl bg-card/40 border border-border/30 hover:border-accent/20 transition-all backdrop-blur-sm">
            <Code2 className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-sm font-semibold mb-2">Fully Editable</h3>
            <p className="text-xs text-muted-foreground">Download and customize your page however you want</p>
          </div>
        </div>

        {/* Social proof (placeholder) */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Trusted by leading brands worldwide</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="w-24 h-8 bg-card/30 rounded-lg border border-border/20" />
            <div className="w-24 h-8 bg-card/30 rounded-lg border border-border/20" />
            <div className="w-24 h-8 bg-card/30 rounded-lg border border-border/20" />
          </div>
        </div>
      </div>

      {/* Floating accent element */}
      <div className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 pointer-events-none animate-float" />
    </div>
  )
}
