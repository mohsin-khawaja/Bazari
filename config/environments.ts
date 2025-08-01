// Environment Configuration for Bazari Marketplace

export type Environment = 'development' | 'staging' | 'production'

interface EnvironmentConfig {
  app: {
    name: string
    description: string
    url: string
    version: string
  }
  database: {
    url: string
    poolSize: number
    enableLogging: boolean
  }
  cache: {
    enabled: boolean
    ttl: number
    redisUrl?: string
  }
  storage: {
    provider: 'supabase' | 'aws' | 'cloudinary'
    bucket: string
    cdnUrl?: string
  }
  monitoring: {
    enableErrorTracking: boolean
    enablePerformanceMonitoring: boolean
    enableAnalytics: boolean
  }
  features: {
    fraudDetection: boolean
    culturalAnalysis: boolean
    contentModeration: boolean
    realTimeChat: boolean
    pushNotifications: boolean
  }
  security: {
    rateLimitMax: number
    rateLimitWindow: number
    corsOrigins: string[]
    enableCSP: boolean
  }
  performance: {
    enableImageOptimization: boolean
    enableLazyLoading: boolean
    enableCaching: boolean
    maxImageSize: number
  }
}

const baseConfig: Partial<EnvironmentConfig> = {
  app: {
    name: 'Bazari',
    description: 'Authentic ethnic clothing marketplace promoting cultural diversity',
    version: process.env.npm_package_version || '1.0.0'
  },
  features: {
    fraudDetection: true,
    culturalAnalysis: true,
    contentModeration: true,
    realTimeChat: true,
    pushNotifications: true
  }
}

const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    ...baseConfig,
    app: {
      ...baseConfig.app!,
      url: 'http://localhost:3000'
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      poolSize: 5,
      enableLogging: true
    },
    cache: {
      enabled: false,
      ttl: 300
    },
    storage: {
      provider: 'supabase',
      bucket: 'dev-item-images'
    },
    monitoring: {
      enableErrorTracking: false,
      enablePerformanceMonitoring: false,
      enableAnalytics: false
    },
    security: {
      rateLimitMax: 1000,
      rateLimitWindow: 60000,
      corsOrigins: ['http://localhost:3000', 'http://localhost:3001'],
      enableCSP: false
    },
    performance: {
      enableImageOptimization: true,
      enableLazyLoading: true,
      enableCaching: false,
      maxImageSize: 10 * 1024 * 1024 // 10MB
    }
  },

  staging: {
    ...baseConfig,
    app: {
      ...baseConfig.app!,
      url: 'https://staging.bazari.com'
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      poolSize: 10,
      enableLogging: true
    },
    cache: {
      enabled: true,
      ttl: 600,
      redisUrl: process.env.REDIS_URL
    },
    storage: {
      provider: 'supabase',
      bucket: 'staging-item-images',
      cdnUrl: 'https://cdn-staging.bazari.com'
    },
    monitoring: {
      enableErrorTracking: true,
      enablePerformanceMonitoring: true,
      enableAnalytics: false
    },
    security: {
      rateLimitMax: 500,
      rateLimitWindow: 60000,
      corsOrigins: ['https://staging.bazari.com'],
      enableCSP: true
    },
    performance: {
      enableImageOptimization: true,
      enableLazyLoading: true,
      enableCaching: true,
      maxImageSize: 8 * 1024 * 1024 // 8MB
    }
  },

  production: {
    ...baseConfig,
    app: {
      ...baseConfig.app!,
      url: 'https://bazari.com'
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      poolSize: 20,
      enableLogging: false
    },
    cache: {
      enabled: true,
      ttl: 1800,
      redisUrl: process.env.REDIS_URL
    },
    storage: {
      provider: 'supabase',
      bucket: 'prod-item-images',
      cdnUrl: 'https://cdn.bazari.com'
    },
    monitoring: {
      enableErrorTracking: true,
      enablePerformanceMonitoring: true,
      enableAnalytics: true
    },
    security: {
      rateLimitMax: 100,
      rateLimitWindow: 60000,
      corsOrigins: ['https://bazari.com', 'https://www.bazari.com'],
      enableCSP: true
    },
    performance: {
      enableImageOptimization: true,
      enableLazyLoading: true,
      enableCaching: true,
      maxImageSize: 5 * 1024 * 1024 // 5MB
    }
  }
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = (process.env.NODE_ENV as Environment) || 'development'
  return environments[env]
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isStaging(): boolean {
  return process.env.NODE_ENV === 'staging'
}

// Environment-specific feature flags
export const featureFlags = {
  enableBetaFeatures: !isProduction(),
  enableDetailedLogging: isDevelopment(),
  enablePerformanceDebugging: isDevelopment() || isStaging(),
  enableExperimentalAI: isStaging(),
  strictContentModeration: isProduction(),
  enableAdvancedAnalytics: isProduction() || isStaging()
}

// Export current environment config
export const config = getEnvironmentConfig()