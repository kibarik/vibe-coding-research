import { render, screen } from '@testing-library/react'
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
  formatDate: vi.fn().mockReturnValue('January 15, 2024')
}))

// Mock the components
vi.mock('@/components/DynamicImport', () => ({
  DynamicSearchBar: () => <div data-testid="search-bar">Search Bar</div>
}))

vi.mock('@/components/CategoryNavigationWrapper', () => ({
  CategoryNavigationWrapper: () => <div data-testid="category-nav">Category Navigation</div>
}))

vi.mock('@/components/SEO', () => ({
  BlogListingSEO: () => <div data-testid="seo">SEO Component</div>
}))

describe('Blog Page', () => {
  it('renders blog page with main components', async () => {
    const mockSearchParams = Promise.resolve({ category: undefined })
    
    const page = await BlogPage({ searchParams: mockSearchParams })
    render(page)
    
    // Check main page elements
    expect(screen.getByText('Blog & Insights')).toBeInTheDocument()
    expect(screen.getByText(/Latest articles and insights/)).toBeInTheDocument()
    
    // Check components are rendered
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    expect(screen.getByTestId('category-nav')).toBeInTheDocument()
    expect(screen.getByTestId('seo')).toBeInTheDocument()
  })

  it('displays posts when available', async () => {
    const mockSearchParams = Promise.resolve({ category: undefined })
    
    const page = await BlogPage({ searchParams: mockSearchParams })
    render(page)
    
    // Check post content is displayed
    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('Test excerpt')).toBeInTheDocument()
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })

  it('shows correct article count', async () => {
    const mockSearchParams = Promise.resolve({ category: undefined })
    
    const page = await BlogPage({ searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByText('1 article available')).toBeInTheDocument()
  })
})
