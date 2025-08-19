# Testing Guide

This project includes comprehensive automated testing to ensure reliability and prevent regressions.

## Test Types

### 1. Unit Tests (Vitest)
Unit tests for individual components and utilities using Vitest and React Testing Library.

**Run unit tests:**
```bash
npm run test:run
```

**Run unit tests with UI:**
```bash
npm run test:ui
```

**Run unit tests with coverage:**
```bash
npm run test:coverage
```

### 2. End-to-End Tests (Cypress)
E2E tests that verify the complete user experience across the application.

**Run E2E tests:**
```bash
npm run test:e2e
```

**Open Cypress UI:**
```bash
npm run cypress:open
```

### 3. All Tests
Run both unit and E2E tests:
```bash
npm run test:all
```

## Test Structure

### Unit Tests
- `src/test/components/` - Component tests
- `src/test/lib/` - Utility function tests
- `src/test/pages/` - Page component tests

### E2E Tests
- `cypress/e2e/blog.cy.ts` - Blog page tests
- `cypress/e2e/homepage.cy.ts` - Homepage tests

## Test Coverage

### Unit Tests Cover:
- ✅ SearchBar component functionality
- ✅ DynamicImport components
- ✅ Data fetching utilities (formatDate)
- ✅ Page components (Blog page)

### E2E Tests Cover:
- ✅ Page loading without errors
- ✅ WordPress content display
- ✅ Navigation functionality
- ✅ Search functionality
- ✅ Accessibility features
- ✅ Responsive design
- ✅ Meta tags and SEO

## Key Test Scenarios

### Blog Page Tests
- Loads without critical errors
- Displays WordPress content
- Has proper navigation
- Search functionality works
- Categories are displayed
- Accessibility attributes are present
- No console errors
- Proper meta tags

### Homepage Tests
- Loads without critical errors
- Displays main content
- Has proper page title
- Shows recent posts
- Navigation links work
- Responsive design
- Accessibility compliance

## Preventing Common Issues

### React.lazy Double-Wrapping
Tests verify that components are not wrapped in `React.lazy()` multiple times, preventing the "Element type is invalid" error.

### Hydration Errors
Tests ensure consistent date formatting between server and client to prevent hydration mismatches.

### API Connection Issues
Tests handle cases where WordPress GraphQL API is unavailable by using fallback content.

## Continuous Integration

These tests should be run:
- Before each commit
- In CI/CD pipeline
- Before deployment

## Troubleshooting

### Test Failures
1. Check if development server is running on port 3000
2. Verify WordPress GraphQL endpoint is accessible
3. Clear `.next` cache if needed: `rm -rf .next`
4. Restart development server: `npm run dev`

### Common Issues
- **"Element type is invalid"**: Check for double-wrapped lazy components
- **Hydration errors**: Verify date formatting consistency
- **API errors**: Check WordPress GraphQL endpoint configuration
