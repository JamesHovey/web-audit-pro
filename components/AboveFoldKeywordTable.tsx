'use client'

import { useState, useMemo } from 'react'
import Tooltip from './Tooltip'

interface KeywordData {
  keyword: string;
  position: number;
  volume: number;
  type?: 'branded' | 'non-branded';
}

interface AboveFoldKeywordTableProps {
  keywords: KeywordData[]
  title?: string
  description?: string
}

export default function AboveFoldKeywordTable({ 
  keywords, 
  title = "Above Fold Keywords",
  description = "Keywords ranking in the top 3 positions on Google (above the fold in search results)"
}: AboveFoldKeywordTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filter to only show keywords ranking in top 3 positions, then sort by position and volume
  const sortedKeywords = useMemo(() => {
    return [...(keywords || [])].filter(keyword => keyword.position >= 1 && keyword.position <= 3)
      .sort((a, b) => {
        const volumeA = a.volume || 0;
        const volumeB = b.volume || 0;
        
        if (a.position !== b.position) {
          return a.position - b.position; // Sort by position (ascending)
        }
        return volumeB - volumeA; // Same position, sort by volume (descending)
      })
  }, [keywords])
  
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentKeywords = sortedKeywords.slice(startIndex, endIndex)
  
  const getPositionColor = (position: number) => {
    if (position === 0) return 'text-gray-500 bg-gray-50'
    if (position <= 3) return 'text-green-600 bg-green-50'
    if (position <= 10) return 'text-blue-600 bg-blue-50'
    if (position <= 20) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  if (!keywords || keywords.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-black">{title}</h4>
        <Tooltip 
          content={
            <div>
              <p className="font-semibold mb-2">{title}</p>
              <p className="mb-2">{description}</p>
              <p className="mb-2"><strong>What are Above Fold Keywords?</strong></p>
              <ul className="list-disc list-inside mb-2 text-xs">
                <li>Keywords ranking in position #1 on Google</li>
                <li>Keywords ranking in position #2 on Google</li>
                <li>Keywords ranking in position #3 on Google</li>
                <li>These appear "above the fold" in search results</li>
              </ul>
              <p><strong>Why Important:</strong> Top 3 positions get 75% of all clicks and maximum visibility</p>
            </div>
          }
          position="top"
        >
          <div className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">?</div>
        </Tooltip>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-6">
              Keyword
              <Tooltip 
                content="Keywords ranking in Google's top 3 positions (above the fold in search results)"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-3 text-center">
              Position
              <Tooltip 
                content="Your current ranking position in Google search results"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-3 text-center">
              Monthly Volume
              <Tooltip 
                content="Estimated number of monthly searches for this keyword"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {currentKeywords.map((keyword, index) => (
            <div key={index} className="px-4 py-3 hover:bg-gray-50">
              <div className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-6">
                  <span className="text-gray-900 font-medium">{keyword.keyword}</span>
                  {keyword.type === 'branded' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Branded
                    </span>
                  )}
                </div>
                <div className="col-span-3 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(keyword.position)}`}>
                    {keyword.position === 0 ? 'Not ranking' : `#${keyword.position}`}
                  </span>
                </div>
                <div className="col-span-3 text-center text-gray-600">
                  {(keyword.volume || 0).toLocaleString()}/mo
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedKeywords.length)} of {sortedKeywords.length} keywords
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === pageNumber 
                        ? 'bg-blue-500 text-white' 
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}