// src/components/ArticleSkeleton.tsx
'use client'

interface ArticleSkeletonProps {
  className?: string
}

export function ArticleSkeleton({ className = '' }: ArticleSkeletonProps) {
  return (
    <article className={`bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800 ${className}`} style={{ minHeight: '420px' }}>
      {/* Image skeleton */}
      <div className="aspect-video bg-gray-800 relative w-full overflow-hidden">
        <div className="absolute inset-0 skeleton-dark" />
      </div>

      {/* Content skeleton */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Meta information skeleton */}
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 bg-gray-700 rounded mr-1 skeleton-dark" />
          <div className="w-20 h-4 bg-gray-700 rounded skeleton-dark" />
          <div className="w-4 h-4 bg-gray-700 rounded mx-2" />
          <div className="w-4 h-4 bg-gray-700 rounded mr-1" />
          <div className="w-16 h-4 bg-gray-700 rounded skeleton-dark" />
        </div>

        {/* Title skeleton */}
        <div className="mb-3">
          <div className="w-full h-6 bg-gray-700 rounded skeleton-dark mb-2" />
          <div className="w-3/4 h-6 bg-gray-700 rounded skeleton-dark" />
        </div>

        {/* Excerpt skeleton */}
        <div className="mb-4 flex-1">
          <div className="w-full h-4 bg-gray-700 rounded skeleton-dark mb-2" />
          <div className="w-full h-4 bg-gray-700 rounded skeleton-dark mb-2" />
          <div className="w-2/3 h-4 bg-gray-700 rounded skeleton-dark" />
        </div>

        {/* Categories skeleton */}
        <div className="flex flex-wrap gap-2 mt-auto mb-4">
          <div className="w-16 h-6 bg-gray-700 rounded-full skeleton-dark" />
          <div className="w-20 h-6 bg-gray-700 rounded-full skeleton-dark" />
          <div className="w-14 h-6 bg-gray-700 rounded-full skeleton-dark" />
        </div>

        {/* Read more skeleton */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="w-24 h-4 bg-gray-700 rounded skeleton-dark" />
        </div>
      </div>
    </article>
  )
}

export function ArticleSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ArticleSkeleton key={index} />
      ))}
    </div>
  )
}
