"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Flag, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { markReviewHelpful, reportContent, flagCulturalSensitivity } from "@/lib/supabase/reviews"
import { toast } from "@/hooks/use-toast"

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    title?: string
    content: string
    images?: string[]
    helpful_count: number
    verified_purchase: boolean
    cultural_sensitivity_score: number
    created_at: string
    reviewer: {
      id: string
      username: string
      first_name?: string
      avatar_url?: string
    }
  }
  currentUserId?: string
}

export default function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)

  const handleHelpfulClick = async (helpful: boolean) => {
    if (!currentUserId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to mark reviews as helpful.",
        variant: "destructive",
      })
      return
    }

    try {
      await markReviewHelpful(review.id, helpful)
      setIsHelpful(helpful)
      setHelpfulCount((prev) => (helpful ? prev + 1 : Math.max(0, prev - 1)))

      toast({
        title: "Thank you!",
        description: `Review marked as ${helpful ? "helpful" : "not helpful"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review helpfulness.",
        variant: "destructive",
      })
    }
  }

  const handleReport = async () => {
    if (!currentUserId) return

    try {
      await reportContent({
        type: "review",
        targetId: review.id,
        reportType: "inappropriate_content",
        reason: "User reported this review as inappropriate",
      })

      toast({
        title: "Report submitted",
        description: "Thank you for reporting. We'll review this content.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      })
    }
  }

  const handleCulturalFlag = async () => {
    if (!currentUserId) return

    try {
      await flagCulturalSensitivity({
        type: "review",
        targetId: review.id,
        flagType: "appropriation_concern",
        description: "User flagged this review for cultural sensitivity concerns",
        severity: "medium",
      })

      toast({
        title: "Flag submitted",
        description: "Thank you for helping maintain cultural sensitivity.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit cultural sensitivity flag.",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewer.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                {review.reviewer.first_name?.charAt(0) || review.reviewer.username.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{review.reviewer.first_name || review.reviewer.username}</span>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {currentUserId && currentUserId !== review.reviewer.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCulturalFlag}>
                  <Shield className="h-4 w-4 mr-2" />
                  Cultural Sensitivity Flag
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {review.title && <h4 className="font-medium mb-2">{review.title}</h4>}

        <p className="text-gray-700 mb-4">{review.content}</p>

        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`Review image ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Was this helpful?</span>
            <Button
              variant={isHelpful === true ? "default" : "outline"}
              size="sm"
              onClick={() => handleHelpfulClick(true)}
              disabled={!currentUserId}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Yes ({helpfulCount})
            </Button>
            <Button
              variant={isHelpful === false ? "default" : "outline"}
              size="sm"
              onClick={() => handleHelpfulClick(false)}
              disabled={!currentUserId}
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              No
            </Button>
          </div>

          {review.cultural_sensitivity_score < 4 && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <Shield className="h-3 w-3 mr-1" />
              Cultural Sensitivity Review
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
