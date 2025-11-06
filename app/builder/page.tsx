"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useStreamSession } from '@/components/chat/useStreamSession'
import { ChatPane } from '@/components/chat/ChatPane'
import { PreviewPane } from '@/components/chat/PreviewPane'
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
  const [followUpRevision, setFollowUpRevision] = useState(0)

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

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <div className="flex-1 flex flex-row min-h-0">
        <div style={previewStyle} className="flex flex-col min-h-0 min-w-[33%] border-r border-(--color-border)">
          <PreviewPane
            status={status}
            refreshToken={`${status}-${messages.length}-${followUpRevision}`}
            toolStatus={toolStatus}
            deployedUrl={deployedUrl}
          />
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
            onChatProgress={() => {
              setFollowUpRevision((r) => r + 1)
            }}
          />
        </div>
      </div>
    </div>
  )
}
