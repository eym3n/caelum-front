"use client"
import React, { useCallback, useRef } from 'react'

interface Props {
  onResize: (ratio: number) => void
}

export function ResizeHandle({ onResize }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const container = ref.current?.parentElement
    if (!container) return
    const bounds = container.getBoundingClientRect()
    const x = e.clientX - bounds.left
  // Constrain preview max width to 2/3 (chat min width 1/3)
  const ratio = Math.min(0.6667, Math.max(0.35, x / bounds.width))
    onResize(ratio)
  }, [onResize])
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize preview and chat panels"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative flex w-4 cursor-col-resize select-none items-center justify-center group"
    >
      <div className="h-10 w-1.5 rounded-full bg-[#2a2a2a] group-hover:bg-[#3a3a3a] transition-colors" />
    </div>
  )
}
