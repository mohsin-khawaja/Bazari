import { createClient } from "./client"
import type { Database } from "./types"

type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"]
type VerificationRequest = Database["public"]["Tables"]["verification_requests"]["Row"]
type ModerationItem = Database["public"]["Tables"]["moderation_queue"]["Row"]

export async function checkAdminAccess(permission?: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select(`
      *,
      role:admin_roles(*)
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single()

  if (error || !adminUser) {
    throw new Error("Access denied: Admin privileges required")
  }

  // Check specific permission if provided
  if (permission && !adminUser.role.permissions.all) {
    const [resource, action] = permission.split(":")
    const resourcePerms = adminUser.role.permissions[resource]

    if (!resourcePerms || !resourcePerms.includes(action)) {
      throw new Error(`Access denied: Missing permission ${permission}`)
    }
  }

  return adminUser
}

export async function getDashboardStats() {
  const supabase = createClient()
  await checkAdminAccess()

  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")
  if (error) throw error
  return data
}

export async function getCulturalAnalytics() {
  const supabase = createClient()
  await checkAdminAccess("analytics:view")

  const { data, error } = await supabase.rpc("get_cultural_analytics")
  if (error) throw error
  return data
}

export async function getUsers(page = 1, limit = 20, filters: any = {}) {
  const supabase = createClient()
  await checkAdminAccess("users:view")

  let query = supabase
    .from("users")
    .select(`
      *,
      verification_requests(status, request_type),
      _count:items(count)
    `)
    .range((page - 1) * limit, page * limit - 1)
    .order("created_at", { ascending: false })

  if (filters.verified !== undefined) {
    query = query.eq("seller_verified", filters.verified)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.search) {
    query = query.or(
      `username.ilike.%${filters.search}%,email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%`,
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateUserStatus(userId: string, status: string, reason?: string) {
  const supabase = createClient()
  const admin = await checkAdminAccess("users:edit")

  const { error } = await supabase
    .from("users")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error

  // Log admin action
  await logAdminAction({
    action_type: "user_status_update",
    target_type: "user",
    target_id: userId,
    details: { status, reason },
  })
}

export async function verifyUser(userId: string, verificationType: string) {
  const supabase = createClient()
  const admin = await checkAdminAccess("users:verify")

  const updates: any = { updated_at: new Date().toISOString() }

  if (verificationType === "seller") {
    updates.seller_verified = true
  } else if (verificationType === "identity") {
    updates.identity_verified = true
  }

  const { error } = await supabase.from("users").update(updates).eq("id", userId)

  if (error) throw error

  await logAdminAction({
    action_type: "user_verification",
    target_type: "user",
    target_id: userId,
    details: { verification_type: verificationType },
  })
}

export async function getVerificationRequests(status?: string) {
  const supabase = createClient()
  await checkAdminAccess("users:verify")

  let query = supabase
    .from("verification_requests")
    .select(`
      *,
      user:users(
        id,
        username,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .order("submitted_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function reviewVerificationRequest(
  requestId: string,
  status: "approved" | "rejected" | "needs_info",
  notes?: string,
) {
  const supabase = createClient()
  const admin = await checkAdminAccess("users:verify")

  const { data: request, error: fetchError } = await supabase
    .from("verification_requests")
    .select("*, user:users(*)")
    .eq("id", requestId)
    .single()

  if (fetchError) throw fetchError

  // Update verification request
  const { error: updateError } = await supabase
    .from("verification_requests")
    .update({
      status,
      reviewed_by: admin.user_id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)

  if (updateError) throw updateError

  // If approved, update user verification status
  if (status === "approved") {
    const updates: any = {}
    if (request.request_type === "seller") {
      updates.seller_verified = true
    } else if (request.request_type === "identity") {
      updates.identity_verified = true
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("users").update(updates).eq("id", request.user_id)
    }
  }

  await logAdminAction({
    action_type: "verification_review",
    target_type: "verification_request",
    target_id: requestId,
    details: { status, notes, request_type: request.request_type },
  })
}

export async function getModerationQueue(status?: string) {
  const supabase = createClient()
  await checkAdminAccess("content:moderate")

  let query = supabase
    .from("moderation_queue")
    .select(`
      *,
      flagged_by:users!moderation_queue_flagged_by_fkey(username, first_name),
      assigned_to:users!moderation_queue_assigned_to_fkey(username, first_name)
    `)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function reviewModerationItem(
  itemId: string,
  status: "approved" | "rejected" | "escalated",
  notes?: string,
) {
  const supabase = createClient()
  const admin = await checkAdminAccess("content:moderate")

  const { error } = await supabase
    .from("moderation_queue")
    .update({
      status,
      reviewed_by: admin.user_id,
      reviewed_at: new Date().toISOString(),
      moderator_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)

  if (error) throw error

  await logAdminAction({
    action_type: "moderation_review",
    target_type: "moderation_item",
    target_id: itemId,
    details: { status, notes },
  })
}

export async function getCommunityReports(status?: string) {
  const supabase = createClient()
  await checkAdminAccess("reports:view")

  let query = supabase
    .from("community_reports")
    .select(`
      *,
      reporter:users!community_reports_reporter_id_fkey(username, first_name, avatar_url),
      reported_item:items(title, price),
      reported_user:users!community_reports_reported_user_id_fkey(username, first_name),
      moderator:users!community_reports_moderator_id_fkey(username, first_name)
    `)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function reviewCommunityReport(reportId: string, status: "resolved" | "dismissed", notes?: string) {
  const supabase = createClient()
  const admin = await checkAdminAccess("reports:resolve")

  const { error } = await supabase
    .from("community_reports")
    .update({
      status,
      moderator_id: admin.user_id,
      moderator_notes: notes,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  if (error) throw error

  await logAdminAction({
    action_type: "report_review",
    target_type: "community_report",
    target_id: reportId,
    details: { status, notes },
  })
}

export async function getCulturalFlags(status?: string) {
  const supabase = createClient()
  await checkAdminAccess("cultural_flags:view")

  let query = supabase
    .from("cultural_sensitivity_flags")
    .select(`
      *,
      item:items(title, price, cultural_origin:cultural_origins(name)),
      user:users!cultural_sensitivity_flags_user_id_fkey(username, first_name),
      reviewed_by_user:users!cultural_sensitivity_flags_reviewed_by_fkey(username, first_name)
    `)
    .order("severity", { ascending: false })
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function reviewCulturalFlag(
  flagId: string,
  status: "resolved" | "dismissed" | "escalated",
  notes?: string,
) {
  const supabase = createClient()
  const admin = await checkAdminAccess("cultural_flags:resolve")

  const { error } = await supabase
    .from("cultural_sensitivity_flags")
    .update({
      status,
      reviewed_by: admin.user_id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", flagId)

  if (error) throw error

  await logAdminAction({
    action_type: "cultural_flag_review",
    target_type: "cultural_flag",
    target_id: flagId,
    details: { status, notes },
  })
}

export async function createSiteAnnouncement(announcement: {
  title: string
  content: string
  type: string
  priority: number
  target_audience: string
  show_until?: string
}) {
  const supabase = createClient()
  const admin = await checkAdminAccess("announcements:create")

  const { data, error } = await supabase
    .from("site_announcements")
    .insert({
      ...announcement,
      created_by: admin.user_id,
    })
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    action_type: "announcement_create",
    target_type: "announcement",
    target_id: data.id,
    details: announcement,
  })

  return data
}

export async function getSiteAnnouncements(includeInactive = false) {
  const supabase = createClient()
  await checkAdminAccess("announcements:view")

  let query = supabase
    .from("site_announcements")
    .select(`
      *,
      created_by_user:users!site_announcements_created_by_fkey(username, first_name)
    `)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })

  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

async function logAdminAction(action: {
  action_type: string
  target_type?: string
  target_id?: string
  details?: any
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    ...action,
  })
}

export async function getAdminActions(limit = 50) {
  const supabase = createClient()
  await checkAdminAccess()

  const { data, error } = await supabase
    .from("admin_actions")
    .select(`
      *,
      admin:users!admin_actions_admin_id_fkey(username, first_name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
