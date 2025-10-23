/**
 * Advanced Keyword Discovery Service
 * Combines multiple data sources for comprehensive keyword research
 */

import { SemanticKeywordExpansion, SemanticKeyword } from './semanticKeywordExpansion';
import { generateKeywordVariations, BUSINESS_KEYWORD_COLLECTIONS } from './keywordCollections';
import { KeywordsEverywhereService } from './keywordsEverywhereService';
import { SerperService } from './serperService';
import { SophisticatedBusinessContextService } from './sophisticatedBusinessContext';

export interface KeywordDiscoveryResult {
  primaryKeywords: SemanticKeyword[];
  longtailKeywords: SemanticKeyword[];
  competitorKeywords: SemanticKeyword[];
  suggestedKeywords: SemanticKeyword[];
  brandedKeywords: SemanticKeyword[];
  totalCreditsUsed: number;
  discoveryMethods: string[];
  businessSize: 'new' | 'small' | 'medium' | 'large';
}

export type BusinessSize = 'new' | 'small' | 'medium' | 'large';

export interface VolumeThresholds {
  min: number;
  max: number;
}

export class KeywordDiscoveryService {
  private semanticExpansion: SemanticKeywordExpansion;
  private keywordsEverywhereService: KeywordsEverywhereService;
  private serperService: SerperService;
  private businessContextService: SophisticatedBusinessContextService;

  constructor() {
    this.semanticExpansion = new SemanticKeywordExpansion();
    this.keywordsEverywhereService = new KeywordsEverywhereService();
    this.serperService = new SerperService();
    this.businessContextService = new SophisticatedBusinessContextService();
  }

  /**
   * Detect business size based on website signals
   */
  private detectBusinessSize(html: string, domain: string): BusinessSize {
    const htmlLower = html.toLowerCase();
    
    // Check for startup/new business indicators
    const newBusinessIndicators = [
      'founded 2023', 'founded 2024', 'founded 2025', 'established 2023', 'established 2024', 'established 2025',
      'startup', 'new company', 'just launched', 'coming soon', 'beta', 'early stage'
    ];
    
    // Check for large business indicators
    const largeBusinessIndicators = [
      'multinational', 'global', 'worldwide', 'international', 'plc', 'public company',
      'fortune 500', 'ftse', 'publicly traded', 'headquarters', 'offices worldwide',
      '1000+ employees', '500+ employees', 'billion', 'millions of customers'
    ];
    
    // Check for medium business indicators  
    const mediumBusinessIndicators = [
      '50+ employees', '100+ employees', '200+ employees', 'regional', 'nationwide',
      'multiple locations', 'branch offices', 'head office', 'subsidiary'
    ];
    
    // Company age indicators (older = larger typically)
    const ageMatches = htmlLower.match(/(?:founded|established|since) (\d{4})/);
    const foundedYear = ageMatches ? parseInt(ageMatches[1]) : null;
    const currentYear = new Date().getFullYear();
    const companyAge = foundedYear ? currentYear - foundedYear : 0;
    
    // Score each category
    let newScore = 0;
    let largeScore = 0; 
    let mediumScore = 0;
    
    newBusinessIndicators.forEach(indicator => {
      if (htmlLower.includes(indicator)) newScore += 2;
    });
    
    largeBusinessIndicators.forEach(indicator => {
      if (htmlLower.includes(indicator)) largeScore += 3;
    });
    
    mediumBusinessIndicators.forEach(indicator => {
      if (htmlLower.includes(indicator)) mediumScore += 2;
    });
    
    // Age-based scoring
    if (companyAge <= 2) newScore += 3;
    else if (companyAge <= 5) newScore += 1;
    else if (companyAge >= 20) largeScore += 2;
    else if (companyAge >= 10) mediumScore += 1;
    
    // Domain analysis
    if (domain.includes('.org') || domain.includes('.gov')) largeScore += 1;
    if (domain.length <= 8) newScore += 1; // Shorter domains often newer
    
    console.log(`🏢 Business size detection for ${domain}:`, {
      newScore,
      mediumScore, 
      largeScore,
      companyAge,
      foundedYear
    });
    
    // Determine size based on highest score
    if (newScore >= 3) return 'new';
    if (largeScore >= 3) return 'large';
    if (mediumScore >= 2) return 'medium';
    if (companyAge >= 5) return 'medium'; // Default for established companies
    return 'small'; // Default fallback
  }

  /**
   * Get volume thresholds based on business size
   */
  private getVolumeThresholds(businessSize: BusinessSize): VolumeThresholds {
    switch (businessSize) {
      case 'new':
        return { min: 25, max: 2500 };
      case 'small':
        return { min: 25, max: 5000 };
      case 'medium':
        return { min: 25, max: 5000 };
      case 'large':
        return { min: 100, max: 50000 };
      default:
        return { min: 25, max: 5000 };
    }
  }

  /**
   * Discover real branded keywords using Google suggestions + Keywords Everywhere API
   */
  async discoverBrandedKeywords(brandName: string, domain: string, country: string = 'gb'): Promise<SemanticKeyword[]> {
    console.log(`🏷️ Discovering real branded keywords for: ${brandName}`);
    const brandedKeywords: SemanticKeyword[] = [];
    
    try {
      // Step 1: Get Companies House data for enhanced business context (if UK company)
      const isUKCompany = domain.includes('.co.uk') || domain.includes('.uk');
      let businessIntelligence = null;
      
      if (isUKCompany) {
        try {
          // This will now skip Google NLP API but still use Companies House
          businessIntelligence = await this.businessContextService.analyzeBusinessIntelligence(
            domain, '', brandName, isUKCompany
          );
          console.log(`🇬🇧 Enhanced business context from Companies House: ${businessIntelligence?.sicCodes?.join(', ') || 'No data'}`);
        } catch (error) {
          console.log('⚠️ Companies House lookup failed, continuing with basic analysis');
        }
      }
      
      // Step 2: Generate sophisticated branded search terms based on business intelligence
      const brandedSeeds = this.generateSophisticatedBrandedSeeds(brandName, businessIntelligence);
      
      console.log(`🔍 Searching for branded keywords using ${brandedSeeds.length} sophisticated seeds...`);
      
      // Step 3: Get Google suggestions for each branded seed
      const discoveredKeywords: string[] = [];
      
      for (const seed of brandedSeeds) {
        try {
          const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; KeywordDiscovery/1.0)'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const suggestions = data[1] || [];
            
            suggestions.forEach((suggestion: string) => {
              const suggestionLower = suggestion.toLowerCase();
              const brandLower = brandName.toLowerCase();
              
              // Only include if it contains the exact brand name and is business relevant
              if (suggestionLower.includes(brandLower) && 
                  suggestion !== seed && 
                  !discoveredKeywords.includes(suggestion.toLowerCase()) &&
                  this.isBusinessRelevantBrandedKeyword(suggestionLower, brandLower, domain)) {
                discoveredKeywords.push(suggestion.toLowerCase());
              }
            });
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.log(`⚠️ Error getting suggestions for ${seed}:`, error.message);
        }
      }
      
      console.log(`📊 Found ${discoveredKeywords.length} potential branded keywords, getting real volumes...`);
      
      // Step 4: Get real search volumes from Keywords Everywhere API
      if (discoveredKeywords.length > 0) {
        try {
          const volumeData = await this.keywordsEverywhereService.getSearchVolumes(discoveredKeywords, country);
          
          // Step 5: Create sophisticated keyword objects with real data
          volumeData.forEach(vd => {
            if (vd.volume > 0) { // Only include keywords with actual search volume
              brandedKeywords.push({
                keyword: vd.keyword,
                relevanceScore: this.calculateBrandedRelevanceScore(vd.keyword, brandName, vd.volume),
                intent: 'branded',
                longtail: vd.keyword.split(' ').length >= 2,
                source: 'branded',
                searchVolume: vd.volume,
                competition: vd.competition,
                cpc: vd.cpc
              });
            }
          });
          
          console.log(`✅ ${brandedKeywords.length} branded keywords with real volume data`);
          
        } catch (error) {
          console.log('⚠️ Keywords Everywhere API failed, using estimated volumes');
          // Fallback to basic keyword objects
          discoveredKeywords.slice(0, 10).forEach(keyword => {
            brandedKeywords.push({
              keyword,
              relevanceScore: 0.8,
              intent: 'branded',
              longtail: keyword.split(' ').length >= 2,
              source: 'branded'
            });
          });
        }
      }
      
      // Sort by volume (if available) then relevance
      brandedKeywords.sort((a, b) => {
        if (a.searchVolume && b.searchVolume) {
          return b.searchVolume - a.searchVolume;
        }
        return b.relevanceScore - a.relevanceScore;
      });
      
      console.log(`🎯 Final branded keywords: ${brandedKeywords.slice(0, 5).map(k => `${k.keyword} (${k.searchVolume || 'est'})`).join(', ')}`);
      return brandedKeywords.slice(0, 20); // Limit to top 20
      
    } catch (error) {
      console.error('❌ Branded keyword discovery failed:', error);
      return [];
    }
  }

  /**
   * Generate sophisticated branded search seeds using business intelligence
   */
  private generateSophisticatedBrandedSeeds(brandName: string, businessIntelligence: any): string[] {
    const seeds = [
      brandName,
      brandName.toLowerCase(),
      brandName.replace(/\s+/g, '')
    ];
    
    // Add compound word variations (e.g., "vantagehouse" -> "vantage house")
    const spacedVariations = this.generateSpacedBrandVariations(brandName);
    seeds.push(...spacedVariations);
    
    // Add industry-specific combinations if we have SIC codes
    if (businessIntelligence?.sicCodes) {
      // Map SIC codes to relevant terms
      const sicTerms = this.mapSicCodesToTerms(businessIntelligence.sicCodes);
      sicTerms.forEach(term => {
        seeds.push(`${brandName} ${term}`);
      });
    }
    
    // Add generic business combinations
    const businessTerms = [
      'marketing', 'services', 'company', 'agency', 'group', 'communications',
      'consulting', 'solutions', 'reviews', 'contact', 'pricing', 'location',
      'near me', 'opening hours', 'about', 'testimonials', 'portfolio'
    ];
    
    businessTerms.forEach(term => {
      seeds.push(`${brandName} ${term}`);
    });
    
    return seeds;
  }

  /**
   * Generate spaced variations of compound brand names
   */
  private generateSpacedBrandVariations(brandName: string): string[] {
    const variations: string[] = [];
    const lowerBrand = brandName.toLowerCase();
    
    // Skip if already has spaces
    if (brandName.includes(' ')) {
      return variations;
    }
    
    // Common compound word patterns for business names
    const commonSplits = [
      // Common business suffixes
      { pattern: /(.+)(house)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /(.+)(group)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /(.+)(corp)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /(.+)(tech)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /(.+)(works)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /(.+)(media)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /(.+)(solutions)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /(.+)(services)$/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      
      // Common business prefixes
      { pattern: /^(vantage)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(advantage)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(prime)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(smart)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(digital)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(elite)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(pro)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(expert)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(top)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` },
      { pattern: /^(best)(.+)/i, split: (match: RegExpMatchArray) => `${match[1]} ${match[2]}` }
    ];
    
    // Try each pattern
    for (const { pattern, split } of commonSplits) {
      const match = brandName.match(pattern);
      if (match && match[1].length >= 3 && match[2].length >= 3) {
        const spacedVersion = split(match);
        console.log(`🏷️ Generated spaced variation: "${brandName}" -> "${spacedVersion}"`);
        variations.push(spacedVersion);
        variations.push(spacedVersion.toLowerCase());
        break; // Only use the first successful split
      }
    }
    
    // If no pattern matched, try simple camelCase splitting
    if (variations.length === 0) {
      const camelSplit = this.splitCamelCase(brandName);
      if (camelSplit && camelSplit !== brandName) {
        console.log(`🏷️ Generated camelCase variation: "${brandName}" -> "${camelSplit}"`);
        variations.push(camelSplit);
        variations.push(camelSplit.toLowerCase());
      }
    }
    
    return variations;
  }

  /**
   * Split camelCase or detect word boundaries
   */
  private splitCamelCase(text: string): string | null {
    // Split on capital letters (but keep them)
    const result = text.replace(/([a-z])([A-Z])/g, '$1 $2');
    return result !== text ? result : null;
  }

  /**
   * Get business type-specific irrelevant terms based on domain
   */
  private getBusinessTypeIrrelevantTerms(domain: string): string[] {
    const cleanDomain = domain.toLowerCase();
    
    // Estate agents - reject consulting, engineering, manufacturing terms
    if (cleanDomain.includes('henry') && cleanDomain.includes('adams') || 
        cleanDomain.includes('estate') || cleanDomain.includes('property') || 
        cleanDomain.includes('letting')) {
      return [
        'consulting', 'engineer', 'engineering', 'consultant', 'consultancy',
        'manufacturing', 'industrial', 'machinery', 'equipment', 'software',
        'technology', 'tech', 'development', 'programming', 'coding',
        'medical', 'healthcare', 'dental', 'clinic', 'hospital',
        'legal', 'law', 'solicitor', 'barrister', 'attorney'
      ];
    }
    
    // Consulting/professional services - reject estate agent terms
    if (cleanDomain.includes('consulting') || cleanDomain.includes('consultant')) {
      return [
        'estate', 'property', 'lettings', 'sales', 'residential', 'commercial',
        'auctions', 'valuations', 'mortgages', 'conveyancing', 'surveying'
      ];
    }
    
    // Manufacturing/equipment - reject service-based terms
    if (cleanDomain.includes('manufacturing') || cleanDomain.includes('equipment') ||
        cleanDomain.includes('machinery') || cleanDomain.includes('industrial')) {
      return [
        'consulting', 'estate', 'property', 'lettings', 'legal', 'law',
        'marketing', 'advertising', 'design', 'creative'
      ];
    }
    
    // Default - minimal filtering
    return [];
  }

  /**
   * Check if a branded keyword suggestion is business relevant
   */
  private isBusinessRelevantBrandedKeyword(suggestion: string, brandName: string, domain?: string): boolean {
    // Generate spaced variations to check against
    const spacedVariations = this.generateSpacedBrandVariations(brandName);
    const allBrandVariations = [brandName, ...spacedVariations];
    
    // Check if suggestion matches any brand variation
    const matchesAnyVariation = allBrandVariations.some(variation => {
      const lowerVariation = variation.toLowerCase();
      const lowerSuggestion = suggestion.toLowerCase();
      
      // Exact match or starts with variation + space
      return lowerSuggestion === lowerVariation || 
             lowerSuggestion.startsWith(lowerVariation + ' ') ||
             (lowerSuggestion === brandName.toLowerCase() && suggestion === brandName);
    });
    
    if (!matchesAnyVariation) {
      console.log(`❌ Branded keyword rejected: "${suggestion}" (doesn't match brand variations: [${allBrandVariations.join(', ')}])`);
      return false;
    }
    
    // First check for business type-specific irrelevant terms based on domain
    if (domain) {
      const businessTypeIrrelevantTerms = this.getBusinessTypeIrrelevantTerms(domain);
      const hasBusinessTypeIrrelevantTerm = businessTypeIrrelevantTerms.some(term => 
        suggestion.toLowerCase().includes(term.toLowerCase())
      );
      if (hasBusinessTypeIrrelevantTerm) {
        console.log(`❌ Branded keyword rejected: "${suggestion}" (irrelevant to business type)`);
        return false;
      }
    }
    
    // Business-relevant terms for branded keywords
    const businessTerms = [
      'marketing', 'agency', 'services', 'communications', 'consulting', 'solutions',
      'company', 'group', 'digital', 'creative', 'design', 'advertising', 'branding',
      'web design', 'seo', 'ppc', 'social media', 'content', 'strategy', 'development',
      'reviews', 'contact', 'about', 'portfolio', 'pricing', 'location', 'near me',
      'opening hours', 'testimonials', 'case studies', 'jobs', 'careers',
      // Estate agent specific terms
      'estate agents', 'property', 'lettings', 'sales', 'residential', 'commercial',
      'auctions', 'valuations', 'mortgages', 'conveyancing', 'surveying',
      // Manufacturing/testing equipment terms
      'equipment', 'machinery', 'testing', 'instruments', 'systems', 'products',
      'force gauge', 'torque', 'tester', 'load cell', 'tensile', 'software',
      'calibration', 'measurement', 'automation', 'industrial', 'manufacturing',
      'quality control', 'lab equipment', 'tools', 'devices', 'machines',
      'ltd', 'limited', 'inc', 'corp'
    ];
    
    // Exclude irrelevant terms (other companies, sports, etc.)
    const irrelevantTerms = [
      'ani', 'anirudh', 'pvt', 'pune', 'india', 'cricket', 'points table', 'prize pool',
      'championship', 'tournament', 'league', 'cup', 'match', 'score', 'result',
      'property', 'real estate', 'auto', 'car', 'vehicle', 'chelmsford'
    ];
    
    // Check for irrelevant terms
    const hasIrrelevantTerm = irrelevantTerms.some(term => suggestion.includes(term));
    if (hasIrrelevantTerm) {
      console.log(`❌ Branded keyword rejected: "${suggestion}" (contains irrelevant term)`);
      return false;
    }
    
    // Must contain at least one business term or be just the brand name
    const hasBusinessTerm = businessTerms.some(term => suggestion.includes(term));
    if (!hasBusinessTerm && suggestion !== brandName) {
      console.log(`❌ Branded keyword rejected: "${suggestion}" (no business relevance)`);
      return false;
    }
    
    console.log(`✅ Branded keyword accepted: "${suggestion}"`);
    return true;
  }

  /**
   * Map SIC codes to relevant search terms
   */
  private mapSicCodesToTerms(sicCodes: string[]): string[] {
    const terms: string[] = [];
    
    sicCodes.forEach(code => {
      // Get the first 2 digits for main section classification
      const mainSection = code.substring(0, 2);
      
      // SECTION A: Agriculture, forestry and fishing (01-03)
      if (['01', '02', '03'].includes(mainSection)) {
        terms.push('agriculture', 'farming', 'forestry', 'fishing', 'crops', 'livestock', 'agricultural', 'rural', 'farm');
      }
      
      // SECTION B: Mining and quarrying (05-09)
      else if (['05', '06', '07', '08', '09'].includes(mainSection)) {
        terms.push('mining', 'quarrying', 'extraction', 'oil', 'gas', 'coal', 'minerals', 'drilling');
      }
      
      // SECTION C: Manufacturing (10-33)
      else if (parseInt(mainSection) >= 10 && parseInt(mainSection) <= 33) {
        if (['10', '11', '12'].includes(mainSection)) {
          // Food, beverages, tobacco
          terms.push('food', 'beverages', 'manufacturing', 'production', 'processing', 'catering', 'drinks');
        } else if (['13', '14', '15'].includes(mainSection)) {
          // Textiles, wearing apparel, leather
          terms.push('textiles', 'clothing', 'fashion', 'apparel', 'leather', 'manufacturing', 'garments');
        } else if (['16', '17', '18'].includes(mainSection)) {
          // Wood, paper, printing
          terms.push('wood', 'paper', 'printing', 'publishing', 'timber', 'furniture', 'packaging');
        } else if (['19', '20', '21'].includes(mainSection)) {
          // Chemicals, pharmaceuticals
          terms.push('chemicals', 'pharmaceuticals', 'medicines', 'drugs', 'chemical', 'medical', 'healthcare');
        } else if (['22', '23'].includes(mainSection)) {
          // Rubber, plastic, glass, ceramics
          terms.push('rubber', 'plastic', 'glass', 'ceramics', 'materials', 'manufacturing');
        } else if (['24', '25'].includes(mainSection)) {
          // Basic metals, fabricated metal products
          terms.push('metals', 'steel', 'iron', 'metalwork', 'fabrication', 'engineering', 'manufacturing');
        } else if (['26', '27'].includes(mainSection)) {
          // Computer, electronic products, electrical equipment
          terms.push('electronics', 'electrical', 'computer', 'technology', 'equipment', 'manufacturing', 'engineering');
        } else if (['28', '29', '30'].includes(mainSection)) {
          // Machinery, motor vehicles, transport equipment
          terms.push('machinery', 'automotive', 'vehicles', 'transport', 'equipment', 'engineering', 'manufacturing');
        } else if (['31', '32', '33'].includes(mainSection)) {
          // Furniture, other manufacturing, repair
          terms.push('furniture', 'manufacturing', 'repair', 'installation', 'maintenance', 'services');
        }
      }
      
      // SECTION D: Electricity, gas, steam and air conditioning supply (35)
      else if (mainSection === '35') {
        terms.push('energy', 'electricity', 'gas', 'utilities', 'power', 'renewable', 'solar', 'wind');
      }
      
      // SECTION E: Water supply, sewerage, waste management (36-39)
      else if (['36', '37', '38', '39'].includes(mainSection)) {
        terms.push('water', 'waste', 'recycling', 'environmental', 'sewerage', 'utilities', 'management');
      }
      
      // SECTION F: Construction (41-43)
      else if (['41', '42', '43'].includes(mainSection)) {
        terms.push('construction', 'building', 'contractors', 'development', 'renovation', 'builders', 'property');
      }
      
      // SECTION G: Wholesale and retail trade (45-47)
      else if (['45', '46', '47'].includes(mainSection)) {
        if (mainSection === '45') {
          // Motor vehicle trade
          terms.push('automotive', 'cars', 'vehicles', 'garage', 'motor', 'sales', 'parts');
        } else if (mainSection === '46') {
          // Wholesale trade
          terms.push('wholesale', 'trade', 'distribution', 'supply', 'b2b', 'bulk');
        } else if (mainSection === '47') {
          // Retail trade
          terms.push('retail', 'shop', 'store', 'shopping', 'sales', 'customer');
        }
      }
      
      // SECTION H: Transportation and storage (49-53)
      else if (['49', '50', '51', '52', '53'].includes(mainSection)) {
        terms.push('transport', 'logistics', 'delivery', 'shipping', 'freight', 'storage', 'warehousing');
      }
      
      // SECTION I: Accommodation and food service activities (55-56)
      else if (['55', '56'].includes(mainSection)) {
        terms.push('hospitality', 'hotel', 'accommodation', 'restaurant', 'catering', 'food', 'dining');
      }
      
      // SECTION J: Information and communication (58-63)
      else if (['58', '59', '60', '61', '62', '63'].includes(mainSection)) {
        if (['58', '59', '60'].includes(mainSection)) {
          // Publishing, media, broadcasting
          terms.push('media', 'publishing', 'broadcasting', 'content', 'digital', 'communications');
        } else if (['61', '62', '63'].includes(mainSection)) {
          // IT and computer services
          terms.push('IT', 'software', 'technology', 'computing', 'digital', 'development', 'systems');
        }
      }
      
      // SECTION K: Financial and insurance activities (64-66)
      else if (['64', '65', '66'].includes(mainSection)) {
        terms.push('financial', 'finance', 'banking', 'insurance', 'investment', 'wealth', 'advisory', 'money');
      }
      
      // SECTION L: Real estate activities (68)
      else if (mainSection === '68') {
        terms.push('property', 'real estate', 'lettings', 'estate agent', 'rental', 'housing', 'commercial');
      }
      
      // SECTION M: Professional, scientific and technical activities (69-75)
      else if (['69', '70', '71', '72', '73', '74', '75'].includes(mainSection)) {
        if (mainSection === '69') {
          // Legal and accounting
          terms.push('legal', 'law', 'solicitor', 'accounting', 'accountant', 'professional', 'advisory');
        } else if (mainSection === '70') {
          // Management consultancy
          terms.push('consulting', 'management', 'advisory', 'strategy', 'business', 'professional');
        } else if (mainSection === '71') {
          // Architectural and engineering activities; technical testing
          terms.push('architecture', 'engineering', 'design', 'technical', 'testing', 'surveying', 'planning');
        } else if (mainSection === '72') {
          // Scientific research and development
          terms.push('research', 'development', 'science', 'innovation', 'R&D', 'laboratory', 'scientific');
        } else if (mainSection === '73') {
          // Advertising and market research
          terms.push('advertising', 'marketing', 'digital marketing', 'branding', 'PR', 'communications');
        } else if (mainSection === '74') {
          // Other professional activities
          terms.push('professional', 'design', 'creative', 'specialist', 'consultancy', 'services');
        } else if (mainSection === '75') {
          // Veterinary activities
          terms.push('veterinary', 'vet', 'animal', 'pet', 'healthcare', 'medical', 'care');
        }
      }
      
      // SECTION N: Administrative and support service activities (77-82)
      else if (['77', '78', '79', '80', '81', '82'].includes(mainSection)) {
        if (mainSection === '77') {
          // Rental and leasing activities
          terms.push('rental', 'leasing', 'hire', 'equipment', 'services');
        } else if (mainSection === '78') {
          // Employment activities
          terms.push('recruitment', 'employment', 'staffing', 'HR', 'jobs', 'careers');
        } else if (mainSection === '79') {
          // Travel agency and tour operator activities
          terms.push('travel', 'tourism', 'holiday', 'tours', 'booking', 'vacation');
        } else if (['80', '81', '82'].includes(mainSection)) {
          // Security, cleaning, business support
          terms.push('security', 'cleaning', 'facilities', 'support', 'services', 'maintenance');
        }
      }
      
      // SECTION O: Public administration and defence (84)
      else if (mainSection === '84') {
        terms.push('public', 'government', 'administration', 'council', 'authority', 'services');
      }
      
      // SECTION P: Education (85)
      else if (mainSection === '85') {
        terms.push('education', 'school', 'training', 'learning', 'teaching', 'university', 'college');
      }
      
      // SECTION Q: Human health and social work activities (86-88)
      else if (['86', '87', '88'].includes(mainSection)) {
        terms.push('healthcare', 'medical', 'health', 'care', 'clinic', 'hospital', 'social', 'wellbeing');
      }
      
      // SECTION R: Arts, entertainment and recreation (90-93)
      else if (['90', '91', '92', '93'].includes(mainSection)) {
        terms.push('entertainment', 'arts', 'culture', 'recreation', 'sports', 'leisure', 'events');
      }
      
      // SECTION S: Other service activities (94-96)
      else if (['94', '95', '96'].includes(mainSection)) {
        if (mainSection === '94') {
          // Membership organisations
          terms.push('organisation', 'association', 'membership', 'club', 'society', 'union');
        } else if (mainSection === '95') {
          // Repair services
          terms.push('repair', 'maintenance', 'service', 'fix', 'technical', 'support');
        } else if (mainSection === '96') {
          // Personal service activities
          terms.push('personal', 'beauty', 'wellness', 'services', 'care', 'lifestyle');
        }
      }
      
      // SECTION T: Household activities (97-98)
      else if (['97', '98'].includes(mainSection)) {
        terms.push('household', 'domestic', 'personal', 'services', 'employment');
      }
      
      // SECTION U: Extraterritorial organisations (99)
      else if (mainSection === '99') {
        terms.push('international', 'organisation', 'diplomatic', 'embassy', 'consulate');
      }
      
      // Always add common business terms
      terms.push('services', 'company', 'business', 'ltd', 'limited', 'solutions');
    });
    
    return [...new Set(terms)]; // Remove duplicates
  }

  /**
   * Calculate branded keyword relevance score based on multiple factors
   */
  private calculateBrandedRelevanceScore(keyword: string, brandName: string, volume: number): number {
    let score = 0.7; // Base score
    
    const keywordLower = keyword.toLowerCase();
    const brandLower = brandName.toLowerCase();
    
    // Exact brand match gets highest score
    if (keywordLower === brandLower) score = 1.0;
    
    // Brand at start of keyword gets bonus
    else if (keywordLower.startsWith(brandLower)) score += 0.2;
    
    // Volume-based scoring
    if (volume >= 100) score += 0.1;
    else if (volume >= 50) score += 0.05;
    
    // Length penalty for very long keywords
    if (keyword.split(' ').length > 4) score -= 0.1;
    
    return Math.min(1.0, Math.max(0.1, score));
  }

  /**
   * Comprehensive keyword discovery using multiple methods
   */
  async discoverKeywords(
    domain: string,
    html: string,
    extractedKeywords: string[],
    brandName: string,
    businessCategory: string,
    location?: string
  ): Promise<KeywordDiscoveryResult> {
    console.log('🔍 Starting comprehensive keyword discovery...');
    
    // Use provided business category from Claude API
    const businessSize = this.detectBusinessSize(html, domain);
    const volumeThresholds = this.getVolumeThresholds(businessSize);
    
    console.log(`📊 Using Claude detected business category: ${businessCategory}`);
    console.log(`🏢 Detected business size: ${businessSize} (volume range: ${volumeThresholds.min}-${volumeThresholds.max})`);
    
    const discoveryMethods: string[] = [];
    let totalCreditsUsed = 0;
    
    // 1. Branded keyword discovery (real Google search + API data)
    console.log('🏷️ Discovering real branded keywords...');
    const brandedKeywords = await this.discoverBrandedKeywords(brandName, domain, 'gb');
    discoveryMethods.push('Branded Keyword Discovery + Keywords Everywhere API');
    
    // 2. Semantic expansion of extracted keywords
    console.log('🧠 Expanding keywords semantically...');
    const semanticKeywords = await this.semanticExpansion.expandKeywords(
      extractedKeywords, 
      businessCategory, 
      domain, 
      location
    );
    discoveryMethods.push('Semantic Expansion');
    
    // 3. Business-relevant Google suggestions (volume-filtered + competitor analysis)
    console.log('🔍 Getting business-relevant Google suggestions...');
    const googleSuggestions = await this.getBusinessRelevantSuggestions(
      extractedKeywords.slice(0, 5),
      businessCategory,
      volumeThresholds,
      domain,
      location
    );
    discoveryMethods.push('Business-Relevant Suggestions + Serper + Keywords Everywhere');
    
    // 4. Business pattern matching
    console.log('🏢 Matching business patterns...');
    const businessPatternKeywords = this.generateBusinessPatternKeywords(businessCategory, location);
    discoveryMethods.push('Business Pattern Matching');
    
    // 5. Competitor analysis (using web scraping)
    console.log('🏆 Analyzing competitor keywords...');
    const competitorKeywords = await this.analyzeCompetitorKeywords(domain, businessCategory);
    discoveryMethods.push('Competitor Analysis');
    
    // 6. Question-based keyword discovery
    console.log('❓ Generating question-based keywords...');
    const questionKeywords = this.generateQuestionBasedKeywords(extractedKeywords, businessCategory);
    discoveryMethods.push('Question-Based Discovery');
    
    // Combine and categorize all keywords
    const allKeywords = [
      ...semanticKeywords,
      ...googleSuggestions,
      ...businessPatternKeywords,
      ...competitorKeywords,
      ...questionKeywords
    ];
    
    // Categorize keywords
    const primaryKeywords = allKeywords.filter(k => 
      k.relevanceScore >= 0.8 && k.source !== 'competitor' && !k.longtail
    ).slice(0, 20);
    
    const longtailKeywords = allKeywords.filter(k => 
      k.longtail && k.relevanceScore >= 0.6
    ).slice(0, 30);
    
    const competitorKws = allKeywords.filter(k => 
      k.source === 'competitor'
    ).slice(0, 15);
    
    const suggestedKeywords = allKeywords.filter(k => 
      k.source === 'suggestion' && k.relevanceScore >= 0.5
    ).slice(0, 25);
    
    console.log(`✅ Keyword discovery complete:
    - Primary keywords: ${primaryKeywords.length}
    - Longtail keywords: ${longtailKeywords.length}  
    - Competitor keywords: ${competitorKws.length}
    - Suggested keywords: ${suggestedKeywords.length}
    - Methods used: ${discoveryMethods.join(', ')}`);
    
    return {
      primaryKeywords,
      longtailKeywords,
      competitorKeywords: competitorKws,
      suggestedKeywords,
      brandedKeywords,
      totalCreditsUsed,
      discoveryMethods,
      businessSize
    };
  }
  
  /**
   * Get business-relevant keyword suggestions with real API data and competitor analysis
   */
  private async getBusinessRelevantSuggestions(
    seedKeywords: string[],
    businessCategory: string,
    volumeThresholds: VolumeThresholds,
    domain: string,
    location?: string
  ): Promise<SemanticKeyword[]> {
    console.log(`🎯 Discovering business-relevant keywords (volume: ${volumeThresholds.min}-${volumeThresholds.max})`);
    const suggestions: SemanticKeyword[] = [];

    try {
      // Step 1: Enhanced seed terms based on business category
      // Extract business region from location for filtering
      const businessRegion = this.extractRegionFromLocation(location);
      console.log(`📍 Business region detected: ${businessRegion || 'unknown'}`);

      // UK regions and cities that should be filtered if not matching business location
      const ukRegions = {
        scotland: ['scotland', 'glasgow', 'edinburgh', 'aberdeen', 'dundee', 'inverness'],
        wales: ['wales', 'cardiff', 'swansea', 'newport'],
        northEngland: ['manchester', 'liverpool', 'leeds', 'newcastle', 'sheffield', 'bradford', 'york'],
        midlands: ['birmingham', 'nottingham', 'leicester', 'coventry', 'derby', 'wolverhampton'],
        southEast: ['london', 'brighton', 'oxford', 'cambridge', 'reading', 'southampton'],
        southWest: ['bristol', 'exeter', 'plymouth', 'bath', 'bournemouth', 'devon', 'cornwall', 'somerset', 'dorset'],
        eastEngland: ['norwich', 'ipswich', 'peterborough', 'luton'],
        northWest: ['preston', 'blackpool', 'carlisle', 'lancaster']
      };
      
      const enhancedSeeds = [
        ...seedKeywords,
        `${businessCategory}`,
        `${businessCategory} services`,
        `${businessCategory} near me`,
        `${businessCategory} uk`,
        `${businessCategory} sussex`,
        `${businessCategory} services uk`,
        `${businessCategory} cost uk`,
        `${businessCategory} pricing uk`,
        `${businessCategory} agency uk`,
        `${businessCategory} consultant uk`,
        `best ${businessCategory} uk`,
        `professional ${businessCategory}`,
        `${businessCategory} company`
      ];
      
      // Step 2: Get competitor keywords using Serper (if available)
      const competitorKeywords = await this.getCompetitorKeywords(domain, businessCategory);
      enhancedSeeds.push(...competitorKeywords.slice(0, 5)); // Add top competitor keywords as seeds
      
      console.log(`🔍 Using ${enhancedSeeds.length} enhanced seeds (including competitor insights)`);
      
      // Step 3: Get Google suggestions for each seed
      const discoveredKeywords: string[] = [];
      
      for (const seed of enhancedSeeds) {
        try {
          const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; KeywordDiscovery/1.0)'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const suggestionList = data[1] || [];
            
            suggestionList.forEach((suggestion: string) => {
              if (suggestion && suggestion.length > seed.length) {
                // Filter out non-UK location keywords
                const nonUKLocations = ['mumbai', 'delhi', 'bangalore', 'pune', 'chennai', 'kolkata', 'hyderabad', 'ahmedabad', 'dubai', 'singapore', 'new york', 'los angeles', 'chicago', 'toronto', 'sydney', 'melbourne'];
                const lowerSuggestion = suggestion.toLowerCase();

                // Skip if contains non-UK city names
                if (nonUKLocations.some(city => lowerSuggestion.includes(city))) {
                  return;
                }

                // Filter out irrelevant UK regions (if business region is known)
                if (businessRegion) {
                  // Get all UK locations except those in the business's region
                  const irrelevantLocations = Object.entries(ukRegions)
                    .filter(([region]) => region !== businessRegion)
                    .flatMap(([, cities]) => cities);

                  // Skip if keyword contains location from different UK region
                  if (irrelevantLocations.some(city => lowerSuggestion.includes(city))) {
                    console.log(`⊘ Filtered out irrelevant region: "${suggestion}" (business in ${businessRegion})`);
                    return;
                  }
                }

                // Filter for business relevance
                const isBusinessRelevant = this.isBusinessRelevantSuggestion(suggestion, businessCategory);

                if (isBusinessRelevant && !discoveredKeywords.includes(lowerSuggestion)) {
                  discoveredKeywords.push(lowerSuggestion);
                }
              }
            });
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.log(`⚠️ Error getting suggestions for ${seed}:`, error.message);
        }
      }
      
      console.log(`📊 Found ${discoveredKeywords.length} potential keywords, getting real volumes...`);
      
      // Step 4: Get real search volumes and competition data from Keywords Everywhere
      if (discoveredKeywords.length > 0) {
        try {
          const volumeData = await this.keywordsEverywhereService.getSearchVolumes(discoveredKeywords, 'gb');
          
          // Step 5: Filter by volume thresholds and create sophisticated keyword objects
          volumeData.forEach(vd => {
            if (vd.volume >= volumeThresholds.min && vd.volume <= volumeThresholds.max) {
              suggestions.push({
                keyword: vd.keyword,
                relevanceScore: this.calculateNonBrandedRelevanceScore(vd.keyword, businessCategory, vd.volume, vd.competition),
                intent: this.determineKeywordIntent(vd.keyword),
                longtail: vd.keyword.split(' ').length >= 3,
                source: 'suggestion',
                searchVolume: vd.volume,
                competition: vd.competition,
                cpc: vd.cpc
              });
            }
          });
          
          console.log(`✅ ${suggestions.length} business-relevant keywords within volume range`);
          
        } catch (error) {
          console.log('⚠️ Keywords Everywhere API failed, using basic suggestions');
          // Fallback to basic keyword objects
          discoveredKeywords.slice(0, 20).forEach(keyword => {
            suggestions.push({
              keyword,
              relevanceScore: 0.7,
              intent: 'commercial',
              longtail: keyword.split(' ').length >= 3,
              source: 'suggestion'
            });
          });
        }
      }
      
    } catch (error) {
      console.log('Business-relevant suggestions unavailable, using fallback method');
    }
    
    // Sort by relevance score and volume
    suggestions.sort((a, b) => {
      if (a.searchVolume && b.searchVolume) {
        return (b.relevanceScore * 10 + Math.log(b.searchVolume)) - (a.relevanceScore * 10 + Math.log(a.searchVolume));
      }
      return b.relevanceScore - a.relevanceScore;
    });
    
    console.log(`🎯 Top suggestions: ${suggestions.slice(0, 5).map(k => `${k.keyword} (${k.searchVolume || 'est'}, score: ${k.relevanceScore.toFixed(2)})`).join(', ')}`);
    return suggestions.slice(0, 30); // Limit to top 30
  }

  /**
   * Get competitor keywords using Serper API
   */
  private async getCompetitorKeywords(domain: string, businessCategory: string): Promise<string[]> {
    try {
      // Use Serper to search for business category and analyze top results
      const searchQuery = `${businessCategory} services`;

      const serpResults = await this.serperService.getFullSerpResults(searchQuery, 'United Kingdom', 10);

      if (!serpResults) {
        console.log('⚠️ Serper API returned no results');
        return [];
      }

      const competitorDomains = serpResults.results
        ?.filter((result: any) => !result.url.includes(domain)) // Exclude own domain
        ?.slice(0, 5)
        ?.map((result: any) => result.domain) || [];

      console.log(`🏆 Found ${competitorDomains.length} competitors from SERP analysis`);

      // Extract potential keywords from competitor titles
      const competitorKeywords: string[] = [];
      serpResults.results?.slice(0, 5).forEach((result: any) => {
        if (result.title) {
          const text = result.title.toLowerCase();
          const words = text.match(/\b[a-z]{3,}\b/g) || [];

          // Extract meaningful phrases
          words.forEach((word, index) => {
            if (index < words.length - 1) {
              const phrase = `${word} ${words[index + 1]}`;
              if (this.isBusinessRelevantSuggestion(phrase, businessCategory)) {
                competitorKeywords.push(phrase);
              }
            }
          });
        }
      });

      return [...new Set(competitorKeywords)].slice(0, 10);

    } catch (error) {
      console.log('⚠️ Serper competitor analysis failed, continuing without competitor insights');
      return [];
    }
  }

  /**
   * Calculate non-branded keyword relevance score
   */
  private calculateNonBrandedRelevanceScore(keyword: string, businessCategory: string, volume: number, competition: number): number {
    let score = 0.5; // Base score
    
    const keywordLower = keyword.toLowerCase();
    const categoryLower = businessCategory.toLowerCase();
    
    // UK location boost - prioritize UK-specific keywords
    const ukTerms = ['uk', 'sussex', 'brighton', 'london', 'british', 'england'];
    if (ukTerms.some(term => keywordLower.includes(term))) score += 0.25;
    
    // Penalize non-UK locations
    const nonUKTerms = ['mumbai', 'delhi', 'dubai', 'singapore', 'usa', 'america', 'canada', 'australia'];
    if (nonUKTerms.some(term => keywordLower.includes(term))) score -= 0.5;
    
    // Category relevance
    if (keywordLower.includes(categoryLower)) score += 0.3;
    
    // Volume scoring (sweet spot for each business size)
    if (volume >= 100 && volume <= 1000) score += 0.2;
    else if (volume >= 50 && volume <= 500) score += 0.15;
    
    // Competition scoring (lower competition is better)
    if (competition < 0.3) score += 0.15;
    else if (competition < 0.5) score += 0.1;
    else score -= 0.1;
    
    // Intent indicators
    const commercialIndicators = ['buy', 'price', 'cost', 'service', 'hire', 'consultant'];
    const informationalIndicators = ['how to', 'what is', 'guide', 'tips'];
    
    if (commercialIndicators.some(term => keywordLower.includes(term))) score += 0.1;
    if (informationalIndicators.some(term => keywordLower.includes(term))) score += 0.05;
    
    // Local intent bonus
    if (keywordLower.includes('near me') || keywordLower.includes('local')) score += 0.1;
    
    return Math.min(1.0, Math.max(0.1, score));
  }

  /**
   * Determine keyword intent based on content
   */
  private determineKeywordIntent(keyword: string): 'commercial' | 'informational' | 'navigational' | 'transactional' {
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('buy') || keywordLower.includes('price') || keywordLower.includes('cost')) {
      return 'transactional';
    }
    if (keywordLower.includes('how to') || keywordLower.includes('what is') || keywordLower.includes('guide')) {
      return 'informational';
    }
    if (keywordLower.includes('login') || keywordLower.includes('contact') || keywordLower.includes('about')) {
      return 'navigational';
    }
    return 'commercial';
  }

  /**
   * Check if a suggestion is business-relevant
   */
  private isBusinessRelevantSuggestion(suggestion: string, businessCategory: string): boolean {
    const suggestionLower = suggestion.toLowerCase();
    const categoryLower = businessCategory.toLowerCase();
    
    // Must contain business category or related terms
    const businessTerms = [
      categoryLower,
      'services', 'agency', 'company', 'consultant', 'professional',
      'expert', 'specialist', 'near me', 'cost', 'pricing', 'quote',
      'best', 'top', 'local', 'how to', 'what is'
    ];
    
    const hasBusinessTerm = businessTerms.some(term => suggestionLower.includes(term));
    
    // Exclude overly generic terms
    const tooGeneric = [
      'free', 'download', 'online', 'tutorial', 'video', 'song', 'movie',
      'game', 'app', 'software', 'review', 'news', 'wikipedia', 'amazon'
    ];
    
    const isTooGeneric = tooGeneric.some(generic => suggestionLower.includes(generic));
    
    return hasBusinessTerm && !isTooGeneric;
  }

  /**
   * Extract UK region from business location
   */
  private extractRegionFromLocation(location?: string): string | null {
    if (!location) return null;

    const lowerLocation = location.toLowerCase();

    // Map location to UK region
    const regionMappings: { [key: string]: string[] } = {
      scotland: ['scotland', 'glasgow', 'edinburgh', 'aberdeen', 'dundee', 'inverness', 'stirling', 'perth'],
      wales: ['wales', 'cardiff', 'swansea', 'newport', 'wrexham', 'bangor'],
      northEngland: ['manchester', 'liverpool', 'leeds', 'newcastle', 'sheffield', 'bradford', 'york', 'sunderland', 'hull', 'lancashire', 'yorkshire', 'durham', 'cumbria'],
      midlands: ['birmingham', 'nottingham', 'leicester', 'coventry', 'derby', 'wolverhampton', 'stoke', 'west midlands', 'east midlands'],
      southEast: ['london', 'brighton', 'oxford', 'cambridge', 'reading', 'southampton', 'portsmouth', 'kent', 'surrey', 'sussex', 'hampshire', 'berkshire', 'essex'],
      southWest: ['bristol', 'exeter', 'plymouth', 'bath', 'bournemouth', 'devon', 'cornwall', 'somerset', 'dorset', 'gloucestershire', 'wiltshire', 'alton'],
      eastEngland: ['norwich', 'ipswich', 'peterborough', 'luton', 'norfolk', 'suffolk', 'cambridgeshire'],
      northWest: ['preston', 'blackpool', 'carlisle', 'lancaster', 'chester', 'warrington']
    };

    // Find which region the location belongs to
    for (const [region, locations] of Object.entries(regionMappings)) {
      if (locations.some(loc => lowerLocation.includes(loc))) {
        console.log(`✓ Matched location "${location}" to region: ${region}`);
        return region;
      }
    }

    console.log(`✗ Could not match location "${location}" to a specific UK region`);
    return null;
  }

  /**
   * Get keyword suggestions from Google (Free API)
   */
  private async getGoogleSuggestions(seedKeywords: string[]): Promise<SemanticKeyword[]> {
    const suggestions: SemanticKeyword[] = [];
    
    try {
      for (const keyword of seedKeywords) {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; KeywordDiscovery/1.0)'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const suggestionList = data[1] || [];
          
          suggestionList.forEach((suggestion: string) => {
            if (suggestion && suggestion.length > keyword.length) {
              suggestions.push({
                keyword: suggestion.toLowerCase(),
                relevanceScore: 0.7,
                intent: 'commercial',
                longtail: suggestion.split(' ').length >= 3,
                source: 'suggestion'
              });
            }
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.log('Google suggestions unavailable, using fallback method');
    }
    
    return suggestions;
  }
  
  /**
   * Generate keywords based on business patterns
   */
  private generateBusinessPatternKeywords(businessCategory: string, location?: string): SemanticKeyword[] {
    const keywords: SemanticKeyword[] = [];
    
    // Get relevant business patterns
    const collection = BUSINESS_KEYWORD_COLLECTIONS.find(c => c.category === businessCategory);
    if (!collection) return keywords;
    
    // Generate variations for each pattern
    collection.patterns.forEach(pattern => {
      // Base keyword
      keywords.push({
        keyword: pattern,
        relevanceScore: 0.9,
        intent: collection.intent,
        longtail: pattern.split(' ').length >= 3,
        source: 'semantic'
      });
      
      // With modifiers
      collection.modifiers.forEach(modifier => {
        keywords.push({
          keyword: `${modifier} ${pattern}`,
          relevanceScore: 0.85,
          intent: collection.intent,
          longtail: true,
          source: 'semantic'
        });
      });
      
      // With location
      if (location) {
        keywords.push({
          keyword: `${pattern} ${location}`,
          relevanceScore: 0.8,
          intent: 'commercial',
          longtail: true,
          source: 'semantic'
        });
      }
    });
    
    return keywords;
  }
  
  /**
   * Analyze competitor keywords (web scraping method)
   */
  private async analyzeCompetitorKeywords(domain: string, businessCategory: string): Promise<SemanticKeyword[]> {
    const competitorKeywords: SemanticKeyword[] = [];
    
    try {
      // This would use competitor discovery logic
      // For now, return business-relevant competitor keywords
      const competitorTerms = [
        'competitor analysis', 'market leader', 'industry expert',
        'professional service', 'trusted provider', 'established company'
      ];
      
      competitorTerms.forEach(term => {
        competitorKeywords.push({
          keyword: term,
          relevanceScore: 0.6,
          intent: 'commercial',
          longtail: term.split(' ').length >= 3,
          source: 'competitor'
        });
      });
      
    } catch (error) {
      console.log('Competitor analysis unavailable');
    }
    
    return competitorKeywords;
  }
  
  /**
   * Generate question-based longtail keywords
   */
  private generateQuestionBasedKeywords(
    baseKeywords: string[], 
    businessCategory: string
  ): SemanticKeyword[] {
    const questionKeywords: SemanticKeyword[] = [];
    
    const questionTemplates = [
      'how to choose {keyword}',
      'what is the best {keyword}',
      'where to find {keyword}',
      'how much does {keyword} cost',
      'why choose {keyword}',
      'when to use {keyword}',
      'how to get {keyword}',
      'what type of {keyword}',
      'how does {keyword} work',
      'benefits of {keyword}'
    ];
    
    baseKeywords.slice(0, 5).forEach(keyword => {
      questionTemplates.forEach(template => {
        const questionKeyword = template.replace('{keyword}', keyword);
        
        questionKeywords.push({
          keyword: questionKeyword,
          relevanceScore: 0.7,
          intent: 'informational',
          longtail: true,
          source: 'semantic'
        });
      });
    });
    
    return questionKeywords;
  }
}

/**
 * Enhanced competitor discovery using multiple signals
 */
export async function discoverBusinessCompetitors(
  domain: string, 
  businessCategory: string
): Promise<string[]> {
  const competitors: string[] = [];
  
  try {
    // This would implement competitor discovery logic
    // Using business directories, industry associations, etc.
    console.log(`🏆 Discovering competitors for ${domain} in ${businessCategory}`);
    
    // Return example competitors for now
    const exampleCompetitors = [
      'competitor1.com',
      'competitor2.co.uk', 
      'competitor3.net'
    ];
    
    competitors.push(...exampleCompetitors);
    
  } catch (error) {
    console.error('Competitor discovery failed:', error);
  }
  
  return competitors;
}