// src/app/blog/page.tsx
import { getPosts } from '@/lib/data-fetching'
import Link from 'next/link'
import Image from 'next/image'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

export default async function BlogPage() {
  try {
    const { posts } = await getPosts(12)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Posts</h1>
            <p className="text-gray-600">
              Latest articles and insights from our team.
            </p>
          </div>

          {posts.nodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.nodes.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.featuredImage?.node && (
                    <div className="aspect-video bg-gray-200 relative">
                      <Image
                        src={post.featuredImage.node.sourceUrl}
                        alt={post.featuredImage.node.altText || post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      {post.author?.node && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{post.author.node.name}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    {post.categories.nodes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.categories.nodes.map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts found.</p>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching posts:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Posts
          </h1>
          <p className="text-gray-600">
            Unable to load blog posts. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
