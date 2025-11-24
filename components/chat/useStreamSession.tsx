"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import type { StreamMessage, BuilderState } from './types'
import { generateSessionId } from '@/lib/session'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE_URL } from '@/lib/config'

interface StartOptions {
  payload: any // root object to send directly (now includes image URLs, not File objects)
  // files deprecated: initialization endpoint now expects URLs only
  endpoint?: string
  onJobComplete?: () => void
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
    'Booting up...',
  ].join('\n')
}

export function useStreamSession(externalSessionId?: string) {
  const { authorizedFetch } = useAuth()
  const [state, setState] = useState<BuilderState>(() => ({
    sessionId: externalSessionId || generateSessionId(),
    messages: [],
    status: 'idle',
  }))
  const abortRef = useRef<AbortController | null>(null)
  const startedRef = useRef(false)

  // Keep internal sessionId in sync with provided one (e.g., from route /builder/[sessionId])
  useEffect(() => {
    if (!externalSessionId) return
    setState((prev) => {
      if (prev.sessionId === externalSessionId) return prev
      return {
        ...prev,
        sessionId: externalSessionId,
        messages: [],
        status: 'idle',
      }
    })
    startedRef.current = false
  }, [externalSessionId])

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    setState((prev) => ({
      sessionId: externalSessionId || generateSessionId(),
      messages: [],
      status: 'idle',
      error: undefined,
    }))
    startedRef.current = false
  }, [externalSessionId])

  const start = useCallback(
    async ({ payload, endpoint = `${API_BASE_URL}/v1/agent/init`, onJobComplete }: StartOptions) => {
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

      const controller = new AbortController()
      abortRef.current = controller

      try {
        // Send JSON body directly (cloud-native, assets already URLs)
        const body = JSON.stringify({ session_id: sessionId, payload })

        const res = await authorizedFetch(endpoint, {
          method: 'POST',
          headers: {
            'x-session-id': sessionId,
            'Content-Type': 'application/json',
          },
          body,
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`Init request failed: ${res.status}`)
        }

        const initJson = (await res.json()) as { job_id?: string; landing_page_id?: string; session_id?: string }
        const jobId = initJson?.job_id
        if (!jobId) {
          throw new Error('Missing job_id in init response')
        }

        setState((s) => ({
          ...s,
          status: 'streaming',
          landingPageId: initJson?.landing_page_id || s.landingPageId,
        }))

        const seenEventIds = new Set<string>()

        const pollJob = async () => {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            if (controller.signal.aborted) return

            try {
              const jobRes = await authorizedFetch(`${API_BASE_URL}/v1/jobs/${jobId}`, {
                method: 'GET',
                headers: {
                  'x-session-id': sessionId,
                },
                signal: controller.signal,
              })

              if (!jobRes.ok) {
                throw new Error(`Job poll failed: ${jobRes.status}`)
              }

              const payload = (await jobRes.json()) as any
              const job = payload?.job
              const events = (job?.events ?? []) as any[]

              setState((prev) => {
                const nextMessages = [...prev.messages]

                for (const event of events) {
                  if (!event?.id || seenEventIds.has(event.id)) continue
                  seenEventIds.add(event.id)

                  const msg: StreamMessage = {
                    type: event.event_type || 'message',
                    node: event.node,
                    text: event.message,
                    raw: JSON.stringify(event),
                  }

                  nextMessages.push(msg)
                }

                let nextStatus: BuilderState['status'] = prev.status
                let nextError = prev.error

                if (job?.status === 'completed') {
                  nextStatus = 'completed'
                } else if (job?.status === 'failed' || job?.status === 'cancelled') {
                  nextStatus = 'error'
                  nextError = job?.error_message || 'Job failed'
                } else if (job?.status === 'pending' || job?.status === 'running') {
                  nextStatus = 'streaming'
                }

                return {
                  ...prev,
                  messages: nextMessages,
                  status: nextStatus,
                  error: nextError,
                }
              })

              if (job && ['completed', 'failed', 'cancelled'].includes(job.status)) {
                // Refresh preview when init job completes
                if (job.status === 'completed' && onJobComplete) {
                  console.log('[useStreamSession] Init job completed, triggering preview refresh')
                  onJobComplete()
                }
                controller.abort()
                abortRef.current = null
                return
              }
            } catch (err: any) {
              if (controller.signal.aborted) return
              console.error('[init] Job poll error', err)
              setState((s) => ({
                ...s,
                status: 'error',
                error: err?.message || 'Job poll failed',
              }))
              return
            }

            await new Promise((resolve) => setTimeout(resolve, 3000))
          }
        }

        void pollJob()
      } catch (error: any) {
        if (controller.signal.aborted) return
        setState((s) => ({ ...s, status: 'error', error: error.message || 'Init failed' }))
      }
    },
    [authorizedFetch, state.sessionId],
  )

  return { ...state, start, reset }
}
