"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useStreamSession } from '@/components/chat/useStreamSession'
import { ChatPane } from '@/components/chat/ChatPane'
import LivePreview from '@/components/chat/LivePreview'
import { ResizeHandle } from '@/components/chat/ResizeHandle'
import type { StreamMessage } from '@/components/chat/types'
import { usePayload } from '@/contexts/PayloadContext'
import Image from 'next/image'
import { Smartphone, Maximize2, Minimize2, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function BuilderPage() {
  const params = useParams<{ sessionId?: string }>()
  const routeSessionId = params?.sessionId as string | undefined
  const { messages, status, start, sessionId, error } = useStreamSession(routeSessionId)
  const router = useRouter()
  const { payload } = usePayload()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [ratio, setRatio] = useState<number>(0.65)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const prevRatioRef = React.useRef<number>(0.65)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false)
  const [followUpToolText, setFollowUpToolText] = useState<string | null>(null)
  // Manual refresh counter (also used for safe, single auto-refresh when build is done)
  const [previewRefresh, setPreviewRefresh] = useState(0)
  // Tracks whether the preview environment has successfully reached "ready" at least once
  const [previewReady, setPreviewReady] = useState(false)
  // Ensure we only auto-refresh once per builder session
  const [autoRefreshedSessionId, setAutoRefreshedSessionId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!routeSessionId) {
      router.replace('/create')
    }
  }, [routeSessionId, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('builder:ratio')
    if (!stored) return
    const parsed = parseFloat(stored)
    if (Number.isFinite(parsed)) {
      const clamped = Math.min(0.6667, Math.max(0.35, parsed))
      setRatio(clamped)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('builder:ratio', ratio.toString())
  }, [ratio])

  const handleFollowUpDone = React.useCallback(() => {
    if (!previewReady) return
    console.log('[builder] Auto-refreshing preview after follow-up done signal', {
      sessionId,
      previewReady,
    })
    setPreviewRefresh((r) => r + 1)
  }, [previewReady, sessionId])

  useEffect(() => {
    if (!routeSessionId) return
    if (status !== 'idle') return
    if (!payload) {
      console.log('[builder] No payload provided; awaiting existing session activity.')
      return
    }
    console.log('[builder] Using payload from context:', payload)
    start({ payload })
  }, [status, start, payload, routeSessionId])

  // Compute tool status for preview pane toast
  const toolStatus = useMemo(() => {
    // During follow-up streaming always show toast with latest tool text or generic working
    if (isFollowUpStreaming) {
      return { text: followUpToolText || 'Working...', shouldRender: true }
    }
    const isVisibleMessage = (msg: StreamMessage) =>
      msg?.type === 'message' &&
      msg?.node &&
      !msg.node.includes('_tools') &&
      !msg.node.includes('designer') &&
      (msg.node.includes('clarify') ||
      msg.node.includes('coder'))

    let latestIndex = -1
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const candidate = messages[i]
      if (candidate?.node?.includes('_tools')) {
        latestIndex = i
        break
      }
    }

    if (latestIndex === -1) {
      const shouldRender = status === 'initializing' || status === 'streaming'
      return {
        text: 'Working...',
        shouldRender,
      }
    }

    const hasAgentAfterTool = messages.slice(latestIndex + 1).some(isVisibleMessage)
    if (hasAgentAfterTool) {
      return { text: '', shouldRender: false }
    }

    const latestToolText = messages[latestIndex]?.text?.trim()
    return {
      text: latestToolText && latestToolText.length > 0 ? latestToolText : 'Working...',
      shouldRender: true,
    }
  }, [messages, status, isFollowUpStreaming, followUpToolText])

  const previewStyle: React.CSSProperties = isFullscreen
    ? { flexGrow: 1, flexBasis: '100%' }
    : { flexGrow: ratio, flexBasis: 0 }
  const chatStyle: React.CSSProperties = { flexGrow: 1 - ratio, flexBasis: 0 }

  const clampRatio = (r: number) => Math.min(0.6667, Math.max(0.35, r))
  const setPreviewWidthPx = (targetPx: number) => {
    const container = containerRef.current
    if (!container) return
    const bounds = container.getBoundingClientRect()
    const cs = getComputedStyle(container)
    const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0
    const handle = container.querySelector('[role=\"separator\"]') as HTMLElement | null
    const handleWidth = handle?.getBoundingClientRect().width || 16
    const available = Math.max(1, bounds.width - gap - handleWidth)
    const r = clampRatio(targetPx / available)
    setRatio(r)
  }

  // Only enable WebContainer after first real streamed event (has 'raw' property from backend)
  // Exclude synthetic messages (user_brief, intake_component) added before streaming starts
  // Tool messages (designer_tools, coder_tools) are valid first events
  const hasFirstStreamedEvent = useMemo(() => {
    return messages.some(m =>
      m?.raw && // Real streamed event has 'raw' property
      m?.type === 'message' &&
      m?.node &&
      m.node !== 'user_brief' &&
      m.node !== 'intake_component'
    )
  }, [messages])

  const hasRouteSession = typeof routeSessionId === 'string' && routeSessionId.length > 0
  const previewEnabled = hasFirstStreamedEvent || (!payload && hasRouteSession)

  // Reset preview-ready metadata when a new session starts
  useEffect(() => {
    setPreviewReady(false)
    setAutoRefreshedSessionId(null)
  }, [sessionId])

  // Auto-refresh the live preview exactly once per session when the backend signals completion.
  // This waits until the preview environment has successfully booted at least once to avoid
  // interrupting the initial dependency installation / dev-server startup.
  useEffect(() => {
    if (!previewReady) return
    if (status !== 'completed') return
    if (autoRefreshedSessionId === sessionId) return

    console.log('[builder] Auto-refreshing preview on done signal', {
      sessionId,
      status,
      hasFirstStreamedEvent,
      previewReady,
    })

    setPreviewRefresh((r) => r + 1)
    setAutoRefreshedSessionId(sessionId)
  }, [status, previewReady, autoRefreshedSessionId, sessionId])

  return (
    <AuthGuard>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Background accents */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(114,105,248,0.14),transparent_60%)] blur-2xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(114,105,248,0.10),transparent_60%)] blur-2xl pointer-events-none" />

      {/* Builder top bar */}
      <header className="relative z-10 border-b border-(--color-border) bg-background/70 backdrop-blur">
        <div className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="caelum.ai" width={18} height={18} />
            <span className="text-sm font-semibold">caelum.ai Builder</span>
            <span className="ml-3 text-[11px] text-(--color-muted)">Session</span>
            <code className="text-[11px] px-1.5 py-0.5 rounded bg-(--color-card) border border-(--color-border)">{sessionId.slice(0, 8)}</code>
            <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] rounded-full border border-(--color-border) bg-(--color-card) px-2 py-0.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="capitalize">{status}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="
              hover:bg-(--color-card)"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <Moon className="w-4 h-4" />
              ) : theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            <button
              onClick={() => router.push('/create')}
              className="text-xs rounded-md px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Restart
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-row min-h-0 gap-3 px-4 sm:px-6 lg:px-8 py-3" data-resize-container ref={containerRef}>
        <div style={previewStyle} className="flex flex-col min-h-0 min-w-[33%] border border-(--color-border) bg-(--color-card) rounded-xl shadow-sm overflow-hidden">
          {/* Pane header */}
          <header className="flex h-12 items-center justify-between px-4 border-b border-(--color-border) bg-[linear-gradient(180deg,rgba(114,105,248,0.06),transparent)]">
            <h2 className="text-xs font-semibold tracking-tight">Live Preview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Approximate mobile width ~ 390px
                  setIsFullscreen(false)
                  setPreviewWidthPx(390)
                }}
                className="text-xs rounded-md px-2.5 py-1.5 border border-(--color-border) bg-background hover:bg-(--color-card)"
                title="Mobile view"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (!isFullscreen) {
                    prevRatioRef.current = ratio
                    setIsFullscreen(true)
                  } else {
                    setIsFullscreen(false)
                    setRatio(clampRatio(prevRatioRef.current || 0.65))
                  }
                }}
                className="text-xs rounded-md px-2.5 py-1.5 border border-(--color-border) bg-background hover:bg-(--color-card)"
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  console.log('[Builder] Refresh button clicked', { hasFirstStreamedEvent, currentRefresh: previewRefresh });
                  setPreviewRefresh(r => {
                    const next = r + 1;
                    console.log('[Builder] Refresh token incrementing', { from: r, to: next });
                    return next;
                  });
                }}
                disabled={!previewEnabled}
                className="text-xs rounded-md px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >Refresh</button>
            </div>
          </header>
          <div className="relative flex-1 min-h-0">
            {/* Manual refresh only; no auto reload */}
            <LivePreview
              sessionId={sessionId}
              enabled={previewEnabled}
              refreshToken={previewRefresh}
              onFirstReady={() => {
                // Mark the preview as safely booted; subsequent "done" signals can trigger
                // a controlled auto-refresh without risking install/start races.
                setPreviewReady(true)
              }}
            />
            {/* Bottom-right toast for latest tool action */}
            {toolStatus?.shouldRender && (
              <div className="absolute bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-(--color-border) bg-(--color-card) px-3 py-2 shadow-lg backdrop-blur animate-pulse-fast">
                <div className="h-3 w-3 border-2 border-(--color-border) border-t-(--color-muted) rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground max-w-[52ch] line-clamp-2">
                  {toolStatus.text || 'Working...'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: isFullscreen ? 'none' : undefined }}>
          <ResizeHandle onResize={setRatio} />
        </div>
        <div
          style={isFullscreen ? { display: 'none' } : chatStyle}
          className="flex flex-col min-h-0 min-w-[33%] border border-(--color-border) bg-(--color-card) rounded-xl shadow-sm overflow-hidden"
        >
          <ChatPane
            messages={messages}
            status={status}
            onRestart={() => {
              router.push('/create')
            }}
            sessionId={sessionId}
            error={error}
            onDeploySuccess={(url) => setDeployedUrl(url)}
            onChatStreamState={(active) => {
              setIsFollowUpStreaming(active)
              if (!active) setFollowUpToolText(null)
              else setFollowUpToolText('Working...')
            }}
            onToolMessage={(text) => {
              setFollowUpToolText(text?.trim() || 'Working...')
            }}
            onDoneSignal={handleFollowUpDone}
            // Removed onChatProgress to stop auto preview refresh
          />
        </div>
      </div>
      </div>
    </AuthGuard>
  )
}
