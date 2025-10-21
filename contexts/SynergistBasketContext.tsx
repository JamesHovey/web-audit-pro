'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { SummaryIssue } from '@/lib/auditSummaryService'

interface SynergistBasketContextType {
  basket: string[]
  addToBasket: (issueId: string) => void
  removeFromBasket: (issueId: string) => void
  toggleBasket: (issueId: string) => void
  clearBasket: () => void
  isInBasket: (issueId: string) => boolean
}

const SynergistBasketContext = createContext<SynergistBasketContextType | undefined>(undefined)

export function SynergistBasketProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<string[]>([])

  const addToBasket = (issueId: string) => {
    setBasket(prev => prev.includes(issueId) ? prev : [...prev, issueId])
  }

  const removeFromBasket = (issueId: string) => {
    setBasket(prev => prev.filter(id => id !== issueId))
  }

  const toggleBasket = (issueId: string) => {
    setBasket(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    )
  }

  const clearBasket = () => {
    setBasket([])
  }

  const isInBasket = (issueId: string) => {
    return basket.includes(issueId)
  }

  return (
    <SynergistBasketContext.Provider
      value={{
        basket,
        addToBasket,
        removeFromBasket,
        toggleBasket,
        clearBasket,
        isInBasket,
      }}
    >
      {children}
    </SynergistBasketContext.Provider>
  )
}

export function useSynergistBasket() {
  const context = useContext(SynergistBasketContext)
  if (context === undefined) {
    throw new Error('useSynergistBasket must be used within a SynergistBasketProvider')
  }
  return context
}
