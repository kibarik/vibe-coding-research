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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        {activeCategory && (
          <button
            onClick={() => handleCategoryClick(null)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>
      
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* All Categories Option */}
          <Link
            href={createCategoryUrl(null)}
            onClick={() => handleCategoryClick(null)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${!activeCategory 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
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
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${activeCategory === category.slug 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.name} ({category.count})
            </Link>
          ))}
        </div>
        
        {/* Gradient fade indicators for scroll */}
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
