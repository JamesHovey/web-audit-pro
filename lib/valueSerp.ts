interface ValueSerpResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  domain: string;
}

interface ValueSerpResponse {
  request_info: {
    success: boolean;
    credits_used_this_request: number;
  };
  search_metadata: {
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
  organic_results: ValueSerpResult[];
}

interface RealKeywordData {
  keyword: string;
  position: number;
  title: string;
  snippet: string;
  isRanking: boolean;
  searchVolume?: number;
}

class ValueSerpService {
  private apiKey: string;
  private baseUrl = 'https://api.valueserp.com/search';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.VALUESERP_API_KEY || '';
  }

  async checkKeywordRanking(keyword: string, domain: string, location = 'United Kingdom'): Promise<RealKeywordData | null> {
    if (!this.apiKey) {
      console.warn('ValueSerp API key not provided - skipping real ranking check');
      return null;
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        q: keyword,
        location: location,
        google_domain: 'google.co.uk',
        gl: 'uk',
        hl: 'en',
        num: '100' // Check top 100 results
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`ValueSerp API error: ${response.status}`);
      }

      const data: ValueSerpResponse = await response.json();
      
      console.log('ValueSerp API Request Success:', data.request_info?.success);
      console.log('ValueSerp API Organic Results Count:', data.organic_results?.length || 0);
      
      if (!data.request_info?.success) {
        console.log('ValueSerp API full response:', JSON.stringify(data, null, 2));
        throw new Error(`ValueSerp search failed: API request unsuccessful`);
      }
      
      if (!data.organic_results || data.organic_results.length === 0) {
        console.log('No organic results found for keyword:', keyword);
      }

      // Clean domain for comparison
      const targetDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
      
      // Find the domain in search results
      const result = data.organic_results.find(result => {
        const resultDomain = result.link.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
        return resultDomain.includes(targetDomain) || targetDomain.includes(resultDomain.split('/')[0]);
      });

      if (result) {
        return {
          keyword,
          position: result.position,
          title: result.title,
          snippet: result.snippet,
          isRanking: true,
          searchVolume: this.estimateSearchVolume(keyword) // Fallback estimation
        };
      }

      return {
        keyword,
        position: 0,
        title: '',
        snippet: '',
        isRanking: false,
        searchVolume: this.estimateSearchVolume(keyword)
      };

    } catch (error) {
      console.error(`Error checking keyword "${keyword}" for domain "${domain}":`, error);
      return null;
    }
  }

  async checkMultipleKeywords(keywords: string[], domain: string, location = 'United Kingdom'): Promise<RealKeywordData[]> {
    const results: RealKeywordData[] = [];
    
    // Process keywords in batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      
      const batchPromises = batch.map(keyword => 
        this.checkKeywordRanking(keyword, domain, location)
      );
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else {
            // Add fallback data for failed requests
            results.push({
              keyword: batch[index],
              position: 0,
              title: '',
              snippet: '',
              isRanking: false,
              searchVolume: this.estimateSearchVolume(batch[index])
            });
          }
        });
        
        // Rate limiting: wait between batches
        if (i + batchSize < keywords.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
        
      } catch (error) {
        console.error('Batch processing error:', error);
      }
    }
    
    return results;
  }

  private estimateSearchVolume(keyword: string): number {
    // Simple heuristic for search volume estimation
    const baseVolume = 100;
    const lengthFactor = keyword.length > 20 ? 0.5 : 1;
    const wordCountFactor = keyword.split(' ').length > 3 ? 0.7 : 1;
    
    return Math.floor(baseVolume * lengthFactor * wordCountFactor * (0.5 + Math.random()));
  }

  // Get keyword suggestions based on domain content
  async getKeywordSuggestions(domain: string, content: string): Promise<string[]> {
    // Extract potential keywords from content
    const suggestions = this.extractKeywordsFromContent(content);
    
    // Add common business keywords based on domain
    const additionalKeywords = this.generateBusinessKeywords(domain);
    
    // Combine and filter to business-relevant terms
    const allKeywords = [...suggestions, ...additionalKeywords];
    const businessKeywords = allKeywords.filter(keyword => {
      return keyword.length > 3 && 
             keyword.length < 50 &&
             !this.isGenericTerm(keyword) &&
             this.isBusinessRelevant(keyword);
    });
    
    // Remove duplicates
    const uniqueKeywords = [...new Set(businessKeywords)];
    
    return uniqueKeywords.slice(0, 30); // Increase to 30 suggestions
  }

  private generateBusinessKeywords(domain: string): string[] {
    const keywords = [];
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Extract potential business name from domain
    const domainParts = cleanDomain.replace(/\.(com|co\.uk|org|net|info)$/, '').split(/[-_]/);
    const businessName = domainParts.filter(part => part.length > 2).join(' ');
    
    // Marketing agency keywords
    if (cleanDomain.includes('marketing') || cleanDomain.includes('agency') || cleanDomain.includes('digital')) {
      keywords.push(
        `${businessName} digital marketing`,
        `${businessName} marketing agency`,
        'digital marketing services uk',
        'seo services uk',
        'ppc management services',
        'social media marketing agency',
        'content marketing strategy',
        'brand strategy consulting',
        'digital marketing consultant',
        'online marketing campaigns',
        'marketing automation services',
        'conversion rate optimization'
      );
    }
    
    // Consulting/professional services
    if (cleanDomain.includes('consulting') || cleanDomain.includes('consultant') || cleanDomain.includes('professional')) {
      keywords.push(
        `${businessName} consulting services`,
        'business strategy consulting',
        'management consulting uk',
        'digital transformation consulting',
        'business process improvement',
        'strategic planning services',
        'operational excellence consulting'
      );
    }
    
    // Technology/development
    if (cleanDomain.includes('tech') || cleanDomain.includes('dev') || cleanDomain.includes('software')) {
      keywords.push(
        `${businessName} technology solutions`,
        'software development services',
        'custom software development',
        'web application development',
        'digital solution provider',
        'technology consulting services'
      );
    }
    
    // Finance/accounting
    if (cleanDomain.includes('finance') || cleanDomain.includes('accounting') || cleanDomain.includes('tax')) {
      keywords.push(
        `${businessName} accounting services`,
        'financial consulting services',
        'tax advisory services',
        'bookkeeping services uk',
        'financial planning consultancy'
      );
    }
    
    // Legal services
    if (cleanDomain.includes('legal') || cleanDomain.includes('law') || cleanDomain.includes('solicitor')) {
      keywords.push(
        `${businessName} legal services`,
        'commercial law firm',
        'business legal advice',
        'corporate legal services',
        'legal consultation services'
      );
    }
    
    // General business keywords with business name
    keywords.push(
      `${businessName} services`,
      `${businessName} solutions`,
      `${businessName} uk`,
      'professional services uk',
      'business solutions provider',
      'expert business advice',
      'industry specialists uk'
    );
    
    // Filter out empty or too short keywords
    return keywords.filter(keyword => keyword.trim().length > 5 && !keyword.includes('undefined'));
  }

  private extractKeywordsFromContent(content: string): string[] {
    const keywords = new Set<string>();
    const normalizedContent = content.toLowerCase();
    
    // Extract service-related phrases with better patterns
    const servicePatterns = [
      /([a-z]+(?:\s+[a-z]+)*)\s+services?/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+solutions?/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+consulting/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+agency/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+specialists?/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+experts?/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+management/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+strategy/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+development/gi,
      /([a-z]+(?:\s+[a-z]+)*)\s+optimization/gi
    ];
    
    // Extract business capability phrases
    const capabilityPatterns = [
      /we\s+(?:provide|offer|deliver|specialize in)\s+([a-z\s]{5,40})/gi,
      /our\s+([a-z\s]{3,30})\s+services?/gi,
      /expert\s+([a-z\s]{3,30})/gi,
      /professional\s+([a-z\s]{3,30})/gi,
      /(?:leading|top|best)\s+([a-z\s]{3,30})/gi
    ];
    
    // Extract industry-specific terms
    const industryPatterns = [
      /(?:digital|online|web|mobile|cloud|software|technology|tech)\s+([a-z\s]{3,30})/gi,
      /(?:marketing|advertising|branding|seo|ppc|sem|social media)\s+([a-z\s]{3,30})/gi,
      /(?:business|corporate|commercial|enterprise)\s+([a-z\s]{3,30})/gi,
      /(?:financial|accounting|legal|healthcare|education)\s+([a-z\s]{3,30})/gi
    ];
    
    const allPatterns = [...servicePatterns, ...capabilityPatterns, ...industryPatterns];
    
    allPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Extract the main business term (group 1 if capturing group exists)
          const cleanMatch = match.replace(/^(we|our|expert|professional|leading|top|best)\s+/i, '')
                                  .replace(/\s+(services?|solutions?|consulting|agency|specialists?|experts?|management|strategy|development|optimization)$/i, '')
                                  .trim().toLowerCase();
          
          if (cleanMatch.length > 3 && cleanMatch.length < 40 && 
              !this.isGenericTerm(cleanMatch) && 
              this.isBusinessRelevant(cleanMatch)) {
            keywords.add(cleanMatch);
            
            // Also add the full phrase if it's business-relevant
            const fullPhrase = match.trim().toLowerCase();
            if (fullPhrase.length > 5 && fullPhrase.length < 50 && 
                !this.isGenericTerm(fullPhrase) && 
                this.isBusinessRelevant(fullPhrase)) {
              keywords.add(fullPhrase);
            }
          }
        });
      }
    });
    
    // Extract title and heading content
    const titleMatches = content.match(/<title[^>]*>([^<]+)<\/title>/gi);
    if (titleMatches) {
      titleMatches.forEach(title => {
        const clean = title.replace(/<[^>]*>/g, '').trim().toLowerCase();
        if (clean.length > 10 && clean.length < 60) {
          keywords.add(clean);
        }
      });
    }
    
    const headingMatches = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
    if (headingMatches) {
      headingMatches.forEach(heading => {
        const clean = heading.replace(/<[^>]*>/g, '').trim().toLowerCase();
        if (clean.length > 5 && clean.length < 50 && 
            !this.isGenericTerm(clean) && 
            this.isBusinessRelevant(clean)) {
          keywords.add(clean);
        }
      });
    }
    
    return Array.from(keywords);
  }

  private isGenericTerm(keyword: string): boolean {
    const genericTerms = [
      'services', 'solutions', 'company', 'business', 'professional',
      'expert', 'specialists', 'team', 'about us', 'contact us',
      'home page', 'latest news', 'latest blogs', 'follow us',
      'find us', 'call us', 'email us', 'get in touch', 'learn more',
      'click here', 'read more', 'see more', 'view more', 'more info',
      'our team', 'our story', 'our mission', 'privacy policy',
      'terms conditions', 'cookie policy', 'sitemap', 'copyright',
      'all rights reserved', 'back to top', 'scroll down', 'menu',
      'navigation', 'header', 'footer', 'sidebar', 'content',
      'page', 'website', 'site', 'web', 'online', 'internet',
      'social media', 'facebook', 'twitter', 'linkedin', 'instagram',
      'we offer', 'we provide', 'we are', 'we have', 'this is',
      'that is', 'here is', 'there is', 'it is', 'you are',
      'close services', 'open services'
    ];
    
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    // Direct match
    if (genericTerms.includes(normalizedKeyword)) return true;
    
    // Partial match for terms within keyword
    return genericTerms.some(term => normalizedKeyword.includes(term));
  }

  private isBusinessRelevant(keyword: string): boolean {
    const businessIndicators = [
      'marketing', 'digital', 'seo', 'ppc', 'advertising', 'branding',
      'design', 'development', 'consulting', 'strategy', 'management',
      'legal', 'accounting', 'finance', 'healthcare', 'technology',
      'agency', 'consultant', 'specialist', 'optimization', 'analytics',
      'campaign', 'conversion', 'leads', 'sales', 'growth', 'roi'
    ];
    
    const normalizedKeyword = keyword.toLowerCase();
    
    // Must contain at least one business indicator
    const hasBusinessTerm = businessIndicators.some(indicator => 
      normalizedKeyword.includes(indicator)
    );
    
    // Must not be purely generic
    const isNotGeneric = !this.isGenericTerm(keyword);
    
    // Must be reasonable length
    const isReasonableLength = keyword.length >= 5 && keyword.length <= 50;
    
    return hasBusinessTerm && isNotGeneric && isReasonableLength;
  }
}

export { ValueSerpService, type RealKeywordData };