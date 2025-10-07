'use client'

import { useState } from 'react'
import Tooltip from './Tooltip'

interface CompetitorData {
  domain: string;
  overlap: number;
  keywords: number;
  authority: number;
  description: string;
  matchingKeywords: string[];
  competitionLevel: 'high' | 'medium' | 'low';
}

interface CompetitorAnalysis {
  competitors: CompetitorData[];
  totalCompetitors: number;
  averageOverlap: number;
  competitionIntensity: 'high' | 'medium' | 'low';
  keywordClusters: { [industry: string]: string[] };
}

interface AboveFoldCompetitorTableProps {
  analysis: CompetitorAnalysis;
  title?: string;
}

export default function AboveFoldCompetitorTable({ 
  analysis,
  title = "Main Competition Analysis"
}: AboveFoldCompetitorTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  const { 
    competitors = [], 
    competitionIntensity = 'low', 
    averageOverlap = 0, 
    keywordClusters = {} 
  } = analysis || {};
  
  // Pagination
  const totalPages = Math.ceil(competitors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCompetitors = competitors.slice(startIndex, endIndex)
  
  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  if (!competitors || competitors.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-black">{title}</h4>
          <Tooltip 
            content="Analysis of main competitors based on your Above Fold Keywords (positions 1-3 on Google)"
            position="top"
          >
            <div className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">?</div>
          </Tooltip>
        </div>
        <div className="border rounded-lg p-6 text-center text-gray-500">
          <p>No competitor data available. Generate Above Fold Keywords first to analyze competition.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-black">{title}</h4>
        <Tooltip 
          content={
            <div>
              <p className="font-semibold mb-2">Competition Analysis</p>
              <p className="mb-2">Identifies main competitors based on your Above Fold Keywords (top 3 Google positions)</p>
              <p className="mb-2"><strong>How it works:</strong></p>
              <ul className="list-disc list-inside mb-2 text-xs">
                <li>Analyzes keywords you rank #1, #2, #3 for</li>
                <li>Identifies domains competing for same keywords</li>
                <li>Calculates keyword overlap percentage</li>
                <li>Shows domain authority scores</li>
              </ul>
              <p><strong>Competition Level:</strong> Based on keyword overlap and market presence</p>
            </div>
          }
          position="top"
        >
          <div className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">?</div>
        </Tooltip>
      </div>

      {/* Competition Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{competitors.length}</div>
          <div className="text-sm text-gray-600">Competitors Found</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{averageOverlap}%</div>
          <div className="text-sm text-gray-600">Avg. Overlap</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className={`text-2xl font-bold capitalize ${getIntensityColor(competitionIntensity)}`}>
            {competitionIntensity}
          </div>
          <div className="text-sm text-gray-600">Market Intensity</div>
        </div>
      </div>

      {/* Keyword Clusters */}
      {Object.keys(keywordClusters).length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Keyword Categories Found:</h5>
          <div className="flex flex-wrap gap-2">
            {Object.entries(keywordClusters).map(([cluster, keywords]) => (
              <span 
                key={cluster}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                title={`${keywords.length} keywords in this category`}
              >
                {cluster} ({keywords.length})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Competitors Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-3">
              Competitor Domain
              <Tooltip 
                content="Domain competing for similar keywords in top 3 Google positions"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Overlap
              <Tooltip 
                content="Percentage of your Above Fold Keywords this competitor also targets"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Authority
              <Tooltip 
                content="Domain authority score (1-100) indicating SEO strength"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-2 text-center">
              Competition
              <Tooltip 
                content="Competition level based on overlap and market presence"
                position="top"
              >
                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <div className="col-span-3">
              Description
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {/* Show paginated competitors on screen */}
          <div className="screen-only">
            {paginatedCompetitors.map((competitor, index) => (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  <div className="col-span-3">
                    <div className="flex flex-col">
                      <a 
                        href={`https://${competitor?.domain || 'unknown'}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {competitor?.domain || 'Unknown Domain'}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        {competitor?.keywords || 0} shared keywords
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {competitor?.overlap || 0}%
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (competitor?.authority || 0) >= 50 ? 'bg-green-100 text-green-800' :
                      (competitor?.authority || 0) >= 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      DA {competitor?.authority || 0}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium capitalize ${getCompetitionColor(competitor?.competitionLevel || 'low')}`}>
                      {competitor?.competitionLevel || 'low'}
                    </span>
                  </div>
                  <div className="col-span-3 text-gray-600 text-xs">
                    {competitor?.description || 'No description available'}
                  </div>
                </div>
                
                {/* Matching Keywords */}
                {competitor?.matchingKeywords && competitor.matchingKeywords.length > 0 && (
                  <div className="mt-2 col-span-12">
                    <div className="text-xs">
                      <span className="text-gray-500">Competing keywords: </span>
                      <span className="text-gray-700">
                        {competitor.matchingKeywords.slice(0, 3).join(', ')}
                        {competitor.matchingKeywords.length > 3 && ` (+${competitor.matchingKeywords.length - 3} more)`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Show all competitors in print mode */}
          <div className="print-only">
            {competitors.map((competitor, index) => (
              <div key={index} className="px-4 py-3">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  <div className="col-span-3">{competitor?.domain || 'Unknown Domain'}</div>
                  <div className="col-span-2 text-center">{competitor?.overlap || 0}%</div>
                  <div className="col-span-2 text-center">DA {competitor?.authority || 0}</div>
                  <div className="col-span-2 text-center capitalize">{competitor?.competitionLevel || 'low'}</div>
                  <div className="col-span-3">{competitor?.description || 'No description available'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="screen-only flex items-center justify-between">
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
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 3) {
                  pageNumber = i + 1
                } else if (currentPage <= 2) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 1) {
                  pageNumber = totalPages - 2 + i
                } else {
                  pageNumber = currentPage - 1 + i
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