import Anthropic from '@anthropic-ai/sdk';

export interface TechnicalSEOImpact {
  overallImpactScore: number; // 0-100 (how much technical issues affect traffic)
  trafficImpactPercentage: number; // Estimated % of traffic lost due to technical issues
  estimatedTrafficLoss: number; // Actual traffic numbers potentially lost
  criticalIssues: {
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    trafficImpact: number; // percentage
    description: string;
    recommendation: string;
    estimatedFixTime: string;
  }[];
  coreWebVitals: {
    score: number; // 0-100
    issues: string[];
    trafficImpact: number; // percentage
    recommendations: string[];
  };
  mobileOptimization: {
    score: number; // 0-100
    trafficImpact: number; // percentage
    issues: string[];
    recommendations: string[];
  };
  indexingHealth: {
    score: number; // 0-100
    estimatedIndexablePages: number;
    potentialTrafficGain: number; // percentage
    recommendations: string[];
  };
  prioritizedFixes: {
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'moderate' | 'complex';
    expectedGain: number; // percentage traffic increase
    timeToImplement: string;
  }[];
}

export class TechnicalSEOImpactCalculator {
  private client: Anthropic | null;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY not configured - Technical SEO Impact Calculator unavailable');
      this.client = null;
    } else {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async calculateTechnicalImpact(
    domain: string,
    htmlContent: string,
    currentTraffic: number,
    industryType: string = 'general'
  ): Promise<TechnicalSEOImpact | null> {
    if (!this.client) {
      console.log('Technical SEO Impact Calculator not available - Claude API not configured');
      return null;
    }

    try {
      console.log(`🔧 Calculating technical SEO impact for ${domain}...`);
      
      const technicalAnalysis = await this.analyzeTechnicalFactors(domain, htmlContent, currentTraffic, industryType);
      
      if (technicalAnalysis) {
        console.log(`✅ Technical impact analysis complete - ${technicalAnalysis.trafficImpactPercentage}% potential traffic loss identified`);
        return technicalAnalysis;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Technical SEO Impact Calculator error:', error);
      return null;
    }
  }

  private async analyzeTechnicalFactors(
    domain: string,
    htmlContent: string,
    currentTraffic: number,
    industryType: string
  ): Promise<TechnicalSEOImpact | null> {
    const analysisPrompt = this.buildTechnicalAnalysisPrompt(domain, htmlContent, currentTraffic, industryType);
    
    const response = await this.client!.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.2,
      system: `You are a technical SEO expert analyzing website performance and its impact on organic traffic.
               Focus on quantifiable technical issues that directly affect search rankings and user experience.
               Provide specific, actionable recommendations with realistic impact estimates.
               Return valid JSON only.`,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent?.text) {
      throw new Error('No response from Claude for technical SEO analysis');
    }

    try {
      const analysis = JSON.parse(textContent.text);
      return this.validateAndEnhanceAnalysis(analysis, currentTraffic);
    } catch (parseError) {
      console.error('Failed to parse Claude response for technical SEO:', parseError);
      return null;
    }
  }

  private buildTechnicalAnalysisPrompt(
    domain: string,
    htmlContent: string,
    currentTraffic: number,
    industryType: string
  ): string {
    const technicalIndicators = this.extractTechnicalIndicators(htmlContent);
    
    return `Analyze the technical SEO issues and their traffic impact for this website.

Domain: ${domain}
Industry: ${industryType}
Current Monthly Organic Traffic: ${currentTraffic}

Technical Analysis:
${technicalIndicators}

Analyze and return a JSON object with these exact fields:

{
  "overallImpactScore": number (0-100, overall technical health),
  "trafficImpactPercentage": number (0-50, percentage of traffic potentially lost),
  "estimatedTrafficLoss": number (actual traffic numbers lost),
  "criticalIssues": [
    {
      "issue": "string (specific technical issue)",
      "severity": "critical|high|medium|low",
      "trafficImpact": number (0-30, percentage impact),
      "description": "string (what this means)",
      "recommendation": "string (how to fix)",
      "estimatedFixTime": "string (time to implement)"
    }
  ],
  "coreWebVitals": {
    "score": number (0-100),
    "issues": ["issue1", "issue2"],
    "trafficImpact": number (0-20, percentage),
    "recommendations": ["rec1", "rec2"]
  },
  "mobileOptimization": {
    "score": number (0-100),
    "trafficImpact": number (0-25, percentage),
    "issues": ["issue1", "issue2"],
    "recommendations": ["rec1", "rec2"]
  },
  "indexingHealth": {
    "score": number (0-100),
    "estimatedIndexablePages": number,
    "potentialTrafficGain": number (0-40, percentage),
    "recommendations": ["rec1", "rec2"]
  },
  "prioritizedFixes": [
    {
      "title": "string (fix description)",
      "impact": "high|medium|low",
      "effort": "easy|moderate|complex",
      "expectedGain": number (0-30, percentage traffic increase),
      "timeToImplement": "string"
    }
  ]
}

Base your analysis on:
1. Page structure and HTML quality
2. Meta tags and SEO elements
3. Mobile responsiveness indicators
4. Loading speed indicators (script/CSS analysis)
5. Internal linking structure
6. Content accessibility
7. Schema markup presence
8. Industry-specific technical requirements

Be conservative with impact estimates. Focus on issues that directly affect search rankings.
Prioritize fixes by impact vs effort ratio.
Return only valid JSON, no additional text.`;
  }

  private extractTechnicalIndicators(html: string): string {
    const indicators = [];
    
    // Basic HTML structure
    indicators.push(`HTML Length: ${html.length} characters`);
    indicators.push(`Title Tags: ${(html.match(/<title[^>]*>/gi) || []).length}`);
    indicators.push(`Meta Descriptions: ${(html.match(/<meta[^>]*name=["']description["']/gi) || []).length}`);
    indicators.push(`H1 Tags: ${(html.match(/<h1[^>]*>/gi) || []).length}`);
    indicators.push(`H2 Tags: ${(html.match(/<h2[^>]*>/gi) || []).length}`);
    
    // Technical elements
    indicators.push(`Images: ${(html.match(/<img[^>]*>/gi) || []).length}`);
    indicators.push(`Images with Alt: ${(html.match(/<img[^>]*alt=/gi) || []).length}`);
    indicators.push(`Internal Links: ${(html.match(/<a[^>]*href=["'][^http][^>]*>/gi) || []).length}`);
    indicators.push(`External Links: ${(html.match(/<a[^>]*href=["']http[^>]*>/gi) || []).length}`);
    
    // Performance indicators
    indicators.push(`CSS Files: ${(html.match(/<link[^>]*rel=["']stylesheet["']/gi) || []).length}`);
    indicators.push(`JavaScript Files: ${(html.match(/<script[^>]*src=/gi) || []).length}`);
    indicators.push(`Inline Scripts: ${(html.match(/<script[^>]*>[^<]/gi) || []).length}`);
    
    // Mobile/responsive indicators
    indicators.push(`Viewport Meta: ${html.includes('viewport') ? 'Present' : 'Missing'}`);
    indicators.push(`Responsive Classes: ${(html.match(/class=["'][^"']*responsive[^"']*["']/gi) || []).length}`);
    
    // Schema/structured data
    indicators.push(`JSON-LD: ${(html.match(/<script[^>]*type=["']application\/ld\+json["']/gi) || []).length}`);
    indicators.push(`Microdata: ${html.includes('itemtype') ? 'Present' : 'Missing'}`);
    
    // Sample content
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) indicators.push(`Title: "${titleMatch[1].substring(0, 100)}"`);
    
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
    if (metaMatch) indicators.push(`Meta Description: "${metaMatch[1].substring(0, 100)}"`);
    
    return indicators.join('\n');
  }

  private validateAndEnhanceAnalysis(analysis: {
    overallImpactScore?: number;
    trafficImpactPercentage?: number;
    criticalIssues?: Array<{
      issue?: string;
      severity?: string;
      trafficImpact?: number;
      description?: string;
      recommendation?: string;
      estimatedFixTime?: string;
    }>;
    coreWebVitals?: {
      score?: number;
      issues?: string[];
      trafficImpact?: number;
      recommendations?: string[];
    };
    mobileOptimization?: {
      score?: number;
      trafficImpact?: number;
      issues?: string[];
      recommendations?: string[];
    };
    indexingHealth?: {
      score?: number;
      estimatedIndexablePages?: number;
      potentialTrafficGain?: number;
      recommendations?: string[];
    };
    prioritizedFixes?: Array<{
      title?: string;
      impact?: string;
      effort?: string;
      expectedGain?: number;
      timeToImplement?: string;
    }>;
  }, currentTraffic: number): TechnicalSEOImpact {
    const clampScore = (score: number) => Math.max(0, Math.min(100, score || 0));
    const clampPercentage = (percent: number, max: number = 50) => Math.max(0, Math.min(max, percent || 0));
    
    const trafficImpactPercentage = clampPercentage(analysis.trafficImpactPercentage);
    const estimatedTrafficLoss = Math.round(currentTraffic * (trafficImpactPercentage / 100));
    
    return {
      overallImpactScore: clampScore(analysis.overallImpactScore),
      trafficImpactPercentage,
      estimatedTrafficLoss,
      criticalIssues: Array.isArray(analysis.criticalIssues)
        ? analysis.criticalIssues.slice(0, 5).map((issue) => ({
            issue: issue.issue || 'Technical issue identified',
            severity: ['critical', 'high', 'medium', 'low'].includes(issue.severity) ? issue.severity : 'medium',
            trafficImpact: clampPercentage(issue.trafficImpact, 30),
            description: issue.description || 'Technical issue affecting SEO performance',
            recommendation: issue.recommendation || 'Address this technical issue',
            estimatedFixTime: issue.estimatedFixTime || '2-4 weeks'
          }))
        : [],
      coreWebVitals: {
        score: clampScore(analysis.coreWebVitals?.score),
        issues: Array.isArray(analysis.coreWebVitals?.issues) ? analysis.coreWebVitals.issues.slice(0, 3) : [],
        trafficImpact: clampPercentage(analysis.coreWebVitals?.trafficImpact, 20),
        recommendations: Array.isArray(analysis.coreWebVitals?.recommendations) ? analysis.coreWebVitals.recommendations.slice(0, 3) : []
      },
      mobileOptimization: {
        score: clampScore(analysis.mobileOptimization?.score),
        trafficImpact: clampPercentage(analysis.mobileOptimization?.trafficImpact, 25),
        issues: Array.isArray(analysis.mobileOptimization?.issues) ? analysis.mobileOptimization.issues.slice(0, 3) : [],
        recommendations: Array.isArray(analysis.mobileOptimization?.recommendations) ? analysis.mobileOptimization.recommendations.slice(0, 3) : []
      },
      indexingHealth: {
        score: clampScore(analysis.indexingHealth?.score),
        estimatedIndexablePages: Math.max(1, analysis.indexingHealth?.estimatedIndexablePages || 10),
        potentialTrafficGain: clampPercentage(analysis.indexingHealth?.potentialTrafficGain, 40),
        recommendations: Array.isArray(analysis.indexingHealth?.recommendations) ? analysis.indexingHealth.recommendations.slice(0, 3) : []
      },
      prioritizedFixes: Array.isArray(analysis.prioritizedFixes)
        ? analysis.prioritizedFixes.slice(0, 5).map((fix) => ({
            title: fix.title || 'Technical improvement',
            impact: ['high', 'medium', 'low'].includes(fix.impact) ? fix.impact : 'medium',
            effort: ['easy', 'moderate', 'complex'].includes(fix.effort) ? fix.effort : 'moderate',
            expectedGain: clampPercentage(fix.expectedGain, 30),
            timeToImplement: fix.timeToImplement || '2-4 weeks'
          }))
        : []
    };
  }
}