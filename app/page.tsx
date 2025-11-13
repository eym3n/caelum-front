"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Code2, Rocket, BarChart3, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background grid + soft radial accents */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(114,105,248,0.18),transparent_60%)] blur-2xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(114,105,248,0.12),transparent_60%)] blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="caelum.ai" width={28} height={28} />
            <span className="text-sm font-semibold tracking-tight">caelum.ai</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/create">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="border-border hover:bg-card/50"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {mounted ? (theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />) : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Hero */}
        <section className="flex-1 grid lg:grid-cols-2 items-center gap-10 px-4 sm:px-6 lg:px-8 py-14">
          {/* Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground border border-border/60 mb-5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">AI Landing Pages • Fast, Beautiful, On-Brand</span>
            </div>
            <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Bring Your</span>{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">Launch</span>{" "}
              <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">to Life</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
              Describe your product. caelum.ai plans, writes, designs, and assembles a conversion‑ready landing page—
              then lets you tweak everything before deploying.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/create">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-7 py-6 rounded-xl shadow-md"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Start Free Sprint
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-card/50 text-foreground font-semibold text-base px-7 py-6 rounded-xl"
                >
                  <Code2 className="mr-2 w-5 h-5" />
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Powered by */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Powered by</span>
              <Image src="/ayor-logo.svg" alt="Ayor" width={86} height={24} />
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            {/* Orbital card */}
            <div className="relative mx-auto max-w-lg rounded-3xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(114,105,248,0.25),transparent_60%)] blur-xl" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full border border-border/60 grid place-items-center">
                      <Image src="/logo.svg" alt="caelum.ai" width={16} height={16} />
                    </div>
                    <span className="text-sm font-medium">caelum.ai Builder</span>
                  </div>
                  <div className="text-[10px] px-2 py-1 rounded-full bg-accent border border-border/60 text-accent-foreground">Live</div>
                </div>
                <div className="aspect-[16/10] rounded-xl bg-[linear-gradient(135deg,rgba(114,105,248,0.10),transparent),radial-gradient(120%_120%_at_0%_0%,rgba(114,105,248,0.15),transparent_60%)] border border-border/60 grid place-items-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your page preview appears here</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">Streamed from the AI builder</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-border/60 bg-background/60">
                    <Rocket className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs font-medium">Instant</p>
                    <p className="text-[11px] text-muted-foreground">Generate in seconds</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-background/60">
                    <BarChart3 className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs font-medium">Optimized</p>
                    <p className="text-[11px] text-muted-foreground">Conversion-focused</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-background/60">
                    <Code2 className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs font-medium">Editable</p>
                    <p className="text-[11px] text-muted-foreground">Yours to tweak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
