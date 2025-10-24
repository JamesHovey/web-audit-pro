/**
 * Above Fold Discovery Service
 * Discovers actual Google rankings using Serper API when available
 * Falls back to content-based analysis when SERP data is unavailable
 */

interface AboveFoldKeyword {
  keyword: string;
  position: number; // Actual Google position when available, 0 for opportunities
  url: string;
  volume?: number;
  difficulty?: number;
  snippet?: string;
  searchIntent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
  contentRelevance?: number; // How relevant to website content (0-1)
  isActualRanking?: boolean; // True if this is a real SERP ranking from Serper
}

interface AboveFoldAnalysis {
  keywords: AboveFoldKeyword[];
  totalFound: number;
  estimatedTrafficGain: number;
  discoveryMethod: string;
  creditsUsed: number;
}

export class AboveFoldDiscoveryService {
  private domain: string;
  
  constructor(domain: string) {
    this.domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  /**
   * Discover actual Google rankings or content opportunities
   * Uses Serper API for real rankings when available
   */
  async discoverAboveFoldKeywords(html: string, country: string = 'gb', existingKeywords?: any[], businessType?: string): Promise<AboveFoldAnalysis> {
    console.log(`🔍 Starting Above Fold Discovery for ${this.domain}...`);

    // Check if Serper is configured
    const { isSerperConfigured } = await import('./serperService');
    const useRealSerpData = isSerperConfigured();

    if (useRealSerpData) {
      console.log('✅ Serper API configured - fetching real Google rankings...');
    } else {
      console.log('ℹ️ Serper API not configured - using content-based analysis...');
    }
    
    let discoveryMethod = 'content_opportunity_analysis';
    
    try {
      // Step 1: Extract high-quality long-tail keywords from content
      const potentialKeywords = this.extractLongTailKeywords(html, existingKeywords, businessType);
      console.log(`📝 Extracted ${potentialKeywords.length} potential keywords`);
      
      // Step 2: Get real search volumes for all potential keywords
      const keywordsWithVolumes = await this.getKeywordVolumes(potentialKeywords, country);
      
      // Step 3: Only use Serper API for real rankings - no fallbacks
      let keywordOpportunities: AboveFoldKeyword[];

      if (useRealSerpData) {
        // Get actual SERP rankings from Serper (first page - positions 1-10)
        keywordOpportunities = await this.getRealSerpRankings(keywordsWithVolumes, country);
        discoveryMethod = 'serper_actual_rankings';
      } else {
        // No fallbacks - require Serper API
        console.log('⚠️ Serper API required for Above Fold Keywords analysis');
        keywordOpportunities = [];
        discoveryMethod = 'api_required';
      }
      
      // Step 4: Calculate estimated traffic potential
      const estimatedTraffic = this.calculateTrafficPotential(keywordOpportunities);
      
      console.log(`🎯 Found ${keywordOpportunities.length} keywords`);
      
      // Debug: show all found keywords
      keywordOpportunities.forEach(k => {
        if (k.isActualRanking) {
          console.log(`📊 Actual ranking: "${k.keyword}" - Position ${k.position}, Volume: ${k.volume || 0}`);
        } else if (k.position === 0) {
          console.log(`💡 Opportunity: "${k.keyword}" - Not ranking, Volume: ${k.volume || 0}`);
        } else {
          console.log(`📊 Content analysis: "${k.keyword}" - Relevance ${Math.round((k.contentRelevance || 0) * 100)}%, Volume: ${k.volume || 0}`);
        }
      });
      
      // Filter and sort keywords for Above Fold Keywords section
      let filteredKeywords = keywordOpportunities;
      
      if (useRealSerpData) {
        // RELAXED CRITERIA: Show keywords ranking in positions 1-10 with volume >10
        // This is more realistic for small businesses
        filteredKeywords = filteredKeywords.filter(k =>
          k.isActualRanking &&
          k.position >= 1 &&
          k.position <= 10 &&
          (k.volume || 0) > 10 &&
          k.keyword.split(' ').length >= 2 // 2+ words for long-tail
        );

        console.log(`🎯 Serper: Found ${filteredKeywords.length} keywords (positions 1-10, volume >10)`);

        // Categorize keywords by tier
        const topPerformers = filteredKeywords.filter(k => k.position <= 3 && (k.volume || 0) > 100);
        const strongRankings = filteredKeywords.filter(k => k.position <= 3 && (k.volume || 0) >= 10 && (k.volume || 0) <= 100);
        const page1Rankings = filteredKeywords.filter(k => k.position >= 4 && k.position <= 10 && (k.volume || 0) > 25);
        const longTailWins = filteredKeywords.filter(k => k.position <= 10 && (k.volume || 0) >= 10 && (k.volume || 0) <= 25);

        console.log(`  📊 Top Performers (pos 1-3, vol >100): ${topPerformers.length}`);
        console.log(`  📊 Strong Rankings (pos 1-3, vol 10-100): ${strongRankings.length}`);
        console.log(`  📊 Page 1 Rankings (pos 4-10, vol >25): ${page1Rankings.length}`);
        console.log(`  📊 Long-tail Wins (pos 1-10, vol 10-25): ${longTailWins.length}`);

        if (filteredKeywords.length === 0) {
          console.log(`⚠️ No keywords found ranking in positions 1-10 with volume >10`);
        }

        // Sort by position first, then by volume
        filteredKeywords.sort((a, b) => {
          if (a.position !== b.position) {
            return a.position - b.position; // Better positions first
          }
          return (b.volume || 0) - (a.volume || 0); // Higher volume first within same position
        });

        // Limit to maximum 50 keywords (increased from 30)
        filteredKeywords = filteredKeywords.slice(0, 50);

        console.log(`🔍 Final Above Fold Keywords: ${filteredKeywords.length} business-relevant longtail keywords`);
        filteredKeywords.slice(0, 10).forEach(k => {
          console.log(`  ✅ "${k.keyword}" - Position ${k.position}, Volume: ${k.volume || 0}`);
        });
      } else {
        // No fallbacks - empty array if Serper not available
        filteredKeywords = [];
        console.log('⚠️ No Above Fold Keywords - Serper API required');
      }

      console.log(`🔍 BEFORE calculating final results - filteredKeywords.length: ${filteredKeywords.length}`);
      console.log(`🔍 First 5 filtered keywords:`, filteredKeywords.slice(0, 5).map(k => `"${k.keyword}" pos:${k.position} vol:${k.volume} ranking:${k.isActualRanking}`));

      const actualRankings = filteredKeywords.filter(k => k.isActualRanking);
      const opportunities = filteredKeywords.filter(k => !k.isActualRanking);
      
      console.log(`📈 Results: ${actualRankings.length} actual rankings, ${opportunities.length} opportunities`);
      console.log(`🔍 Final filtered keywords for UI: ${filteredKeywords.length} total`);
      filteredKeywords.slice(0, 10).forEach(k => {
        if (k.isActualRanking) {
          console.log(`  ✅ "${k.keyword}" - Position ${k.position}, Volume: ${k.volume}, isActualRanking: ${k.isActualRanking}`);
        } else {
          console.log(`  💡 "${k.keyword}" - Opportunity, Volume: ${k.volume}, isActualRanking: ${k.isActualRanking}`);
        }
      });

      return {
        keywords: filteredKeywords,
        rawKeywords: keywordOpportunities, // All found keywords including 0-volume ones for competition analysis
        totalFound: filteredKeywords.length,
        estimatedTrafficGain: estimatedTraffic,
        discoveryMethod: discoveryMethod,
        creditsUsed: 0 // Credits tracked separately
      };
      
    } catch (error) {
      console.error('Above fold discovery error:', error);
      return {
        keywords: [],
        rawKeywords: [],
        totalFound: 0,
        estimatedTrafficGain: 0,
        discoveryMethod: 'content_analysis',
        creditsUsed: 0
      };
    }
  }

  /**
   * Extract long-tail keywords from website content
   */
  private extractLongTailKeywords(html: string, existingKeywords?: any[], businessType?: string): string[] {
    const keywords = new Set<string>();
    
    // Extract from title tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      this.extractPhrases(titleMatch[1], keywords, businessType);
    }
    
    // Extract from meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaMatch) {
      this.extractPhrases(metaMatch[1], keywords, businessType);
    }
    
    // Extract from h1 and h2 tags
    const headingMatches = html.match(/<h[12][^>]*>([^<]+)<\/h[12]>/gi);
    if (headingMatches) {
      headingMatches.forEach(match => {
        const text = match.replace(/<[^>]+>/g, '');
        this.extractPhrases(text, keywords, businessType);
      });
    }
    
    // Add location-based variations
    const locations = this.extractLocations(html);
    const services = this.extractServices(html);
    
    // Create location + service combinations
    locations.forEach(location => {
      services.forEach(service => {
        keywords.add(`${service} ${location}`.toLowerCase());
        keywords.add(`${service} in ${location}`.toLowerCase());
        keywords.add(`${service} near ${location}`.toLowerCase());
        keywords.add(`best ${service} ${location}`.toLowerCase());
      });
    });
    
    // Add existing keywords that might rank well
    if (existingKeywords) {
      existingKeywords.forEach(kw => {
        if (kw.keyword && kw.keyword.split(' ').length >= 3) {
          keywords.add(kw.keyword.toLowerCase());
        }
      });
    }
    
    // Add brand + service combinations
    const brandName = this.extractBrandName(html);
    if (brandName) {
      services.forEach(service => {
        keywords.add(`${brandName} ${service}`.toLowerCase());
      });
      locations.forEach(location => {
        keywords.add(`${brandName} ${location}`.toLowerCase());
      });
    }
    
    // Add industry-specific keywords based on business type
    const industryKeywords = this.getIndustrySpecificKeywords(businessType, html);
    industryKeywords.forEach(kw => keywords.add(kw));
    
    return Array.from(keywords).filter(k => 
      k.length > 8 && // Slightly shorter minimum for more keywords
      k.length < 60 && // Not too long
      k.split(' ').length >= 2 && // At least 2 words
      k.split(' ').length <= 6 // Max 6 words
    ).slice(0, 150); // Increased limit for more keywords
  }

  /**
   * Extract phrases from text
   */
  private extractPhrases(text: string, keywords: Set<string>, businessType?: string) {
    if (!text) return;
    
    // Filter out common footer/header content patterns
    const filteredText = this.filterGenericContent(text);
    
    const cleaned = filteredText.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleaned.split(' ');
    
    // Extract 3-6 word phrases (longtail), focus on business-relevant ones
    for (let len = 3; len <= 6; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        if (this.isValidKeywordPhrase(phrase) && this.containsBusinessTerms(phrase, businessType)) {
          keywords.add(phrase);
        }
      }
    }
  }

  /**
   * Filter out generic website content (footer, copyright, etc.)
   */
  private filterGenericContent(text: string): string {
    if (!text) return '';
    
    const lines = text.split(/[\n\r.!?]+/);
    const filteredLines = lines.filter(line => {
      const lowerLine = line.toLowerCase().trim();
      
      // Skip lines that contain generic content
      const genericPatterns = [
        'all rights reserved', 'copyright', '©', 'privacy policy', 'terms', 'conditions',
        'cookie policy', 'latest news', 'follow us', 'social media', 'newsletter',
        'subscribe', 'sign up', 'log in', 'contact us', 'about us', 'home page'
      ];
      
      return !genericPatterns.some(pattern => lowerLine.includes(pattern));
    });
    
    return filteredLines.join(' ');
  }

  /**
   * Check if phrase contains business-relevant terms
   */
  private containsBusinessTerms(phrase: string, businessType?: string): boolean {
    // Generate business-relevant terms based on detected business type
    const getBusinessTerms = (type: string): string[] => {
      switch (type) {
        case 'Food & Hospitality':
          return [
            'food', 'catering', 'restaurant', 'kitchen', 'dining', 'meal', 'recipe',
            'chef', 'cooking', 'culinary', 'hospitality', 'service', 'commercial',
            'equipment', 'machinery', 'processing', 'production', 'manufacturing'
          ];
        case 'Healthcare & Medical':
          return [
            'medical', 'health', 'healthcare', 'treatment', 'therapy', 'clinic',
            'doctor', 'patient', 'care', 'service', 'professional', 'practice',
            'consultation', 'diagnosis', 'medicine', 'wellness', 'rehabilitation'
          ];
        case 'Technology & Software':
          return [
            'technology', 'software', 'digital', 'tech', 'system', 'platform',
            'solution', 'development', 'programming', 'data', 'cloud', 'service',
            'application', 'website', 'mobile', 'automation', 'ai', 'machine learning'
          ];
        case 'Professional Services':
          return [
            'consulting', 'advisory', 'professional', 'service', 'business',
            'strategy', 'management', 'expert', 'specialist', 'solution',
            'analysis', 'optimization', 'implementation', 'support', 'training'
          ];
        case 'Manufacturing & Industrial':
          return [
            'manufacturing', 'industrial', 'production', 'factory', 'machinery',
            'equipment', 'processing', 'assembly', 'fabrication', 'automation',
            'engineering', 'quality', 'supply', 'logistics', 'commercial'
          ];
        case 'Retail & E-commerce':
          return [
            'retail', 'shop', 'store', 'product', 'sale', 'buy', 'purchase',
            'customer', 'shopping', 'merchandise', 'inventory', 'brand',
            'collection', 'delivery', 'service', 'online', 'ecommerce'
          ];
        default:
          return [
            'service', 'business', 'professional', 'company', 'solution',
            'product', 'customer', 'quality', 'experience', 'support'
          ];
      }
    };

    const businessTerms = getBusinessTerms(businessType || 'default');
    return businessTerms.some(term => phrase.toLowerCase().includes(term.toLowerCase()));
  }

  /**
   * Check if a phrase is a valid keyword
   */
  private isValidKeywordPhrase(phrase: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    const words = phrase.split(' ');
    
    // Must have at least one non-stop word
    const hasContent = words.some(w => !stopWords.includes(w) && w.length > 2);
    
    // Should not start or end with stop words
    const startsWell = !stopWords.includes(words[0]);
    const endsWell = !stopWords.includes(words[words.length - 1]);
    
    return hasContent && startsWell && endsWell;
  }

  /**
   * Extract locations from content
   */
  private extractLocations(html: string): string[] {
    const locations = new Set<string>();
    const text = html.toLowerCase();
    
    // Common UK cities and areas
    const ukLocations = [
      'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'liverpool',
      'bristol', 'sheffield', 'edinburgh', 'leicester', 'coventry', 'bradford',
      'cardiff', 'belfast', 'nottingham', 'newcastle', 'devon', 'exeter',
      'cornwall', 'somerset', 'dorset', 'kent', 'surrey', 'essex'
    ];
    
    ukLocations.forEach(loc => {
      if (text.includes(loc)) {
        locations.add(loc);
      }
    });
    
    // Extract from addresses or location mentions
    const addressPattern = /(?:in|near|around|serving)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
    const matches = html.match(addressPattern);
    if (matches) {
      matches.forEach(match => {
        const location = match.replace(/^(in|near|around|serving)\s+/i, '').toLowerCase();
        if (location.length > 2 && location.length < 30) {
          locations.add(location);
        }
      });
    }
    
    return Array.from(locations);
  }

  /**
   * Extract services from content
   */
  private extractServices(html: string): string[] {
    const services = new Set<string>();
    const text = html.toLowerCase();
    
    // Common service patterns
    const patterns = [
      /(\w+\s+services?)/g,
      /(\w+\s+solutions?)/g,
      /(\w+\s+consulting)/g,
      /(\w+\s+design)/g,
      /(\w+\s+development)/g,
      /(\w+\s+support)/g,
      /(\w+\s+management)/g,
      /(\w+\s+installation)/g,
      /(\w+\s+repair)/g,
      /(\w+\s+maintenance)/g
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 5 && match.length < 40) {
            services.add(match.trim());
          }
        });
      }
    });
    
    return Array.from(services).slice(0, 20); // Limit to top 20
  }

  /**
   * Extract brand name from content
   */
  private extractBrandName(_html: string): string {
    // Always use domain name as the primary source for brand name
    // This ensures we get the actual company name, not random content words
    const primaryDomain = this.domain.split('.')[0];
    return primaryDomain.charAt(0).toUpperCase() + primaryDomain.slice(1);
  }

  /**
   * Get industry-specific keywords based on business type
   */
  private getIndustrySpecificKeywords(businessType?: string, html?: string): string[] {
    
    switch (businessType) {
      case 'Food & Hospitality':
        // Generate food-related keywords based on actual content
        return this.extractIndustryKeywords(html, [
          'food', 'restaurant', 'catering', 'hospitality', 'dining', 'cuisine', 
          'chef', 'menu', 'hotel', 'accommodation', 'service', 'quality',
          'equipment', 'machinery', 'processing', 'commercial', 'industrial'
        ]);
        
      case 'Marketing & Digital':
        return this.extractIndustryKeywords(html, [
          'marketing', 'digital', 'seo', 'ppc', 'advertising', 'brand', 'strategy',
          'web design', 'social media', 'content', 'campaigns', 'agency', 'creative',
          'consulting', 'communications', 'services', 'solutions'
        ]);
        
      case 'Legal Services':
        return [
          'legal services',
          'solicitor services',
          'legal advice',
          'family law',
          'commercial law',
          'employment law',
          'personal injury',
          'conveyancing services',
          'legal consultation',
          'litigation services',
          'property law',
          'criminal law',
          'divorce law',
          'legal representation',
          'court representation',
          'legal support',
          'legal guidance',
          'law firm',
          'legal expertise',
          'professional legal'
        ];
        
      case 'Healthcare & Medical':
        return [
          'medical services',
          'healthcare services',
          'medical treatment',
          'health consultation',
          'medical care',
          'healthcare professionals',
          'medical expertise',
          'health screening',
          'medical diagnosis',
          'healthcare solutions',
          'medical specialists',
          'health services',
          'medical practice',
          'healthcare providers',
          'medical consultation',
          'health assessment',
          'medical support',
          'healthcare delivery'
        ];
        
      case 'Construction & Trades':
        return [
          'building services',
          'construction work',
          'home improvements',
          'building contractors',
          'construction projects',
          'building maintenance',
          'property development',
          'construction services',
          'building work',
          'home renovations',
          'construction company',
          'building solutions',
          'property services',
          'construction expertise',
          'building professionals'
        ];
        
      case 'Financial Services':
        return [
          'financial services',
          'accounting services',
          'tax advice',
          'financial planning',
          'business accounting',
          'tax preparation',
          'financial consultation',
          'bookkeeping services',
          'financial management',
          'tax services',
          'financial advice',
          'accounting solutions',
          'financial expertise',
          'tax planning',
          'financial support'
        ];
        
      case 'Architecture & Design':
        return [
          'architectural services',
          'design services',
          'architectural design',
          'building design',
          'planning services',
          'architectural consultancy',
          'design consultancy',
          'architectural planning',
          'design solutions',
          'architectural expertise',
          'design professionals',
          'planning permission',
          'architectural drawings',
          'design development',
          'architectural projects'
        ];
        
      default:
        return [
          'professional services',
          'business solutions',
          'commercial services',
          'expert consultation',
          'professional expertise',
          'business consultancy',
          'service provider',
          'professional support',
          'business services',
          'commercial solutions'
        ];
    }
  }

  /**
   * Extract industry-specific keywords based on actual content
   */
  private extractIndustryKeywords(html: string, seedTerms: string[]): string[] {
    const keywords = new Set<string>();
    const content = html.toLowerCase();
    
    // Extract text content from HTML
    const textContent = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Find combinations of seed terms with actual content
    seedTerms.forEach(seedTerm => {
      // Look for exact matches
      if (textContent.includes(seedTerm)) {
        keywords.add(seedTerm);
        
        // Find phrases containing the seed term
        const words = textContent.split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
          const twoWord = `${words[i]} ${words[i + 1]}`;
          const threeWord = i < words.length - 2 ? `${words[i]} ${words[i + 1]} ${words[i + 2]}` : '';
          
          if (twoWord.includes(seedTerm) && twoWord.length > seedTerm.length + 1) {
            keywords.add(twoWord);
          }
          if (threeWord && threeWord.includes(seedTerm) && threeWord.length > seedTerm.length + 2) {
            keywords.add(threeWord);
          }
        }
      }
    });
    
    // If we found relevant content, generate combinations
    if (keywords.size > 0) {
      seedTerms.forEach(baseTerm => {
        if (textContent.includes(baseTerm)) {
          seedTerms.forEach(modifier => {
            if (modifier !== baseTerm) {
              keywords.add(`${baseTerm} ${modifier}`);
              keywords.add(`${modifier} ${baseTerm}`);
            }
          });
        }
      });
    }
    
    // Return up to 25 keywords, filtered for quality
    return Array.from(keywords)
      .filter(kw => kw.length > 3 && kw.length < 50)
      .filter(kw => !kw.includes('  ')) // No double spaces
      .slice(0, 25);
  }

  /**
   * Get real SERP rankings from Serper API
   */
  private async getRealSerpRankings(
    keywordsWithVolumes: { keyword: string; volume: number; difficulty: number }[],
    country: string
  ): Promise<AboveFoldKeyword[]> {
    const { SerperService } = await import('./serperService');
    const serperService = new SerperService();

    // Map country code to location string
    const location = country === 'gb' ? 'United Kingdom' :
                     country === 'us' ? 'United States' :
                     'United Kingdom'; // Default to UK

    console.log(`🔍 Fetching real SERP rankings for ${keywordsWithVolumes.length} keywords...`);

    const aboveFoldKeywords: AboveFoldKeyword[] = [];
    let checkedCount = 0;
    const maxChecks = 50; // Limit to avoid excessive API usage

    // Sort by volume to check most important keywords first
    const sortedKeywords = [...keywordsWithVolumes]
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, maxChecks);

    for (const kw of sortedKeywords) {
      try {
        checkedCount++;
        console.log(`📊 Checking SERP for "${kw.keyword}" (${checkedCount}/${sortedKeywords.length})...`);

        const rankingData = await serperService.getKeywordRankings(
          kw.keyword,
          this.domain,
          location,
          100 // Check top 100 results
        );

        if (rankingData.position !== null && rankingData.position <= 10) {
          // Domain ranks in first page (positions 1-10) for this keyword
          console.log(`✅ Found page 1 ranking: "${kw.keyword}" - Position ${rankingData.position}`);

          aboveFoldKeywords.push({
            keyword: kw.keyword,
            position: rankingData.position,
            url: rankingData.url || `https://${this.domain}`,
            volume: kw.volume,
            difficulty: kw.difficulty,
            snippet: rankingData.snippet || undefined,
            searchIntent: this.detectSearchIntent(kw.keyword),
            isActualRanking: true,
            contentRelevance: this.calculateKeywordRelevance(kw.keyword, '') // Will be calculated if needed
          });
        } else if (rankingData.position !== null) {
          console.log(`⚪ Keyword ranks but not in first page: "${kw.keyword}" - Position ${rankingData.position}`);
        } else {
          console.log(`❌ Keyword not ranking: "${kw.keyword}"`);
        }

        // Small delay to avoid rate limiting
        await this.sleep(100);

      } catch (error) {
        console.error(`Failed to check SERP for "${kw.keyword}":`, error);
      }
    }

    console.log(`✅ Serper: Found ${aboveFoldKeywords.filter(k => k.isActualRanking).length} top 3 rankings`);
    console.log(`🎯 Serper: Filtered to show only positions 1-3 rankings`);

    return aboveFoldKeywords;
  }

  /**
   * Get business-relevant terms for a specific business type
   */
  private getBusinessTermsForType(businessType?: string): string[] {
    const commonBusinessTerms = [
      'service', 'services', 'support', 'professional', 'expert', 'specialist',
      'consultation', 'advice', 'guidance', 'solutions', 'business', 'commercial'
    ];

    switch (businessType) {
      case 'Food & Hospitality':
        return [
          ...commonBusinessTerms,
          'machine', 'machines', 'equipment', 'machinery', 'apparatus', 'device', 'system', 'systems',
          'chocolate', 'confection', 'confectionery', 'candy', 'cocoa', 'food', 'processing',
          'commercial', 'industrial', 'manufacturing', 'production', 'tempering',
          'molding', 'moulding', 'refining', 'conching', 'enrobing', 'cooling', 'wrapping',
          'packaging', 'melting', 'deposit', 'tunnel', 'line', 'factory', 'plant',
          'nut butter', 'cheese', 'dairy', 'ingredient', 'ingredients', 'butter', 'cream',
          'second hand', 'used', 'refurbished', 'sale', 'equipment sale',
          'restaurant', 'cafe', 'dining', 'menu', 'kitchen', 'chef', 'catering', 'hotel'
        ];
        
      case 'Marketing & Digital':
        return [
          ...commonBusinessTerms,
          'marketing', 'advertising', 'digital', 'seo', 'ppc', 'social media', 'branding',
          'website', 'web design', 'agency', 'creative', 'strategy', 'campaign', 'brand',
          'content', 'graphic design', 'pr', 'public relations', 'communications',
          'online', 'internet', 'promotion', 'advertising', 'media', 'design'
        ];
        
      case 'Legal Services':
        return [
          ...commonBusinessTerms,
          'legal', 'law', 'solicitor', 'barrister', 'lawyer', 'attorney', 'litigation',
          'conveyancing', 'will', 'probate', 'divorce', 'employment', 'criminal',
          'family', 'commercial', 'property', 'court', 'representation', 'advice'
        ];
        
      case 'Healthcare & Medical':
        return [
          ...commonBusinessTerms,
          'medical', 'health', 'healthcare', 'doctor', 'dentist', 'clinic', 'surgery',
          'treatment', 'therapy', 'physiotherapy', 'optician', 'pharmacy', 'hospital',
          'diagnosis', 'consultation', 'care', 'wellness', 'medicine'
        ];
        
      case 'Construction & Trades':
        return [
          ...commonBusinessTerms,
          'building', 'construction', 'builder', 'electrician', 'plumber', 'heating',
          'roofing', 'decorator', 'joiner', 'carpenter', 'renovation', 'maintenance',
          'repair', 'installation', 'property', 'home', 'improvement'
        ];
        
      case 'Financial Services':
        return [
          ...commonBusinessTerms,
          'financial', 'finance', 'accounting', 'accountant', 'tax', 'investment',
          'insurance', 'mortgage', 'loans', 'pension', 'planning', 'money',
          'bookkeeping', 'audit', 'compliance'
        ];
        
      case 'Architecture & Design':
        return [
          ...commonBusinessTerms,
          'architectural', 'architecture', 'design', 'designer', 'planning', 'building',
          'construction', 'extension', 'renovation', 'sustainable', 'heritage',
          'conservation', 'drawings', 'project', 'development'
        ];
        
      default:
        return [
          ...commonBusinessTerms,
          'industry', 'businesses', 'company', 'companies', 'professional',
          'corporate', 'enterprise', 'organization', 'firm', 'practice'
        ];
    }
  }

  /**
   * Get keyword volumes using Keywords Everywhere API
   */
  private async getKeywordVolumes(keywords: string[], country: string): Promise<{ keyword: string; volume: number; difficulty: number }[]> {
    try {
      const { KeywordsEverywhereService } = await import('./keywordsEverywhereService');
      const keService = new KeywordsEverywhereService();
      
      console.log(`🔍 Getting volumes for ${keywords.length} potential above-fold keywords...`);
      const volumeData = await keService.getSearchVolumes(keywords, country);
      
      return volumeData.map(v => ({
        keyword: v.keyword,
        volume: v.volume || 0,
        difficulty: v.competition ? Math.round(v.competition * 100) : 50
      }));
    } catch (error) {
      console.log('Could not get keyword volumes:', error);
      // Return keywords with estimated volumes
      return keywords.map(keyword => ({
        keyword,
        volume: null, // Only use real API data
        difficulty: 50 // Default difficulty
      }));
    }
  }

  /**
   * Score keyword opportunities based on content relevance and business alignment
   */
  private scoreKeywordOpportunities(keywordsWithVolumes: { keyword: string; volume: number; difficulty: number }[], html: string, businessType?: string): AboveFoldKeyword[] {
    const aboveFoldKeywords: AboveFoldKeyword[] = [];
    const lowerHtml = html.toLowerCase();
    
    keywordsWithVolumes.forEach(kw => {
      // Filter out high-volume generic keywords (>10,000) and low-volume keywords (<50)
      if (kw.volume >= 50 && kw.volume <= 10000) {
        // Check if this is a business-relevant keyword
        if (this.isBusinessRelevantKeyword(kw.keyword, lowerHtml, businessType)) {
          // Check how relevant this keyword is to the content
          const relevanceScore = this.calculateKeywordRelevance(kw.keyword, lowerHtml);
          
          if (relevanceScore > 0.4) { // Increased threshold for better quality
            // Create keyword opportunity (no fake positions)
            aboveFoldKeywords.push({
              keyword: kw.keyword,
              position: 0, // No position claim - this is content-based analysis
              volume: kw.volume,
              difficulty: kw.difficulty,
              url: `https://${this.domain}`,
              searchIntent: this.detectSearchIntent(kw.keyword),
              contentRelevance: relevanceScore
            });
          }
        }
      }
    });
    
    return aboveFoldKeywords;
  }

  /**
   * Check if a keyword is business-relevant (filters out generic site elements)
   */
  private isBusinessRelevantKeyword(keyword: string, lowerHtml: string, businessType?: string): boolean {
    const lowerKeyword = keyword.toLowerCase();
    
    // Filter out generic website elements
    const genericTerms = [
      'latest news', 'all rights', 'rights are', 'are reserved', 'all rights are reserved',
      'click here', 'read more', 'learn more', 'get started', 'contact us', 'about us',
      'privacy policy', 'terms conditions', 'cookie policy', 'home page', 'sign up',
      'log in', 'subscribe', 'newsletter', 'follow us', 'social media', 'facebook',
      'twitter', 'linkedin', 'instagram', 'youtube', 'have you seen', 'connect with us',
      'get the latest', 'rights reserved', 'copyright', 'cookies', 'website uses'
    ];
    
    // Filter out overly generic terms
    const overlyGeneric = [
      'small businesses', 'large and small', 'before you', 'try before',
      'we can help', 'can help you', 'help you get', 'get the best', 'you get the',
      'over 30 years', 'best solutions', 'current promotions', 'grab a bargain'
    ];
    
    // Check if keyword contains any generic terms
    if (genericTerms.some(term => lowerKeyword.includes(term))) {
      return false;
    }
    
    // Check if keyword is overly generic
    if (overlyGeneric.some(term => lowerKeyword.includes(term))) {
      return false;
    }
    
    // Get business-relevant terms based on business type
    const businessTerms = this.getBusinessTermsForType(businessType);
    
    // Check if keyword contains business terms
    const hasBusinessTerm = businessTerms.some(term => lowerKeyword.includes(term));
    
    // Additional check: if it's a short keyword (2-3 words), it must be very relevant
    const wordCount = lowerKeyword.split(' ').length;
    if (wordCount <= 3) {
      // Short keywords must contain core business terms
      const coreTerms = ['machine', 'equipment', 'chocolate', 'commercial', 'industrial', 'nut butter', 'cheese'];
      return coreTerms.some(term => lowerKeyword.includes(term));
    }
    
    return hasBusinessTerm;
  }

  /**
   * Calculate how relevant a keyword is to the content
   */
  private calculateKeywordRelevance(keyword: string, lowerHtml: string): number {
    const words = keyword.toLowerCase().split(' ');
    let score = 0;
    
    // Check if keyword appears in content
    if (lowerHtml.includes(keyword.toLowerCase())) {
      score += 0.4; // High relevance if exact keyword appears
    }
    
    // Check individual words
    const wordMatches = words.filter(word => lowerHtml.includes(word)).length;
    score += (wordMatches / words.length) * 0.3; // Partial relevance for individual words
    
    // Check in important areas (title, headings)
    const titleMatch = lowerHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1].toLowerCase().includes(keyword.toLowerCase())) {
      score += 0.3; // Bonus for appearing in title
    }
    
    // Check for business-related terms
    const businessTerms = ['machine', 'equipment', 'commercial', 'industrial', 'processing', 'service', 'solution', 'professional'];
    const keywordBusinessRelevance = businessTerms.filter(term => keyword.includes(term)).length;
    score += keywordBusinessRelevance * 0.1;
    
    return Math.min(1, score); // Cap at 1.0
  }


  /**
   * Enrich keywords with volume data from Keywords Everywhere
   */
  private async enrichWithVolumeData(keywords: AboveFoldKeyword[], country: string = 'gb') {
    try {
      const { KeywordsEverywhereService } = await import('./keywordsEverywhereService');
      const keService = new KeywordsEverywhereService();
      
      const keywordStrings = keywords.map(k => k.keyword);
      const volumeData = await keService.getSearchVolumes(keywordStrings, country);
      
      // Map volume data back to keywords
      const volumeMap = new Map(volumeData.map(v => [v.keyword.toLowerCase(), v]));
      
      keywords.forEach(kw => {
        const data = volumeMap.get(kw.keyword.toLowerCase());
        if (data) {
          kw.volume = data.volume;
          kw.difficulty = Math.round(data.competition * 100);
        }
      });
    } catch (error) {
      console.log('Could not get volume data:', error);
      // NO FAKE DATA - only use null when API fails
      keywords.forEach(kw => {
        kw.volume = null; // Only use real API data
        kw.difficulty = 50; // Default difficulty only
      });
    }
  }

  /**
   * Estimate search volume based on keyword characteristics
   */
  private estimateVolume(keyword: string): number {
    const words = keyword.split(' ').length;
    const hasLocation = /\b(london|manchester|birmingham|uk|england|near me)\b/i.test(keyword);
    const hasBest = /\b(best|top|cheap|affordable)\b/i.test(keyword);
    
    let baseVolume = 1000;
    
    // Longer keywords have lower volume
    if (words === 2) baseVolume = 800;
    else if (words === 3) baseVolume = 400;
    else if (words === 4) baseVolume = 200;
    else if (words >= 5) baseVolume = 100;
    
    // Location-based keywords have good volume
    if (hasLocation) baseVolume *= 1.5;
    
    // "Best" keywords are popular
    if (hasBest) baseVolume *= 1.3;
    
    // Add some randomness
    return Math.round(baseVolume * (0.5 + Math.random()));
  }

  /**
   * Estimate keyword difficulty
   */
  private estimateDifficulty(keyword: string): number {
    const words = keyword.split(' ').length;
    let difficulty = 50;
    
    // Longer keywords are easier
    if (words >= 4) difficulty = 30;
    else if (words === 3) difficulty = 40;
    
    // Add some randomness
    return Math.round(difficulty + (Math.random() * 20 - 10));
  }

  /**
   * Detect search intent
   */
  private detectSearchIntent(keyword: string): 'informational' | 'commercial' | 'transactional' | 'navigational' {
    const lower = keyword.toLowerCase();
    
    if (/\b(buy|purchase|order|shop|price|cost|cheap|affordable)\b/.test(lower)) {
      return 'transactional';
    }
    if (/\b(best|top|review|compare|vs|versus)\b/.test(lower)) {
      return 'commercial';
    }
    if (/\b(how|what|why|when|where|guide|tutorial|tips)\b/.test(lower)) {
      return 'informational';
    }
    return 'navigational';
  }

  /**
   * Calculate traffic potential from above-fold rankings
   */
  private calculateTrafficPotential(keywords: AboveFoldKeyword[]): number {
    return keywords.reduce((total, kw) => {
      const volume = kw.volume || 100;
      const ctr = kw.position === 1 ? 0.28 : kw.position === 2 ? 0.15 : 0.10; // CTR by position
      return total + Math.round(volume * ctr);
    }, 0);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main function to discover above-fold keywords
 */
export async function discoverAboveFoldKeywords(
  domain: string, 
  html: string, 
  country: string = 'gb',
  existingKeywords?: any[],
  businessType?: string
): Promise<AboveFoldAnalysis> {
  const service = new AboveFoldDiscoveryService(domain);
  return await service.discoverAboveFoldKeywords(html, country, existingKeywords, businessType);
}