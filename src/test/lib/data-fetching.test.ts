import { describe, it, expect } from 'vitest'
import { formatDate } from '@/lib/data-fetching'

describe('Data Fetching Utilities', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const testDate = '2024-01-15T10:30:00Z'
      const formatted = formatDate(testDate)
      
      expect(formatted).toBe('January 15, 2024')
    })

    it('handles different date formats', () => {
      const testDate = '2024-12-31T23:59:59Z'
      const formatted = formatDate(testDate)
      
      expect(formatted).toBe('December 31, 2024')
    })

    it('returns consistent format for same date', () => {
      const testDate = '2024-06-15T12:00:00Z'
      const formatted1 = formatDate(testDate)
      const formatted2 = formatDate(testDate)
      
      expect(formatted1).toBe(formatted2)
      expect(formatted1).toBe('June 15, 2024')
    })
  })
})
