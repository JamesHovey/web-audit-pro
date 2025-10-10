/**
 * Fast UK Company Detection Service
 * Provides instant UK detection based on domain and basic content analysis
 */

export interface UKDetectionResult {
  isUKCompany: boolean;
  confidence: 'high' | 'medium' | 'low';
  signals: string[];
  reasoning: string;
}

export class UKDetectionService {
  
  /**
   * Fast UK detection using domain and basic content signals
   */
  async detectUKCompany(url: string): Promise<UKDetectionResult> {
    const domain = this.extractDomain(url);
    const signals: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';
    
    // 1. Domain-based detection (fastest and most reliable)
    const domainResult = this.analyzeUKDomain(domain);
    if (domainResult.isUK) {
      signals.push(...domainResult.signals);
      confidence = 'high';
      
      return {
        isUKCompany: true,
        confidence,
        signals,
        reasoning: `UK domain detected: ${domainResult.signals.join(', ')}`
      };
    }
    
    // 2. Quick content analysis (for non-UK domains)
    try {
      const contentResult = await this.quickContentAnalysis(url);
      if (contentResult.isUK) {
        signals.push(...contentResult.signals);
        confidence = contentResult.confidence;
        
        return {
          isUKCompany: true,
          confidence,
          signals,
          reasoning: `UK content indicators found: ${contentResult.signals.join(', ')}`
        };
      }
    } catch (error) {
      console.log('Content analysis failed, using domain-only detection');
    }
    
    // 3. Default to non-UK
    return {
      isUKCompany: false,
      confidence: 'medium',
      signals: ['No UK indicators found'],
      reasoning: 'No UK domain extension or content indicators detected'
    };
  }
  
  /**
   * Analyze domain for UK indicators
   */
  private analyzeUKDomain(domain: string): {
    isUK: boolean;
    signals: string[];
  } {
    const domainLower = domain.toLowerCase();
    const signals: string[] = [];
    
    // Strong UK domain indicators
    const ukExtensions = [
      '.co.uk', '.uk', '.org.uk', '.gov.uk', '.ac.uk', 
      '.ltd.uk', '.plc.uk', '.sch.uk', '.police.uk'
    ];
    
    for (const ext of ukExtensions) {
      if (domainLower.endsWith(ext)) {
        signals.push(`UK domain extension: ${ext}`);
        return { isUK: true, signals };
      }
    }
    
    // Weak indicators (need content confirmation)
    if (domainLower.includes('uk') || domainLower.includes('britain') || domainLower.includes('london')) {
      signals.push('UK reference in domain name');
    }
    
    return { isUK: false, signals };
  }
  
  /**
   * Quick content analysis with timeout
   */
  private async quickContentAnalysis(url: string): Promise<{
    isUK: boolean;
    confidence: 'high' | 'medium' | 'low';
    signals: string[];
  }> {
    const signals: string[] = [];
    
    try {
      // Quick fetch with short timeout
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      const response = await fetch(normalizedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Only read first 5KB for speed
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      let content = '';
      const decoder = new TextDecoder();
      let totalBytes = 0;
      const maxBytes = 5000;
      
      while (totalBytes < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        
        content += decoder.decode(value, { stream: true });
        totalBytes += value.length;
      }
      
      reader.cancel();
      
      // Analyze content for UK indicators
      return this.analyzeUKContent(content);
      
    } catch (error) {
      console.log(`Quick content analysis failed for ${url}:`, error);
      return { isUK: false, confidence: 'low', signals: ['Content analysis failed'] };
    }
  }
  
  /**
   * Analyze content for UK business indicators
   */
  private analyzeUKContent(content: string): {
    isUK: boolean;
    confidence: 'high' | 'medium' | 'low';
    signals: string[];
  } {
    const contentLower = content.toLowerCase();
    const signals: string[] = [];
    
    // Strong UK business indicators
    const strongIndicators = [
      'registered in england',
      'registered in scotland', 
      'registered in wales',
      'companies house',
      'company registration number',
      'company number:',
      'registered office:',
      'vat number gb',
      'gb vat',
      'hmrc',
      'charity commission'
    ];
    
    const mediumIndicators = [
      'united kingdom',
      'uk limited',
      'ltd company',
      'plc company',
      'uk registered',
      'england and wales',
      'scottish charity',
      'limited by guarantee'
    ];
    
    const weakIndicators = [
      'london',
      'manchester',
      'birmingham',
      'glasgow',
      'edinburgh',
      'bristol',
      'leeds',
      'liverpool'
    ];
    
    // Check for strong indicators
    for (const indicator of strongIndicators) {
      if (contentLower.includes(indicator)) {
        signals.push(`Strong UK indicator: "${indicator}"`);
      }
    }
    
    if (signals.length > 0) {
      return { isUK: true, confidence: 'high', signals };
    }
    
    // Check for medium indicators
    for (const indicator of mediumIndicators) {
      if (contentLower.includes(indicator)) {
        signals.push(`Medium UK indicator: "${indicator}"`);
      }
    }
    
    if (signals.length >= 2) {
      return { isUK: true, confidence: 'medium', signals };
    }
    
    // Check for weak indicators + postcodes/phones
    for (const indicator of weakIndicators) {
      if (contentLower.includes(indicator)) {
        signals.push(`Weak UK indicator: "${indicator}"`);
      }
    }
    
    // UK postcode pattern
    const ukPostcodePattern = /\b[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}\b/gi;
    if (ukPostcodePattern.test(content)) {
      signals.push('UK postcode format detected');
    }
    
    // UK phone numbers
    const ukPhonePattern = /(\+44|0044|01[0-9]{8,9}|02[0-9]{8,9}|07[0-9]{9})/;
    if (ukPhonePattern.test(content)) {
      signals.push('UK phone number format detected');
    }
    
    // Decision logic for weak indicators
    if (signals.length >= 2) {
      return { isUK: true, confidence: 'medium', signals };
    } else if (signals.length === 1) {
      return { isUK: false, confidence: 'low', signals: [...signals, 'Insufficient UK indicators'] };
    }
    
    return { isUK: false, confidence: 'low', signals: ['No UK indicators found'] };
  }
  
  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      // If URL parsing fails, try to extract domain manually
      const cleaned = url.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
      return cleaned;
    }
  }
}

// Export singleton instance
export const ukDetectionService = new UKDetectionService();