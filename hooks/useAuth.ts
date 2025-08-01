"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
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

        setProfile(profile)
      }

      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)

        const { data: profile } = await supabase
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
          .eq("id", session.user.id)
          .single()

        setProfile(profile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}
