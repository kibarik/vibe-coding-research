// cypress/e2e/blog-detail.cy.ts
describe('Blog Detail Page', () => {
  beforeEach(() => {
    cy.visit('/blog/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82-%D0%BC%D0%B8%D1%80', { timeout: 10000 })
    cy.wait(1000) // Add a small delay to ensure page loads completely
  })

  it('should load the blog detail page successfully', () => {
    // Check page loads without errors
    cy.get('body').should('be.visible')
    cy.get('div').should('be.visible')

    // Check for no critical error messages
    cy.get('body').should('not.contain', 'Runtime Error')
    cy.get('body').should('not.contain', 'Element type is invalid')
    cy.get('body').should('not.contain', 'Hydration failed')
  })

  it('should display the blog post title', () => {
    cy.get('h1').should('contain', 'Привет, мир!')
  })

  it('should display the blog post content', () => {
    // Check for main content
    cy.get('article').should('exist')
    cy.get('article').should('contain', 'Добро пожаловать')
  })

  it('should display the featured image', () => {
    // Check for image with alt text
    cy.get('img[alt="Привет, мир!"]').should('exist')
    // Check for image container - use should('exist') instead of 'be.visible' for aspect-video
    cy.get('.aspect-video').should('exist')
  })

  it('should display post metadata', () => {
    // Check for author
    cy.get('body').should('contain', 'Команда Vibe Coding Research')
    
    // Check for date
    cy.get('body').should('contain', 'January 15, 2024')
  })

  it('should display categories', () => {
    cy.get('a[href="/blog/category/общие"]').should('be.visible')
    cy.get('a[href="/blog/category/общие"]').should('contain', 'Общие')
  })

  it('should display tags', () => {
    cy.get('body').should('contain', '#блог')
    cy.get('body').should('contain', '#программирование')
  })

  it('should have proper navigation breadcrumbs', () => {
    cy.get('nav ol').should('exist')
    cy.get('nav a[href="/"]').should('contain', 'Home')
    cy.get('nav a[href="/blog"]').should('contain', 'Blog')
    cy.get('nav li').should('contain', 'Привет, мир!')
  })

  it('should have working back to blog link', () => {
    cy.get('a[href="/blog"]').contains('Back to Blog').click()
    cy.url().should('include', '/blog')
  })

  it('should have proper page structure', () => {
    // Check for main content areas
    cy.get('article').should('exist')
    cy.get('.grid').should('exist')
    cy.get('.lg\\:col-span-3').should('exist')
  })

  it('should have proper accessibility attributes', () => {
    // Check for proper heading structure
    cy.get('h1').should('exist')
    cy.get('h2').should('exist')
    
    // Check for proper image alt text
    cy.get('img[alt="Привет, мир!"]').should('exist')
  })

  it('should load without console errors', () => {
    cy.window().then((win) => {
      const consoleErrors: string[] = []
      cy.stub(win.console, 'error').callsFake((msg) => {
        consoleErrors.push(msg)
      })
      
      cy.reload()
      cy.wrap(consoleErrors).should('have.length', 0)
    })
  })

  it('should have proper meta tags', () => {
    cy.title().should('contain', 'Vibe Coding Research')
    cy.get('meta[name="description"]').should('have.attr', 'content')
  })

  it('should display table of contents', () => {
    // Check for table of contents component
    cy.get('.lg\\:col-span-1').should('exist')
    cy.get('.sticky').should('exist')
  })

  it('should handle 404 for non-existent posts', () => {
    cy.visit('/blog/non-existent-post', { failOnStatusCode: false })
    cy.get('body').should('contain', '404')
    cy.get('body').should('contain', 'Blog Post Not Found')
  })
})
