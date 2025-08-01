import { createClient } from "./client"

export async function getSalesAnalytics(sellerId: string, period: "week" | "month" | "year" = "month") {
  const supabase = createClient()

  const now = new Date()
  let startDate: Date

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
  }

  // Get sales data
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        item:items(category, cultural_significance)
      )
    `)
    .eq("seller_id", sellerId)
    .eq("status", "paid")
    .gte("created_at", startDate.toISOString())

  if (error) throw error

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Group by date for chart
  const salesByDate = orders.reduce((acc: any, order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0]
    acc[date] = (acc[date] || 0) + order.total_amount
    return acc
  }, {})

  // Category breakdown
  const categoryBreakdown = orders.reduce((acc: any, order) => {
    order.order_items.forEach((item: any) => {
      const category = item.item.category
      acc[category] = (acc[category] || 0) + item.price * item.quantity
    })
    return acc
  }, {})

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    salesByDate,
    categoryBreakdown,
  }
}
