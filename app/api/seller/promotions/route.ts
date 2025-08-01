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
    const type = searchParams.get("type") || "promotions"

    if (type === "promotions") {
      const { data: promotions, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("seller_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Promotions fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 })
      }

      return NextResponse.json(promotions)
    }

    if (type === "featured") {
      const { data: featured, error } = await supabase
        .from("featured_listings")
        .select(`
          *,
          items(
            id,
            title,
            image_url,
            price
          )
        `)
        .eq("seller_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Featured listings fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch featured listings" }, { status: 500 })
      }

      return NextResponse.json(featured)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Promotions GET error:", error)
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
    const { type, ...promotionData } = body

    if (type === "promotion") {
      // Create promotion
      const { data: promotion, error } = await supabase
        .from("promotions")
        .insert({
          ...promotionData,
          seller_id: session.user.id,
          current_uses: 0,
        })
        .select()
        .single()

      if (error) {
        console.error("Promotion creation error:", error)
        return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 })
      }

      return NextResponse.json(promotion)
    }

    if (type === "featured") {
      // Create featured listing
      const { data: featured, error } = await supabase
        .from("featured_listings")
        .insert({
          ...promotionData,
          seller_id: session.user.id,
          impressions: 0,
          clicks: 0,
          conversions: 0,
        })
        .select()
        .single()

      if (error) {
        console.error("Featured listing creation error:", error)
        return NextResponse.json({ error: "Failed to create featured listing" }, { status: 500 })
      }

      return NextResponse.json(featured)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Promotions POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, type, ...updateData } = body

    if (type === "promotion") {
      const { data: promotion, error } = await supabase
        .from("promotions")
        .update(updateData)
        .eq("id", id)
        .eq("seller_id", session.user.id)
        .select()
        .single()

      if (error) {
        console.error("Promotion update error:", error)
        return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 })
      }

      return NextResponse.json(promotion)
    }

    if (type === "featured") {
      const { data: featured, error } = await supabase
        .from("featured_listings")
        .update(updateData)
        .eq("id", id)
        .eq("seller_id", session.user.id)
        .select()
        .single()

      if (error) {
        console.error("Featured listing update error:", error)
        return NextResponse.json({ error: "Failed to update featured listing" }, { status: 500 })
      }

      return NextResponse.json(featured)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Promotions PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get("id")
    const type = searchParams.get("type")

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 })
    }

    if (type === "promotion") {
      const { error } = await supabase.from("promotions").delete().eq("id", id).eq("seller_id", session.user.id)

      if (error) {
        console.error("Promotion deletion error:", error)
        return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (type === "featured") {
      const { error } = await supabase.from("featured_listings").delete().eq("id", id).eq("seller_id", session.user.id)

      if (error) {
        console.error("Featured listing deletion error:", error)
        return NextResponse.json({ error: "Failed to delete featured listing" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Promotions DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
