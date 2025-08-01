import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzePaymentFraud } from '@/lib/supabase/trust-safety'

export async function POST(request: NextRequest) {
  try {
    const { userId, paymentData, itemData } = await request.json()
    
    const fraudAnalysis = await analyzePaymentFraud(userId, paymentData, itemData)
    
    if (fraudAnalysis.fraudDetected) {
      // Additional security measures
      await triggerSecurityReview(fraudAnalysis.alertId, userId)
    }
    
    return NextResponse.json({
      success: true,
      fraudDetected: fraudAnalysis.fraudDetected,
      riskScore: fraudAnalysis.riskScore,
      alertId: fraudAnalysis.alertId,
      requiresReview: fraudAnalysis.riskScore > 0.8
    })

  } catch (error) {
    console.error('Fraud detection error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze payment for fraud' }, 
      { status: 500 }
    )
  }
}

async function triggerSecurityReview(alertId: string, userId: string) {
  const supabase = createClient()
  
  // Temporarily flag the user account for review
  await supabase
    .from('profiles')
    .update({ 
      security_flags: ['fraud_review'],
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  
  // Notify security team
  await supabase
    .from('admin_notifications')
    .insert({
      type: 'fraud_alert',
      priority: 'high',
      message: `High-risk fraud detected for user ${userId}`,
      metadata: { alert_id: alertId, user_id: userId }
    })
  
  console.log(`Security review triggered for user ${userId}, alert ${alertId}`)
}