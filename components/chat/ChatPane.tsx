"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { StreamMessage } from './types'
import Image from 'next/image'
import Markdown from '../ui/markdown'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE_URL } from '@/lib/config'

// Fast typewriter for the latest agent message.
// Defined at module scope so it doesn't remount on parent re-renders.
function TypewriterText({ text, active }: { text: string; active: boolean }) {
  const [visible, setVisible] = useState<number>(active ? 0 : (text?.length || 0))
  const textRef = useRef(text)
  const activeRef = useRef(active)

  useEffect(() => {
    textRef.current = text
  }, [text])
  useEffect(() => {
    activeRef.current = active
    if (!active) setVisible(text.length)
  }, [active, text.length])

  useEffect(() => {
    if (!activeRef.current) return
    let timer: number | null = null
    const tick = () => {
      setVisible((v) => {
        const target = textRef.current?.length ?? 0
        if (v >= target) return target
        const increment = Math.max(3, Math.ceil(target / 30))
        const next = Math.min(target, v + increment)
        return next
      })
      timer = window.setTimeout(tick, 12) as unknown as number
    }
    timer = window.setTimeout(tick, 12) as unknown as number
    return () => {
      if (timer) window.clearTimeout(timer as unknown as number)
    }
  }, [text])

  const renderText = active ? (text?.slice(0, visible) ?? '') : (text ?? '')
  return <Markdown text={renderText} />
}

interface Props {
  messages: StreamMessage[]
  status: string
  onRestart: () => void
  sessionId: string
  error?: string
  onDeploySuccess?: (url: string) => void
  onChatStreamState?: (active: boolean) => void
  onToolMessage?: (text: string) => void
  onChatProgress?: () => void
  onDoneSignal?: () => void
}

// Deprecated: previous single-bubble processed message approach removed.

export function ChatPane({ messages, status, onRestart, sessionId, error, onDeploySuccess, onChatStreamState, onToolMessage, onChatProgress, onDoneSignal }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [isChatStreaming, setIsChatStreaming] = useState(false)
  const [followUpMessages, setFollowUpMessages] = useState<StreamMessage[]>([]) // transitional; will be removed
  interface ConversationItem { id: string; role: 'user' | 'agent'; text: string; working?: boolean }
  const [conversation, setConversation] = useState<ConversationItem[]>([])
  const prevConversationLenRef = useRef(0)
  const { authorizedFetch } = useAuth()

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeploySuccess(false)
    try {
      const response = await authorizedFetch(`${API_BASE_URL}/v1/agent/deploy/vercel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
      })
      if (response.ok) {
        const url = `${sessionId}.vercel.app`
        setDeploySuccess(true)
        setDeploymentUrl(url)
        if (onDeploySuccess) onDeploySuccess(url)
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

  // Initial session streaming: maintain one agent working bubble, then finalize
  useEffect(() => {
    if ((status === 'initializing' || status === 'streaming') && conversation.length === 0) {
      setConversation([{ id: 'agent-initial', role: 'agent', text: 'Working...', working: true }])
    }
    if (status === 'initializing' || status === 'streaming') {
      const latest = messages
        .slice()
        .reverse()
        .find((m) => m.text && m.text.trim().length > 0)

      if (latest) {
        const progressText = latest.text?.trim() || 'Working...'
        setConversation((prev) =>
          prev.map((b) =>
            b.id === 'agent-initial' ? { ...b, text: progressText } : b,
          ),
        )
      }
    }
    if (status === 'completed') {
      const latest = messages
        .slice()
        .reverse()
        .find((m) => m.text && m.text.trim().length > 0)

      const finalText = latest?.text?.trim() || 'Working...'
      setConversation((prev) =>
        prev.map((b) =>
          b.id === 'agent-initial'
            ? { ...b, text: finalText, working: false }
            : b,
        ),
      )
    }
  }, [status, messages, conversation.length])
  // Include follow-up streaming state in dependencies so bubble updates
  // processedMessages deprecated; conversation array drives rendering.
  // (No-op here; TypewriterText moved to module scope to avoid remount during parent updates.)

  // Auto-scroll when a new message is appended (user or agent)
  useEffect(() => {
    const prev = prevConversationLenRef.current
    const curr = conversation.length
    if (curr > prev && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    prevConversationLenRef.current = curr
  }, [conversation.length])

  // Keep pinned to bottom while streaming updates modify the latest bubble
  useEffect(() => {
    if (!bottomRef.current) return
    // Use instant scroll during streaming to avoid queuing many smooth animations
    bottomRef.current.scrollIntoView({ behavior: isChatStreaming ? 'auto' : 'smooth', block: 'end' })
  }, [conversation, isChatStreaming])

  useEffect(() => {
    setDeploymentUrl(null)
    setDeploySuccess(false)
  }, [sessionId])

  const sendFollowUp = async () => {
    const message = chatInput.trim()
    if (!message || isChatStreaming) return

    console.log('[chat] sending follow-up', { sessionId, message })

    setIsChatStreaming(true)
    if (onChatStreamState) onChatStreamState(true)
    setFollowUpMessages([])
    setChatInput('')

    const userId = `user-${Date.now()}`
    setConversation((prev) => [...prev, { id: userId, role: 'user', text: message }])
    const agentId = `agent-${Date.now()}`
    setConversation((prev) => [...prev, { id: agentId, role: 'agent', text: 'Working...', working: true }])

    let doneNotified = false
    const notifyDone = () => {
      if (doneNotified) return
      doneNotified = true
      if (onDoneSignal) onDoneSignal()
    }

    try {
      const res = await authorizedFetch(`${API_BASE_URL}/v1/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)

      const { job_id: jobId } = (await res.json()) as { job_id?: string }
      if (!jobId) {
        throw new Error('Missing job_id in chat response')
      }

      console.log('[chat] received chat job id', jobId)

      const seenEventIds = new Set<string>()

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          console.log('[chat] polling job', jobId)
          const jobRes = await authorizedFetch(`${API_BASE_URL}/v1/jobs/${jobId}`, {
            method: 'GET',
            headers: {
              'x-session-id': sessionId,
            },
          })

          if (!jobRes.ok) {
            throw new Error(`Job poll failed: ${jobRes.status}`)
          }

          const payload = (await jobRes.json()) as any
          const job = payload?.job
          const events = (job?.events ?? []) as any[]

          for (const event of events) {
            if (!event?.id || seenEventIds.has(event.id)) continue
            seenEventIds.add(event.id)

            const node: string = event.node || ''
            const text: string = event.message || 'Working...'

            if (node.includes('_tools')) {
              if (onToolMessage) onToolMessage(text)
              if (onChatProgress) onChatProgress()
            } else {
              const displayText = text.trim() || 'Working...'
              setConversation((prev) =>
                prev.map((b) =>
                  b.id === agentId ? { ...b, text: displayText } : b,
                ),
              )
            }
          }

          if (job && ['completed', 'failed', 'cancelled'].includes(job.status)) {
            setConversation((prev) =>
              prev.map((b) =>
                b.id === agentId ? { ...b, working: false } : b,
              ),
            )
            setIsChatStreaming(false)
            if (onChatStreamState) onChatStreamState(false)
            notifyDone()
            break
          }
        } catch (err) {
          console.error('Chat job poll error', err)
          setIsChatStreaming(false)
          if (onChatStreamState) onChatStreamState(false)
          break
        }

        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    } catch (err) {
      console.error('Chat job error', err)
      setIsChatStreaming(false)
      if (onChatStreamState) onChatStreamState(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <header className="flex h-12 items-center justify-between px-4 border-b border-(--color-border) bg-[linear-gradient(180deg,rgba(114,105,248,0.06),transparent)]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Build Session</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeploy}
            className="text-xs rounded-md px-4 py-1.5 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            {isDeploying ? (
              <>
                <div className="size-3 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
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
        </div>
      </header>
      <div
        className="flex-1 overflow-y-auto px-4 pb-4 pt-4 min-h-0 space-y-4"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Chat messages"
      >
        {deploymentUrl && (
          <div className="sticky top-0 z-20 -mx-4 px-4 pt-0 pb-3 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-(--color-border) bg-(--color-card) px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Image src="/vercel-icon.svg" alt="Vercel" width={14} height={14} />
                <span>Live deployment</span>
              </div>
              <a
                href={`https://${deploymentUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 truncate text-xs font-semibold text-primary hover:underline"
              >
                https://{deploymentUrl}
              </a>
            </div>
          </div>
        )}
        {error && (
          <div className="my-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            Error: {error}
          </div>
        )}
        {conversation.map(item => (
          item.role === 'agent' ? (
            <div key={item.id} className="flex gap-3">
              <div className="shrink-0 mt-1">
                <div className="size-8 rounded-full border border-(--color-border) overflow-hidden bg-background">
                  <Image src="/logo.svg" alt="caelum.ai" width={32} height={32} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 border text-foreground whitespace-pre-wrap wrap-break-word bg-(--color-card) border-(--color-border) shadow-sm ${item.working ? 'animate-pulse-fast' : ''}`}>
                  <TypewriterText
                    text={item.text}
                    active={conversation.findLastIndex(c => c.role === 'agent') === conversation.indexOf(item)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div key={item.id} className="flex gap-3 justify-end">
              <div className="flex-1 min-w-0 flex justify-end">
                <div className="inline-block max-w-[80%] rounded-2xl px-4 py-2 border text-primary-foreground whitespace-pre-wrap wrap-break-word bg-primary border-transparent shadow-sm">
                  <Markdown text={item.text} />
                </div>
              </div>
            </div>
          )
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-(--color-border) p-3 bg-(--color-card)">
        <div className="flex items-end gap-2">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendFollowUp()
              }
            }}
            placeholder="Send a follow-up prompt..."
            className="flex-1 resize-none rounded-md bg-background border border-(--color-border) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ring)] max-h-40 leading-relaxed wrap-break-word"
            rows={1}
          />
          <button
            onClick={sendFollowUp}
            disabled={!chatInput.trim()}
            className="h-10 px-5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >Send</button>
        </div>
        <p className="mt-2 text-[11px] text-(--color-muted)">Enter to send, Shift+Enter for newline.</p>
      </div>
    </div>
  )
}
