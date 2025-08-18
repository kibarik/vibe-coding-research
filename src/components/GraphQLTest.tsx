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

  if (loading) return <div className="p-4">Loading posts...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          <p className="text-sm">
            <strong>Note:</strong> Using demo data. Configure your WordPress GraphQL endpoint in <code>.env.local</code> to connect to your WordPress site.
          </p>
        </div>
      )}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: Post) => (
            <div key={post.id} className="border p-4 rounded bg-white shadow-sm">
              <h3 className="font-semibold text-gray-900">{post.title}</h3>
              <p className="text-gray-600 mt-2">{post.excerpt}</p>
              <div className="mt-3 text-sm text-gray-500">
                {post.author?.node?.name && (
                  <span>By {post.author.node.name}</span>
                )}
                <span className="mx-2">•</span>
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No posts found.</p>
      )}
    </div>
  )
}
