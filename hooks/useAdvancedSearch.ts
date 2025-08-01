"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { analyzeCulturalContext, generateSearchSuggestions, enhanceSearchQuery } from "@/lib/ai/search"
import { saveSearchQuery } from "@/lib/supabase/recommendations"
import { useAuth } from "./useAuth"
import { debounce } from "lodash"

interface AdvancedSearchFilters {
  query?: string
  culturalOrigin?: string
  category?: string
  occasion?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  gender?: string
  size?: string
  color?: string
  location?: string
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export function useAdvancedSearch(initialFilters: AdvancedSearchFilters = {}) {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AdvancedSearchFilters>(initialFilters)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [culturalContext, setCulturalContext] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const supabase = createClient()

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchFilters: AdvancedSearchFilters, reset = true) => {
        try {
          setLoading(true)
          setError(null)

          const currentOffset = reset ? 0 : offset

          // Analyze cultural context if query exists
          let context = null
          let enhancedQuery = searchFilters.query || ""

          if (searchFilters.query) {
            context = await analyzeCulturalContext(searchFilters.query)
            setCulturalContext(context)

            if (context) {
              enhancedQuery = await enhanceSearchQuery(searchFilters.query, context)
            }

            // Save search query for history
            if (user && searchFilters.query.length > 2) {
              await saveSearchQuery(user.id, searchFilters.query)
            }
          }

          // Perform advanced search
          const { data, error } = await supabase.rpc("advanced_search_items", {
            search_query: enhancedQuery || null,
            cultural_origin_filter: searchFilters.culturalOrigin || context?.culture || null,
            category_filter: searchFilters.category || null,
            occasion_filter: searchFilters.occasion || context?.occasion || null,
            min_price: searchFilters.minPrice || null,
            max_price: searchFilters.maxPrice || null,
            condition_filter: searchFilters.condition || null,
            gender_filter: searchFilters.gender || null,
            size_filter: searchFilters.size || null,
            color_filter: searchFilters.color || null,
            location_filter: searchFilters.location || null,
            sort_by: searchFilters.sortBy || "relevance",
            sort_order: searchFilters.sortOrder || "DESC",
            page_limit: 20,
            page_offset: currentOffset,
          })

          if (error) throw error

          if (reset) {
            setItems(data || [])
            setOffset(20)
          } else {
            setItems((prev) => [...prev, ...(data || [])])
            setOffset((prev) => prev + 20)
          }

          setHasMore((data || []).length === 20)

          // Generate search suggestions
          if (searchFilters.query && searchFilters.query.length > 2) {
            const userPrefs = user ? { culturalPreferences: user.cultural_preferences } : undefined
            const newSuggestions = await generateSearchSuggestions(searchFilters.query, userPrefs)
            setSuggestions(newSuggestions)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Search failed")
        } finally {
          setLoading(false)
        }
      }, 300),
    [supabase, offset, user],
  )

  const updateFilters = (newFilters: Partial<AdvancedSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    setOffset(0)
    debouncedSearch(updatedFilters, true)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      debouncedSearch(filters, false)
    }
  }

  const clearFilters = () => {
    const clearedFilters = { sortBy: "created_at", sortOrder: "DESC" as const }
    setFilters(clearedFilters)
    setCulturalContext(null)
    setSuggestions([])
    setOffset(0)
    debouncedSearch(clearedFilters, true)
  }

  useEffect(() => {
    debouncedSearch(filters, true)
  }, [])

  return {
    items,
    loading,
    error,
    filters,
    suggestions,
    culturalContext,
    hasMore,
    updateFilters,
    loadMore,
    clearFilters,
  }
}
