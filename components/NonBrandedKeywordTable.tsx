'use client'

import { useState, useMemo } from 'react'
import Tooltip from './Tooltip'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface KeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  type: 'branded' | 'non-branded';
}

interface NonBrandedKeywordTableProps {
  keywords: KeywordData[]
  title: string
  description: string
}

type SortField = 'keyword' | 'position' | 'volume'
type SortOrder = 'asc' | 'desc'

export default function NonBrandedKeywordTable({ 
  keywords, 
  title, 
  description
}: NonBrandedKeywordTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('volume')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const itemsPerPage = 10
  
  // Filter for top 20 positions only (exclude unranked)
  const filteredKeywords = useMemo(() => {
    return (keywords || []).filter(k => k.position >= 1 && k.position <= 20)
  }, [keywords])
  
  // Sort keywords based on current sort field and order
  const sortedKeywords = useMemo(() => {
    const sorted = [...filteredKeywords].sort((a, b) => {
      let compareValue = 0
      
      switch (sortField) {
        case 'keyword':
          compareValue = a.keyword.localeCompare(b.keyword)
          break
        case 'position':
          // Special handling for position: 0 means not ranking, should be last
          const posA = a.position === 0 ? 999 : a.position
          const posB = b.position === 0 ? 999 : b.position
          compareValue = posA - posB
          break
        case 'volume':
          compareValue = (a.volume || 0) - (b.volume || 0)
          break
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue
    })
    
    return sorted
  }, [filteredKeywords, sortField, sortOrder])
  
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentKeywords = sortedKeywords.slice(startIndex, endIndex)
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      // Default sort orders
      setSortOrder(field === 'position' ? 'asc' : 'desc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />
  }
  
  const getPositionColor = (position: number) => {
    if (position === 0) return 'text-gray-500 bg-gray-50'
    if (position <= 3) return 'text-green-600 bg-green-50'
    if (position <= 10) return 'text-blue-600 bg-blue-50'
    return 'text-orange-600 bg-orange-50'
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
              <p className="mb-2"><strong>What this shows:</strong></p>
              <ul className="list-disc list-inside mb-2 text-xs">
                <li>Keywords found on this page ranking in Google top 20</li>
                <li>Monthly search volume potential</li>
                <li>Your current ranking position</li>
              </ul>
              <p><strong>Focus on:</strong> High volume keywords where you can improve your ranking</p>
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
              <button
                onClick={() => handleSort('keyword')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Keyword
                {getSortIcon('keyword')}
              </button>
              <Tooltip 
                content="The search term (click to sort alphabetically)"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              <button
                onClick={() => handleSort('position')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Position
                {getSortIcon('position')}
              </button>
              <Tooltip 
                content="Your Google ranking (only positions 1-20 shown, click to sort)"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-4 text-center">
              <button
                onClick={() => handleSort('volume')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Monthly Volume
                {getSortIcon('volume')}
              </button>
              <Tooltip 
                content="Monthly searches (click to sort)"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {currentKeywords.map((keyword, index) => {
            return (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  <div className="col-span-6">
                    <span className="text-gray-900 font-medium">{keyword.keyword}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(keyword.position)}`}>
                      {keyword.position === 0 ? 'Not ranking' : `#${keyword.position}`}
                    </span>
                  </div>
                  <div className="col-span-4 text-center text-gray-600">
                    {(keyword.volume || 0).toLocaleString()}/mo
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedKeywords.length)} of {sortedKeywords.length} keywords
            {filteredKeywords.length < (keywords || []).length && (
              <span className="ml-2 text-xs text-blue-600">
                (Showing only keywords ranking 1-20)
              </span>
            )}
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