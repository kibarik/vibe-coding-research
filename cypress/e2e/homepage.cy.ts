describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage without errors', () => {
    // Check page loads without errors
    cy.get('body').should('be.visible')
    cy.get('div').should('be.visible')
    
    // Check for no critical error messages
    cy.get('body').should('not.contain', 'Runtime Error')
    cy.get('body').should('not.contain', 'Element type is invalid')
  })

  it('should display the main content', () => {
    // Check for main content areas
    cy.get('main').should('exist')
    cy.get('header').should('exist')
    
    // Check for navigation
    cy.get('nav').should('exist')
    cy.get('a[href="/blog"]').should('exist')
  })

  it('should have proper page title', () => {
    cy.title().should('contain', 'Vibe Coding Research')
  })

  it('should display WordPress content', () => {
    // Check for WordPress content or demo content
    cy.get('body').should('contain', 'Recent Posts')
  })

  it('should have proper page structure', () => {
    // Check for semantic HTML elements
    cy.get('header').should('exist')
    cy.get('main').should('exist')
    cy.get('footer').should('exist')
  })

  it('should have working navigation links', () => {
    // Check blog link
    cy.get('a[href="/blog"]').should('be.visible')
    cy.get('a[href="/blog"]').first().click()
    cy.url().should('include', '/blog')
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
    cy.get('meta[name="description"]').should('exist')
  })

  it('should be accessible', () => {
    // Check for proper heading structure
    cy.get('h1').should('exist')
    
    // Check for proper ARIA labels
    cy.get('nav').should('have.attr', 'aria-label')
  })

  it('should display recent posts section', () => {
    // Check for recent posts
    cy.get('body').should('contain', 'Recent Posts')
  })

  it('should have proper responsive design', () => {
    // Check mobile viewport
    cy.viewport('iphone-6')
    cy.get('body').should('be.visible')
    
    // Check desktop viewport
    cy.viewport(1920, 1080)
    cy.get('body').should('be.visible')
  })
})
