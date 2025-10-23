'use client'

import { useState } from 'react'
import Link from 'next/link'
import CreditPackages from '@/components/CreditPackages'
import LoginModal from '@/components/LoginModal'
import RegisterModal from '@/components/RegisterModal'
import MarkupCalculator from '@/components/MarkupCalculator'

export default function LoginPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [markup, setMarkup] = useState(100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-center hover:opacity-90 transition-opacity">
              <h1 className="text-2xl font-bold leading-[1]" style={{ color: 'white' }}>Web Audit Pro</h1>
              <p className="text-xs -mt-[2px]" style={{ color: '#9CA3AF' }}>(Working title)</p>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2.5 text-white hover:bg-gray-800 rounded-lg font-medium transition-colors border border-white"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-5 py-2.5 bg-[#42499c] hover:bg-[#353f85] text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Website Audits Made Simple
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Web Audit Pro delivers comprehensive website audits that help you identify technical issues,
            improve performance, and boost your search engine rankings. Get detailed insights on traffic, keywords,
            accessibility, and more—all in a beautiful user friendly dashboard.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100 Free Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel Anytime</span>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-8 py-4 bg-[#42499c] hover:bg-[#353f85] text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </button>
          </div>
        </div>

        {/* Markup Calculator - Developer Tool */}
        <MarkupCalculator onMarkupChange={setMarkup} />

        {/* Credit Packages */}
        <CreditPackages markup={markup} />
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </div>
  )
}
