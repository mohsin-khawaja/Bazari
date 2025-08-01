// Sentry configuration for error tracking and performance monitoring

import * as Sentry from '@sentry/nextjs'
import { config, isProduction, isDevelopment } from '@/config/environments'

// Initialize Sentry
export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Environment configuration
    environment: process.env.NODE_ENV,
    debug: isDevelopment(),
    
    // Performance monitoring
    tracesSampleRate: isProduction() ? 0.1 : 1.0,
    
    // Session replay for debugging
    replaysSessionSampleRate: isProduction() ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out expected errors in development
      if (isDevelopment()) {
        const error = hint.originalException
        
        // Skip network errors in development
        if (error instanceof TypeError && error.message.includes('fetch')) {
          return null
        }
        
        // Skip React hydration warnings
        if (event.message?.includes('hydration')) {
          return null
        }
      }
      
      // Filter out bot/crawler requests
      const userAgent = event.request?.headers?.['user-agent']
      if (userAgent && /bot|crawler|spider/i.test(userAgent)) {
        return null
      }
      
      return event
    },
    
    // Additional configuration
    integrations: [
      new Sentry.BrowserProfilingIntegration(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Tags for better organization
    initialScope: {
      tags: {
        component: 'bazari-marketplace',
        feature: 'cultural-clothing',
      },
    },
  })
}

// Custom error tracking functions
export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('error_context', context)
    }
    Sentry.captureException(error)
  })
}

export function trackUserAction(action: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message: action,
    category: 'user_action',
    data,
    level: 'info',
  })
}

export function trackPerformance(name: string, value: number, unit: string = 'ms') {
  Sentry.setMeasurement(name, value, unit)
}

// Trust & Safety specific tracking
export function trackSecurityEvent(
  event: 'fraud_detected' | 'content_flagged' | 'user_reported' | 'dispute_created',
  data: Record<string, any>
) {
  Sentry.withScope((scope) => {
    scope.setTag('security_event', event)
    scope.setContext('security_data', data)
    scope.setLevel('warning')
    
    Sentry.captureMessage(`Security Event: ${event}`, 'warning')
  })
}

// Cultural sensitivity tracking
export function trackCulturalEvent(
  event: 'appropriation_flagged' | 'cultural_analysis' | 'educational_content_viewed',
  data: Record<string, any>
) {
  Sentry.withScope((scope) => {
    scope.setTag('cultural_event', event)
    scope.setContext('cultural_data', data)
    
    Sentry.captureMessage(`Cultural Event: ${event}`, 'info')
  })
}

// Business metrics tracking
export function trackBusinessMetric(
  metric: 'item_listed' | 'purchase_completed' | 'user_verified' | 'dispute_resolved',
  value: number = 1,
  tags?: Record<string, string>
) {
  Sentry.withScope((scope) => {
    scope.setTag('metric_type', 'business')
    scope.setTag('metric_name', metric)
    
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }
    
    scope.setContext('metric_data', { value, timestamp: new Date().toISOString() })
    
    Sentry.captureMessage(`Business Metric: ${metric}`, 'info')
  })
}

// API route error tracking
export function trackAPIError(
  endpoint: string,
  method: string,
  error: Error,
  statusCode?: number
) {
  Sentry.withScope((scope) => {
    scope.setTag('api_endpoint', endpoint)
    scope.setTag('http_method', method)
    
    if (statusCode) {
      scope.setTag('status_code', statusCode.toString())
    }
    
    scope.setContext('api_context', {
      endpoint,
      method,
      statusCode,
      timestamp: new Date().toISOString(),
    })
    
    Sentry.captureException(error)
  })
}

// Database operation tracking
export function trackDatabaseOperation(
  operation: 'select' | 'insert' | 'update' | 'delete',
  table: string,
  duration: number,
  error?: Error
) {
  Sentry.withScope((scope) => {
    scope.setTag('db_operation', operation)
    scope.setTag('db_table', table)
    scope.setContext('db_context', {
      operation,
      table,
      duration,
      timestamp: new Date().toISOString(),
    })
    
    if (error) {
      scope.setLevel('error')
      Sentry.captureException(error)
    } else {
      // Track slow queries
      if (duration > 1000) {
        scope.setLevel('warning')
        Sentry.captureMessage(`Slow database query: ${operation} on ${table}`, 'warning')
      }
      
      // Track performance metric
      Sentry.setMeasurement(`db.${operation}.${table}`, duration, 'ms')
    }
  })
}

// User identification for better debugging
export function identifyUser(userId: string, userInfo?: Record<string, any>) {
  Sentry.setUser({
    id: userId,
    ...userInfo,
  })
}

// Clear user identification on logout
export function clearUser() {
  Sentry.setUser(null)
}

// Set custom context
export function setContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context)
}

// Add breadcrumb for debugging
export function addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  })
}