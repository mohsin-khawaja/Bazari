import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Health check endpoint for monitoring and load balancers

export async function GET() {
  const startTime = Date.now()
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks: {
      database: false,
      storage: false,
      memory: false,
      dependencies: false
    },
    metrics: {
      responseTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  }

  try {
    // Database health check
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()
    
    health.checks.database = !error
    
    // Storage health check (basic)
    health.checks.storage = true // Assume healthy if no errors
    
    // Memory health check
    const memUsage = process.memoryUsage()
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
    health.checks.memory = memoryUsagePercent < 90
    
    // Dependencies health check
    health.checks.dependencies = true // Basic check - if we got this far, core deps are working
    
    // Calculate response time
    health.metrics.responseTime = Date.now() - startTime
    
    // Determine overall health status
    const allChecksPass = Object.values(health.checks).every(check => check === true)
    health.status = allChecksPass ? 'healthy' : 'unhealthy'
    
    return NextResponse.json(health, {
      status: allChecksPass ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    health.status = 'unhealthy'
    health.checks.database = false
    health.metrics.responseTime = Date.now() - startTime
    
    return NextResponse.json(health, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// HEAD request for simple health check
export async function HEAD() {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()
    
    return new NextResponse(null, {
      status: error ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}