"use client"

import React, { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react'

interface AuditSummaryProps {
  auditId: string
  isAuditComplete: boolean
}

export default function AuditSummary({ auditId, isAuditComplete }: AuditSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGeneratedSummary, setHasGeneratedSummary] = useState(false)

  const generateSummary = async () => {
    if (!isAuditComplete || isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/audit/${auditId}/summary`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary')
      }
      
      setSummary(data.summary)
      setHasGeneratedSummary(true)
    } catch (err) {
      console.error('Error generating summary:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while generating the summary')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuditComplete && !hasGeneratedSummary && !summary) {
      generateSummary()
    }
  }, [isAuditComplete])

  const formatSummary = (text: string) => {
    const sections = text.split('\n\n')
    return sections.map((section, index) => {
      if (section.includes(':')) {
        const [title, ...content] = section.split(':')
        const isBold = title.match(/^(KEY STRENGTHS|PRIORITY AREAS|NEXT STEPS|OVERALL ASSESSMENT)/i)
        
        return (
          <div key={index} className="mb-4">
            {isBold && (
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                {title.trim()}
              </h3>
            )}
            <div className="text-gray-700 whitespace-pre-wrap">
              {isBold ? content.join(':') : section}
            </div>
          </div>
        )
      }
      return (
        <div key={index} className="text-gray-700 mb-4 whitespace-pre-wrap">
          {section}
        </div>
      )
    })
  }

  if (!isAuditComplete) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Audit Summary
        </h2>
        {summary && (
          <button
            onClick={generateSummary}
            disabled={isLoading}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Unable to generate summary</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={generateSummary}
              className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {isLoading && !summary && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Analyzing your audit results...</p>
            <p className="text-gray-500 text-sm mt-1">This may take a few moments</p>
          </div>
        </div>
      )}

      {summary && !isLoading && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-100">
            {formatSummary(summary)}
          </div>
        </div>
      )}

      {!summary && !isLoading && !error && (
        <div className="text-center py-8">
          <button
            onClick={generateSummary}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Summary
          </button>
        </div>
      )}
    </div>
  )
}