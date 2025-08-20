// src/components/ArticleGallery.tsx
'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/lib/data-fetching'
import { FeaturedArticle } from './FeaturedArticle'
import { ArticleCard } from './ArticleCard'
import { ArticleSkeletonGrid } from './ArticleSkeleton'

interface ArticleGalleryProps {
  posts: Post[]
  className?: string
  isLoading?: boolean
}

export function ArticleGallery({ posts, className = '', isLoading = false }: ArticleGalleryProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading skeleton while loading or on server-side
  if (isLoading || !isClient) {
    return (
      <section className={`space-y-8 ${className}`} aria-label="Articles">
        <div className="mb-12">
          <div className="w-48 h-8 bg-gray-700 rounded skeleton-dark mb-6" />
          <div className="w-full h-96 bg-gray-800 rounded-xl skeleton-dark" />
        </div>
        <div>
          <div className="w-48 h-8 bg-gray-700 rounded skeleton-dark mb-6" />
          <ArticleSkeletonGrid count={6} />
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16" role="status" aria-live="polite">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No posts found</h3>
          <p className="text-gray-300 mb-6">
            We couldn&apos;t find any articles matching your criteria. Try adjusting your search or browse our latest posts.
          </p>
        </div>
      </div>
    )
  }

  const [featuredPost, ...regularPosts] = posts

  return (
    <section className={`space-y-8 ${className}`} aria-label="Articles">
      {/* Featured Article */}
      {featuredPost && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Article</h2>
          <FeaturedArticle post={featuredPost} />
        </div>
      )}

      {/* Regular Articles Grid */}
      {regularPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="feed" aria-busy="false">
            {regularPosts.map((post, index) => (
              <ArticleCard
                key={post.id}
                post={post}
                priority={index < 3}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
