// src/app/blog/page.tsx
import { Suspense } from 'react'
import { getPosts, getCategories, getPostsByCategory, getAuthors } from '@/lib/data-fetching'
import { BlogListingSEO } from '@/components/SEO'
import { BlogPageClient } from '@/components/BlogPageClient'
import { BlogSkeleton } from '@/components/BlogSkeleton'
import { ErrorState } from '@/components/ErrorState'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

interface BlogPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

// Main blog content component
async function BlogContent({ searchParams }: BlogPageProps) {
  try {
    const { category } = await searchParams
    
    // Fetch categories, authors and posts
    const [categoriesResponse, authorsResponse, postsResponse] = await Promise.all([
      getCategories(),
      getAuthors(),
      category ? getPostsByCategory(category, 12) : getPosts(12)
    ])

    const { categories } = categoriesResponse
    const { authors } = authorsResponse
    const { posts } = postsResponse

    return (
      <>
        {/* SEO Component */}
        <BlogListingSEO category={category} />
        
        {/* Client Component for interactive functionality */}
        <BlogPageClient
          posts={posts.nodes}
          categories={categories.nodes}
          authors={authors.nodes}
          selectedCategory={category || null}
        />
      </>
    )
  } catch (error) {
    console.error('Error fetching posts:', error)
    return <ErrorState />
  }
}

// Main blog page with Suspense
export default function BlogPage(props: BlogPageProps) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogContent {...props} />
    </Suspense>
  )
}
