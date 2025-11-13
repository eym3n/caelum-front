"use client"

import * as React from "react"
import { X, Upload, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SectionAssetsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionLabel: string
  initialAssets: string[]
  onSave: (assets: string[]) => void
}

export function SectionAssetsDialog({
  open,
  onOpenChange,
  sectionLabel,
  initialAssets,
  onSave,
}: SectionAssetsDialogProps) {
  const [assets, setAssets] = React.useState<string[]>(initialAssets)
  const [isUploading, setIsUploading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setAssets(initialAssets)
    }
  }, [open, initialAssets])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/tiff",
      "image/bmp",
      "image/heic",
      "image/avif",
      "image/ico",
    ]

    const toUpload = Array.from(files).filter((f) => allowedTypes.includes(f.type))
    if (toUpload.length === 0) return

    setIsUploading(true)
    const uploaded: string[] = []

    for (const file of toUpload) {
      try {
        const form = new FormData()
        form.append("file", file)
        const res = await fetch(
          "https://builder-agent-api-934682636966.europe-southwest1.run.app/v1/uploads/upload-image",
          {
            method: "POST",
            body: form,
          }
        )
        if (!res.ok) throw new Error("Upload failed")
        const data = await res.json()
        if (data?.url) {
          uploaded.push(data.url)
        }
      } catch (e) {
        console.error("Section asset upload error", e)
      }
    }

    if (uploaded.length > 0) {
      setAssets((prev) => [...prev, ...uploaded])
    }
    setIsUploading(false)
  }

  const handleRemove = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(assets)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {sectionLabel} assets
          </DialogTitle>
          <DialogDescription className="text-xs">
            Upload images that will be used for this section in your generated landing page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label
            htmlFor="section-assets-upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-background px-4 py-6 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-accent/50"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? "Uploading..." : "Drop or browse images"}</span>
          </label>
          <input
            id="section-assets-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />

          {assets.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {assets.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs"
                >
                  <span className="flex-1 truncate mr-2">{url.split("/").pop()}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-destructive hover:text-destructive/80"
                    aria-label="Remove asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {assets.length === 0 && !isUploading && (
            <p className="text-[11px] text-muted-foreground">
              No assets added yet. You can upload hero imagery, icons, or UI screenshots that match this section.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={isUploading}>
            Save assets
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


