import { Metadata } from 'next'
import { config } from '@/config/environments'

// SEO configuration for cultural clothing marketplace

interface SEOItem {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  cultural_tags: string[]
  condition: string
  seller_name: string
  created_at: string
}

interface SEOPage {
  title?: string
  description?: string
  keywords?: string[]
  images?: string[]
  canonical?: string
  noindex?: boolean
}

// Base metadata for the application
export const baseMetadata: Metadata = {
  title: {
    template: `%s | ${config.app.name}`,
    default: `${config.app.name} - ${config.app.description}`,
  },
  description: config.app.description,
  applicationName: config.app.name,
  authors: [{ name: 'Bazari Team' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'ethnic clothing',
    'cultural fashion',
    'traditional wear',
    'authentic clothing',
    'cultural marketplace',
    'ethnic fashion',
    'traditional clothing',
    'cultural attire',
    'handmade clothing',
    'artisan fashion'
  ],
  creator: 'Bazari',
  publisher: 'Bazari',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(config.app.url),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'es-ES': '/es-ES',
      'fr-FR': '/fr-FR',
      'ar-SA': '/ar-SA',
      'hi-IN': '/hi-IN',
      'zh-CN': '/zh-CN',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: config.app.url,
    siteName: config.app.name,
    title: config.app.name,
    description: config.app.description,
    images: [
      {
        url: `${config.app.url}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${config.app.name} - Authentic ethnic clothing marketplace`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: config.app.name,
    description: config.app.description,
    creator: '@bazari_official',
    images: [`${config.app.url}/images/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

// Generate metadata for item pages
export function generateItemMetadata(item: SEOItem): Metadata {
  const culturalContext = item.cultural_tags.join(', ')
  const title = `${item.title} - Authentic ${culturalContext} Clothing`
  const description = `${item.description.slice(0, 147)}... Shop authentic ${culturalContext} clothing on ${config.app.name}. ${item.condition} condition, $${item.price}.`
  
  return {
    title,
    description,
    keywords: [
      ...item.cultural_tags,
      item.condition,
      'ethnic clothing',
      'cultural fashion',
      'traditional wear',
      item.seller_name,
    ],
    openGraph: {
      title,
      description,
      type: 'product',
      images: item.images.map(image => ({
        url: image,
        width: 800,
        height: 600,
        alt: item.title,
      })),
      siteName: config.app.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [item.images[0]],
    },
    other: {
      'product:price:amount': item.price.toString(),
      'product:price:currency': 'USD',
      'product:availability': 'instock',
      'product:condition': item.condition,
      'product:retailer_item_id': item.id,
    },
  }
}

// Generate metadata for search pages
export function generateSearchMetadata(query?: string, culturalTags?: string[]): Metadata {
  const queryText = query ? ` for "${query}"` : ''
  const culturalContext = culturalTags?.length ? ` - ${culturalTags.join(', ')} Clothing` : ''
  const title = `Search Results${queryText}${culturalContext}`
  const description = `Discover authentic ethnic clothing${queryText}${culturalContext} on ${config.app.name}. Shop traditional wear from diverse cultures.`
  
  return {
    title,
    description,
    keywords: [
      'search ethnic clothing',
      'find traditional wear',
      'cultural fashion search',
      ...(culturalTags || []),
      ...(query ? [query] : []),
    ],
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Generate metadata for cultural category pages
export function generateCategoryMetadata(category: string, description?: string): Metadata {
  const title = `${category} Clothing - Authentic Traditional Wear`
  const metaDescription = description || `Shop authentic ${category} clothing and traditional wear. Discover beautiful cultural fashion from skilled artisans on ${config.app.name}.`
  
  return {
    title,
    description: metaDescription,
    keywords: [
      `${category} clothing`,
      `${category} traditional wear`,
      `${category} fashion`,
      `authentic ${category} attire`,
      'cultural clothing',
      'ethnic fashion',
    ],
    openGraph: {
      title,
      description: metaDescription,
      type: 'website',
    },
  }
}

// Generate metadata for seller profiles
export function generateSellerMetadata(seller: {
  name: string
  bio?: string
  cultural_background: string[]
  total_items: number
}): Metadata {
  const culturalContext = seller.cultural_background.join(', ')
  const title = `${seller.name} - ${culturalContext} Clothing Seller`
  const description = seller.bio || `Shop authentic ${culturalContext} clothing from ${seller.name}. ${seller.total_items} items available on ${config.app.name}.`
  
  return {
    title,
    description,
    keywords: [
      seller.name,
      ...seller.cultural_background,
      'cultural seller',
      'ethnic clothing seller',
      'traditional wear seller',
    ],
  }
}

// Generate structured data for items (JSON-LD)
export function generateItemStructuredData(item: SEOItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.description,
    image: item.images,
    sku: item.id,
    brand: {
      '@type': 'Brand',
      name: item.seller_name,
    },
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: `https://schema.org/${item.condition === 'new' ? 'NewCondition' : 'UsedCondition'}`,
      seller: {
        '@type': 'Person',
        name: item.seller_name,
      },
    },
    category: 'Clothing',
    additionalProperty: item.cultural_tags.map(tag => ({
      '@type': 'PropertyValue',
      name: 'Cultural Origin',
      value: tag,
    })),
    dateCreated: item.created_at,
  }
}

// Generate structured data for the marketplace
export function generateMarketplaceStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: config.app.url,
    name: config.app.name,
    description: config.app.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.app.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://twitter.com/bazari_official',
      'https://facebook.com/bazari',
      'https://instagram.com/bazari_official',
    ],
  }
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${config.app.url}${item.url}`,
    })),
  }
}

// Generate FAQ structured data for cultural education
export function generateCulturalFAQStructuredData() {
  const faqs = [
    {
      question: 'What is cultural appropriation in fashion?',
      answer: 'Cultural appropriation in fashion occurs when elements from one culture are adopted by members of a different cultural group without permission, understanding, or respect, especially when it perpetuates stereotypes or is used for profit without benefiting the originating community.',
    },
    {
      question: 'How can I shop for ethnic clothing respectfully?',
      answer: "Shop respectfully by: learning about the cultural significance of items, buying from sellers who have a connection to the culture, avoiding sacred or ceremonial items unless you're part of that culture, and supporting authentic artisans and businesses.",
    },
    {
      question: 'What should I know before buying traditional clothing?',
      answer: 'Before buying traditional clothing, research its cultural significance, understand appropriate contexts for wearing it, verify authenticity, support legitimate sellers from the culture, and be prepared to handle questions about your choice respectfully.',
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}