// src/components/BlogSkeleton.tsx
export function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar Skeleton */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-48 h-6 bg-gray-700 rounded skeleton-dark" />
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-700 rounded skeleton-dark" />
              <div className="w-20 h-8 bg-gray-700 rounded skeleton-dark" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar Navigation Skeleton */}
        <nav className="w-64 bg-black border-r border-gray-800 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-full h-8 bg-gray-700 rounded skeleton-dark" />
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area Skeleton */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Title Skeleton */}
            <div className="w-32 h-12 bg-gray-700 rounded skeleton-dark mb-8" />

            {/* Category Filters Skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-8">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="w-20 h-6 bg-gray-700 rounded skeleton-dark" />
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-6 bg-gray-700 rounded skeleton-dark" />
                <div className="w-16 h-6 bg-gray-700 rounded skeleton-dark" />
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-700 rounded skeleton-dark" />
                  <div className="w-8 h-8 bg-gray-700 rounded skeleton-dark" />
                </div>
              </div>
            </div>

            {/* Articles Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Article Skeleton */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-xl p-8 mb-4 h-64 skeleton-dark" />
                <div className="w-48 h-8 bg-gray-700 rounded skeleton-dark mb-2" />
                <div className="w-32 h-4 bg-gray-700 rounded skeleton-dark" />
              </div>

              {/* Smaller Articles Skeleton */}
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="bg-gray-800 rounded-xl p-6 mb-4 h-32 skeleton-dark" />
                    <div className="w-40 h-6 bg-gray-700 rounded skeleton-dark mb-1" />
                    <div className="w-32 h-4 bg-gray-700 rounded skeleton-dark" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
