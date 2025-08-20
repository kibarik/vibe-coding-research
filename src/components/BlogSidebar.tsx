// src/components/BlogSidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Category } from '@/lib/data-fetching'

interface BlogSidebarProps {
  categories: Category[]
  selectedCategory?: string
  onCategoryChange?: (categorySlug: string | null) => void
  isOpen?: boolean
  onToggle?: () => void
}

export function BlogSidebar({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  isOpen = true,
  onToggle 
}: BlogSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory || null)

  // Update active category when URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    setActiveCategory(categoryFromUrl)
  }, [searchParams])

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle?.()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onToggle])

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
    <>
      {/* Mobile overlay with improved touch handling */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
          aria-hidden="true"
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Sidebar with improved responsive behavior */}
      <aside 
        className={`
          fixed left-0 top-0 h-full bg-black text-white z-50 
          transition-all duration-300 ease-in-out transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto
          w-64 lg:w-72
          shadow-2xl lg:shadow-none
        `}
        role="navigation"
        aria-label="Blog navigation"
        aria-hidden={!isOpen}
      >
        {/* Mobile close button with improved touch target */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 lg:hidden p-3 text-white hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-800/50 touch-manipulation"
          aria-label="Close navigation"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Sidebar content */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo/Brand area */}
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <Link 
              href="/blog" 
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded"
              onClick={() => handleCategoryClick(null)}
            >
              News
            </Link>
          </div>

          {/* Navigation menu with improved touch targets */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-1">
              {/* All Categories Option */}
              <Link
                href={createCategoryUrl(null)}
                onClick={() => handleCategoryClick(null)}
                className={`
                  block px-4 py-4 rounded-lg text-sm font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
                  touch-manipulation
                  ${!activeCategory 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }
                `}
                role="menuitem"
                aria-current={!activeCategory ? 'page' : undefined}
                style={{ minHeight: '48px' }}
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
                    block px-4 py-4 rounded-lg text-sm font-medium transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
                    touch-manipulation
                    ${activeCategory === category.slug 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                  role="menuitem"
                  aria-current={activeCategory === category.slug ? 'page' : undefined}
                  style={{ minHeight: '48px' }}
                >
                  {category.name} ({category.count})
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer area */}
          <div className="p-6 border-t border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
