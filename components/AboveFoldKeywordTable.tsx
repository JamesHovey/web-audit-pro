'use client'

import { useState, useMemo } from 'react'
import Tooltip from './Tooltip'

interface KeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty?: number;
  type?: 'branded' | 'non-branded';
  url?: string;
  snippet?: string;
  searchIntent?: string;
  contentRelevance?: number; // 0-1 relevance score
  isActualRanking?: boolean; // True if this is a real SERP ranking
}

interface AboveFoldKeywordTableProps {
  keywords: KeywordData[]
  title?: string
  description?: string
  discoveryMethod?: string
}

export default function AboveFoldKeywordTable({ 
  keywords, 
  title = "Above Fold Keywords & Opportunities",
  description,
  discoveryMethod = "content_opportunity_analysis"
}: AboveFoldKeywordTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Set description based on discovery method
  const finalDescription = description || (
    discoveryMethod === 'valueserp_actual_rankings' 
      ? "Business-relevant longtail keywords (3+ words) found on your website that rank in Google's top 3 positions (1-3). Sorted by position then volume."
      : discoveryMethod === 'api_required'
      ? "ValueSERP API required to show actual Google rankings for longtail keywords."
      : "Business-relevant longtail keywords analysis requires ValueSERP API configuration."
  );
  
  // Sort by position (1,2,3) then by volume (high to low) - matches backend sorting
  const sortedKeywords = useMemo(() => {
    return [...(keywords || [])]
      .sort((a, b) => {
        // First sort by position (1 is best)
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        // Then by volume (higher is better)
        return (b.volume || 0) - (a.volume || 0);
      })
  }, [keywords])
  
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  // Show paginated keywords on screen, all keywords in print mode
  const paginatedKeywords = sortedKeywords.slice(startIndex, endIndex)
  
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

  const renderKeywordRow = (keyword: KeywordData, index: number) => {
    // Estimate potential CTR based on content relevance (this is speculative)
    const relevanceScore = keyword.contentRelevance || 0;
    const estimatedCtr = relevanceScore * 0.15; // Max 15% CTR for highly relevant content
    const estimatedClicks = Math.round((keyword.volume || 0) * estimatedCtr);
    
    return (
      <div key={index} className="px-4 py-3 hover:bg-gray-50">
        <div className="grid grid-cols-9 gap-4 items-center text-sm">
          <div className="col-span-5">
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium">{keyword.keyword}</span>
              <div className="flex items-center gap-2 mt-1">
                {keyword.type === 'branded' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Branded
                  </span>
                )}
                {keyword.searchIntent && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    keyword.searchIntent === 'transactional' ? 'bg-green-100 text-green-800' :
                    keyword.searchIntent === 'commercial' ? 'bg-blue-100 text-blue-800' :
                    keyword.searchIntent === 'informational' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {keyword.searchIntent}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-2 text-center">
            {keyword.isActualRanking ? (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                keyword.position <= 3 ? 'bg-green-100 text-green-800' :
                keyword.position <= 10 ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                #{keyword.position}
              </span>
            ) : keyword.position === 0 ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Opportunity
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {Math.round((keyword.contentRelevance || 0) * 100)}%
              </span>
            )}
          </div>
          <div className="col-span-2 text-center text-gray-600">
            {(keyword.volume || 0).toLocaleString()}
          </div>
        </div>
        {keyword.snippet && (
          <div className="mt-2 col-span-9">
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Google snippet:</strong> {keyword.snippet.substring(0, 120)}...
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-black">{title}</h4>
        <Tooltip 
          content={
            <div>
              <p className="font-semibold mb-2">Content-Based Keyword Opportunities</p>
              <p className="mb-2">Potential SEO keywords identified from your website content analysis</p>
              <p className="mb-2"><strong>How it works:</strong></p>
              <ul className="list-disc list-inside mb-2 text-xs">
                <li>Analyzes your website content for relevant keywords</li>
                <li>Checks real search volumes using Keywords Everywhere API</li>
                <li>Filters for business-relevant terms (10-10,000 monthly searches)</li>
                <li>Scores opportunities based on content relevance</li>
              </ul>
              <p><strong>Note:</strong> These are content-based opportunities, not actual Google rankings</p>
            </div>
          }
          position="top"
        >
          <div className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">?</div>
        </Tooltip>
      </div>
      
      {/* Discovery Method Notice */}
      {discoveryMethod === "valueserp_actual_rankings" && sortedKeywords.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ✅ Business-Relevant Longtail Keywords (Positions 1-3)
          </div>
          <p className="text-green-700 text-xs mt-1">
            Showing only business-relevant longtail keywords (3+ words) where your site ranks in Google positions 1-3. Max 30 results, sorted by position then volume.
          </p>
        </div>
      )}
      
      {(discoveryMethod === "api_required" || discoveryMethod === "content_opportunity_analysis") && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            ⚠️ ValueSERP API Required
          </div>
          <p className="text-yellow-700 text-xs mt-1">
            Above Fold Keywords analysis requires both Keywords Everywhere API (for volumes) and ValueSERP API (for real rankings). No fallback data is provided.
          </p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-9 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-5">
              Keyword & Intent
              <Tooltip 
                content="Longtail keywords from your website content that currently rank in Google's top 3 organic positions (1st, 2nd, or 3rd place), with search intent indicators"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Position
              <Tooltip 
                content="Google organic ranking position (1-3) for keywords where your site appears in the top 3 results. ValueSERP provides real-time ranking data."
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Volume
              <Tooltip 
                content="Monthly search volume from Keywords Everywhere API - real Google Keyword Planner data"
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
            {paginatedKeywords.map((keyword, index) => renderKeywordRow(keyword, index))}
          </div>
          
          {/* Show all keywords in print mode */}
          <div className="print-only">
            {sortedKeywords.map((keyword, index) => renderKeywordRow(keyword, index))}
          </div>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="screen-only flex items-center justify-between">
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