import { type NextRequest, NextResponse } from "next/server"
import { getUsers, updateUserStatus, verifyUser } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const verified = searchParams.get("verified")
    const search = searchParams.get("search")

    const filters: any = {}
    if (status && status !== "all") filters.status = status
    if (verified && verified !== "all") filters.verified = verified === "verified"
    if (search) filters.search = search

    const users = await getUsers(page, limit, filters)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, reason } = body

    if (action === "verify_seller" || action === "verify_identity") {
      const verificationType = action.replace("verify_", "")
      await verifyUser(userId, verificationType)
    } else {
      await updateUserStatus(userId, action, reason)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
