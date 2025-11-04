"use client"
import React, { useMemo } from 'react'

interface Props {
  status: string
  refreshToken: string
}

const STATUS_LABELS: Record<string, { title: string; subtitle: string }> = {
  idle: {
    title: 'Preview will appear here',
    subtitle: 'Send a brief to generate a responsive layout snapshot.',
  },
  initializing: {
    title: 'Preparing sandbox',
    subtitle: 'Spooling design system tokens and booting renderer...',
  },
  streaming: {
    title: 'Streaming components',
    subtitle: 'Receiving layout instructions and assembling blocks in realtime.',
  },
  completed: {
    title: 'Build complete',
    subtitle: 'Final markup ready. Visual rendering coming next.',
  },
  error: {
    title: 'Preview failed',
    subtitle: 'Check server logs and retry the build.',
  },
}

export function PreviewPane({ status, refreshToken }: Props) {
  const meta = useMemo(() => STATUS_LABELS[status] ?? STATUS_LABELS.idle, [status])
  const frameSrc = useMemo(() => {
    const baseUrl = 'http://localhost:3000/'
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}r=${encodeURIComponent(refreshToken)}`
  }, [refreshToken])
  const shouldDisplayFrame = status === 'streaming' || status === 'completed'
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex h-12 items-center justify-between px-4 border-b border-(--color-border)">
        <h2 className="text-sm font-semibold tracking-tight">Live Preview</h2>
        <span className="text-[10px] text-muted-foreground">placeholder</span>
      </header>
      <div className="relative flex-1 min-h-0 bg-(--color-card)">
        {shouldDisplayFrame && (
          <iframe
            key="preview-frame"
            src={frameSrc}
            title="Generated preview"
            className="h-full w-full border-0"
          />
        )}
        {status === 'initializing' && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background backdrop-blur">
            <div className="size-10 rounded-full border-4 border-(--color-border) border-t-(--color-muted) animate-spin" />
            <p className="text-sm text-muted-foreground">Initializing...</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex flex-col items-start gap-1 rounded-md bg-background/75 px-3 py-2 text-left text-[11px] text-muted-foreground backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{meta.title}</span>
          <span className="text-[11px] leading-snug">{meta.subtitle}</span>
        </div>
      </div>
    </div>
  )
}
