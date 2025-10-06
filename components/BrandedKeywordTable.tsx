'use client'

import { useState, useMemo } from 'react'
import Tooltip from './Tooltip'

interface KeywordData {
  keyword: string;
  position?: number;
  volume: number;
  difficulty?: number;
  type: 'branded' | 'non-branded';
  mentions?: number; // Number of times keyword appears on page/site
}

interface BrandedKeywordTableProps {
  keywords: KeywordData[]
  title: string
  description: string
}

export default function BrandedKeywordTable({ 
  keywords, 
  title, 
  description
}: BrandedKeywordTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Sort keywords by volume (highest to lowest)
  const sortedKeywords = useMemo(() => {
    return [...(keywords || [])].sort((a, b) => (b.volume || 0) - (a.volume || 0))
  }, [keywords])
  
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentKeywords = sortedKeywords.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-black">{title}</h4>
        <Tooltip 
          content={
            <div>
              <p className="font-semibold mb-2">{title}</p>
              <p className="mb-2">{description}</p>
              <p className="mb-2"><strong>What this shows:</strong></p>
              <ul className="list-disc list-inside mb-2 text-xs">
                <li>Your Google ranking position for brand terms</li>
                <li>How often your brand appears on the page/site</li>
                <li>Estimated monthly search volume for each term</li>
                <li>Helps identify brand recognition and loyalty</li>
              </ul>
              <p><strong>Why Important:</strong> Higher rankings and mentions indicate stronger brand presence</p>
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
            <div className="col-span-4">
              Keyword
              <Tooltip 
                content="The branded search term including your company/brand name"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Google Position
              <Tooltip 
                content="Your current ranking position in Google search results"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-3 text-center">
              Page Mentions
              <Tooltip 
                content="Number of times this keyword appears on the analyzed page(s)"
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
                <div className="col-span-4">
                  <span className="text-gray-900 font-medium">{keyword.keyword}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    keyword.position === 0 ? 'text-gray-500 bg-gray-50' :
                    keyword.position && keyword.position <= 3 ? 'text-green-600 bg-green-50' :
                    keyword.position && keyword.position <= 10 ? 'text-blue-600 bg-blue-50' :
                    keyword.position && keyword.position <= 20 ? 'text-orange-600 bg-orange-50' :
                    'text-red-600 bg-red-50'
                  }`}>
                    {!keyword.position || keyword.position === 0 ? 'Not ranking' : `#${keyword.position}`}
                  </span>
                </div>
                <div className="col-span-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                    {keyword.mentions || 1} times
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
              className="px-3 py-1 border border-black text-black rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                        ? 'bg-black text-white border border-black' 
                        : 'border border-black text-black hover:bg-gray-50'
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
              className="px-3 py-1 border border-black text-black rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}