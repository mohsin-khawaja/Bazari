import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { itemTitle, description, culturalTags, sellerCulturalBackground } = await request.json()
    
    const analysis = await analyzeCulturalSensitivity({
      itemTitle,
      description,
      culturalTags,
      sellerCulturalBackground
    })
    
    return NextResponse.json({
      success: true,
      riskScore: analysis.riskScore,
      flags: analysis.flags,
      recommendations: analysis.recommendations
    })

  } catch (error) {
    console.error('Cultural analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze cultural sensitivity' }, 
      { status: 500 }
    )
  }
}

async function analyzeCulturalSensitivity({
  itemTitle,
  description,
  culturalTags,
  sellerCulturalBackground
}: {
  itemTitle: string
  description: string
  culturalTags: string[]
  sellerCulturalBackground: string[]
}) {
  let riskScore = 0
  const flags: string[] = []
  const recommendations: string[] = []

  // Check if seller has connection to the cultural origin
  const hasConnection = culturalTags.some(tag => 
    sellerCulturalBackground.some(bg => 
      bg.toLowerCase().includes(tag.toLowerCase()) || 
      tag.toLowerCase().includes(bg.toLowerCase())
    )
  )

  if (!hasConnection && culturalTags.length > 0) {
    riskScore += 0.4
    flags.push('Seller may not have direct cultural connection')
    recommendations.push('Consider adding information about your connection to this cultural tradition')
  }

  // Check for sacred or ceremonial items
  const sacredTerms = [
    'sacred', 'ceremonial', 'ritual', 'religious', 'spiritual',
    'blessed', 'consecrated', 'holy', 'temple', 'shrine'
  ]
  
  const containsSacredTerms = sacredTerms.some(term => 
    itemTitle.toLowerCase().includes(term) || 
    description.toLowerCase().includes(term)
  )

  if (containsSacredTerms) {
    riskScore += 0.6
    flags.push('Item may have sacred or ceremonial significance')
    recommendations.push('Please verify this item is appropriate for sale')
    recommendations.push('Consider consulting with cultural authorities')
  }

  // Check for mass-produced vs authentic indicators
  const massProducedIndicators = [
    'factory made', 'machine made', 'bulk', 'wholesale',
    'mass produced', 'imported', 'replica', 'inspired by'
  ]

  const authenticityIndicators = [
    'handmade', 'artisan', 'traditional', 'authentic', 
    'vintage', 'heirloom', 'original', 'crafted by'
  ]

  const hasMassProducedTerms = massProducedIndicators.some(term =>
    itemTitle.toLowerCase().includes(term) || 
    description.toLowerCase().includes(term)
  )

  const hasAuthenticityTerms = authenticityIndicators.some(term =>
    itemTitle.toLowerCase().includes(term) || 
    description.toLowerCase().includes(term)
  )

  if (hasMassProducedTerms && !hasAuthenticityTerms) {
    riskScore += 0.3
    flags.push('Item appears to be mass-produced')
    recommendations.push('Consider clarifying the authenticity and origin of the item')
  }

  // Price anomaly detection for cultural items
  // This would integrate with market price data
  
  return {
    riskScore: Math.min(riskScore, 1.0),
    flags,
    recommendations,
    analysis: {
      hasConnection,
      containsSacredTerms,
      hasMassProducedTerms,
      hasAuthenticityTerms
    }
  }
}