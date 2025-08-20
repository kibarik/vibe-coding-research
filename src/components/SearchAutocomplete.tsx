// src/components/SearchAutocomplete.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { debounce } from '@/lib/performance'
import Link from 'next/link'
import OptimizedImage from './OptimizedImage'

interface SearchSuggestion {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: {
    node: {
      sourceUrl: string
      altText: string
    }
  }
}

interface SearchAutocompleteProps {
  placeholder?: string
  className?: string
  debounceMs?: number
  maxSuggestions?: number
}

export default function SearchAutocomplete({
  placeholder = 'Search articles...',
  className = '',
  debounceMs = 300,
  maxSuggestions = 5
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const debouncedFn = debounce(async (query: string) => {
        if (!query.trim()) {
          setSuggestions([])
          setIsLoading(false)
          return
        }

        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`)
          if (response.ok) {
            const data = await response.json()
            setSuggestions(data.suggestions || [])
          } else {
            setSuggestions([])
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      }, debounceMs)
      debouncedFn(searchQuery)
    },
    [debounceMs, maxSuggestions]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.trim()) {
      setIsLoading(true)
      setShowSuggestions(true)
      debouncedSearch(value)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          router.push(`/blog/${suggestions[selectedIndex].slug}`)
        } else if (query.trim()) {
          router.push(`/blog/search?q=${encodeURIComponent(query.trim())}`)
        }
        setShowSuggestions(false)
        break
      case 'Escape':
        setShowSuggestions(false)
        inputRef.current?.blur()
        break
    }
  }, [showSuggestions, suggestions, selectedIndex, query, router])

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    router.push(`/blog/${suggestion.slug}`)
    setShowSuggestions(false)
    setQuery('')
  }, [router])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/blog/search?q=${encodeURIComponent(query.trim())}`)
      setShowSuggestions(false)
    }
  }, [query, router])

  const handleClear = useCallback(() => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            aria-label="Search articles"
            autoComplete="off"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            </div>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2" />
              Searching...
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  } ${index < suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {suggestion.featuredImage?.node && (
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden">
                        <OptimizedImage
                          src={suggestion.featuredImage.node.sourceUrl}
                          alt={suggestion.featuredImage.node.altText || suggestion.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          aspectRatio="1/1"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {suggestion.excerpt}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              
              {/* View all results link */}
              {query.trim() && (
                <div className="border-t border-gray-100">
                  <Link
                    href={`/blog/search?q=${encodeURIComponent(query.trim())}`}
                    className="block p-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowSuggestions(false)}
                  >
                    View all results for &quot;{query}&quot;
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
