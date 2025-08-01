"use client"

import { useState, useEffect } from "react"
import {
  getRecommendationsForUser,
  getSimilarItems,
  getRecentlyViewedItems,
  getWishlistItems,
  trackItemView,
} from "@/lib/supabase/recommendations"
import { useAuth } from "./useAuth"

export function useRecommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadRecommendations()
      loadRecentlyViewed()
      loadWishlist()
    }
  }, [user])

  const loadRecommendations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getRecommendationsForUser(user.id)
      setRecommendations(data)
    } catch (error) {
      console.error("Error loading recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentlyViewed = async () => {
    if (!user) return

    try {
      const data = await getRecentlyViewedItems(user.id)
      setRecentlyViewed(data)
    } catch (error) {
      console.error("Error loading recently viewed:", error)
    }
  }

  const loadWishlist = async () => {
    if (!user) return

    try {
      const data = await getWishlistItems(user.id)
      setWishlist(data)
    } catch (error) {
      console.error("Error loading wishlist:", error)
    }
  }

  const trackView = async (itemId: string) => {
    if (!user) return

    try {
      await trackItemView(user.id, itemId)
      // Refresh recently viewed
      loadRecentlyViewed()
    } catch (error) {
      console.error("Error tracking view:", error)
    }
  }

  return {
    recommendations,
    recentlyViewed,
    wishlist,
    loading,
    loadRecommendations,
    loadRecentlyViewed,
    loadWishlist,
    trackView,
  }
}

export function useSimilarItems(itemId: string) {
  const [similarItems, setSimilarItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (itemId) {
      loadSimilarItems()
    }
  }, [itemId])

  const loadSimilarItems = async () => {
    try {
      setLoading(true)
      const data = await getSimilarItems(itemId)
      setSimilarItems(data)
    } catch (error) {
      console.error("Error loading similar items:", error)
    } finally {
      setLoading(false)
    }
  }

  return { similarItems, loading }
}
