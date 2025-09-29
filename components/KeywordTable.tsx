'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import Tooltip from './Tooltip'

interface KeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  type: 'branded' | 'non-branded';
}

interface KeywordTableProps {
  keywords: KeywordData[]
  title: string
  description: string
  type: 'branded' | 'non-branded'
  itemsPerPage?: number
}

export default function KeywordTable({ 
  keywords, 
  title, 
  description, 
  type,
  itemsPerPage = 10 
}: KeywordTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Safety checks for undefined/null keywords
  const safeKeywords = keywords || []
  const totalPages = Math.ceil(safeKeywords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentKeywords = safeKeywords.slice(startIndex, endIndex)
  
  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 bg-green-50'
    if (position <= 10) return 'text-blue-600 bg-blue-50'  
    if (position <= 20) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }
  
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'text-green-600'
    if (difficulty <= 50) return 'text-orange-600'
    return 'text-red-600'
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
              {type === 'branded' && (
                <div>
                  <p className="mb-2"><strong>Examples:</strong></p>
                  <ul className="list-disc list-inside mb-2 text-xs">
                    <li>Brand name searches: &quot;PMW Communications&quot;</li>
                    <li>Brand + service: &quot;PMW marketing services&quot;</li>
                    <li>Brand + location: &quot;PMW agency London&quot;</li>
                    <li>Brand reviews: &quot;PMW Communications reviews&quot;</li>
                  </ul>
                  <p><strong>Why Important:</strong> Shows brand recognition and customer loyalty</p>
                </div>
              )}
              {type === 'non-branded' && (
                <div>
                  <p className="mb-2"><strong>Examples:</strong></p>
                  <ul className="list-disc list-inside mb-2 text-xs">
                    <li>Service terms: &quot;marketing agency London&quot;</li>
                    <li>Problem-focused: &quot;digital marketing services&quot;</li>
                    <li>Industry terms: &quot;brand strategy consultant&quot;</li>
                    <li>Local search: &quot;marketing company near me&quot;</li>
                  </ul>
                  <p><strong>Why Important:</strong> Drives new customer acquisition</p>
                </div>
              )}
            </div>
          }
          position="top"
        >
          <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
        </Tooltip>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-5">
              Keyword
              <Tooltip 
                content="The actual search term people use on Google"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Position
              <Tooltip 
                content={
                  <div>
                    <p className="mb-1"><strong>Your ranking position in Google search results</strong></p>
                    <p className="text-xs">🟢 1-3: Excellent | 🔵 4-10: Good | 🟠 11-20: Needs work | 🔴 21+: Poor</p>
                  </div>
                }
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Volume
              <Tooltip 
                content={
                  <div>
                    <p className="mb-1"><strong>Monthly search volume</strong></p>
                    <p className="text-xs">How many times this keyword is searched per month on Google</p>
                  </div>
                }
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Difficulty
              <Tooltip 
                content={
                  <div>
                    <p className="mb-1"><strong>SEO Competition Level</strong></p>
                    <p className="text-xs">🟢 0-30: Easy | 🟠 31-50: Medium | 🔴 51+: Hard</p>
                    <p className="text-xs mt-1">Higher = more competition, harder to rank</p>
                  </div>
                }
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-1 text-center">
              Impact
              <Tooltip 
                content="Estimated monthly traffic potential if you rank in top 3 positions"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {currentKeywords.map((keyword, index) => {
            const estimatedTraffic = Math.round(keyword.volume * 0.3 * (keyword.position <= 3 ? 0.6 : keyword.position <= 10 ? 0.3 : 0.1))
            
            return (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  <div className="col-span-5">
                    <span className="text-gray-900 font-medium">{keyword.keyword}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(keyword.position)}`}>
                      #{keyword.position}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-gray-600">
                    {(keyword.volume || 0).toLocaleString()}/mo
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`font-medium ${getDifficultyColor(keyword.difficulty)}`}>
                      {keyword.difficulty}%
                    </span>
                  </div>
                  <div className="col-span-1 text-center text-gray-500">
                    {estimatedTraffic}
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
            Showing {startIndex + 1}-{Math.min(endIndex, safeKeywords.length)} of {safeKeywords.length} keywords
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