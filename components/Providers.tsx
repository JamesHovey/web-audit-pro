'use client'

import { SessionProvider } from 'next-auth/react'
import { SynergistBasketProvider } from '@/contexts/SynergistBasketContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SynergistBasketProvider>
        {children}
      </SynergistBasketProvider>
    </SessionProvider>
  )
}
