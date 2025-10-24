"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"

interface PageDiscoveryModalProps {
  isOpen: boolean
  onClose: () => void
  websiteUrl: string
}

export function PageDiscoveryModal({ isOpen, onClose, websiteUrl }: PageDiscoveryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="mb-4">
            <LoadingSpinner size="lg" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Discovering Pages
          </h3>
          
          <p className="text-gray-600 mb-4">
            We&apos;re analyzing <span className="font-medium text-gray-800">{websiteUrl}</span> to discover all available pages.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm font-medium mb-2">
              ⏱️ This may take a little while
            </p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Discovery time depends on website size. We&apos;re checking sitemaps, internal links, and common page patterns to give you comprehensive results.
            </p>
          </div>
          
          <div className="space-y-2 text-left">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Analysing XML sitemaps
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              Crawling internal links
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Checking common page patterns
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}