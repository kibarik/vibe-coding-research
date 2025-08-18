// src/components/LoadingSkeleton.tsx

interface LoadingSkeletonProps {
  type?: 'article' | 'article-list' | 'search' | 'text'
  count?: number
  className?: string
}

export default function LoadingSkeleton({
  type = 'article',
  count = 1,
  className = ''
}: LoadingSkeletonProps) {
  const renderArticleSkeleton = () => (
    <article className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-3" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-5 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    </article>
  )

  const renderSearchSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  )

  const renderTextSkeleton = () => (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )

  const renderContent = () => {
    switch (type) {
      case 'article':
        return renderArticleSkeleton()
      case 'article-list':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }, (_, i) => (
              <div key={i}>{renderArticleSkeleton()}</div>
            ))}
          </div>
        )
      case 'search':
        return renderSearchSkeleton()
      case 'text':
        return renderTextSkeleton()
      default:
        return renderArticleSkeleton()
    }
  }

  return (
    <div className={className}>
      {renderContent()}
    </div>
  )
}

/**
 * Specific skeleton components for different use cases
 */
export function ArticleCardSkeleton() {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-3" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-5 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    </article>
  )
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function SearchBarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? 'w-1/2' : i === lines - 2 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}
