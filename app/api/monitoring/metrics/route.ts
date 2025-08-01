import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Prometheus metrics endpoint for application monitoring

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const metrics: string[] = []
    
    // Add timestamp
    const timestamp = Date.now()
    
    // Application uptime
    const uptime = process.uptime()
    metrics.push(`# HELP bazari_uptime_seconds Application uptime in seconds`)
    metrics.push(`# TYPE bazari_uptime_seconds gauge`)
    metrics.push(`bazari_uptime_seconds ${uptime} ${timestamp}`)
    
    // Memory usage
    const memUsage = process.memoryUsage()
    metrics.push(`# HELP bazari_memory_usage_bytes Memory usage in bytes`)
    metrics.push(`# TYPE bazari_memory_usage_bytes gauge`)
    metrics.push(`bazari_memory_usage_bytes{type="rss"} ${memUsage.rss} ${timestamp}`)
    metrics.push(`bazari_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal} ${timestamp}`)
    metrics.push(`bazari_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed} ${timestamp}`)
    metrics.push(`bazari_memory_usage_bytes{type="external"} ${memUsage.external} ${timestamp}`)
    
    // Database metrics
    const { data: itemCount } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
    
    const { data: userCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
    
    const { data: activeItemCount } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
    
    metrics.push(`# HELP bazari_total_items Total number of items`)
    metrics.push(`# TYPE bazari_total_items gauge`)
    metrics.push(`bazari_total_items ${itemCount?.length || 0} ${timestamp}`)
    
    metrics.push(`# HELP bazari_total_users Total number of users`)
    metrics.push(`# TYPE bazari_total_users gauge`)
    metrics.push(`bazari_total_users ${userCount?.length || 0} ${timestamp}`)
    
    metrics.push(`# HELP bazari_active_items Number of active items`)
    metrics.push(`# TYPE bazari_active_items gauge`)
    metrics.push(`bazari_active_items ${activeItemCount?.length || 0} ${timestamp}`)
    
    // Trust & Safety metrics
    const { data: fraudAlerts } = await supabase
      .from('fraud_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
    
    const { data: activeReports } = await supabase
      .from('user_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    const { data: activeDisputes } = await supabase
      .from('disputes')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'resolved')
    
    metrics.push(`# HELP bazari_fraud_alerts_active Active fraud alerts`)
    metrics.push(`# TYPE bazari_fraud_alerts_active gauge`)
    metrics.push(`bazari_fraud_alerts_active ${fraudAlerts?.length || 0} ${timestamp}`)
    
    metrics.push(`# HELP bazari_reports_pending Pending user reports`)
    metrics.push(`# TYPE bazari_reports_pending gauge`)
    metrics.push(`bazari_reports_pending ${activeReports?.length || 0} ${timestamp}`)
    
    metrics.push(`# HELP bazari_disputes_active Active disputes`)
    metrics.push(`# TYPE bazari_disputes_active gauge`)
    metrics.push(`bazari_disputes_active ${activeDisputes?.length || 0} ${timestamp}`)
    
    // Cultural metrics
    const { data: culturalFlags } = await supabase
      .from('cultural_flags')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    metrics.push(`# HELP bazari_cultural_flags_pending Pending cultural sensitivity flags`)
    metrics.push(`# TYPE bazari_cultural_flags_pending gauge`)
    metrics.push(`bazari_cultural_flags_pending ${culturalFlags?.length || 0} ${timestamp}`)
    
    // Performance metrics (if available in global state)
    if (global.performanceMetrics) {
      const perfMetrics = global.performanceMetrics as Record<string, number>
      
      Object.entries(perfMetrics).forEach(([name, value]) => {
        const metricName = `bazari_performance_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        metrics.push(`# HELP ${metricName} Performance metric: ${name}`)
        metrics.push(`# TYPE ${metricName} gauge`)
        metrics.push(`${metricName} ${value} ${timestamp}`)
      })
    }
    
    // API request counters (if available)
    if (global.apiMetrics) {
      const apiMetrics = global.apiMetrics as Record<string, { count: number, errors: number, avgDuration: number }>
      
      Object.entries(apiMetrics).forEach(([endpoint, stats]) => {
        const safeEndpoint = endpoint.replace(/[^a-zA-Z0-9]/g, '_')
        
        metrics.push(`# HELP bazari_api_requests_total Total API requests`)
        metrics.push(`# TYPE bazari_api_requests_total counter`)
        metrics.push(`bazari_api_requests_total{endpoint="${endpoint}"} ${stats.count} ${timestamp}`)
        
        metrics.push(`# HELP bazari_api_errors_total Total API errors`)
        metrics.push(`# TYPE bazari_api_errors_total counter`)
        metrics.push(`bazari_api_errors_total{endpoint="${endpoint}"} ${stats.errors} ${timestamp}`)
        
        metrics.push(`# HELP bazari_api_duration_avg Average API duration`)
        metrics.push(`# TYPE bazari_api_duration_avg gauge`)
        metrics.push(`bazari_api_duration_avg{endpoint="${endpoint}"} ${stats.avgDuration} ${timestamp}`)
      })
    }
    
    // Business metrics
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    
    const { data: todayItems } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today)
    
    const { data: todayUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today)
    
    metrics.push(`# HELP bazari_items_created_today Items created today`)
    metrics.push(`# TYPE bazari_items_created_today gauge`)
    metrics.push(`bazari_items_created_today ${todayItems?.length || 0} ${timestamp}`)
    
    metrics.push(`# HELP bazari_users_registered_today Users registered today`)
    metrics.push(`# TYPE bazari_users_registered_today gauge`)
    metrics.push(`bazari_users_registered_today ${todayUsers?.length || 0} ${timestamp}`)
    
    // Health check metric
    metrics.push(`# HELP bazari_health_status Application health status (1=healthy, 0=unhealthy)`)
    metrics.push(`# TYPE bazari_health_status gauge`)
    metrics.push(`bazari_health_status 1 ${timestamp}`)
    
    return new NextResponse(metrics.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
    
  } catch (error) {
    console.error('Metrics endpoint error:', error)
    
    // Return basic error metric
    const errorMetrics = [
      `# HELP bazari_health_status Application health status (1=healthy, 0=unhealthy)`,
      `# TYPE bazari_health_status gauge`,
      `bazari_health_status 0 ${Date.now()}`,
      `# HELP bazari_metrics_error Metrics collection error`,
      `# TYPE bazari_metrics_error counter`,
      `bazari_metrics_error 1 ${Date.now()}`
    ]
    
    return new NextResponse(errorMetrics.join('\n'), {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  }
}