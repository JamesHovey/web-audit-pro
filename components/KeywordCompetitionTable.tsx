'use client'

import { useState } from 'react'
import Tooltip from './Tooltip'

interface CompetitorData {
  domain: string;
  overlapCount: number;
  overlapPercentage: number;
  sharedKeywords: string[];
  averagePosition: number;
}

interface KeywordCompetitionAnalysis {
  competitors: CompetitorData[];
  totalKeywordsAnalyzed: number;
  analysisMethod: string;
  creditsUsed: number;
}

interface KeywordCompetitionTableProps {
  competitionData: KeywordCompetitionAnalysis | null
  title?: string
  description?: string
}

export default function KeywordCompetitionTable({ 
  competitionData, 
  title = "Keyword Competition Analysis",
  description = "Competitor websites with the highest keyword overlap based on your Above Fold Keywords"
}: KeywordCompetitionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null)
  const itemsPerPage = 10
  
  if (!competitionData || !competitionData.competitors || competitionData.competitors.length === 0) {
    if (competitionData?.analysisMethod === 'api_required') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-black">{title}</h4>
            <Tooltip 
              content="Keyword Competition analysis requires ValueSERP API to identify competitors ranking for the same keywords as your Above Fold Keywords"
              position="top"
            >
              <div className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">?</div>
            </Tooltip>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              ⚠️ ValueSERP API Required
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Keyword Competition analysis requires ValueSERP API to identify competitors ranking for the same Above Fold Keywords.
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  }

  const competitors = competitionData.competitors || [];
  const totalPages = Math.ceil(competitors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCompetitors = competitors.slice(startIndex, endIndex)

  const toggleExpanded = (domain: string) => {
    setExpandedCompetitor(expandedCompetitor === domain ? null : domain)
  }

  const getOverlapColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 bg-red-50'
    if (percentage >= 60) return 'text-orange-600 bg-orange-50'
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50'
    if (percentage >= 20) return 'text-blue-600 bg-blue-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-black">{title}</h4>
        <Tooltip 
          content={
            <div>
              <p className="font-semibold mb-2">Keyword Competition Analysis</p>
              <p className="mb-2">Identifies competitors ranking for the same Above Fold Keywords as your website</p>
              <p className="mb-2"><strong>How it works:</strong></p>
              <ul className="list-disc list-inside mb-2 text-xs">
                <li>Analyzes your top-ranking keywords (positions 1-3)</li>
                <li>Uses ValueSERP API to check who else ranks for these keywords</li>
                <li>Calculates percentage overlap and average competitor positions</li>
                <li>Shows top 10 competitors with highest keyword overlap</li>
              </ul>
              <p><strong>Higher overlap = stronger direct competitor</strong></p>
            </div>
          }
          position="top"
        >
          <div className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">?</div>
        </Tooltip>
      </div>
      
      {/* Analysis Summary */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          📊 Competition Analysis Results
        </div>
        <p className="text-blue-700 text-xs mt-1">
          Analyzed {competitionData.totalKeywordsAnalyzed} Above Fold Keywords and found {competitors.length} competing domains. 
          Higher overlap percentages indicate stronger direct competitors.
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-4">
              Competitor Domain
              <Tooltip 
                content="Competing websites that rank for the same Above Fold Keywords as your site"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Overlap %
              <Tooltip 
                content="Percentage of your Above Fold Keywords that this competitor also ranks for"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Shared Keywords
              <Tooltip 
                content="Number of Above Fold Keywords where both you and this competitor rank"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Avg Position
              <Tooltip 
                content="Average Google ranking position of this competitor for shared keywords"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Details
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {paginatedCompetitors.map((competitor, index) => (
            <div key={competitor.domain} className="px-4 py-3 hover:bg-gray-50">
              <div className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">{competitor.domain}</span>
                    <span className="text-gray-500 text-xs">
                      Direct competitor for Above Fold Keywords
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOverlapColor(competitor.overlapPercentage)}`}>
                    {competitor.overlapPercentage}%
                  </span>
                </div>
                <div className="col-span-2 text-center text-gray-600">
                  {competitor.overlapCount} keywords
                </div>
                <div className="col-span-2 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    competitor.averagePosition <= 3 ? 'bg-red-100 text-red-800' :
                    competitor.averagePosition <= 5 ? 'bg-orange-100 text-orange-800' :
                    competitor.averagePosition <= 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    #{competitor.averagePosition}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <button
                    onClick={() => toggleExpanded(competitor.domain)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    {expandedCompetitor === competitor.domain ? 'Hide' : 'View'} Keywords
                  </button>
                </div>
              </div>
              
              {/* Expanded view showing shared keywords */}
              {expandedCompetitor === competitor.domain && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="bg-gray-50 p-3 rounded">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">
                      Shared Above Fold Keywords ({competitor.sharedKeywords.length}):
                    </h6>
                    <div className="flex flex-wrap gap-1">
                      {competitor.sharedKeywords.map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, competitors.length)} of {competitors.length} competitors
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