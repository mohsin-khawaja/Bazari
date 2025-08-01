import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./types"

export const createClient = () => {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - using mock client for development')
    // Return a mock client for development
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        onAuthStateChange: (callback: any) => {
          // Return a mock subscription that can be unsubscribed
          return {
            data: {
              subscription: {
                unsubscribe: () => console.log('Mock auth state change unsubscribed')
              }
            }
          }
        },
      },
      from: (table: string) => ({
        select: (query?: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
            then: (resolve: any) => resolve({ data: [], error: null }),
          }),
          then: (resolve: any) => resolve({ data: [], error: null }),
          data: [],
          error: null,
        }),
        insert: (values: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: (values: any) => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        }),
      }),
      storage: {
        from: (bucket: string) => ({
          upload: (path: string, file: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
        }),
      },
    } as any
  }
  
  return createClientComponentClient<Database>()
}

export const supabase = createClient()
