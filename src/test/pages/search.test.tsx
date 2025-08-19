// src/test/pages/search.test.tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SearchPage from '@/app/blog/search/page'
import { mockPosts } from '@/lib/mock-data'

// Mock the data fetching function
vi.mock('@/lib/data-fetching', () => ({
  searchPosts: vi.fn(),
  formatDate: vi.fn().mockImplementation((date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })
}))

const { searchPosts } = await import('@/lib/data-fetching')

describe('Search Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 🔥 КЛЮЧЕВОЙ ТЕСТ: Успешный поиск возвращает ТОП-1 результат
  it('displays top search result when valid query is provided', async () => {
    // Mock успешного поиска с ТОП-1 результатом
    vi.mocked(searchPosts).mockResolvedValue({
      posts: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        nodes: [mockPosts[0]] // Возвращаем первый пост как ТОП-1 результат
      }
    })

    const mockSearchParams = Promise.resolve({ q: 'программирование' })
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Проверяем, что заголовок отображается
    expect(screen.getByText('Search Results')).toBeInTheDocument()
    
    // Проверяем отображение поискового запроса
    expect(screen.getByText('Results for "программирование"')).toBeInTheDocument()
    
    // Проверяем, что отображается количество результатов
    expect(screen.getByText(/Found 1 article for "программирование"/)).toBeInTheDocument()
    
    // Проверяем, что отображается ТОП-1 результат
    expect(screen.getByText('Привет, мир!')).toBeInTheDocument()
    expect(screen.getByText('Первая статья в блоге о программировании и технологиях.')).toBeInTheDocument()
    
    // Проверяем, что функция поиска была вызвана
    expect(searchPosts).toHaveBeenCalledWith('программирование', 20)
  })

  // 🔥 КЛЮЧЕВОЙ ТЕСТ: Абсурдный поиск не возвращает результатов
  it('displays no results message for absurd search queries', async () => {
    // Mock пустого результата поиска
    vi.mocked(searchPosts).mockResolvedValue({
      posts: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        nodes: [] // Пустой массив для абсурдного запроса
      }
    })

    const mockSearchParams = Promise.resolve({ q: 'qwertyuiop asdfghjkl zxcvbnm' })
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Проверяем, что заголовок отображается
    expect(screen.getByText('Search Results')).toBeInTheDocument()
    
    // Проверяем отображение абсурдного поискового запроса
    expect(screen.getByText('Results for "qwertyuiop asdfghjkl zxcvbnm"')).toBeInTheDocument()
    
    // Проверяем сообщение об отсутствии результатов
    expect(screen.getByText('No articles found for "qwertyuiop asdfghjkl zxcvbnm"')).toBeInTheDocument()
    
    // Проверяем отображение иконки и сообщения "No results found"
    expect(screen.getByText('No results found')).toBeInTheDocument()
    expect(screen.getByText(/We couldn't find any articles matching/)).toBeInTheDocument()
    
    // Проверяем наличие кнопки "View all posts"
    expect(screen.getByText('View all posts')).toBeInTheDocument()
    
    // Проверяем, что функция поиска была вызвана
    expect(searchPosts).toHaveBeenCalledWith('qwertyuiop asdfghjkl zxcvbnm', 20)
  })

  it('displays search input page when no query is provided', async () => {
    const mockSearchParams = Promise.resolve({})
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Проверяем заголовок страницы поиска
    expect(screen.getByText('Search Articles')).toBeInTheDocument()
    
    // Проверяем описание
    expect(screen.getByText('Enter your search terms to find relevant articles and insights.')).toBeInTheDocument()
    
    // Проверяем сообщение о начале поиска
    expect(screen.getByText('Start your search')).toBeInTheDocument()
    expect(screen.getByText('Enter keywords to find articles about coding, technology, and development best practices.')).toBeInTheDocument()
    
    // Поиск не должен вызываться без запроса
    expect(searchPosts).not.toHaveBeenCalled()
  })

  it('displays multiple search results correctly', async () => {
    // Mock поиска с несколькими результатами
    vi.mocked(searchPosts).mockResolvedValue({
      posts: {
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: 'cursor123',
        },
        nodes: mockPosts.slice(0, 3) // Возвращаем первые 3 поста
      }
    })

    const mockSearchParams = Promise.resolve({ q: 'технологии' })
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Проверяем количество результатов
    expect(screen.getByText(/Found 3 articles for "технологии"/)).toBeInTheDocument()
    
    // Проверяем, что отображается первый результат
    expect(screen.getByText('Привет, мир!')).toBeInTheDocument()
    
    // Проверяем наличие кнопки "Load More Results" (если есть следующая страница)
    expect(screen.getByText('Load More Results')).toBeInTheDocument()
  })

  it('handles search errors gracefully', async () => {
    // Mock ошибки поиска
    vi.mocked(searchPosts).mockRejectedValue(new Error('Search failed'))

    const mockSearchParams = Promise.resolve({ q: 'error test' })
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Проверяем отображение страницы ошибки
    expect(screen.getByText('Search Error')).toBeInTheDocument()
    expect(screen.getByText("We're having trouble processing your search. Please try again.")).toBeInTheDocument()
    expect(screen.getByText('Back to Blog')).toBeInTheDocument()
  })

  it('displays search results with correct metadata', async () => {
    vi.mocked(searchPosts).mockResolvedValue({
      posts: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        nodes: [mockPosts[0]]
      }
    })

    const mockSearchParams = Promise.resolve({ q: 'блог' })
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Проверяем метаданные поста
    expect(screen.getByText('Команда Vibe Coding Research')).toBeInTheDocument()
    
    // Проверяем наличие ссылки "Read more"
    expect(screen.getByText('Read more')).toBeInTheDocument()
  })

  it('handles empty search query correctly', async () => {
    const mockSearchParams = Promise.resolve({ q: '' })
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Должна отображаться страница начального поиска
    expect(screen.getByText('Search Articles')).toBeInTheDocument()
    expect(searchPosts).not.toHaveBeenCalled()
  })

  it('handles whitespace-only search query', async () => {
    vi.mocked(searchPosts).mockResolvedValue({
      posts: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        nodes: []
      }
    })

    const mockSearchParams = Promise.resolve({ q: '   ' })
    
    const page = await SearchPage({ searchParams: mockSearchParams })
    render(page)

    // Проверяем, что поиск все же выполняется
    expect(screen.getByText('Search Results')).toBeInTheDocument()
    
    // Ищем текст более гибко, учитывая что пробелы могут отображаться по-разному
    expect(screen.getByText((content, element) => {
      return content.includes('Results for') && element?.textContent?.includes('   ')
    })).toBeInTheDocument()
    
    expect(searchPosts).toHaveBeenCalledWith('   ', 20)
  })
})
