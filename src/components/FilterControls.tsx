// src/components/FilterControls.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { DynamicSearchBar } from './DynamicImport'
import { AdvancedFilters } from './AdvancedFilters'
import { ActiveFilters } from './ActiveFilters'
import { SearchSuggestions } from './SearchSuggestions'
import { Category, Author } from '@/lib/data-fetching'
import { loadFiltersFromStorage, getDefaultFilterState } from '@/lib/filter-persistence'

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

interface FilterControlsProps {
  categories: Category[]
  authors?: Author[]
  onSearch?: (query: string) => void
  onFiltersChange?: (filters: FilterState) => void
  onViewModeChange?: (mode: 'grid' | 'list') => void
  className?: string
}

export function FilterControls({
  categories,
  authors = [],
  onSearch,
  onFiltersChange,
  onViewModeChange,
  className = ''
}: FilterControlsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load saved filters on component mount
    if (typeof window !== 'undefined') {
      return loadFiltersFromStorage() || getDefaultFilterState()
    }
    return getDefaultFilterState()
  })
  const searchRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(!!query.trim())
    onSearch?.(query)
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
    onViewModeChange?.(newFilters.viewMode)
  }

  const handleRemoveFilter = (type: string, value: string) => {
    const newFilters = { ...filters }
    
    switch (type) {
      case 'dateStart':
        newFilters.dateRange.start = ''
        break
      case 'dateEnd':
        newFilters.dateRange.end = ''
        break
      case 'featured':
        newFilters.featured = null
        break
      case 'author':
        newFilters.authors = newFilters.authors.filter(id => id !== value)
        break
      case 'category':
        newFilters.tags = newFilters.tags.filter(tag => tag !== value)
        break
    }
    
    handleFiltersChange(newFilters)
  }

  const handleClearAllFilters = () => {
    const clearedFilters = getDefaultFilterState()
    handleFiltersChange(clearedFilters)
  }

  const handleSuggestionClick = (suggestion: { slug: string }) => {
    // Navigate to the suggested article
    window.location.href = `/blog/${suggestion.slug}`
  }

  const handlePopularSearchClick = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(false)
    onSearch?.(query)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Advanced Filters Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar with Suggestions */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <DynamicSearchBar
            placeholder="Search articles..."
            onSearch={handleSearch}
            defaultValue={searchQuery}
          />
          
          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <SearchSuggestions
                query={searchQuery}
                onSuggestionClick={handleSuggestionClick}
                onPopularSearchClick={handlePopularSearchClick}
              />
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          categories={categories}
          authors={authors}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Active Filters */}
      <ActiveFilters
        filters={filters}
        categories={categories}
        authors={authors}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />
    </div>
  )
}
