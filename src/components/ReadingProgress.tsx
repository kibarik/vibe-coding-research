// src/components/ReadingProgress.tsx
'use client'

import { useEffect, useState } from 'react'

interface ReadingProgressProps {
  className?: string
}

export default function ReadingProgress({ className = '' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setProgress(Math.min(scrollPercent, 100))
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress() // Initial calculation

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className={`reading-progress ${className}`}>
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Reading time estimator
 */
export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Reading progress indicator with time remaining
 */
export function ReadingProgressWithTime({ content, className = '' }: { content: string, className?: string }) {
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const totalReadingTime = estimateReadingTime(content)

    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      const currentProgress = Math.min(scrollPercent, 100)
      
      setProgress(currentProgress)
      
      // Calculate time remaining
      const timeElapsed = (currentProgress / 100) * totalReadingTime
      const remaining = Math.max(0, totalReadingTime - timeElapsed)
      setTimeRemaining(Math.ceil(remaining))
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [content])

  return (
    <div className={`reading-progress-detailed ${className}`}>
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Reading time indicator */}
      <div className="fixed top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-50">
        <div className="text-xs text-gray-600">
          {timeRemaining > 0 ? `${timeRemaining} min left` : 'Finished'}
        </div>
      </div>
    </div>
  )
}
