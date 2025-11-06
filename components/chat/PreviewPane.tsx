"use client"
import React, { useMemo } from 'react'

interface Props {
  status: string
  refreshToken: string
  toolStatus?: { text: string; shouldRender: boolean }
  deployedUrl?: string | null
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

export function PreviewPane({ status, refreshToken, toolStatus, deployedUrl }: Props) {
  const frameSrc = useMemo(() => {
    const baseUrl = 'http://localhost:3000/'
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}r=${encodeURIComponent(refreshToken)}`
  }, [refreshToken])
  const shouldDisplayFrame = status === 'streaming' || status === 'completed'
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex h-14 items-center justify-between px-4 border-b border-(--color-border)">
        <h2 className="text-sm font-semibold tracking-tight">Live Preview</h2>
      </header>
      {deployedUrl && (
        <div className="flex items-center gap-3 px-4 py-2 text-xs border-b border-(--color-border) bg-(--color-card)">
          <img src="/vercel-logo.svg" alt="Vercel" className="size-4 rounded-full" />
          <a
            href={`https://${deployedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline truncate max-w-[60%]"
            title={deployedUrl}
          >
            {deployedUrl}
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(`https://${deployedUrl}`)}
            className="rounded-md border border-(--color-border) bg-background px-2 py-1 hover:bg-(--color-card) transition-colors"
          >
            Copy URL
          </button>
          <span className="text-(--color-muted)">Deployed ✓</span>
        </div>
      )}
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
        {toolStatus?.shouldRender && (
          <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-card) px-3 py-2 shadow-lg backdrop-blur animate-pulse-fast">
            <div className="size-3 rounded-full border-2 border-(--color-border) border-t-(--color-muted) animate-spin" />
            <span className="text-xs text-muted-foreground">{toolStatus.text || 'Working...'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
