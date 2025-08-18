// src/app/page.tsx
import { GraphQLTest } from '@/components/GraphQLTest'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Vibe Coding Research
            </h1>
            <nav className="space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Blog
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome to Our Blog
          </h2>
          <p className="text-gray-600">
            A modern blog built with Next.js and WPGraphQL integration.
          </p>
        </div>

        <GraphQLTest />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500">
            © 2024 Vibe Coding Research. Built with Next.js and WPGraphQL.
          </p>
        </div>
      </footer>
    </div>
  )
}
