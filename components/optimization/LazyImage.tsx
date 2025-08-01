"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl, generateBlurDataURL } from '@/lib/performance/image-optimization'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  sizes?: string
  quality?: number
  priority?: boolean
  fill?: boolean
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  quality = 80,
  priority = false,
  fill = false,
  placeholder = 'blur',
  onLoad,
  onError,
  objectFit = 'cover',
  objectPosition = 'center',
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Generate optimized image URL
  const optimizedSrc = getOptimizedImageUrl(src, width, height, quality)
  const blurDataURL = generateBlurDataURL(width || 10, height || 10)

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Error fallback component
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <svg
            className="h-8 w-8 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        isLoading && "animate-pulse bg-gray-200",
        className
      )}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        style={{
          objectFit: fill ? objectFit : undefined,
          objectPosition: fill ? objectPosition : undefined,
        }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      )}
    </div>
  )
}

// Specialized component for cultural clothing images
export function CulturalClothingImage({
  src,
  alt,
  context = 'card',
  className,
  onLoad,
  onError,
}: {
  src: string
  alt: string
  context?: 'thumbnail' | 'card' | 'hero' | 'gallery' | 'detail'
  className?: string
  onLoad?: () => void
  onError?: () => void
}) {
  const dimensions = {
    thumbnail: { width: 150, height: 150 },
    card: { width: 300, height: 400 },
    hero: { width: 1200, height: 600 },
    gallery: { width: 600, height: 800 },
    detail: { width: 800, height: 1000 }
  }

  const sizes = {
    thumbnail: '150px',
    card: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px',
    hero: '100vw',
    gallery: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
    detail: '(max-width: 768px) 100vw, 800px'
  }

  const { width, height } = dimensions[context]
  const imageSizes = sizes[context]

  return (
    <LazyImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={imageSizes}
      quality={context === 'hero' ? 85 : 80}
      priority={context === 'hero'}
      onLoad={onLoad}
      onError={onError}
    />
  )
}

// Progressive image loading component with intersection observer
export function ProgressiveLazyImage({
  src,
  alt,
  width,
  height,
  className,
  lowQualitySrc,
  ...props
}: LazyImageProps & { lowQualitySrc?: string }) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isInView && lowQualitySrc && currentSrc === lowQualitySrc) {
      // Load high quality image
      const img = new Image()
      img.onload = () => {
        setCurrentSrc(src)
      }
      img.src = src
    }
  }, [isInView, src, lowQualitySrc, currentSrc])

  return (
    <div ref={imgRef}>
      <LazyImage
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...props}
      />
    </div>
  )
}