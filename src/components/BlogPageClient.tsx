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
      <header className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <h1 className="text-lg font-medium text-white">Vibe Coding Research</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition-colors text-sm">
                Log in
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <nav className="w-64 bg-black border-r border-gray-900 min-h-screen">
          <div className="p-6">
            <div className="space-y-0.5">
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">Research</a>
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">Safety</a>
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">For Business</a>
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">For Developers</a>
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">ChatGPT</a>
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">Sora</a>
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">Stories</a>
              <a href="#" className="block px-3 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">Company</a>
              <a href="#" className="block px-3 py-2.5 bg-gray-900 text-white rounded-md text-sm">News</a>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Title */}
            <h1 className="text-5xl font-bold text-white mb-12">News</h1>

            {/* Category Filters */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex space-x-10">
                <button 
                  className={`transition-colors text-sm ${!currentCategory ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => handleCategoryChange(null)}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    className={`transition-colors text-sm ${currentCategory === category.slug ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-6">
                <button className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                  Filter
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                  Sort
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-1">
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

            {/* Articles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Article (Large) */}
              {posts.length > 0 && (
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl p-12 mb-6 relative overflow-hidden h-80">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20"></div>
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">
                          {posts[0].title.length > 30 ? posts[0].title.substring(0, 30) + '...' : posts[0].title}
                        </h2>
                        <p className="text-blue-100 text-lg">
                          {posts[0].categories?.nodes?.[0]?.name || 'Featured'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    <a href={`/blog/${posts[0].slug}`} className="hover:text-gray-300 transition-colors">
                      {posts[0].title}
                    </a>
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {new Date(posts[0].date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {/* Smaller Articles */}
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
                      <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl p-8 mb-6 h-48 flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                        <div className="relative z-10 text-center">
                          <h4 className="text-2xl font-bold text-white">
                            {post.categories?.nodes?.[0]?.name || 'Article'}
                          </h4>
                        </div>
                      </div>
                      <h5 className="text-xl font-semibold text-white mb-2">
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
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-900 rounded-full px-6 py-3 flex items-center space-x-3 shadow-lg">
          <input 
            type="text" 
            placeholder="Ask ChatGPT" 
            className="bg-transparent text-white placeholder-gray-400 outline-none w-40 text-sm"
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
