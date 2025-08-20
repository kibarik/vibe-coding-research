import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BlogPage from '@/app/blog/page'

// Mock the data fetching functions
vi.mock('@/lib/data-fetching', () => ({
  getPosts: vi.fn().mockResolvedValue({
    posts: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null
      },
      nodes: [
        {
          id: '1',
          title: 'Test Post',
          slug: 'test-post',
          excerpt: 'Test excerpt',
          date: '2024-01-15T10:30:00Z',
          author: {
            node: {
              name: 'Test Author'
            }
          },
          categories: {
            nodes: [
              {
                id: 'cat1',
                name: 'Test Category',
                slug: 'test-category'
              }
            ]
          }
        }
      ]
    }
  }),
  getCategories: vi.fn().mockResolvedValue({
    categories: {
      nodes: [
        {
          id: 'cat1',
          name: 'Test Category',
          slug: 'test-category'
        }
      ]
    }
  }),
  getPostsByCategory: vi.fn().mockResolvedValue({
    posts: {
      nodes: []
    }
  }),
  getAuthors: vi.fn().mockResolvedValue({
    authors: {
      nodes: [
        {
          id: 'author1',
          name: 'Test Author',
          slug: 'test-author'
        }
      ]
    }
  }),
  formatDate: vi.fn().mockReturnValue('January 15, 2024')
}))

// Mock the components
vi.mock('@/components/DynamicImport', () => ({
  DynamicSearchBar: () => <div data-testid="search-bar">Search Bar</div>
}))

vi.mock('@/components/BlogSidebarWrapper', () => ({
  BlogSidebarWrapper: () => <div data-testid="sidebar">Sidebar</div>
}))

vi.mock('@/components/BlogHeader', () => ({
  BlogHeader: () => <div data-testid="blog-header">Blog Header</div>
}))

vi.mock('@/components/FilterControls', () => ({
  FilterControls: () => <div data-testid="filter-controls">Filter Controls</div>
}))

vi.mock('@/components/ArticleGallery', () => ({
  ArticleGallery: () => <div data-testid="article-gallery">Article Gallery</div>
}))

vi.mock('@/components/SEO', () => ({
  BlogListingSEO: () => <div data-testid="seo">SEO Component</div>
}))

describe('Blog Page', () => {
  it('renders blog page with loading skeleton', async () => {
    const mockSearchParams = Promise.resolve({ category: undefined })
    
    const page = await BlogPage({ searchParams: mockSearchParams })
    render(page)
    
    // Check that skeleton elements are present
    const skeletonElements = document.querySelectorAll('.skeleton-dark')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('displays skeleton when loading', async () => {
    const mockSearchParams = Promise.resolve({ category: undefined })
    
    const page = await BlogPage({ searchParams: mockSearchParams })
    render(page)
    
    // Check that skeleton is displayed during loading
    const skeletonElements = document.querySelectorAll('.skeleton-dark')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('shows skeleton during loading', async () => {
    const mockSearchParams = Promise.resolve({ category: undefined })
    
    const page = await BlogPage({ searchParams: mockSearchParams })
    render(page)
    
    // Check that skeleton is displayed during loading
    const skeletonElements = document.querySelectorAll('.skeleton-dark')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })
})
