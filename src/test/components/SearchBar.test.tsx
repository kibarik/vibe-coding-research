import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '@/components/SearchBar'

// Mock the debounce function
vi.mock('@/lib/performance', () => ({
  debounce: (fn: Function) => fn,
}))

describe('SearchBar Component', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search articles...')
  })

  it('handles input changes', async () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByRole('searchbox')
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('test query')
    })
  })

  it('shows clear button when input has value', async () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByRole('searchbox')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })
  })

  it('clears input when clear button is clicked', async () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByRole('searchbox')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)
    })
    
    expect(searchInput).toHaveValue('')
  })

  it('calls onSearch callback when provided', async () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const searchInput = screen.getByRole('searchbox')
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query')
    })
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar placeholder="Custom placeholder" />)
    
    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toHaveAttribute('placeholder', 'Custom placeholder')
  })
})
