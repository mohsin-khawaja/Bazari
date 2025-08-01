import { createRouteHandlerServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerServerClient()
  const { searchParams } = new URL(request.url)

  try {
    const { data, error } = await supabase.rpc("search_items", {
      search_query: searchParams.get("search") || null,
      category_filter: searchParams.get("category") || null,
      cultural_origin_filter: searchParams.get("cultural_origin") || null,
      min_price: searchParams.get("min_price") ? Number.parseFloat(searchParams.get("min_price")!) : null,
      max_price: searchParams.get("max_price") ? Number.parseFloat(searchParams.get("max_price")!) : null,
      condition_filter: searchParams.get("condition") || null,
      gender_filter: searchParams.get("gender") || null,
      size_filter: searchParams.get("size") || null,
      color_filter: searchParams.get("color") || null,
      on_sale_filter: searchParams.get("on_sale") === "true" ? true : null,
      free_shipping_filter: searchParams.get("free_shipping") === "true" ? true : null,
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: searchParams.get("sort_order") || "DESC",
      page_limit: Number.parseInt(searchParams.get("limit") || "20"),
      page_offset: Number.parseInt(searchParams.get("offset") || "0"),
    })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { item, images } = body

    // Insert item
    const { data: newItem, error: itemError } = await supabase
      .from("items")
      .insert({
        ...item,
        seller_id: user.id,
      })
      .select()
      .single()

    if (itemError) throw itemError

    // Insert images if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((url: string, index: number) => ({
        item_id: newItem.id,
        image_url: url,
        display_order: index,
        is_primary: index === 0,
      }))

      const { error: imagesError } = await supabase.from("item_images").insert(imageInserts)

      if (imagesError) throw imagesError
    }

    return NextResponse.json({ data: newItem, success: true })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item", success: false }, { status: 500 })
  }
}
