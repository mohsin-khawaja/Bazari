import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get authenticated user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daysBack = Number.parseInt(searchParams.get("days") || "30")
    const type = searchParams.get("type") || "dashboard"

    switch (type) {
      case "dashboard":
        const { data: dashboardData, error: dashboardError } = await supabase.rpc("get_seller_dashboard_data", {
          seller_uuid: session.user.id,
          days_back: daysBack,
        })

        if (dashboardError) {
          console.error("Dashboard data error:", dashboardError)
          return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
        }

        return NextResponse.json(dashboardData)

      case "items":
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select(`
            id,
            title,
            price,
            image_url,
            status,
            created_at,
            categories(name),
            cultural_origins(name),
            item_analytics(
              views,
              likes,
              saves,
              inquiries,
              orders,
              revenue,
              date
            )
          `)
          .eq("seller_id", session.user.id)
          .gte("item_analytics.date", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })

        if (itemsError) {
          console.error("Items data error:", itemsError)
          return NextResponse.json({ error: "Failed to fetch items data" }, { status: 500 })
        }

        return NextResponse.json(itemsData)

      case "customers":
        const { data: customersData, error: customersError } = await supabase
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
              username,
              avatar_url
            )
          `)
          .eq("seller_id", session.user.id)
          .order("total_spent", { ascending: false })
          .limit(50)

        if (customersError) {
          console.error("Customers data error:", customersError)
          return NextResponse.json({ error: "Failed to fetch customers data" }, { status: 500 })
        }

        return NextResponse.json(customersData)

      case "trends":
        const { data: trendsData, error: trendsError } = await supabase
          .from("seller_analytics")
          .select("date, total_revenue, total_orders, total_views, conversion_rate")
          .eq("seller_id", session.user.id)
          .gte("date", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
          .order("date", { ascending: true })

        if (trendsError) {
          console.error("Trends data error:", trendsError)
          return NextResponse.json({ error: "Failed to fetch trends data" }, { status: 500 })
        }

        return NextResponse.json(trendsData)

      default:
        return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get authenticated user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, itemId, data } = body

    switch (action) {
      case "track_view":
        // Track item view
        const { error: viewError } = await supabase.from("item_analytics").upsert(
          {
            item_id: itemId,
            date: new Date().toISOString().split("T")[0],
            views: 1,
          },
          {
            onConflict: "item_id,date",
            ignoreDuplicates: false,
          },
        )

        if (viewError) {
          console.error("View tracking error:", viewError)
          return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
        }

        return NextResponse.json({ success: true })

      case "track_interaction":
        // Track likes, saves, inquiries
        const updateData: any = {}
        if (data.type === "like") updateData.likes = 1
        if (data.type === "save") updateData.saves = 1
        if (data.type === "inquiry") updateData.inquiries = 1

        const { error: interactionError } = await supabase.from("item_analytics").upsert(
          {
            item_id: itemId,
            date: new Date().toISOString().split("T")[0],
            ...updateData,
          },
          {
            onConflict: "item_id,date",
            ignoreDuplicates: false,
          },
        )

        if (interactionError) {
          console.error("Interaction tracking error:", interactionError)
          return NextResponse.json({ error: "Failed to track interaction" }, { status: 500 })
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Analytics POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
