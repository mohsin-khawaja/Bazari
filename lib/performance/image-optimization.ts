import { config } from '@/config/environments'

// Image optimization utilities for performance

export interface ImageDimensions {
  width: number
  height: number
}

export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// Generate responsive image sizes
export function generateImageSizes(baseWidth: number): string {
  const breakpoints = [480, 640, 768, 1024, 1280, 1536]
  const sizes = breakpoints.map(bp => `(max-width: ${bp}px) ${Math.min(bp, baseWidth)}px`)
  sizes.push(`${baseWidth}px`)
  return sizes.join(', ')
}

// Generate blur placeholder for images
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) {
    // Fallback for server-side
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRUf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HT2P4j7Vo5WsxVNCdwcZPl+lcMeWpWt6fTMVS5WOYy9F1nUFdY3wjVJdJOdJ8U1uMaHddUEHYL4Hq/7fhN2JwjtvCFkjQNkSMeq/cUqGK3VBaGbJPIZDcTVu+qT1PRJM4kzQRFB8o/lpB/FqGP9+L1wBhYNYI4KoKL1b1VPr7fBSO0+hEXZF0FefVs4SSDnO1P1qV6LtjjMCvJSY0V0yTK8ypjjEy7m/kOJ2Sz6HOSzTGUYSkNrXAJ1xf2OKoHYNSVf/9k='
  }
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  canvas.width = width
  canvas.height = height
  
  // Create a subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

// Get optimized image URL based on provider
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 80,
  format: 'webp' | 'avif' | 'jpg' | 'png' = 'webp'
): string {
  // If it's already a data URL or relative path, return as is
  if (src.startsWith('data:') || src.startsWith('/')) {
    return src
  }

  // Supabase storage optimization
  if (src.includes('supabase.co') || src.includes('supabase.in')) {
    const url = new URL(src)
    const params = new URLSearchParams()
    
    if (width) params.set('width', width.toString())
    if (height) params.set('height', height.toString())
    params.set('quality', quality.toString())
    params.set('format', format)
    
    return `${url.origin}${url.pathname}?${params.toString()}`
  }

  // Cloudinary optimization
  if (src.includes('cloudinary.com')) {
    const cloudinaryTransforms = []
    
    if (width || height) {
      cloudinaryTransforms.push(`c_fill`)
      if (width) cloudinaryTransforms.push(`w_${width}`)
      if (height) cloudinaryTransforms.push(`h_${height}`)
    }
    
    cloudinaryTransforms.push(`q_${quality}`)
    cloudinaryTransforms.push(`f_${format}`)
    
    // Insert transforms into Cloudinary URL
    return src.replace('/upload/', `/upload/${cloudinaryTransforms.join(',')}/`)
  }

  // Default: return original URL
  return src
}

// Get appropriate image dimensions for different contexts
export function getContextualImageDimensions(context: string): ImageDimensions {
  const dimensions: Record<string, ImageDimensions> = {
    'thumbnail': { width: 150, height: 150 },
    'card': { width: 300, height: 400 },
    'hero': { width: 1200, height: 600 },
    'gallery': { width: 600, height: 800 },
    'avatar': { width: 100, height: 100 },
    'banner': { width: 1920, height: 400 },
    'product-main': { width: 800, height: 1000 },
    'product-thumb': { width: 120, height: 150 }
  }
  
  return dimensions[context] || { width: 400, height: 300 }
}

// Progressive image loading with intersection observer
export class ProgressiveImageLoader {
  private observer: IntersectionObserver | null = null
  private loadedImages = new Set<string>()

  constructor() {
    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target as HTMLImageElement)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      )
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img)
    }
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src
    if (src && !this.loadedImages.has(src)) {
      // Create a new image to preload
      const newImg = new Image()
      
      newImg.onload = () => {
        img.src = src
        img.classList.add('loaded')
        this.loadedImages.add(src)
        
        if (this.observer) {
          this.observer.unobserve(img)
        }
      }
      
      newImg.src = src
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Image preloading for critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Batch preload multiple images
export async function preloadImages(srcs: string[]): Promise<void> {
  const promises = srcs.map(src => preloadImage(src))
  await Promise.all(promises)
}

// Image format support detection
export function getSupportedImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'jpg'
  
  // Create test elements
  const avif = document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0
  const webp = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
  
  if (avif) return 'avif'
  if (webp) return 'webp'
  return 'jpg'
}

// Cultural clothing specific image optimization
export function optimizeCulturalClothingImage(
  src: string,
  context: 'thumbnail' | 'detail' | 'gallery' | 'hero'
): OptimizedImageProps {
  const dimensions = getContextualImageDimensions(`product-${context === 'detail' ? 'main' : context}`)
  const quality = context === 'hero' ? 85 : 80
  
  return {
    src: getOptimizedImageUrl(src, dimensions.width, dimensions.height, quality),
    alt: 'Cultural clothing item',
    width: dimensions.width,
    height: dimensions.height,
    sizes: generateImageSizes(dimensions.width),
    quality,
    placeholder: 'blur',
    blurDataURL: generateBlurDataURL(),
    priority: context === 'hero'
  }
}