"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { StreamMessage } from './types'
import Image from 'next/image'
import { Bot } from 'lucide-react'
import Markdown from '../ui/markdown'

interface Props {
  messages: StreamMessage[]
  status: string
  onRestart: () => void
  sessionId: string
  error?: string
  onDeploySuccess?: (url: string) => void
}

// Deprecated: previous single-bubble processed message approach removed.

export function ChatPane({ messages, status, onRestart, sessionId, error, onDeploySuccess }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isChatStreaming, setIsChatStreaming] = useState(false)
  const [followUpMessages, setFollowUpMessages] = useState<StreamMessage[]>([]) // transitional; will be removed
  interface ConversationItem { id: string; role: 'user' | 'agent'; text: string; working?: boolean }
  const [conversation, setConversation] = useState<ConversationItem[]>([])

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
        const url = `${sessionId}.vercel.app`
        setDeploySuccess(true)
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
    if (status === 'streaming') {
      // Only surface coder messages; hide designer and clarify completely
      const lastCoder = messages
        .slice()
        .reverse()
        .find(m => m.type === 'message'
          && m.node
          && m.node.includes('coder'))
      if (lastCoder) {
        setConversation(prev => prev.map(b => b.id === 'agent-initial' ? { ...b, text: (lastCoder.text || '').trim() || 'Working...' } : b))
      }
      // Mark done only when coder done event appears
      if (messages.some(m => m.type === 'done' && m.node && m.node.includes('coder'))) {
        setConversation(prev => prev.map(b => b.id === 'agent-initial' ? { ...b, working: false } : b))
      }
    }
    if (status === 'completed') {
      setConversation(prev => prev.map(b => b.id === 'agent-initial' ? { ...b, working: false } : b))
    }
  }, [status, messages, conversation.length])
  // Include follow-up streaming state in dependencies so bubble updates
  // processedMessages deprecated; conversation array drives rendering.

  const sendFollowUp = async () => {
    const message = chatInput.trim()
    if (!message || isChatStreaming) return
  setIsChatStreaming(true)
  setFollowUpMessages([])
    setChatInput('')
  const userId = `user-${Date.now()}`
  setConversation(prev => [...prev, { id: userId, role: 'user', text: message }])
  const agentId = `agent-${Date.now()}`
  setConversation(prev => [...prev, { id: agentId, role: 'agent', text: 'Working...', working: true }])
    try {
      const res = await fetch('http://localhost:8080/v1/agent/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No chat stream reader')
      const decoder = new TextDecoder('utf-8')
      let buffered = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffered += decoder.decode(value, { stream: true })
        const lines = buffered.split(/\r?\n/)
        buffered = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue
            const jsonPart = trimmed.slice(5).trim()
            try {
              const obj = JSON.parse(jsonPart)
              const msg: StreamMessage = {
                type: obj.type,
                node: obj.node,
                text: obj.text,
                raw: jsonPart,
                done: obj.type === 'done',
              }
              if (msg.node && !msg.node.includes('coder')) {
                // Ignore any non-coder messages (designer, clarify, tools, etc.)
              } else {
                if (msg.type === 'message') {
                  setConversation(prev => prev.map(b => b.id === agentId ? { ...b, text: (msg.text || '').trim() || 'Working...' } : b))
                }
                if (msg.done) {
                  setConversation(prev => prev.map(b => b.id === agentId ? { ...b, working: false } : b))
                  setIsChatStreaming(false)
                }
              }
            } catch (e) {
              console.error('Chat parse error', e)
            }
        }
      }
      if (buffered.trim().startsWith('data:')) {
        try {
          const jsonPart = buffered.trim().slice(5).trim()
          const obj = JSON.parse(jsonPart)
          const msg: StreamMessage = { type: obj.type, node: obj.node, text: obj.text, raw: jsonPart, done: obj.type === 'done' }
          if (msg.node && !msg.node.includes('coder')) {
            // Skip non-coder buffered message
          } else {
            if (msg.type === 'message') {
              setConversation(prev => prev.map(b => b.id === agentId ? { ...b, text: (msg.text || '').trim() || 'Working...' } : b))
            }
            if (msg.done) {
              setConversation(prev => prev.map(b => b.id === agentId ? { ...b, working: false } : b))
            }
          }
        } catch {}
      }
      setIsChatStreaming(false)
    } catch (err) {
      console.error('Chat stream error', err)
      setIsChatStreaming(false)
    }
  }

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
        {conversation.map(item => (
          item.role === 'agent' ? (
            <div key={item.id} className="flex gap-3">
              <div className="shrink-0 mt-1">
                <div className="size-8 rounded-full bg-(--color-card) border border-(--color-border) flex items-center justify-center">
                  <Bot className="size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 border text-foreground whitespace-pre-wrap wrap-break-word bg-(--color-card) border-(--color-border) ${item.working ? 'animate-pulse-fast' : ''}`}>
                  <Markdown text={item.text} />
                </div>
              </div>
            </div>
          ) : (
            <div key={item.id} className="flex gap-3 justify-end">
              <div className="flex-1 min-w-0 flex justify-end">
                <div className="inline-block max-w-[80%] rounded-2xl px-4 py-2 border text-foreground whitespace-pre-wrap wrap-break-word bg-[#2f2f2f] border-(--color-border)">
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
            className="flex-1 resize-none rounded-md bg-background border border-(--color-border) px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-border) max-h-40 leading-relaxed wrap-break-word"
            rows={1}
          />
          <button
            onClick={sendFollowUp}
            disabled={!chatInput.trim()}
            className="h-10 px-5 rounded-md bg-white text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >Send</button>
        </div>
        <p className="mt-2 text-[11px] text-(--color-muted)">Enter to send, Shift+Enter for newline.</p>
      </div>
    </div>
  )
}
