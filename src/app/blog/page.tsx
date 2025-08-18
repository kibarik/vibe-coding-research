// src/app/blog/page.tsx
import { getPosts, getCategories, getPostsByCategory } from '@/lib/data-fetching'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { DynamicSearchBar } from '@/components/DynamicImport'
import { SearchBarSkeleton } from '@/components/LoadingSkeleton'
import { BlogListingSEO } from '@/components/SEO'
import { CategoryNavigation } from '@/components/CategoryNavigation'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

interface BlogPageProps {
  searchParams: {
    category?: string
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  try {
    const { category } = searchParams
    
    // Fetch categories and posts
    const [categoriesResponse, postsResponse] = await Promise.all([
      getCategories(),
      category ? getPostsByCategory(category, 12) : getPosts(12)
    ])
    
    const { categories } = categoriesResponse
    const { posts } = postsResponse
    
    return (
      <>
        {/* SEO Component */}
        <BlogListingSEO category={category} />
        
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Blog & Insights
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Latest articles and insights from our team on coding, technology, and development best practices.
            </p>
          </header>

          {/* Category Navigation */}
          <CategoryNavigation 
            categories={categories.nodes}
            selectedCategory={category}
          />

          {/* Search and Filters Section */}
          <section className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" aria-label="Search and filters">
            {/* Search Bar */}
            <div data-preload-search className="max-w-md">
              <Suspense fallback={<SearchBarSkeleton />}>
                <DynamicSearchBar
                  placeholder="Search articles..."
                  navigateToSearch={true}
                />
              </Suspense>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite" aria-atomic="true">
              {posts.nodes.length > 0 ? (
                <span>
                  {posts.nodes.length} article{posts.nodes.length !== 1 ? 's' : ''} available
                  {category && ` in ${categories.nodes.find(cat => cat.slug === category)?.name || category}`}
                </span>
              ) : (
                <span>No articles found</span>
              )}
            </div>
          </section>

          {/* Articles Grid */}
          <section aria-label="Articles">
            {posts.nodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="feed" aria-busy="false">
                {posts.nodes.map((post, index) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700"
                    style={{ minHeight: '420px' }} // Reserve space to prevent CLS
                    aria-labelledby={`post-title-${post.id}`}
                    aria-describedby={`post-excerpt-${post.id}`}
                  >
                    {/* Featured Image */}
                    {post.featuredImage?.node && (
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative w-full overflow-hidden">
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
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <time dateTime={post.date} className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                        {post.author?.node && (
                          <>
                            <span className="mx-2" aria-hidden="true">•</span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              <span>By {post.author.node.name}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h2 id={`post-title-${post.id}`} className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
                          prefetch={index < 6}
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p id={`post-excerpt-${post.id}`} className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      {/* Categories */}
                      {post.categories.nodes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto" aria-label="Categories">
                          {post.categories.nodes.slice(0, 3).map((category) => (
                            <span
                              key={category.id}
                              className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              {category.name}
                            </span>
                          ))}
                          {post.categories.nodes.length > 3 && (
                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                              +{post.categories.nodes.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Read More Link */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center group/link focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
                          aria-label={`Read more about ${post.title}`}
                        >
                          Read more
                          <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16" role="status" aria-live="polite">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    We couldn&apos;t find any articles matching your criteria. Try adjusting your search or browse our latest posts.
                  </p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    View all posts
                  </Link>
                </div>
              </div>
            )}

            {/* Load More Button (for cursor-based pagination) */}
            {posts.pageInfo.hasNextPage && (
              <div className="mt-12 text-center">
                <button 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Load more articles"
                >
                  Load More Articles
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
      </>
    )
  } catch (error) {
    console.error('Error fetching posts:', error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4" role="alert" aria-live="assertive">
          <svg className="w-16 h-16 text-red-300 dark:text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We&apos;re having trouble loading the blog posts. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Retry loading posts"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    )
  }
}
