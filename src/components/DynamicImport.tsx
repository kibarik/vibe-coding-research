// src/components/DynamicImport.tsx
'use client'

import { Suspense, lazy, ComponentType } from 'react'

interface DynamicImportProps<P extends object = Record<string, unknown>> {
  component: () => Promise<{ default: ComponentType<P> }>
  fallback?: React.ReactNode
  props?: P
}

export default function DynamicImport<P extends object = Record<string, unknown>>({
  component,
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  props = {} as P,
}: DynamicImportProps<P>) {
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
export function preloadComponent<P extends object = Record<string, unknown>>(
  component: () => Promise<{ default: ComponentType<P> }>
): void {
  // Start loading the component in the background
  component()
}

/**
 * Common dynamic imports for the blog
 */
const SearchBarLazy = lazy(() => import('./SearchBar'))
const SearchAutocompleteLazy = lazy(() => import('./SearchAutocomplete'))
const LazyLoadLazy = lazy(() => import('./LazyLoad'))
const OptimizedImageLazy = lazy(() => import('./OptimizedImage'))

// Wrapped components with Suspense
export function DynamicSearchBar(props: React.ComponentProps<typeof SearchBarLazy>) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-10 rounded-lg" />}>
      <SearchBarLazy {...props} />
    </Suspense>
  )
}

export function DynamicSearchAutocomplete(props: React.ComponentProps<typeof SearchAutocompleteLazy>) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded" />}>
      <SearchAutocompleteLazy {...props} />
    </Suspense>
  )
}

export function DynamicLazyLoad(props: React.ComponentProps<typeof LazyLoadLazy>) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded" />}>
      <LazyLoadLazy {...props} />
    </Suspense>
  )
}

export function DynamicOptimizedImage(props: React.ComponentProps<typeof OptimizedImageLazy>) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded" />}>
      <OptimizedImageLazy {...props} />
    </Suspense>
  )
}

// Preload critical components
if (typeof window !== 'undefined') {
  // Preload search bar when user hovers over search area
  const preloadSearchBar = () => {
    preloadComponent(() => import('./SearchBar'))
  }

  // Preload search autocomplete when user hovers over search area
  const preloadSearchAutocomplete = () => {
    preloadComponent(() => import('./SearchAutocomplete'))
  }

  // Preload lazy load when page loads
  const preloadLazyLoad = () => {
    preloadComponent(() => import('./LazyLoad'))
  }

  // Add event listeners for preloading
  document.addEventListener('DOMContentLoaded', () => {
    preloadLazyLoad()
    
    // Preload search components on hover
    const searchTriggers = document.querySelectorAll('[data-preload-search]')
    searchTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', preloadSearchBar, { passive: true })
      trigger.addEventListener('mouseenter', preloadSearchAutocomplete, { passive: true })
    })
  })
}
