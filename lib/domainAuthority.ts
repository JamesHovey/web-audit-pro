interface DomainAuthorityMetrics {
  domainAuthority: number;
  estimationMethod: string;
  reliability?: 'high' | 'medium' | 'low';
  sources?: Array<{source: string; score: number; success: boolean}>;
  factors?: {
    domainAge: number;
    httpsEnabled: boolean;
    contentQuality: number;
    technicalSEO: number;
    socialPresence: number;
  };
}

class DomainAuthorityEstimator {
  
  async estimateDomainAuthority(domain: string, html?: string): Promise<DomainAuthorityMetrics> {
    console.log(`Getting domain authority for: ${domain}`);
    
    // Use SEMrush Authority Score - the most reliable metric
    try {
      const { SEMrushAuthorityService } = await import('./semrushAuthority');
      const semrushService = new SEMrushAuthorityService();
      const semrushResult = await semrushService.getAuthorityScore(domain);
      
      if (semrushResult.success) {
        console.log(`SEMrush Authority Score: ${semrushResult.authorityScore} (${semrushResult.method})`);
        
        const reliability = semrushResult.method === 'semrush_scrape' ? 'high' : 
                          semrushResult.method === 'semrush_api' ? 'high' : 'medium';
        
        return {
          domainAuthority: semrushResult.authorityScore,
          estimationMethod: semrushResult.method,
          reliability,
          sources: [{
            source: 'SEMrush',
            score: semrushResult.authorityScore,
            success: true
          }]
        };
      }
    } catch (error) {
      console.log('SEMrush Authority Score fetching failed, falling back to estimation:', error);
    }
    
    // Fallback to our improved heuristic estimation
    try {
      const factors = await this.analyzeDomainFactors(domain, html);
      const domainAuthority = this.calculateDomainAuthority(factors);
      
      return {
        domainAuthority,
        estimationMethod: 'content_analysis',
        reliability: 'low',
        factors
      };
      
    } catch (error) {
      console.error('Domain authority estimation failed:', error);
      
      // Final fallback estimation
      return {
        domainAuthority: this.getEstimateFromDomain(domain),
        estimationMethod: 'domain_heuristic',
        reliability: 'low',
        factors: {
          domainAge: 3,
          httpsEnabled: true,
          contentQuality: 5,
          technicalSEO: 5,
          socialPresence: 3
        }
      };
    }
  }
  
  private async analyzeDomainFactors(domain: string, html?: string) {
    const factors = {
      domainAge: this.estimateDomainAge(domain),
      httpsEnabled: domain.startsWith('https://') || !domain.startsWith('http://'),
      contentQuality: html ? this.analyzeContentQuality(html) : 5,
      technicalSEO: html ? this.analyzeTechnicalSEO(html) : 5,
      socialPresence: this.estimateSocialPresence(html || '')
    };
    
    return factors;
  }
  
  private estimateDomainAge(domain: string): number {
    // Simple heuristics for domain age estimation
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Common patterns for older/newer domains
    if (cleanDomain.includes('-') && cleanDomain.split('-').length > 2) return 2; // Newer domains often use hyphens
    if (cleanDomain.length < 6) return 8; // Short domains are often older
    if (cleanDomain.endsWith('.com')) return 6; // .com domains are often older
    if (cleanDomain.endsWith('.co.uk')) return 5; // UK domains
    if (cleanDomain.includes('digital') || cleanDomain.includes('online')) return 3; // Modern terms
    
    return 5; // Default middle age
  }
  
  private analyzeContentQuality(html: string): number {
    let score = 5; // Base score
    
    // Positive indicators
    if (html.includes('<h1')) score += 1; // Proper heading structure
    if (html.includes('<meta name="description"')) score += 1; // Meta description
    if (html.includes('schema.org') || html.includes('application/ld+json')) score += 1; // Structured data
    if (html.length > 10000) score += 1; // Substantial content
    
    // Count paragraphs
    const paragraphCount = (html.match(/<p[^>]*>/g) || []).length;
    if (paragraphCount > 10) score += 1;
    if (paragraphCount > 20) score += 1;
    
    // Images with alt text
    const imagesWithAlt = (html.match(/<img[^>]*alt[^>]*>/g) || []).length;
    if (imagesWithAlt > 3) score += 1;
    
    // Negative indicators
    if (html.includes('lorem ipsum')) score -= 2; // Placeholder content
    if (html.includes('coming soon')) score -= 1;
    if (html.includes('under construction')) score -= 1;
    
    return Math.max(1, Math.min(10, score));
  }
  
  private analyzeTechnicalSEO(html: string): number {
    let score = 5; // Base score
    
    // Technical SEO factors
    if (html.includes('<title>') && !html.includes('<title></title>')) score += 1; // Title tag
    if (html.includes('viewport')) score += 1; // Mobile responsive
    if (html.includes('canonical')) score += 1; // Canonical URLs
    if (html.includes('og:')) score += 1; // Open Graph tags
    if (html.includes('twitter:')) score += 1; // Twitter cards
    if (html.includes('robots')) score += 1; // Robots meta
    
    // Modern web standards
    if (html.includes('defer') || html.includes('async')) score += 1; // Script optimization
    if (html.includes('preload') || html.includes('prefetch')) score += 1; // Resource hints
    
    // Negative indicators
    if (html.includes('table') && html.includes('layout')) score -= 1; // Table layouts
    if (html.includes('font') && html.includes('color=')) score -= 1; // Inline styling
    
    return Math.max(1, Math.min(10, score));
  }
  
  private estimateSocialPresence(html: string): number {
    let score = 3; // Base score
    
    // Social media presence indicators
    if (html.includes('facebook.com')) score += 1;
    if (html.includes('twitter.com') || html.includes('x.com')) score += 1;
    if (html.includes('linkedin.com')) score += 1;
    if (html.includes('instagram.com')) score += 1;
    if (html.includes('youtube.com')) score += 1;
    
    // Social sharing buttons
    if (html.includes('share') || html.includes('social')) score += 1;
    
    return Math.max(1, Math.min(10, score));
  }
  
  private calculateDomainAuthority(factors: any): number {
    // More conservative weighted calculation to match real authority scores
    const weights = {
      domainAge: 0.30,      // 30% - Age is very important
      httpsEnabled: 0.10,   // 10% - HTTPS is standard now
      contentQuality: 0.25, // 25% - Content quality matters
      technicalSEO: 0.25,   // 25% - Technical factors important
      socialPresence: 0.10  // 10% - Social signals
    };
    
    // Start with a much lower base and be more conservative
    let score = 0;
    
    // Domain age (scale 1-10, but more conservative scoring)
    score += (factors.domainAge * 0.6) * weights.domainAge; // Reduce impact
    
    // HTTPS (much less impact since it's standard)
    score += (factors.httpsEnabled ? 1 : 0.3) * weights.httpsEnabled;
    
    // Content quality (scale 1-10, but more conservative)
    score += (factors.contentQuality * 0.4) * weights.contentQuality; // Reduce impact
    
    // Technical SEO (scale 1-10, but more conservative)
    score += (factors.technicalSEO * 0.4) * weights.technicalSEO; // Reduce impact
    
    // Social presence (scale 1-10, but much more conservative)
    score += (factors.socialPresence * 0.3) * weights.socialPresence; // Reduce impact
    
    // Scale to 0-100 but keep it realistic (most sites should be 10-50)
    const normalizedScore = score * 100;
    
    // Cap at realistic ranges - most legitimate business sites are 15-45
    return Math.max(10, Math.min(50, Math.round(normalizedScore)));
  }
  
  private getEstimateFromDomain(domain: string): number {
    // Very basic fallback estimation
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Basic heuristics
    if (cleanDomain.length < 6) return 65; // Short domains often have higher authority
    if (cleanDomain.includes('-')) return 35; // Hyphenated domains often newer
    if (cleanDomain.endsWith('.com')) return 45;
    if (cleanDomain.endsWith('.co.uk')) return 42;
    if (cleanDomain.endsWith('.org')) return 50;
    
    return 40; // Default estimate
  }
}

export { DomainAuthorityEstimator, type DomainAuthorityMetrics };