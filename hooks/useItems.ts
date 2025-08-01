"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface ItemFilters {
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

export function useItems(filters: ItemFilters = {}, limit = 20) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const supabase = createClient()

  const fetchItems = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset

      const { data, error } = await supabase.rpc("search_items", {
        search_query: filters.search || null,
        category_filter: filters.category || null,
        cultural_origin_filter: filters.culturalOrigin || null,
        min_price: filters.minPrice || null,
        max_price: filters.maxPrice || null,
        condition_filter: filters.condition || null,
        gender_filter: filters.gender || null,
        size_filter: filters.size || null,
        color_filter: filters.color || null,
        on_sale_filter: filters.onSale || null,
        free_shipping_filter: filters.freeShipping || null,
        sort_by: filters.sortBy || "created_at",
        sort_order: filters.sortOrder || "DESC",
        page_limit: limit,
        page_offset: currentOffset,
      })

      if (error) throw error

      if (reset) {
        setItems(data || [])
        setOffset(limit)
      } else {
        setItems((prev) => [...prev, ...(data || [])])
        setOffset((prev) => prev + limit)
      }

      setHasMore((data || []).length === limit)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchItems(false)
    }
  }

  const refresh = () => {
    setOffset(0)
    fetchItems(true)
  }

  useEffect(() => {
    refresh()
  }, [
    filters.search,
    filters.category,
    filters.culturalOrigin,
    filters.minPrice,
    filters.maxPrice,
    filters.condition,
    filters.gender,
    filters.size,
    filters.color,
    filters.onSale,
    filters.freeShipping,
    filters.sortBy,
    filters.sortOrder,
  ])

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}
