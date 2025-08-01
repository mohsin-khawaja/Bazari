import { createClient } from "./client"

export async function getUserAnalytics(userId: string, daysBack = 30) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_user_analytics", {
    user_uuid: userId,
    days_back: daysBack,
  })

  if (error) throw error
  return data
}

export async function trackEvent(eventType: string, eventData?: any, itemId?: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("analytics_events").insert({
    user_id: user?.id || null,
    event_type: eventType,
    event_data: eventData || null,
    item_id: itemId || null,
  })

  if (error) throw error
}

export async function incrementItemViews(itemId: string) {
  const supabase = createClient()

  // Track the view event
  await trackEvent("item_view", { item_id: itemId }, itemId)

  // Increment the views count
  const { error } = await supabase.rpc("increment_item_views", { item_uuid: itemId })

  if (error) throw error
}

export async function getPopularItems(limit = 10, timeframe: "day" | "week" | "month" = "week") {
  const supabase = createClient()

  const dateFilter = new Date()
  switch (timeframe) {
    case "day":
      dateFilter.setDate(dateFilter.getDate() - 1)
      break
    case "week":
      dateFilter.setDate(dateFilter.getDate() - 7)
      break
    case "month":
      dateFilter.setMonth(dateFilter.getMonth() - 1)
      break
  }

  const { data, error } = await supabase
    .from("analytics_events")
    .select(`
      item_id,
      items (
        id,
        title,
        price,
        item_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq("event_type", "item_view")
    .gte("created_at", dateFilter.toISOString())
    .not("item_id", "is", null)

  if (error) throw error

  // Count views per item
  const viewCounts = data.reduce((acc: any, event) => {
    if (event.item_id) {
      acc[event.item_id] = (acc[event.item_id] || 0) + 1
    }
    return acc
  }, {})

  // Sort by view count and return top items
  const sortedItems = Object.entries(viewCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, limit)
    .map(([itemId]) => data.find((event) => event.item_id === itemId)?.items)
    .filter(Boolean)

  return sortedItems
}

export async function getCulturalTrends() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("items")
    .select(`
      cultural_origin_id,
      cultural_origins (
        name,
        region
      )
    `)
    .eq("status", "active")

  if (error) throw error

  // Count items per cultural origin
  const culturalCounts = data.reduce((acc: any, item) => {
    if (item.cultural_origins) {
      const name = item.cultural_origins.name
      acc[name] = (acc[name] || 0) + 1
    }
    return acc
  }, {})

  return Object.entries(culturalCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([name, count]) => ({ name, count }))
}
