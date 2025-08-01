"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadMultipleImages } from "@/lib/supabase/storage"
import Image from "next/image"

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxImages?: number
  bucket?: string
  path?: string
  existingImages?: string[]
}

export function ImageUpload({
  onImagesUploaded,
  maxImages = 6,
  bucket = "item-images",
  path = "items",
  existingImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (files: FileList) => {
    if (files.length + images.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const fileArray = Array.from(files)
      const uploadResults = await uploadMultipleImages(fileArray, bucket, path)
      const newImageUrls = uploadResults.map((result) => result.url)

      const updatedImages = [...images, ...newImageUrls]
      setImages(updatedImages)
      onImagesUploaded(updatedImages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesUploaded(updatedImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={`Upload ${index + 1}`}
              fill
              className="object-cover rounded-lg border"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => removeImage(index)}
              disabled={uploading}
            >
              <X className="h-3 w-3" />
            </Button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">Primary</span>
              </div>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center">Add Photo</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-sm text-muted-foreground">
        {images.length}/{maxImages} images uploaded
        {images.length > 0 && " • First image will be the primary photo"}
      </p>
    </div>
  )
}
