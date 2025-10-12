import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeTrafficInsights {
  geographicDistribution: {
    country: string;
    percentage: number;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  }[];
  brandStrength: {
    score: number; // 0-100
    brandedTrafficRatio: number; // 0-1
    brandVariations: string[];
    reasoning: string;
  };
  industryClassification: {
    primary: string;
    secondary?: string;
    seasonalPattern: 'stable' | 'holiday-peaks' | 'summer-peaks' | 'school-cycle' | 'q4-heavy';
    b2bVsB2c: 'b2b' | 'b2c' | 'mixed';
  };
  trafficPotential: {
    currentStage: 'startup' | 'growth' | 'established' | 'mature';
    estimatedMonthlyVisitors: { min: number; max: number };
    growthTrend: 'declining' | 'stable' | 'growing' | 'rapid-growth';
    confidence: 'high' | 'medium' | 'low';
  };
  trafficSources: {
    organic: number; // percentage
    paid: number;
    social: number;
    direct: number;
    referral: number;
    reasoning: string;
  };
  competitivePosition: {
    marketShare: 'dominant' | 'strong' | 'moderate' | 'weak' | 'minimal';
    uniqueValueProps: string[];
    trafficOpportunities: string[];
  };
}

export class ClaudeTrafficAnalyzer {
  private client: Anthropic | null;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY not configured - Claude traffic analysis unavailable');
      this.client = null;
    } else {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async analyzeTrafficPatterns(
    domain: string,
    htmlContent: string,
    scrapedMetrics: any
  ): Promise<ClaudeTrafficInsights | null> {
    if (!this.client) {
      console.log('Claude API not configured, skipping traffic analysis');
      return null;
    }

    try {
      const prompt = this.buildAnalysisPrompt(domain, htmlContent, scrapedMetrics);
      
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2048,
        temperature: 0.3,
        system: `You are an expert web traffic analyst. Analyze website content to predict traffic patterns and provide insights. 
                 Be specific and data-driven. Return valid JSON only.`,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent?.text) {
        throw new Error('No response from Claude');
      }

      // Parse JSON response
      const insights = JSON.parse(textContent.text);
      console.log('Claude traffic analysis completed successfully');
      return insights;

    } catch (error) {
      console.error('Error in Claude traffic analysis:', error);
      return null;
    }
  }

  private buildAnalysisPrompt(domain: string, htmlContent: string, metrics: any): string {
    // Truncate HTML to relevant parts for token efficiency
    const truncatedHtml = this.extractRelevantHtml(htmlContent);
    
    return `Analyze this website and provide traffic insights in JSON format.

Domain: ${domain}
Current Metrics:
- Indexed Pages: ${metrics.indexedPages || 'unknown'}
- Domain Authority: ${metrics.domainAuthority || 'unknown'}
- Content Quality Score: ${metrics.contentQuality || 'unknown'}

Website Content Sample:
${truncatedHtml}

Analyze and return a JSON object with these exact fields:

{
  "geographicDistribution": [
    {
      "country": "Country name",
      "percentage": number (0-100),
      "confidence": "high|medium|low",
      "reasoning": "Brief explanation"
    }
  ],
  "brandStrength": {
    "score": number (0-100),
    "brandedTrafficRatio": number (0-1),
    "brandVariations": ["brand", "variations"],
    "reasoning": "Brief explanation"
  },
  "industryClassification": {
    "primary": "Industry name",
    "secondary": "Secondary industry or null",
    "seasonalPattern": "stable|holiday-peaks|summer-peaks|school-cycle|q4-heavy",
    "b2bVsB2c": "b2b|b2c|mixed"
  },
  "trafficPotential": {
    "currentStage": "startup|growth|established|mature",
    "estimatedMonthlyVisitors": { "min": number, "max": number },
    "growthTrend": "declining|stable|growing|rapid-growth",
    "confidence": "high|medium|low"
  },
  "trafficSources": {
    "organic": number (percentage),
    "paid": number,
    "social": number,
    "direct": number,
    "referral": number,
    "reasoning": "Brief explanation"
  },
  "competitivePosition": {
    "marketShare": "dominant|strong|moderate|weak|minimal",
    "uniqueValueProps": ["prop1", "prop2"],
    "trafficOpportunities": ["opportunity1", "opportunity2"]
  }
}

Base your analysis on:
1. Language, currency, phone numbers, addresses for geographic distribution
2. Brand mentions, company name prominence for brand strength
3. Services, products, content type for industry classification
4. Content volume, quality, structure for traffic potential
5. Content types, CTAs, marketing focus for traffic sources
6. Unique features, specializations for competitive position

Return only valid JSON, no additional text.`;
  }

  private extractRelevantHtml(html: string): string {
    // Extract key elements for analysis
    const elements = [
      /<title[^>]*>(.*?)<\/title>/gi,
      /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/gi,
      /<h1[^>]*>(.*?)<\/h1>/gi,
      /<h2[^>]*>(.*?)<\/h2>/gi,
      /\$[\d,]+/g, // Prices
      /£[\d,]+/g, // UK prices
      /€[\d,]+/g, // Euro prices
      /\+\d{1,3}[\s-]\d+/g, // Phone numbers
      /<footer[^>]*>([\s\S]*?)<\/footer>/gi,
    ];

    let extracted = '';
    elements.forEach(regex => {
      const matches = html.match(regex);
      if (matches) {
        extracted += matches.slice(0, 5).join('\n') + '\n';
      }
    });

    // Limit to 2000 characters for token efficiency
    return extracted.substring(0, 2000);
  }

  enhanceTrafficData(baseData: any, claudeInsights: ClaudeTrafficInsights | null): any {
    if (!claudeInsights) {
      return baseData;
    }

    // Enhance geographic distribution
    if (claudeInsights.geographicDistribution?.length > 0) {
      const totalTraffic = baseData.monthlyOrganicTraffic + baseData.monthlyPaidTraffic;
      baseData.topCountries = claudeInsights.geographicDistribution.slice(0, 5).map(geo => ({
        country: geo.country,
        percentage: geo.percentage,
        traffic: Math.round(totalTraffic * geo.percentage / 100),
        confidence: geo.confidence,
        reasoning: geo.reasoning
      }));
      baseData.geographicConfidence = claudeInsights.geographicDistribution[0].confidence;
    }

    // Enhance branded traffic estimation
    if (claudeInsights.brandStrength) {
      const totalOrganic = baseData.monthlyOrganicTraffic;
      baseData.brandedTraffic = Math.round(totalOrganic * claudeInsights.brandStrength.brandedTrafficRatio);
      baseData.brandStrength = claudeInsights.brandStrength;
    }

    // Add industry insights
    if (claudeInsights.industryClassification) {
      baseData.industry = claudeInsights.industryClassification;
      
      // Adjust traffic trend based on seasonal pattern
      if (claudeInsights.industryClassification.seasonalPattern !== 'stable') {
        baseData.seasonalPattern = claudeInsights.industryClassification.seasonalPattern;
      }
    }

    // Enhance traffic source breakdown
    if (claudeInsights.trafficSources) {
      const totalTraffic = baseData.monthlyOrganicTraffic + baseData.monthlyPaidTraffic;
      baseData.trafficSources = {
        organic: Math.round(totalTraffic * claudeInsights.trafficSources.organic / 100),
        paid: Math.round(totalTraffic * claudeInsights.trafficSources.paid / 100),
        social: Math.round(totalTraffic * claudeInsights.trafficSources.social / 100),
        direct: Math.round(totalTraffic * claudeInsights.trafficSources.direct / 100),
        referral: Math.round(totalTraffic * claudeInsights.trafficSources.referral / 100),
        reasoning: claudeInsights.trafficSources.reasoning
      };
    }

    // Add competitive insights
    if (claudeInsights.competitivePosition) {
      baseData.competitivePosition = claudeInsights.competitivePosition;
    }

    // Add traffic potential insights
    if (claudeInsights.trafficPotential) {
      baseData.trafficPotential = claudeInsights.trafficPotential;
      
      // Adjust confidence based on Claude's assessment
      if (baseData.confidence === 'low' && claudeInsights.trafficPotential.confidence === 'high') {
        baseData.confidence = 'medium';
      }
    }

    baseData.enhancedWithAI = true;
    baseData.aiModel = 'claude-3-haiku';
    
    return baseData;
  }
}