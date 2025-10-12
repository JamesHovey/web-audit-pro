import Anthropic from '@anthropic-ai/sdk';

export interface TrafficQualityMetrics {
  engagementScore: number; // 0-100
  conversionPotential: number; // 0-100
  userExperienceScore: number; // 0-100
  contentRelevanceScore: number; // 0-100
  overallQualityScore: number; // 0-100
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  estimatedMetrics: {
    bounceRate: number; // percentage
    avgSessionDuration: number; // seconds
    pagesPerSession: number;
    conversionRate: number; // percentage for typical business goals
  };
}

export class TrafficQualityScorer {
  private client: Anthropic | null;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY not configured - Traffic Quality Scorer unavailable');
      this.client = null;
    } else {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async analyzeTrafficQuality(
    domain: string,
    htmlContent: string,
    trafficData: any,
    industryType: string = 'general'
  ): Promise<TrafficQualityMetrics | null> {
    if (!this.client) {
      console.log('Traffic Quality Scorer not available - Claude API not configured');
      return null;
    }

    try {
      console.log(`🎯 Analyzing traffic quality for ${domain}...`);
      
      const analysis = await this.performQualityAnalysis(domain, htmlContent, trafficData, industryType);
      
      if (analysis) {
        console.log(`✅ Traffic quality analysis complete - Overall score: ${analysis.overallQualityScore}/100`);
        return analysis;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Traffic Quality Scorer error:', error);
      return null;
    }
  }

  private async performQualityAnalysis(
    domain: string,
    htmlContent: string,
    trafficData: any,
    industryType: string
  ): Promise<TrafficQualityMetrics | null> {
    const analysisPrompt = this.buildQualityAnalysisPrompt(domain, htmlContent, trafficData, industryType);
    
    const response = await this.client!.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.3,
      system: `You are an expert web analytics specialist analyzing website traffic quality. 
               Provide detailed, actionable insights about user engagement and conversion potential.
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
      throw new Error('No response from Claude for traffic quality analysis');
    }

    try {
      const analysis = JSON.parse(textContent.text);
      return this.validateAndEnhanceAnalysis(analysis);
    } catch (parseError) {
      console.error('Failed to parse Claude response for traffic quality:', parseError);
      return null;
    }
  }

  private buildQualityAnalysisPrompt(
    domain: string,
    htmlContent: string,
    trafficData: any,
    industryType: string
  ): string {
    // Extract key content for analysis
    const contentSample = this.extractRelevantContent(htmlContent);
    
    return `Analyze the traffic quality potential for this website and provide insights.

Domain: ${domain}
Industry: ${industryType}
Current Traffic: ${trafficData.monthlyOrganicTraffic || 0} organic, ${trafficData.monthlyPaidTraffic || 0} paid

Website Content Analysis:
${contentSample}

Analyze and return a JSON object with these exact fields:

{
  "engagementScore": number (0-100, based on content depth, navigation, interactivity),
  "conversionPotential": number (0-100, based on CTAs, trust signals, user flow),
  "userExperienceScore": number (0-100, based on design, navigation, mobile-friendliness),
  "contentRelevanceScore": number (0-100, based on content quality and target audience match),
  "overallQualityScore": number (0-100, weighted average of above scores),
  "qualityGrade": "A|B|C|D|F" (based on overall score: 90+ = A, 80+ = B, 70+ = C, 60+ = D, <60 = F),
  "insights": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
  },
  "estimatedMetrics": {
    "bounceRate": number (estimated bounce rate percentage),
    "avgSessionDuration": number (estimated session duration in seconds),
    "pagesPerSession": number (estimated pages per session),
    "conversionRate": number (estimated conversion rate percentage for typical business goals)
  }
}

Base your analysis on:
1. Content quality and depth
2. Navigation structure and user flow
3. Call-to-action presence and effectiveness
4. Trust signals (testimonials, certifications, contact info)
5. Mobile responsiveness indicators
6. Page loading and technical indicators
7. Industry-specific conversion factors

Provide realistic estimates based on industry benchmarks for ${industryType} businesses.
Return only valid JSON, no additional text.`;
  }

  private extractRelevantContent(html: string): string {
    // Extract key elements for quality analysis
    const elements = [
      // Navigation and structure
      /<nav[^>]*>(.*?)<\/nav>/gi,
      /<header[^>]*>(.*?)<\/header>/gi,
      /<main[^>]*>(.*?)<\/main>/gi,
      
      // Content elements
      /<h1[^>]*>(.*?)<\/h1>/gi,
      /<h2[^>]*>(.*?)<\/h2>/gi,
      /<title[^>]*>(.*?)<\/title>/gi,
      /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/gi,
      
      // Call-to-action indicators
      /<button[^>]*>(.*?)<\/button>/gi,
      /<a[^>]*href[^>]*>(.*?)<\/a>/gi,
      
      // Trust signals
      /<footer[^>]*>(.*?)<\/footer>/gi,
      /contact|phone|email|address/gi,
      /testimonial|review|rating/gi,
      
      // Form elements
      /<form[^>]*>(.*?)<\/form>/gi,
      /<input[^>]*>/gi,
    ];

    let extracted = '';
    elements.forEach(regex => {
      const matches = html.match(regex);
      if (matches) {
        extracted += matches.slice(0, 3).join('\n') + '\n';
      }
    });

    // Limit to 1500 characters for efficient processing
    return extracted.substring(0, 1500);
  }

  private validateAndEnhanceAnalysis(analysis: any): TrafficQualityMetrics {
    // Ensure all scores are within valid ranges
    const clampScore = (score: number) => Math.max(0, Math.min(100, score || 0));
    
    return {
      engagementScore: clampScore(analysis.engagementScore),
      conversionPotential: clampScore(analysis.conversionPotential),
      userExperienceScore: clampScore(analysis.userExperienceScore),
      contentRelevanceScore: clampScore(analysis.contentRelevanceScore),
      overallQualityScore: clampScore(analysis.overallQualityScore),
      qualityGrade: analysis.qualityGrade || 'C',
      insights: {
        strengths: Array.isArray(analysis.insights?.strengths) ? analysis.insights.strengths.slice(0, 3) : [],
        weaknesses: Array.isArray(analysis.insights?.weaknesses) ? analysis.insights.weaknesses.slice(0, 3) : [],
        recommendations: Array.isArray(analysis.insights?.recommendations) ? analysis.insights.recommendations.slice(0, 3) : []
      },
      estimatedMetrics: {
        bounceRate: Math.max(10, Math.min(90, analysis.estimatedMetrics?.bounceRate || 65)),
        avgSessionDuration: Math.max(30, Math.min(600, analysis.estimatedMetrics?.avgSessionDuration || 120)),
        pagesPerSession: Math.max(1, Math.min(10, analysis.estimatedMetrics?.pagesPerSession || 2.5)),
        conversionRate: Math.max(0.5, Math.min(20, analysis.estimatedMetrics?.conversionRate || 2.5))
      }
    };
  }
}