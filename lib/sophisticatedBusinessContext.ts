/**
 * Sophisticated Business Context Service
 * Multi-API approach for comprehensive business understanding
 */

export interface BusinessIntelligence {
  primaryCategory: string;
  subcategories: string[];
  confidence: number;
  sicCodes: string[];
  naicsCode: string;
  industryKeywords: string[];
  competitorKeywords: string[];
  localContext: {
    country: string;
    region: string;
    localTerms: string[];
  };
  semanticConcepts: string[];
  sources: string[];
}

export interface ContextualKeywordSuggestion {
  keyword: string;
  relevanceScore: number;
  searchVolume: number;
  difficulty: number;
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  source: string;
  isLongtail: boolean;
  localVariations: string[];
}

export class SophisticatedBusinessContextService {
  private googleApiKey: string;
  private companiesHouseKey: string;
  
  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY || '';
    this.companiesHouseKey = process.env.COMPANIES_HOUSE_API_KEY || '';
  }

  /**
   * Comprehensive business intelligence analysis
   */
  async analyzeBusinessIntelligence(
    domain: string, 
    html: string, 
    companyName?: string,
    isUKCompany?: boolean
  ): Promise<BusinessIntelligence> {
    console.log(`🧠 Starting sophisticated business analysis for: ${domain}`);
    
    const intelligence: BusinessIntelligence = {
      primaryCategory: 'general-business',
      subcategories: [],
      confidence: 0,
      sicCodes: [],
      naicsCode: '',
      industryKeywords: [],
      competitorKeywords: [],
      localContext: {
        country: 'unknown',
        region: 'unknown',
        localTerms: []
      },
      semanticConcepts: [],
      sources: []
    };

    // 1. Google Cloud Natural Language API - Semantic Analysis
    try {
      const googleAnalysis = await this.analyzeWithGoogle(html);
      if (googleAnalysis) {
        intelligence.semanticConcepts.push(...googleAnalysis.entities);
        intelligence.primaryCategory = googleAnalysis.category || intelligence.primaryCategory;
        intelligence.confidence = Math.max(intelligence.confidence, googleAnalysis.confidence);
        intelligence.sources.push('Google Natural Language API');
        
        console.log(`✅ Google analysis: ${googleAnalysis.entities.length} entities found`);
      }
    } catch (error) {
      console.log('⚠️ Google API unavailable, continuing with other sources');
    }

    // 2. Government Registry Lookup
    if (companyName) {
      try {
        const registryData = await this.lookupCompanyRegistry(companyName, domain, html, isUKCompany);
        if (registryData) {
          intelligence.sicCodes = registryData.sicCodes;
          intelligence.naicsCode = registryData.naicsCode;
          intelligence.primaryCategory = registryData.category;
          intelligence.confidence = Math.max(intelligence.confidence, 0.9); // High confidence from official data
          intelligence.sources.push('Government Registry');
          
          console.log(`✅ Registry lookup: SIC codes ${registryData.sicCodes.join(', ')}`);
        }
      } catch (error) {
        console.log('⚠️ Registry lookup failed, continuing');
      }
    }

    // 3. Enhanced Content Analysis
    const contentAnalysis = await this.analyzeContentSemantically(html, domain);
    intelligence.industryKeywords.push(...contentAnalysis.keywords);
    intelligence.localContext = contentAnalysis.localContext;
    intelligence.sources.push('Semantic Content Analysis');

    // 4. Wikipedia/Industry Knowledge Base
    try {
      const industryKnowledge = await this.getIndustryKnowledge(intelligence.primaryCategory);
      intelligence.industryKeywords.push(...industryKnowledge.keywords);
      intelligence.subcategories.push(...industryKnowledge.subcategories);
      intelligence.sources.push('Industry Knowledge Base');
      
      console.log(`✅ Industry knowledge: ${industryKnowledge.keywords.length} industry terms`);
    } catch (error) {
      console.log('⚠️ Industry knowledge lookup failed');
    }

    // Final confidence calculation
    intelligence.confidence = this.calculateFinalConfidence(intelligence);
    
    console.log(`🎯 Business intelligence complete:
    - Category: ${intelligence.primaryCategory}
    - Confidence: ${intelligence.confidence.toFixed(2)}
    - SIC Codes: ${intelligence.sicCodes.join(', ')}
    - Industry Keywords: ${intelligence.industryKeywords.length}
    - Sources: ${intelligence.sources.join(', ')}`);

    return intelligence;
  }

  /**
   * Generate contextual keyword suggestions
   */
  async generateContextualKeywords(
    businessIntelligence: BusinessIntelligence,
    baseKeywords: string[]
  ): Promise<ContextualKeywordSuggestion[]> {
    const suggestions: ContextualKeywordSuggestion[] = [];

    // 1. Industry-specific expansions
    const industryExpansions = this.generateIndustryExpansions(
      baseKeywords, 
      businessIntelligence.industryKeywords,
      businessIntelligence.primaryCategory
    );
    suggestions.push(...industryExpansions);

    // 2. Local context variations
    const localVariations = this.generateLocalVariations(
      baseKeywords,
      businessIntelligence.localContext
    );
    suggestions.push(...localVariations);

    // 3. Semantic concept combinations
    const semanticCombinations = this.generateSemanticCombinations(
      baseKeywords,
      businessIntelligence.semanticConcepts
    );
    suggestions.push(...semanticCombinations);

    // 4. SIC/NAICS-based suggestions
    if (businessIntelligence.sicCodes.length > 0) {
      const regulatoryKeywords = this.generateRegulatoryKeywords(
        businessIntelligence.sicCodes,
        businessIntelligence.naicsCode
      );
      suggestions.push(...regulatoryKeywords);
    }

    // Sort by relevance and remove duplicates
    return this.deduplicateAndRank(suggestions);
  }

  /**
   * Google Cloud Natural Language API analysis
   */
  private async analyzeWithGoogle(html: string): Promise<{
    entities: string[];
    category: string;
    confidence: number;
  } | null> {
    // Skip Google Natural Language API if not properly configured or if we want to save costs
    if (!this.googleApiKey || process.env.SKIP_GOOGLE_NLP === 'true') {
      console.log('⚠️ Google Natural Language API skipped (not configured or disabled)');
      return null;
    }

    try {
      // Extract text content from HTML
      const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 5000);
      
      const response = await fetch(
        `https://language.googleapis.com/v1/documents:analyzeEntities?key=${this.googleApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document: {
              type: 'PLAIN_TEXT',
              content: textContent
            },
            encodingType: 'UTF8'
          })
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Google Natural Language API error ${response.status}:`, errorBody);
        
        // Handle specific error cases
        if (response.status === 403) {
          console.log('💡 Google Natural Language API requires billing to be enabled in Google Cloud Console');
          console.log('   Visit: https://console.cloud.google.com/billing');
          console.log('   Or set SKIP_GOOGLE_NLP=true in .env.local to skip this API');
        } else if (response.status === 401) {
          console.log('💡 Invalid Google API key. Please check GOOGLE_API_KEY in .env.local');
        }
        
        return null; // Return null instead of throwing to allow graceful fallback
      }

      const data = await response.json();
      
      // Extract business-relevant entities
      const businessEntities = data.entities
        ?.filter((entity: any) => 
          entity.type === 'ORGANIZATION' || 
          entity.type === 'WORK_OF_ART' || 
          entity.type === 'EVENT' ||
          entity.salience > 0.1
        )
        .map((entity: any) => entity.name.toLowerCase())
        .slice(0, 20) || [];

      // Determine business category from entities
      const category = this.categorizeFromEntities(businessEntities);
      
      return {
        entities: businessEntities,
        category,
        confidence: businessEntities.length > 0 ? 0.7 : 0.3
      };

    } catch (error) {
      console.error('Google Natural Language API error:', error);
      return null;
    }
  }

  /**
   * Detect if a company is UK-based from multiple signals
   */
  private isUKCompany(domain: string, html: string): boolean {
    const domainLower = domain.toLowerCase();
    const htmlLower = html.toLowerCase();
    
    // Strong UK indicators
    const ukDomainExtensions = ['.co.uk', '.uk', '.org.uk', '.gov.uk', '.ac.uk', '.ltd.uk', '.plc.uk'];
    const hasDomainIndicator = ukDomainExtensions.some(ext => domainLower.includes(ext));
    
    // UK-specific terms in content
    const ukBusinessTerms = [
      'registered in england', 'registered in scotland', 'registered in wales',
      'companies house', 'company number', 'vat number gb', 'gb vat',
      'united kingdom', 'uk limited', 'ltd company', 'plc company',
      'registered office:', 'company registration number'
    ];
    const hasContentIndicator = ukBusinessTerms.some(term => htmlLower.includes(term));
    
    // UK addresses/postcodes pattern
    const ukPostcodePattern = /\b[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}\b/gi;
    const hasUKPostcode = ukPostcodePattern.test(html);
    
    // UK phone number patterns (+44, 01, 02, etc.)
    const ukPhonePattern = /(\+44|0044|01[0-9]{8,9}|02[0-9]{8,9}|07[0-9]{9})/;
    const hasUKPhone = ukPhonePattern.test(html);
    
    // Decision logic
    if (hasDomainIndicator) {
      console.log(`🇬🇧 UK company detected via domain: ${domain}`);
      return true;
    }
    
    // Need at least 2 content indicators for non-UK domains
    const indicatorCount = 
      (hasContentIndicator ? 1 : 0) + 
      (hasUKPostcode ? 1 : 0) + 
      (hasUKPhone ? 1 : 0);
    
    if (indicatorCount >= 2) {
      console.log(`🇬🇧 UK company detected via content signals (${indicatorCount} indicators)`);
      return true;
    }
    
    console.log(`🌍 Non-UK company: ${domain} (no UK indicators found)`);
    return false;
  }

  /**
   * Lookup company in government registries
   */
  private async lookupCompanyRegistry(companyName: string, domain: string, html?: string, isUKCompany?: boolean): Promise<{
    sicCodes: string[];
    naicsCode: string;
    category: string;
  } | null> {
    
    // Use explicit UK flag if provided, otherwise auto-detect
    const shouldUseCompaniesHouse = isUKCompany !== undefined 
      ? isUKCompany 
      : (html ? this.isUKCompany(domain, html) : false);
    
    if (shouldUseCompaniesHouse) {
      console.log(`🇬🇧 UK company confirmed ${isUKCompany !== undefined ? '(user specified)' : '(auto-detected)'}: ${domain}`);
      try {
        const ukData = await this.lookupCompaniesHouse(companyName);
        if (ukData) return ukData;
      } catch (error) {
        console.log('Companies House lookup failed');
      }
    }

    // Try OpenCorporates (free tier)
    try {
      const openCorpData = await this.lookupOpenCorporates(companyName);
      if (openCorpData) return openCorpData;
    } catch (error) {
      console.log('OpenCorporates lookup failed');
    }

    return null;
  }

  /**
   * Companies House API lookup (UK)
   */
  private async lookupCompaniesHouse(companyName: string): Promise<{
    sicCodes: string[];
    naicsCode: string;
    category: string;
  } | null> {
    if (!this.companiesHouseKey) {
      console.log('⚠️ Companies House API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(companyName)}&items_per_page=1`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.companiesHouseKey + ':').toString('base64')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Companies House API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const company = data.items[0];
        const sicCodes = company.sic_codes || [];
        
        return {
          sicCodes,
          naicsCode: this.sicToNaics(sicCodes[0]), // Convert SIC to NAICS
          category: this.sicToCategory(sicCodes[0])
        };
      }

      return null;
    } catch (error) {
      console.error('Companies House lookup error:', error);
      return null;
    }
  }

  /**
   * OpenCorporates API lookup (Global, free tier)
   */
  private async lookupOpenCorporates(companyName: string): Promise<{
    sicCodes: string[];
    naicsCode: string;
    category: string;
  } | null> {
    try {
      const response = await fetch(
        `https://api.opencorporates.com/companies/search?q=${encodeURIComponent(companyName)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'WebAuditPro/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`OpenCorporates API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.companies && data.results.companies.length > 0) {
        const company = data.results.companies[0].company;
        
        // OpenCorporates doesn't always have SIC codes, but has industry classification
        const industryCode = company.industry_codes?.[0]?.industry_code || '';
        
        return {
          sicCodes: industryCode ? [industryCode] : [],
          naicsCode: industryCode,
          category: company.company_type || 'general-business'
        };
      }

      return null;
    } catch (error) {
      console.error('OpenCorporates lookup error:', error);
      return null;
    }
  }

  /**
   * Semantic content analysis
   */
  private async analyzeContentSemantically(html: string, domain: string): Promise<{
    keywords: string[];
    localContext: {
      country: string;
      region: string;
      localTerms: string[];
    };
  }> {
    const content = html.toLowerCase();
    const keywords: string[] = [];
    
    // Extract business-relevant terms using advanced patterns
    const businessPatterns = [
      // Service-based patterns
      /\b(\w+)\s+service[s]?\b/g,
      /\b(\w+)\s+solution[s]?\b/g,
      /\bprofessional\s+(\w+)\b/g,
      /\bexpert\s+(\w+)\b/g,
      
      // Product-based patterns
      /\b(\w+)\s+equipment\b/g,
      /\b(\w+)\s+machinery\b/g,
      /\b(\w+)\s+system[s]?\b/g,
      
      // Industry-specific patterns
      /\b(\w+)\s+consulting\b/g,
      /\b(\w+)\s+management\b/g,
      /\b(\w+)\s+planning\b/g,
      /\b(\w+)\s+advice\b/g
    ];

    businessPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const term = match[1];
        if (term.length > 3 && !this.isCommonWord(term)) {
          keywords.push(term);
        }
      }
    });

    // Geographic context detection
    const localContext = this.detectLocalContext(content, domain);

    return {
      keywords: [...new Set(keywords)].slice(0, 50),
      localContext
    };
  }

  /**
   * Get industry knowledge from knowledge bases
   */
  private async getIndustryKnowledge(category: string): Promise<{
    keywords: string[];
    subcategories: string[];
  }> {
    // This would integrate with Wikipedia API or industry knowledge bases
    // For now, return predefined industry knowledge
    const industryMap: Record<string, {keywords: string[], subcategories: string[]}> = {
      'financial-services': {
        keywords: [
          'investment', 'portfolio', 'asset management', 'wealth management',
          'financial planning', 'retirement planning', 'tax planning',
          'risk management', 'fund management', 'trading platform',
          'robo advisor', 'financial technology', 'fintech'
        ],
        subcategories: [
          'investment management', 'wealth management', 'financial planning',
          'pension advice', 'insurance services', 'banking services'
        ]
      },
      'legal-services': {
        keywords: [
          'legal advice', 'solicitor services', 'litigation support',
          'contract law', 'employment law', 'family law', 'commercial law',
          'intellectual property', 'regulatory compliance', 'legal consultation'
        ],
        subcategories: [
          'family law', 'commercial law', 'employment law', 'personal injury',
          'property law', 'immigration law', 'criminal law'
        ]
      },
      'healthcare': {
        keywords: [
          'medical treatment', 'healthcare services', 'medical consultation',
          'specialist care', 'diagnostic services', 'preventive care',
          'patient care', 'clinical services', 'medical imaging'
        ],
        subcategories: [
          'primary care', 'specialist care', 'diagnostic services',
          'surgical services', 'mental health', 'dental care'
        ]
      }
    };

    return industryMap[category] || { keywords: [], subcategories: [] };
  }

  // Helper methods
  private categorizeFromEntities(entities: string[]): string {
    // Business categorization logic based on detected entities
    const financialTerms = ['investment', 'capital', 'fund', 'trading', 'finance'];
    const legalTerms = ['legal', 'law', 'solicitor', 'court', 'litigation'];
    const healthTerms = ['medical', 'health', 'care', 'clinic', 'treatment'];
    
    if (entities.some(e => financialTerms.some(t => e.includes(t)))) {
      return 'financial-services';
    }
    if (entities.some(e => legalTerms.some(t => e.includes(t)))) {
      return 'legal-services';
    }
    if (entities.some(e => healthTerms.some(t => e.includes(t)))) {
      return 'healthcare';
    }
    
    return 'general-business';
  }

  private sicToNaics(sicCode: string): string {
    // SIC to NAICS conversion mapping (simplified)
    const sicToNaicsMap: Record<string, string> = {
      '62012': '541211', // Software consultancy -> Custom Computer Programming Services
      '70229': '541110', // Management consultancy activities other than financial management -> Offices of Lawyers
    };
    
    return sicToNaicsMap[sicCode] || '';
  }

  private sicToCategory(sicCode: string): string {
    // SIC code to business category mapping
    const sicCategoryMap: Record<string, string> = {
      '62012': 'technology',
      '70229': 'business-services',
      '64209': 'financial-services',
      '69201': 'legal-services'
    };
    
    return sicCategoryMap[sicCode] || 'general-business';
  }

  private detectLocalContext(content: string, domain: string): {
    country: string;
    region: string;
    localTerms: string[];
  } {
    // Enhanced geographic detection
    const ukTerms = ['uk', 'london', 'manchester', 'birmingham', 'glasgow', 'edinburgh'];
    const usTerms = ['usa', 'america', 'new york', 'california', 'texas', 'florida'];
    
    const localTerms: string[] = [];
    let country = 'unknown';
    let region = 'unknown';
    
    if (domain.includes('.co.uk') || ukTerms.some(term => content.includes(term))) {
      country = 'United Kingdom';
      localTerms.push(...ukTerms.filter(term => content.includes(term)));
    } else if (domain.includes('.com') || usTerms.some(term => content.includes(term))) {
      country = 'United States';
      localTerms.push(...usTerms.filter(term => content.includes(term)));
    }
    
    return { country, region, localTerms };
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'for', 'with', 'your', 'our', 'all', 'any', 'can', 'has', 'had', 'will'];
    return commonWords.includes(word.toLowerCase());
  }

  private generateIndustryExpansions(
    baseKeywords: string[],
    industryKeywords: string[],
    category: string
  ): ContextualKeywordSuggestion[] {
    const suggestions: ContextualKeywordSuggestion[] = [];
    
    baseKeywords.forEach(baseKeyword => {
      industryKeywords.forEach(industryTerm => {
        const combination = `${baseKeyword} ${industryTerm}`;
        
        suggestions.push({
          keyword: combination,
          relevanceScore: 0.85,
          searchVolume: 0, // To be populated by Keywords Everywhere
          difficulty: 0,
          intent: 'commercial',
          source: 'Industry Expansion',
          isLongtail: combination.split(' ').length >= 3,
          localVariations: []
        });
      });
    });
    
    return suggestions.slice(0, 20); // Limit to prevent explosion
  }

  private generateLocalVariations(
    baseKeywords: string[],
    localContext: { country: string; region: string; localTerms: string[] }
  ): ContextualKeywordSuggestion[] {
    const suggestions: ContextualKeywordSuggestion[] = [];
    
    const locationModifiers = [
      'near me', 'local', `in ${localContext.country}`,
      ...localContext.localTerms
    ];
    
    baseKeywords.forEach(keyword => {
      locationModifiers.forEach(location => {
        suggestions.push({
          keyword: `${keyword} ${location}`,
          relevanceScore: 0.8,
          searchVolume: 0,
          difficulty: 0,
          intent: 'commercial',
          source: 'Local Variation',
          isLongtail: true,
          localVariations: [location]
        });
      });
    });
    
    return suggestions.slice(0, 15);
  }

  private generateSemanticCombinations(
    baseKeywords: string[],
    semanticConcepts: string[]
  ): ContextualKeywordSuggestion[] {
    const suggestions: ContextualKeywordSuggestion[] = [];
    
    baseKeywords.forEach(keyword => {
      semanticConcepts.slice(0, 5).forEach(concept => {
        suggestions.push({
          keyword: `${keyword} ${concept}`,
          relevanceScore: 0.7,
          searchVolume: 0,
          difficulty: 0,
          intent: 'informational',
          source: 'Semantic Combination',
          isLongtail: true,
          localVariations: []
        });
      });
    });
    
    return suggestions.slice(0, 10);
  }

  private generateRegulatoryKeywords(
    sicCodes: string[],
    naicsCode: string
  ): ContextualKeywordSuggestion[] {
    // Generate keywords based on official industry classifications
    const suggestions: ContextualKeywordSuggestion[] = [];
    
    // This would use SIC/NAICS databases to generate relevant terms
    // For now, return basic regulatory-related keywords
    const regulatoryTerms = [
      'compliance', 'regulation', 'standards', 'certification',
      'licensing', 'accreditation', 'audit', 'inspection'
    ];
    
    regulatoryTerms.forEach(term => {
      suggestions.push({
        keyword: term,
        relevanceScore: 0.6,
        searchVolume: 0,
        difficulty: 0,
        intent: 'informational',
        source: 'Regulatory Classification',
        isLongtail: false,
        localVariations: []
      });
    });
    
    return suggestions;
  }

  private deduplicateAndRank(suggestions: ContextualKeywordSuggestion[]): ContextualKeywordSuggestion[] {
    const seen = new Map<string, ContextualKeywordSuggestion>();
    
    suggestions.forEach(suggestion => {
      const key = suggestion.keyword.toLowerCase().trim();
      
      if (!seen.has(key) || seen.get(key)!.relevanceScore < suggestion.relevanceScore) {
        seen.set(key, suggestion);
      }
    });
    
    return Array.from(seen.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 50);
  }

  private calculateFinalConfidence(intelligence: BusinessIntelligence): number {
    let confidence = 0;
    
    // Government registry data = highest confidence
    if (intelligence.sicCodes.length > 0) confidence += 0.4;
    
    // Google API semantic analysis
    if (intelligence.semanticConcepts.length > 0) confidence += 0.3;
    
    // Content analysis
    if (intelligence.industryKeywords.length > 0) confidence += 0.2;
    
    // Multiple sources
    if (intelligence.sources.length > 2) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}