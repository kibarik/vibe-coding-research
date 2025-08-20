// src/components/BlogHeader.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Category } from '@/lib/data-fetching'

interface BlogHeaderProps {
  categories: Category[]
  selectedCategory?: string
  onCategoryChange?: (categorySlug: string | null) => void
}

export function BlogHeader({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: BlogHeaderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory || null)

  // Update active category when URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    setActiveCategory(categoryFromUrl)
  }, [searchParams])

  const handleCategoryClick = (categorySlug: string | null) => {
    setActiveCategory(categorySlug)
    onCategoryChange?.(categorySlug)
  }

  const createCategoryUrl = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }
    
    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }

  return (
    <header className="mb-8">
      {/* Main title */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-4">
          News
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          Latest articles and insights from our team on coding, technology, and development best practices.
        </p>
      </div>

      {/* Category filter bar */}
      <div className="flex items-center justify-between">
        {/* Category navigation */}
        <nav className="flex-1" role="navigation" aria-label="Category navigation">
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
            {/* All Categories Option */}
            <Link
              href={createCategoryUrl(null)}
              onClick={() => handleCategoryClick(null)}
              className={`
                flex-shrink-0 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded px-1 py-2
                ${!activeCategory 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-gray-400 hover:text-white'
                }
              `}
              role="tab"
              aria-selected={!activeCategory}
              aria-controls="articles-content"
            >
              All ({categories.reduce((sum, cat) => sum + cat.count, 0)})
            </Link>
            
            {/* Category Options */}
            {categories.map((category) => (
              <Link
                key={category.id}
                href={createCategoryUrl(category.slug)}
                onClick={() => handleCategoryClick(category.slug)}
                className={`
                  flex-shrink-0 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded px-1 py-2
                  ${activeCategory === category.slug 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-gray-400 hover:text-white'
                  }
                `}
                role="tab"
                aria-selected={activeCategory === category.slug}
                aria-controls="articles-content"
              >
                {category.name} ({category.count})
              </Link>
            ))}
          </div>
        </nav>

        {/* Right-aligned controls */}
        <div className="flex items-center gap-4 ml-6">
          {/* Filter button */}
          <button
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded px-3 py-2"
            aria-label="Filter articles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm">Filter</span>
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded px-3 py-2"
              aria-label="Sort articles"
              aria-expanded="false"
            >
              <span className="text-sm">Sort</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* View mode toggles */}
          <div className="flex items-center gap-1">
            {/* Grid view button */}
            <button
              className="p-2 text-white bg-gray-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Grid view"
              aria-pressed="true"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
              </svg>
            </button>

            {/* List view button */}
            <button
              className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label="List view"
              aria-pressed="false"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
