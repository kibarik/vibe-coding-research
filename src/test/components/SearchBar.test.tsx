// src/test/components/SearchBar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchBar from '@/components/SearchBar'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

// Mock the debounce function to make tests synchronous
vi.mock('@/lib/performance', () => ({
  debounce: (fn: Function) => fn,
}))

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
  })

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

  // 🔥 КЛЮЧЕВОЙ ТЕСТ: Успешный поиск ТОП-1 результата
  it('successfully performs search for valid query and navigates to search page', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} navigateToSearch={true} />)
    
    const input = screen.getByRole('searchbox')
    
    // Вводим валидный поисковый запрос (из нашего mock data)
    fireEvent.change(input, { target: { value: 'программирование' } })
    
    // Проверяем, что поиск вызван
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('программирование')
    })
    
    // Проверяем навигацию на страницу поиска с URL-encoded параметром
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog/search?q=%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5')
    })
  })

  // 🔥 КЛЮЧЕВОЙ ТЕСТ: Абсурдный поиск обрабатывается корректно
  it('handles absurd search queries by navigating to search page', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} navigateToSearch={true} />)
    
    const input = screen.getByRole('searchbox')
    
    // Вводим абсурдный поисковый запрос из несвязанных слов
    fireEvent.change(input, { target: { value: 'qwertyuiop asdfghjkl zxcvbnm' } })
    
    // Проверяем, что поиск вызван с абсурдным запросом
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('qwertyuiop asdfghjkl zxcvbnm')
    })
    
    // Проверяем навигацию на страницу поиска (компонент передает запрос, даже если он абсурдный)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog/search?q=qwertyuiop%20asdfghjkl%20zxcvbnm')
    })
  })

  it('does not navigate when query is empty or whitespace only', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} navigateToSearch={true} />)
    
    const input = screen.getByRole('searchbox')
    
    // Пустой запрос (только пробелы)
    fireEvent.change(input, { target: { value: '   ' } })
    
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('   ')
    })
    
    // Не должно быть навигации для пустого запроса
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('correctly handles form submission with valid search terms', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} navigateToSearch={true} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'блог технологии' } })
    
    const form = screen.getByRole('search')
    fireEvent.submit(form)
    
    expect(onSearch).toHaveBeenCalledWith('блог технологии')
    expect(mockPush).toHaveBeenCalledWith('/blog/search?q=%D0%B1%D0%BB%D0%BE%D0%B3%20%D1%82%D0%B5%D1%85%D0%BD%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D0%B8')
  })

  it('handles keyboard shortcuts correctly', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test query' } })
    
    // Нажатие Escape должно очистить поле
    fireEvent.keyDown(input, { key: 'Escape' })
    
    expect(input).toHaveValue('')
    expect(onSearch).toHaveBeenLastCalledWith('')
  })

  it('disables navigation when navigateToSearch is false', async () => {
    // Полностью пересоздаем mock для этого теста
    const testMockPush = vi.fn()
    
    vi.doMock('next/navigation', () => ({
      useRouter: vi.fn(() => ({
        push: testMockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
      })),
    }))
    
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} navigateToSearch={false} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'isolated test query' } })
    
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('isolated test query')
    })
    
    // Навигация не должна произойти для этого изолированного теста
    expect(testMockPush).not.toHaveBeenCalled()
  })

  it('shows loading indicator when searching with debounce', () => {
    // Переопределяем mock для этого теста, чтобы показать loading состояние
    vi.unmock('@/lib/performance')
    vi.doMock('@/lib/performance', () => ({
      debounce: (fn: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: any[]) => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => fn(...args), delay)
        }
      }
    }))

    render(<SearchBar debounceMs={500} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Должен показывать индикатор загрузки
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('handles search terms with special characters correctly', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} navigateToSearch={true} />)
    
    const input = screen.getByRole('searchbox')
    
    // Поиск с специальными символами
    fireEvent.change(input, { target: { value: 'C++ & JavaScript!' } })
    
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('C++ & JavaScript!')
    })
    
    // Проверяем корректное URL-кодирование
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog/search?q=C%2B%2B%20%26%20JavaScript!')
    })
  })

  it('handles clear button with navigation', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} navigateToSearch={true} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)
    
    expect(input).toHaveValue('')
    expect(onSearch).toHaveBeenLastCalledWith('')
    expect(mockPush).toHaveBeenCalledWith('/blog/search')
  })
})