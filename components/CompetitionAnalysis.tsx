'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Users, 
  BarChart3,
  Shield,
  Search,
  ArrowRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import Tooltip from './Tooltip';

interface CompetitorData {
  domain: string;
  sharedKeywords: number;
  overlapPercentage: number;
  domainAuthority: number;
  competitionLevel: 'low' | 'medium' | 'high';
  competitorType?: 'direct' | 'aspirational';
  keywordOpportunities: string[];
  strengths: string[];
  aspirationalNote?: string;
}

interface CompetitionAnalysisProps {
  targetDomain: string;
  keywords: Array<{
    keyword: string;
    volume: number | null;
    difficulty: number;
  }>;
}

export default function CompetitionAnalysis({ targetDomain, keywords }: CompetitionAnalysisProps) {
  const [competitionData, setCompetitionData] = useState<{
    competitors: CompetitorData[];
    analysis: any;
    loading: boolean;
  }>({
    competitors: [],
    analysis: null,
    loading: true
  });

  useEffect(() => {
    analyzeCompetition();
  }, [targetDomain, keywords]);

  const analyzeCompetition = async () => {
    try {
      setCompetitionData(prev => ({ ...prev, loading: true }));
      
      console.log('🏆 Starting competition analysis with', keywords.length, 'keywords');
      console.log('🏆 Target domain:', targetDomain);
      console.log('🏆 Keywords received:', keywords.map(k => ({ keyword: k.keyword, volume: k.volume })));
      
      // Get top keywords for analysis - be more flexible with volume filtering
      let topKeywordsData = keywords
        .filter(k => k.volume && k.volume > 0) // Accept any volume > 0
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 15); // Increased to 15 keywords
      
      // If no keywords with volume, try keywords without volume requirement
      if (topKeywordsData.length === 0) {
        topKeywordsData = keywords.slice(0, 10);
      }
      
      console.log('🎯 Using keywords for competition analysis:', topKeywordsData.map(k => k.keyword));
      
      if (topKeywordsData.length === 0) {
        setCompetitionData({
          competitors: [],
          analysis: { message: 'No keywords available for competition analysis' },
          loading: false
        });
        return;
      }

      // Use the existing KeywordCompetitionService
      const { KeywordCompetitionService } = await import('../lib/keywordCompetitionService');
      const competitionService = new KeywordCompetitionService(targetDomain);
      
      const rawAnalysis = await competitionService.analyzeCompetitorOverlap(
        topKeywordsData.map(k => ({ 
          keyword: k.keyword, 
          volume: k.volume || 0, 
          difficulty: k.difficulty || 50, 
          position: 0 
        })),
        'gb' // Default to UK for now
      );
      
      console.log('🏆 Raw analysis result:', rawAnalysis);
      console.log('🏆 Competitors found:', rawAnalysis?.competitors?.length || 0);
      
      if (rawAnalysis && rawAnalysis.competitors) {
        const competitors: CompetitorData[] = rawAnalysis.competitors.map((comp: any) => ({
          domain: comp.domain,
          sharedKeywords: comp.overlapCount || comp.sharedKeywords?.length || 0,
          overlapPercentage: comp.overlapPercentage || 0,
          domainAuthority: comp.authority || 30,
          competitionLevel: comp.overlapPercentage >= 60 ? 'high' : 
                           comp.overlapPercentage >= 30 ? 'medium' : 'low',
          competitorType: comp.competitorType || 'direct',
          keywordOpportunities: comp.sharedKeywords?.slice(0, 3) || [],
          strengths: comp.strengths || [],
          aspirationalNote: comp.aspirationalNote || ''
        }));

        setCompetitionData({
          competitors: competitors.slice(0, 10), // Show up to 10 competitors
          analysis: rawAnalysis,
          loading: false
        });
      } else {
        setCompetitionData({
          competitors: [],
          analysis: { message: 'No competitive data available' },
          loading: false
        });
      }
    } catch (error) {
      console.error('Competition analysis failed:', error);
      setCompetitionData({
        competitors: [],
        analysis: { error: 'Competition analysis failed' },
        loading: false
      });
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-[#c42e3b]/10 text-[#c42e3b]'; // PMW red
      case 'medium': return 'bg-[#e67e22]/10 text-[#e67e22]'; // PMW orange
      case 'low': return 'bg-[#27ae60]/10 text-[#27ae60]'; // PMW green
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDAColor = (da: number) => {
    if (da >= 70) return 'text-[#c42e3b]'; // High authority - red (strong competitor)
    if (da >= 50) return 'text-[#e67e22]'; // Medium authority - orange
    if (da >= 30) return 'text-[#42499c]'; // Good authority - PMW blue
    return 'text-[#27ae60]'; // Lower authority - green (easier to compete)
  };

  if (competitionData.loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#42499c]" />
          <h3 className="text-lg font-semibold text-gray-900">Competition Analysis</h3>
          <div className="text-xs bg-[#42499c]/10 text-[#42499c] px-2 py-1 rounded-full font-medium">
            Analysing...
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#42499c] mx-auto mb-4"></div>
          <p className="text-gray-600">Analysing keyword competition...</p>
        </div>
      </div>
    );
  }

  if (competitionData.competitors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#42499c]" />
          <h3 className="text-lg font-semibold text-gray-900">Competition Analysis</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm">
            {competitionData.analysis?.message || 'No competitive data available for your keywords'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            This may indicate a niche market with low competition or new keyword opportunities.
          </p>
        </div>
      </div>
    );
  }

  const totalSharedKeywords = competitionData.competitors.reduce((sum, comp) => sum + comp.sharedKeywords, 0);
  const avgOverlap = Math.round(
    competitionData.competitors.reduce((sum, comp) => sum + comp.overlapPercentage, 0) / competitionData.competitors.length
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#42499c]" />
        <h3 className="text-lg font-semibold text-gray-900">Competition Analysis</h3>
        <span className="text-xs bg-[#42499c]/10 text-[#42499c] px-2 py-1 rounded-full font-medium">
          {competitionData.competitors.length} Competitors Found
        </span>
      </div>

      {/* Competition Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-[#42499c]" />
            <span className="text-xs text-gray-500">Competitors</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {competitionData.competitors.length}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-[#675c9b]" />
            <span className="text-xs text-gray-500">Shared Keywords</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {totalSharedKeywords}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#ef86ce]" />
            <span className="text-xs text-gray-500">Avg Overlap</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {avgOverlap}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#27ae60]" />
            <span className="text-xs text-gray-500">Opportunity</span>
          </div>
          <div className={`text-lg font-bold ${avgOverlap < 30 ? 'text-[#27ae60]' : avgOverlap < 60 ? 'text-[#e67e22]' : 'text-[#c42e3b]'}`}>
            {avgOverlap < 30 ? 'HIGH' : avgOverlap < 60 ? 'MEDIUM' : 'LOW'}
          </div>
        </div>
      </div>

      {/* Competitor List */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 mb-3">Top Competing Domains</h4>
        {competitionData.competitors.map((competitor, index) => (
          <div key={index} className={`border rounded-lg p-4 ${
            competitor.competitorType === 'aspirational' 
              ? 'border-[#ef86ce] bg-gradient-to-r from-[#ef86ce]/5 to-[#675c9b]/5' 
              : 'border-gray-200'
          }`}>
            {/* Aspirational Badge */}
            {competitor.competitorType === 'aspirational' && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#ef86ce] text-white rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Aspirational Benchmark
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold ${
                  competitor.competitorType === 'aspirational' ? 'bg-[#ef86ce]' : 'bg-[#42499c]'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <a 
                    href={competitor.domain.startsWith('http') ? competitor.domain : `https://${competitor.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 hover:text-[#42499c] transition-colors cursor-pointer"
                  >
                    {competitor.domain}
                  </a>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>DA: <span className={`font-medium ${getDAColor(competitor.domainAuthority)}`}>{competitor.domainAuthority}</span></span>
                    <span>•</span>
                    <span>{competitor.sharedKeywords} shared keywords</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{competitor.overlapPercentage}%</div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCompetitionColor(competitor.competitionLevel)}`}>
                  {competitor.competitionLevel.toUpperCase()} COMPETITION
                </span>
              </div>
            </div>
            
            {/* Aspirational Note */}
            {competitor.competitorType === 'aspirational' && competitor.aspirationalNote && (
              <div className="mb-4 bg-[#ef86ce]/10 border border-[#ef86ce]/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-[#ef86ce] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#ef86ce] mb-1">Why This Competitor Is Worth Studying</div>
                    <div className="text-sm text-gray-700">{competitor.aspirationalNote}</div>
                  </div>
                </div>
              </div>
            )}

            {competitor.keywordOpportunities.length > 0 && (
              <div className={`rounded-lg p-3 ${
                competitor.competitorType === 'aspirational' ? 'bg-[#ef86ce]/5' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className={`w-4 h-4 ${
                    competitor.competitorType === 'aspirational' ? 'text-[#ef86ce]' : 'text-[#42499c]'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">Shared Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {competitor.keywordOpportunities.slice(0, 3).map((keyword, kIndex) => (
                    <span key={kIndex} className={`text-xs px-2 py-1 rounded border ${
                      competitor.competitorType === 'aspirational' 
                        ? 'bg-white border-[#ef86ce]/30' 
                        : 'bg-white border-gray-200'
                    }`}>
                      {keyword}
                    </span>
                  ))}
                  {competitor.keywordOpportunities.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{competitor.keywordOpportunities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Strategic Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#42499c]/5 to-[#675c9b]/5 rounded-lg border border-[#42499c]/20">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-[#42499c]" />
          <span className="text-sm font-medium text-[#42499c]">Competition Insights</span>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          {avgOverlap < 30 ? (
            <>
              <p><strong>Low Competition Opportunity:</strong> Limited keyword overlap suggests you can rank for unique terms.</p>
              <p>Focus on the shared keywords where competitors rank well, and develop content for gaps they're missing.</p>
            </>
          ) : avgOverlap < 60 ? (
            <>
              <p><strong>Moderate Competition:</strong> Some keyword overlap but opportunities exist.</p>
              <p>Target long-tail variations of shared keywords and focus on better content quality.</p>
            </>
          ) : (
            <>
              <p><strong>High Competition:</strong> Significant keyword overlap with established competitors.</p>
              <p>Consider targeting less competitive long-tail keywords and building domain authority first.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}