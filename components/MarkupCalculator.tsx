'use client'

import { useState } from 'react'

interface MarkupCalculatorProps {
  onMarkupChange: (markup: number) => void
}

export default function MarkupCalculator({ onMarkupChange }: MarkupCalculatorProps) {
  const [markup, setMarkup] = useState(100)

  const handleChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setMarkup(numValue)
    onMarkupChange(numValue)
  }

  return (
    <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-400 rounded-lg max-w-2xl mx-auto">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="font-bold text-amber-900 text-sm mb-1">🔧 Developer Tool: Markup Calculator</h3>
          <p className="text-xs text-amber-800 mb-3">
            <strong>Temporary Feature:</strong> Adjust the markup percentage to see how pricing changes across all packages.
            This tool is for internal testing and will be removed in production.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="markup" className="block text-sm font-medium text-amber-900 mb-2">
                Markup Percentage
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="markup"
                  min="0"
                  max="500"
                  step="10"
                  value={markup}
                  onChange={(e) => handleChange(e.target.value)}
                  className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-[#42499c]"
                />
                <input
                  type="number"
                  value={markup}
                  onChange={(e) => handleChange(e.target.value)}
                  min="0"
                  max="1000"
                  className="w-24 px-3 py-2 border border-amber-300 rounded-lg text-sm font-semibold text-amber-900 focus:ring-2 focus:ring-[#42499c] focus:border-[#42499c]"
                />
                <span className="text-lg font-bold text-amber-900">%</span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-white border border-amber-300 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Current Markup:</strong> {markup}%
              {markup === 100 && ' (Default - 100% markup on actual costs)'}
              {markup === 0 && ' (Cost price - no profit)'}
              {markup > 100 && ` (${markup - 100}% higher than default)`}
              {markup < 100 && markup > 0 && ` (${100 - markup}% lower than default)`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
