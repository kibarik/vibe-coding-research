'use client'

import { useState, useCallback, useEffect } from 'react'
import { BlogSkeleton } from './BlogSkeleton'
import { FeaturedArticle } from './FeaturedArticle'
import { ArticleCard } from './ArticleCard'

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
  const [mounted, setMounted] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author'>('date')

  // Ensure consistent hydration
  useEffect(() => {
    setMounted(true)
    setCurrentCategory(selectedCategory)
  }, [selectedCategory])

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

  if (isLoading || !mounted) {
    return <BlogSkeleton />
  }

  // Filter posts by category if selected
  const filteredPosts = currentCategory 
    ? posts.filter(post => post.categories.nodes.some(cat => cat.slug === currentCategory))
    : posts

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-800/50 backdrop-blur-xl bg-black/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Vibe Coding Research
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">Research</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">Safety</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">For Business</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">For Developers</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-800/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm shadow-lg">
                Log in
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <nav className="w-80 bg-black/50 backdrop-blur-xl border-r border-gray-800/50 min-h-screen sticky top-16">
          <div className="p-8">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Navigation</h3>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Research
              </a>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Safety
              </a>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                </svg>
                For Business
              </a>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                For Developers
              </a>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                ChatGPT
              </a>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Sora
              </a>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Stories
              </a>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-sm rounded-xl group">
                <svg className="w-4 h-4 mr-3 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Company
              </a>
              <a href="#" className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white rounded-xl text-sm font-medium border border-blue-500/30">
                <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                News
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-8 py-12">
            {/* Page Title */}
            <div className="mb-16">
              <h1 className="text-7xl font-bold text-white mb-6 tracking-tight leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                News
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
                Stay updated with the latest insights in coding, technology, and development practices. 
                Discover cutting-edge techniques and best practices from industry experts.
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex items-center justify-between mb-16">
              <div className="flex space-x-8">
                <button 
                  className={`transition-all duration-300 text-sm font-semibold px-4 py-2 rounded-full ${!currentCategory ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                  onClick={() => handleCategoryChange(null)}
                >
                  All ({posts.length})
                </button>
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    className={`transition-all duration-300 text-sm font-semibold px-4 py-2 rounded-full ${currentCategory === category.slug ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64"
                  />
                  <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
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
                <div className="flex items-center space-x-2 bg-gray-800/50 rounded-xl p-1">
                  <button 
                    className={`p-2 transition-all duration-200 rounded-lg ${viewMode === 'grid' ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => handleViewModeChange('grid')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                    </svg>
                  </button>
                  <button 
                    className={`p-2 transition-all duration-200 rounded-lg ${viewMode === 'list' ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' : 'text-gray-400 hover:text-white'}`}
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
            {filteredPosts.length > 0 ? (
              <div className="space-y-16">
                {/* Featured Article */}
                <div className="mb-16">
                  <FeaturedArticle post={filteredPosts[0]} />
                </div>

                {/* Other Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.slice(1).map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Load More Section */}
                <div className="text-center pt-16">
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Load more articles
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 text-lg mb-4">No articles found</div>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Enhanced Bottom Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-full px-8 py-4 flex items-center space-x-4 shadow-2xl border border-gray-700/50">
          <input 
            type="text" 
            placeholder="Ask ChatGPT anything..." 
            className="bg-transparent text-white placeholder-gray-400 outline-none w-72 text-sm font-medium"
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
