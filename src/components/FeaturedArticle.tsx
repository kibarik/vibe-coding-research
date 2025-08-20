// src/components/FeaturedArticle.tsx
'use client'

import Link from 'next/link'
import { Post, formatDate } from '@/lib/data-fetching'
import OptimizedImage from './OptimizedImage'

interface FeaturedArticleProps {
  post: Post
  className?: string
}

export function FeaturedArticle({ post, className = '' }: FeaturedArticleProps) {
  return (
    <article 
      className={`relative overflow-hidden rounded-xl group cursor-pointer ${className}`}
      aria-labelledby={`featured-title-${post.id}`}
      aria-describedby={`featured-excerpt-${post.id}`}
    >
      {/* Background with gradient overlay */}
      <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
        {/* Featured Image */}
        {post.featuredImage?.node && (
          <OptimizedImage
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={90}
            placeholder="blur"
            aspectRatio="16/9"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
          {/* Meta Information */}
          <div className="flex items-center text-sm text-gray-300 mb-4">
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
          <h2 
            id={`featured-title-${post.id}`} 
            className="text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded"
            >
              {post.title}
            </Link>
          </h2>

          {/* Excerpt */}
          <p 
            id={`featured-excerpt-${post.id}`} 
            className="text-gray-300 text-base lg:text-lg mb-6 line-clamp-3 lg:line-clamp-2"
          >
            {post.excerpt}
          </p>

          {/* Categories */}
          {post.categories.nodes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6" aria-label="Categories">
              {post.categories.nodes.slice(0, 3).map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm font-medium rounded-full border border-blue-600/30 hover:bg-blue-600/30 transition-colors"
                >
                  {category.name}
                </span>
              ))}
              {post.categories.nodes.length > 3 && (
                <span className="px-3 py-1 bg-gray-800/50 text-gray-300 text-sm font-medium rounded-full border border-gray-700">
                  +{post.categories.nodes.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Read More Link */}
          <div className="flex items-center">
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-400 hover:text-blue-300 font-medium text-base inline-flex items-center group/link focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label={`Read more about ${post.title}`}
            >
              Read more
              <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Featured Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
            Featured
          </span>
        </div>
      </div>
    </article>
  )
}
