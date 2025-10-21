'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BuyCreditsModal from './BuyCreditsModal'

interface UserHeaderProps {
  user: {
    username: string
    credits: number
  }
}

export default function UserHeader({ user }: UserHeaderProps) {
  const router = useRouter()
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container-pmw">
        <div className="py-4 flex items-center justify-between">
          {/* Welcome Message */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back, <span className="text-[#42499c]">{user.username}</span>!
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Run comprehensive SEO audits on your websites
            </p>
          </div>

          {/* Credits & Actions */}
          <div className="flex items-center gap-4">
            {/* Credit Balance - Clickable */}
            <button
              onClick={() => setShowBuyCreditsModal(true)}
              className="bg-gradient-to-r from-[#42499c] to-[#353f85] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="white" opacity="0.2"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">£</text>
                </svg>
                <div>
                  <div className="text-xs opacity-90">Credits</div>
                  <div className="text-lg font-bold">{user.credits.toLocaleString()}</div>
                </div>
                <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Low Credits Warning */}
      {user.credits < 20 && (
        <div className="bg-amber-50 border-t border-amber-200">
          <div className="container-pmw py-3">
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-amber-800">
                <strong>Low credit balance:</strong> You have {user.credits} credits remaining. Consider purchasing more credits to continue running audits.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        currentCredits={user.credits}
      />
    </div>
  )
}
