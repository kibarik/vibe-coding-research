'use client'

import { CategoryNavigation } from './CategoryNavigation'
import { Category } from '@/lib/data-fetching'

interface CategoryNavigationWrapperProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryNavigationWrapper({ 
  categories, 
  selectedCategory 
}: CategoryNavigationWrapperProps) {
  return (
    <CategoryNavigation 
      categories={categories}
      selectedCategory={selectedCategory}
    />
  )
}
