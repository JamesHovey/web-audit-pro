'use client'

import { X, ExternalLink, AlertCircle } from 'lucide-react'

interface AffectedPage {
  url: string
  title: string
  details?: string
}

interface AffectedPagesModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  pages: AffectedPage[]
}

export default function AffectedPagesModal({
  isOpen,
  onClose,
  title,
  description,
  pages
}: AffectedPagesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'white' }}>{title}</h3>
              <p className="text-sm text-blue-100">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No affected pages found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page, index) => (
                <div
                  key={`${page.url}-${index}`}
                  className="border rounded-lg p-4 hover:border-[#42499c] hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {page.title}
                        </h4>
                      </div>

                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#42499c] hover:underline flex items-center gap-1 mb-2"
                      >
                        <span className="truncate">{page.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>

                      {page.details && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Issue details: </span>
                          {page.details}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 bg-[#42499c] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {pages.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Total affected pages: <span className="font-semibold">{pages.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
