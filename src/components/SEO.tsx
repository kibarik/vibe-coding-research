// src/components/SEO.tsx
import Head from 'next/head'
import StructuredData from './StructuredData'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    type?: string
    url?: string
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
    siteName?: string
    locale?: string
  }
  twitter?: {
    card?: string
    site?: string
    creator?: string
    title?: string
    description?: string
    images?: string[]
  }
  additionalMetaTags?: Array<{
    name: string
    content: string
  }>
  additionalLinkTags?: Array<{
    rel: string
    href: string
    type?: string
    sizes?: string
  }>
  structuredData?: any
  noindex?: boolean
  nofollow?: boolean
}

export default function SEO({
  title,
  description,
  canonical,
  openGraph,
  twitter,
  additionalMetaTags = [],
  additionalLinkTags = [],
  structuredData,
  noindex = false,
  nofollow = false,
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecodingresearch.com'
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex" />}
      {nofollow && <meta name="robots" content="nofollow" />}
      {!noindex && !nofollow && <meta name="robots" content="index, follow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={openGraph?.title || title} />
      <meta property="og:description" content={openGraph?.description || description} />
      <meta property="og:type" content={openGraph?.type || 'website'} />
      <meta property="og:url" content={openGraph?.url || fullCanonical} />
      <meta property="og:site_name" content={openGraph?.siteName || 'Vibe Coding Research'} />
      <meta property="og:locale" content={openGraph?.locale || 'en_US'} />
      
      {openGraph?.images?.map((image, index) => (
        <meta key={index} property="og:image" content={image.url} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitter?.card || 'summary_large_image'} />
      {twitter?.site && <meta name="twitter:site" content={twitter.site} />}
      {twitter?.creator && <meta name="twitter:creator" content={twitter.creator} />}
      <meta name="twitter:title" content={twitter?.title || title} />
      <meta name="twitter:description" content={twitter?.description || description} />
      {twitter?.images?.map((image, index) => (
        <meta key={index} name="twitter:image" content={image} />
      ))}
      
      {/* Additional Meta Tags */}
      {additionalMetaTags.map((tag, index) => (
        <meta key={index} name={tag.name} content={tag.content} />
      ))}
      
      {/* Additional Link Tags */}
      {additionalLinkTags.map((tag, index) => (
        <link key={index} rel={tag.rel} href={tag.href} {...(tag.type && { type: tag.type })} {...(tag.sizes && { sizes: tag.sizes })} />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2)
          }}
        />
      )}
      
      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Head>
  )
}

/**
 * SEO component for blog posts
 */
interface BlogPostSEOProps {
  post: any
  structuredData?: any
}

export function BlogPostSEO({ post, structuredData }: BlogPostSEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecodingresearch.com'
  const canonical = `/blog/${post.slug}`
  
  const openGraph = {
    title: post.seo?.opengraphTitle || post.title,
    description: post.seo?.opengraphDescription || post.excerpt,
    type: 'article',
    url: `${siteUrl}${canonical}`,
    images: post.featuredImage?.node?.sourceUrl ? [{
      url: post.featuredImage.node.sourceUrl,
      width: post.featuredImage.node.mediaDetails?.width,
      height: post.featuredImage.node.mediaDetails?.height,
      alt: post.featuredImage.node.altText
    }] : undefined,
    siteName: 'Vibe Coding Research',
    locale: 'en_US'
  }
  
  const twitter = {
    card: 'summary_large_image',
    site: '@vibecodingresearch',
    creator: post.author?.node?.name ? `@${post.author.node.name.toLowerCase().replace(/\s+/g, '')}` : undefined,
    title: post.seo?.title || post.title,
    description: post.seo?.metaDesc || post.excerpt,
    images: post.featuredImage?.node?.sourceUrl ? [post.featuredImage.node.sourceUrl] : undefined
  }
  
  const additionalMetaTags = [
    { name: 'article:published_time', content: post.date },
    { name: 'article:modified_time', content: post.modified },
    { name: 'article:author', content: post.author?.node?.name || 'Vibe Coding Research' },
    { name: 'article:section', content: post.categories.nodes[0]?.name },
    { name: 'article:tag', content: post.tags.nodes.map((tag: any) => tag.name).join(', ') },
    { name: 'author', content: post.author?.node?.name || 'Vibe Coding Research' },
    { name: 'keywords', content: [...post.categories.nodes.map((cat: any) => cat.name), ...post.tags.nodes.map((tag: any) => tag.name)].join(', ') }
  ]
  
  return (
    <SEO
      title={post.seo?.title || post.title}
      description={post.seo?.metaDesc || post.excerpt}
      canonical={canonical}
      openGraph={openGraph}
      twitter={twitter}
      additionalMetaTags={additionalMetaTags}
      structuredData={structuredData}
    />
  )
}

/**
 * SEO component for blog listing page
 */
interface BlogListingSEOProps {
  page?: number
  category?: string
  searchQuery?: string
}

export function BlogListingSEO({ page, category, searchQuery }: BlogListingSEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecodingresearch.com'
  let canonical = '/blog'
  let title = 'Blog & Insights - Vibe Coding Research'
  let description = 'Latest articles and insights from our team on coding, technology, and development best practices.'
  
  if (category) {
    canonical = `/category/${category}`
    title = `${category} Articles - Vibe Coding Research`
    description = `Browse all ${category} articles and insights from Vibe Coding Research.`
  } else if (searchQuery) {
    canonical = `/blog?search=${encodeURIComponent(searchQuery)}`
    title = `Search Results for "${searchQuery}" - Vibe Coding Research`
    description = `Search results for "${searchQuery}" - find relevant articles and insights.`
  }
  
  if (page && page > 1) {
    canonical += `?page=${page}`
    title += ` - Page ${page}`
  }
  
  const openGraph = {
    title,
    description,
    type: 'website',
    url: `${siteUrl}${canonical}`,
    siteName: 'Vibe Coding Research',
    locale: 'en_US'
  }
  
  const twitter = {
    card: 'summary_large_image',
    site: '@vibecodingresearch',
    title,
    description
  }
  
  return (
    <SEO
      title={title}
      description={description}
      canonical={canonical}
      openGraph={openGraph}
      twitter={twitter}
    />
  )
}

/**
 * SEO component for category pages
 */
interface CategorySEOProps {
  category: {
    name: string
    slug: string
    description: string
  }
}

export function CategorySEO({ category }: CategorySEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecodingresearch.com'
  const canonical = `/blog/category/${category.slug}`
  const title = `${category.name} Articles - Vibe Coding Research`
  const description = category.description || `Browse all ${category.name} articles and insights from Vibe Coding Research.`
  
  const openGraph = {
    title,
    description,
    type: 'website',
    url: `${siteUrl}${canonical}`,
    siteName: 'Vibe Coding Research',
    locale: 'en_US'
  }
  
  const twitter = {
    card: 'summary_large_image',
    site: '@vibecodingresearch',
    title,
    description
  }
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${siteUrl}${canonical}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `${category.name} Articles`,
      description: `Articles in the ${category.name} category`
    }
  }
  
  return (
    <SEO
      title={title}
      description={description}
      canonical={canonical}
      openGraph={openGraph}
      twitter={twitter}
      structuredData={structuredData}
    />
  )
}
