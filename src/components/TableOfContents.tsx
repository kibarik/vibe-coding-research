// src/components/TableOfContents.tsx
'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export default function TableOfContents({ content, className = '' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from content
    const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g
    const extractedHeadings: TocItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      extractedHeadings.push({
        id: match[2],
        text: match[3].replace(/<[^>]*>/g, ''), // Remove HTML tags
        level: parseInt(match[1])
      })
    }

    setHeadings(extractedHeadings)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: 0
      }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className={`toc-nav ${className}`}>
      <div className="sticky top-24">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
          Table of Contents
        </h4>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`text-left w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeId === heading.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

/**
 * Auto-generate heading IDs for content
 */
export function addHeadingIds(content: string): string {
  return content.replace(
    /<h([1-6])([^>]*)>/g,
    (match, level, attrs) => {
      // Extract text content for ID generation
      const textMatch = match.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/)
      if (textMatch) {
        const text = textMatch[1].replace(/<[^>]*>/g, '') // Remove HTML tags
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        // Check if ID already exists
        if (attrs.includes(`id="${id}"`)) {
          return match
        }
        
        return `<h${level}${attrs} id="${id}">`
      }
      return match
    }
  )
}
