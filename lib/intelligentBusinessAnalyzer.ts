/**
 * Intelligent Business Analyzer
 * Step 1: Analyze webpage content to understand what the business actually does
 * Step 2: Cross-reference with Companies House for official classification
 * Step 3: Dynamically add business types if not in our database
 */

export interface BusinessActivity {
  activity: string;
  confidence: number;
  evidence: string[];
  keywords: string[];
}

export interface ExtractedBusinessData {
  primaryActivities: BusinessActivity[];
  services: string[];
  industryTerms: string[];
  businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'marketplace';
  targetMarket: string[];
  locationIndicators: string[];
  companyName: string;
  websiteContent: {
    navigation: string[];
    headlines: string[];
    serviceDescriptions: string[];
    aboutText: string;
  };
}

export interface CompaniesHouseData {
  sicCodes: string[];
  companyName: string;
  companyType: string;
  companyStatus: string;
  businessDescription: string;
}

export interface IntelligentBusinessResult {
  extractedData: ExtractedBusinessData;
  companiesHouseData?: CompaniesHouseData;
  confirmedBusinessType: {
    category: string;
    subcategory: string;
    confidence: 'high' | 'medium' | 'low';
    source: 'existing_database' | 'companies_house' | 'content_analysis' | 'hybrid';
  };
  dynamicallyCreated: boolean;
  recommendedKeywords: string[];
}

export class IntelligentBusinessAnalyzer {
  
  /**
   * Main analysis method - intelligent business type detection
   */
  async analyzeWebsite(domain: string, html: string): Promise<IntelligentBusinessResult> {
    console.log(`🧠 Intelligent business analysis for: ${domain}`);
    
    // Step 1: Extract business data from webpage content
    console.log(`📊 Step 1: Analyzing webpage content...`);
    const extractedData = this.extractBusinessDataFromContent(html);
    
    // Step 2: Get official data from Companies House
    console.log(`🏛️ Step 2: Checking Companies House...`);
    const companiesHouseData = await this.getCompaniesHouseData(domain);
    
    // Step 3: Combine analysis to determine business type
    console.log(`🎯 Step 3: Determining business type...`);
    const confirmedBusinessType = this.determineBusinessType(extractedData, companiesHouseData);
    
    // Step 4: Generate recommended keywords based on confirmed type
    console.log(`🔤 Step 4: Generating targeted keywords...`);
    const recommendedKeywords = this.generateTargetedKeywords(extractedData, confirmedBusinessType);
    
    console.log(`✅ Analysis complete: ${confirmedBusinessType.category} - ${confirmedBusinessType.subcategory}`);
    
    return {
      extractedData,
      companiesHouseData,
      confirmedBusinessType,
      dynamicallyCreated: confirmedBusinessType.source === 'content_analysis',
      recommendedKeywords
    };
  }
  
  /**
   * Extract comprehensive business data from webpage content
   */
  private extractBusinessDataFromContent(html: string): ExtractedBusinessData {
    const text = this.stripHtml(html).toLowerCase();
    const originalHtml = html;
    
    // Extract company name from title tag or h1
    const companyName = this.extractCompanyName(originalHtml);
    
    // Extract navigation structure
    const navigation = this.extractNavigation(originalHtml);
    
    // Extract headlines (h1, h2, h3)
    const headlines = this.extractHeadlines(originalHtml);
    
    // Extract service descriptions
    const serviceDescriptions = this.extractServiceDescriptions(text);
    
    // Extract about text
    const aboutText = this.extractAboutText(text);
    
    // Analyze business activities with confidence scoring
    const primaryActivities = this.identifyBusinessActivities(text, navigation, headlines);
    
    // Extract specific services offered
    const services = this.extractServices(text, navigation);
    
    // Identify industry-specific terminology
    const industryTerms = this.extractIndustryTerms(text);
    
    // Determine business model
    const businessModel = this.identifyBusinessModel(text);
    
    // Extract target market indicators
    const targetMarket = this.extractTargetMarket(text);
    
    // Extract location indicators
    const locationIndicators = this.extractLocationIndicators(text);
    
    return {
      primaryActivities,
      services,
      industryTerms,
      businessModel,
      targetMarket,
      locationIndicators,
      companyName,
      websiteContent: {
        navigation,
        headlines,
        serviceDescriptions,
        aboutText
      }
    };
  }
  
  /**
   * Identify business activities with confidence scoring
   */
  private identifyBusinessActivities(text: string, navigation: string[], headlines: string[]): BusinessActivity[] {
    const activities: BusinessActivity[] = [];
    
    // Define activity patterns with keywords and confidence weights
    const activityPatterns = {
      'Legal Services': {
        keywords: ['solicitor', 'lawyer', 'legal advice', 'law firm', 'litigation', 'conveyancing', 'will writing', 'divorce', 'employment law'],
        navigationTerms: ['legal services', 'practice areas', 'our lawyers', 'solicitors'],
        headlineTerms: ['legal', 'law', 'solicitor', 'lawyer']
      },
      'Fitness & Sports': {
        keywords: ['gym', 'fitness', 'workout', 'exercise', 'personal training', 'fitness classes', 'membership', 'health club', 'sports'],
        navigationTerms: ['membership', 'classes', 'personal training', 'facilities', 'join'],
        headlineTerms: ['fitness', 'gym', 'workout', 'training', 'exercise']
      },
      'Food & Hospitality': {
        keywords: ['restaurant', 'dining', 'menu', 'booking', 'table reservation', 'chef', 'cuisine', 'catering', 'hotel'],
        navigationTerms: ['menu', 'booking', 'reservations', 'rooms', 'dining'],
        headlineTerms: ['restaurant', 'dining', 'menu', 'chef', 'cuisine']
      },
      'Architecture & Design': {
        keywords: ['architect', 'design', 'planning permission', 'building', 'extension', 'renovation', 'architectural'],
        navigationTerms: ['portfolio', 'projects', 'services', 'planning'],
        headlineTerms: ['architect', 'design', 'planning', 'building']
      },
      'Digital Marketing': {
        keywords: ['seo', 'digital marketing', 'web design', 'social media', 'ppc', 'advertising', 'marketing agency'],
        navigationTerms: ['services', 'portfolio', 'case studies', 'digital'],
        headlineTerms: ['marketing', 'digital', 'seo', 'web design']
      },
      'Financial Services': {
        keywords: ['accountant', 'financial advisor', 'investment', 'pension', 'tax', 'accounting', 'financial planning'],
        navigationTerms: ['services', 'advice', 'planning', 'tax'],
        headlineTerms: ['financial', 'accounting', 'investment', 'tax']
      }
    };
    
    for (const [activityName, pattern] of Object.entries(activityPatterns)) {
      let score = 0;
      const evidence: string[] = [];
      const foundKeywords: string[] = [];
      
      // Score content keywords
      pattern.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length * 2;
          evidence.push(`Found "${keyword}" ${matches.length} times in content`);
          foundKeywords.push(keyword);
        }
      });
      
      // Score navigation terms (higher weight)
      pattern.navigationTerms.forEach(term => {
        if (navigation.some(nav => nav.toLowerCase().includes(term))) {
          score += 10;
          evidence.push(`Found "${term}" in navigation`);
          foundKeywords.push(term);
        }
      });
      
      // Score headline terms (higher weight)
      pattern.headlineTerms.forEach(term => {
        if (headlines.some(headline => headline.toLowerCase().includes(term))) {
          score += 8;
          evidence.push(`Found "${term}" in headlines`);
          foundKeywords.push(term);
        }
      });
      
      if (score > 0) {
        activities.push({
          activity: activityName,
          confidence: Math.min(score / 20, 1.0), // Normalize to 0-1
          evidence,
          keywords: [...new Set(foundKeywords)]
        });
      }
    }
    
    // Sort by confidence and return top activities
    return activities.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }
  
  /**
   * Get Companies House data for official business classification
   */
  private async getCompaniesHouseData(domain: string): Promise<CompaniesHouseData | undefined> {
    try {
      // Extract company name from domain (basic extraction)
      const companyNameGuess = domain.replace(/\.(co\.uk|com|uk)$/, '').replace(/[-\.]/g, ' ');
      
      // For now, return mock data - in production, integrate with Companies House API
      console.log(`🔍 Would search Companies House for: "${companyNameGuess}"`);
      
      // TODO: Implement actual Companies House API integration
      // const companiesHouseResult = await this.searchCompaniesHouse(companyNameGuess);
      
      return undefined; // For now, until API is integrated
    } catch (error) {
      console.log(`⚠️ Companies House lookup failed: ${error.message}`);
      return undefined;
    }
  }
  
  /**
   * Determine final business type based on all available data
   */
  private determineBusinessType(
    extractedData: ExtractedBusinessData, 
    companiesHouseData?: CompaniesHouseData
  ): { category: string; subcategory: string; confidence: 'high' | 'medium' | 'low'; source: string } {
    
    // If Companies House data available, use it for high confidence
    if (companiesHouseData && companiesHouseData.sicCodes.length > 0) {
      const businessType = this.mapSicCodeToBusinessType(companiesHouseData.sicCodes[0]);
      if (businessType) {
        return {
          category: businessType.category,
          subcategory: businessType.subcategory,
          confidence: 'high',
          source: 'companies_house'
        };
      }
    }
    
    // Use content analysis if we have strong signals
    if (extractedData.primaryActivities.length > 0) {
      const topActivity = extractedData.primaryActivities[0];
      
      if (topActivity.confidence >= 0.7) {
        const subcategory = this.determineSubcategory(topActivity.activity, extractedData);
        return {
          category: topActivity.activity,
          subcategory,
          confidence: 'high',
          source: 'content_analysis'
        };
      } else if (topActivity.confidence >= 0.4) {
        const subcategory = this.determineSubcategory(topActivity.activity, extractedData);
        return {
          category: topActivity.activity,
          subcategory,
          confidence: 'medium',
          source: 'content_analysis'
        };
      }
    }
    
    // Fallback to general business services
    return {
      category: 'Business Services',
      subcategory: 'General',
      confidence: 'low',
      source: 'content_analysis'
    };
  }
  
  /**
   * Generate targeted keywords based on confirmed business type
   */
  private generateTargetedKeywords(
    extractedData: ExtractedBusinessData, 
    businessType: { category: string; subcategory: string }
  ): string[] {
    const keywords: string[] = [];
    
    // Add service-based keywords
    extractedData.services.forEach(service => {
      keywords.push(service);
      keywords.push(`${service} services`);
      keywords.push(`professional ${service}`);
    });
    
    // Add location-based keywords if local business
    extractedData.locationIndicators.forEach(location => {
      keywords.push(`${businessType.category.toLowerCase()} ${location}`);
      keywords.push(`${businessType.subcategory.toLowerCase()} in ${location}`);
    });
    
    // Add industry-specific terms
    keywords.push(...extractedData.industryTerms);
    
    // Add business type variations
    keywords.push(businessType.category.toLowerCase());
    keywords.push(businessType.subcategory.toLowerCase());
    
    return [...new Set(keywords)].filter(k => k && k.length > 2);
  }
  
  // Helper methods
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  private extractCompanyName(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    if (titleMatch) {
      return titleMatch[1].split('|')[0].split('-')[0].trim();
    }
    
    const h1Match = html.match(/<h1[^>]*>([^<]+)</i);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    return '';
  }
  
  private extractNavigation(html: string): string[] {
    const navMatches = html.match(/<nav[^>]*>(.*?)<\/nav>/gis) || [];
    const menuMatches = html.match(/<ul[^>]*class[^>]*menu[^>]*>(.*?)<\/ul>/gis) || [];
    
    const navContent = [...navMatches, ...menuMatches].join(' ');
    const linkMatches = navContent.match(/<a[^>]*>([^<]+)</gi) || [];
    
    return linkMatches
      .map(link => link.replace(/<[^>]*>/g, '').trim())
      .filter(text => text && text.length > 1 && text.length < 50);
  }
  
  private extractHeadlines(html: string): string[] {
    const headlineMatches = html.match(/<h[1-3][^>]*>([^<]+)</gi) || [];
    return headlineMatches
      .map(headline => headline.replace(/<[^>]*>/g, '').trim())
      .filter(text => text && text.length > 2);
  }
  
  private extractServiceDescriptions(text: string): string[] {
    // Extract sentences that likely describe services
    const sentences = text.split(/[.!?]+/);
    return sentences
      .filter(sentence => 
        sentence.includes('we ') || 
        sentence.includes('our ') ||
        sentence.includes('service') ||
        sentence.includes('offer') ||
        sentence.includes('provide')
      )
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200);
  }
  
  private extractAboutText(text: string): string {
    const aboutMatch = text.match(/about us[^.]{50,500}\./i) || 
                      text.match(/who we are[^.]{50,500}\./i) ||
                      text.match(/our company[^.]{50,500}\./i);
    return aboutMatch ? aboutMatch[0] : '';
  }
  
  private extractServices(text: string, navigation: string[]): string[] {
    const services = new Set<string>();
    
    // Extract from navigation
    navigation.forEach(nav => {
      if (nav.includes('service') || nav.includes('our ')) {
        services.add(nav.toLowerCase().replace(/our\s+/, ''));
      }
    });
    
    // Extract service-like phrases from content
    const servicePatterns = [
      /we offer ([^.]{10,50})/gi,
      /our services include ([^.]{10,50})/gi,
      /we provide ([^.]{10,50})/gi,
      /specialising in ([^.]{10,50})/gi
    ];
    
    servicePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const service = match.replace(pattern, '$1').trim();
          if (service && service.length > 5 && service.length < 50) {
            services.add(service);
          }
        });
      }
    });
    
    return Array.from(services);
  }
  
  private extractIndustryTerms(text: string): string[] {
    // Extract industry-specific jargon and terminology
    const terms = new Set<string>();
    
    // Look for industry-specific patterns
    const words = text.split(/\s+/);
    words.forEach(word => {
      if (word.length >= 6 && word.length <= 20) {
        // Check if it's likely an industry term (contains specific endings)
        if (word.match(/ing$|tion$|ment$|ance$|ence$|ology$|ics$/)) {
          terms.add(word.toLowerCase());
        }
      }
    });
    
    return Array.from(terms).slice(0, 20);
  }
  
  private identifyBusinessModel(text: string): 'B2B' | 'B2C' | 'B2B2C' | 'marketplace' {
    const b2bIndicators = ['enterprise', 'business', 'corporate', 'commercial', 'professional services'];
    const b2cIndicators = ['customer', 'client', 'individual', 'personal', 'family', 'home'];
    
    let b2bScore = 0;
    let b2cScore = 0;
    
    b2bIndicators.forEach(indicator => {
      if (text.includes(indicator)) b2bScore++;
    });
    
    b2cIndicators.forEach(indicator => {
      if (text.includes(indicator)) b2cScore++;
    });
    
    if (b2bScore > b2cScore * 1.5) return 'B2B';
    if (b2cScore > b2bScore * 1.5) return 'B2C';
    return 'B2B2C';
  }
  
  private extractTargetMarket(text: string): string[] {
    const markets = new Set<string>();
    
    const marketPatterns = [
      /for ([^.]{5,30})/gi,
      /serving ([^.]{5,30})/gi,
      /helping ([^.]{5,30})/gi
    ];
    
    marketPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const market = match.replace(pattern, '$1').trim();
          if (market && market.length > 3 && market.length < 30) {
            markets.add(market);
          }
        });
      }
    });
    
    return Array.from(markets);
  }
  
  private extractLocationIndicators(text: string): string[] {
    const locations = new Set<string>();
    
    // UK cities and regions
    const ukCities = ['london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'bristol', 'sheffield', 'edinburgh', 'leeds', 'cardiff'];
    const ukRegions = ['north london', 'south london', 'west midlands', 'greater manchester'];
    
    [...ukCities, ...ukRegions].forEach(location => {
      if (text.includes(location)) {
        locations.add(location);
      }
    });
    
    // Extract postcode areas
    const postcodeMatches = text.match(/[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}/gi);
    if (postcodeMatches) {
      postcodeMatches.forEach(postcode => {
        const area = postcode.match(/^[A-Z]{1,2}/);
        if (area) locations.add(area[0]);
      });
    }
    
    return Array.from(locations);
  }
  
  private determineSubcategory(category: string, extractedData: ExtractedBusinessData): string {
    // Use service analysis to determine specific subcategory
    const services = extractedData.services.join(' ').toLowerCase();
    
    switch (category) {
      case 'Fitness & Sports':
        if (services.includes('personal training')) return 'Personal Training';
        if (services.includes('gym') || services.includes('fitness center')) return 'Gym & Fitness';
        if (services.includes('sports') || services.includes('club')) return 'Sports Clubs';
        return 'Gym & Fitness';
        
      case 'Legal Services':
        if (services.includes('family') || services.includes('divorce')) return 'Family Law';
        if (services.includes('commercial') || services.includes('business')) return 'Commercial Law';
        if (services.includes('conveyancing') || services.includes('property')) return 'Property Law';
        return 'General Practice';
        
      case 'Digital Marketing':
        if (services.includes('seo')) return 'SEO Agency';
        if (services.includes('web design')) return 'Web Design';
        if (services.includes('social media')) return 'Social Media';
        return 'Digital Marketing';
        
      default:
        return 'General';
    }
  }
  
  private mapSicCodeToBusinessType(sicCode: string): { category: string; subcategory: string } | null {
    // Map SIC codes to our business types
    const sicMappings: { [key: string]: { category: string; subcategory: string } } = {
      '69101': { category: 'Legal Services', subcategory: 'General Practice' },
      '69102': { category: 'Legal Services', subcategory: 'Commercial Law' },
      '93110': { category: 'Fitness & Sports', subcategory: 'Gym & Fitness' },
      '56101': { category: 'Food & Hospitality', subcategory: 'Restaurant' },
      '71111': { category: 'Architecture & Design', subcategory: 'Residential Architecture' },
      '73110': { category: 'Marketing & Digital', subcategory: 'Digital Marketing' }
    };
    
    return sicMappings[sicCode] || null;
  }
}

// Export convenience function
export async function analyzeBusinessIntelligently(domain: string, html: string): Promise<IntelligentBusinessResult> {
  const analyzer = new IntelligentBusinessAnalyzer();
  return await analyzer.analyzeWebsite(domain, html);
}