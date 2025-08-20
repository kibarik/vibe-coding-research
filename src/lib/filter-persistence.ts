// src/lib/filter-persistence.ts

interface FilterState {
  dateRange: {
    start: string
    end: string
  }
  authors: string[]
  tags: string[]
  featured: boolean | null
  sortBy: string
  viewMode: 'grid' | 'list'
}

const FILTER_STORAGE_KEY = 'blog-filters'

export function saveFiltersToStorage(filters: FilterState): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
  } catch (error) {
    console.error('Error saving filters to localStorage:', error)
  }
}

export function loadFiltersFromStorage(): FilterState | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY)
    if (stored) {
      const filters = JSON.parse(stored) as FilterState
      
      // Validate the loaded filters structure
      if (isValidFilterState(filters)) {
        return filters
      }
    }
  } catch (error) {
    console.error('Error loading filters from localStorage:', error)
  }
  
  return null
}

export function clearFiltersFromStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(FILTER_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing filters from localStorage:', error)
  }
}

function isValidFilterState(filters: unknown): filters is FilterState {
  return (
    filters &&
    typeof filters === 'object' &&
    filters.dateRange &&
    typeof filters.dateRange.start === 'string' &&
    typeof filters.dateRange.end === 'string' &&
    Array.isArray(filters.authors) &&
    Array.isArray(filters.tags) &&
    (filters.featured === null || typeof filters.featured === 'boolean') &&
    typeof filters.sortBy === 'string' &&
    (filters.viewMode === 'grid' || filters.viewMode === 'list')
  )
}

export function getDefaultFilterState(): FilterState {
  return {
    dateRange: { start: '', end: '' },
    authors: [],
    tags: [],
    featured: null,
    sortBy: 'newest',
    viewMode: 'grid'
  }
}

// Hook for managing filter persistence
export function useFilterPersistence() {
  const saveFilters = (filters: FilterState) => {
    saveFiltersToStorage(filters)
  }

  const loadFilters = (): FilterState => {
    return loadFiltersFromStorage() || getDefaultFilterState()
  }

  const clearFilters = () => {
    clearFiltersFromStorage()
  }

  return {
    saveFilters,
    loadFilters,
    clearFilters
  }
}
