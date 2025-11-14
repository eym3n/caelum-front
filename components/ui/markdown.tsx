"use client"
import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

// Lightweight markdown rendering with constrained feature set and dark theme friendly styling.
// We rely on react-markdown which is already a dependency. We override elements to match the chat bubble aesthetics.

interface MarkdownProps {
  text: string
  className?: string
}

const components: Components = {
  p: ({ children }) => {
    // Avoid invalid HTML like <p><pre>...</pre></p>, which causes hydration warnings.
    // If a paragraph would directly contain any block-level <pre>, just render the
    // children without the wrapping <p>.
    const hasBlockPre = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === 'pre'
    )

    if (hasBlockPre) {
      return <>{children}</>
    }

    return <p className="mb-1 last:mb-0 leading-normal">{children}</p>
  },
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: (props) => {
    const { inline, className, children } = props as any
    if (inline) {
      return (
        <code className="rounded bg-black/40 px-1 py-0.5 text-[11px] font-mono text-(--color-muted)">{children}</code>
      )
    }
    const lang = /language-(\w+)/.exec(className || '')?.[1]
    return (
      <pre className="mb-2 rounded-md border border-(--color-border) bg-black/60 p-2 text-xs leading-relaxed w-full max-w-full whitespace-pre-wrap wrap-break-word" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        <code className={`font-mono ${lang ? `language-${lang}` : ''} w-full max-w-full whitespace-pre-wrap`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{children}</code>
      </pre>
    )
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-(--color-border) underline-offset-2 hover:text-foreground transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-1 list-disc pl-5 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-1 list-decimal pl-5 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-normal">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-1 border-l-2 border-(--color-border) pl-3 italic text-(--color-muted)">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-border/40" />,
  br: () => <br />,
  h1: ({ children }) => <h1 className="mb-1 text-lg font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-1 text-base font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
}

export function Markdown({ text, className = '' }: MarkdownProps) {
  return (
    <div
      className={"markdown leading-normal text-sm wrap-break-word space-y-0.5 " + className}
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
    >
      <ReactMarkdown components={components}>{text}</ReactMarkdown>
    </div>
  )
}

export default Markdown
