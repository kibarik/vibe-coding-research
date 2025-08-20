// src/components/SearchSuggestions.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

interface PopularSearch {
  query: string
  count: number
}

interface SearchSuggestionsProps {
  query: string
  onSuggestionClick: (suggestion: SearchSuggestion) => void
  onPopularSearchClick: (query: string) => void
  className?: string
}

export function SearchSuggestions({
  query,
  onSuggestionClick,
  onPopularSearchClick,
  className = ''
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Mock popular searches - in real app, this would come from analytics
    const mockPopularSearches: PopularSearch[] = [
      { query: 'React', count: 45 },
      { query: 'TypeScript', count: 32 },
      { query: 'Next.js', count: 28 },
      { query: 'Tailwind CSS', count: 24 },
      { query: 'GraphQL', count: 19 },
      { query: 'Performance', count: 16 }
    ]
    setPopularSearches(mockPopularSearches)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate with a delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Mock suggestions based on query
        const mockSuggestions: SearchSuggestion[] = [
          {
            id: '1',
            title: `Getting Started with ${query}`,
            slug: `getting-started-${query.toLowerCase()}`,
            excerpt: `Learn the basics of ${query} and how to get started with your first project.`
          },
          {
            id: '2',
            title: `Advanced ${query} Techniques`,
            slug: `advanced-${query.toLowerCase()}-techniques`,
            excerpt: `Explore advanced techniques and best practices for ${query}.`
          },
          {
            id: '3',
            title: `${query} Best Practices`,
            slug: `${query.toLowerCase()}-best-practices`,
            excerpt: `Discover the best practices and patterns for working with ${query}.`
          }
        ]
        
        setSuggestions(mockSuggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  if (!query.trim() && popularSearches.length === 0) {
    return null
  }

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg shadow-lg ${className}`}>
      {query.trim() ? (
        // Search suggestions
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Search suggestions for &quot;{query}&quot;
          </h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <div className="flex items-start space-x-3">
                    {suggestion.featuredImage?.node && (
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded overflow-hidden">
                        <img
                          src={suggestion.featuredImage.node.sourceUrl}
                          alt={suggestion.featuredImage.node.altText || suggestion.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {suggestion.excerpt}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              
              <div className="pt-2 border-t border-gray-700">
                <Link
                  href={`/blog/search?q=${encodeURIComponent(query.trim())}`}
                  className="block p-2 text-sm text-blue-400 hover:text-blue-300 transition-colors rounded"
                >
                  View all results for &quot;{query}&quot;
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">
                No suggestions found for &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>
      ) : (
        // Popular searches
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Popular searches
          </h3>
          
          <div className="space-y-2">
            {popularSearches.map((search) => (
              <button
                key={search.query}
                onClick={() => onPopularSearchClick(search.query)}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{search.query}</span>
                  <span className="text-xs text-gray-500">{search.count} articles</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
