'use client'

import { useState } from 'react'
import CreditPackages from './CreditPackages'
import MarkupCalculator from './MarkupCalculator'

interface BuyCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  currentCredits: number
}

export default function BuyCreditsModal({ isOpen, onClose, currentCredits }: BuyCreditsModalProps) {
  const [markup, setMarkup] = useState(100)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Buy Credits</h2>
              <p className="text-sm text-gray-600 mt-1">
                Current Balance: <span className="font-semibold text-[#42499c]">{currentCredits.toLocaleString()} credits</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Markup Calculator */}
          <MarkupCalculator onMarkupChange={setMarkup} />

          {/* Credit Packages */}
          <CreditPackages markup={markup} />

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
