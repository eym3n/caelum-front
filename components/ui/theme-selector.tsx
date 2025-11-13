"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeSelectorProps {
  value: "light" | "dark" | ""
  onChange: (value: "light" | "dark") => void
  className?: string
}

export function ThemeSelector({ value, onChange, className }: ThemeSelectorProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      <button
        type="button"
        onClick={() => onChange("light")}
        className={cn(
          "group flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
          value === "light"
            ? "border-primary bg-primary/10 shadow-sm"
            : "border-border bg-background hover:bg-accent/50"
        )}
      >
        <div className="relative h-16 w-24 overflow-hidden rounded-md border border-border bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white" />
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-slate-100" />
          <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-slate-300" />
          <div className="absolute top-2 left-5 h-2 w-8 rounded bg-slate-200" />
          <div className="absolute top-6 left-2 h-1.5 w-16 rounded bg-slate-200" />
          <div className="absolute top-8 left-2 h-1.5 w-12 rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Light</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onChange("dark")}
        className={cn(
          "group flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
          value === "dark"
            ? "border-primary bg-primary/10 shadow-sm"
            : "border-border bg-background hover:bg-accent/50"
        )}
      >
        <div className="relative h-16 w-24 overflow-hidden rounded-md border border-border bg-slate-900 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-slate-950" />
          <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-slate-700" />
          <div className="absolute top-2 left-5 h-2 w-8 rounded bg-slate-800" />
          <div className="absolute top-6 left-2 h-1.5 w-16 rounded bg-slate-800" />
          <div className="absolute top-8 left-2 h-1.5 w-12 rounded bg-slate-800" />
        </div>
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Dark</span>
        </div>
      </button>
    </div>
  )
}

