// src/components/BlogSidebarWrapper.tsx
'use client'

import { useState, useEffect } from 'react'
import { BlogSidebar } from './BlogSidebar'
import { MobileMenuButton } from './MobileMenuButton'
import { Category } from '@/lib/data-fetching'

interface BlogSidebarWrapperProps {
  categories: Category[]
  selectedCategory?: string
}

export function BlogSidebarWrapper({ 
  categories, 
  selectedCategory 
}: BlogSidebarWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarOpen])

           const handleCategoryChange = () => {
           // Close sidebar on mobile when category is selected
           if (window.innerWidth < 1024) {
             setIsSidebarOpen(false)
           }
         }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <MobileMenuButton 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
        />
      </div>

      {/* Sidebar */}
      <BlogSidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
    </>
  )
}
