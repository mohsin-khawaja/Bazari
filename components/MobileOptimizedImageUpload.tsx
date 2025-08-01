"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"
import { MobileCameraCapture } from "./MobileCameraCapture"
import { uploadMultipleImages } from "@/lib/supabase/storage"

interface MobileOptimizedImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxImages?: number
  bucket?: string
  path?: string
  existingImages?: string[]
}

export function MobileOptimizedImageUpload({
  onImagesUploaded,
  maxImages = 6,
  bucket = "item-images",
  path = "items",
  existingImages = [],
}: MobileOptimizedImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const handleCameraCapture = useCallback(
    async (imageBlob: Blob) => {
      if (images.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed`)
        return
      }

      setUploading(true)
      setError(null)

      try {
        const file = new File([imageBlob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })
        const uploadResults = await uploadMultipleImages([file], bucket, path)
        const newImageUrl = uploadResults[0].url

        const updatedImages = [...images, newImageUrl]
        setImages(updatedImages)
        onImagesUploaded(updatedImages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
      }
    },
    [images, maxImages, bucket, path, onImagesUploaded],
  )

  const handleFileUpload = useCallback(
    async (files: FileList) => {
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
    },
    [images, maxImages, bucket, path, onImagesUploaded],
  )

  const removeImage = useCallback(
    (index: number) => {
      const updatedImages = images.filter((_, i) => i !== index)
      setImages(updatedImages)
      onImagesUploaded(updatedImages)
    },
    [images, onImagesUploaded],
  )

  const reorderImages = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updatedImages = [...images]
      const [movedImage] = updatedImages.splice(fromIndex, 1)
      updatedImages.splice(toIndex, 0, movedImage)
      setImages(updatedImages)
      onImagesUploaded(updatedImages)
    },
    [images, onImagesUploaded],
  )

  if (showCamera) {
    return (
      <MobileCameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        maxImages={maxImages}
        currentImages={images}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-3">
        {images.map((imageUrl, index) => (
          <Card key={index} className="relative aspect-square overflow-hidden">
            <Image src={imageUrl || "/placeholder.svg"} alt={`Upload ${index + 1}`} fill className="object-cover" />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6"
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
            {/* Drag handle for reordering */}
            <div className="absolute bottom-2 right-2 bg-black/50 rounded p-1">
              <span className="text-white text-xs">{index + 1}</span>
            </div>
          </Card>
        ))}

        {/* Add Photo Buttons */}
        {images.length < maxImages && (
          <>
            {/* Camera Button */}
            <Card
              className="aspect-square border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => setShowCamera(true)}
            >
              <CardContent className="p-4 text-center">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                )}
                <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Take Photo"}</span>
              </CardContent>
            </Card>

            {/* Gallery Upload Button */}
            {images.length < maxImages - 1 && (
              <label className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                <div className="p-4 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                  <span className="text-sm text-muted-foreground">From Gallery</span>
                </div>
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
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Uploading images...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Image Counter */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {images.length}/{maxImages} images uploaded
          {images.length > 0 && " • Tap and hold to reorder"}
        </p>
      </div>

      {/* Mobile Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <ImageIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Photo Tips:</p>
            <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Use good lighting for best results</li>
              <li>• Show different angles of your item</li>
              <li>• Include close-ups of details and any flaws</li>
              <li>• First photo will be your main listing image</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
