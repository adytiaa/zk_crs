// /medi/src/components/app-providers.tsx
'use client'
import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { ClusterProvider } from '@/components/cluster/cluster-data-access'
import { SolanaProvider } from '@/components/solana/solana-provider'
import React from 'react'
import { AuthProvider } from '@/components/auth-context' // Import AuthProvider

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ClusterProvider>
          <SolanaProvider>
            <AuthProvider> {/* Wrap with AuthProvider */}
              {children}
            </AuthProvider>
          </SolanaProvider>
        </ClusterProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}