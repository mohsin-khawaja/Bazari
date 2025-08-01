import { NextResponse } from 'next/server'
import { config } from '@/config/environments'

export async function GET() {
  const baseUrl = config.app.url
  const isProduction = process.env.NODE_ENV === 'production'

  const robots = `# Robots.txt for ${config.app.name}
# ${config.app.description}

User-agent: *
${isProduction ? 'Allow: /' : 'Disallow: /'}

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Specific rules for crawlers
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Block access to sensitive areas
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /_next/
Disallow: /trust-safety/

# Block access to user-specific pages
Disallow: /profile/edit
Disallow: /messages/
Disallow: /orders/

# Allow cultural education and guidelines
Allow: /cultural-education
Allow: /community-guidelines

# Block development and staging environments from production crawlers
${!isProduction ? `
# Development/Staging Environment
User-agent: *
Disallow: /
` : ''}

# Additional crawler instructions
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# Block problematic crawlers
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
}