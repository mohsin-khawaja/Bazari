"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw, Check, Upload } from "lucide-react"
import Image from "next/image"

interface MobileCameraCaptureProps {
  onCapture: (imageBlob: Blob) => void
  onClose: () => void
  maxImages?: number
  currentImages?: string[]
}

export function MobileCameraCapture({
  onCapture,
  onClose,
  maxImages = 6,
  currentImages = [],
}: MobileCameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsCapturing(false)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob)
          setCapturedImage(imageUrl)
          stopCamera()
        }
      },
      "image/jpeg",
      0.8,
    )
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
      setCapturedImage(null)
    }
    startCamera()
  }, [capturedImage, startCamera])

  const confirmPhoto = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob)
          onClose()
        }
      },
      "image/jpeg",
      0.8,
    )
  }, [capturedImage, onCapture, onClose])

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
    if (isCapturing) {
      stopCamera()
      setTimeout(startCamera, 100)
    }
  }, [isCapturing, stopCamera, startCamera])

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        onCapture(file)
        onClose()
      }
    },
    [onCapture, onClose],
  )

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>

          <div className="text-white text-sm">
            {currentImages.length}/{maxImages} photos
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-white hover:bg-white/20"
            disabled={!isCapturing}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden">
          {capturedImage ? (
            <Image src={capturedImage || "/placeholder.svg"} alt="Captured photo" fill className="object-cover" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Camera overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          {capturedImage ? (
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="lg"
                onClick={retakePhoto}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Retake
              </Button>

              <Button size="lg" onClick={confirmPhoto} className="bg-green-600 hover:bg-green-700 text-white">
                <Check className="h-5 w-5 mr-2" />
                Use Photo
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              {/* Gallery Upload */}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </label>

              {/* Capture Button */}
              <Button
                size="lg"
                onClick={isCapturing ? capturePhoto : startCamera}
                disabled={!isCapturing && stream === null}
                className="w-20 h-20 rounded-full bg-white hover:bg-gray-200 text-black p-0"
              >
                <Camera className="h-8 w-8" />
              </Button>

              {/* Placeholder for symmetry */}
              <div className="w-12 h-12"></div>
            </div>
          )}
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
