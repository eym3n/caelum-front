"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { StreamMessage } from './types'
import Image from 'next/image'
import { Bot } from 'lucide-react'

interface Props {
  messages: StreamMessage[]
  status: string
  onRestart: () => void
  sessionId: string
  error?: string
}

interface ProcessedMessage {
  text: string
  working: boolean
}

export function ChatPane({ messages, status, onRestart, sessionId, error }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeploySuccess(false)
    try {
      const response = await fetch('http://localhost:8080/v1/agent/deploy/vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
      })
      if (response.ok) {
        setDeploySuccess(true)
        setTimeout(() => setDeploySuccess(false), 2500)
      } else {
        console.error('Deploy failed', response.status, response.statusText)
      }
    } catch (e) {
      console.error('Deploy error', e)
    } finally {
      setIsDeploying(false)
    }
  }

  useEffect(() => {
    if (status === 'completed' && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, status])

  const processedMessages = useMemo<ProcessedMessage[]>(() => {
    let lastAgentMessage: { agent: string; text: string } | null = null
    let sawDone = false

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i]
      if (!m) continue
      if (m.node === 'user_brief' || m.node === 'intake_component') continue
      if (m.node?.includes('_tools')) continue
      const agentType = ['designer', 'coder', 'clarify'].find(a => m.node?.includes(a))
      if (!agentType) continue
      if (m.type === 'message') {
        lastAgentMessage = { agent: agentType, text: (m.text || '').trim() }
      } else if (m.type === 'done' && lastAgentMessage && lastAgentMessage.agent === agentType) {
        sawDone = true
      }
    }

    // While working (streaming or initializing) always show a bubble
    if (!sawDone) {
      if (status === 'initializing' || status === 'streaming') {
        return [{ text: 'Working...', working: true }]
      }
    }

    if (sawDone && lastAgentMessage) {
      return [{ text: lastAgentMessage.text || 'Done', working: false }]
    }

    // If status completed but no agent message, show nothing
    return []
  }, [messages, status])

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <header className="flex h-14 items-center justify-between px-4 border-b border-(--color-border)">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Build Session</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeploy}
            disabled={isDeploying || status !== 'completed'}
            className="text-xs rounded-md px-4 py-1.5 bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            {isDeploying ? (
              <>
                <div className="size-3 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                <span>Deploying...</span>
              </>
            ) : deploySuccess ? (
              <>
                <svg className="size-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Deployed!</span>
              </>
            ) : (
              <>
                <Image src="/vercel-icon.svg" alt="Vercel" width={14} height={14} />
                <span>Deploy to Vercel</span>
              </>
            )}
          </button>
          <button
            onClick={onRestart}
            className="text-xs rounded-md px-3 py-1.5 border border-(--color-border) hover:bg-(--color-card)"
          >
            Restart
          </button>
        </div>
      </header>
      <div
        className="flex-1 overflow-y-auto px-4 pb-4 pt-4 min-h-0 space-y-4"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Chat messages"
      >
        {error && (
          <div className="my-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            Error: {error}
          </div>
        )}
        {processedMessages.map((msg, i) => (
          <div key={`msg-${i}`} className="flex gap-3">
            <div className="shrink-0 mt-1">
              <div className="size-8 rounded-full bg-(--color-card) border border-(--color-border) flex items-center justify-center">
                <Bot className="size-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`inline-block rounded-2xl px-4 py-2 bg-(--color-card) border border-(--color-border) text-foreground ${msg.working ? 'animate-pulse-fast' : ''}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-(--color-border) p-3 bg-(--color-card) text-xs text-(--color-muted)">
        Follow-up chat coming soon.
      </div>
    </div>
  )
}
