'use client'

// src/components/GraphQLTest.tsx
import { Post, formatDate } from '@/lib/data-fetching'
import { mockPosts } from '@/lib/mock-data'

export function GraphQLTest() {
  // Use mock data for now to avoid GraphQL connection issues
  const posts = mockPosts.slice(0, 3)

  return (
    <section className="p-4" aria-labelledby="recent-posts-title">
      <h2 id="recent-posts-title" className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Recent Posts
      </h2>
      <div 
        className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-200"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm">
          <strong>Note:</strong> Using demo data. The WordPress GraphQL endpoint is configured at <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">https://blog-admin.aiworkplace.ru/graphql</code>
        </p>
      </div>
      {posts.length > 0 ? (
        <div className="space-y-4" role="feed" aria-busy="false">
          {posts.map((post: Post) => (
            <article
              key={post.id}
              className="border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 shadow-sm"
              aria-labelledby={`post-title-${post.id}`}
              aria-describedby={`post-excerpt-${post.id}`}
            >
              <h3 id={`post-title-${post.id}`} className="font-semibold text-gray-900 dark:text-white">
                {post.title}
              </h3>
              <p id={`post-excerpt-${post.id}`} className="text-gray-600 dark:text-gray-300 mt-2">
                {post.excerpt}
              </p>
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {post.author?.node?.name && (
                  <span>By {post.author.node.name}</span>
                )}
                <span className="mx-2" aria-hidden="true">•</span>
                <time dateTime={post.date}>
                  {formatDate(post.date)}
                </time>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300" role="status" aria-live="polite">
          No posts found.
        </p>
      )}
    </section>
  )
}
