describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage without errors', () => {
    cy.get('body').should('be.visible')
    cy.get('main').should('exist')
  })

  it('should display the main content', () => {
    cy.get('main').should('be.visible')
  })

  it('should have proper page title', () => {
    cy.title().should('not.be.empty')
  })
})
