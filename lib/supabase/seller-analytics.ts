import { createClient } from "./client"
import type { Database } from "./types"

type SellerAnalytics = Database["public"]["Tables"]["seller_analytics"]["Row"]
type ItemAnalytics = Database["public"]["Tables"]["item_analytics"]["Row"]
type Promotion = Database["public"]["Tables"]["promotions"]["Row"]
type FeaturedListing = Database["public"]["Tables"]["featured_listings"]["Row"]

export interface DashboardData {
  revenue: number
  orders: number
  views: number
  conversionRate: number
  topItems: Array<{
    id: string
    title: string
    revenue: number
    views: number
    orders: number
  }>
  culturalPerformance: Array<{
    culturalOrigin: string
    revenue: number
    orders: number
    conversionRate: number
  }>
}

export interface ItemPerformance {
  id: string
  title: string
  imageUrl: string
  views: number
  likes: number
  saves: number
  inquiries: number
  orders: number
  revenue: number
  conversionRate: number
  culturalOrigin: string
  category: string
}

export interface CustomerInsight {
  customerId: string
  customerName: string
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  lastOrderDate: string
  favoriteCategories: string[]
  favoriteCulturalOrigins: string[]
}

export async function getSellerDashboardData(sellerId: string, daysBack = 30): Promise<DashboardData> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_seller_dashboard_data", {
    seller_uuid: sellerId,
    days_back: daysBack,
  })

  if (error) {
    console.error("Error fetching dashboard data:", error)
    throw error
  }

  return data as DashboardData
}

export async function getItemPerformance(sellerId: string, daysBack = 30): Promise<ItemPerformance[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("items")
    .select(`
      id,
      title,
      image_url,
      cultural_origins(name),
      categories(name),
      item_analytics!inner(
        views,
        likes,
        saves,
        inquiries,
        orders,
        revenue
      )
    `)
    .eq("seller_id", sellerId)
    .gte("item_analytics.date", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())

  if (error) {
    console.error("Error fetching item performance:", error)
    throw error
  }

  return (
    data?.map((item: any) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      views: item.item_analytics.reduce((sum: number, a: any) => sum + a.views, 0),
      likes: item.item_analytics.reduce((sum: number, a: any) => sum + a.likes, 0),
      saves: item.item_analytics.reduce((sum: number, a: any) => sum + a.saves, 0),
      inquiries: item.item_analytics.reduce((sum: number, a: any) => sum + a.inquiries, 0),
      orders: item.item_analytics.reduce((sum: number, a: any) => sum + a.orders, 0),
      revenue: item.item_analytics.reduce((sum: number, a: any) => sum + a.revenue, 0),
      conversionRate:
        item.item_analytics.reduce((sum: number, a: any) => sum + a.views, 0) > 0
          ? (item.item_analytics.reduce((sum: number, a: any) => sum + a.orders, 0) /
              item.item_analytics.reduce((sum: number, a: any) => sum + a.views, 0)) *
            100
          : 0,
      culturalOrigin: item.cultural_origins?.name || "Unknown",
      category: item.categories?.name || "Unknown",
    })) || []
  )
}

export async function getCustomerInsights(sellerId: string): Promise<CustomerInsight[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("customer_insights")
    .select(`
      customer_id,
      total_orders,
      total_spent,
      avg_order_value,
      last_order_date,
      favorite_categories,
      favorite_cultural_origins,
      profiles!customer_insights_customer_id_fkey(
        full_name,
        username
      )
    `)
    .eq("seller_id", sellerId)
    .order("total_spent", { ascending: false })

  if (error) {
    console.error("Error fetching customer insights:", error)
    throw error
  }

  return (
    data?.map((insight: any) => ({
      customerId: insight.customer_id,
      customerName: insight.profiles?.full_name || insight.profiles?.username || "Unknown",
      totalOrders: insight.total_orders,
      totalSpent: insight.total_spent,
      avgOrderValue: insight.avg_order_value,
      lastOrderDate: insight.last_order_date,
      favoriteCategories: insight.favorite_categories || [],
      favoriteCulturalOrigins: insight.favorite_cultural_origins || [],
    })) || []
  )
}

export async function createPromotion(promotion: Omit<Promotion, "id" | "created_at" | "updated_at" | "current_uses">) {
  const supabase = createClient()

  const { data, error } = await supabase.from("promotions").insert(promotion).select().single()

  if (error) {
    console.error("Error creating promotion:", error)
    throw error
  }

  return data
}

export async function getPromotions(sellerId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promotions:", error)
    throw error
  }

  return data
}

export async function createFeaturedListing(
  listing: Omit<FeaturedListing, "id" | "created_at" | "updated_at" | "impressions" | "clicks" | "conversions">,
) {
  const supabase = createClient()

  const { data, error } = await supabase.from("featured_listings").insert(listing).select().single()

  if (error) {
    console.error("Error creating featured listing:", error)
    throw error
  }

  return data
}

export async function getFeaturedListings(sellerId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("featured_listings")
    .select(`
      *,
      items(title, image_url)
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching featured listings:", error)
    throw error
  }

  return data
}

export async function updateItemStatus(itemId: string, status: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("items").update({ status }).eq("id", itemId).select().single()

  if (error) {
    console.error("Error updating item status:", error)
    throw error
  }

  return data
}

export async function getInventoryItems(
  sellerId: string,
  filters?: {
    status?: string
    category?: string
    culturalOrigin?: string
    search?: string
  },
) {
  const supabase = createClient()

  let query = supabase
    .from("items")
    .select(`
      *,
      categories(name),
      cultural_origins(name),
      item_analytics(
        views,
        likes,
        saves,
        orders,
        revenue
      )
    `)
    .eq("seller_id", sellerId)

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.category) {
    query = query.eq("category_id", filters.category)
  }

  if (filters?.culturalOrigin) {
    query = query.eq("cultural_origin_id", filters.culturalOrigin)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inventory items:", error)
    throw error
  }

  return data
}

export async function trackItemView(itemId: string) {
  const supabase = createClient()

  // This would typically be called from a server action or API route
  const { error } = await supabase.rpc("update_item_analytics", {
    item_uuid: itemId,
  })

  if (error) {
    console.error("Error tracking item view:", error)
  }
}
