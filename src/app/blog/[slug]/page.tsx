// src/app/blog/[slug]/page.tsx
import { getPosts, getPostBySlug } from '@/lib/data-fetching'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

// Generate static params for all posts
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts(100) // Get up to 100 posts for static generation
    
    return posts.nodes.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { post } = await getPostBySlug(slug)
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      }
    }

    return {
      title: post.seo?.title || post.title,
      description: post.seo?.metaDesc || post.excerpt,
      openGraph: {
        title: post.seo?.opengraphTitle || post.title,
        description: post.seo?.opengraphDescription || post.excerpt,
        images: post.seo?.opengraphImage?.sourceUrl 
          ? [{ url: post.seo.opengraphImage.sourceUrl }]
          : post.featuredImage?.node?.sourceUrl 
          ? [{ url: post.featuredImage.node.sourceUrl }]
          : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { post } = await getPostBySlug(slug)
    
    if (!post) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Blog
            </Link>
          </nav>

          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {post.featuredImage?.node && (
              <div className="aspect-video bg-gray-200 relative">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}
            
            <div className="p-8">
              {/* Article Meta */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
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
                {post.modified !== post.date && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      Updated {new Date(post.modified).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </>
                )}
              </div>

              {/* Article Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              {/* Categories and Tags */}
              <div className="mb-6">
                {post.categories.nodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.categories.nodes.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
                {post.tags.nodes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.nodes.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </div>
          </article>

          {/* Author Info */}
          {post.author?.node && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About the Author
              </h3>
              <div className="flex items-center">
                {post.author.node.avatar?.url && (
                  <div className="relative w-12 h-12 mr-4">
                    <Image
                      src={post.author.node.avatar.url}
                      alt={post.author.node.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {post.author.node.name}
                  </p>
                  <p className="text-gray-600">
                    Author at Vibe Coding Research
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    notFound()
  }
}
