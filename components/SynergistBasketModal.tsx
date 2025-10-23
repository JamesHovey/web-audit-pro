'use client'

import { X, Send, ShoppingCart } from 'lucide-react'
import { useSynergistBasket } from '@/contexts/SynergistBasketContext'
import { SummaryIssue } from '@/lib/auditSummaryService'

interface SynergistBasketModalProps {
  isOpen: boolean
  onClose: () => void
  allIssues: SummaryIssue[]
}

const CATEGORY_CONFIG = {
  performance: { icon: '⚡', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Performance' },
  accessibility: { icon: '👁️', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Accessibility' },
  seo: { icon: '🔍', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'SEO' },
  technical: { icon: '⚙️', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Technical' },
  content: { icon: '📄', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Content' }
}

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', label: 'Critical' },
  high: { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', label: 'High' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300', label: 'Medium' },
  low: { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', label: 'Low' }
}

export default function SynergistBasketModal({ isOpen, onClose, allIssues }: SynergistBasketModalProps) {
  const { basket, removeFromBasket, clearBasket } = useSynergistBasket()

  if (!isOpen) return null

  const selectedIssues = allIssues.filter(issue => basket.includes(issue.id))

  const handleSendToSynergist = () => {
    console.log('Sending to Synergist:', selectedIssues)
    // TODO: API integration with Synergist CRM
    alert(`Ready to send ${selectedIssues.length} issue${selectedIssues.length !== 1 ? 's' : ''} to Synergist!\n\n(API integration coming soon)`)
    clearBasket()
    onClose()
  }

  const handleClearAll = () => {
    clearBasket()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#42499C] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Synergist Basket</h3>
              <p className="text-sm text-blue-100">{basket.length} issue{basket.length !== 1 ? 's' : ''} ready to send</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedIssues.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your basket is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add issues from the Audit Summary to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedIssues.map((issue) => {
                const categoryConfig = CATEGORY_CONFIG[issue.category]
                const severityConfig = SEVERITY_CONFIG[issue.severity]

                return (
                  <div key={issue.id} className={`border rounded-lg p-4 ${categoryConfig.border} bg-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityConfig.bg} ${severityConfig.color} uppercase`}>
                            {severityConfig.label}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{categoryConfig.icon}</span>
                            <span>{categoryConfig.label}</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {issue.affectedItems ? `${issue.affectedItems} ${issue.title}` : issue.title}
                        </h4>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                      </div>
                      <button
                        onClick={() => removeFromBasket(issue.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from basket"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedIssues.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Clear All
              </button>
              <button
                onClick={handleSendToSynergist}
                className="flex items-center gap-2 px-6 py-3 bg-[#42499C] text-white rounded-lg hover:bg-[#363d85] transition-colors font-semibold shadow-lg"
              >
                <Send className="w-4 h-4" />
                Send to Synergist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
