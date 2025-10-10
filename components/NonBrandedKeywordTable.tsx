'use client'

import { useState, useMemo } from 'react'
import Tooltip from './Tooltip'
import { ChevronUp, ChevronDown, ChevronsUpDown, HelpCircle } from 'lucide-react'

interface KeywordData {
  keyword: string;
  position: number;
  volume: number | null;
  difficulty: number;
  type: 'branded' | 'non-branded';
}

interface NonBrandedKeywordTableProps {
  keywords: KeywordData[]
  title: string
  description: string
  auditType?: 'page' | 'website' | 'full' // Add audit type to determine title
}

type SortField = 'keyword' | 'position' | 'volume'
type SortOrder = 'asc' | 'desc'

export default function NonBrandedKeywordTable({ 
  keywords, 
  title, 
  description,
  auditType = 'website'
}: NonBrandedKeywordTableProps) {
  
  // Determine the appropriate title based on audit type
  const getContextualTitle = (baseTitle: string) => {
    if (baseTitle.includes('All Non-branded Keywords')) {
      const contextWord = auditType === 'page' ? 'webpage' : 'website';
      return `All Non-branded Keywords on this ${contextWord}`;
    }
    return title;
  };
  
  const contextualTitle = getContextualTitle(title);
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('volume')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const itemsPerPage = 10
  
  // Show only keywords with real volume data between 50-10,000
  const filteredKeywords = useMemo(() => {
    return (keywords || []).filter(k => 
      k.volume !== null && k.volume !== undefined && k.volume >= 50 && k.volume <= 10000
    )
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
          // Handle null volumes in sorting
          const volA = a.volume === null ? -1 : a.volume
          const volB = b.volume === null ? -1 : b.volume
          compareValue = volA - volB
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

  if (!keywords || keywords.length === 0 || sortedKeywords.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-black">{contextualTitle}</h4>
          <Tooltip 
            content={
              <div>
                <p className="font-semibold mb-2">Non-branded Keywords</p>
                <p className="mb-2 text-xs">{description}</p>
                <p className="text-xs"><strong>No keywords found:</strong> No business-specific keywords with sufficient search volume (50-10,000/month) were discovered.</p>
              </div>
            }
            position="bottom"
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
          </Tooltip>
        </div>
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <p className="text-sm">No business-specific keywords with sufficient search volume (50-10,000/month) found.</p>
        </div>
      </div>
    );
  }
  
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
        <h4 className="font-semibold text-black">{contextualTitle}</h4>
        <Tooltip 
          content={
            <div>
              <p className="font-semibold mb-2">Non-branded Keywords</p>
              <p className="mb-2 text-xs">{description}</p>
              <div className="mb-2 text-xs">
                <p className="font-medium mb-1">What this shows:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Relevant keywords for your business</li>
                  <li>Monthly search volume estimates</li>
                  <li>Real ranking positions (when available)</li>
                </ul>
              </div>
              <p className="text-xs font-medium text-yellow-300">Note: "Not ranking" means no verified position data available</p>
            </div>
          }
          position="bottom"
        >
          <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
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
                content="Your Google ranking position (0 = Not ranking, click to sort)"
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
                content="Monthly search volume from Google Keyword Planner via Keywords Everywhere API. These are real search volumes, not estimates."
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {/* Show paginated keywords on screen */}
          <div className="screen-only">
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
                      {keyword.volume.toLocaleString()}/mo
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Show all keywords in print mode */}
          <div className="print-only">
            {sortedKeywords.map((keyword, index) => {
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
                      {keyword.volume.toLocaleString()}/mo
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="screen-only flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedKeywords.length)} of {sortedKeywords.length} keywords
            {filteredKeywords.length < (keywords || []).length && (
              <span className="ml-2 text-xs text-blue-600">
                (Showing keywords with volume 50-10,000 only)
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

      {/* Conclusion Section */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h5 className="font-semibold text-green-900 mb-2">🎯 Conclusion & Next Steps</h5>
        <div className="text-green-800 text-sm space-y-2">
          {sortedKeywords.length > 0 ? (
            <>
              <p>
                <strong>Opportunity found!</strong> You have {sortedKeywords.length} non-branded keywords with search volume. 
                These represent potential traffic from people looking for your services.
              </p>
              <div className="space-y-1">
                <p><strong>Action items to capture more traffic:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {sortedKeywords.some(k => !k.position || k.position === 0) && (
                    <li>Create content targeting keywords where you don't rank yet</li>
                  )}
                  {sortedKeywords.some(k => k.position && k.position > 10) && (
                    <li>Improve rankings for keywords where you rank on page 2+ (position 11+)</li>
                  )}
                  <li>Optimize existing pages to better target high-volume keywords</li>
                  <li>Create comprehensive content around your highest-volume non-branded terms</li>
                  <li>Focus on keywords with realistic competition levels for quick wins</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>Growth opportunity:</strong> Limited non-branded keyword presence found. 
                This means you're missing out on potential customers searching for your services.
              </p>
              <div className="space-y-1">
                <p><strong>Action items to start capturing organic traffic:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Research keywords your target customers use to find services like yours</li>
                  <li>Create valuable content around common industry terms and questions</li>
                  <li>Optimize your website for local searches if you serve local customers</li>
                  <li>Build topic clusters around your main services and expertise</li>
                  <li>Consider content marketing to establish authority in your field</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}