import { createClient } from "./client"
import type { Database } from "./types"

type Item = Database["public"]["Tables"]["items"]["Row"]
type ItemInsert = Database["public"]["Tables"]["items"]["Insert"]
type ItemUpdate = Database["public"]["Tables"]["items"]["Update"]

export async function getItems(filters?: {
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
  limit?: number
  offset?: number
}) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("search_items", {
    search_query: filters?.search || null,
    category_filter: filters?.category || null,
    cultural_origin_filter: filters?.culturalOrigin || null,
    min_price: filters?.minPrice || null,
    max_price: filters?.maxPrice || null,
    condition_filter: filters?.condition || null,
    gender_filter: filters?.gender || null,
    size_filter: filters?.size || null,
    color_filter: filters?.color || null,
    on_sale_filter: filters?.onSale || null,
    free_shipping_filter: filters?.freeShipping || null,
    sort_by: filters?.sortBy || "created_at",
    sort_order: filters?.sortOrder || "DESC",
    page_limit: filters?.limit || 20,
    page_offset: filters?.offset || 0,
  })

  if (error) throw error
  return data
}

export async function getItemById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("item_details").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function createItem(item: ItemInsert, images: string[]) {
  const supabase = createClient()

  // Insert item
  const { data: newItem, error: itemError } = await supabase.from("items").insert(item).select().single()

  if (itemError) throw itemError

  // Insert images
  if (images.length > 0) {
    const imageInserts = images.map((url, index) => ({
      item_id: newItem.id,
      image_url: url,
      display_order: index,
      is_primary: index === 0,
    }))

    const { error: imagesError } = await supabase.from("item_images").insert(imageInserts)

    if (imagesError) throw imagesError
  }

  return newItem
}

export async function updateItem(id: string, updates: ItemUpdate) {
  const supabase = createClient()

  const { data, error } = await supabase.from("items").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteItem(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("items").delete().eq("id", id)

  if (error) throw error
}

export async function likeItem(itemId: string, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("likes").insert({ item_id: itemId, user_id: userId }).select().single()

  if (error) throw error
  return data
}

export async function unlikeItem(itemId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("likes").delete().eq("item_id", itemId).eq("user_id", userId)

  if (error) throw error
}

export async function saveItem(itemId: string, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("saves").insert({ item_id: itemId, user_id: userId }).select().single()

  if (error) throw error
  return data
}

export async function unsaveItem(itemId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("saves").delete().eq("item_id", itemId).eq("user_id", userId)

  if (error) throw error
}

export async function getUserItems(userId: string, status?: string) {
  const supabase = createClient()

  let query = supabase
    .from("items")
    .select(`
      *,
      item_images (
        image_url,
        is_primary
      )
    `)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}
