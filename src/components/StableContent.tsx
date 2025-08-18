// src/components/StableContent.tsx
'use client'

import { ReactNode, useState, useEffect } from 'react'

interface StableContentProps {
  children: ReactNode
  fallback?: ReactNode
  minHeight?: string
  className?: string
  delay?: number
}

export default function StableContent({
  children,
  fallback,
  minHeight = '200px',
  className = '',
  delay = 0
}: StableContentProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (shouldShow) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoaded(true)
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  const defaultFallback = (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )

  return (
    <div 
      className={`content-stable ${className}`}
      style={{ minHeight }}
    >
      {!isLoaded ? (fallback || defaultFallback) : children}
    </div>
  )
}

/**
 * Stable container for dynamic content that prevents layout shifts
 */
interface StableContainerProps {
  children: ReactNode
  aspectRatio?: string
  className?: string
}

export function StableContainer({
  children,
  aspectRatio,
  className = ''
}: StableContainerProps) {
  return (
    <div 
      className={`stable-container ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {children}
    </div>
  )
}

/**
 * Stable image container that prevents CLS
 */
interface StableImageProps {
  src: string
  alt: string
  aspectRatio?: string
  className?: string
  placeholder?: string
}

export function StableImage({
  src,
  alt,
  aspectRatio = '16/9',
  className = '',
}: StableImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  if (hasError) {
    return (
      <div 
        className={`image-placeholder ${className}`}
        style={{ aspectRatio }}
      >
        <span>Image failed to load</span>
      </div>
    )
  }

  return (
    <div 
      className={`image-container ${className}`}
      style={{ aspectRatio }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`optimized-image transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

/**
 * Stable text container that prevents font loading shifts
 */
interface StableTextProps {
  children: ReactNode
  className?: string
  lines?: number
}

export function StableText({
  children,
  className = '',
  lines = 1
}: StableTextProps) {
  const lineHeight = 1.5
  const fontSize = 16 // Base font size
  const minHeight = `${lines * lineHeight * fontSize}px`

  return (
    <div 
      className={`stable-text ${className}`}
      style={{ minHeight }}
    >
      {children}
    </div>
  )
}
