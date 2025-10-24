import { NextResponse } from 'next/server';
import type { CompetitionAnalysisRequestBody } from '@/types/api';

function shouldSkipDomain(domain: string): boolean {
  const skipDomains = [
    'wikipedia.org', 'youtube.com', 'facebook.com', 'linkedin.com',
    'reddit.com', 'amazon.com', 'ebay.com', 'gov.uk', 'bbc.com',
    'adobe.com', 'microsoft.com', 'google.com', 'apple.com',
    'trustpilot.com', 'yelp.com', 'glassdoor.com', 'indeed.com'
  ];
  
  return skipDomains.some(skip => domain.includes(skip)) || 
         domain.length < 4;
}

function estimateAuthority(positions: number[], totalScore: number): number {
  const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
  const topPositions = positions.filter(p => p <= 3).length;
  
  let authority = 30; // Base score
  
  if (avgPosition <= 3) authority += 40;
  else if (avgPosition <= 5) authority += 25;
  else if (avgPosition <= 10) authority += 10;
  
  authority += topPositions * 5;
  authority += Math.min(20, totalScore / 100);
  
  return Math.min(95, Math.max(15, Math.round(authority)));
}

interface KeywordData {
  keyword: string;
  volume?: number;
}

export async function POST(request: Request) {
  try {
    const { domain, keywords } = await request.json() as CompetitionAnalysisRequestBody & { keywords: KeywordData[] };

    if (!domain || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Missing required parameters: domain, keywords' },
        { status: 400 }
      );
    }

    console.log(`🚀 Dynamic competitor analysis for ${domain} using Serper`);
    console.log(`📊 Analyzing ${keywords.length} provided keywords`);

    // Check if Serper is configured
    const { isSerperConfigured } = await import('../../../lib/serperService');

    if (!isSerperConfigured()) {
      return NextResponse.json({
        competitors: [],
        totalKeywordsAnalyzed: keywords.length,
        analysisMethod: 'serper_not_configured',
        creditsUsed: 0,
        error: 'Serper API not configured'
      }, { status: 400 });
    }

    const { SerperService } = await import('../../../lib/serperService');
    const serperService = new SerperService();

    // Use the provided keywords directly (these are from the website's keyword analysis)
    const keywordsToAnalyze = keywords
      .filter((k: KeywordData) => k.volume && k.volume > 0)
      .sort((a: KeywordData, b: KeywordData) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 10); // Top 10 keywords by volume

    console.log(`🔍 Analyzing competitors for these specific keywords:`, keywordsToAnalyze.map((k: KeywordData) => k.keyword));
    
    const competitorMap = new Map<string, {
      keywords: string[];
      positions: number[];
      titles: string[];
      totalScore: number;
    }>();
    
    const cleanTargetDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
    
    for (const keywordData of keywordsToAnalyze) {
      try {
        console.log(`🔍 Checking who ranks for: "${keywordData.keyword}"`);
        
        const serpResults = await serperService.getFullSerpResults(
          keywordData.keyword,
          'United Kingdom',
          20
        );
        
        if (serpResults?.results) {
          for (const result of serpResults.results) {
            if (result.domain && result.position <= 10) {
              const cleanDomain = result.domain.toLowerCase().replace(/^www\./, '');
              
              // Skip the target domain and irrelevant sites
              if (cleanDomain === cleanTargetDomain || shouldSkipDomain(cleanDomain)) {
                continue;
              }
              
              if (!competitorMap.has(cleanDomain)) {
                competitorMap.set(cleanDomain, {
                  keywords: [],
                  positions: [],
                  titles: [],
                  totalScore: 0
                });
              }
              
              const competitor = competitorMap.get(cleanDomain)!;
              competitor.keywords.push(keywordData.keyword);
              competitor.positions.push(result.position);
              competitor.titles.push(result.title);
              competitor.totalScore += (11 - result.position) * (keywordData.volume || 100) / 100;
              
              console.log(`  📍 ${cleanDomain} ranks #${result.position} for "${keywordData.keyword}"`);
            }
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to analyze keyword "${keywordData.keyword}":`, error);
      }
    }
    
    // Convert to competitor format
    const competitors = [];
    for (const [domain, data] of competitorMap.entries()) {
      if (data.keywords.length >= 2) { // Require at least 2 shared keywords
        const avgPosition = data.positions.reduce((a, b) => a + b, 0) / data.positions.length;
        const overlapPercentage = Math.round((data.keywords.length / keywordsToAnalyze.length) * 100);
        const estimatedAuthority = estimateAuthority(data.positions, data.totalScore);
        
        if (overlapPercentage >= 20) { // Minimum 20% overlap
          competitors.push({
            domain,
            overlapCount: data.keywords.length,
            overlapPercentage,
            authority: estimatedAuthority,
            competitorType: estimatedAuthority > 60 ? 'aspirational' : 'direct',
            sharedKeywords: [...new Set(data.keywords)],
            strengths: [
              `Ranks for ${data.keywords.length} shared keywords`,
              `Average position ${Math.round(avgPosition)}`,
              estimatedAuthority > 60 ? 'High domain authority' : 'Similar market position'
            ],
            weaknesses: [
              estimatedAuthority > 60 ? 'Strong competition level' : 'Limited differentiation',
              'Established market presence'
            ],
            aspirationalNote: estimatedAuthority > 60 
              ? `Industry leader with ${estimatedAuthority} DA. Study their keyword strategy and content approach for growth insights.`
              : undefined
          });
        }
      }
    }
    
    // Sort by relevance score
    const sortedCompetitors = competitors
      .sort((a, b) => (b.overlapPercentage * b.authority) - (a.overlapPercentage * a.authority))
      .slice(0, 12);
    
    console.log(`✅ Found ${sortedCompetitors.length} real competitors via Serper`);
    sortedCompetitors.slice(0, 5).forEach(comp => {
      console.log(`  🎯 ${comp.domain}: ${comp.overlapPercentage}% overlap (${comp.overlapCount} keywords)`);
    });

    return NextResponse.json({
      competitors: sortedCompetitors,
      totalKeywordsAnalyzed: keywords.length,
      analysisMethod: 'serper_dynamic_analysis',
      creditsUsed: 0,
      analysis: {
        marketType: 'Dynamically identified market based on keyword rankings',
        competitionLevel: `${sortedCompetitors.filter(c => c.competitorType === 'direct').length} direct competitors, ${sortedCompetitors.filter(c => c.competitorType === 'aspirational').length} aspirational targets`,
        opportunities: [
          'Target keywords where competitors rank poorly',
          'Leverage unique business positioning',
          'Focus on local/niche keyword opportunities'
        ],
        threats: [
          'Established competitor presence',
          'High competition for main keywords',
          'Aspirational competitors setting high standards'
        ],
        recommendations: [
          'Analyze competitor content strategies',
          'Target long-tail variations of shared keywords',
          'Build authority through consistent content creation'
        ]
      }
    });

  } catch (error) {
    console.error('Serper competitor analysis failed:', error);
    return NextResponse.json({
      competitors: [],
      totalKeywordsAnalyzed: 0,
      analysisMethod: 'serper_failed',
      creditsUsed: 0,
      error: 'Competition analysis failed'
    }, { status: 500 });
  }
}

