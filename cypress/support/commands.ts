/// <reference types="cypress" />

// Add global configuration for Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})
