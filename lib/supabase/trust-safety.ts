import { createClient } from './client'
import { Database } from './types'

type SupabaseClient = ReturnType<typeof createClient>

// User Verification System
export interface UserVerification {
  id: string
  user_id: string
  verification_type: 'phone' | 'email' | 'government_id' | 'social_media' | 'address'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  verification_data: any
  submitted_at: string
  reviewed_at?: string
  reviewer_id?: string
  notes?: string
}

export async function submitUserVerification(
  userId: string,
  verificationType: UserVerification['verification_type'],
  verificationData: any
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_verifications')
    .insert({
      user_id: userId,
      verification_type: verificationType,
      verification_data: verificationData,
      status: 'pending',
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserVerificationStatus(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

// Content Filtering System
export interface ContentFilter {
  id: string
  content_type: 'image' | 'text' | 'video'
  filter_type: 'inappropriate' | 'cultural_appropriation' | 'fake_item' | 'spam'
  confidence_score: number
  status: 'flagged' | 'approved' | 'rejected'
  metadata: any
}

export async function analyzeImageContent(imageUrl: string, itemId: string) {
  const supabase = createClient()
  
  // Call external AI service for image analysis
  const response = await fetch('/api/trust-safety/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, itemId })
  })
  
  const analysisResult = await response.json()
  
  // Store analysis result
  const { data, error } = await supabase
    .from('content_filters')
    .insert({
      content_type: 'image',
      filter_type: analysisResult.flagType,
      confidence_score: analysisResult.confidence,
      status: analysisResult.confidence > 0.8 ? 'flagged' : 'approved',
      metadata: {
        item_id: itemId,
        image_url: imageUrl,
        analysis: analysisResult
      }
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function analyzeCulturalSensitivity(
  itemTitle: string,
  description: string,
  culturalTags: string[],
  sellerId: string
) {
  const supabase = createClient()
  
  // Get seller's cultural background
  const { data: sellerProfile } = await supabase
    .from('profiles')
    .select('cultural_background')
    .eq('id', sellerId)
    .single()

  // Analyze cultural appropriation risk
  const analysisPayload = {
    itemTitle,
    description,
    culturalTags,
    sellerCulturalBackground: sellerProfile?.cultural_background || []
  }

  const response = await fetch('/api/trust-safety/cultural-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analysisPayload)
  })

  const result = await response.json()
  
  // Store analysis
  const { data, error } = await supabase
    .from('content_filters')
    .insert({
      content_type: 'text',
      filter_type: 'cultural_appropriation',
      confidence_score: result.riskScore,
      status: result.riskScore > 0.7 ? 'flagged' : 'approved',
      metadata: {
        seller_id: sellerId,
        analysis: result,
        cultural_tags: culturalTags
      }
    })
    .select()
    .single()

  return { data, culturalRisk: result }
}

// Fraud Detection System
export interface FraudAlert {
  id: string
  user_id: string
  alert_type: 'suspicious_payment' | 'fake_listing' | 'account_takeover' | 'price_manipulation'
  risk_score: number
  status: 'active' | 'resolved' | 'false_positive'
  metadata: any
  created_at: string
}

export async function analyzePaymentFraud(
  userId: string,
  paymentData: any,
  itemData: any
) {
  const supabase = createClient()
  
  // Get user's payment history
  const { data: paymentHistory } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fraud analysis factors
  const fraudFactors = {
    rapidPurchases: checkRapidPurchases(paymentHistory),
    unusualAmount: checkUnusualAmount(paymentData.amount, paymentHistory),
    newAccount: await checkNewAccountRisk(userId),
    suspiciousLocation: await checkLocationRisk(paymentData.billing_address),
    priceAnomaly: checkPriceAnomaly(paymentData.amount, itemData.market_price)
  }

  const riskScore = calculateFraudRisk(fraudFactors)
  
  if (riskScore > 0.6) {
    const { data, error } = await supabase
      .from('fraud_alerts')
      .insert({
        user_id: userId,
        alert_type: 'suspicious_payment',
        risk_score: riskScore,
        status: 'active',
        metadata: {
          payment_data: paymentData,
          item_data: itemData,
          fraud_factors: fraudFactors
        }
      })
      .select()
      .single()

    return { fraudDetected: true, riskScore, alertId: data?.id }
  }

  return { fraudDetected: false, riskScore }
}

function calculateFraudRisk(factors: any): number {
  let score = 0
  if (factors.rapidPurchases) score += 0.3
  if (factors.unusualAmount) score += 0.2
  if (factors.newAccount) score += 0.15
  if (factors.suspiciousLocation) score += 0.2
  if (factors.priceAnomaly) score += 0.15
  return Math.min(score, 1.0)
}

function checkRapidPurchases(history: any[]): boolean {
  if (!history || history.length < 3) return false
  const recentPurchases = history.slice(0, 3)
  const timeSpan = new Date(recentPurchases[0].created_at).getTime() - 
                   new Date(recentPurchases[2].created_at).getTime()
  return timeSpan < 60000 // Less than 1 minute between 3 purchases
}

function checkUnusualAmount(amount: number, history: any[]): boolean {
  if (!history || history.length === 0) return false
  const avgAmount = history.reduce((sum, order) => sum + order.total_amount, 0) / history.length
  return amount > avgAmount * 5 // 5x higher than average
}

async function checkNewAccountRisk(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single()
  
  if (!data) return true
  const accountAge = Date.now() - new Date(data.created_at).getTime()
  return accountAge < 7 * 24 * 60 * 60 * 1000 // Less than 7 days old
}

async function checkLocationRisk(address: any): Promise<boolean> {
  // Implement geolocation risk analysis
  // This would integrate with fraud detection services
  return false
}

function checkPriceAnomaly(price: number, marketPrice: number): boolean {
  if (!marketPrice) return false
  return price < marketPrice * 0.3 // Suspiciously low price
}

// User Reporting System
export interface UserReport {
  id: string
  reporter_id: string
  reported_user_id?: string
  reported_item_id?: string
  report_type: 'fraud' | 'inappropriate_content' | 'cultural_appropriation' | 'harassment' | 'fake_listing'
  description: string
  evidence_urls: string[]
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  created_at: string
  resolved_at?: string
  resolution?: string
}

export async function submitUserReport(
  reporterId: string,
  reportData: Omit<UserReport, 'id' | 'reporter_id' | 'created_at' | 'status'>
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_reports')
    .insert({
      reporter_id: reporterId,
      ...reportData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  
  // Auto-escalate high-priority reports
  if (reportData.report_type === 'fraud' || reportData.report_type === 'cultural_appropriation') {
    await escalateReport(data.id)
  }
  
  return data
}

async function escalateReport(reportId: string) {
  const supabase = createClient()
  
  await supabase
    .from('user_reports')
    .update({ 
      status: 'investigating',
      metadata: { escalated: true, escalated_at: new Date().toISOString() }
    })
    .eq('id', reportId)
}

// User Blocking System
export async function blockUser(blockerId: string, blockedUserId: string, reason: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_blocks')
    .insert({
      blocker_id: blockerId,
      blocked_user_id: blockedUserId,
      reason,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unblockUser(blockerId: string, blockedUserId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_user_id', blockedUserId)

  if (error) throw error
}

export async function getBlockedUsers(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_blocks')
    .select(`
      *,
      blocked_user:profiles!user_blocks_blocked_user_id_fkey(
        id, username, full_name, avatar_url
      )
    `)
    .eq('blocker_id', userId)

  if (error) throw error
  return data
}

// Dispute Resolution System
export interface Dispute {
  id: string
  order_id: string
  complainant_id: string
  respondent_id: string
  dispute_type: 'item_not_received' | 'item_not_as_described' | 'damaged_item' | 'return_issue'
  status: 'open' | 'investigating' | 'resolved' | 'escalated'
  description: string
  evidence_urls: string[]
  resolution?: string
  created_at: string
  resolved_at?: string
}

export async function createDispute(
  orderId: string,
  complainantId: string,
  disputeData: Omit<Dispute, 'id' | 'order_id' | 'complainant_id' | 'created_at' | 'status'>
) {
  const supabase = createClient()
  
  // Get order details to find respondent
  const { data: order } = await supabase
    .from('orders')
    .select('seller_id')
    .eq('id', orderId)
    .single()

  const { data, error } = await supabase
    .from('disputes')
    .insert({
      order_id: orderId,
      complainant_id: complainantId,
      respondent_id: order?.seller_id,
      ...disputeData,
      status: 'open',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getActiveDisputes(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      order:orders(
        id, item_title, total_amount,
        item:items(title, item_images)
      ),
      complainant:profiles!disputes_complainant_id_fkey(username, full_name),
      respondent:profiles!disputes_respondent_id_fkey(username, full_name)
    `)
    .or(`complainant_id.eq.${userId},respondent_id.eq.${userId}`)
    .neq('status', 'resolved')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}