// src/components/CategoryNavigation.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Category } from '@/lib/data-fetching'

interface CategoryNavigationProps {
  categories: Category[]
  selectedCategory?: string
  onCategoryChange?: (categorySlug: string | null) => void
}

export function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryNavigationProps) {
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
    <nav className="mb-8" role="navigation" aria-label="Category navigation">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
        {activeCategory && (
          <button
            onClick={() => handleCategoryClick(null)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
            aria-label="Clear category filter"
          >
            Clear filter
          </button>
        )}
      </div>
      
      <div className="relative">
        <div 
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          role="tablist"
          aria-label="Article categories"
        >
          {/* All Categories Option */}
          <Link
            href={createCategoryUrl(null)}
            onClick={() => handleCategoryClick(null)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
              ${!activeCategory 
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                ${activeCategory === category.slug 
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
        
        {/* Gradient fade indicators for scroll */}
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" aria-hidden="true" />
      </div>
    </nav>
  )
}
