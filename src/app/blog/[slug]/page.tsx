// src/app/blog/[slug]/page.tsx
import { getPosts, getPostBySlug } from '@/lib/data-fetching'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import TableOfContents, { addHeadingIds } from '@/components/TableOfContents'
import ReadingProgress, { estimateReadingTime } from '@/components/ReadingProgress'
import { BlogPostSEO } from '@/components/SEO'
import StructuredData from '@/components/StructuredData'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

// Generate static params for all posts
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts(100) // Get up to 100 posts for static generation
    
    return posts.nodes.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { post } = await getPostBySlug(slug)
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      }
    }

    const readingTime = estimateReadingTime(post.content || '')

    return {
      title: post.seo?.title || post.title,
      description: post.seo?.metaDesc || post.excerpt,
      openGraph: {
        title: post.seo?.opengraphTitle || post.title,
        description: post.seo?.opengraphDescription || post.excerpt,
        images: post.seo?.opengraphImage?.sourceUrl 
          ? [{ url: post.seo.opengraphImage.sourceUrl }]
          : post.featuredImage?.node?.sourceUrl 
          ? [{ url: post.featuredImage.node.sourceUrl }]
          : [],
        type: 'article',
        publishedTime: post.date,
        modifiedTime: post.modified,
        authors: post.author?.node ? [post.author.node.name] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seo?.title || post.title,
        description: post.seo?.metaDesc || post.excerpt,
        images: post.featuredImage?.node?.sourceUrl ? [post.featuredImage.node.sourceUrl] : undefined,
      },
      other: {
        'article:published_time': post.date,
        'article:modified_time': post.modified,
        'article:author': post.author?.node?.name,
        'article:section': post.categories.nodes[0]?.name,
        'article:tag': post.tags.nodes.map(tag => tag.name).join(', '),
        'reading-time': `${readingTime} min read`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { post } = await getPostBySlug(slug)
    
    if (!post) {
      notFound()
    }

    const readingTime = estimateReadingTime(post.content || '')
    const processedContent = addHeadingIds(post.content || '')

    return (
      <>
        {/* SEO Component */}
        <BlogPostSEO 
          post={post} 
          structuredData={{
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.featuredImage?.node?.sourceUrl,
            "author": post.author?.node ? {
              "@type": "Person",
              "name": post.author.node.name
            } : {
              "@type": "Organization",
              "name": "Vibe Coding Research"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Vibe Coding Research"
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
            ].join(', ')
          }}
        />
        
        {/* Reading Progress Bar */}
        <ReadingProgress />
        
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="relative">
            {post.featuredImage?.node && (
              <div className="aspect-[21/9] bg-gray-200 relative w-full overflow-hidden">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
              </div>
            )}
            
            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <div className="mb-6">
                  <Link
                    href="/blog"
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-4"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Blog
                  </Link>
                  
                  {/* Categories */}
                  {post.categories.nodes.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-2 mb-4">
                      {post.categories.nodes.map((category) => (
                        <span
                          key={category.id}
                          className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full border border-white/30"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex items-center justify-center space-x-6 text-white/80 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  
                  {post.author?.node && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {post.author.node.name}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {readingTime} min read
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Article Content */}
                  <div className="p-8 md:p-12">
                    <div 
                      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
                      dangerouslySetInnerHTML={{ __html: processedContent }}
                    />
                  </div>
                </article>

                {/* Author Info */}
                {post.author?.node && (
                  <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      About the Author
                    </h3>
                    <div className="flex items-start space-x-4">
                      {post.author.node.avatar?.url && (
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={post.author.node.avatar.url}
                            alt={post.author.node.name}
                            fill
                            className="rounded-full object-cover"
                            sizes="64px"
                            quality={75}
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {post.author.node.name}
                        </p>
                        <p className="text-gray-600 mt-1">
                          Author at Vibe Coding Research
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          Writing about coding, technology, and development best practices.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post.tags.nodes.length > 0 && (
                  <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.nodes.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                  {/* Table of Contents */}
                  <Suspense fallback={<div className="h-64 bg-gray-200 rounded-lg animate-pulse" />}>
                    <TableOfContents content={processedContent} />
                  </Suspense>

                  {/* Reading Stats */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Reading Stats
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reading time</span>
                        <span className="font-medium">{readingTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Word count</span>
                        <span className="font-medium">
                          {post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published</span>
                        <span className="font-medium">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Share Buttons */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Share Article
                    </h4>
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Twitter
                      </button>
                      <button className="flex-1 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
                        LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    notFound()
  }
}
