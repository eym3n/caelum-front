"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxTags?: number
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add an item...",
  className,
  disabled,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (
      trimmed &&
      !value.includes(trimmed) &&
      (!maxTags || value.length < maxTags)
    ) {
      onChange([...value, trimmed])
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const items = pastedText
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item && !value.includes(item))
    
    if (items.length > 0) {
      const newTags = maxTags
        ? [...value, ...items].slice(0, maxTags)
        : [...value, ...items]
      onChange(newTags)
      setInputValue("")
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex min-h-[42px] flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="group/item flex items-center gap-1.5 pr-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="ml-1 rounded-full hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3 text-muted-foreground group-hover/item:text-destructive" />
            </button>
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || (maxTags !== undefined && value.length >= maxTags)}
          className="min-w-[120px] flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxTags} items
        </p>
      )}
    </div>
  )
}

