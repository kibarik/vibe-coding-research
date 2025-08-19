// src/test/pages/blog-detail.test.tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import BlogPostPage from '@/app/blog/[slug]/page'

// Mock the data fetching function
vi.mock('@/lib/data-fetching', () => ({
  getPostBySlug: vi.fn().mockResolvedValue({
    post: {
      id: '1',
      databaseId: 1,
      title: 'Привет, мир!',
      content: '<p>Добро пожаловать в наш блог о программировании!</p>',
      excerpt: 'Первая статья в блоге о программировании и технологиях.',
      slug: 'привет-мир',
      date: '2024-01-15T10:00:00Z',
      modified: '2024-01-15T10:00:00Z',
      featuredImage: {
        node: {
          id: 'img1',
          sourceUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
          altText: 'Привет, мир!',
          mediaDetails: {
            width: 800,
            height: 400
          }
        }
      },
      author: {
        node: {
          id: 'author1',
          name: 'Команда Vibe Coding Research',
          slug: 'vibe-coding-research'
        }
      },
      categories: {
        nodes: [
          {
            id: 'cat1',
            name: 'Общие',
            slug: 'общие'
          }
        ]
      },
      tags: {
        nodes: [
          {
            id: 'tag1',
            name: 'блог',
            slug: 'блог'
          },
          {
            id: 'tag2',
            name: 'программирование',
            slug: 'программирование'
          }
        ]
      }
    }
  }),
  formatDate: vi.fn().mockImplementation((date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn()
}))

describe('Blog Detail Page', () => {
  const mockParams = { slug: 'привет-мир' }
  const mockSearchParams = {}

  it('renders blog post with correct title', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByRole('heading', { level: 1, name: 'Привет, мир!' })).toBeInTheDocument()
  })

  it('renders blog post content', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByText('Добро пожаловать в наш блог о программировании!')).toBeInTheDocument()
  })

  it('renders author information', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByText('Команда Vibe Coding Research')).toBeInTheDocument()
  })

  it('renders categories', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByText('Общие')).toBeInTheDocument()
  })

  it('renders tags', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByText('#блог')).toBeInTheDocument()
    expect(screen.getByText('#программирование')).toBeInTheDocument()
  })

  it('renders featured image', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    const image = screen.getByAltText('Привет, мир!')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src')
  })

  it('renders navigation breadcrumbs', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('renders back to blog link', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    const backLink = screen.getByText('Back to Blog')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/blog')
  })

  it('renders share button', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('renders table of contents', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    // Check for table of contents container
    expect(document.querySelector('.lg\\:col-span-1')).toBeInTheDocument()
  })

  it('renders reading progress component', async () => {
    const page = await BlogPostPage({ params: mockParams, searchParams: mockSearchParams })
    render(page)
    
    // Check for reading progress component
    expect(document.querySelector('.reading-progress')).toBeInTheDocument()
  })

  it('handles URL-encoded slugs correctly', async () => {
    const encodedParams = { slug: '%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82-%D0%BC%D0%B8%D1%80' }
    const page = await BlogPostPage({ params: encodedParams, searchParams: mockSearchParams })
    render(page)
    
    // Should still render the correct content
    expect(screen.getByRole('heading', { level: 1, name: 'Привет, мир!' })).toBeInTheDocument()
  })
})
