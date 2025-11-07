'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { PMWLogo } from "./PMWLogo"
import SettingsModal from "./SettingsModal"
import SynergistBasketModal from "./SynergistBasketModal"
import SavedAuditsModal from "./SavedAuditsModal"
import { ShoppingCart, Clock } from "lucide-react"
import { useSynergistBasket } from "@/contexts/SynergistBasketContext"
import { SummaryIssue } from "@/lib/auditSummaryService"
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  auditIssues?: SummaryIssue[]
  pageTitle?: string
  user?: {
    username?: string
  }
}

export function Navigation({ auditIssues = [], pageTitle, user }: NavigationProps) {
  const router = useRouter()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showBasketModal, setShowBasketModal] = useState(false)
  const [showSavedAuditsModal, setShowSavedAuditsModal] = useState(false)
  const [hasSavedAudits, setHasSavedAudits] = useState(false)
  const { basket } = useSynergistBasket()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  // Check if user has any saved audits
  useEffect(() => {
    const checkSavedAudits = async () => {
      try {
        const response = await fetch('/api/audit/list')
        if (response.ok) {
          const data = await response.json()
          setHasSavedAudits(data.audits && data.audits.length > 0)
        }
      } catch (error) {
        // Silently fail - icon will remain hidden
        console.error('Failed to check saved audits:', error)
      }
    }
    checkSavedAudits()
  }, [])

  return (
    <>
      <nav className="shadow-sm border-b" style={{ backgroundColor: 'var(--pmw-primary)', borderColor: 'var(--pmw-border)' }} suppressHydrationWarning>
        <div className="container-pmw">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <PMWLogo size={40} />
                <div className="text-center">
                  <div className="text-xl font-bold leading-[1]" style={{ color: 'white' }}>Web Audit Pro</div>
                  <div className="text-xs -mt-[2px]" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>(Working title)</div>
                </div>
              </Link>
              {pageTitle && (
                <>
                  <svg className="w-5 h-5 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-white text-lg font-medium">{pageTitle}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Welcome Message */}
              {user?.username && (
                <span className="text-white text-sm">
                  Welcome back, <span className="font-medium">{user.username}</span>
                </span>
              )}

              {/* Saved Audits - Always visible when logged in */}
              {user?.username && (
                <button
                  onClick={() => setShowSavedAuditsModal(true)}
                  className="flex items-center justify-center p-2 rounded transition-all duration-200 group"
                  title="Saved Audits"
                >
                  <Clock className="w-5 h-5 text-white group-hover:text-[#ef86ce] transition-colors" />
                </button>
              )}

              {/* Logout Button */}
              {user?.username && (
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Logout
                </button>
              )}

              {/* Synergist Basket */}
              {basket.length > 0 && (
                <button
                  onClick={() => setShowBasketModal(true)}
                  className="relative flex items-center justify-center p-2 rounded transition-all duration-200 group"
                  title="Synergist Basket"
                >
                  <ShoppingCart className="w-5 h-5 text-white group-hover:text-[#ef86ce] transition-colors" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {basket.length}
                  </span>
                </button>
              )}

              {/* Settings Section */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center justify-center p-2 rounded transition-all duration-200 group"
                title="API Settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200" suppressHydrationWarning>
                  <path d="M10.255 4.18806C9.84269 5.17755 8.68655 5.62456 7.71327 5.17535C6.10289 4.4321 4.4321 6.10289 5.17535 7.71327C5.62456 8.68655 5.17755 9.84269 4.18806 10.255C2.63693 10.9013 2.63693 13.0987 4.18806 13.745C5.17755 14.1573 5.62456 15.3135 5.17535 16.2867C4.4321 17.8971 6.10289 19.5679 7.71327 18.8246C8.68655 18.3754 9.84269 18.8224 10.255 19.8119C10.9013 21.3631 13.0987 21.3631 13.745 19.8119C14.1573 18.8224 15.3135 18.3754 16.2867 18.8246C17.8971 19.5679 19.5679 17.8971 18.8246 16.2867C18.3754 15.3135 18.8224 14.1573 19.8119 13.745C21.3631 13.0987 21.3631 10.9013 19.8119 10.255C18.8224 9.84269 18.3754 8.68655 18.8246 7.71327C19.5679 6.10289 17.8971 4.4321 16.2867 5.17535C15.3135 5.62456 14.1573 5.17755 13.745 4.18806C13.0987 2.63693 10.9013 2.63693 10.255 4.18806Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#ef86ce]" suppressHydrationWarning/>
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="white" strokeWidth="2" className="group-hover:stroke-[#ef86ce]" suppressHydrationWarning/>
                </svg>
              </button>

              {!user?.username && (
                <span className="text-white text-sm">
                  Demo Version
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Saved Audits Modal */}
      <SavedAuditsModal
        isOpen={showSavedAuditsModal}
        onClose={() => setShowSavedAuditsModal(false)}
        onAuditsChange={setHasSavedAudits}
      />

      {/* Synergist Basket Modal */}
      <SynergistBasketModal
        isOpen={showBasketModal}
        onClose={() => setShowBasketModal(false)}
        allIssues={auditIssues}
      />
    </>
  )
}