// src/components/LazyLoad.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createIntersectionObserver } from '@/lib/performance'

interface LazyLoadProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  fallback?: React.ReactNode
  className?: string
}

export default function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  className = ''
}: LazyLoadProps) {

  const [isLoaded, setIsLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = createIntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Small delay to ensure smooth loading
          setTimeout(() => setIsLoaded(true), 100)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return (
    <div ref={ref} className={className}>
      {!isLoaded ? fallback : children}
    </div>
  )
}

/**
 * LazyLoad wrapper for images
 */
interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = createIntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image()
          img.onload = () => setIsLoaded(true)
          img.onerror = () => setHasError(true)
          img.src = src
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [src])

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load</span>
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {isLoaded && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
