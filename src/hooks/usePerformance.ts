// src/hooks/usePerformance.ts
'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  fid: number | null
  inp: number | null
  lcp: number | null
  cls: number | null
  ttfb: number | null
}

export function usePerformance() {
  const metricsRef = useRef<PerformanceMetrics>({
    fid: null,
    inp: null,
    lcp: null,
    cls: null,
    ttfb: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming
          metricsRef.current.fid = fidEntry.processingStart - fidEntry.startTime
          
          // Log FID for monitoring
          if (metricsRef.current.fid > 100) {
            console.warn(`FID is high: ${metricsRef.current.fid}ms`)
          }
        }
      })
    })

    // Track Interaction to Next Paint (INP)
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'interaction') {
          const interactionEntry = entry as PerformanceEventTiming
          const interactionTime = interactionEntry.processingEnd - interactionEntry.startTime
          
          if (!metricsRef.current.inp || interactionTime > metricsRef.current.inp) {
            metricsRef.current.inp = interactionTime
            
            // Log INP for monitoring
            if (metricsRef.current.inp > 200) {
              console.warn(`INP is high: ${metricsRef.current.inp}ms`)
            }
          }
        }
      })
    })

    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        metricsRef.current.lcp = lastEntry.startTime
        
        // Log LCP for monitoring
        if (metricsRef.current.lcp > 2500) {
          console.warn(`LCP is high: ${metricsRef.current.lcp}ms`)
        }
      }
    })

    // Track Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'layout-shift' && !(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
          clsValue += (entry as PerformanceEntry & { value: number }).value
        }
      })
      metricsRef.current.cls = clsValue
      
      // Log CLS for monitoring
      if (clsValue > 0.1) {
        console.warn(`CLS is high: ${clsValue}`)
      }
    })

    // Track Time to First Byte (TTFB)
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          metricsRef.current.ttfb = navEntry.responseStart - navEntry.requestStart
          
          // Log TTFB for monitoring
          if (metricsRef.current.ttfb > 600) {
            console.warn(`TTFB is high: ${metricsRef.current.ttfb}ms`)
          }
        }
      })
    })

    try {
      // Start observing
      fidObserver.observe({ entryTypes: ['first-input'] })
      inpObserver.observe({ entryTypes: ['interaction'] })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      navigationObserver.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error)
    }

    // Cleanup
    return () => {
      fidObserver.disconnect()
      inpObserver.disconnect()
      lcpObserver.disconnect()
      clsObserver.disconnect()
      navigationObserver.disconnect()
    }
  }, [])

  // Function to get current metrics
  const getMetrics = () => metricsRef.current

  // Function to log metrics to analytics
  const logMetrics = () => {
    const metrics = getMetrics()
    
    // Send to analytics service (replace with your analytics)
    if (typeof window !== 'undefined' && (window as Window & { gtag?: unknown }).gtag) {
      window.gtag('event', 'core_web_vitals', {
        event_category: 'Web Vitals',
        event_label: window.location.pathname,
        value: Math.round(metrics.lcp || 0),
        custom_parameter_1: metrics.fid,
        custom_parameter_2: metrics.inp,
        custom_parameter_3: metrics.cls,
        custom_parameter_4: metrics.ttfb,
      })
    }
  }

  return {
    getMetrics,
    logMetrics,
  }
}

// Global performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Monitor long tasks
  const longTaskObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (entry.duration > 50) {
        console.warn(`Long task detected: ${entry.duration}ms`, entry)
      }
    })
  })

  try {
    longTaskObserver.observe({ entryTypes: ['longtask'] })
  } catch (error) {
    console.warn('Long task observer not supported:', error)
  }

  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
        console.warn('High memory usage detected')
      }
    }, 30000) // Check every 30 seconds
  }
}
