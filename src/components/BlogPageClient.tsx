'use client'

import { useState, useCallback } from 'react'
import { BlogSkeleton } from './BlogSkeleton'

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
    // Здесь можно добавить навигацию или обновление URL
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // Здесь можно добавить логику поиска
  }, [])

  const handleFiltersChange = useCallback((filters: any) => {
    // Обработка изменения фильтров
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
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Vibe Coding Research</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition-colors">
                Log in
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <nav className="w-64 bg-black border-r border-gray-800 min-h-screen">
          <div className="p-6">
            <div className="space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">Research</a>
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">Safety</a>
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">For Business</a>
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">For Developers</a>
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">ChatGPT</a>
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">Sora</a>
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">Stories</a>
              <a href="#" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">Company</a>
              <a href="#" className="block px-3 py-2 bg-gray-800 text-white rounded-md">News</a>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Title */}
            <h1 className="text-4xl font-bold text-white mb-8">News</h1>

            {/* Category Filters */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-8">
                <button 
                  className={`transition-colors ${!currentCategory ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => handleCategoryChange(null)}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    className={`transition-colors ${currentCategory === category.slug ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-gray-800 text-white placeholder-gray-400 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors flex items-center">
                  Filter
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors flex items-center">
                  Sort
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleViewModeChange('grid')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                    </svg>
                  </button>
                  <button 
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleViewModeChange('list')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h18v-2H3v2zm0 6h18v-2H3v2zM3 5v2h18V5H3z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Articles Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : 'space-y-6'}>
              {/* Featured Article (Large) - Grid Mode Only */}
              {viewMode === 'grid' && posts.length > 0 && (
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-500 rounded-xl p-8 mb-4 relative overflow-hidden">
                    <div className="bg-white rounded-lg p-6 text-center">
                      <h2 className="text-3xl font-bold text-black mb-2">
                        {posts[0].title.length > 20 ? posts[0].title.substring(0, 20) + '...' : posts[0].title}
                      </h2>
                      <p className="text-gray-600">
                        {posts[0].categories?.nodes?.[0]?.name || 'Featured'}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    <a href={`/blog/${posts[0].slug}`} className="hover:text-gray-300 transition-colors">
                      {posts[0].title}
                    </a>
                  </h3>
                  <p className="text-gray-400">
                    {new Date(posts[0].date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {/* Articles */}
              {viewMode === 'grid' ? (
                <div className="space-y-8">
                  {posts.slice(1, 4).map((post, index) => {
                    const gradients = [
                      'from-blue-500 to-blue-600',
                      'from-cyan-400 to-blue-500',
                      'from-purple-500 to-pink-500',
                      'from-green-500 to-teal-500'
                    ]
                    
                    return (
                      <div key={post.id}>
                        <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-xl p-6 mb-4`}>
                          <h4 className="text-xl font-bold text-white">
                            {post.categories?.nodes?.[0]?.name || 'Article'}
                          </h4>
                        </div>
                        <h5 className="text-lg font-semibold text-white mb-1">
                          <a href={`/blog/${post.slug}`} className="hover:text-gray-300 transition-colors">
                            {post.title}
                          </a>
                        </h5>
                        <p className="text-gray-400">
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // List Mode
                posts.map((post, index) => {
                  const gradients = [
                    'from-blue-500 to-blue-600',
                    'from-cyan-400 to-blue-500',
                    'from-purple-500 to-pink-500',
                    'from-green-500 to-teal-500'
                  ]
                  
                  return (
                    <div key={post.id} className="flex items-center space-x-6 p-6 bg-gray-900 rounded-xl">
                      <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-lg p-4 w-24 h-24 flex items-center justify-center flex-shrink-0`}>
                        <h4 className="text-sm font-bold text-white text-center">
                          {post.categories?.nodes?.[0]?.name || 'Article'}
                        </h4>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-xl font-semibold text-white mb-2">
                          <a href={`/blog/${post.slug}`} className="hover:text-gray-300 transition-colors">
                            {post.title}
                          </a>
                        </h5>
                        <p className="text-gray-400 text-sm">
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-800 rounded-full px-4 py-2 flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Ask ChatGPT" 
            className="bg-transparent text-white placeholder-gray-400 outline-none w-32"
          />
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
