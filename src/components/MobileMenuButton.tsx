// src/components/MobileMenuButton.tsx
'use client'

interface MobileMenuButtonProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function MobileMenuButton({ isOpen, onToggle, className = '' }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`lg:hidden p-3 text-white hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-800/50 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black ${className}`}
      aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      aria-expanded={isOpen}
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {isOpen ? (
          // Close icon (X)
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        ) : (
          // Menu icon (hamburger)
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h16" 
          />
        )}
      </svg>
    </button>
  )
}
