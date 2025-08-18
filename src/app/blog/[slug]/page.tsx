// src/app/blog/[slug]/page.tsx
import { getPosts, getPostBySlug } from '@/lib/data-fetching'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { DynamicSearchBar } from '@/components/DynamicImport'
import { SearchBarSkeleton } from '@/components/LoadingSkeleton'
import { BlogPostSEO } from '@/components/SEO'
import StructuredData from '@/components/StructuredData'
import TableOfContents from '@/components/TableOfContents'
import ReadingProgress from '@/components/ReadingProgress'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

// Generate static params for all posts
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts(50) // Get more posts for static generation
    return posts.nodes.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for posts:', error)
    return []
  }
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = params
    
    // Get post data
    const { post } = await getPostBySlug(slug)
    
    if (!post) {
      notFound()
    }

    // Generate structured data for the post
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.featuredImage?.node?.sourceUrl,
      author: {
        '@type': 'Person',
        name: post.author?.node?.name || 'Vibe Coding Research'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vibe Coding Research',
        logo: {
          '@type': 'ImageObject',
          url: 'https://vibecodingresearch.com/logo.png'
        }
      },
      datePublished: post.date,
      dateModified: post.modified,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://vibecodingresearch.com/blog/${post.slug}`
      }
    }
    
    return (
      <>
        {/* SEO Component */}
        <BlogPostSEO post={post} structuredData={structuredData} />
        
        {/* Reading Progress Indicator */}
        <ReadingProgress />
        
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              {/* Breadcrumb */}
              <nav className="mb-8">
                <ol className="flex items-center space-x-2 text-sm text-gray-600">
                  <li>
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-blue-600 transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </li>
                  <li className="text-gray-900 font-medium">{post.title}</li>
                </ol>
              </nav>

              {/* Featured Image */}
              {post.featuredImage?.node && (
                <div className="mb-8 aspect-video bg-gray-200 rounded-xl overflow-hidden relative">
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                    quality={90}
                  />
                </div>
              )}

              {/* Article Header */}
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Meta Information */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 mb-8">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {post.author?.node?.name || 'Vibe Coding Research'}
                  </div>
                  
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

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                                         {Math.ceil((post.content || post.excerpt).split(' ').length / 200)} min read
                  </div>
                </div>

                {/* Categories and Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {post.categories.nodes.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog/category/${category.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Table of Contents */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <TableOfContents content={post.content || ''} />
                </div>
              </div>

              {/* Article Content */}
              <div className="lg:col-span-3">
                <article className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
                  />
                </article>

                {/* Tags */}
                {post.tags.nodes.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.nodes.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Bio */}
                {post.author?.node && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          About {post.author.node.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Technical writer and developer passionate about sharing knowledge and best practices in web development.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link
                      href="/blog"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Blog
                    </Link>
                    
                    <div className="flex space-x-4">
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        Share
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
