"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import type { StreamMessage, BuilderState } from './types'
import { generateSessionId } from '@/lib/session'

interface StartOptions {
  payload: any // root object to send directly (now includes image URLs, not File objects)
  // files deprecated: initialization endpoint now expects URLs only
  endpoint?: string
}

function toList(value: unknown): string | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0).join(', ')
  }
  if (typeof value === 'string') {
    return value
  }
  return undefined
}

function buildUserBriefMessage(payload: any): string {
  const objective: string | undefined = payload?.campaign?.objective
  const product: string | undefined = payload?.campaign?.productName || payload?.campaign?.productServiceName
  const offer: string | undefined = payload?.campaign?.primaryOffer
  const audience: string | undefined = payload?.audience?.description || payload?.audience?.targetAudienceDescription
  const keywords: string | undefined = toList(payload?.audience?.personaKeywords || payload?.audience?.buyerPersonaKeywords)
  const uvp: string | undefined = payload?.audience?.uvp || payload?.audience?.uniqueValueProposition

  const lines: string[] = ["Here is the brief I just submitted:"]
  lines.push('')
  if (objective) lines.push(`- Objective: ${objective}`)
  if (product) lines.push(`- Product: ${product}`)
  if (offer) lines.push(`- Offer: ${offer}`)
  if (audience) lines.push(`- Audience: ${audience}`)
  if (keywords) lines.push(`- Persona signals: ${keywords}`)
  if (uvp) lines.push(`- UVP: ${uvp}`)

  if (lines.length === 2) {
    return "Here is the brief I just submitted. Let's build something great."
  }

  return lines.join('\n')
}

function buildComponentAckMessage(): string {
  return [
    'Intake component online.',
    'Brief cached and synced to the planning graph.',
    'Warming synthesis loop for first responses...'
  ].join('\n')
}

export function useStreamSession() {
  const [state, setState] = useState<BuilderState>(() => ({
    sessionId: generateSessionId(),
    messages: [],
    status: 'idle',
  }))
  const abortRef = useRef<AbortController | null>(null)
  const startedRef = useRef(false)

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    setState({ sessionId: generateSessionId(), messages: [], status: 'idle' })
    startedRef.current = false
  }, [])

  const start = useCallback(async ({ payload, endpoint = 'https://builder-agent-api-934682636966.europe-southwest1.run.app/v1/agent/init/stream' }: StartOptions) => {
    if (startedRef.current) return
    startedRef.current = true
    const sessionId = state.sessionId
    const userBriefMessage: StreamMessage = {
      type: 'message',
      node: 'user_brief',
      text: buildUserBriefMessage(payload),
    }
    const componentAckMessage: StreamMessage = {
      type: 'message',
      node: 'intake_component',
      text: buildComponentAckMessage(),
    }

    setState((s) => ({
      ...s,
      status: 'initializing',
      messages: [...s.messages, userBriefMessage, componentAckMessage],
    }))
    // Send JSON body directly (cloud-native, assets already URLs)
    const body = JSON.stringify({ payload })

    const controller = new AbortController()
    abortRef.current = controller

    try {
      // Debug: payload keys
      try {
        const parsed = JSON.parse(body)
        console.log('[stream] init payload keys', Object.keys(parsed.payload || {}))
      } catch {}
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-session-id': sessionId,
          'Content-Type': 'application/json'
        },
        body,
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }
      setState((s) => ({ ...s, status: 'streaming' }))
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream reader available')
      const decoder = new TextDecoder('utf-8')
      let buffered = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffered += decoder.decode(value, { stream: true })
        // Split on newlines and process complete lines
        const lines = buffered.split(/\r?\n/) // SSE style
        // Keep potential partial
        buffered = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          if (!trimmed.startsWith('data:')) continue
          const jsonPart = trimmed.slice(5).trim()
          try {
            const obj = JSON.parse(jsonPart) as any
            const msg: StreamMessage = {
              type: obj.type,
              node: obj.node,
              text: obj.text,
              raw: jsonPart,
              done: obj.type === 'done',
            }
            setState((s) => ({ ...s, messages: [...s.messages, msg] }))
            if (msg.done) {
              setState((s) => ({ ...s, status: 'completed' }))
              if (abortRef.current) abortRef.current.abort()
              return
            }
          } catch (err) {
            console.error('Parse error', err)
          }
        }
      }
      // Flush remainder
      if (buffered.trim().startsWith('data:')) {
        try {
          const jsonPart = buffered.trim().slice(5).trim()
          const obj = JSON.parse(jsonPart)
          const msg: StreamMessage = { type: obj.type, node: obj.node, text: obj.text, raw: jsonPart, done: obj.type === 'done' }
          setState((s) => ({ ...s, messages: [...s.messages, msg] }))
          if (msg.done) setState((s) => ({ ...s, status: 'completed' }))
        } catch {}
      }
      setState((s) => (s.status === 'completed' ? s : { ...s, status: 'completed' }))
    } catch (error: any) {
      if (controller.signal.aborted) return
      setState((s) => ({ ...s, status: 'error', error: error.message }))
    }
  }, [state.sessionId])

  return { ...state, start, reset }
}
