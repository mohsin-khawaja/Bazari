import { createClient } from "./client"
import type { Database } from "./types"

type CulturalContext = Database["public"]["Tables"]["cultural_contexts"]["Row"]
type CulturalTerm = Database["public"]["Tables"]["cultural_terms"]["Row"]
type Artisan = Database["public"]["Tables"]["artisans"]["Row"]
type CulturalEvent = Database["public"]["Tables"]["cultural_events"]["Row"]
type EducationModule = Database["public"]["Tables"]["education_modules"]["Row"]

export async function getItemCulturalContext(itemId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_item_cultural_context", {
    item_id_param: itemId,
  })

  if (error) throw error
  return data?.[0] || null
}

export async function getCulturalTerms(culturalOriginId?: string, category?: string) {
  const supabase = createClient()

  let query = supabase
    .from("cultural_terms")
    .select(`
      *,
      cultural_origin:cultural_origins(name)
    `)
    .order("term")

  if (culturalOriginId) {
    query = query.eq("cultural_origin_id", culturalOriginId)
  }

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function searchCulturalTerms(searchTerm: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("cultural_terms")
    .select(`
      *,
      cultural_origin:cultural_origins(name)
    `)
    .or(`term.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%`)
    .order("term")
    .limit(10)

  if (error) throw error
  return data
}

export async function getArtisans(culturalBackground?: string) {
  const supabase = createClient()

  let query = supabase.from("artisans").select("*").eq("is_verified", true).order("name")

  if (culturalBackground) {
    query = query.eq("cultural_background", culturalBackground)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getArtisanById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("artisans").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function getItemArtisans(itemId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("item_artisans")
    .select(`
      *,
      artisan:artisans(*)
    `)
    .eq("item_id", itemId)

  if (error) throw error
  return data
}

export async function getUpcomingCulturalEvents(daysAhead = 30) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_upcoming_cultural_events", {
    days_ahead: daysAhead,
  })

  if (error) throw error
  return data
}

export async function getCulturalEventsByOrigin(culturalOriginId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("cultural_events")
    .select(`
      *,
      cultural_origin:cultural_origins(name)
    `)
    .eq("cultural_origin_id", culturalOriginId)
    .gte("start_date", new Date().toISOString().split("T")[0])
    .order("start_date")

  if (error) throw error
  return data
}

export async function getCulturalGuidelines(culturalOriginId?: string, itemCategory?: string) {
  const supabase = createClient()

  let query = supabase
    .from("cultural_guidelines")
    .select(`
      *,
      cultural_origin:cultural_origins(name)
    `)
    .order("severity", { ascending: false })

  if (culturalOriginId) {
    query = query.eq("cultural_origin_id", culturalOriginId)
  }

  if (itemCategory) {
    query = query.eq("item_category", itemCategory)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getEducationModules(culturalOriginId?: string, moduleType?: string) {
  const supabase = createClient()

  let query = supabase
    .from("education_modules")
    .select(`
      *,
      cultural_origin:cultural_origins(name)
    `)
    .eq("is_published", true)
    .order("difficulty_level", { ascending: true })

  if (culturalOriginId) {
    query = query.eq("cultural_origin_id", culturalOriginId)
  }

  if (moduleType) {
    query = query.eq("module_type", moduleType)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getUserEducationProgress(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_education_progress")
    .select(`
      *,
      cultural_origin:cultural_origins(name)
    `)
    .eq("user_id", userId)

  if (error) throw error
  return data
}

export async function updateEducationProgress(
  userId: string,
  culturalOriginId: string,
  moduleId: string,
  quizScore?: number,
) {
  const supabase = createClient()

  // Get existing progress
  const { data: existing } = await supabase
    .from("user_education_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("cultural_origin_id", culturalOriginId)
    .single()

  const completedModules = existing?.completed_modules || []
  const quizScores = existing?.quiz_scores || {}

  // Add module to completed if not already there
  if (!completedModules.includes(moduleId)) {
    completedModules.push(moduleId)
  }

  // Update quiz score if provided
  if (quizScore !== undefined) {
    quizScores[moduleId] = quizScore
  }

  const { data, error } = await supabase
    .from("user_education_progress")
    .upsert({
      user_id: userId,
      cultural_origin_id: culturalOriginId,
      completed_modules: completedModules,
      quiz_scores: quizScores,
      last_activity: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createCulturalContext(context: Omit<CulturalContext, "id" | "created_at" | "updated_at">) {
  const supabase = createClient()

  const { data, error } = await supabase.from("cultural_contexts").insert(context).select().single()

  if (error) throw error
  return data
}

export async function reportCulturalMisrepresentation(report: {
  itemId: string
  issueType: string
  description: string
  suggestedCorrection?: string
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("community_reports")
    .insert({
      reporter_id: user.id,
      reported_item_id: report.itemId,
      report_type: "cultural_misrepresentation",
      reason: report.issueType,
      description: report.description,
      metadata: { suggested_correction: report.suggestedCorrection },
    })
    .select()
    .single()

  if (error) throw error
  return data
}
