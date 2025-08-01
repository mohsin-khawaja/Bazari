"use client"

import { useRecommendations } from "@/hooks/useRecommendations"
import { RecommendationSection } from "@/components/RecommendationSection"
import { Sparkles, Eye, Bookmark } from "lucide-react"

export default function RecommendationsPage() {
  const { recommendations, recentlyViewed, wishlist, loading } = useRecommendations()

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover & Explore</h1>
          <p className="text-muted-foreground">
            Personalized recommendations based on your cultural preferences and browsing history
          </p>
        </div>

        <div className="space-y-8">
          {/* AI Recommendations */}
          <RecommendationSection
            title="Recommended for You"
            items={recommendations}
            loading={loading}
            icon={<Sparkles className="h-5 w-5" />}
            emptyMessage="Start browsing items to get personalized recommendations"
          />

          {/* Recently Viewed */}
          <RecommendationSection
            title="Recently Viewed"
            items={recentlyViewed}
            icon={<Eye className="h-5 w-5" />}
            emptyMessage="Items you view will appear here"
          />

          {/* Wishlist */}
          <RecommendationSection
            title="Your Wishlist"
            items={wishlist}
            icon={<Bookmark className="h-5 w-5" />}
            emptyMessage="Save items to your wishlist to see them here"
          />
        </div>
      </div>
    </div>
  )
}
