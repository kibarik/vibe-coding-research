// src/components/Pagination.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalPosts: number
  postsPerPage: number
  baseUrl?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalPosts,
  postsPerPage,
  baseUrl = '/blog'
}: PaginationProps) {

  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const queryString = params.toString()
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages()
  const startPost = (currentPage - 1) * postsPerPage + 1
  const endPost = Math.min(currentPage * postsPerPage, totalPosts)

  return (
    <div className="mt-12">
      {/* Results info */}
      <div className="text-center text-sm text-gray-600 mb-6">
        Showing {startPost} to {endPost} of {totalPosts} posts
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous button */}
        {currentPage > 1 && (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
            aria-label="Go to previous page"
          >
            Previous
          </Link>
        )}

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-gray-500"
              >
                ...
              </span>
            )
          }

          const pageNumber = page as number
          const isCurrentPage = pageNumber === currentPage

          return (
            <Link
              key={pageNumber}
              href={createPageUrl(pageNumber)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isCurrentPage
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </Link>
          )
        })}

        {/* Next button */}
        {currentPage < totalPages && (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
            aria-label="Go to next page"
          >
            Next
          </Link>
        )}
      </div>

      {/* Jump to page */}
      {totalPages > 5 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600 mr-2">Jump to:</span>
          <select
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page !== currentPage) {
                window.location.href = createPageUrl(page)
              }
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Jump to page"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
