// src/components/AdvancedFilters.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Category, Author } from '@/lib/data-fetching'
import { loadFiltersFromStorage, saveFiltersToStorage, getDefaultFilterState } from '@/lib/filter-persistence'

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

interface AdvancedFiltersProps {
  categories: Category[]
  authors?: Author[]
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

export function AdvancedFilters({
  categories,
  authors = [],
  onFiltersChange,
  className = ''
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load saved filters on component mount
    if (typeof window !== 'undefined') {
      return loadFiltersFromStorage() || getDefaultFilterState()
    }
    return getDefaultFilterState()
  })
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Notify parent of filter changes and save to storage
  useEffect(() => {
    onFiltersChange(filters)
    saveFiltersToStorage(filters)
  }, [filters, onFiltersChange])

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value }
    }))
  }

  const handleAuthorToggle = (authorId: string) => {
    setFilters(prev => ({
      ...prev,
      authors: prev.authors.includes(authorId)
        ? prev.authors.filter(id => id !== authorId)
        : [...prev.authors, authorId]
    }))
  }

  const handleTagToggle = (tagSlug: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagSlug)
        ? prev.tags.filter(tag => tag !== tagSlug)
        : [...prev.tags, tagSlug]
    }))
  }

  const handleFeaturedToggle = (value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      featured: prev.featured === value ? null : value
    }))
  }

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const handleViewModeChange = (viewMode: 'grid' | 'list') => {
    setFilters(prev => ({ ...prev, viewMode }))
  }

  const clearAllFilters = () => {
    const clearedFilters = getDefaultFilterState()
    setFilters(clearedFilters)
    setSearchQuery('')
  }

  const hasActiveFilters = filters.authors.length > 0 || 
    filters.tags.length > 0 || 
    filters.featured !== null ||
    filters.dateRange.start || 
    filters.dateRange.end

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black ${
          hasActiveFilters
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
        aria-label="Advanced filters"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
            {filters.authors.length + filters.tags.length + (filters.featured !== null ? 1 : 0) + (filters.dateRange.start || filters.dateRange.end ? 1 : 0)}
          </span>
        )}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Date Range</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date-start" className="block text-xs text-gray-400 mb-1">
                    From
                  </label>
                  <input
                    id="date-start"
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="date-end" className="block text-xs text-gray-400 mb-1">
                    To
                  </label>
                  <input
                    id="date-end"
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Featured Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Featured</h4>
              <div className="space-y-2">
                {[
                  { value: true, label: 'Featured only' },
                  { value: false, label: 'Not featured' },
                  { value: null, label: 'All articles' }
                ].map((option) => (
                  <label key={String(option.value)} className="flex items-center">
                    <input
                      type="radio"
                      name="featured"
                      checked={filters.featured === option.value}
                      onChange={() => handleFeaturedToggle(option.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Authors Filter */}
            {authors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Authors</h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {authors.map((author) => (
                    <label key={author.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.authors.includes(author.id)}
                        onChange={() => handleAuthorToggle(author.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-300">{author.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Categories/Tags Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Categories</h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {filteredCategories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(category.slug)}
                      onChange={() => handleTagToggle(category.slug)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      {category.name} ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Sort By</h4>
              <div className="space-y-2">
                {[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'title', label: 'Title A-Z' },
                  { value: 'popular', label: 'Most Popular' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sortBy === option.value}
                      onChange={() => handleSortChange(option.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* View Mode */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">View Mode</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    filters.viewMode === 'grid'
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Grid view"
                  aria-pressed={filters.viewMode === 'grid'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    filters.viewMode === 'list'
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="List view"
                  aria-pressed={filters.viewMode === 'list'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
