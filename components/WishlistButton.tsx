"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { addToWishlist, removeFromWishlist } from "@/lib/supabase/recommendations"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface WishlistButtonProps {
  itemId: string
  isInWishlist: boolean
  onToggle?: (isInWishlist: boolean) => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function WishlistButton({
  itemId,
  isInWishlist,
  onToggle,
  variant = "outline",
  size = "default",
}: WishlistButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [inWishlist, setInWishlist] = useState(isInWishlist)

  const handleToggle = async () => {
    if (!user) {
      toast.error("Please sign in to save items")
      return
    }

    try {
      setLoading(true)

      if (inWishlist) {
        await removeFromWishlist(user.id, itemId)
        setInWishlist(false)
        toast.success("Removed from wishlist")
      } else {
        await addToWishlist(user.id, itemId)
        setInWishlist(true)
        toast.success("Added to wishlist")
      }

      onToggle?.(inWishlist)
    } catch (error) {
      toast.error("Failed to update wishlist")
      console.error("Wishlist error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={inWishlist ? "text-primary" : ""}
    >
      <Bookmark className={`h-4 w-4 ${inWishlist ? "fill-current" : ""} ${size !== "icon" ? "mr-2" : ""}`} />
      {size !== "icon" && (inWishlist ? "Saved" : "Save")}
    </Button>
  )
}
