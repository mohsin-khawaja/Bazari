import { NextResponse } from "next/server"
import { checkAdminAccess, getDashboardStats } from "@/lib/supabase/admin"

export async function GET() {
  try {
    await checkAdminAccess()
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
