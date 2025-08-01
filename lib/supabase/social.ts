import { createClient } from "./client"

export async function followUser(followerId: string, followingId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("follows")
    .insert({
      follower_id: followerId,
      following_id: followingId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId)

  if (error) throw error
}

export async function getFollowers(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("follows")
    .select(`
      follower:users!follower_id (
        id,
        username,
        first_name,
        last_name,
        avatar_url,
        bio
      )
    `)
    .eq("following_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data.map((item) => item.follower)
}

export async function getFollowing(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("follows")
    .select(`
      following:users!following_id (
        id,
        username,
        first_name,
        last_name,
        avatar_url,
        bio
      )
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data.map((item) => item.following)
}

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return !!data
}

export async function getUserLikes(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("likes")
    .select(`
      item:items (
        id,
        title,
        price,
        item_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data.map((item) => item.item)
}

export async function getUserSaves(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("saves")
    .select(`
      item:items (
        id,
        title,
        price,
        item_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data.map((item) => item.item)
}

export async function hasLikedItem(userId: string, itemId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("likes").select("id").eq("user_id", userId).eq("item_id", itemId).single()

  if (error && error.code !== "PGRST116") throw error
  return !!data
}

export async function hasSavedItem(userId: string, itemId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("saves").select("id").eq("user_id", userId).eq("item_id", itemId).single()

  if (error && error.code !== "PGRST116") throw error
  return !!data
}
