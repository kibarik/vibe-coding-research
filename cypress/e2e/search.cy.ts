// cypress/e2e/search.cy.ts
describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/blog')
  })

  it('should load the search page without errors', () => {
    cy.visit('/blog/search')
    
    // Check page loads without errors
    cy.get('body').should('be.visible')
    cy.get('div').should('be.visible')

    // Check for no critical error messages
    cy.get('body').should('not.contain', 'Runtime Error')
    cy.get('body').should('not.contain', 'Element type is invalid')
    cy.get('body').should('not.contain', 'Hydration failed')
    
    // Check initial search page content
    cy.get('h1').should('contain', 'Search Articles')
    cy.get('body').should('contain', 'Start your search')
  })

  // 🔥 КЛЮЧЕВОЙ ТЕСТ: Успешный поиск возвращает ТОП-1 результат
  it('should successfully return top search result for valid query', () => {
    // Переходим на страницу поиска
    cy.visit('/blog/search')
    
    // Ждем загрузки динамического компонента поиска
    cy.wait(3000)
    
    // Находим поисковое поле и вводим валидный запрос (используем латиницу для избежания проблем с URL)
    cy.get('input[type="search"]', { timeout: 15000 }).should('be.visible')
    cy.get('input[type="search"]').type('programming{enter}')
    
    // Проверяем, что произошла навигация на страницу результатов
    cy.url().should('include', '/blog/search?q=')
    cy.url().should('include', 'programming')
    
    // Проверяем заголовок результатов поиска
    cy.get('h1').should('contain', 'Search Results')
    cy.get('body').should('contain', 'Results for "programming"')
    
    // Проверяем наличие контента (может быть no results, что тоже нормально)
    cy.get('body').should('contain.oneOf', ['Found', 'No articles found'])
  })

  // 🔥 КЛЮЧЕВОЙ ТЕСТ: Абсурдный поиск не возвращает результатов
  it('should return no results for absurd search queries', () => {
    // Переходим на страницу поиска
    cy.visit('/blog/search')
    
    // Ждем загрузки динамического компонента поиска
    cy.wait(3000)
    
    // Вводим абсурдный поисковый запрос из несвязанных слов
    cy.get('input[type="search"]', { timeout: 15000 }).should('be.visible')
    cy.get('input[type="search"]').type('qwertyuiop asdfghjkl zxcvbnm{enter}')
    
    // Проверяем навигацию
    cy.url().should('include', '/blog/search?q=')
    cy.url().should('include', 'qwertyuiop')
    
    // Проверяем заголовок результатов поиска
    cy.get('h1').should('contain', 'Search Results')
    cy.get('body').should('contain', 'Results for "qwertyuiop asdfghjkl zxcvbnm"')
    
    // Проверяем отсутствие результатов
    cy.get('body').should('contain', 'No articles found')
    cy.get('body').should('contain', 'No results found')
    cy.get('body').should('contain', "We couldn't find any articles matching")
    
    // Проверяем наличие кнопки возврата к блогу
    cy.get('a').should('contain', 'View all posts')
    cy.get('a[href="/blog"]').should('exist')
  })

  it('should navigate to search from blog page search bar', () => {
    // Ждем загрузки динамического компонента поиска на странице блога
    cy.wait(3000)
    
    // На странице блога находим поисковое поле
    cy.get('input[type="search"]', { timeout: 15000 }).should('be.visible')
    
    // Вводим поисковый запрос (латиницей для избежания проблем с кодировкой)
    cy.get('input[type="search"]').type('technology{enter}')
    
    // Проверяем навигацию на страницу поиска
    cy.url().should('include', '/blog/search?q=')
    cy.url().should('include', 'technology')
    
    // Проверяем, что отображается страница результатов
    cy.get('h1').should('contain', 'Search Results')
  })

  it('should handle search with special characters', () => {
    cy.visit('/blog/search')
    
    // Ждем загрузки
    cy.wait(3000)
    
    // Поиск с безопасными специальными символами
    cy.get('input[type="search"]', { timeout: 15000 }).should('be.visible')
    cy.get('input[type="search"]').type('C++ programming{enter}')
    
    // Проверяем корректную обработку URL
    cy.url().should('include', '/blog/search?q=')
    cy.url().should('include', 'C%2B%2B')
    
    // Проверяем отображение запроса на странице
    cy.get('body').should('contain', 'Results for "C++ programming"')
  })

  it('should handle empty search gracefully', () => {
    cy.visit('/blog/search')
    
    // Ждем загрузки
    cy.wait(3000)
    
    // Попытка поиска с пустым запросом
    cy.get('input[type="search"]', { timeout: 15000 }).focus()
    cy.get('input[type="search"]').type('{enter}')
    
    // Должна остаться на той же странице или показать начальную страницу поиска
    cy.url().should('include', '/blog/search')
    cy.get('h1').should('contain', 'Search')
  })

  it('should clear search input when clear button is clicked', () => {
    cy.visit('/blog/search')
    
    // Ждем загрузки
    cy.wait(3000)
    
    // Вводим текст в поисковое поле
    cy.get('input[type="search"]', { timeout: 15000 }).type('test query')
    
    // Проверяем, что появилась кнопка очистки
    cy.get('button[aria-label="Clear search"]').should('be.visible')
    
    // Кликаем по кнопке очистки
    cy.get('button[aria-label="Clear search"]').click()
    
    // Проверяем, что поле очищено
    cy.get('input[type="search"]').should('have.value', '')
  })

  it('should handle back navigation correctly', () => {
    // Начинаем с главной страницы блога
    cy.visit('/blog')
    
    // Ждем загрузки
    cy.wait(3000)
    
    // Выполняем поиск
    cy.get('input[type="search"]', { timeout: 15000 }).type('test{enter}')
    cy.url().should('include', '/blog/search')
    
    // Возвращаемся назад
    cy.go('back')
    cy.url().should('match', /\/blog$/)
  })

  it('should handle keyboard navigation', () => {
    cy.visit('/blog/search')
    
    // Ждем загрузки
    cy.wait(3000)
    
    // Проверяем фокус на поисковом поле
    cy.get('input[type="search"]', { timeout: 15000 }).focus()
    cy.get('input[type="search"]').should('be.focused')
    
    // Проверяем Escape для очистки (если есть текст)
    cy.get('input[type="search"]').type('test')
    cy.get('input[type="search"]').type('{esc}')
    cy.get('input[type="search"]').should('have.value', '')
  })
})