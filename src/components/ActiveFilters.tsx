// src/components/ActiveFilters.tsx
'use client'

import { Category, Author } from '@/lib/data-fetching'

interface FilterState {
  dateRange: {
    start: string
    end: string
  }
  authors: string[]
  tags: string[]
  featured: boolean | null
  sortBy: string
  viewMode: 'grid' | 'list'
}

interface ActiveFiltersProps {
  filters: FilterState
  categories: Category[]
  authors: Author[]
  onRemoveFilter: (type: string, value: string) => void
  onClearAll: () => void
  className?: string
}

export function ActiveFilters({
  filters,
  categories,
  authors,
  onRemoveFilter,
  onClearAll,
  className = ''
}: ActiveFiltersProps) {
  const hasActiveFilters = filters.authors.length > 0 || 
    filters.tags.length > 0 || 
    filters.featured !== null ||
    filters.dateRange.start || 
    filters.dateRange.end

  if (!hasActiveFilters) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAuthorName = (authorId: string) => {
    const author = authors.find(a => a.id === authorId)
    return author?.name || authorId
  }

  const getCategoryName = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug)
    return category?.name || categorySlug
  }

  const getFeaturedLabel = (featured: boolean | null) => {
    if (featured === true) return 'Featured only'
    if (featured === false) return 'Not featured'
    return ''
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-400 mr-2">Active filters:</span>
      
      {/* Date Range Filters */}
      {filters.dateRange.start && (
        <span className="inline-flex items-center px-3 py-1 text-xs bg-blue-900/20 text-blue-300 rounded-full border border-blue-900/30">
          From: {formatDate(filters.dateRange.start)}
          <button
            onClick={() => onRemoveFilter('dateStart', '')}
            className="ml-2 text-blue-400 hover:text-blue-300 focus:outline-none"
            aria-label="Remove date start filter"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}

      {filters.dateRange.end && (
        <span className="inline-flex items-center px-3 py-1 text-xs bg-blue-900/20 text-blue-300 rounded-full border border-blue-900/30">
          To: {formatDate(filters.dateRange.end)}
          <button
            onClick={() => onRemoveFilter('dateEnd', '')}
            className="ml-2 text-blue-400 hover:text-blue-300 focus:outline-none"
            aria-label="Remove date end filter"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}

      {/* Featured Filter */}
      {filters.featured !== null && (
        <span className="inline-flex items-center px-3 py-1 text-xs bg-blue-900/20 text-blue-300 rounded-full border border-blue-900/30">
          {getFeaturedLabel(filters.featured)}
          <button
            onClick={() => onRemoveFilter('featured', '')}
            className="ml-2 text-blue-400 hover:text-blue-300 focus:outline-none"
            aria-label="Remove featured filter"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}

      {/* Author Filters */}
      {filters.authors.map((authorId) => (
        <span key={`author-${authorId}`} className="inline-flex items-center px-3 py-1 text-xs bg-green-900/20 text-green-300 rounded-full border border-green-900/30">
          Author: {getAuthorName(authorId)}
          <button
            onClick={() => onRemoveFilter('author', authorId)}
            className="ml-2 text-green-400 hover:text-green-300 focus:outline-none"
            aria-label={`Remove author filter: ${getAuthorName(authorId)}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {/* Category Filters */}
      {filters.tags.map((categorySlug) => (
        <span key={`category-${categorySlug}`} className="inline-flex items-center px-3 py-1 text-xs bg-purple-900/20 text-purple-300 rounded-full border border-purple-900/30">
          Category: {getCategoryName(categorySlug)}
          <button
            onClick={() => onRemoveFilter('category', categorySlug)}
            className="ml-2 text-purple-400 hover:text-purple-300 focus:outline-none"
            aria-label={`Remove category filter: ${getCategoryName(categorySlug)}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {/* Clear All Button */}
      <button
        onClick={onClearAll}
        className="inline-flex items-center px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Clear all filters"
      >
        Clear all
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
