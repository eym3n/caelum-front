"use client"
import React, { useEffect, useMemo, useRef } from 'react'
import { MessageItem } from './MessageItem'
import type { StreamMessage } from './types'

interface Props {
  messages: StreamMessage[]
  status: string
  onRestart: () => void
  sessionId: string
  error?: string
}

export function ChatPane({ messages, status, onRestart, sessionId, error }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const isVisibleMessage = (m: StreamMessage | undefined) => {
    if (!m) return false
    if (m.type === 'done') return false
    if (m.node?.includes('_tools')) return false
    return true
  }

  const visibleMessages = useMemo(() => messages.filter(isVisibleMessage), [messages])

  const toolStatus = useMemo(() => {
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
  }, [messages, status])

  const [firstVisible, ...restVisible] = visibleMessages
  const [secondVisible, ...remainingVisible] = restVisible

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <header className="flex h-12 items-center justify-between px-4 border-b border-(--color-border)">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Build Session</h2>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{sessionId}</span>
        </div>
        <button
          onClick={onRestart}
          className="text-xs rounded-md px-2 py-1 border border-(--color-border) hover:bg-(--color-card)"
        >
          Restart
        </button>
      </header>
      <div
        className="flex-1 overflow-y-auto px-4 pb-4 pt-4 min-h-0"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Streaming build messages"
      >
        {error && (
          <div className="my-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            Error: {error}
          </div>
        )}
        {firstVisible && <MessageItem key="first-message" msg={firstVisible} />}
        {secondVisible && <MessageItem key="second-message" msg={secondVisible} />}
        {remainingVisible.map((m, i) => (
          <MessageItem key={`msg-${i + 2}`} msg={m} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-(--color-border) p-3 bg-(--color-card) text-xs text-(--color-muted)">
        Follow-up chat coming soon.
      </div>
    </div>
  )
}
