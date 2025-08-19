describe('Blog Page', () => {
  beforeEach(() => {
    cy.visit('/blog')
  })

  it('should load the blog page successfully', () => {
    // Check page loads without errors
    cy.get('body').should('be.visible')
    cy.get('div').should('be.visible')
    
    // Check for no critical error messages
    cy.get('body').should('not.contain', 'Runtime Error')
    cy.get('body').should('not.contain', 'Element type is invalid')
  })

  it('should display WordPress content', () => {
    cy.get('body').should('contain', 'Привет, мир!')
  })

  it('should have navigation elements', () => {
    cy.get('[role="navigation"]').should('be.visible')
  })

  it('should display main page components', () => {
    // Check header
    cy.get('h1').should('contain', 'Blog & Insights')
    cy.get('p').should('contain', 'Latest articles and insights')
    
    // Check search functionality
    cy.get('input[type="search"]').should('be.visible')
    cy.get('input[type="search"]').should('have.attr', 'placeholder', 'Search articles...')
    
    // Check article count
    cy.get('body').should('contain', 'article')
  })

  it('should display blog posts correctly', () => {
    // Check for article elements
    cy.get('article').should('exist')
    
    // Check for post titles
    cy.get('h2').should('exist')
    
    // Check for post excerpts
    cy.get('p').should('exist')
  })

  it('should have proper page structure', () => {
    // Check for main content areas
    cy.get('header').should('exist')
    cy.get('section').should('exist')
    
    // Check for proper heading hierarchy
    cy.get('h1').should('exist')
    cy.get('h2').should('exist')
  })

  it('should handle search functionality', () => {
    // Type in search box
    cy.get('input[type="search"]').type('test')
    
    // Check search input works
    cy.get('input[type="search"]').should('have.value', 'test')
  })

  it('should display categories', () => {
    // Check for category elements
    cy.get('body').should('contain', 'Без рубрики')
  })

  it('should have proper accessibility attributes', () => {
    // Check for proper ARIA labels
    cy.get('input[type="search"]').should('have.attr', 'aria-label')
    
    // Check for proper roles
    cy.get('[role="navigation"]').should('exist')
    cy.get('[role="feed"]').should('exist')
  })

  it('should load without console errors', () => {
    // Check for console errors
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError')
    })
    
    cy.get('@consoleError').should('not.be.called')
  })

  it('should have proper meta tags', () => {
    cy.get('head').should('contain', 'Vibe Coding Research')
    cy.title().should('contain', 'Vibe Coding Research')
  })
})
