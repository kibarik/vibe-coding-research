import { client } from './graphql-client'
import {
  GET_POSTS,
  GET_POST_BY_SLUG,
  GET_PAGES,
  GET_PAGE_BY_SLUG,
  GET_CATEGORIES,
  GET_TAGS,
  GET_POSTS_BY_CATEGORY,
  SEARCH_POSTS,
} from './graphql-queries'
import { mockPosts, mockCategories, mockPageInfo } from './mock-data'

// Types for GraphQL responses
export interface Post {
  id: string
  databaseId: number
  title: string
  content?: string
  excerpt: string
  slug: string
  date: string
  modified: string
  featuredImage?: {
    node: {
      id: string
      sourceUrl: string
      altText: string
      mediaDetails: {
        width: number
        height: number
      }
    }
  }
  author?: {
    node: {
      id: string
      name: string
      slug: string
      avatar?: {
        url: string
      }
    }
  }
  categories: {
    nodes: Array<{
      id: string
      name: string
      slug: string
    }>
  }
  tags: {
    nodes: Array<{
      id: string
      name: string
      slug: string
    }>
  }
  seo?: {
    title: string
    metaDesc: string
    opengraphTitle: string
    opengraphDescription: string
    opengraphImage?: {
      sourceUrl: string
    }
  }
}

export interface Page {
  id: string
  databaseId: number
  title: string
  content: string
  excerpt: string
  slug: string
  date: string
  modified: string
  featuredImage?: {
    node: {
      id: string
      sourceUrl: string
      altText: string
      mediaDetails: {
        width: number
        height: number
      }
    }
  }
  seo?: {
    title: string
    metaDesc: string
    opengraphTitle: string
    opengraphDescription: string
    opengraphImage?: {
      sourceUrl: string
    }
  }
}

export interface Category {
  id: string
  databaseId: number
  name: string
  slug: string
  description: string
  count: number
}

export interface Tag {
  id: string
  databaseId: number
  name: string
  slug: string
  description: string
  count: number
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
}

export interface PostsResponse {
  posts: {
    pageInfo: PageInfo
    nodes: Post[]
  }
}

export interface PostResponse {
  post: Post
}

export interface PagesResponse {
  pages: {
    pageInfo: PageInfo
    nodes: Page[]
  }
}

export interface PageResponse {
  page: Page
}

export interface CategoriesResponse {
  categories: {
    nodes: Category[]
  }
}

export interface TagsResponse {
  tags: {
    nodes: Tag[]
  }
}

// Data fetching functions with error handling and caching
export async function getPosts(first: number = 10, after?: string): Promise<PostsResponse> {
  try {
    const { data } = await client.query({
      query: GET_POSTS,
      variables: { first, after },
      fetchPolicy: 'cache-first',
    })
    return data
  } catch (error) {
    console.error('Error fetching posts:', error)
    // Fallback to mock data when GraphQL is not available
    console.log('Using mock data for posts')
    return {
      posts: {
        pageInfo: mockPageInfo,
        nodes: mockPosts.slice(0, first)
      }
    }
  }
}

export async function getPostBySlug(slug: string): Promise<PostResponse> {
  try {
    const { data } = await client.query({
      query: GET_POST_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'cache-first',
    })
    
    // Ensure we always return a valid structure
    if (!data || !data.post) {
      throw new Error(`Post not found: ${slug}`)
    }
    
    return data
  } catch (error) {
    console.error('Error fetching post:', error)
    // Fallback to mock data when GraphQL is not available
    console.log('Using mock data for post')
    const mockPost = mockPosts.find(post => post.slug === slug)
    if (!mockPost) {
      throw new Error(`Post not found: ${slug}`)
    }
    return {
      post: {
        ...mockPost,
        content: mockPost.content || mockPost.excerpt // Add content field for mock posts
      }
    }
  }
}

export async function getPages(first: number = 10, after?: string): Promise<PagesResponse> {
  try {
    const { data } = await client.query({
      query: GET_PAGES,
      variables: { first, after },
      fetchPolicy: 'cache-first',
    })
    return data
  } catch (error) {
    console.error('Error fetching pages:', error)
    throw new Error('Failed to fetch pages')
  }
}

export async function getPageBySlug(slug: string): Promise<PageResponse> {
  try {
    const { data } = await client.query({
      query: GET_PAGE_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'cache-first',
    })
    return data
  } catch (error) {
    console.error('Error fetching page:', error)
    throw new Error(`Failed to fetch page: ${slug}`)
  }
}

export async function getCategories(): Promise<CategoriesResponse> {
  try {
    const { data } = await client.query({
      query: GET_CATEGORIES,
      fetchPolicy: 'cache-first',
    })
    return data
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback to mock data when GraphQL is not available
    console.log('Using mock data for categories')
    return {
      categories: {
        nodes: mockCategories
      }
    }
  }
}

export async function getTags(): Promise<TagsResponse> {
  try {
    const { data } = await client.query({
      query: GET_TAGS,
      fetchPolicy: 'cache-first',
    })
    return data
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw new Error('Failed to fetch tags')
  }
}

export async function getPostsByCategory(
  categorySlug: string,
  first: number = 10,
  after?: string
): Promise<PostsResponse> {
  try {
    const { data } = await client.query({
      query: GET_POSTS_BY_CATEGORY,
      variables: { categorySlug, first, after },
      fetchPolicy: 'cache-first',
    })
    return data
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    // Fallback to mock data when GraphQL is not available
    console.log('Using mock data for posts by category')
    const filteredPosts = mockPosts.filter(post => 
      post.categories.nodes.some(cat => cat.slug === categorySlug)
    )
    return {
      posts: {
        pageInfo: mockPageInfo,
        nodes: filteredPosts.slice(0, first)
      }
    }
  }
}

export async function searchPosts(
  searchTerm: string,
  first: number = 10,
  after?: string
): Promise<PostsResponse> {
  try {
    const { data } = await client.query({
      query: SEARCH_POSTS,
      variables: { search: searchTerm, first, after },
      fetchPolicy: 'cache-first',
    })
    return data
  } catch (error) {
    console.error('Error searching posts:', error)
    throw new Error(`Failed to search posts: ${searchTerm}`)
  }
}

// Utility function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  // Use UTC to ensure consistent formatting between server and client
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  return `${monthNames[month]} ${day}, ${year}`
}

// Utility function to get excerpt
export function getExcerpt(content: string, maxLength: number = 150): string {
  const strippedContent = content.replace(/<[^>]*>/g, '')
  if (strippedContent.length <= maxLength) {
    return strippedContent
  }
  return strippedContent.substring(0, maxLength).trim() + '...'
}
