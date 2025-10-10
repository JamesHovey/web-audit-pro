/**
 * Contextual Keyword Analyzer
 * Provides business context awareness for keyword relevance scoring
 */

export interface BusinessContext {
  primaryType: string;
  confidence: number;
  relevantTerms: string[];
  industryKeywords: string[];
  contextualModifiers: string[];
}

export interface ContextualKeyword {
  keyword: string;
  relevanceScore: number;
  contextReason: string;
  businessAlignment: number;
  elementSource: string; // 'h1', 'title', 'meta', 'content'
  priority: 'high' | 'medium' | 'low';
}

export class ContextualKeywordAnalyzer {
  
  /**
   * Analyze business context from website content
   */
  analyzeBusinessContext(html: string, domain: string): BusinessContext {
    const content = html.toLowerCase();
    const title = this.extractTitle(html).toLowerCase();
    const metaDesc = this.extractMetaDescription(html).toLowerCase();
    const h1Tags = this.extractH1Tags(html).map(h => h.toLowerCase());
    
    // Combined content for analysis
    const analyzableContent = `${title} ${metaDesc} ${h1Tags.join(' ')} ${content}`;
    
    console.log(`🔍 Analyzing business context for: ${domain}`);
    console.log(`📝 H1 tags found: ${h1Tags.join(', ')}`);
    
    // Business type detection with confidence scoring
    const businessTypes = [
      {
        type: 'financial-services',
        indicators: ['trading', 'trader', 'investment', 'capital', 'wealth', 'finance', 'fund', 'asset', 'portfolio', 'broker', 'financial', 'market'],
        weight: 2.0 // Higher weight for specific indicators
      },
      {
        type: 'legal-services', 
        indicators: ['solicitor', 'lawyer', 'legal', 'law', 'barrister', 'court', 'litigation', 'advice'],
        weight: 1.8
      },
      {
        type: 'healthcare',
        indicators: ['medical', 'health', 'doctor', 'clinic', 'treatment', 'surgery', 'hospital', 'care'],
        weight: 1.8
      },
      {
        type: 'architecture-construction',
        indicators: ['architect', 'design', 'building', 'construction', 'planning', 'structural', 'residential'],
        weight: 1.6
      },
      {
        type: 'digital-marketing',
        indicators: ['marketing', 'digital', 'seo', 'advertising', 'web', 'design', 'branding', 'agency'],
        weight: 1.5
      },
      {
        type: 'manufacturing',
        indicators: ['manufacturing', 'machinery', 'equipment', 'industrial', 'production', 'processing'],
        weight: 1.4
      }
    ];
    
    let bestMatch = { type: 'general-business', confidence: 0, relevantTerms: [] as string[] };
    
    for (const businessType of businessTypes) {
      const matches = businessType.indicators.filter(indicator => 
        analyzableContent.includes(indicator)
      );
      
      if (matches.length > 0) {
        // Calculate confidence based on number of matches and their weight
        const confidence = (matches.length / businessType.indicators.length) * businessType.weight;
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type: businessType.type,
            confidence: Math.min(confidence, 1.0), // Cap at 1.0
            relevantTerms: matches
          };
        }
      }
    }
    
    console.log(`🎯 Business context detected: ${bestMatch.type} (confidence: ${bestMatch.confidence.toFixed(2)})`);
    console.log(`📊 Relevant terms found: ${bestMatch.relevantTerms.join(', ')}`);
    
    return {
      primaryType: bestMatch.type,
      confidence: bestMatch.confidence,
      relevantTerms: bestMatch.relevantTerms,
      industryKeywords: this.getIndustryKeywords(bestMatch.type),
      contextualModifiers: this.getContextualModifiers(bestMatch.type)
    };
  }
  
  /**
   * Score keyword relevance based on business context
   */
  scoreKeywordWithContext(
    keyword: string,
    businessContext: BusinessContext,
    elementSource: string = 'content'
  ): ContextualKeyword {
    const lowerKeyword = keyword.toLowerCase();
    let relevanceScore = 0.1; // Base score
    let contextReason = 'General keyword';
    let businessAlignment = 0;
    
    // 1. Check against business-specific relevant terms
    const matchingTerms = businessContext.relevantTerms.filter(term => 
      lowerKeyword.includes(term) || term.includes(lowerKeyword)
    );
    
    if (matchingTerms.length > 0) {
      relevanceScore += 0.4;
      businessAlignment += 0.5;
      contextReason = `Contains business terms: ${matchingTerms.join(', ')}`;
    }
    
    // 2. Check against industry keywords
    const industryMatches = businessContext.industryKeywords.filter(industryTerm => 
      lowerKeyword.includes(industryTerm.toLowerCase())
    );
    
    if (industryMatches.length > 0) {
      relevanceScore += 0.3;
      businessAlignment += 0.4;
      contextReason += ` | Industry relevant: ${industryMatches.join(', ')}`;
    }
    
    // 3. Element source bonus (H1 tags are more important)
    const elementBonus = this.getElementSourceBonus(elementSource);
    relevanceScore += elementBonus;
    
    if (elementBonus > 0) {
      contextReason += ` | Found in ${elementSource}`;
    }
    
    // 4. Business alignment bonus
    if (businessContext.confidence > 0.7 && businessAlignment > 0.3) {
      relevanceScore += 0.2;
      contextReason += ` | High business alignment`;
    }
    
    // 5. Contextual modifiers check
    const hasModifier = businessContext.contextualModifiers.some(modifier => 
      lowerKeyword.includes(modifier.toLowerCase())
    );
    
    if (hasModifier) {
      relevanceScore += 0.1;
      contextReason += ` | Contains contextual modifiers`;
    }
    
    // Cap relevance score at 1.0
    relevanceScore = Math.min(relevanceScore, 1.0);
    businessAlignment = Math.min(businessAlignment, 1.0);
    
    // Determine priority
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (relevanceScore >= 0.7) priority = 'high';
    else if (relevanceScore >= 0.4) priority = 'medium';
    
    return {
      keyword,
      relevanceScore,
      contextReason,
      businessAlignment,
      elementSource,
      priority
    };
  }
  
  /**
   * Get element source bonus multiplier
   */
  private getElementSourceBonus(elementSource: string): number {
    const bonuses: Record<string, number> = {
      'h1': 0.3,        // H1 tags are very important
      'title': 0.25,    // Page titles are important  
      'h2': 0.2,        // H2 tags are somewhat important
      'meta': 0.15,     // Meta descriptions matter
      'h3': 0.1,        // H3 tags have some value
      'content': 0.05,  // General content has minimal bonus
      'alt': 0.05       // Alt text has minimal bonus
    };
    
    return bonuses[elementSource] || 0;
  }
  
  /**
   * Get industry-specific keywords for business type
   */
  private getIndustryKeywords(businessType: string): string[] {
    const industryMap: Record<string, string[]> = {
      'financial-services': [
        'portfolio', 'investment', 'trading', 'trader', 'active', 'passive',
        'equity', 'bond', 'fund', 'asset', 'wealth', 'capital', 'broker',
        'financial advisor', 'risk management', 'diversification', 'returns',
        'market analysis', 'investment strategy', 'hedge fund', 'private equity'
      ],
      'legal-services': [
        'solicitor', 'barrister', 'legal advice', 'litigation', 'conveyancing',
        'family law', 'employment law', 'personal injury', 'commercial law',
        'will writing', 'probate', 'divorce', 'custody', 'tribunal'
      ],
      'healthcare': [
        'private healthcare', 'medical treatment', 'specialist', 'consultant',
        'surgery', 'therapy', 'diagnosis', 'treatment plan', 'health screening',
        'medical imaging', 'patient care', 'clinical excellence'
      ],
      'architecture-construction': [
        'architectural design', 'building design', 'planning permission',
        'structural engineer', 'project management', 'residential', 'commercial',
        'sustainable design', 'building regulations', 'construction management'
      ],
      'digital-marketing': [
        'digital marketing', 'SEO', 'PPC', 'social media marketing',
        'web design', 'branding', 'content marketing', 'conversion optimization',
        'analytics', 'ROI', 'lead generation', 'online advertising'
      ],
      'manufacturing': [
        'manufacturing equipment', 'industrial machinery', 'production',
        'quality control', 'automation', 'processing', 'packaging',
        'supply chain', 'lean manufacturing', 'efficiency'
      ]
    };
    
    return industryMap[businessType] || [];
  }
  
  /**
   * Get contextual modifiers for business type
   */
  private getContextualModifiers(businessType: string): string[] {
    const modifierMap: Record<string, string[]> = {
      'financial-services': ['professional', 'certified', 'independent', 'expert', 'qualified', 'experienced'],
      'legal-services': ['specialist', 'qualified', 'experienced', 'expert', 'professional', 'certified'],
      'healthcare': ['private', 'specialist', 'expert', 'qualified', 'professional', 'certified'],
      'architecture-construction': ['chartered', 'RIBA', 'qualified', 'experienced', 'professional', 'award-winning'],
      'digital-marketing': ['creative', 'data-driven', 'results-focused', 'expert', 'professional', 'certified'],
      'manufacturing': ['industrial', 'commercial', 'precision', 'quality', 'certified', 'professional']
    };
    
    return modifierMap[businessType] || ['professional', 'expert', 'quality', 'experienced'];
  }
  
  // Helper extraction methods
  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    return titleMatch ? titleMatch[1].trim() : '';
  }
  
  private extractMetaDescription(html: string): string {
    const metaMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    return metaMatch ? metaMatch[1].trim() : '';
  }
  
  private extractH1Tags(html: string): string[] {
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    return h1Matches.map(match => {
      const content = match.replace(/<[^>]*>/g, '').trim();
      return content;
    });
  }
}