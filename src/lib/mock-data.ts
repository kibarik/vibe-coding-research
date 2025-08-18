// src/lib/mock-data.ts
import { Post, Category } from './data-fetching'

export const mockPosts: Post[] = [
  {
    id: '1',
    databaseId: 1,
    title: 'Getting Started with Next.js and TypeScript',
    excerpt: 'Learn how to set up a modern Next.js project with TypeScript, Tailwind CSS, and best practices for optimal performance and developer experience.',
    slug: 'getting-started-nextjs-typescript',
    date: '2024-01-15T10:00:00Z',
    modified: '2024-01-15T10:00:00Z',
    featuredImage: {
      node: {
        id: 'img1',
        sourceUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        altText: 'Next.js and TypeScript setup',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author1',
        name: 'Alex Johnson',
        slug: 'alex-johnson'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        },
        {
          id: 'cat2',
          name: 'Next.js',
          slug: 'nextjs'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag1',
          name: 'TypeScript',
          slug: 'typescript'
        },
        {
          id: 'tag2',
          name: 'React',
          slug: 'react'
        }
      ]
    }
  },
  {
    id: '2',
    databaseId: 2,
    title: 'Optimizing Core Web Vitals for Better Performance',
    excerpt: 'Discover strategies to improve your website\'s Core Web Vitals scores, including LCP, FID, and CLS optimization techniques.',
    slug: 'optimizing-core-web-vitals',
    date: '2024-01-10T14:30:00Z',
    modified: '2024-01-10T14:30:00Z',
    featuredImage: {
      node: {
        id: 'img2',
        sourceUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
        altText: 'Performance optimization',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author2',
        name: 'Sarah Chen',
        slug: 'sarah-chen'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat3',
          name: 'Performance',
          slug: 'performance'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag3',
          name: 'Web Vitals',
          slug: 'web-vitals'
        },
        {
          id: 'tag4',
          name: 'SEO',
          slug: 'seo'
        }
      ]
    }
  },
  {
    id: '3',
    databaseId: 3,
    title: 'Building Accessible Web Applications',
    excerpt: 'Learn how to create web applications that are accessible to all users, including those with disabilities, following WCAG guidelines.',
    slug: 'building-accessible-web-applications',
    date: '2024-01-05T09:15:00Z',
    modified: '2024-01-05T09:15:00Z',
    featuredImage: {
      node: {
        id: 'img3',
        sourceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        altText: 'Accessibility in web development',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author3',
        name: 'Mike Rodriguez',
        slug: 'mike-rodriguez'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat4',
          name: 'Accessibility',
          slug: 'accessibility'
        },
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag5',
          name: 'WCAG',
          slug: 'wcag'
        },
        {
          id: 'tag6',
          name: 'A11y',
          slug: 'a11y'
        }
      ]
    }
  }
]

export const mockCategories: Category[] = [
  {
    id: 'cat1',
    databaseId: 1,
    name: 'Development',
    slug: 'development',
    description: 'Articles about software development, programming, and technical topics',
    count: 2
  },
  {
    id: 'cat2',
    databaseId: 2,
    name: 'Next.js',
    slug: 'nextjs',
    description: 'Next.js framework tutorials, tips, and best practices',
    count: 1
  },
  {
    id: 'cat3',
    databaseId: 3,
    name: 'Performance',
    slug: 'performance',
    description: 'Web performance optimization and Core Web Vitals',
    count: 1
  },
  {
    id: 'cat4',
    databaseId: 4,
    name: 'Accessibility',
    slug: 'accessibility',
    description: 'Web accessibility guidelines and implementation',
    count: 1
  }
]

export const mockPageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
  endCursor: 'YXJyYXljb25uZWN0aW9uOjI='
}
