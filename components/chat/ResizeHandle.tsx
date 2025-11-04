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
    const ratio = Math.min(0.85, Math.max(0.35, x / bounds.width)) // constrain
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
      className="relative flex w-3 cursor-col-resize select-none items-center justify-center"
    >
      <div className="h-full w-px bg-(--color-border)" />
    </div>
  )
}
