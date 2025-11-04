"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStreamSession } from '@/components/chat/useStreamSession'
import { ChatPane } from '@/components/chat/ChatPane'
import { PreviewPane } from '@/components/chat/PreviewPane'
import { ResizeHandle } from '@/components/chat/ResizeHandle'

// Example payload matching earlier schema (simplified)
const examplePayload = {
  campaign: {
    objective: 'Drive qualified free trial sign-ups for the core deployment platform',
    productName: 'DeployPro',
    primaryOffer: '14-day enterprise trial with guided onboarding',
  },
  audience: {
    description: 'Senior DevOps engineers evaluating automation platforms',
    personaKeywords: ['scaling', 'automation', 'governance', 'observability'],
    uvp: 'Accelerate secure multi-region deployments with policy-driven workflows',
  },
}

export default function BuilderPage() {
  const { messages, status, start, reset, sessionId, error } = useStreamSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const overridePayload = useMemo(() => {
    const raw = searchParams.get('payload')
    if (!raw) return null
    // Attempt decode twice in case of double encoding
    try {
      const first = decodeURIComponent(raw)
      try {
        return JSON.parse(first)
      } catch {
        // maybe raw was already decoded
        return JSON.parse(raw)
      }
    } catch (e) {
      console.warn('Failed to parse payload param', e)
      return null
    }
  }, [searchParams])
  const [ratio, setRatio] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('builder:ratio')
      if (stored) return parseFloat(stored)
    }
    return 0.65 // preview width ratio
  })

  useEffect(() => {
    window.localStorage.setItem('builder:ratio', ratio.toString())
  }, [ratio])

  useEffect(() => {
    if (status !== 'idle') return
    const hasParam = !!searchParams.get('payload')
    const payloadToSend = hasParam ? (overridePayload || examplePayload) : examplePayload
    console.log('[builder] starting stream with', hasParam ? 'overridePayload' : 'examplePayload', payloadToSend)
    start({ payload: payloadToSend })
  }, [status, start, overridePayload, searchParams])

  const previewStyle: React.CSSProperties = { flexGrow: ratio, flexBasis: 0 }
  const chatStyle: React.CSSProperties = { flexGrow: 1 - ratio, flexBasis: 0 }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <div className="flex-1 flex flex-row min-h-0">
        <div style={previewStyle} className="flex flex-col min-h-0 min-w-0 border-r border-(--color-border)">
          <PreviewPane status={status} refreshToken={`${status}-${messages.length}`} />
        </div>
        <ResizeHandle onResize={setRatio} />
        <div style={chatStyle} className="flex flex-col min-h-0 min-w-0">
          <ChatPane
            messages={messages}
            status={status}
            onRestart={() => {
              reset()
              router.push('/create')
            }}
            sessionId={sessionId}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
