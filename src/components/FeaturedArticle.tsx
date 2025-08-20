// src/components/FeaturedArticle.tsx
'use client'

import Link from 'next/link'
import { Post } from '@/lib/data-fetching'
import OptimizedImage from './OptimizedImage'

interface FeaturedArticleProps {
  post: Post
  className?: string
}

export function FeaturedArticle({ post, className = '' }: FeaturedArticleProps) {
  return (
    <div className={`group ${className}`}>
      {/* Featured Image with Gradient Overlay */}
      <div className="relative overflow-hidden rounded-3xl mb-8 h-96">
        {post.featuredImage?.node ? (
          <OptimizedImage
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            priority
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            quality={95}
            placeholder="blur"
            aspectRatio="16/9"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700" />
        )}
        
        {/* Multiple gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-blue-600/30 to-indigo-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="text-center max-w-4xl">
            {/* Category badge */}
            {post.categories?.nodes?.[0] && (
              <span className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-8 border border-white/30">
                {post.categories.nodes[0].name}
              </span>
            )}
            
            {/* Title */}
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
              {post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title}
            </h2>
            
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-blue-100 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                {post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '...' : post.excerpt}
              </p>
            )}
            
            {/* Read more button */}
            <div className="mt-12">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 group/link"
              >
                Read full article
                <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Article details below image */}
      <div className="space-y-4">
        <h3 className="text-4xl font-bold text-white leading-tight tracking-tight">
          <Link 
            href={`/blog/${post.slug}`} 
            className="hover:text-blue-400 transition-colors duration-300"
          >
            {post.title}
          </Link>
        </h3>
        
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center space-x-6">
            <time dateTime={post.date} className="flex items-center font-medium">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {new Date(post.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </time>
            
            {post.author?.node && (
              <span className="flex items-center font-medium">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                By {post.author.node.name}
              </span>
            )}
          </div>
          
          {/* Reading time estimate */}
          <div className="flex items-center text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {Math.ceil((post.excerpt?.length || 0) / 200)} min read
          </div>
        </div>
      </div>
    </div>
  )
}
