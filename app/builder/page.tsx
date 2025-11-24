"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useStreamSession } from '@/components/chat/useStreamSession'
import { ChatPane } from '@/components/chat/ChatPane'
import LivePreview, { type LivePreviewHandle } from '@/components/chat/LivePreview'
import type { StreamMessage } from '@/components/chat/types'
import { usePayload } from '@/contexts/PayloadContext'
import Image from 'next/image'
import { Smartphone, Maximize2, Minimize2, Moon, Sun, ArrowLeft, Download, Monitor, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function BuilderPage() {
  const params = useParams<{ sessionId?: string }>()
  const routeSessionId = params?.sessionId as string | undefined
  const { messages, status, start, sessionId, error } = useStreamSession(routeSessionId)
  const router = useRouter()
  const { payload } = usePayload()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const livePreviewRef = React.useRef<LivePreviewHandle | null>(null)
  // Preview is now flex-1, no manual resizing
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false)
  const [previewRefresh, setPreviewRefresh] = useState(0)
  const [previewReady, setPreviewReady] = useState(false)
  const [autoRefreshedSessionId, setAutoRefreshedSessionId] = useState<string | null>(null)
  const [pendingPreviewRefresh, setPendingPreviewRefresh] = useState(false)
  const [previewEnabled, setPreviewEnabled] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!routeSessionId) {
      router.replace('/create')
    }
  }, [routeSessionId, router])

  // Removed local storage ratio effect

  const requestPreviewRefresh = React.useCallback(
    (reason: string) => {
      if (!previewReady) {
        console.log('[builder] Preview not ready yet; queuing refresh', {
          sessionId,
          reason,
        })
        setPendingPreviewRefresh(true)
        return
      }
      console.log('[builder] Auto-refreshing preview', {
        sessionId,
        reason,
      })
      setPreviewRefresh((r) => r + 1)
    },
    [previewReady, sessionId],
  )

  const handleExport = React.useCallback(async () => {
    if (!livePreviewRef.current) {
      console.warn('[builder] Export requested but preview is not ready yet.')
      return
    }
    try {
      setIsExporting(true)
      const data = await livePreviewRef.current.exportProject('/')
      if (!data || data.length === 0) {
        throw new Error('No data returned from export')
      }
      const blob = new Blob([data], { type: 'application/zip' })
      const filenameBase = sessionId || routeSessionId || 'landing-page'
      const filename = `landing-page-${filenameBase}.zip`
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      console.log('[builder] Export completed', { filename })
    } catch (err) {
      console.error('[builder] Failed to export preview', err)
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Unable to export the preview files right now. Please try again in a moment.')
      }
    } finally {
      setIsExporting(false)
    }
  }, [sessionId, routeSessionId])

  useEffect(() => {
    if (!previewReady) return
    if (!pendingPreviewRefresh) return
    console.log('[builder] Fulfilling queued preview refresh', { sessionId })
    setPendingPreviewRefresh(false)
    setPreviewRefresh((r) => r + 1)
  }, [pendingPreviewRefresh, previewReady, sessionId])

  const handleFollowUpDone = React.useCallback(() => {
    requestPreviewRefresh('follow-up done signal')
  }, [requestPreviewRefresh])

  useEffect(() => {
    if (!routeSessionId) return
    if (status !== 'idle') return
    if (!payload) {
      console.log('[builder] No payload provided; awaiting existing session activity.')
      return
    }
    if (typeof window !== 'undefined') {
      const key = `builder:init-started:${routeSessionId}`
      if (window.sessionStorage.getItem(key) === '1') {
        console.log('[builder] Init already started for this session; skipping duplicate init.', {
          routeSessionId,
        })
        return
      }
      window.sessionStorage.setItem(key, '1')
    }
    console.log('[builder] Using payload from context, starting init job:', {
      sessionId,
      routeSessionId,
    })
    start({
      payload,
      onJobComplete: () => {
        requestPreviewRefresh('init job completed')
      },
    })
  }, [status, start, payload, routeSessionId, requestPreviewRefresh])

  const toolStatus = useMemo(() => {
    const shouldRender =
      status === 'initializing' ||
      status === 'streaming' ||
      isFollowUpStreaming

    return {
      text: 'Working...',
      shouldRender,
    }
  }, [status, isFollowUpStreaming])

  const hasFirstStreamedEvent = useMemo(
    () => messages.some((m) => m?.node && m.node.includes('designer_tools')),
    [messages],
  )

  const hasRouteSession = typeof routeSessionId === 'string' && routeSessionId.length > 0

  useEffect(() => {
    setPreviewReady(false)
    setAutoRefreshedSessionId(null)
    setPendingPreviewRefresh(false)
    setPreviewEnabled(false)
  }, [sessionId])

  useEffect(() => {
    if (
      hasFirstStreamedEvent ||
      pendingPreviewRefresh ||
      (!payload && hasRouteSession)
    ) {
      setPreviewEnabled(true)
    }
  }, [hasFirstStreamedEvent, pendingPreviewRefresh, payload, hasRouteSession, sessionId])

  useEffect(() => {
    if (autoRefreshedSessionId === sessionId) return
    const hasImplementedEvent = messages.some(
      (m) =>
        m.node === 'coder' &&
        typeof m.text === 'string' &&
        m.text.toLowerCase().includes('implemented landing page'),
    )
    if (!hasImplementedEvent) return

    requestPreviewRefresh('coder implementation event')
    setAutoRefreshedSessionId(sessionId)
  }, [messages, autoRefreshedSessionId, sessionId, requestPreviewRefresh])

  return (
    <AuthGuard>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
           </Button>
           <div className="flex items-center gap-2">
             <h1 className="text-sm font-semibold text-foreground">
                {sessionId ? `Project ${sessionId.slice(0, 8)}` : "New Project"}
             </h1>
             <span className={`inline-flex h-2 w-2 rounded-full ${status === 'streaming' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
           </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleExport} disabled={!previewEnabled || isExporting}>
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
           </Button>
           <Button size="sm" onClick={() => router.push('/create')}>
              New
           </Button>
           <Button size="sm" className="bg-black text-white hover:bg-black/90" disabled>
              Deploy
           </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Chat Panel - Fixed 420px */}
        <div className="w-[420px] flex flex-col border-r border-border bg-card">
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
              }}
              onDoneSignal={handleFollowUpDone}
              onJobComplete={() => {
                requestPreviewRefresh('chat job completed')
              }}
            />
        </div>

        {/* Preview Panel - Flex 1 */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted relative">
            {/* Preview Toolbar */}
            <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setPreviewMode('desktop')}
                                    className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Monitor className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Desktop view</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setPreviewMode('mobile')}
                                    className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Smartphone className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Mobile view</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {previewMode === 'desktop' ? '100%' : '390px'}
                    </span>
                 </div>
            </div>

            {/* Preview Container */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-8">
                <div 
                    className={`bg-card rounded-lg shadow-sm border border-border overflow-hidden transition-all duration-300 ease-in-out ${
                        previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full max-w-[1200px]'
                    }`}
                >
                   <LivePreview
                      ref={livePreviewRef}
                      sessionId={sessionId}
                      enabled={previewEnabled}
                      refreshToken={previewRefresh}
                      onFirstReady={() => setPreviewReady(true)}
                    />
                </div>
            </div>

             {toolStatus?.shouldRender && (
              <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4">
                <div className="h-4 w-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                <span className="text-xs font-medium text-muted-foreground">
                  {toolStatus.text || 'Working...'}
                </span>
              </div>
            )}
        </div>
      </div>
      </div>
    </AuthGuard>
  )
}
