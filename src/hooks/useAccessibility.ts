// src/hooks/useAccessibility.ts
'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseAccessibilityOptions {
  trapFocus?: boolean
  closeOnEscape?: boolean
  onClose?: () => void
  autoFocus?: boolean
}

export function useAccessibility({
  trapFocus = false,
  closeOnEscape = false,
  onClose,
  autoFocus = false
}: UseAccessibilityOptions = {}) {
  const containerRef = useRef<HTMLElement>(null)
  const focusableElementsRef = useRef<HTMLElement[]>([])

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ]

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(', '))
    ).filter(el => {
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return

    switch (event.key) {
      case 'Escape':
        if (closeOnEscape && onClose) {
          event.preventDefault()
          onClose()
        }
        break

      case 'Tab':
        if (trapFocus) {
          event.preventDefault()
          const focusableElements = getFocusableElements()
          if (focusableElements.length === 0) return

          const currentIndex = focusableElements.findIndex(el => el === document.activeElement)
          const isShiftTab = event.shiftKey

          let nextIndex: number
          if (isShiftTab) {
            nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
          } else {
            nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
          }

          focusableElements[nextIndex]?.focus()
        }
        break
    }
  }, [trapFocus, closeOnEscape, onClose, getFocusableElements])

  // Set up event listeners
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.addEventListener('keydown', handleKeyDown)

    // Auto-focus first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, autoFocus, getFocusableElements])

  // Update focusable elements when container changes
  useEffect(() => {
    focusableElementsRef.current = getFocusableElements()
  }, [getFocusableElements])

  return {
    containerRef,
    focusableElements: focusableElementsRef.current
  }
}

// Hook for managing ARIA live regions
export function useAriaLive() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById('aria-live-region')
    if (liveRegion) {
      liveRegion.textContent = message
      liveRegion.setAttribute('aria-live', priority)
      
      // Clear the message after a short delay
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }, [])

  return { announce }
}

// Hook for managing focus restoration
export function useFocusRestoration() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [])

  return { saveFocus, restoreFocus }
}
