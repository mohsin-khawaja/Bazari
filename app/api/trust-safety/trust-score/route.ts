import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or calculate trust score
    let { data: trustScore, error } = await supabase
      .from('trust_scores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Trust score doesn't exist, calculate it
      const { data: calculatedScore, error: calcError } = await supabase
        .rpc('calculate_trust_score', { user_uuid: user.id })

      if (calcError) {
        return NextResponse.json({ error: calcError.message }, { status: 400 })
      }

      // Fetch the newly created trust score
      const { data: newTrustScore, error: fetchError } = await supabase
        .from('trust_scores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 400 })
      }

      trustScore = newTrustScore
    }

    return NextResponse.json({ trustScore })

  } catch (error) {
    console.error('Trust score error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trust score' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Recalculate trust score
    const { data: newScore, error } = await supabase
      .rpc('calculate_trust_score', { user_uuid: user.id })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      newScore,
      message: 'Trust score recalculated' 
    })

  } catch (error) {
    console.error('Trust score recalculation error:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate trust score' },
      { status: 500 }
    )
  }
}