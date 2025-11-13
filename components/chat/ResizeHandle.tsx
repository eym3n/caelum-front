"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  onResize: (ratio: number) => void
}

export function ResizeHandle({ onResize }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    setIsDragging(true)
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
  }, [])
  const onGlobalPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return
    // Use the explicit container element for accurate bounds (row with preview/handle/chat)
    const container = ref.current?.closest('[data-resize-container]') as HTMLElement | null
    if (!container) return
    const bounds = container.getBoundingClientRect()
    // Account for CSS gap and handle width so ratio maps to the actual available track
    const cs = getComputedStyle(container)
    const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0
    const handleWidth = ref.current?.getBoundingClientRect().width || 0
    const available = Math.max(1, bounds.width - gap - handleWidth)
    const x = Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width)
    // Map pointer to preview track ignoring the handle thickness (assume handle sits centered in the gap)
    const xOnTrack = Math.min(Math.max(x - handleWidth * 0.5, 0), available)
    // Constrain preview max width to 2/3 (chat min width 1/3)
    const ratio = Math.min(0.6667, Math.max(0.35, xOnTrack / available))
    onResize(ratio)
  }, [onResize])
  const onGlobalPointerUp = useCallback(() => {
    dragging.current = false
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    window.addEventListener('pointermove', onGlobalPointerMove)
    window.addEventListener('pointerup', onGlobalPointerUp)
    return () => {
      window.removeEventListener('pointermove', onGlobalPointerMove)
      window.removeEventListener('pointerup', onGlobalPointerUp)
    }
  }, [isDragging, onGlobalPointerMove, onGlobalPointerUp])

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize preview and chat panels"
      onPointerDown={onPointerDown}
      className="relative flex w-4 cursor-col-resize select-none items-center justify-center group"
      style={{ touchAction: 'none' }}
    >
      <div className="h-10 w-1.5 rounded-full bg-[#2a2a2a] group-hover:bg-[#3a3a3a] transition-colors" />
    </div>
  )
}
