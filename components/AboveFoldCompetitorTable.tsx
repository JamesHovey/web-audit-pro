'use client'

import React from 'react'
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
  targetDomainAuthority?: number; // Authority of the website being audited
}

interface AboveFoldCompetitorTableProps {
  analysis: CompetitorAnalysis;
  title?: string;
}

export default function AboveFoldCompetitorTable({ 
  analysis,
  title = "Main Competition Analysis"
}: AboveFoldCompetitorTableProps) {
  // Removed pagination - showing top 10 results only
  const maxResults = 10
  const minResults = 5 // Ensure at least 5 competitors are shown

  const {
    competitors: rawCompetitors = [],
    competitionIntensity = 'low',
    averageOverlap = 0,
    keywordClusters = {}
  } = analysis || {};

  // First, exclude sortlist.co.uk from all results
  const filteredRaw = rawCompetitors.filter((competitor: CompetitorData) => {
    const domain = (competitor?.domain || '').toLowerCase();
    return domain !== 'sortlist.co.uk';
  });

  // Try filtering for high-quality competitors (overlap >= 40% and competition != 'low')
  let competitors = filteredRaw.filter((competitor: CompetitorData) => {
    const overlapPercent = competitor?.overlap || 0;
    const competition = competitor?.competitionLevel || '';
    return overlapPercent >= 40 && competition.toLowerCase() !== 'low';
  });

  // If we have fewer than 5 competitors, relax the filter to show at least 5
  if (competitors.length < minResults && filteredRaw.length >= minResults) {
    competitors = filteredRaw.slice(0, minResults);
  } else if (competitors.length < minResults) {
    // If even the raw list has fewer than 5, just use what we have
    competitors = filteredRaw;
  }

  // Limit to top 10 competitors
  const displayedCompetitors = competitors.slice(0, maxResults)
  
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

  const getAuthorityColor = (authority: number, targetAuthority?: number) => {
    if (!targetAuthority) {
      // Default coloring when no comparison available
      if (authority >= 70) return 'text-red-600 bg-red-50'
      if (authority >= 50) return 'text-orange-600 bg-orange-50'
      if (authority >= 30) return 'text-yellow-600 bg-yellow-50'
      if (authority >= 10) return 'text-blue-600 bg-blue-50'
      return 'text-gray-600 bg-gray-50'
    }
    
    // Comparison-based coloring
    const diff = authority - targetAuthority;
    if (diff >= 20) return 'text-red-600 bg-red-50' // Much stronger
    if (diff >= 10) return 'text-orange-600 bg-orange-50' // Stronger
    if (diff >= -10) return 'text-yellow-600 bg-yellow-50' // Similar
    if (diff >= -20) return 'text-blue-600 bg-blue-50' // Weaker
    return 'text-green-600 bg-green-50' // Much weaker
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
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
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
      <div className="grid grid-cols-4 gap-4 mb-4">
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
        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-900">
            {analysis.targetDomainAuthority || 'N/A'}
          </div>
          <div className="text-sm text-blue-600">Your Domain Authority</div>
        </div>
      </div>


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
            {displayedCompetitors.map((competitor, index) => (
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAuthorityColor(competitor?.authority || 0, analysis.targetDomainAuthority)}`}>
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
      
      {competitors.length > maxResults && (
        <div className="screen-only text-sm text-gray-500 text-center mt-2">
          Showing top {maxResults} of {competitors.length} high-competition sites
        </div>
      )}

      {/* Conclusion Section */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <img src="/office-worker-medium-skin-tone-svgrepo-com.svg" alt="Office Worker" className="w-10 h-10" />
          <h5 className="font-semibold text-red-900">Conclusion & Next Steps</h5>
        </div>
        <div className="text-red-800 text-sm space-y-2">
          {competitors.length > 0 ? (
            <>
              <p>
                <strong>Competitive landscape identified!</strong> Found {competitors.length} main competitors based on your top-ranking keywords (positions 1-3). 
                These are your most direct SEO competitors who are successfully competing for the same valuable search terms.
              </p>
              <div className="space-y-1">
                <p><strong>Action items to outrank competitors:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {competitionIntensity === 'high' && (
                    <li><strong>High competition detected:</strong> This is a competitive market - expect longer timeframes for ranking improvements</li>
                  )}
                  {analysis.targetDomainAuthority && competitors.some(c => c.authority > (analysis.targetDomainAuthority || 0) + 15) && (
                    <li><strong>Authority gap:</strong> Focus on link building - some competitors have much higher domain authority</li>
                  )}
                  <li>Study the content strategies of top competitors with 60%+ overlap</li>
                  <li>Identify content gaps where competitors rank but you don't</li>
                  <li>Create superior content for keywords where you're closely competing</li>
                  <li>Monitor competitor backlink strategies and replicate successful tactics</li>
                  <li>Set up alerts to track when competitors publish new content</li>
                </ul>
              </div>
              <p className="mt-2 text-red-700">
                <strong>Quick win:</strong> Target keywords where you rank #4-10 and competitors are weaker.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Market leadership opportunity!</strong> No major competitors detected for your top-ranking positions. 
                You may be in a niche market or have achieved strong market dominance.
              </p>
              <div className="space-y-1">
                <p><strong>Action items to maintain leadership:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Continuously monitor for emerging competitors entering your space</li>
                  <li>Expand keyword targeting to capture adjacent markets</li>
                  <li>Create comprehensive content to build authority moats</li>
                  <li>Consider broader keyword research to find growth opportunities</li>
                  <li>Focus on building brand authority to maintain competitive advantages</li>
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