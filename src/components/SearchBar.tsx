// src/components/SearchBar.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { debounce } from '@/lib/performance'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  defaultValue?: string
  navigateToSearch?: boolean
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search articles...',
  className = '',
  debounceMs = 300,
  defaultValue = '',
  navigateToSearch = true
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Update query when defaultValue changes
  useEffect(() => {
    setQuery(defaultValue)
  }, [defaultValue])

  // Debounced search function to optimize performance
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const debouncedFn = debounce((query: string) => {
        setIsSearching(false)
        if (onSearch) {
          onSearch(query)
        }
        if (navigateToSearch && query.trim()) {
          router.push(`/blog/search?q=${encodeURIComponent(query.trim())}`)
        }
      }, debounceMs)
      debouncedFn(searchQuery)
    },
    [onSearch, debounceMs, navigateToSearch, router]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsSearching(true)
    debouncedSearch(value)
  }, [debouncedSearch])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (inputRef.current) {
      inputRef.current.blur()
    }
    const trimmedQuery = query.trim()
    if (onSearch) {
      onSearch(trimmedQuery)
    }
    if (navigateToSearch && trimmedQuery) {
      router.push(`/blog/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }, [query, onSearch, navigateToSearch, router])

  const handleClear = useCallback(() => {
    setQuery('')
    setIsSearching(false)
    if (onSearch) {
      onSearch('')
    }
    if (navigateToSearch) {
      router.push('/blog/search')
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [onSearch, navigateToSearch, router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && query) {
      e.preventDefault()
      handleClear()
    }
  }, [query, handleClear])

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} role="search">
      <div className="relative">
        <label htmlFor="search-input" className="sr-only">
          Search articles
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          aria-label="Search articles"
          aria-describedby={query ? "search-clear" : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400 dark:text-gray-500"
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
            id="search-clear"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-hidden="true">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          </div>
        )}
      </div>
    </form>
  )
}
