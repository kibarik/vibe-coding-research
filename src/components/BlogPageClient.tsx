'use client'

import { useState, useCallback } from 'react'
import { BlogSkeleton } from './BlogSkeleton'
import { FeaturedArticle } from './FeaturedArticle'

import type { Post } from '@/lib/data-fetching'

interface BlogPageClientProps {
  posts: Post[]
  categories: Array<{
    id: string
    name: string
    slug: string
    count: number
  }>
  authors: Array<{
    id: string
    name: string
    slug: string
  }>
  selectedCategory: string | null
  isLoading?: boolean
}

export function BlogPageClient({
  posts,
  categories,
  authors,
  selectedCategory,
  isLoading = false
}: BlogPageClientProps) {
  const [currentCategory, setCurrentCategory] = useState<string | null>(selectedCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author'>('date')

  const handleCategoryChange = useCallback((categorySlug: string | null) => {
    setCurrentCategory(categorySlug)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFiltersChange = useCallback((filters: any) => {
    console.log('Filters changed:', filters)
  }, [])

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
  }, [])

  if (isLoading) {
    return <BlogSkeleton />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-900/50 backdrop-blur-sm bg-black/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white tracking-tight">Vibe Coding Research</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-900/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 text-sm">
                Log in
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <nav className="w-72 bg-black border-r border-gray-900/50 min-h-screen sticky top-16">
          <div className="p-8">
            <div className="space-y-1">
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">Research</a>
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">Safety</a>
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">For Business</a>
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">For Developers</a>
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">ChatGPT</a>
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">Sora</a>
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">Stories</a>
              <a href="#" className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900/50 transition-all duration-200 text-sm rounded-lg">Company</a>
              <a href="#" className="block px-4 py-3 bg-gray-900/80 text-white rounded-lg text-sm font-medium border border-gray-700/50">News</a>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-8 py-12">
            {/* Page Title */}
            <h1 className="text-6xl font-bold text-white mb-16 tracking-tight leading-tight">News</h1>

            {/* Category Filters */}
            <div className="flex items-center justify-between mb-16">
              <div className="flex space-x-12">
                <button 
                  className={`transition-all duration-200 text-sm font-medium ${!currentCategory ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => handleCategoryChange(null)}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    className={`transition-all duration-200 text-sm font-medium ${currentCategory === category.slug ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-8">
                <button className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center text-sm font-medium">
                  Filter
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center text-sm font-medium">
                  Sort
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg p-1">
                  <button 
                    className={`p-2 transition-all duration-200 rounded-md ${viewMode === 'grid' ? 'text-white bg-gray-800/80' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleViewModeChange('grid')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                    </svg>
                  </button>
                  <button 
                    className={`p-2 transition-all duration-200 rounded-md ${viewMode === 'list' ? 'text-white bg-gray-800/80' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleViewModeChange('list')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h18v-2H3v2zm0 6h18v-2H3v2zM3 5v2h18V5H3z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Featured Article (Large) */}
              {posts.length > 0 && (
                <div className="lg:col-span-2">
                  <FeaturedArticle post={posts[0]} />
                </div>
              )}

              {/* Smaller Articles */}
              <div className="space-y-12">
                {posts.slice(1, 4).map((post, index) => {
                  const gradients = [
                    'from-emerald-500 via-teal-500 to-cyan-500',
                    'from-purple-500 via-pink-500 to-rose-500', 
                    'from-orange-500 via-red-500 to-pink-500',
                    'from-indigo-500 via-purple-500 to-pink-500'
                  ]
                  
                  return (
                    <div key={post.id} className="group">
                      <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl p-10 mb-6 h-56 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                        <div className="relative z-10 text-center">
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-4">
                            {post.categories?.nodes?.[0]?.name || 'Article'}
                          </span>
                          <h4 className="text-2xl font-bold text-white leading-tight">
                            {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                          </h4>
                        </div>
                      </div>
                      <h5 className="text-2xl font-bold text-white mb-3 leading-tight">
                        <a href={`/blog/${post.slug}`} className="hover:text-blue-400 transition-colors duration-200">
                          {post.title}
                        </a>
                      </h5>
                      <p className="text-gray-400 font-medium">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Load More Section */}
            <div className="mt-20 text-center">
              <button className="px-8 py-4 bg-gray-900/50 hover:bg-gray-800/80 text-white font-medium rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50">
                Load more articles
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Bottom Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-full px-8 py-4 flex items-center space-x-4 shadow-2xl border border-gray-700/50">
          <input 
            type="text" 
            placeholder="Ask ChatGPT anything..." 
            className="bg-transparent text-white placeholder-gray-400 outline-none w-64 text-sm font-medium"
          />
          <div className="w-px h-6 bg-gray-600/50"></div>
          <button className="text-gray-400 hover:text-white transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
