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
  businessRelevance?: number;
  intent?: string;
  category?: string;
}

interface RecommendedKeywordTableProps {
  keywords: KeywordData[]
  title?: string
  description?: string
  auditType?: 'page' | 'website' | 'full'
}

type SortField = 'keyword' | 'volume' | 'relevance'
type SortOrder = 'asc' | 'desc'

export default function RecommendedKeywordTable({ 
  keywords, 
  title = "Recommended target keywords",
  description = "Business-relevant keywords we recommend you target to improve your search visibility",
  auditType = 'website'
}: RecommendedKeywordTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('relevance')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const itemsPerPage = 10
  
  // Filter for recommended keywords: exclude top 3 rankings, include achievable opportunities
  const recommendedKeywords = useMemo(() => {
    console.log('🎯 Filtering recommended keywords from', keywords?.length || 0, 'total keywords');
    
    const filtered = (keywords || []).filter(k => {
      const hasRelevance = (k.businessRelevance || 0) >= 0.6;
      const hasReasonableVolume = k.volume !== null && k.volume !== undefined && k.volume >= 0;
      const isNotBranded = k.type === 'non-branded';
      
      // Position-based filtering logic
      const position = k.position;
      const isAlreadyTopRanking = position >= 1 && position <= 3; // Exclude positions 1-3
      const hasImprovementPotential = position >= 4 && position <= 10; // Include positions 4-10
      const isUnranked = position === 0 || position > 10; // Include unranked or ranking beyond page 1
      
      // Achievability check: if we have competitor DA data, filter out highly competitive keywords
      const averageCompetitorDA = (k as any).averageCompetitorDA || 0;
      const targetDA = 35; // Estimated target DA - could be passed as prop
      const isAchievable = averageCompetitorDA === 0 || averageCompetitorDA <= (targetDA + 20); // Achievable if competitors aren't vastly superior
      
      // Include if: not already top ranking AND (has improvement potential OR unranked) AND meets other criteria AND is achievable
      const includeKeyword = !isAlreadyTopRanking && (hasImprovementPotential || isUnranked) && isNotBranded && hasRelevance && hasReasonableVolume && isAchievable;
      
      console.log(`Keyword: "${k.keyword}", position: ${position}, avgCompetitorDA: ${averageCompetitorDA}, achievable: ${isAchievable}, included: ${includeKeyword}`);
      
      return includeKeyword;
    });
    
    console.log(`✅ Found ${filtered.length} achievable recommended keywords`);
    return filtered;
  }, [keywords])
  
  // Sort keywords based on current sort field and order
  const sortedKeywords = useMemo(() => {
    const sorted = [...recommendedKeywords].sort((a, b) => {
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
        case 'relevance':
          const relA = a.businessRelevance || 0
          const relB = b.businessRelevance || 0
          compareValue = relA - relB
          break
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue
    })
    
    return sorted
  }, [recommendedKeywords, sortField, sortOrder])
  
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentKeywords = sortedKeywords.slice(startIndex, endIndex)

  const contextWord = auditType === 'page' ? 'webpage' : 'website';

  if (!keywords || keywords.length === 0 || sortedKeywords.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-black">{title}</h4>
          <Tooltip 
            content={
              <div className="max-w-sm">
                <p className="font-semibold mb-2">Recommended Keywords</p>
                <p className="mb-2">Business-relevant keywords we recommend you target to improve your search visibility on this {contextWord}</p>
                <p className="text-xs"><strong>What makes a keyword recommended:</strong></p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li>High business relevance (70%+ match)</li>
                  <li>Reasonable search volume (10+ monthly searches)</li>
                  <li>Achievable ranking opportunity</li>
                  <li>Aligned with your business goals</li>
                </ul>
              </div>
            }
            position="top"
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
          </Tooltip>
        </div>
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <p className="text-sm">No highly relevant keyword opportunities found for this {contextWord}.</p>
          <p className="text-xs text-gray-400 mt-2">Try expanding your content or targeting broader industry terms.</p>
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
  
  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.9) return 'text-green-600 bg-green-50'
    if (relevance >= 0.8) return 'text-blue-600 bg-blue-50'
    if (relevance >= 0.7) return 'text-orange-600 bg-orange-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getRelevanceLabel = (relevance: number) => {
    if (relevance >= 0.9) return 'Excellent'
    if (relevance >= 0.8) return 'Very Good'
    if (relevance >= 0.7) return 'Good'
    return 'Fair'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-black">{title}</h4>
        <Tooltip 
          content={
            <div className="max-w-sm">
              <p className="font-semibold mb-2">Recommended Keywords</p>
              <p className="mb-2">{description}</p>
              <div className="mb-2 text-xs">
                <p className="font-medium mb-1">Why these keywords are recommended:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>High business relevance score (60%+)</li>
                  <li>Not already ranking in top 3 positions</li>
                  <li>Room for improvement (positions 4-10) or new opportunities</li>
                  <li>Achievable search volume</li>
                  <li>Aligned with your business type</li>
                </ul>
              </div>
              <p className="text-xs font-medium text-blue-300">💡 Focus on these keywords to improve or establish your organic visibility</p>
            </div>
          }
          position="top"
        >
          <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
        </Tooltip>
      </div>
      
      {/* Summary Card */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          💡 {sortedKeywords.length} Keyword Opportunities Found
        </div>
        <p className="text-green-700 text-xs mt-1">
          These are high-relevance keywords we recommend targeting. Excludes keywords where you already rank in top 3 positions, focuses on improvement opportunities.
        </p>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-5">
              <button
                onClick={() => handleSort('keyword')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Recommended Keyword
                {getSortIcon('keyword')}
              </button>
              <Tooltip 
                content="Business-relevant keywords recommended for targeting"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-3 text-center">
              <button
                onClick={() => handleSort('volume')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Monthly Volume
                {getSortIcon('volume')}
              </button>
              <Tooltip 
                content="Monthly search volume - realistic targets for your business"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-4 text-center">
              <button
                onClick={() => handleSort('relevance')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Business Relevance
                {getSortIcon('relevance')}
              </button>
              <Tooltip 
                content="How relevant this keyword is to your business (higher = better match)"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {currentKeywords.map((keyword, index) => {
            const relevanceScore = keyword.businessRelevance || 0;
            const position = keyword.position;
            const hasImprovementPotential = position >= 4 && position <= 10;
            
            return (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  <div className="col-span-5">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">{keyword.keyword}</span>
                      <div className="flex flex-col gap-1">
                        {keyword.category && (
                          <span className="text-gray-500 text-xs capitalize">
                            {keyword.category} • {keyword.intent || 'General'}
                          </span>
                        )}
                        {hasImprovementPotential && (
                          <span className="text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded-md inline-flex items-center gap-1 w-fit">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Currently ranking #{position} - Room for improvement
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-center text-gray-600">
                    <span className="font-medium">{keyword.volume?.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">/mo</span>
                  </div>
                  <div className="col-span-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRelevanceColor(relevanceScore)}`}>
                      {getRelevanceLabel(relevanceScore)} ({Math.round(relevanceScore * 100)}%)
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
            Showing {startIndex + 1}-{Math.min(endIndex, sortedKeywords.length)} of {sortedKeywords.length} recommended keywords
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
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <img src="/office-worker-medium-light-skin-tone-svgrepo-com.svg" alt="Office Worker" className="w-10 h-10" />
          <h5 className="font-semibold text-purple-900">Conclusion & Next Steps</h5>
        </div>
        <div className="text-purple-800 text-sm space-y-2">
          {sortedKeywords.length > 0 ? (
            <>
              <p>
                <strong>High-priority opportunities!</strong> These {sortedKeywords.length} recommended target keywords have both high business relevance (70%+) 
                and decent search volume. They represent your best chances for quick SEO wins.
              </p>
              <div className="space-y-1">
                <p><strong>Action items for maximum impact:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Start here:</strong> Focus on the highest-relevance keywords first (dark green indicators)</li>
                  <li>Create dedicated pages or blog posts targeting these specific terms</li>
                  <li>Include these keywords naturally in your page titles, headings, and content</li>
                  <li>Monitor your rankings for these keywords monthly</li>
                  <li>Build internal links pointing to pages optimized for these terms</li>
                </ul>
              </div>
              <p className="mt-2 text-purple-700">
                <strong>Pro tip:</strong> These recommended target keywords were selected because they closely match your business and have realistic competition levels for quicker results.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Content opportunity:</strong> No high-relevance keywords found in your current content. 
                This suggests your website content may not be optimized for how customers search.
              </p>
              <div className="space-y-1">
                <p><strong>Action items to find opportunities:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Research how your ideal customers search for your services</li>
                  <li>Analyze competitor websites to see what keywords they target</li>
                  <li>Create content that answers common customer questions</li>
                  <li>Use industry-specific terminology your customers understand</li>
                  <li>Consider hiring an SEO content specialist for keyword research</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}