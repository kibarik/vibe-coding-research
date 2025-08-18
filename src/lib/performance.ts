// src/lib/performance.ts

/**
 * Debounce function to limit the rate at which a function can fire
 * Useful for optimizing search inputs, scroll handlers, and resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 * Useful for scroll events, mouse move events, and other frequent events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * RequestIdleCallback polyfill for better performance
 * Allows scheduling non-critical work during idle periods
 */
export const requestIdleCallback = 
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => setTimeout(callback, 1)

export const cancelIdleCallback = 
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id)

/**
 * Intersection Observer for lazy loading
 * Optimizes performance by only loading content when it's about to be visible
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}

/**
 * Performance mark utility for measuring specific operations
 */
export function markPerformance(name: string): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(name)
  }
}

/**
 * Performance measure utility for measuring time between marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    try {
      performance.measure(name, startMark, endMark)
    } catch (error) {
      console.warn(`Performance measure failed for ${name}:`, error)
    }
  }
}

/**
 * Batch DOM updates to minimize reflows
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  } else {
    updates.forEach(update => update())
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
}

/**
 * Optimize event listeners with passive option
 */
export function addOptimizedEventListener(
  element: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): void {
  const optimizedOptions: AddEventListenerOptions = {
    passive: true, // Improves scroll performance
    ...options
  }
  
  element.addEventListener(type, listener, optimizedOptions)
}
