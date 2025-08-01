import { createClient } from "./client"
import type { Database } from "./types"

type ItemReview = Database["public"]["Tables"]["item_reviews"]["Row"]
type ItemReviewInsert = Database["public"]["Tables"]["item_reviews"]["Insert"]
type UserTestimonial = Database["public"]["Tables"]["user_testimonials"]["Row"]

export async function createItemReview(review: Omit<ItemReviewInsert, "reviewer_id">) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if user has purchased this item
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("item_id", review.item_id)
    .eq("status", "delivered")
    .single()

  const { data, error } = await supabase
    .from("item_reviews")
    .insert({
      ...review,
      reviewer_id: user.id,
      verified_purchase: !!order,
      order_id: order?.id || null,
    })
    .select(`
      *,
      reviewer:users!item_reviews_reviewer_id_fkey(
        id,
        username,
        first_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}

export async function getItemReviews(itemId: string, limit = 10, offset = 0) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("item_reviews")
    .select(`
      *,
      reviewer:users!item_reviews_reviewer_id_fkey(
        id,
        username,
        first_name,
        avatar_url
      )
    `)
    .eq("item_id", itemId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getUserReviews(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("item_reviews")
    .select(`
      *,
      item:items!item_reviews_item_id_fkey(
        id,
        title,
        price,
        item_images(image_url, is_primary)
      )
    `)
    .eq("reviewer_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function markReviewHelpful(reviewId: string, isHelpful: boolean) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("review_helpfulness").upsert({
    review_id: reviewId,
    user_id: user.id,
    is_helpful: isHelpful,
  })

  if (error) throw error
}

export async function createUserTestimonial(
  testimonial: Omit<Database["public"]["Tables"]["user_testimonials"]["Insert"], "author_id">,
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("user_testimonials")
    .insert({
      ...testimonial,
      author_id: user.id,
    })
    .select(`
      *,
      author:users!user_testimonials_author_id_fkey(
        id,
        username,
        first_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}

export async function getUserTestimonials(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_testimonials")
    .select(`
      *,
      author:users!user_testimonials_author_id_fkey(
        id,
        username,
        first_name,
        avatar_url
      )
    `)
    .eq("user_id", userId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function reportContent(report: {
  type: "item" | "user" | "review"
  targetId: string
  reportType: string
  reason: string
  description?: string
  evidenceUrls?: string[]
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const reportData: any = {
    reporter_id: user.id,
    report_type: report.reportType,
    reason: report.reason,
    description: report.description,
    evidence_urls: report.evidenceUrls,
  }

  // Set the appropriate foreign key based on report type
  if (report.type === "item") {
    reportData.reported_item_id = report.targetId
  } else if (report.type === "user") {
    reportData.reported_user_id = report.targetId
  } else if (report.type === "review") {
    reportData.reported_review_id = report.targetId
  }

  const { data, error } = await supabase.from("community_reports").insert(reportData).select().single()

  if (error) throw error
  return data
}

export async function flagCulturalSensitivity(flag: {
  type: "item" | "user" | "review"
  targetId: string
  flagType: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const flagData: any = {
    flag_type: flag.flagType,
    description: flag.description,
    severity: flag.severity,
  }

  // Set the appropriate foreign key based on flag type
  if (flag.type === "item") {
    flagData.item_id = flag.targetId
  } else if (flag.type === "user") {
    flagData.user_id = flag.targetId
  } else if (flag.type === "review") {
    flagData.review_id = flag.targetId
  }

  const { data, error } = await supabase.from("cultural_sensitivity_flags").insert(flagData).select().single()

  if (error) throw error
  return data
}

export async function acknowledgeCulturalGuidelines(version = "1.0") {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("cultural_guidelines_acknowledgments").upsert({
    user_id: user.id,
    guideline_version: version,
  })

  if (error) throw error
}

export async function trackSocialShare(itemId: string, platform: string, shareUrl: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("social_shares").insert({
    item_id: itemId,
    user_id: user?.id || null,
    platform,
    share_url: shareUrl,
  })

  if (error) throw error
}
