"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, Share2, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SwipeableItemCardProps {
  item: {
    id: string
    title: string
    price: number
    image_url: string
    cultural_origin_name?: string
    seller_username: string
    likes_count: number
    condition?: string
  }
  onLike?: (itemId: string) => void
  onSave?: (itemId: string) => void
  onShare?: (itemId: string) => void
  isLiked?: boolean
  isSaved?: boolean
  className?: string
}

export function SwipeableItemCard({
  item,
  onLike,
  onSave,
  onShare,
  isLiked = false,
  isSaved = false,
  className,
}: SwipeableItemCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [startX, setStartX] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return

      const currentX = e.touches[0].clientX
      const diff = currentX - startX

      // Limit drag distance
      const maxDrag = 100
      const limitedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff))

      setDragOffset(limitedDiff)
    },
    [isDragging, startX],
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return

    const threshold = 50

    if (dragOffset > threshold) {
      // Swipe right - like
      onLike?.(item.id)
    } else if (dragOffset < -threshold) {
      // Swipe left - save
      onSave?.(item.id)
    }

    setIsDragging(false)
    setDragOffset(0)
  }, [isDragging, dragOffset, onLike, onSave, item.id])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      const currentX = e.clientX
      const diff = currentX - startX

      const maxDrag = 100
      const limitedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff))

      setDragOffset(limitedDiff)
    },
    [isDragging, startX],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return

    const threshold = 50

    if (dragOffset > threshold) {
      onLike?.(item.id)
    } else if (dragOffset < -threshold) {
      onSave?.(item.id)
    }

    setIsDragging(false)
    setDragOffset(0)
  }, [isDragging, dragOffset, onLike, onSave, item.id])

  return (
    <div className="relative">
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex items-center justify-between px-4 rounded-lg overflow-hidden">
        {/* Left action (Like) */}
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full bg-red-500 text-white transition-all duration-200",
            dragOffset > 25 ? "scale-110" : "scale-100",
            dragOffset > 0 ? "opacity-100" : "opacity-0",
          )}
        >
          <Heart className="h-6 w-6 fill-current" />
        </div>

        {/* Right action (Save) */}
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white transition-all duration-200",
            dragOffset < -25 ? "scale-110" : "scale-100",
            dragOffset < 0 ? "opacity-100" : "opacity-0",
          )}
        >
          <Bookmark className="h-6 w-6 fill-current" />
        </div>
      </div>

      {/* Main Card */}
      <Card
        ref={cardRef}
        className={cn(
          "relative transition-transform duration-200 cursor-pointer select-none",
          isDragging ? "transition-none" : "",
          className,
        )}
        style={{
          transform: `translateX(${dragOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative">
          <Link href={`/items/${item.id}`}>
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              <Image
                src={item.image_url || "/placeholder.svg?height=300&width=300"}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Quick Actions Overlay */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onShare?.(item.id)
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Cultural Origin Badge */}
              {item.cultural_origin_name && (
                <Badge className="absolute top-2 left-2 text-xs">{item.cultural_origin_name}</Badge>
              )}
            </div>
          </Link>

          <CardContent className="p-3">
            <Link href={`/items/${item.id}`}>
              <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                {item.title}
              </h3>
            </Link>

            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">${item.price}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{item.likes_count}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>@{item.seller_username}</span>
              {item.condition && (
                <Badge variant="outline" className="text-xs">
                  {item.condition.replace("_", " ")}
                </Badge>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center justify-between mt-3 gap-2">
              <Button
                size="sm"
                variant={isLiked ? "default" : "outline"}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onLike?.(item.id)
                }}
                className="flex-1"
              >
                <Heart className={cn("h-4 w-4 mr-1", isLiked && "fill-current")} />
                Like
              </Button>

              <Button
                size="sm"
                variant={isSaved ? "default" : "outline"}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSave?.(item.id)
                }}
                className="flex-1"
              >
                <Bookmark className={cn("h-4 w-4 mr-1", isSaved && "fill-current")} />
                Save
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Swipe Hints */}
      {dragOffset === 0 && !isDragging && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Swipe right to like</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Swipe left to save</span>
          </div>
        </div>
      )}
    </div>
  )
}
