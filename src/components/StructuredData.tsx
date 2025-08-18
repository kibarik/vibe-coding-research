// src/components/StructuredData.tsx
import { Post } from '@/lib/data-fetching'

interface StructuredDataProps {
  type: 'article' | 'website' | 'organization'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateStructuredData = () => {
    switch (type) {
      case 'article':
        return generateArticleStructuredData(data)
      case 'website':
        return generateWebsiteStructuredData(data)
      case 'organization':
        return generateOrganizationStructuredData(data)
      default:
        return {}
    }
  }

  const structuredData = generateStructuredData()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

function generateArticleStructuredData(post: Post) {
  const wordCount = post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0
  const readingTime = Math.ceil(wordCount / 200) // 200 words per minute

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage?.node?.sourceUrl || post.seo?.opengraphImage?.sourceUrl,
    "author": post.author?.node ? {
      "@type": "Person",
      "name": post.author.node.name,
      "url": `https://vibecodingresearch.com/author/${post.author.node.slug}`
    } : {
      "@type": "Organization",
      "name": "Vibe Coding Research"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Vibe Coding Research",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vibecodingresearch.com/logo.png"
      }
    },
    "datePublished": post.date,
    "dateModified": post.modified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://vibecodingresearch.com/blog/${post.slug}`
    },
    "articleSection": post.categories.nodes[0]?.name,
    "keywords": [
      ...post.categories.nodes.map(cat => cat.name),
      ...post.tags.nodes.map(tag => tag.name)
    ].join(', '),
    "wordCount": wordCount,
    "timeRequired": `PT${readingTime}M`,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", "h3", "p"]
    }
  }
}

function generateWebsiteStructuredData(data: any) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vibe Coding Research",
    "description": "A modern blog built with Next.js and WPGraphQL, featuring the latest insights in coding and technology",
    "url": "https://vibecodingresearch.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vibecodingresearch.com/blog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Vibe Coding Research",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vibecodingresearch.com/logo.png"
      }
    }
  }
}

function generateOrganizationStructuredData(data: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vibe Coding Research",
    "description": "A modern blog built with Next.js and WPGraphQL, featuring the latest insights in coding and technology",
    "url": "https://vibecodingresearch.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://vibecodingresearch.com/logo.png",
      "width": 512,
      "height": 512
    },
    "sameAs": [
      "https://twitter.com/vibecodingresearch",
      "https://github.com/vibecodingresearch",
      "https://linkedin.com/company/vibecodingresearch"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "hello@vibecodingresearch.com"
    },
    "foundingDate": "2024",
    "areaServed": "Worldwide",
    "serviceType": "Blog and Technology Content"
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  }
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

/**
 * Generate HowTo structured data
 */
export function generateHowToStructuredData(data: {
  name: string;
  description: string;
  steps: Array<{ text: string; image?: string }>;
  totalTime?: string;
  tools?: string[];
  materials?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": data.name,
    "description": data.description,
    "totalTime": data.totalTime,
    "tool": data.tools?.map(tool => ({ "@type": "HowToTool", "name": tool })),
    "material": data.materials?.map(material => ({ "@type": "HowToSupply", "name": material })),
    "step": data.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": step.text,
      ...(step.image && { "image": step.image })
    }))
  }
}
