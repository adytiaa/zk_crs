// /medi/src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { SidebarNav } from '@/components/ui/sidebar-nav'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediCrypt - Secure Medical Records on Blockchain',
  description: 'Store and manage your medical records securely using blockchain technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white`}>
        <AppProviders>
          <div className="relative min-h-screen">
            <SidebarNav />
            <main className="min-h-screen lg:pl-72">
              <div className="container py-6 md:py-8 lg:py-10 px-4 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <Toaster position="top-right" richColors />
          </div>
        </AppProviders>
      </body>
    </html>
  )
}

declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}