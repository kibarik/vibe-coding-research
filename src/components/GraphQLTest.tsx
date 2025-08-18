'use client'

// src/components/GraphQLTest.tsx
import { useQuery } from '@apollo/client'
import { GET_POSTS } from '@/lib/graphql-queries'
import { Post } from '@/lib/data-fetching'

export function GraphQLTest() {
  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: { first: 3 },
  })

  if (loading) return <div className="p-4">Loading posts...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">GraphQL Test - Recent Posts</h2>
      {data?.posts?.nodes?.length > 0 ? (
        <div className="space-y-4">
          {data.posts.nodes.map((post: Post) => (
            <div key={post.id} className="border p-4 rounded">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-gray-600">{post.excerpt}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No posts found. Make sure your WordPress GraphQL endpoint is configured correctly.</p>
      )}
    </div>
  )
}
