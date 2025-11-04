"use client"
import React, { type ReactNode, useEffect, useRef, useState } from 'react'
import { MessageIcon } from './icons'
import type { StreamMessage } from './types'

const TYPEWRITER_INTERVAL_MS = 12

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n)/g

function renderInline(text: string): ReactNode[] {
  if (!text) return []

  return (
    text
      .split(INLINE_TOKEN)
      .map((segment, index) => {
        if (!segment) return null

        if (segment === '\n') {
          return <br key={`break-${index}`} />
        }

        if (segment.startsWith('**') && segment.endsWith('**')) {
          return <strong key={`strong-${index}`}>{segment.slice(2, -2)}</strong>
        }

        if (segment.startsWith('*') && segment.endsWith('*')) {
          return <em key={`em-${index}`}>{segment.slice(1, -1)}</em>
        }

        if (segment.startsWith('`') && segment.endsWith('`')) {
          return (
            <code
              key={`code-${index}`}
              className="rounded bg-(--color-card) px-1 py-0.5 text-xs text-foreground/90"
            >
              {segment.slice(1, -1)}
            </code>
          )
        }

        return <React.Fragment key={`text-${index}`}>{segment}</React.Fragment>
      })
      .filter(Boolean) as ReactNode[]
  )
}

function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split(/\r?\n/)
  const blocks: ReactNode[] = []
  let blockKey = 0

  let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null
  let paragraphBuffer: string[] = []

  const flushList = () => {
    if (!listBuffer) return

    const key = `list-${blockKey++}`

    if (listBuffer.type === 'ul') {
      blocks.push(
        <ul key={key} className="ml-4 list-disc space-y-1 text-foreground/90">
          {listBuffer.items.map((item, itemIndex) => (
            <li key={`${key}-item-${itemIndex}`} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      )
    } else {
      blocks.push(
        <ol key={key} className="ml-4 list-decimal space-y-1 text-foreground/90">
          {listBuffer.items.map((item, itemIndex) => (
            <li key={`${key}-item-${itemIndex}`} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      )
    }

    listBuffer = null
  }

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return

    const content = paragraphBuffer.join('\n')

    blocks.push(
      <p key={`paragraph-${blockKey++}`} className="m-0 whitespace-pre-wrap wrap-break-word">
        {renderInline(content)}
      </p>,
    )

    paragraphBuffer = []
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (trimmed.length === 0) {
      flushParagraph()
      flushList()
      return
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()

      const [, hashes, headingText] = headingMatch
      const level = Math.min(hashes.length, 3)

      if (level === 1) {
        blocks.push(
          <h1 key={`heading-${blockKey++}`} className="text-lg font-semibold text-foreground">
            {renderInline(headingText)}
          </h1>,
        )
      } else if (level === 2) {
        blocks.push(
          <h2 key={`heading-${blockKey++}`} className="mt-3 text-base font-semibold text-foreground">
            {renderInline(headingText)}
          </h2>,
        )
      } else {
        blocks.push(
          <h3 key={`heading-${blockKey++}`} className="mt-2 text-sm font-semibold text-foreground">
            {renderInline(headingText)}
          </h3>,
        )
      }

      return
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/)
    if (unorderedMatch) {
      flushParagraph()

      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList()
        listBuffer = { type: 'ul', items: [] }
      }

      listBuffer.items.push(unorderedMatch[1])
      return
    }

    const orderedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/)
    if (orderedMatch) {
      flushParagraph()

      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList()
        listBuffer = { type: 'ol', items: [] }
      }

      listBuffer.items.push(orderedMatch[2])
      return
    }

    flushList()
    paragraphBuffer.push(trimmed)
  })

  flushParagraph()
  flushList()

  return blocks
}

export function MessageItem({ msg }: { msg: StreamMessage }) {
  if (msg.type === 'done') return null

  const label = msg.node?.replaceAll('_', ' ')
  const isUser = Boolean(msg.node && msg.node.includes('user'))
  const showIcon = !isUser && msg.type === 'message'
  const [visibleLength, setVisibleLength] = useState(() => (msg.type === 'message' ? 0 : msg.text?.length ?? 0))
  const lengthRef = useRef(visibleLength)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    lengthRef.current = visibleLength
  }, [visibleLength])

  useEffect(() => {
    const fullText = msg.text ?? ''

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (msg.type !== 'message') {
      lengthRef.current = fullText.length
      setVisibleLength(fullText.length)
      return () => {}
    }

    if (!fullText) {
      lengthRef.current = 0
      setVisibleLength(0)
      return () => {}
    }

    if (lengthRef.current > fullText.length) {
      lengthRef.current = fullText.length
      setVisibleLength(fullText.length)
    }

    if (lengthRef.current >= fullText.length) {
      return () => {}
    }

    const step = () => {
      setVisibleLength((current) => {
        if (current >= fullText.length) {
          lengthRef.current = fullText.length
          timerRef.current = null
          return fullText.length
        }
        const increment = Math.max(2, Math.ceil(fullText.length / 25))
        const next = Math.min(fullText.length, current + increment)
        lengthRef.current = next
        if (next < fullText.length) {
          timerRef.current = setTimeout(step, TYPEWRITER_INTERVAL_MS)
        } else {
          timerRef.current = null
        }
        return next
      })
    }

    timerRef.current = setTimeout(step, TYPEWRITER_INTERVAL_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [msg.text, msg.type])

  const textForRender = msg.type === 'message' ? msg.text?.slice(0, visibleLength) ?? '' : msg.text ?? ''

  return (
    <div className="py-3">
      {(label || showIcon) && (
        <div className="mb-1 flex items-center gap-2">
          {showIcon && <MessageIcon type={msg.type} node={msg.node} />}
          {label && <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>}
        </div>
      )}
      {textForRender && <div className="space-y-2 text-sm leading-relaxed text-foreground">{renderMarkdown(textForRender)}</div>}
    </div>
  )
}
