'use client'

import { useState, useMemo } from 'react'
import Tooltip from './Tooltip'
import { ChevronUp, ChevronDown, ChevronsUpDown, HelpCircle } from 'lucide-react'

// Pound sign icon component
const PoundSign = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <text x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">£</text>
  </svg>
)

interface KeywordData {
  keyword: string;
  position: number;
  volume: number | null;
  difficulty: number;
  type: 'branded' | 'non-branded';
  businessRelevance?: number;
  intent?: string;
  category?: string;
  competitorDA?: number[]; // Array of competitor domain authorities
  averageCompetitorDA?: number;
  achievable?: boolean;
}

interface PaidAdvertisingOpportunitiesProps {
  keywords: KeywordData[]
  targetDomainAuthority: number
  title?: string
  description?: string
}

type SortField = 'keyword' | 'volume' | 'difficulty' | 'competitorDA'
type SortOrder = 'asc' | 'desc'

export default function PaidAdvertisingOpportunities({ 
  keywords, 
  targetDomainAuthority,
  title = "Paid Advertising Opportunities",
  description = "High-value keywords with strong competition - better suited for paid advertising than organic SEO"
}: PaidAdvertisingOpportunitiesProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('volume')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const itemsPerPage = 10
  
  // Filter for paid advertising opportunities: high relevance + high volume + high competition
  const paidOpportunities = useMemo(() => {
    console.log('🎯 Filtering paid advertising opportunities from', keywords?.length || 0, 'total keywords');
    
    const filtered = (keywords || []).filter(k => {
      const hasRelevance = (k.businessRelevance || 0) >= 0.6;
      const hasHighVolume = k.volume !== null && k.volume !== undefined && k.volume >= 100; // High volume threshold
      const isNotBranded = k.type === 'non-branded';
      const hasHighCompetition = (k.averageCompetitorDA || 0) > (targetDomainAuthority + 10); // More reasonable gap
      const hasCommercialIntent = k.intent === 'commercial' || k.intent === 'transactional';
      
      // Include if: highly relevant + high volume + (high competition OR commercial intent OR difficulty > 60)
      const isGoodForPPC = hasHighCompetition || hasCommercialIntent || (k.difficulty || 0) >= 60;
      const includeKeyword = isNotBranded && hasRelevance && hasHighVolume && isGoodForPPC;
      
      console.log(`Keyword: "${k.keyword}", volume: ${k.volume}, avgCompetitorDA: ${k.averageCompetitorDA}, targetDA: ${targetDomainAuthority}, included: ${includeKeyword}`);
      
      return includeKeyword;
    });
    
    console.log(`✅ Found ${filtered.length} paid advertising opportunities`);
    return filtered;
  }, [keywords, targetDomainAuthority])
  
  // Sort keywords based on current sort field and order
  const sortedKeywords = useMemo(() => {
    const sorted = [...paidOpportunities].sort((a, b) => {
      let compareValue = 0
      
      switch (sortField) {
        case 'keyword':
          compareValue = a.keyword.localeCompare(b.keyword)
          break
        case 'volume':
          const volA = a.volume === null ? -1 : a.volume
          const volB = b.volume === null ? -1 : b.volume
          compareValue = volA - volB
          break
        case 'difficulty':
          compareValue = (a.difficulty || 0) - (b.difficulty || 0)
          break
        case 'competitorDA':
          compareValue = (a.averageCompetitorDA || 0) - (b.averageCompetitorDA || 0)
          break
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue
    })
    
    return sorted
  }, [paidOpportunities, sortField, sortOrder])
  
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentKeywords = sortedKeywords.slice(startIndex, endIndex)

  if (!keywords || keywords.length === 0 || sortedKeywords.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-black">{title}</h4>
          <Tooltip 
            content={
              <div className="max-w-sm">
                <p className="font-semibold mb-2">Paid Advertising Opportunities</p>
                <p className="mb-2">High-value keywords with strong organic competition - better targets for paid ads</p>
                <p className="text-xs"><strong>What makes a keyword suitable for paid advertising:</strong></p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li>High business relevance (60%+ match)</li>
                  <li>High search volume (100+ monthly searches)</li>
                  <li>Strong competitor domain authority (organic ranking difficult)</li>
                  <li>Commercial intent keywords</li>
                </ul>
              </div>
            }
            position="top"
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
          </Tooltip>
        </div>
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <PoundSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm">No high-competition keywords suitable for paid advertising found.</p>
          <p className="text-xs text-gray-400 mt-2">Your current keywords may be achievable through organic SEO efforts.</p>
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
      setSortOrder(field === 'keyword' ? 'asc' : 'desc')
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
  
  const getCompetitionColor = (avgDA: number) => {
    if (avgDA >= 70) return 'text-red-600 bg-red-50'
    if (avgDA >= 60) return 'text-orange-600 bg-orange-50'
    if (avgDA >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getCompetitionLabel = (avgDA: number) => {
    if (avgDA >= 70) return 'Very High'
    if (avgDA >= 60) return 'High'
    if (avgDA >= 50) return 'Medium-High'
    return 'Medium'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-black">{title}</h4>
        <Tooltip 
          content={
            <div className="max-w-sm">
              <p className="font-semibold mb-2">Paid Advertising Opportunities</p>
              <p className="mb-2">{description}</p>
              <div className="mb-2 text-xs">
                <p className="font-medium mb-1">Why these keywords are recommended for paid ads:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>High business relevance (60%+)</li>
                  <li>High search volume (100+ monthly)</li>
                  <li>Strong organic competition (high competitor DA)</li>
                  <li>Commercial intent for immediate results</li>
                  <li>Faster ROI than organic SEO efforts</li>
                </ul>
              </div>
              <p className="text-xs font-medium text-green-600">💰 Consider Google Ads or PPC campaigns for these keywords</p>
            </div>
          }
          position="top"
        >
          <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
        </Tooltip>
      </div>
      
      {/* Summary Card */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
          <PoundSign className="w-4 h-4" />
          💰 {sortedKeywords.length} High-Value Paid Advertising Opportunities
        </div>
        <p className="text-yellow-700 text-xs mt-1">
          These keywords have strong organic competition but high commercial value - ideal for paid advertising campaigns.
        </p>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-4">
              <button
                onClick={() => handleSort('keyword')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Keyword Opportunity
                {getSortIcon('keyword')}
              </button>
              <Tooltip 
                content="High-value keywords better suited for paid advertising"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              <button
                onClick={() => handleSort('volume')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Monthly Volume
                {getSortIcon('volume')}
              </button>
              <Tooltip 
                content="High search volume justifies paid advertising investment"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-3 text-center">
              <button
                onClick={() => handleSort('competitorDA')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Competition Level
                {getSortIcon('competitorDA')}
              </button>
              <Tooltip 
                content="Average domain authority of top-ranking competitors"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-3 text-center">
              <button
                onClick={() => handleSort('difficulty')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                PPC Opportunity
                {getSortIcon('difficulty')}
              </button>
              <Tooltip 
                content="Why this keyword is ideal for paid advertising"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {currentKeywords.map((keyword, index) => {
            const avgCompetitorDA = keyword.averageCompetitorDA || 0;
            
            return (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  <div className="col-span-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">{keyword.keyword}</span>
                      <div className="flex flex-col gap-1">
                        {keyword.category && (
                          <span className="text-gray-500 text-xs capitalize">
                            {keyword.category} • {keyword.intent || 'Commercial'}
                          </span>
                        )}
                        <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-md inline-flex items-center gap-1 w-fit">
                          <PoundSign className="w-3 h-3" />
                          Ideal for paid campaigns
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-gray-600">
                    <span className="font-medium">{keyword.volume?.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">/mo</span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCompetitionColor(avgCompetitorDA)}`}>
                      {getCompetitionLabel(avgCompetitorDA)} (DA {Math.round(avgCompetitorDA)})
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      <PoundSign className="w-3 h-3 mr-1" />
                      High ROI Potential
                    </span>
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
            Showing {startIndex + 1}-{Math.min(endIndex, sortedKeywords.length)} of {sortedKeywords.length} paid opportunities
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
        <div className="flex items-center gap-3 mb-3">
          <PoundSign className="w-10 h-10 text-green-600" />
          <h5 className="font-semibold text-green-900">Paid Advertising Strategy</h5>
        </div>
        <div className="text-green-800 text-sm space-y-2">
          {sortedKeywords.length > 0 ? (
            <>
              <p>
                <strong>High-value opportunities!</strong> These {sortedKeywords.length} keywords have strong organic competition 
                but high commercial value - perfect for paid advertising campaigns.
              </p>
              <div className="space-y-1">
                <p><strong>Recommended paid advertising approach:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Google Ads:</strong> Target these high-volume, high-intent keywords</li>
                  <li><strong>Faster results:</strong> Get immediate visibility while building organic presence</li>
                  <li><strong>Budget allocation:</strong> Focus ad spend on highest volume keywords first</li>
                  <li><strong>Landing pages:</strong> Create dedicated pages optimized for conversions</li>
                  <li><strong>Track ROI:</strong> Monitor cost-per-click vs conversion value</li>
                </ul>
              </div>
              <p className="mt-2 text-green-700">
                <strong>Strategy tip:</strong> Use paid ads for immediate results while building organic authority for these competitive keywords long-term.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Good news!</strong> No highly competitive keywords found - your target keywords 
                appear achievable through organic SEO efforts.
              </p>
              <p className="mt-2">
                Focus your budget on organic SEO optimization rather than paid advertising for maximum ROI.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}