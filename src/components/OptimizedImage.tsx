'use client'

// src/components/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'
import { optimizeImageUrl } from '@/lib/data-fetching'

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  quality?: number
  className?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  aspectRatio?: string // For CLS prevention
}

const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  quality = 85,
  className = '',
  placeholder = 'blur',
  blurDataURL = defaultBlurDataURL,
  onLoad,
  onError,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Calculate aspect ratio for CLS prevention
  const getAspectRatioStyle = () => {
    if (aspectRatio) {
      return { aspectRatio }
    }
    if (width && height) {
      return { aspectRatio: `${width} / ${height}` }
    }
    return {}
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={getAspectRatioStyle()}
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    )
  }

  // Optimize the image URL for CDN
  const optimizedSrc = optimizeImageUrl(src, width, height, quality)

  return (
    <div 
      className={`relative ${isLoading ? 'animate-pulse bg-gray-200' : ''} ${className}`}
      style={getAspectRatioStyle()}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={fill ? { objectFit: 'cover' } : undefined}
      />
    </div>
  )
}
