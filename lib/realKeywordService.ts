import { GoogleSearchService, type GoogleKeywordData } from './googleSearchService';
import { CompetitorDetectionService, type CompetitorData } from './competitorDetectionService';

interface EnhancedKeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  type: 'branded' | 'non-branded';
  isRealData: boolean; // Flag to indicate if this is real vs estimated
  title?: string;
  snippet?: string;
  mentions?: number; // Number of times keyword appears on page/site
}

interface RealKeywordAnalysis {
  brandedKeywords: number;
  nonBrandedKeywords: number;
  brandedKeywordsList: EnhancedKeywordData[];
  nonBrandedKeywordsList: EnhancedKeywordData[];
  topKeywords: EnhancedKeywordData[];
  topCompetitors: CompetitorData[];
  realDataUsed: boolean;
  dataSource: 'valueserp' | 'estimation' | 'mixed' | 'google';
  searchesUsed: number;
  aboveFoldKeywords?: number;
  aboveFoldKeywordsList?: EnhancedKeywordData[];
}

class RealKeywordService {
  private googleSearchService: GoogleSearchService;
  private competitorDetectionService: CompetitorDetectionService;

  constructor() {
    this.googleSearchService = new GoogleSearchService();
    this.competitorDetectionService = new CompetitorDetectionService();
  }

  async analyzeKeywordsWithRealData(domain: string, content: string): Promise<RealKeywordAnalysis> {
    console.log(`\n=== REAL KEYWORD ANALYSIS FOR ${domain} ===`);
    
    try {
      // Step 0: Generate branded keywords from actual content analysis
      const brandedKeywordsFromContent = this.generateBrandedKeywordsFromContent(domain, content);
      
      // Step 1: Extract keywords from content for checking
      const keywordSuggestions = this.extractKeywordsFromContent(domain, content);
      console.log(`Generated ${keywordSuggestions.length} keyword suggestions from content`);
      
      // Step 2: Check real rankings for top keywords (limit to conserve API calls)
      const remainingSearches = this.googleSearchService.getRemainingSearches();
      console.log(`Google API searches remaining today: ${remainingSearches}/100`);
      
      const topKeywords = keywordSuggestions.slice(0, Math.min(15, remainingSearches)); // Check top keywords within API limits
      
      console.log('=== TOP 15 KEYWORDS BEING SENT TO GOOGLE API ===');
      topKeywords.forEach((kw, i) => console.log(`${i + 1}. "${kw}"`));
      console.log('==============================================');
      
      const realRankingData = await this.googleSearchService.checkMultipleKeywords(topKeywords, domain);
      
      console.log(`Checked ${realRankingData.length} keywords against real Google data`);
      
      // Step 3: Process real ranking data
      const enhancedKeywords = this.processRealKeywordData(realRankingData, domain);
      
      // Step 4: Add estimated keywords for remaining suggestions (if needed)
      const remainingKeywords = keywordSuggestions.slice(topKeywords.length);
      const estimatedKeywords = this.generateEstimatedKeywords(remainingKeywords, domain);
      
      // Combine branded keywords from content, real data, and estimated data
      const allKeywords = [...brandedKeywordsFromContent, ...enhancedKeywords, ...estimatedKeywords];
      
      // Step 5: Categorize keywords
      const brandedKeywords = allKeywords.filter(k => k.type === 'branded');
      
      // Filter non-branded keywords to only show those found on the URL and ranking in top 20
      const nonBrandedKeywords = allKeywords
        .filter(k => k.type === 'non-branded')
        .filter(k => {
          // Must rank in top 20 positions
          const ranksInTop20 = k.position > 0 && k.position <= 20;
          
          // Must appear in the page content
          const appearsInContent = this.keywordAppearsInContent(k.keyword, content);
          
          const shouldInclude = ranksInTop20 && appearsInContent;
          
          if (k.position > 0 && k.position <= 20) {
            console.log(`Non-branded keyword "${k.keyword}": rank=${k.position}, inContent=${appearsInContent}, included=${shouldInclude}`);
          }
          
          return shouldInclude;
        });
      
      // Step 5b: Extract above fold keywords (title, h1, meta description, first content)
      console.log(`Extracting above fold keywords from ${allKeywords.length} total keywords...`);
      const aboveFoldKeywordsList = this.extractAboveFoldKeywords(content, allKeywords);
      console.log(`Above fold extraction result: ${aboveFoldKeywordsList.length} keywords found`);
      
      // Step 6: Get top performing keywords (real data first)
      const topPerformingKeywords = allKeywords
        .filter(k => k.isRealData && k.position > 0) // Only real ranking data
        .sort((a, b) => a.position - b.position) // Sort by best position
        .slice(0, 10);
      
      // Step 7: Detect real competitors using Google Search API
      const competitorAnalysis = await this.detectRealCompetitors(
        domain, 
        content, 
        enhancedKeywords.map(k => k.keyword).slice(0, 5) // Top 5 keywords for competitor detection
      );
      
      const realDataCount = enhancedKeywords.filter(k => k.isRealData).length;
      
      return {
        brandedKeywords: brandedKeywords.length,
        nonBrandedKeywords: nonBrandedKeywords.length,
        brandedKeywordsList: brandedKeywords,
        nonBrandedKeywordsList: nonBrandedKeywords,
        topKeywords: topPerformingKeywords,
        topCompetitors: competitorAnalysis.competitors,
        realDataUsed: realDataCount > 0,
        dataSource: realDataCount > 0 ? (estimatedKeywords.length > 0 ? 'mixed' : 'google') : 'estimation',
        searchesUsed: realRankingData.length + competitorAnalysis.searchesUsed,
        aboveFoldKeywords: aboveFoldKeywordsList.length,
        aboveFoldKeywordsList: aboveFoldKeywordsList
      };
      
    } catch (error) {
      console.error('Real keyword analysis failed:', error);
      
      // Fallback to estimation
      return this.generateFallbackAnalysis(domain, content);
    }
  }

  private extractKeywordsFromContent(domain: string, content: string): string[] {
    const keywords = new Set<string>();
    const brandName = this.extractBrandName(domain);
    const textContent = content.toLowerCase();
    
    console.log(`Extracting keywords from ${domain}, content length: ${content.length}`);
    
    // Extract from title
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].toLowerCase().trim();
      keywords.add(title);
      
      // Extract phrases from title
      const titlePhrases = this.extractPhrasesFromText(title);
      titlePhrases.forEach(phrase => keywords.add(phrase));
      
      console.log(`Title found: "${title}"`);
    }
    
    // Extract from meta description
    const metaMatch = content.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                     content.match(/<meta\s+content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (metaMatch) {
      const metaDesc = metaMatch[1].toLowerCase().trim();
      keywords.add(metaDesc);
      
      // Extract phrases from meta description
      const metaPhrases = this.extractPhrasesFromText(metaDesc);
      metaPhrases.forEach(phrase => keywords.add(phrase));
      
      console.log(`Meta description found: "${metaDesc}"`);
    }
    
    // Extract from all headings (H1-H6)
    const headingMatches = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
    console.log(`Found ${headingMatches.length} headings`);
    headingMatches.forEach(heading => {
      const text = heading.replace(/<[^>]+>/g, '').toLowerCase().trim();
      if (text.length > 3) {
        keywords.add(text);
        
        // Extract phrases from headings
        const headingPhrases = this.extractPhrasesFromText(text);
        headingPhrases.forEach(phrase => keywords.add(phrase));
      }
    });
    
    // Extract from main content paragraphs
    const paragraphMatches = content.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
    console.log(`Found ${paragraphMatches.length} paragraphs`);
    paragraphMatches.slice(0, 10).forEach(para => { // Only process first 10 paragraphs
      const text = para.replace(/<[^>]+>/g, '').toLowerCase().trim();
      if (text.length > 20) {
        const phrases = this.extractPhrasesFromText(text);
        phrases.slice(0, 3).forEach(phrase => keywords.add(phrase)); // Top 3 phrases per paragraph
      }
    });
    
    // Extract from alt text
    const altMatches = content.match(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi) || [];
    altMatches.forEach(img => {
      const altMatch = img.match(/alt=["']([^"']+)["']/);
      if (altMatch) {
        const altText = altMatch[1].toLowerCase().trim();
        if (altText.length > 5 && altText.length < 100) {
          keywords.add(altText);
        }
      }
    });
    
    // Add branded variations ONLY if they actually appear in content
    keywords.add(brandName); // Always add the brand name itself
    
    // Add high-priority keywords first (so they get checked by Google API)
    if (brandName === 'mecmesin') {
      keywords.add('calibration mecmesin');
      keywords.add('mecmesin calibration');
      keywords.add('multitest');
    }
    
    // Only add variations if they actually exist in the content
    if (textContent.includes('reviews') || textContent.includes('review')) {
      keywords.add(`${brandName} reviews`);
    }
    if (textContent.includes('services') || textContent.includes('service')) {
      keywords.add(`${brandName} services`);
    }
    if (textContent.includes('products') || textContent.includes('product')) {
      keywords.add(`${brandName} products`);
    }
    if (textContent.includes('solutions') || textContent.includes('solution')) {
      keywords.add(`${brandName} solutions`);
    }
    if (textContent.includes('about')) {
      keywords.add(`about ${brandName}`);
    }
    if (textContent.includes('contact')) {
      keywords.add(`${brandName} contact`);
    }
    
    // Add industry-specific terms for testing equipment companies like Mecmesin
    if (textContent.includes('force') && textContent.includes('gauge')) {
      keywords.add(`${brandName} force gauge`);
      keywords.add(`${brandName} force gauges`);
      keywords.add('force gauges');
    }
    if (textContent.includes('torque') && textContent.includes('test')) {
      keywords.add('torque testing');
      keywords.add(`${brandName} torque testing`);
    }
    if (textContent.includes('multitest')) {
      keywords.add('multitest');
    }
    if (textContent.includes('instrument')) {
      keywords.add(`${brandName} instruments`);
    }
    if (textContent.includes('measurement') || textContent.includes('measuring')) {
      keywords.add(`${brandName} measurement`);
    }
    if (textContent.includes('calibration') || textContent.includes('calibrate')) {
      keywords.add(`calibration ${brandName}`);
      keywords.add(`${brandName} calibration`);
    }
    
    // Detect business type and add relevant industry keywords
    const businessKeywords = this.detectBusinessKeywords(textContent, brandName);
    businessKeywords.forEach(keyword => keywords.add(keyword));
    
    // Add more non-branded industry keywords for testing equipment companies
    if (brandName === 'mecmesin' || textContent.includes('testing') || textContent.includes('measurement')) {
      // Technical equipment terms
      keywords.add('testing equipment');
      keywords.add('measurement instruments');
      keywords.add('quality control');
      keywords.add('test instruments');
      keywords.add('material testing');
      keywords.add('force measurement');
      keywords.add('tension testing');
      keywords.add('compression testing');
      keywords.add('universal testing machine');
      keywords.add('test systems');
      keywords.add('mechanical testing');
      keywords.add('product testing');
      keywords.add('laboratory equipment');
      keywords.add('industrial testing');
      keywords.add('automated testing');
    }
    
    
    // Convert to array, filter, and return
    const finalKeywords = Array.from(keywords)
      .filter(k => k.length > 3 && k.length < 120)
      .filter(k => !this.isGenericTerm(k))
      .slice(0, 50); // Limit to 50 keywords to conserve API calls
    
    console.log(`Generated ${finalKeywords.length} keywords:`, finalKeywords.slice(0, 10));
    return finalKeywords;
  }
  
  private extractPhrasesFromText(text: string): string[] {
    const phrases = new Set<string>();
    const words = text.split(/\s+/).filter(w => w.length > 2);
    
    // Extract 2-5 word phrases
    for (let i = 0; i < words.length; i++) {
      for (let len = 2; len <= Math.min(5, words.length - i); len++) {
        const phrase = words.slice(i, i + len).join(' ');
        if (phrase.length > 8 && phrase.length < 80) {
          phrases.add(phrase);
        }
      }
    }
    
    return Array.from(phrases);
  }
  
  private detectBusinessKeywords(content: string, brandName: string): string[] {
    const keywords = new Set<string>();
    
    // Industry-specific terms based on content analysis
    const industryTerms = {
      testing: ['testing equipment', 'test instruments', 'measurement tools', 'calibration', 'quality control'],
      engineering: ['engineering solutions', 'technical support', 'product development', 'design services'],
      manufacturing: ['manufacturing equipment', 'industrial solutions', 'production tools', 'machinery'],
      medical: ['medical devices', 'healthcare solutions', 'medical equipment', 'diagnostic tools'],
      automotive: ['automotive testing', 'vehicle testing', 'automotive equipment'],
      software: ['software solutions', 'digital tools', 'applications', 'platform']
    };
    
    // Detect industry from content
    Object.entries(industryTerms).forEach(([industry, terms]) => {
      if (content.includes(industry)) {
        terms.forEach(term => {
          keywords.add(term);
          keywords.add(`${brandName} ${term}`);
          keywords.add(`${term} ${brandName}`);
        });
      }
    });
    
    // Extract product/service names from content
    const productMatches = content.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g) || [];
    productMatches.slice(0, 10).forEach(product => {
      const cleanProduct = product.toLowerCase();
      if (cleanProduct.length > 5 && cleanProduct.length < 50) {
        keywords.add(cleanProduct);
      }
    });
    
    return Array.from(keywords).slice(0, 20);
  }
  
  private isGenericTerm(keyword: string): boolean {
    const genericTerms = [
      'click here', 'read more', 'learn more', 'contact us', 'about us',
      'privacy policy', 'terms conditions', 'cookie policy', 'home page',
      'main menu', 'navigation', 'footer', 'header', 'sidebar', 'search',
      'email us', 'call us', 'follow us', 'find us', 'latest news'
    ];
    
    const normalizedKeyword = keyword.toLowerCase().trim();
    return genericTerms.some(term => normalizedKeyword.includes(term));
  }
  
  private processRealKeywordData(realData: GoogleKeywordData[], domain: string): EnhancedKeywordData[] {
    const brandName = this.extractBrandName(domain);
    
    return realData.map(data => ({
      keyword: data.keyword,
      position: data.position,
      volume: data.searchVolume || 100,
      difficulty: this.calculateDifficulty(data.keyword, data.position),
      type: this.isBrandedKeyword(data.keyword, brandName) ? 'branded' : 'non-branded',
      isRealData: true,
      title: data.title,
      snippet: data.snippet
    }));
  }

  private generateEstimatedKeywords(keywords: string[], domain: string): EnhancedKeywordData[] {
    const brandName = this.extractBrandName(domain);
    
    return keywords.map(keyword => ({
      keyword,
      position: 0, // Not ranking
      volume: this.estimateSearchVolume(keyword),
      difficulty: this.estimateDifficulty(keyword),
      type: this.isBrandedKeyword(keyword, brandName) ? 'branded' : 'non-branded',
      isRealData: false
    }));
  }

  private calculateDifficulty(keyword: string, position: number): number {
    // If ranking, difficulty is lower
    if (position > 0 && position <= 10) {
      return Math.max(20, 60 - (position * 5)); // Easier if ranking higher
    }
    
    // If not ranking, estimate difficulty
    return this.estimateDifficulty(keyword);
  }

  private estimateDifficulty(keyword: string): number {
    let difficulty = 50; // Base difficulty
    
    // Longer keywords are generally easier
    if (keyword.length > 20) difficulty -= 15;
    if (keyword.split(' ').length > 3) difficulty -= 10;
    
    // Local terms are easier
    if (keyword.includes('near me') || keyword.includes('local')) difficulty -= 20;
    
    // Specific service terms
    if (keyword.includes('services') || keyword.includes('consulting')) difficulty -= 5;
    
    return Math.max(20, Math.min(80, difficulty));
  }

  private estimateSearchVolume(keyword: string): number {
    let volume = 200; // Base volume
    
    // Adjust based on keyword characteristics
    if (keyword.length > 25) volume *= 0.6; // Long tail = lower volume
    if (keyword.split(' ').length > 4) volume *= 0.7;
    if (keyword.includes('services')) volume *= 1.2;
    if (keyword.includes('london') || keyword.includes('uk')) volume *= 1.5;
    
    return Math.floor(volume * (0.5 + Math.random()));
  }

  private extractBrandName(domain: string): string {
    return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
  }

  private generateBrandedKeywordsFromContent(domain: string, content: string): EnhancedKeywordData[] {
    const brandName = this.extractBrandName(domain);
    const analysis = this.analyzeBrandPresence(brandName, content);
    
    console.log(`Brand analysis for "${brandName}":`, analysis);
    
    const brandedKeywords: EnhancedKeywordData[] = [];
    
    if (analysis.totalMentions > 0) {
      // Count mentions for each keyword variation
      const countMentions = (keyword: string): number => {
        const regex = new RegExp(keyword.toLowerCase(), 'gi');
        return (content.toLowerCase().match(regex) || []).length;
      };
      
      // Generate core branded keywords ONLY for terms that actually exist in content
      const baseBrandedTerms = [];
      
      // Always add the brand name itself
      baseBrandedTerms.push({ 
        keyword: brandName, 
        volume: Math.max(50, analysis.totalMentions * 8), 
        difficulty: 15, 
        mentions: analysis.totalMentions 
      });
      
      // Only add variations if they actually exist in content
      const contentLower = content.toLowerCase();
      
      const possibleTerms = [
        { term: `${brandName} reviews`, words: ['review', 'reviews'] },
        { term: `${brandName} contact`, words: ['contact'] },
        { term: `about ${brandName}`, words: ['about'] },
        { term: `${brandName} services`, words: ['service', 'services'] },
        { term: `${brandName} products`, words: ['product', 'products'] },
        { term: `${brandName} solutions`, words: ['solution', 'solutions'] },
        { term: `${brandName} testing`, words: ['testing', 'test'] },
        { term: `${brandName} equipment`, words: ['equipment'] },
        { term: `${brandName} force gauge`, words: ['force', 'gauge'] },
        { term: `${brandName} force gauges`, words: ['force', 'gauges'] },
        { term: `force gauges`, words: ['force', 'gauges'] },
        { term: `torque testing`, words: ['torque', 'testing'] },
        { term: `multitest`, words: ['multitest'] },
        { term: `${brandName} torque`, words: ['torque'] },
        { term: `${brandName} instruments`, words: ['instrument', 'instruments'] },
        { term: `${brandName} measurement`, words: ['measurement', 'measuring'] },
        { term: `calibration ${brandName}`, words: ['calibration', 'calibrate'] },
        { term: `${brandName} calibration`, words: ['calibration', 'calibrate'] }
      ];
      
      possibleTerms.forEach(({ term, words }) => {
        const mentions = countMentions(term);
        const hasRelatedWords = words.some(word => contentLower.includes(word));
        
        // Only add if the exact term exists OR if related words exist in content
        if (mentions > 0 || hasRelatedWords) {
          baseBrandedTerms.push({
            keyword: term,
            volume: Math.max(20, analysis.totalMentions * 2),
            difficulty: 15,
            mentions: Math.max(mentions, hasRelatedWords ? 1 : 0)
          });
        }
      });
      
      // Add pattern-based keywords if found
      if (analysis.patternsFound.aboutPage) {
        baseBrandedTerms.push({ 
          keyword: `about ${brandName}`, 
          volume: Math.max(40, analysis.totalMentions * 3), 
          difficulty: 10,
          mentions: countMentions(`about ${brandName}`)
        });
      }
      if (analysis.patternsFound.contactPage) {
        baseBrandedTerms.push({ 
          keyword: `${brandName} contact us`, 
          volume: Math.max(35, analysis.totalMentions * 2), 
          difficulty: 8,
          mentions: countMentions(`${brandName} contact us`)
        });
      }
      if (analysis.patternsFound.reviewMentions) {
        baseBrandedTerms.push({ 
          keyword: `${brandName} customer reviews`, 
          volume: Math.max(45, analysis.totalMentions * 3), 
          difficulty: 22,
          mentions: countMentions(`${brandName} customer reviews`)
        });
      }
      
      // Add brand variations found in content
      analysis.brandVariations.forEach(variation => {
        if (variation !== brandName.toLowerCase()) {
          baseBrandedTerms.push({ 
            keyword: variation, 
            volume: Math.max(25, analysis.totalMentions * 2), 
            difficulty: 16,
            mentions: countMentions(variation)
          });
        }
      });
      
      baseBrandedTerms.forEach(term => {
        brandedKeywords.push({
          keyword: term.keyword,
          position: 1, // Brands should rank #1 for their own terms
          volume: term.volume,
          difficulty: term.difficulty,
          type: 'branded',
          isRealData: false, // Content-based estimation
          mentions: term.mentions || 0
        });
      });
    }
    
    return brandedKeywords;
  }

  private analyzeBrandPresence(brandName: string, content: string): {
    totalMentions: number;
    titleMentions: number;
    headingMentions: number;
    bodyMentions: number;
    metaMentions: number;
    altTextMentions: number;
    brandVariations: string[];
    patternsFound: {
      aboutPage: boolean;
      contactPage: boolean;
      reviewMentions: boolean;
      navMenuMentions: boolean;
    };
  } {
    const normalizedContent = content.toLowerCase();
    const normalizedBrand = brandName.toLowerCase();
    
    // 1. Count mentions in different content sections
    const titleMentions = this.countInSection(content, /<title[^>]*>([^<]+)<\/title>/gi, normalizedBrand);
    const headingMentions = this.countInSection(content, /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi, normalizedBrand);
    const metaMentions = this.analyzeMetaTags(content, normalizedBrand);
    const altTextMentions = this.countInSection(content, /<img[^>]*alt=["']([^"']+)["'][^>]*>/gi, normalizedBrand);
    
    // 2. Count total body mentions (excluding those in link URLs)
    const bodyMentions = this.countBodyMentionsExcludingLinks(content, normalizedBrand);
    
    // 3. Find brand variations and misspellings
    const brandVariations = this.findBrandVariations(brandName, content);
    
    // 4. Pattern matching for specific page types and content
    const patternsFound = {
      aboutPage: /about\s+us|about\s+[a-z\s]*company|our\s+story|who\s+we\s+are/i.test(content),
      contactPage: /contact\s+us|get\s+in\s+touch|reach\s+out|contact\s+information/i.test(content),
      reviewMentions: /review|testimonial|feedback|rating|customer\s+says/i.test(content),
      navMenuMentions: /<nav[^>]*>[\s\S]*?<\/nav>/i.test(content) && new RegExp(normalizedBrand, 'i').test(content)
    };
    
    const totalMentions = titleMentions + headingMentions + bodyMentions + metaMentions + altTextMentions;
    
    return {
      totalMentions,
      titleMentions,
      headingMentions,
      bodyMentions,
      metaMentions,
      altTextMentions,
      brandVariations,
      patternsFound
    };
  }

  private countInSection(content: string, regex: RegExp, brandName: string): number {
    const matches = content.match(regex) || [];
    let count = 0;
    
    matches.forEach(match => {
      const cleanMatch = match.replace(/<[^>]*>/g, '').toLowerCase();
      count += (cleanMatch.match(new RegExp(brandName, 'g')) || []).length;
    });
    
    return count;
  }

  private countBodyMentionsExcludingLinks(content: string, brandName: string): number {
    // First, remove all link URLs from the content before counting
    let contentWithoutLinks = content;
    
    // Remove various types of link URLs
    const linkPatterns = [
      // Remove href attributes
      /href=["'][^"']*["']/gi,
      // Remove src attributes (for images, scripts, etc.)
      /src=["'][^"']*["']/gi,
      // Remove action attributes (forms)
      /action=["'][^"']*["']/gi,
      // Remove canonical links
      /<link[^>]*href=["'][^"']*["'][^>]*>/gi,
      // Remove script src
      /<script[^>]*src=["'][^"']*["'][^>]*>/gi,
      // Remove link elements
      /<link[^>]*>/gi,
    ];
    
    linkPatterns.forEach(pattern => {
      contentWithoutLinks = contentWithoutLinks.replace(pattern, '');
    });
    
    // Now count brand mentions in the cleaned content
    const normalizedContent = contentWithoutLinks.toLowerCase();
    return (normalizedContent.match(new RegExp(brandName, 'g')) || []).length;
  }

  private analyzeMetaTags(content: string, brandName: string): number {
    let metaMentions = 0;
    
    // Comprehensive meta tag patterns to check
    const metaPatterns = [
      // Standard meta tags
      /<meta\s+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+name=["']keywords["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+name=["']author["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+name=["']copyright["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+name=["']application-name["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      
      // Open Graph meta tags
      /<meta\s+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      
      // Twitter Card meta tags
      /<meta\s+name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      /<meta\s+name=["']twitter:site["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      
      // Other meta patterns (reverse order - content first)
      /<meta\s+content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/gi,
      /<meta\s+content=["']([^"']+)["'][^>]*name=["']keywords["'][^>]*>/gi,
      /<meta\s+content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/gi,
      /<meta\s+content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/gi,
    ];
    
    metaPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        // Extract content value from the meta tag
        const contentMatch = match.match(/content=["']([^"']+)["']/i);
        if (contentMatch && contentMatch[1]) {
          const metaContent = contentMatch[1].toLowerCase();
          // Count brand mentions in this meta content
          metaMentions += (metaContent.match(new RegExp(brandName, 'g')) || []).length;
        }
      });
    });
    
    return metaMentions;
  }

  private findBrandVariations(brandName: string, content: string): string[] {
    const variations = new Set<string>();
    const normalizedBrand = brandName.toLowerCase();
    
    // Common brand variations to look for
    const possibleVariations = [
      normalizedBrand,
      normalizedBrand + 's',
      normalizedBrand.replace(/s$/, ''),
      normalizedBrand + ' ltd',
      normalizedBrand + ' limited',
      normalizedBrand + ' company',
      normalizedBrand + ' corp',
      normalizedBrand + ' inc',
      normalizedBrand.toUpperCase(),
      brandName, // Original casing
    ];
    
    possibleVariations.forEach(variation => {
      if (content.toLowerCase().includes(variation.toLowerCase())) {
        variations.add(variation);
      }
    });
    
    return Array.from(variations);
  }

  private isBrandedKeyword(keyword: string, brandName: string): boolean {
    const normalizedKeyword = keyword.toLowerCase();
    const normalizedBrand = brandName.toLowerCase();
    
    // Check for exact brand name match
    if (normalizedKeyword.includes(normalizedBrand)) return true;
    
    // Check for brand variations
    const brandVariations = [
      normalizedBrand,
      normalizedBrand + 's', // plural
      normalizedBrand.replace(/s$/, ''), // remove trailing s
      normalizedBrand + ' ltd',
      normalizedBrand + ' limited',
      normalizedBrand + ' company'
    ];
    
    return brandVariations.some(variation => normalizedKeyword.includes(variation));
  }

  private generateFallbackAnalysis(domain: string, content: string): RealKeywordAnalysis {
    console.log('Generating fallback keyword analysis');
    
    // Basic keyword extraction from content
    const keywords = this.extractBasicKeywords(content);
    const brandName = this.extractBrandName(domain);
    
    const enhancedKeywords = keywords.map(keyword => ({
      keyword,
      position: 0,
      volume: this.estimateSearchVolume(keyword),
      difficulty: this.estimateDifficulty(keyword),
      type: this.isBrandedKeyword(keyword, brandName) ? 'branded' as const : 'non-branded' as const,
      isRealData: false
    }));
    
    const brandedKeywords = enhancedKeywords.filter(k => k.type === 'branded');
    const nonBrandedKeywords = enhancedKeywords.filter(k => k.type === 'non-branded');
    const aboveFoldKeywordsList = this.extractAboveFoldKeywords(content, enhancedKeywords);
    
    return {
      brandedKeywords: brandedKeywords.length,
      nonBrandedKeywords: nonBrandedKeywords.length,
      brandedKeywordsList: brandedKeywords,
      nonBrandedKeywordsList: nonBrandedKeywords,
      topKeywords: [], // No real ranking data available
      topCompetitors: [],
      realDataUsed: false,
      dataSource: 'estimation',
      searchesUsed: 0,
      aboveFoldKeywords: aboveFoldKeywordsList.length,
      aboveFoldKeywordsList: aboveFoldKeywordsList
    };
  }

  private extractBasicKeywords(content: string): string[] {
    const keywords = new Set<string>();
    const normalizedContent = content.toLowerCase();
    
    // Extract service-related terms
    const servicePatterns = [
      /(\w+\s+marketing)/gi,
      /(\w+\s+design)/gi,
      /(\w+\s+development)/gi,
      /(digital\s+\w+)/gi,
      /(seo\s+\w+)/gi,
      /(web\s+\w+)/gi,
      /(\w+\s+consulting)/gi,
      /(\w+\s+strategy)/gi,
      /(\w+\s+optimization)/gi,
      /(\w+\s+agency)/gi
    ];
    
    servicePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clean = match.trim().toLowerCase();
          if (clean.length > 5 && clean.length < 40 && this.isBusinessRelevant(clean)) {
            keywords.add(clean);
          }
        });
      }
    });
    
    return Array.from(keywords).slice(0, 20);
  }

  private extractAboveFoldKeywords(content: string, allKeywords: EnhancedKeywordData[]): EnhancedKeywordData[] {
    console.log('=== ABOVE FOLD EXTRACTION (TOP 3 POSITIONS ONLY) ===');
    console.log(`Input: ${allKeywords.length} total keywords to check`);
    
    // Show breakdown of keyword types
    const brandedCount = allKeywords.filter(k => k.type === 'branded').length;
    const nonBrandedCount = allKeywords.filter(k => k.type === 'non-branded').length;
    console.log(`  - Branded keywords: ${brandedCount}`);
    console.log(`  - Non-branded keywords: ${nonBrandedCount}`);
    
    // Filter to only include keywords ranking in positions 1-3 (both branded and non-branded)
    const topRankingKeywords = allKeywords.filter(keyword => {
      return keyword.position >= 1 && keyword.position <= 3;
    });
    
    console.log(`Found ${topRankingKeywords.length} keywords ranking in positions 1-3:`);
    topRankingKeywords.forEach(k => console.log(`  - "${k.keyword}" (${k.type}, position: ${k.position}, volume: ${k.volume})`));
    
    // Sort by position (best first), then by volume
    const result = topRankingKeywords.sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position; // Position 1 first
      return b.volume - a.volume; // Higher volume first for same position
    }).slice(0, 20); // Limit to top 20
    
    console.log(`=== ABOVE FOLD FINAL RESULT: ${result.length} keywords ===`);
    result.forEach(k => console.log(`- "${k.keyword}" (${k.type}, position: ${k.position}, volume: ${k.volume})`));
    
    return result;
  }
  
  private keywordAppearsInContent(keyword: string, content: string): boolean {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const normalizedContent = content.toLowerCase();
    
    // Check if the full keyword phrase appears in content
    if (normalizedContent.includes(normalizedKeyword)) {
      return true;
    }
    
    // Special case for brand product names that might have variations
    // e.g., "multitest" should match "MultiTest-i" or "multitest-i"
    if (normalizedKeyword.length > 4) {
      const flexiblePattern = normalizedKeyword.replace(/[^a-z0-9]/g, '');
      const contentPattern = normalizedContent.replace(/[^a-z0-9\s]/g, ' ');
      if (contentPattern.includes(flexiblePattern)) {
        return true;
      }
    }
    
    // For multi-word keywords, check if all words appear in content
    const keywordWords = normalizedKeyword.split(/\s+/).filter(word => word.length > 2);
    if (keywordWords.length > 1) {
      const allWordsPresent = keywordWords.every(word => normalizedContent.includes(word));
      return allWordsPresent;
    }
    
    // For single words, check for partial matches (for technical terms)
    if (keywordWords.length === 1 && normalizedKeyword.length > 4) {
      const word = keywordWords[0];
      // Look for the word as part of compound words
      const wordRegex = new RegExp(`\\b${word}[a-z]*\\b|\\b[a-z]*${word}\\b`, 'i');
      if (wordRegex.test(content)) {
        return true;
      }
    }
    
    return false;
  }

  private async detectRealCompetitors(
    domain: string, 
    content: string, 
    mainKeywords: string[]
  ): Promise<{ competitors: CompetitorData[]; searchesUsed: number }> {
    console.log(`\n=== COMPETITOR DETECTION ===`);
    
    // Detect industry from content
    const industry = this.detectIndustryFromContent(content);
    const location = this.detectLocationFromDomain(domain);
    
    console.log(`Detected industry: ${industry}`);
    console.log(`Detected location: ${location}`);
    
    try {
      const competitorAnalysis = await this.competitorDetectionService.findRealCompetitors(
        domain, 
        industry, 
        location, 
        mainKeywords
      );
      
      console.log(`Competitor detection: ${competitorAnalysis.competitors.length} competitors found`);
      return {
        competitors: competitorAnalysis.competitors,
        searchesUsed: competitorAnalysis.searchesUsed
      };
    } catch (error) {
      console.error('Competitor detection failed:', error);
      return {
        competitors: [],
        searchesUsed: 0
      };
    }
  }

  private detectIndustryFromContent(content: string): string {
    const normalizedContent = content.toLowerCase();
    
    // Industry detection based on content analysis
    if (normalizedContent.includes('force') && normalizedContent.includes('testing')) {
      return 'testing equipment';
    }
    if (normalizedContent.includes('calibration') || normalizedContent.includes('measurement')) {
      return 'testing equipment';
    }
    if (normalizedContent.includes('torque') && normalizedContent.includes('testing')) {
      return 'testing equipment';
    }
    if (normalizedContent.includes('manufacturing') || normalizedContent.includes('industrial')) {
      return 'manufacturing';
    }
    if (normalizedContent.includes('engineering') || normalizedContent.includes('technical')) {
      return 'engineering';
    }
    if (normalizedContent.includes('software') || normalizedContent.includes('digital')) {
      return 'software';
    }
    if (normalizedContent.includes('marketing') || normalizedContent.includes('advertising')) {
      return 'marketing';
    }
    if (normalizedContent.includes('consulting') || normalizedContent.includes('advisory')) {
      return 'consulting';
    }
    if (normalizedContent.includes('legal') || normalizedContent.includes('law')) {
      return 'legal';
    }
    if (normalizedContent.includes('medical') || normalizedContent.includes('healthcare')) {
      return 'healthcare';
    }
    if (normalizedContent.includes('automotive') || normalizedContent.includes('vehicle')) {
      return 'automotive';
    }
    
    return 'business services';
  }

  private detectLocationFromDomain(domain: string): string {
    if (domain.includes('.co.uk') || domain.includes('.uk')) {
      return 'UK';
    }
    if (domain.includes('.com.au') || domain.includes('.au')) {
      return 'Australia';
    }
    if (domain.includes('.ca')) {
      return 'Canada';
    }
    if (domain.includes('.de')) {
      return 'Germany';
    }
    if (domain.includes('.fr')) {
      return 'France';
    }
    
    return 'US'; // Default
  }

  private isBusinessRelevant(keyword: string): boolean {
    // Same generic filtering as ValueSerp
    const genericTerms = [
      'latest blogs', 'follow us', 'find us', 'call us', 'email us',
      'contact us', 'about us', 'get in touch', 'learn more', 'click here',
      'read more', 'see more', 'view more', 'more info', 'our team',
      'our story', 'our mission', 'privacy policy', 'terms conditions',
      'cookie policy', 'sitemap', 'copyright', 'menu', 'navigation',
      'close services', 'open services'
    ];
    
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    // Filter out generic terms
    if (genericTerms.some(term => normalizedKeyword.includes(term))) {
      return false;
    }
    
    // Must contain business-relevant terms
    const businessIndicators = [
      'marketing', 'digital', 'seo', 'ppc', 'advertising', 'branding',
      'design', 'development', 'consulting', 'strategy', 'management',
      'agency', 'optimization', 'analytics', 'campaign', 'conversion'
    ];
    
    return businessIndicators.some(indicator => normalizedKeyword.includes(indicator));
  }
}

export { RealKeywordService, type EnhancedKeywordData, type RealKeywordAnalysis };