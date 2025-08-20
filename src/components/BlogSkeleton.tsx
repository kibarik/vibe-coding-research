// src/components/BlogSkeleton.tsx
export function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar Skeleton */}
      <header className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
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
        <nav className="w-64 bg-black border-r border-gray-900 min-h-screen">
          <div className="p-6">
            <div className="space-y-0.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-full h-10 bg-gray-700 rounded skeleton-dark" />
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area Skeleton */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Title Skeleton */}
            <div className="w-32 h-16 bg-gray-700 rounded skeleton-dark mb-12" />

            {/* Category Filters Skeleton */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex space-x-10">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="w-20 h-6 bg-gray-700 rounded skeleton-dark" />
                ))}
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-6 bg-gray-700 rounded skeleton-dark" />
                <div className="w-16 h-6 bg-gray-700 rounded skeleton-dark" />
                <div className="flex space-x-1">
                  <div className="w-8 h-8 bg-gray-700 rounded skeleton-dark" />
                  <div className="w-8 h-8 bg-gray-700 rounded skeleton-dark" />
                </div>
              </div>
            </div>

            {/* Articles Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Article Skeleton */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-2xl p-12 mb-6 h-80 skeleton-dark" />
                <div className="w-64 h-10 bg-gray-700 rounded skeleton-dark mb-3" />
                <div className="w-32 h-6 bg-gray-700 rounded skeleton-dark" />
              </div>

              {/* Smaller Articles Skeleton */}
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="bg-gray-800 rounded-2xl p-8 mb-6 h-48 skeleton-dark" />
                    <div className="w-48 h-7 bg-gray-700 rounded skeleton-dark mb-2" />
                    <div className="w-32 h-5 bg-gray-700 rounded skeleton-dark" />
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
