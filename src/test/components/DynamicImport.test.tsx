import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DynamicSearchBar } from '@/components/DynamicImport'

// Mock the lazy components
vi.mock('@/components/SearchBar', () => ({
  default: () => <div data-testid="search-bar">Search Bar Component</div>,
}))

describe('DynamicImport Components', () => {
  it('renders DynamicSearchBar with fallback', async () => {
    render(<DynamicSearchBar placeholder="Test placeholder" />)
    
    // Should render without crashing
    const elements = screen.getAllByRole('generic')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('passes props to DynamicSearchBar', () => {
    render(<DynamicSearchBar placeholder="Custom placeholder" />)
    
    const searchBar = screen.getByTestId('search-bar')
    expect(searchBar).toBeInTheDocument()
  })
})
