// src/components/DynamicImport.tsx
'use client'

import { Suspense, lazy, ComponentType } from 'react'

interface DynamicImportProps {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

export default function DynamicImport({
  component,
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  props = {}
}: DynamicImportProps) {
  const LazyComponent = lazy(component)

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Preload a component for better performance
 */
export function preloadComponent(
  component: () => Promise<{ default: ComponentType<any> }>
): void {
  // Start loading the component in the background
  component()
}

/**
 * Common dynamic imports for the blog
 */
export const DynamicSearchBar = lazy(() => import('./SearchBar'))
export const DynamicLazyLoad = lazy(() => import('./LazyLoad'))
export const DynamicOptimizedImage = lazy(() => import('./OptimizedImage'))

// Preload critical components
if (typeof window !== 'undefined') {
  // Preload search bar when user hovers over search area
  const preloadSearchBar = () => {
    preloadComponent(() => import('./SearchBar'))
  }

  // Preload lazy load when page loads
  const preloadLazyLoad = () => {
    preloadComponent(() => import('./LazyLoad'))
  }

  // Add event listeners for preloading
  document.addEventListener('DOMContentLoaded', () => {
    preloadLazyLoad()
    
    // Preload search bar on hover
    const searchTriggers = document.querySelectorAll('[data-preload-search]')
    searchTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', preloadSearchBar, { passive: true })
    })
  })
}
