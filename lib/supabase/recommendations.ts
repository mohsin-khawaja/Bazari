import { createClient } from "./client"
import type { Database } from "./types"

type Item = Database["public"]["Tables"]["items"]["Row"]

export async function getRecommendationsForUser(userId: string, limit = 10) {
  const supabase = createClient()

  // Get user's cultural preferences and interaction history
  const [userProfile, userLikes, userViews] = await Promise.all([
    supabase.from("user_profiles").select("cultural_preferences").eq("user_id", userId).single(),
    supabase.from("likes").select("item_id").eq("user_id", userId).limit(50),
    supabase.from("item_views").select("item_id").eq("user_id", userId).limit(100),
  ])

  const culturalPrefs = userProfile.data?.cultural_preferences || []
  const likedItems = userLikes.data?.map((l) => l.item_id) || []
  const viewedItems = userViews.data?.map((v) => v.item_id) || []

  // Get recommendations based on cultural preferences
  const { data: culturalRecs } = await supabase
    .from("items")
    .select(`
      *,
      cultural_origins (name),
      item_images (image_url, is_primary),
      categories (name)
    `)
    .in("cultural_origin_id", culturalPrefs)
    .eq("status", "active")
    .not("id", "in", `(${[...likedItems, ...viewedItems].join(",") || "null"})`)
    .order("created_at", { ascending: false })
    .limit(limit / 2)

  // Get collaborative filtering recommendations
  const { data: collaborativeRecs } = await supabase.rpc("get_collaborative_recommendations", {
    user_uuid: userId,
    limit_count: limit / 2,
  })

  return [...(culturalRecs || []), ...(collaborativeRecs || [])]
}

export async function getSimilarItems(itemId: string, limit = 6) {
  const supabase = createClient()

  const { data: item } = await supabase
    .from("items")
    .select("cultural_origin_id, category_id, price, gender")
    .eq("id", itemId)
    .single()

  if (!item) return []

  const { data: similarItems } = await supabase
    .from("items")
    .select(`
      *,
      cultural_origins (name),
      item_images (image_url, is_primary),
      categories (name)
    `)
    .eq("cultural_origin_id", item.cultural_origin_id)
    .eq("status", "active")
    .neq("id", itemId)
    .gte("price", item.price * 0.7)
    .lte("price", item.price * 1.3)
    .limit(limit)

  return similarItems || []
}

export async function getRecentlyViewedItems(userId: string, limit = 10) {
  const supabase = createClient()

  const { data } = await supabase
    .from("item_views")
    .select(`
      item_id,
      viewed_at,
      items (
        *,
        cultural_origins (name),
        item_images (image_url, is_primary),
        categories (name)
      )
    `)
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(limit)

  return data?.map((view) => view.items).filter(Boolean) || []
}

export async function getWishlistItems(userId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from("saves")
    .select(`
      item_id,
      created_at,
      items (
        *,
        cultural_origins (name),
        item_images (image_url, is_primary),
        categories (name)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return data?.map((save) => save.items).filter(Boolean) || []
}

export async function addToWishlist(userId: string, itemId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("saves").insert({ user_id: userId, item_id: itemId }).select().single()

  if (error) throw error
  return data
}

export async function removeFromWishlist(userId: string, itemId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("saves").delete().eq("user_id", userId).eq("item_id", itemId)

  if (error) throw error
}

export async function trackItemView(userId: string, itemId: string) {
  const supabase = createClient()

  // Insert or update view record
  const { error } = await supabase.from("item_views").upsert({
    user_id: userId,
    item_id: itemId,
    viewed_at: new Date().toISOString(),
  })

  if (error) console.error("Error tracking view:", error)
}

export async function getSearchHistory(userId: string, limit = 10) {
  const supabase = createClient()

  const { data } = await supabase
    .from("search_history")
    .select("query, searched_at")
    .eq("user_id", userId)
    .order("searched_at", { ascending: false })
    .limit(limit)

  return data || []
}

export async function saveSearchQuery(userId: string, query: string) {
  const supabase = createClient()

  const { error } = await supabase.from("search_history").insert({
    user_id: userId,
    query,
    searched_at: new Date().toISOString(),
  })

  if (error) console.error("Error saving search:", error)
}
