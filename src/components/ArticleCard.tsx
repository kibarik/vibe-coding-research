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
      className={`bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-800 hover:border-gray-700 ${className}`}
      style={{ minHeight: '420px' }} // Reserve space to prevent CLS
      aria-labelledby={`post-title-${post.id}`}
      aria-describedby={`post-excerpt-${post.id}`}
    >
      {/* Featured Image with Gradient Overlay */}
      {post.featuredImage?.node && (
        <div className="aspect-video bg-gray-800 relative w-full overflow-hidden">
          <OptimizedImage
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            placeholder="blur"
            aspectRatio="16/9"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Article Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Meta Information */}
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <time dateTime={post.date} className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {formatDate(post.date)}
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
        <h2 id={`post-title-${post.id}`} className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p id={`post-excerpt-${post.id}`} className="text-gray-300 mb-4 line-clamp-3 flex-1 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Categories */}
        {post.categories.nodes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto mb-4" aria-label="Categories">
            {post.categories.nodes.slice(0, 3).map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 bg-blue-900/20 text-blue-300 text-xs font-medium rounded-full hover:bg-blue-900/30 transition-colors border border-blue-900/30"
              >
                {category.name}
              </span>
            ))}
            {post.categories.nodes.length > 3 && (
              <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded-full border border-gray-700">
                +{post.categories.nodes.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Read More Link */}
        <div className="mt-auto pt-4 border-t border-gray-800">
          <Link
            href={`/blog/${post.slug}`}
            className="text-blue-400 hover:text-blue-300 font-medium text-sm inline-flex items-center group/link focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
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
  )
}
