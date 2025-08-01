"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from "lucide-react"
import { trackSocialShare } from "@/lib/supabase/reviews"
import { toast } from "@/hooks/use-toast"

interface SocialShareButtonProps {
  item: {
    id: string
    title: string
    price: number
    images?: string[]
  }
  seller: {
    username: string
  }
}

export default function SocialShareButton({ item, seller }: SocialShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const itemUrl = `${baseUrl}/items/${item.id}`
  const shareText = `Check out this beautiful ${item.title} for $${item.price} on Bazari! 🛍️✨`
  const hashtags = "Bazari,EthnicFashion,CulturalFashion,Marketplace"

  const handleShare = async (platform: string, url: string) => {
    try {
      await trackSocialShare(item.id, platform, url)
      window.open(url, "_blank", "width=600,height=400")
    } catch (error) {
      console.error("Error tracking share:", error)
      window.open(url, "_blank", "width=600,height=400")
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(itemUrl)
      await trackSocialShare(item.id, "copy_link", itemUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Link copied!",
        description: "Item link has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      })
    }
  }

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(itemUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(itemUrl)}&hashtags=${hashtags}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(itemUrl)}&description=${encodeURIComponent(shareText)}&media=${encodeURIComponent(item.images?.[0] || "")}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${itemUrl}`)}`,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare("facebook", shareUrls.facebook)}>
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("twitter", shareUrls.twitter)}>
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("pinterest", shareUrls.pinterest)}>
          <div className="h-4 w-4 mr-2 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          Pinterest
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("whatsapp", shareUrls.whatsapp)}>
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
