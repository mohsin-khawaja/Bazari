import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitUserReport } from '@/lib/supabase/trust-safety'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reportData = await request.json()
    
    // Submit the report
    const report = await submitUserReport(user.id, reportData)
    
    // Send notification to moderators if it's a high-priority report
    if (['fraud', 'cultural_appropriation', 'harassment'].includes(reportData.report_type)) {
      await notifyModerators(report)
    }
    
    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully'
    })

  } catch (error) {
    console.error('Report submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's reports
    const { data: reports, error } = await supabase
      .from('user_reports')
      .select(`
        *,
        reported_user:profiles!user_reports_reported_user_id_fkey(username, full_name),
        reported_item:items(title, item_images)
      `)
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reports })

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

async function notifyModerators(report: any) {
  // Implementation would send notifications to moderators
  // This could integrate with email service, Slack, or in-app notifications
  
  console.log(`High-priority report submitted: ${report.id}`)
  console.log(`Type: ${report.report_type}`)
  console.log(`Reporter: ${report.reporter_id}`)
  
  // Example: Send to moderation queue
  const supabase = createClient()
  
  await supabase
    .from('moderation_queue')
    .insert({
      item_type: 'user_report',
      item_id: report.id,
      priority: 'high',
      status: 'pending',
      assigned_to: null,
      metadata: {
        report_type: report.report_type,
        reporter_id: report.reporter_id
      }
    })
}