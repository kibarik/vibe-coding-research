// src/components/ArticleCard.tsx
'use client'

import Link from 'next/link'
import { Post, formatDate } from '@/lib/data-fetching'
import OptimizedImage from './OptimizedImage'

interface ArticleCardProps {
  post: Post
  className?: string
  priority?: boolean
}

export function ArticleCard({ post, className = '', priority = false }: ArticleCardProps) {
  return (
    <article
      className={`bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-800/30 hover:border-gray-700/50 hover:scale-[1.02] ${className}`}
      style={{ minHeight: '520px' }}
      aria-labelledby={`post-title-${post.id}`}
      aria-describedby={`post-excerpt-${post.id}`}
    >
      {/* Featured Image with Enhanced Gradient Overlay */}
      {post.featuredImage?.node && (
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative w-full overflow-hidden">
          <OptimizedImage
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            priority={priority}
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={90}
            placeholder="blur"
            aspectRatio="16/9"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      )}

      {/* Article Content */}
      <div className="p-8 flex-1 flex flex-col">
        {/* Meta Information */}
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <time dateTime={post.date} className="flex items-center font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {formatDate(post.date)}
          </time>
          {post.author?.node && (
            <>
              <span className="mx-3 text-gray-600" aria-hidden="true">•</span>
              <span className="flex items-center font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>By {post.author.node.name}</span>
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 id={`post-title-${post.id}`} className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300 leading-tight">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-blue-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p id={`post-excerpt-${post.id}`} className="text-gray-300 mb-6 line-clamp-3 flex-1 leading-relaxed text-lg">
          {post.excerpt}
        </p>

        {/* Categories */}
        {post.categories.nodes.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-auto mb-6" aria-label="Categories">
            {post.categories.nodes.slice(0, 3).map((category) => (
              <span
                key={category.id}
                className="px-4 py-2 bg-blue-900/30 text-blue-300 text-sm font-medium rounded-full hover:bg-blue-900/50 transition-colors duration-200 border border-blue-800/50 hover:border-blue-700/50 backdrop-blur-sm"
              >
                {category.name}
              </span>
            ))}
            {post.categories.nodes.length > 3 && (
              <span className="px-4 py-2 bg-gray-800/50 text-gray-400 text-sm font-medium rounded-full border border-gray-700/50 backdrop-blur-sm">
                +{post.categories.nodes.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Read More Link */}
        <div className="mt-auto pt-6 border-t border-gray-800/30">
          <Link
            href={`/blog/${post.slug}`}
            className="text-blue-400 hover:text-blue-300 font-semibold text-base inline-flex items-center group/link focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg transition-colors duration-200"
            aria-label={`Read more about ${post.title}`}
          >
            Read more
            <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
