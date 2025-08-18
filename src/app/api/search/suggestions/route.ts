// src/app/api/search/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/data-fetching'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // Search for posts using WPGraphQL
    const { posts } = await searchPosts(query.trim(), limit)

    // Transform the results for suggestions
    const suggestions = posts.nodes.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    )
  }
}
