import { createClient } from "./client"
import { createServerClient } from "./server"

export async function signUp(
  email: string,
  password: string,
  userData: {
    username: string
    firstName: string
    lastName: string
    accountType: "buyer" | "seller" | "both"
    culturalBackgrounds?: string[]
  },
) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        account_type: userData.accountType,
      },
    },
  })

  if (error) throw error

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      username: userData.username,
      first_name: userData.firstName,
      last_name: userData.lastName,
      account_type: userData.accountType,
    })

    if (profileError) throw profileError

    // Add cultural preferences if provided
    if (userData.culturalBackgrounds && userData.culturalBackgrounds.length > 0) {
      const { data: culturalOrigins } = await supabase
        .from("cultural_origins")
        .select("id, name")
        .in("name", userData.culturalBackgrounds)

      if (culturalOrigins) {
        const preferences = culturalOrigins.map((origin) => ({
          user_id: data.user!.id,
          cultural_origin_id: origin.id,
        }))

        await supabase.from("user_cultural_preferences").insert(preferences)
      }
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error

  if (!user) return null

  // Get full user profile
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(`
      *,
      user_cultural_preferences (
        cultural_origins (
          id,
          name,
          region
        )
      )
    `)
    .eq("id", user.id)
    .single()

  if (profileError) throw profileError

  return { ...user, profile }
}

export async function updateProfile(
  userId: string,
  updates: {
    username?: string
    first_name?: string
    last_name?: string
    bio?: string
    location?: string
    website?: string
    instagram?: string
    twitter?: string
    facebook?: string
    avatar_url?: string
  },
) {
  const supabase = createClient()

  const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

  if (error) throw error
  return data
}
