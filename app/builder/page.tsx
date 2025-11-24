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
import { Smartphone, Maximize2, Minimize2, Moon, Sun, ArrowLeft, Download, Monitor, LayoutTemplate, Info, FileText, FileCode2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE_URL } from '@/lib/config'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function BuilderPage() {
  const params = useParams<{ sessionId?: string }>()
  const routeSessionId = params?.sessionId as string | undefined
  const { messages, status, start, sessionId, error, landingPageId } = useStreamSession(routeSessionId)
  const router = useRouter()
  const { payload } = usePayload()
  const { theme, setTheme } = useTheme()
  const { authorizedFetch } = useAuth()
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
  const [lpInfo, setLpInfo] = useState<any | null>(null)
  const [lpSections, setLpSections] = useState<any[]>([])
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)
  const [rationalePdfUrl, setRationalePdfUrl] = useState<string | null>(null)
  // Fallback ID discovered via session endpoint when reloading deep link
  const [lpIdFromSession, setLpIdFromSession] = useState<string | null>(null)
  const effectiveLandingId = useMemo(
    () => (landingPageId ? landingPageId : lpIdFromSession ? lpIdFromSession : null),
    [landingPageId, lpIdFromSession],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!routeSessionId) {
      router.replace('/create')
    }
  }, [routeSessionId, router])

  // Start polling landing page info/sections using landing_page_id when available
  useEffect(() => {
    if (!effectiveLandingId) return
    let active = true
    let timer: number | null = null
    const fetchOnce = async () => {
      if (!active) return
      try {
        if (!infoLoading) setInfoLoading(true)
        setInfoError(null)
        const res = await authorizedFetch(`${API_BASE_URL}/v1/landing-pages/${effectiveLandingId}`, {
          method: 'GET',
        })
        if (!res.ok) {
          // Suppress 404s during early creation; surface other codes
          if (res.status !== 404) {
            setInfoError(`Failed to fetch landing page: ${res.status}`)
          }
          return
        }
        const data = await res.json()
        if (!active) return
        setLpInfo(data)
        setLpSections(Array.isArray(data?.sections) ? data.sections : [])
        setRationalePdfUrl(data?.design_blueprint_pdf_url || null)
        // If page is fully generated or deployed, stop polling
        const statusVal = String(data?.status || '').toLowerCase()
        const isTerminal =
          statusVal === 'generated' ||
          statusVal === 'deployed' ||
          statusVal === 'published' ||
          statusVal === 'live'
        if (isTerminal) {
          active = false
          if (timer) window.clearInterval(timer)
        }
      } catch (e: any) {
        if (!active) return
        setInfoError(e?.message || 'Unable to load landing page')
      } finally {
        if (!active) return
        setInfoLoading(false)
      }
    }
    void fetchOnce()
    timer = window.setInterval(fetchOnce, 3000)
    return () => {
      active = false
      if (timer) window.clearInterval(timer)
    }
  }, [effectiveLandingId, authorizedFetch])

  // If user loads builder via URL with session, discover landing_page_id by session and poll until found
  useEffect(() => {
    if (effectiveLandingId) return // already have the ID; skip session lookup
    if (!routeSessionId) return
    let active = true
    let timer: number | null = null
    const fetchBySession = async () => {
      if (!active) return
      try {
        if (!infoLoading) setInfoLoading(true)
        setInfoError(null)
        const res = await authorizedFetch(`${API_BASE_URL}/v1/landing-pages/session/${routeSessionId}`, {
          method: 'GET',
        })
        if (!res.ok) {
          if (res.status !== 404) {
            setInfoError(`Failed to fetch landing page: ${res.status}`)
          }
          return
        }
        const data = await res.json()
        if (!active) return
        setLpInfo(data)
        setLpSections(Array.isArray(data?.sections) ? data.sections : [])
        setRationalePdfUrl(data?.design_blueprint_pdf_url || null)
        const foundId: string | undefined =
          data?.id || data?.landing_page_id || data?.landingPageId
        if (foundId) {
          setLpIdFromSession(foundId)
        }
        // If page is fully generated or deployed, stop session polling as well
        const statusVal = String(data?.status || '').toLowerCase()
        const isTerminal =
          statusVal === 'generated' ||
          statusVal === 'deployed' ||
          statusVal === 'published' ||
          statusVal === 'live'
        if (isTerminal) {
          active = false
          if (timer) window.clearInterval(timer)
        }
      } catch (e: any) {
        if (!active) return
        setInfoError(e?.message || 'Unable to load landing page')
      } finally {
        if (!active) return
        setInfoLoading(false)
      }
    }
    void fetchBySession()
    timer = window.setInterval(fetchBySession, 3000)
    return () => {
      active = false
      if (timer) window.clearInterval(timer)
    }
  }, [effectiveLandingId, routeSessionId, authorizedFetch, infoLoading])

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

  // Minimal ZIP (store only, no compression) for exporting selected files
  const crcTableRef = React.useRef<Uint32Array | null>(null)
  const getCrcTable = () => {
    if (crcTableRef.current) return crcTableRef.current
    const table = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
      }
      table[n] = c >>> 0
    }
    crcTableRef.current = table
    return table
  }
  const crc32 = (buf: Uint8Array) => {
    const table = getCrcTable()
    let c = 0 ^ -1
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff]
    }
    return (c ^ -1) >>> 0
  }
  const writeUint16 = (arr: number[], v: number) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff)
  }
  const writeUint32 = (arr: number[], v: number) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff)
  }
  const encoder = new TextEncoder()
  const buildZip = (files: { name: string; data: Uint8Array }[]) => {
    const fileRecords: {
      nameBytes: Uint8Array
      crc: number
      size: number
      offset: number
      localHeader: number[]
      data: Uint8Array
    }[] = []
    let offset = 0
    const out: number[] = []
    for (const f of files) {
      const nameBytes = encoder.encode(f.name)
      const crc = crc32(f.data)
      const size = f.data.length
      const local: number[] = []
      // Local file header
      writeUint32(local, 0x04034b50)
      writeUint16(local, 20) // version needed
      writeUint16(local, 0) // flags
      writeUint16(local, 0) // method store
      writeUint16(local, 0) // time
      writeUint16(local, 0) // date
      writeUint32(local, crc)
      writeUint32(local, size)
      writeUint32(local, size)
      writeUint16(local, nameBytes.length)
      writeUint16(local, 0) // extra length
      const record = {
        nameBytes,
        crc,
        size,
        offset,
        localHeader: local,
        data: f.data,
      }
      fileRecords.push(record)
      // append local header + name + data
      out.push(...local, ...Array.from(nameBytes), ...Array.from(f.data))
      offset = out.length
    }
    const centralDirStart = out.length
    // Central directory
    for (const r of fileRecords) {
      const c: number[] = []
      writeUint32(c, 0x02014b50)
      writeUint16(c, 20) // version made by
      writeUint16(c, 20) // version needed
      writeUint16(c, 0) // flags
      writeUint16(c, 0) // method
      writeUint16(c, 0) // time
      writeUint16(c, 0) // date
      writeUint32(c, r.crc)
      writeUint32(c, r.size)
      writeUint32(c, r.size)
      writeUint16(c, r.nameBytes.length)
      writeUint16(c, 0) // extra
      writeUint16(c, 0) // comment
      writeUint16(c, 0) // disk number
      writeUint16(c, 0) // internal attrs
      writeUint32(c, 0) // external attrs
      writeUint32(c, r.offset)
      out.push(...c, ...Array.from(r.nameBytes))
    }
    const centralDirEnd = out.length
    const centralSize = centralDirEnd - centralDirStart
    // End of central dir
    const e: number[] = []
    writeUint32(e, 0x06054b50)
    writeUint16(e, 0) // disk
    writeUint16(e, 0) // start disk
    writeUint16(e, fileRecords.length)
    writeUint16(e, fileRecords.length)
    writeUint32(e, centralSize)
    writeUint32(e, centralDirStart)
    writeUint16(e, 0) // comment length
    out.push(...e)
    return new Uint8Array(out)
  }

  const handleExport = React.useCallback(async () => {
    try {
      setIsExporting(true)
      // Fetch file tree via API
      const res = await authorizedFetch(`${API_BASE_URL}/v1/files/get-files`, {
        method: 'GET',
        headers: { 'x-session-id': sessionId },
      })
      if (!res.ok) {
        throw new Error(`get-files failed: ${res.status}`)
      }
      const json = await res.json()
      const filesTree = json?.files
      if (!filesTree || typeof filesTree !== 'object') {
        throw new Error('Invalid files response')
      }
      // descend into src/components
      const src = filesTree['src']
      const components = src?.['components']
      if (!components) {
        window.alert('No src/components found in project yet.')
        return
      }
      // flatten object to list of {name, data} with base 'src/components'
      const out: { name: string; data: Uint8Array }[] = []
      const walk = (node: any, prefix: string) => {
        for (const [k, v] of Object.entries(node)) {
          const p = `${prefix}/${k}`
          if (typeof v === 'string') {
            out.push({ name: p.replace(/^\//, ''), data: encoder.encode(v as string) })
          } else if (v && typeof v === 'object') {
            walk(v, p)
          }
        }
      }
      walk(components, 'src/components')
      if (out.length === 0) {
        window.alert('No files under src/components to export.')
        return
      }
      const zipBytes = buildZip(out)
      const blob = new Blob([zipBytes], { type: 'application/zip' })
      const filenameBase = sessionId || routeSessionId || 'landing-page'
      const filename = `landing-page-sections-${filenameBase}.zip`
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      console.log('[builder] Export sections completed', { filename, count: out.length })
    } catch (err) {
      console.error('[builder] Sections export failed', err)
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Unable to export sections right now. Please try again.')
      }
    } finally {
      setIsExporting(false)
    }
  }, [authorizedFetch, API_BASE_URL, sessionId, routeSessionId])

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
        {/* Left rail: Tabs (Chat / Info / Sections) - Fixed 420px */}
        <div className="w-[420px] flex flex-col border-r border-border bg-card">
          {/* Tabs host */}
          <TabHost
            chat={
              <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] flex flex-col">
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
            }
            info={
              <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] p-3 overflow-auto">
                {infoLoading ? (
                  <p className="text-sm text-muted-foreground">Loading landing page…</p>
                ) : infoError ? (
                  <p className="text-sm text-destructive">{infoError}</p>
                ) : lpInfo ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground">Session</div>
                      <div className="text-sm font-medium text-foreground break-all">{lpInfo.session_id || sessionId}</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Status:</span> <span className="capitalize">{lpInfo.status || status}</span></div>
                        <div className="truncate"><span className="text-muted-foreground">Deployment:</span> {lpInfo.deployment_url ? <a className="text-primary hover:underline" href={lpInfo.deployment_url} target="_blank" rel="noreferrer">Open</a> : <span className="text-muted-foreground">—</span>}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-sm font-semibold text-foreground mb-2">Campaign</div>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Objective:</span> {lpInfo?.business_data?.campaign?.objective || '—'}</div>
                        <div><span className="text-muted-foreground">Product:</span> {lpInfo?.business_data?.campaign?.productName || '—'}</div>
                        <div className="truncate"><span className="text-muted-foreground">Offer:</span> {lpInfo?.business_data?.campaign?.primaryOffer || '—'}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-sm font-semibold text-foreground mb-2">Audience</div>
                      <div className="text-sm text-foreground/90">{lpInfo?.business_data?.audience?.description || '—'}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                )}
              </div>
            }
            sections={
              <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] p-3 overflow-auto">
                {lpSections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sections available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {lpSections.map((sec) => {
                      const isCode = /\.(tsx|jsx|ts|js|mdx?)$/i.test(String(sec?.filename || ''))
                      const baseName = String(sec?.filename || '').split('/').pop()
                      return (
                        <div key={sec.id || sec.filename} className="rounded-lg border border-border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {isCode ? <FileCode2 className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                                <div className="text-sm font-medium text-foreground truncate">{sec.name || baseName || 'Section'}</div>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground break-all">{sec.filename}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => {
                                const content = sec?.file_content ?? ''
                                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = baseName || 'section.tsx'
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                setTimeout(() => URL.revokeObjectURL(url), 1000)
                              }}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            }
            rationale={
              <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] overflow-auto">
                {!rationalePdfUrl ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No rationale PDF yet.
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="text-sm text-muted-foreground mb-3">
                        Download the design rationale PDF generated for this landing page.
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            const res = await fetch(rationalePdfUrl as string)
                            const blob = await res.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'design-rationale.pdf'
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            setTimeout(() => URL.revokeObjectURL(url), 1000)
                          } catch {
                            window.open(rationalePdfUrl as string, '_blank')
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Rationale PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            }
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

            {/* Preview warning banner */}
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-muted-foreground text-xs flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Images might not be displayed on the live preview, deploy to see results</span>
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

function TabHost(props: { chat: React.ReactNode; info: React.ReactNode; sections: React.ReactNode; rationale?: React.ReactNode }) {
  const [tab, setTab] = React.useState<'chat' | 'info' | 'sections' | 'rationale'>('chat')
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <div className="inline-flex h-9 items-center gap-1 rounded-md bg-muted/50 p-1 text-muted-foreground">
          {(['chat','info','sections','rationale'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={[
                'px-3 py-1.5 text-sm rounded-sm transition-colors',
                tab === key ? 'bg-background text-foreground shadow' : 'hover:text-foreground'
              ].join(' ')}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {tab === 'chat' ? props.chat : tab === 'info' ? props.info : tab === 'sections' ? props.sections : props.rationale ?? null}
      </div>
    </div>
  )
}
