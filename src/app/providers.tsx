'use client'

import { ApolloProvider } from '@apollo/client'
import { client } from '@/lib/graphql-client'
import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '@/hooks/usePerformance'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring()
  }, [])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
