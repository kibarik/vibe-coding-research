// src/app/blog/category/[slug]/page.tsx
import { getCategories, getPostsByCategory, formatDate } from '@/lib/data-fetching'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { DynamicSearchBar } from '@/components/DynamicImport'
import { SearchBarSkeleton } from '@/components/LoadingSkeleton'
import { CategorySEO } from '@/components/SEO'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    const { categories } = await getCategories()
    return categories.nodes.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    return []
  }
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const { slug } = await params
    
    // Get category details and posts
    const [categoriesResponse, postsResponse] = await Promise.all([
      getCategories(),
      getPostsByCategory(slug, 12)
    ])
    
    const category = categoriesResponse.categories.nodes.find(cat => cat.slug === slug)
    
    if (!category) {
      notFound()
    }
    
    const { posts } = postsResponse
    
    return (
      <>
        {/* SEO Component */}
        <CategorySEO category={category} />
        
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-12 text-center">
              <div className="mb-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Blog
                </Link>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                  {category.description}
                </p>
              )}
              
              <p className="text-lg text-gray-500">
                {posts.nodes.length} article{posts.nodes.length !== 1 ? 's' : ''} in this category
              </p>
            </div>

            {/* Search Section */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div data-preload-search className="max-w-md">
                <Suspense fallback={<SearchBarSkeleton />}>
                  <DynamicSearchBar
                    placeholder="Search articles..."
                    navigateToSearch={true}
                  />
                </Suspense>
              </div>

              {/* Results count */}
              <div className="text-sm text-gray-600">
                {posts.nodes.length > 0 ? (
                  <span>
                    {posts.nodes.length} article{posts.nodes.length !== 1 ? 's' : ''} in {category.name}
                  </span>
                ) : (
                  <span>No articles found in {category.name}</span>
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
                          {post.categories.nodes.slice(0, 3).map((cat) => (
                            <span
                              key={cat.id}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                cat.slug === category.slug
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {cat.name}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any articles in the &quot;{category.name}&quot; category. Try browsing other categories or search for different topics.
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
                  Load More Articles
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
    console.error('Error fetching category posts:', error)
    notFound()
  }
}
