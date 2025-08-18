'use client'

// src/components/GraphQLTest.tsx
import { useQuery } from '@apollo/client'
import { GET_POSTS } from '@/lib/graphql-queries'
import { Post } from '@/lib/data-fetching'
import { mockPosts } from '@/lib/mock-data'

export function GraphQLTest() {
  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: { first: 3 },
    errorPolicy: 'all',
  })

  // Use mock data if GraphQL fails
  const posts = data?.posts?.nodes || mockPosts.slice(0, 3)

  if (loading) return (
    <div className="p-4 text-gray-600 dark:text-gray-300" role="status" aria-live="polite">
      Loading posts...
    </div>
  )

  return (
    <section className="p-4" aria-labelledby="recent-posts-title">
      <h2 id="recent-posts-title" className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Recent Posts
      </h2>
      {error && (
        <div 
          className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-800 dark:text-yellow-200"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm">
            <strong>Note:</strong> Using demo data. Configure your WordPress GraphQL endpoint in <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local</code> to connect to your WordPress site.
          </p>
        </div>
      )}
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
                  {new Date(post.date).toLocaleDateString()}
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
