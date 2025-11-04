"use client"
import { Palette, Code2, Wrench, Terminal, FileCode, AlertTriangle } from 'lucide-react'
import React from 'react'

export function MessageIcon({ type, node }: { type: string; node?: string }) {
  const base = 'size-4'
  if (type === 'message') {
    if (node?.includes('designer_tools')) return <Wrench className={base} />
    if (node?.includes('designer')) return <Palette className={base} />
    if (node?.includes('coder_tools')) return <Terminal className={base} />
    if (node?.includes('coder')) return <Code2 className={base} />
    return <FileCode className={base} />
  }
  if (type === 'error') return <AlertTriangle className={base} />
  if (type === 'done') return <Code2 className={base} />
  return <FileCode className={base} />
}
