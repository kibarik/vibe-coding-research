// src/app/blog/search/page.tsx
import { searchPosts, formatDate } from '@/lib/data-fetching'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { DynamicSearchBar } from '@/components/DynamicImport'
import { SearchBarSkeleton } from '@/components/LoadingSkeleton'
import { BlogListingSEO } from '@/components/SEO'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: searchQuery } = await searchParams
  
  if (!searchQuery) {
    return (
      <>
        <BlogListingSEO searchQuery="" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Search Articles
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enter your search terms to find relevant articles and insights.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <Suspense fallback={<SearchBarSkeleton />}>
                <DynamicSearchBar
                  onSearch={(query) => {
                    // This will be handled by client-side navigation
                    console.log('Search query:', query)
                  }}
                  placeholder="Search articles..."
                />
              </Suspense>
            </div>

            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
                <p className="text-gray-600">
                  Enter keywords to find articles about coding, technology, and development best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  try {
    const { posts } = await searchPosts(searchQuery, 20)
    
    return (
      <>
        <BlogListingSEO searchQuery={searchQuery} />
        
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Search Results
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Results for &quot;{searchQuery}&quot;
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <Suspense fallback={<SearchBarSkeleton />}>
                <DynamicSearchBar
                  onSearch={(query) => {
                    // This will be handled by client-side navigation
                    console.log('Search query:', query)
                  }}
                  placeholder="Search articles..."
                  defaultValue={searchQuery}
                />
              </Suspense>
            </div>

            {/* Results count */}
            <div className="mb-8 text-center">
              <div className="text-sm text-gray-600">
                {posts.nodes.length > 0 ? (
                  <span>
                    Found {posts.nodes.length} article{posts.nodes.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </span>
                ) : (
                  <span>No articles found for &quot;{searchQuery}&quot;</span>
                )}
              </div>
            </div>

            {/* Articles Grid */}
            {posts.nodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.nodes.map((post, index) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100"
                    style={{ minHeight: '420px' }}
                  >
                    {/* Featured Image */}
                    {post.featuredImage?.node && (
                      <div className="aspect-video bg-gray-200 relative w-full overflow-hidden">
                        <Image
                          src={post.featuredImage.node.sourceUrl}
                          alt={post.featuredImage.node.altText || post.title}
                          fill
                          priority={index < 3}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={85}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Meta Information */}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <time dateTime={post.date} className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatDate(post.date)}
                        </time>
                        {post.author?.node && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              {post.author.node.name}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-blue-600 transition-colors"
                          prefetch={index < 6}
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      {/* Categories */}
                      {post.categories.nodes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {post.categories.nodes.slice(0, 3).map((category) => (
                            <span
                              key={category.id}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors"
                            >
                              {category.name}
                            </span>
                          ))}
                          {post.categories.nodes.length > 3 && (
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
                              +{post.categories.nodes.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Read More Link */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center group/link"
                        >
                          Read more
                          <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;. Try different keywords or browse our latest posts.
                  </p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View all posts
                  </Link>
                </div>
              </div>
            )}

            {/* Load More Button */}
            {posts.pageInfo.hasNextPage && (
              <div className="mt-12 text-center">
                <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Load More Results
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error searching posts:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Search Error
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;re having trouble processing your search. Please try again.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }
}
