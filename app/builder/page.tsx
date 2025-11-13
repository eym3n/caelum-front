"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useStreamSession } from '@/components/chat/useStreamSession'
import { ChatPane } from '@/components/chat/ChatPane'
import LivePreview from '@/components/chat/LivePreview'
import { ResizeHandle } from '@/components/chat/ResizeHandle'
import type { StreamMessage } from '@/components/chat/types'
import { usePayload } from '@/contexts/PayloadContext'

export default function BuilderPage() {
  const { messages, status, start, reset, sessionId, error } = useStreamSession()
  const router = useRouter()
  const { payload } = usePayload()
  const [ratio, setRatio] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('builder:ratio')
      if (stored) return Math.min(0.6667, Math.max(0.35, parseFloat(stored)))
    }
    return 0.65 // preview width ratio
  })
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false)
  const [followUpToolText, setFollowUpToolText] = useState<string | null>(null)
  // Manual refresh counter (no auto reloads)
  const [previewRefresh, setPreviewRefresh] = useState(0)

  useEffect(() => {
    window.localStorage.setItem('builder:ratio', ratio.toString())
  }, [ratio])

  useEffect(() => {
    if (status !== 'idle') return
    if (!payload) {
      console.warn('[builder] No payload available, redirecting to /create')
      router.push('/create')
      return
    }
    console.log('[builder] Using payload from context:', payload)
    start({ payload })
  }, [status, start, payload, router])

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

  const previewStyle: React.CSSProperties = { flexGrow: ratio, flexBasis: 0 }
  const chatStyle: React.CSSProperties = { flexGrow: 1 - ratio, flexBasis: 0 }

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

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <div className="flex-1 flex flex-row min-h-0">
        <div style={previewStyle} className="flex flex-col min-h-0 min-w-[33%] border-r border-(--color-border)">
          {/* Wrapper header to match previous PreviewPane styling */}
          <header className="flex h-14 items-center justify-between px-4 border-b border-(--color-border)">
            <h2 className="text-sm font-semibold tracking-tight">Live Preview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  console.log('[Builder] Refresh button clicked', { hasFirstStreamedEvent, currentRefresh: previewRefresh });
                  setPreviewRefresh(r => {
                    const next = r + 1;
                    console.log('[Builder] Refresh token incrementing', { from: r, to: next });
                    return next;
                  });
                }}
                disabled={!hasFirstStreamedEvent}
                className="text-xs rounded-md px-3 py-1.5 border border-(--color-border) hover:bg-(--color-card) disabled:opacity-40 disabled:cursor-not-allowed"
              >Refresh</button>
            </div>
          </header>
          <div className="relative flex-1 min-h-0">
            {/* Manual refresh only; no auto reload */}
            <LivePreview
              sessionId={sessionId}
              enabled={hasFirstStreamedEvent}
              refreshToken={previewRefresh}
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
        <ResizeHandle onResize={setRatio} />
        <div style={chatStyle} className="flex flex-col min-h-0 min-w-[33%]">
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
            // Removed onChatProgress to stop auto preview refresh
          />
        </div>
      </div>
    </div>
  )
}
