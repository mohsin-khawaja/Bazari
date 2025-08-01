"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, X, AlertTriangle, CheckCircle, Shield, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface UploadedImage {
  id: string
  url: string
  filename: string
  contentAnalysis?: {
    safe: boolean
    confidence: number
    flags: string[]
    categories: string[]
  }
  culturalAnalysis?: {
    appropriationRisk: number
    culturalContext: string[]
    recommendations: string[]
  }
}

interface SecureImageUploadProps {
  maxFiles?: number
  maxFileSize?: number // in MB
  culturalTags?: string[]
  itemId?: string
  onImagesUploaded?: (images: UploadedImage[]) => void
  onImageRemoved?: (imageId: string) => void
}

export function SecureImageUpload({
  maxFiles = 5,
  maxFileSize = 10,
  culturalTags = [],
  itemId,
  onImagesUploaded,
  onImageRemoved
}: SecureImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed'
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(extension)) {
      return 'File type not supported'
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('itemId', itemId || '')
    formData.append('culturalTags', JSON.stringify(culturalTags))

    const response = await fetch('/api/trust-safety/secure-upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    return response.json()
  }

  const analyzeImage = async (imageUrl: string, imageId: string) => {
    setAnalyzing(prev => [...prev, imageId])

    try {
      // Content safety analysis
      const contentResponse = await fetch('/api/trust-safety/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, itemId })
      })

      const contentAnalysis = await contentResponse.json()

      // Cultural analysis if cultural tags are provided
      let culturalAnalysis = null
      if (culturalTags.length > 0) {
        const culturalResponse = await fetch('/api/trust-safety/analyze-cultural-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, culturalTags })
        })
        culturalAnalysis = await culturalResponse.json()
      }

      // Update image with analysis results
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              contentAnalysis: contentAnalysis.result,
              culturalAnalysis: culturalAnalysis
            }
          : img
      ))

    } catch (error) {
      console.error('Image analysis error:', error)
      toast.error('Failed to analyze image content')
    } finally {
      setAnalyzing(prev => prev.filter(id => id !== imageId))
    }
  }

  const handleFiles = async (files: FileList) => {
    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const newImages: UploadedImage[] = []
    const totalFiles = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`)
        continue
      }

      try {
        // Upload file
        const uploadedImage = await uploadFile(file)
        newImages.push(uploadedImage)
        
        // Update progress
        setUploadProgress(((i + 1) / totalFiles) * 100)
        
        // Start content analysis
        analyzeImage(uploadedImage.url, uploadedImage.id)

      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setImages(prev => [...prev, ...newImages])
    setUploading(false)
    setUploadProgress(0)

    if (onImagesUploaded && newImages.length > 0) {
      onImagesUploaded(newImages)
    }
  }

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    if (onImageRemoved) {
      onImageRemoved(imageId)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const getContentSafetyBadge = (analysis: any) => {
    if (!analysis) return null
    
    if (analysis.safe) {
      return <Badge className="bg-green-100 text-green-800">Safe</Badge>
    } else {
      return <Badge variant="destructive">Flagged</Badge>
    }
  }

  const getCulturalRiskBadge = (analysis: any) => {
    if (!analysis) return null
    
    const risk = analysis.appropriationRisk
    if (risk < 0.3) {
      return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
    } else if (risk < 0.7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
    } else {
      return <Badge variant="destructive">High Risk</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Secure Image Upload
        </CardTitle>
        <CardDescription>
          Images are automatically scanned for inappropriate content and cultural sensitivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading || images.length >= maxFiles}
          />
          
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {dragActive ? 'Drop images here' : 'Upload Images'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop images here, or click to select files
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span>JPG, PNG, GIF, WebP</span>
            <span>•</span>
            <span>Max {maxFileSize}MB each</span>
            <span>•</span>
            <span>{images.length}/{maxFiles} uploaded</span>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading images...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Uploaded Images */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Uploaded Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium truncate">{image.filename}</h5>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getContentSafetyBadge(image.contentAnalysis)}
                        {getCulturalRiskBadge(image.culturalAnalysis)}
                        {analyzing.includes(image.id) && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Analyzing
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content Analysis Results */}
                  {image.contentAnalysis && !image.contentAnalysis.safe && (
                    <Alert className="mb-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Content Warning:</strong> This image was flagged for potentially inappropriate content.
                        {image.contentAnalysis.flags.length > 0 && (
                          <div className="mt-1">
                            Reasons: {image.contentAnalysis.flags.join(', ')}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Cultural Analysis Results */}
                  {image.culturalAnalysis && image.culturalAnalysis.appropriationRisk > 0.5 && (
                    <Alert className="mb-3">
                      <Eye className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Cultural Sensitivity:</strong> This image may need cultural context.
                        {image.culturalAnalysis.recommendations.length > 0 && (
                          <div className="mt-1">
                            <strong>Recommendations:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {image.culturalAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index} className="text-sm">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            All uploaded images are automatically scanned for inappropriate content and cultural sensitivity. 
            Flagged images may be reviewed by our moderation team before being published.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}