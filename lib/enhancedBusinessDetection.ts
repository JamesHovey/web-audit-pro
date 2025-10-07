/**
 * Enhanced Business Type Detection Service
 * Combines free and paid methods for accurate business classification
 */

interface BusinessType {
  category: string;
  subcategory: string;
  confidence: 'high' | 'medium' | 'low';
  detectionMethods: string[];
  relevantKeywords: string[];
}

interface BusinessDetectionResult {
  primaryType: BusinessType;
  secondaryTypes: BusinessType[];
  ukSpecific: boolean;
  localBusiness: boolean;
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  detectionSources: string[];
}

// Comprehensive business type database
const BUSINESS_TYPES = {
  // Professional Services
  'Legal Services': {
    keywords: ['solicitor', 'barrister', 'lawyer', 'legal', 'law', 'attorney', 'litigation', 'conveyancing', 'will', 'probate', 'divorce', 'employment law', 'criminal law', 'family law'],
    ukTerms: ['solicitor', 'barrister', 'chambers', 'qc', 'silk'],
    schemas: ['LegalService', 'Attorney'],
    urlPatterns: ['/legal', '/solicitors', '/law', '/conveyancing'],
    subcategories: ['Family Law', 'Commercial Law', 'Criminal Law', 'Conveyancing', 'Personal Injury']
  },
  
  'Architecture & Design': {
    keywords: ['architect', 'architecture', 'architectural', 'design', 'designer', 'planning', 'building', 'construction', 'extension', 'renovation', 'sustainable', 'heritage', 'conservation'],
    ukTerms: ['planning permission', 'building regulations', 'listed building', 'conservation area', 'riba'],
    schemas: ['Architect', 'DesignAgency'],
    urlPatterns: ['/architecture', '/design', '/planning', '/portfolio'],
    subcategories: ['Residential Architecture', 'Commercial Architecture', 'Interior Design', 'Landscape Architecture', 'Conservation Architecture']
  },

  'Healthcare & Medical': {
    keywords: ['doctor', 'dentist', 'medical', 'health', 'clinic', 'surgery', 'treatment', 'therapy', 'physiotherapy', 'optician', 'pharmacy', 'hospital'],
    ukTerms: ['nhs', 'private healthcare', 'gmc', 'bma', 'consultation'],
    schemas: ['MedicalOrganization', 'Dentist', 'Physician'],
    urlPatterns: ['/treatments', '/services', '/appointments', '/health'],
    subcategories: ['General Practice', 'Dental', 'Veterinary', 'Mental Health', 'Specialist Medicine']
  },

  'Automotive': {
    keywords: ['car', 'vehicle', 'automotive', 'garage', 'mot', 'repair', 'mechanic', 'service', 'parts', 'tyres', 'brake', 'engine'],
    ukTerms: ['mot test', 'dvla', 'tax disc', 'insurance', 'breakdown'],
    schemas: ['AutoRepair', 'AutoDealer'],
    urlPatterns: ['/services', '/mot', '/repairs', '/parts'],
    subcategories: ['Car Repair', 'Car Sales', 'MOT Testing', 'Parts & Accessories', 'Car Rental']
  },

  'Food Processing & Equipment': {
    keywords: ['chocolate machines', 'chocolate equipment', 'food processing', 'food machinery', 'tempering', 'chocolate moulds', 'nut butter machines', 'processing equipment', 'food manufacturing', 'chocolate processing', 'equipment supplier', 'machinery supplier', 'commercial equipment', 'industrial equipment'],
    ukTerms: ['equipment hire', 'machinery finance', 'try before you buy', 'equipment leasing', 'uk supplier'],
    schemas: ['Organization', 'LocalBusiness', 'Store'],
    urlPatterns: ['/equipment', '/machinery', '/chocolate', '/processing', '/supplier', '/finance'],
    subcategories: ['Chocolate Equipment', 'Food Processing Equipment', 'Nut Processing Equipment']
  },

  'Food & Hospitality': {
    keywords: ['restaurant', 'cafe', 'dining', 'menu', 'kitchen', 'chef', 'catering', 'hotel', 'accommodation', 'pub', 'bar', 'bistro', 'brasserie', 'eatery', 'food service', 'hospitality'],
    ukTerms: ['takeaway', 'gastropub', 'bed and breakfast', 'guest house', 'fine dining', 'table booking'],
    schemas: ['Restaurant', 'FoodEstablishment', 'Hotel'],
    urlPatterns: ['/menu', '/booking', '/rooms', '/dining', '/restaurant'],
    subcategories: ['Restaurant', 'Cafe', 'Catering', 'Hotel', 'Pub/Bar']
  },

  'Retail & E-commerce': {
    keywords: ['shop', 'store', 'retail', 'shopping', 'buy', 'sell', 'products', 'ecommerce', 'online store', 'catalogue'],
    ukTerms: ['high street', 'checkout', 'delivery', 'returns'],
    schemas: ['Store', 'OnlineStore'],
    urlPatterns: ['/shop', '/products', '/cart', '/checkout'],
    subcategories: ['Online Retail', 'Physical Store', 'Fashion', 'Electronics', 'Home & Garden']
  },

  'Marketing & Digital': {
    keywords: ['marketing', 'advertising', 'digital', 'seo', 'ppc', 'social media', 'branding', 'website', 'web design', 'agency', 'communications', 'creative', 'strategy', 'campaign', 'brand', 'content', 'graphic design', 'pr', 'public relations'],
    ukTerms: ['digital marketing', 'google ads', 'facebook ads', 'marketing agency', 'communications agency', 'full service'],
    schemas: ['AdvertisingAgency', 'MarketingAgency', 'Organization'],
    urlPatterns: ['/services', '/portfolio', '/case-studies', '/digital', '/about'],
    subcategories: ['Digital Marketing', 'SEO Agency', 'Web Design', 'Advertising', 'Social Media']
  },

  'Construction & Trades': {
    keywords: ['builder', 'construction', 'building', 'electrician', 'plumber', 'heating', 'roofing', 'decorator', 'joiner', 'carpenter'],
    ukTerms: ['local authority', 'building control', 'part p', 'gas safe', 'corgi'],
    schemas: ['HomeAndConstructionBusiness'],
    urlPatterns: ['/services', '/projects', '/contact', '/areas'],
    subcategories: ['General Building', 'Electrical', 'Plumbing & Heating', 'Roofing', 'Decorating']
  },

  'Financial Services': {
    keywords: ['accountant', 'accounting', 'tax', 'finance', 'financial', 'investment', 'insurance', 'mortgage', 'loans', 'pension'],
    ukTerms: ['hmrc', 'vat', 'corporation tax', 'self assessment', 'isa'],
    schemas: ['FinancialService', 'AccountingService'],
    urlPatterns: ['/services', '/tax', '/accounts', '/advice'],
    subcategories: ['Accountancy', 'Financial Planning', 'Insurance', 'Mortgages', 'Tax Services']
  },

  'Education & Training': {
    keywords: ['school', 'education', 'training', 'course', 'learning', 'tuition', 'university', 'college', 'academy'],
    ukTerms: ['ofsted', 'gcse', 'a-level', 'btec', 'nvq'],
    schemas: ['EducationalOrganization', 'School'],
    urlPatterns: ['/courses', '/admissions', '/subjects', '/students'],
    subcategories: ['Primary Education', 'Secondary Education', 'Higher Education', 'Vocational Training', 'Private Tuition']
  },

  'Beauty & Wellness': {
    keywords: ['beauty', 'salon', 'hair', 'nails', 'massage', 'spa', 'wellness', 'cosmetic', 'aesthetic', 'skincare'],
    ukTerms: ['beauty therapist', 'hairdresser', 'nail technician'],
    schemas: ['BeautySalon', 'HealthAndBeautyBusiness'],
    urlPatterns: ['/treatments', '/services', '/booking', '/prices'],
    subcategories: ['Hair Salon', 'Beauty Therapy', 'Nail Salon', 'Spa', 'Aesthetic Clinic']
  }
};

export class EnhancedBusinessDetector {
  
  /**
   * Main detection method combining multiple approaches
   */
  async detectBusinessType(domain: string, html: string): Promise<BusinessDetectionResult> {
    console.log(`🔍 Enhanced business detection for: ${domain}`);
    
    const detectionSources: string[] = [];
    const candidates: { type: string; confidence: number; method: string }[] = [];
    
    // Method 1: Content Analysis (Free)
    const contentResult = this.analyzeContent(html);
    if (contentResult.type) {
      candidates.push({ type: contentResult.type, confidence: contentResult.confidence, method: 'content_analysis' });
      detectionSources.push('Content Analysis');
    }
    
    // Method 2: URL Structure Analysis (Free)
    const urlResult = this.analyzeUrlStructure(html, domain);
    if (urlResult.type) {
      candidates.push({ type: urlResult.type, confidence: urlResult.confidence, method: 'url_analysis' });
      detectionSources.push('URL Structure');
    }
    
    // Method 3: Schema.org Markup (Free)
    const schemaResult = this.analyzeSchemaMarkup(html);
    if (schemaResult.type) {
      candidates.push({ type: schemaResult.type, confidence: schemaResult.confidence, method: 'schema_markup' });
      detectionSources.push('Schema Markup');
    }
    
    // Method 4: Domain Name Analysis (Free)
    const domainResult = this.analyzeDomainName(domain);
    if (domainResult.type) {
      candidates.push({ type: domainResult.type, confidence: domainResult.confidence, method: 'domain_analysis' });
      detectionSources.push('Domain Analysis');
    }
    
    // Method 5: UK-Specific Detection (Free)
    const ukResult = this.analyzeUKSpecificTerms(html);
    if (ukResult.type) {
      candidates.push({ type: ukResult.type, confidence: ukResult.confidence, method: 'uk_terms' });
      detectionSources.push('UK Business Terms');
    }
    
    // Method 6: Navigation Analysis (Free)
    const navResult = this.analyzeNavigation(html);
    if (navResult.type) {
      candidates.push({ type: navResult.type, confidence: navResult.confidence, method: 'navigation' });
      detectionSources.push('Navigation Analysis');
    }
    
    // Combine results with weighted scoring
    const finalResult = this.combineResults(candidates);
    
    // Determine company size
    const companySize = this.detectCompanySize(html);
    
    // Check if it's a local business
    const localBusiness = this.isLocalBusiness(html);
    
    // Check if UK-specific
    const ukSpecific = this.isUKBusiness(domain, html);
    
    console.log(`✅ Detection complete: ${finalResult.primaryType.category} (${finalResult.primaryType.confidence})`);
    console.log(`📊 Sources used: ${detectionSources.join(', ')}`);
    
    return {
      primaryType: finalResult.primaryType,
      secondaryTypes: finalResult.secondaryTypes,
      ukSpecific,
      localBusiness,
      companySize,
      detectionSources
    };
  }
  
  /**
   * Content analysis using weighted keyword scoring
   */
  private analyzeContent(html: string): { type: string | null; confidence: number } {
    const lowerHtml = html.toLowerCase();
    const scores: { [key: string]: number } = {};
    
    for (const [businessType, config] of Object.entries(BUSINESS_TYPES)) {
      let score = 0;
      
      // Standard keywords (weight: 2)
      config.keywords.forEach(keyword => {
        const matches = (lowerHtml.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        score += matches * 2;
      });
      
      // UK-specific terms (weight: 3 for UK businesses)
      config.ukTerms.forEach(term => {
        const matches = (lowerHtml.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length;
        score += matches * 3;
      });
      
      if (score > 0) {
        scores[businessType] = score;
      }
    }
    
    if (Object.keys(scores).length === 0) {
      return { type: null, confidence: 0 };
    }
    
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const topScore = sortedScores[0][1];
    const secondScore = sortedScores[1]?.[1] || 0;
    
    // Calculate confidence based on score gap
    let confidence = 0.5;
    if (topScore >= 20) confidence = 0.9;
    else if (topScore >= 10) confidence = 0.8;
    else if (topScore >= 5) confidence = 0.7;
    else if (topScore >= 2) confidence = 0.6;
    
    // Boost confidence if there's a clear winner
    if (topScore > secondScore * 2) confidence += 0.1;
    
    return { type: sortedScores[0][0], confidence: Math.min(confidence, 1.0) };
  }
  
  /**
   * Analyze URL patterns and navigation structure
   */
  private analyzeUrlStructure(html: string, domain: string): { type: string | null; confidence: number } {
    const links = this.extractInternalLinks(html, domain);
    const scores: { [key: string]: number } = {};
    
    for (const [businessType, config] of Object.entries(BUSINESS_TYPES)) {
      let score = 0;
      
      config.urlPatterns.forEach(pattern => {
        const matches = links.filter(link => link.includes(pattern)).length;
        score += matches * 5; // URL patterns are strong indicators
      });
      
      if (score > 0) {
        scores[businessType] = score;
      }
    }
    
    if (Object.keys(scores).length === 0) {
      return { type: null, confidence: 0 };
    }
    
    const topType = Object.entries(scores).sort(([,a], [,b]) => b - a)[0];
    const confidence = Math.min(topType[1] / 10, 0.9); // URL patterns are reliable
    
    return { type: topType[0], confidence };
  }
  
  /**
   * Analyze Schema.org structured data
   */
  private analyzeSchemaMarkup(html: string): { type: string | null; confidence: number } {
    // Look for JSON-LD and microdata
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
    const microdataTypes = html.match(/@type["']?\s*:\s*["']([^"']+)["']/gi);
    
    const foundTypes: string[] = [];
    
    // Parse JSON-LD
    if (jsonLdMatches) {
      jsonLdMatches.forEach(match => {
        try {
          const jsonMatch = match.match(/>(.*?)</s);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            if (data['@type']) {
              foundTypes.push(data['@type']);
            }
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      });
    }
    
    // Parse microdata types
    if (microdataTypes) {
      microdataTypes.forEach(match => {
        const typeMatch = match.match(/["']([^"']+)["']/);
        if (typeMatch) {
          foundTypes.push(typeMatch[1]);
        }
      });
    }
    
    // Match against business type schemas
    for (const [businessType, config] of Object.entries(BUSINESS_TYPES)) {
      for (const schemaType of config.schemas) {
        if (foundTypes.some(type => type.includes(schemaType))) {
          return { type: businessType, confidence: 0.95 }; // Schema markup is very reliable
        }
      }
    }
    
    return { type: null, confidence: 0 };
  }
  
  /**
   * Additional helper methods...
   */
  private analyzeDomainName(domain: string): { type: string | null; confidence: number } {
    const lowerDomain = domain.toLowerCase();
    
    for (const [businessType, config] of Object.entries(BUSINESS_TYPES)) {
      for (const keyword of config.keywords) {
        if (lowerDomain.includes(keyword)) {
          return { type: businessType, confidence: 0.7 };
        }
      }
    }
    
    return { type: null, confidence: 0 };
  }
  
  private analyzeUKSpecificTerms(html: string): { type: string | null; confidence: number } {
    const lowerHtml = html.toLowerCase();
    
    for (const [businessType, config] of Object.entries(BUSINESS_TYPES)) {
      let ukTermCount = 0;
      config.ukTerms.forEach(term => {
        if (lowerHtml.includes(term)) ukTermCount++;
      });
      
      if (ukTermCount >= 2) {
        return { type: businessType, confidence: 0.8 };
      }
    }
    
    return { type: null, confidence: 0 };
  }
  
  private analyzeNavigation(html: string): { type: string | null; confidence: number } {
    // Extract navigation menu items
    const navMatches = html.match(/<nav[^>]*>(.*?)<\/nav>/gis) || [];
    const menuMatches = html.match(/<ul[^>]*class[^>]*menu[^>]*>(.*?)<\/ul>/gis) || [];
    
    const navContent = [...navMatches, ...menuMatches].join(' ').toLowerCase();
    
    for (const [businessType, config] of Object.entries(BUSINESS_TYPES)) {
      let score = 0;
      config.keywords.forEach(keyword => {
        if (navContent.includes(keyword)) score++;
      });
      
      if (score >= 2) {
        return { type: businessType, confidence: 0.6 };
      }
    }
    
    return { type: null, confidence: 0 };
  }
  
  private combineResults(candidates: { type: string; confidence: number; method: string }[]): {
    primaryType: BusinessType;
    secondaryTypes: BusinessType[];
  } {
    if (candidates.length === 0) {
      return {
        primaryType: {
          category: 'Business Services',
          subcategory: 'General',
          confidence: 'low',
          detectionMethods: ['fallback'],
          relevantKeywords: []
        },
        secondaryTypes: []
      };
    }
    
    // Weight and combine scores
    const finalScores: { [key: string]: number } = {};
    candidates.forEach(candidate => {
      if (!finalScores[candidate.type]) finalScores[candidate.type] = 0;
      finalScores[candidate.type] += candidate.confidence;
    });
    
    const sorted = Object.entries(finalScores).sort(([,a], [,b]) => b - a);
    const topType = sorted[0][0];
    const topScore = sorted[0][1];
    
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (topScore >= 2.0) confidence = 'high';
    else if (topScore >= 1.0) confidence = 'medium';
    
    const methods = candidates.filter(c => c.type === topType).map(c => c.method);
    const config = BUSINESS_TYPES[topType as keyof typeof BUSINESS_TYPES];
    
    // Determine specific subcategory based on content analysis
    let subcategory = config?.subcategories[0] || 'General';
    if (config?.subcategories) {
      subcategory = this.detectSpecificSubcategory(topType, config.subcategories);
    }
    
    return {
      primaryType: {
        category: topType,
        subcategory,
        confidence,
        detectionMethods: methods,
        relevantKeywords: config?.keywords.slice(0, 10) || []
      },
      secondaryTypes: sorted.slice(1, 3).map(([type, score]) => ({
        category: type,
        subcategory: BUSINESS_TYPES[type as keyof typeof BUSINESS_TYPES]?.subcategories[0] || 'General',
        confidence: score >= 1.0 ? 'medium' : 'low',
        detectionMethods: candidates.filter(c => c.type === type).map(c => c.method),
        relevantKeywords: BUSINESS_TYPES[type as keyof typeof BUSINESS_TYPES]?.keywords.slice(0, 5) || []
      }))
    };
  }

  /**
   * Detect specific subcategory within a business type
   */
  private detectSpecificSubcategory(businessType: string, subcategories: string[]): string {
    if (!this.htmlContent) return subcategories[0];
    
    const content = this.htmlContent.toLowerCase();
    
    // Special logic for Food Processing & Equipment
    if (businessType === 'Food Processing & Equipment') {
      if (content.includes('chocolate') && (content.includes('machine') || content.includes('equipment') || content.includes('tempering') || content.includes('mould'))) {
        return 'Chocolate Equipment';
      }
      if (content.includes('nut butter') || (content.includes('nut') && content.includes('processing'))) {
        return 'Nut Processing Equipment';
      }
      return 'Food Processing Equipment';
    }
    
    // For other business types, use simple keyword matching
    for (const subcategory of subcategories) {
      const subcatWords = subcategory.toLowerCase().split(' ');
      if (subcatWords.some(word => content.includes(word))) {
        return subcategory;
      }
    }
    
    return subcategories[0];
  }

  // Store HTML content for subcategory detection
  private htmlContent: string = '';

  /**
   * Main detection method combining multiple approaches (updated to store HTML)
   */
  async detectBusinessType(domain: string, html: string): Promise<BusinessDetectionResult> {
    console.log(`🔍 Enhanced business detection for: ${domain}`);
    
    // Store HTML for subcategory detection
    this.htmlContent = html;
    
    const detectionSources: string[] = [];
    const candidates: { type: string; confidence: number; method: string }[] = [];
    
    // Method 1: Content Analysis (Free)
    const contentResult = this.analyzeContent(html);
    if (contentResult.type) {
      candidates.push({ type: contentResult.type, confidence: contentResult.confidence, method: 'content_analysis' });
      detectionSources.push('Content Analysis');
    }
    
    // Method 2: URL Structure Analysis (Free)
    const urlResult = this.analyzeUrlStructure(html, domain);
    if (urlResult.type) {
      candidates.push({ type: urlResult.type, confidence: urlResult.confidence, method: 'url_analysis' });
      detectionSources.push('URL Structure');
    }
    
    // Method 3: Schema.org Markup (Free)
    const schemaResult = this.analyzeSchemaMarkup(html);
    if (schemaResult.type) {
      candidates.push({ type: schemaResult.type, confidence: schemaResult.confidence, method: 'schema_markup' });
      detectionSources.push('Schema Markup');
    }
    
    // Method 4: Domain Name Analysis (Free)
    const domainResult = this.analyzeDomainName(domain);
    if (domainResult.type) {
      candidates.push({ type: domainResult.type, confidence: domainResult.confidence, method: 'domain_analysis' });
      detectionSources.push('Domain Analysis');
    }
    
    // Method 5: UK-Specific Detection (Free)
    const ukResult = this.analyzeUKSpecificTerms(html);
    if (ukResult.type) {
      candidates.push({ type: ukResult.type, confidence: ukResult.confidence, method: 'uk_terms' });
      detectionSources.push('UK Business Terms');
    }
    
    // Method 6: Navigation Analysis (Free)
    const navResult = this.analyzeNavigation(html);
    if (navResult.type) {
      candidates.push({ type: navResult.type, confidence: navResult.confidence, method: 'navigation' });
      detectionSources.push('Navigation Analysis');
    }
    
    // Combine results with weighted scoring
    const finalResult = this.combineResults(candidates);
    
    // Determine company size
    const companySize = this.detectCompanySize(html);
    
    // Check if it's a local business
    const localBusiness = this.isLocalBusiness(html);
    
    // Check if UK-specific
    const ukSpecific = this.isUKBusiness(domain, html);
    
    console.log(`✅ Detection complete: ${finalResult.primaryType.category} (${finalResult.primaryType.confidence})`);
    console.log(`📊 Sources used: ${detectionSources.join(', ')}`);
    
    return {
      primaryType: finalResult.primaryType,
      secondaryTypes: finalResult.secondaryTypes,
      ukSpecific,
      localBusiness,
      companySize,
      detectionSources
    };
  }
  
  private extractInternalLinks(html: string, domain: string): string[] {
    const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
    return linkMatches
      .map(match => {
        const hrefMatch = match.match(/href=["']([^"']+)["']/);
        return hrefMatch ? hrefMatch[1] : '';
      })
      .filter(href => href.includes(domain) || href.startsWith('/'))
      .map(href => href.toLowerCase());
  }
  
  private detectCompanySize(html: string): 'micro' | 'small' | 'medium' | 'large' | 'enterprise' {
    const content = html.toLowerCase();
    
    if (content.includes('enterprise') || content.includes('corporate') || content.includes('group')) return 'enterprise';
    if (content.includes('nationwide') || content.includes('international')) return 'large';
    if (content.includes('team of') || content.includes('staff of')) return 'medium';
    if (content.includes('family') || content.includes('local') || content.includes('independent')) return 'small';
    
    return 'micro';
  }
  
  private isLocalBusiness(html: string): boolean {
    const localIndicators = ['near me', 'local', 'area', 'serving', 'coverage', 'postcode', 'address'];
    return localIndicators.some(indicator => html.toLowerCase().includes(indicator));
  }
  
  private isUKBusiness(domain: string, html: string): boolean {
    return domain.includes('.co.uk') || 
           domain.includes('.uk') || 
           html.toLowerCase().includes('uk') ||
           html.toLowerCase().includes('united kingdom');
  }
}

// Export convenience function
export async function detectEnhancedBusinessType(domain: string, html: string): Promise<BusinessDetectionResult> {
  const detector = new EnhancedBusinessDetector();
  return await detector.detectBusinessType(domain, html);
}