// Performance monitoring and optimization utilities

import { config } from '@/config/environments'
import { trackPerformance } from './sentry'

// Performance observer for monitoring Core Web Vitals
export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null
  private metrics: Map<string, number> = new Map()

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver()
    }
  }

  private initializeObserver() {
    try {
      // Monitor Core Web Vitals
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry)
        }
      })

      // Observe different types of performance entries
      this.observer.observe({ type: 'navigation', buffered: true })
      this.observer.observe({ type: 'paint', buffered: true })
      this.observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observer.observe({ type: 'first-input', buffered: true })
      this.observer.observe({ type: 'layout-shift', buffered: true })

    } catch (error) {
      console.warn('Performance monitoring not supported:', error)
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry) {
    const name = entry.name
    const value = entry.startTime

    // Track different types of performance metrics
    switch (entry.entryType) {
      case 'navigation':
        this.trackNavigationTiming(entry as PerformanceNavigationTiming)
        break
      
      case 'paint':
        if (name === 'first-paint') {
          this.recordMetric('FP', value)
        } else if (name === 'first-contentful-paint') {
          this.recordMetric('FCP', value)
        }
        break
      
      case 'largest-contentful-paint':
        this.recordMetric('LCP', value)
        break
      
      case 'first-input':
        this.recordMetric('FID', (entry as any).processingStart - entry.startTime)
        break
      
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.recordMetric('CLS', (entry as any).value)
        }
        break
    }
  }

  private trackNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      'DNS': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP': entry.connectEnd - entry.connectStart,
      'SSL': entry.connectEnd - entry.secureConnectionStart,
      'TTFB': entry.responseStart - entry.requestStart,
      'Download': entry.responseEnd - entry.responseStart,
      'DOMContentLoaded': entry.domContentLoadedEventEnd - entry.navigationStart,
      'Load': entry.loadEventEnd - entry.navigationStart
    }

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordMetric(name, value)
      }
    })
  }

  private recordMetric(name: string, value: number) {
    this.metrics.set(name, value)
    
    // Send to monitoring service
    if (config.monitoring.enablePerformanceMonitoring) {
      trackPerformance(name, value)
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} = ${value.toFixed(2)}ms`)
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Resource loading performance tracker
export class ResourceTracker {
  private loadTimes: Map<string, number> = new Map()

  trackImageLoad(src: string, startTime: number) {
    const loadTime = performance.now() - startTime
    this.loadTimes.set(`image:${src}`, loadTime)
    
    if (config.monitoring.enablePerformanceMonitoring) {
      trackPerformance('image_load_time', loadTime)
    }
  }

  trackAPICall(endpoint: string, method: string, duration: number, success: boolean) {
    const metricName = `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
    
    if (config.monitoring.enablePerformanceMonitoring) {
      trackPerformance(metricName, duration)
    }

    // Track slow API calls
    if (duration > 2000) {
      console.warn(`Slow API call: ${method} ${endpoint} took ${duration}ms`)
    }

    // Track API errors
    if (!success) {
      console.error(`API error: ${method} ${endpoint}`)
    }
  }

  trackPageLoad(pageName: string, loadTime: number) {
    if (config.monitoring.enablePerformanceMonitoring) {
      trackPerformance(`page_load_${pageName}`, loadTime)
    }
  }

  getResourceMetrics(): Record<string, number> {
    return Object.fromEntries(this.loadTimes)
  }
}

// Database query performance tracker
export class DatabaseTracker {
  trackQuery(
    operation: 'select' | 'insert' | 'update' | 'delete',
    table: string,
    duration: number,
    recordCount?: number
  ) {
    const metricName = `db_${operation}_${table}`
    
    if (config.monitoring.enablePerformanceMonitoring) {
      trackPerformance(metricName, duration)
    }

    // Alert on slow queries
    if (duration > 1000) {
      console.warn(`Slow database query: ${operation} on ${table} took ${duration}ms`)
    }

    // Track query efficiency
    if (recordCount !== undefined && recordCount > 0) {
      const timePerRecord = duration / recordCount
      trackPerformance(`${metricName}_per_record`, timePerRecord)
    }
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  private measurements: Array<{ timestamp: number; usage: MemoryInfo }> = []

  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory as MemoryInfo
      const measurement = {
        timestamp: Date.now(),
        usage: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }
      }

      this.measurements.push(measurement)

      // Keep only last 100 measurements
      if (this.measurements.length > 100) {
        this.measurements.shift()
      }

      // Alert on high memory usage
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      if (usagePercent > 80) {
        console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`)
      }

      return measurement
    }

    return null
  }

  getMemoryTrend(): Array<{ timestamp: number; usage: MemoryInfo }> {
    return this.measurements.slice()
  }
}

// Create global instances
export const performanceMonitor = new PerformanceMonitor()
export const resourceTracker = new ResourceTracker()
export const databaseTracker = new DatabaseTracker()
export const memoryMonitor = new MemoryMonitor()

// Utility functions for performance measurement
export function measureAsync<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  return fn().then(
    (result) => {
      const duration = performance.now() - start
      trackPerformance(name, duration)
      return result
    },
    (error) => {
      const duration = performance.now() - start
      trackPerformance(`${name}_error`, duration)
      throw error
    }
  )
}

export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now()
  
  try {
    const result = fn()
    const duration = performance.now() - start
    trackPerformance(name, duration)
    return result
  } catch (error) {
    const duration = performance.now() - start
    trackPerformance(`${name}_error`, duration)
    throw error
  }
}

// Hook for React components to measure render performance
export function usePerfProfiler(componentName: string) {
  const startTime = performance.now()
  
  return {
    onRender: () => {
      const renderTime = performance.now() - startTime
      trackPerformance(`component_render_${componentName}`, renderTime)
    }
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible')
      } else {
        console.log('Page became hidden')
      }
    })

    // Monitor memory usage periodically
    setInterval(() => {
      memoryMonitor.measureMemoryUsage()
    }, 30000) // Every 30 seconds

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      performanceMonitor.disconnect()
    })
  }
}