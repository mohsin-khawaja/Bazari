"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useMemo } from "react"
import { debounce } from "lodash"

interface SearchFilters {
  search?: string
  category?: string
  culturalOrigin?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  gender?: string
  size?: string
  color?: string
  onSale?: boolean
  freeShipping?: boolean
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export function useRealTimeSearch(initialFilters: SearchFilters = {}) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const supabase = createClient()

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchFilters: SearchFilters, reset = true) => {
        try {
          setLoading(true)
          setError(null)

          const currentOffset = reset ? 0 : offset

          const { data, error } = await supabase.rpc("search_items", {
            search_query: searchFilters.search || null,
            category_filter: searchFilters.category || null,
            cultural_origin_filter: searchFilters.culturalOrigin || null,
            min_price: searchFilters.minPrice || null,
            max_price: searchFilters.maxPrice || null,
            condition_filter: searchFilters.condition || null,
            gender_filter: searchFilters.gender || null,
            size_filter: searchFilters.size || null,
            color_filter: searchFilters.color || null,
            on_sale_filter: searchFilters.onSale || null,
            free_shipping_filter: searchFilters.freeShipping || null,
            sort_by: searchFilters.sortBy || "created_at",
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
        } catch (err) {
          setError(err instanceof Error ? err.message : "Search failed")
        } finally {
          setLoading(false)
        }
      }, 300),
    [supabase, offset],
  )

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
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
    setOffset(0)
    debouncedSearch(clearedFilters, true)
  }

  useEffect(() => {
    debouncedSearch(filters, true)
  }, [])

  // Real-time updates for new items
  useEffect(() => {
    const channel = supabase
      .channel("items_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "items",
          filter: "status=eq.active",
        },
        () => {
          // Refresh search when new items are added
          debouncedSearch(filters, true)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "items",
        },
        () => {
          // Refresh search when items are updated
          debouncedSearch(filters, true)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filters, debouncedSearch])

  return {
    items,
    loading,
    error,
    filters,
    hasMore,
    updateFilters,
    loadMore,
    clearFilters,
  }
}
