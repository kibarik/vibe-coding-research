describe('Blog Page', () => {
  beforeEach(() => {
    cy.visit('/blog')
  })

  it('should load the blog page successfully', () => {
    cy.get('body').should('be.visible')
    cy.get('div').should('be.visible')
  })

  it('should display WordPress content', () => {
    cy.get('body').should('contain', 'Привет, мир!')
  })

  it('should have navigation elements', () => {
    cy.get('[role="navigation"]').should('be.visible')
  })
})
