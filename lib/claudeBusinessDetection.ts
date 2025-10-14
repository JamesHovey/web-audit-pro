/**
 * Claude API Business Detection Service
 * Uses Claude API to accurately detect business type and industry from website content
 */

export interface BusinessDetectionResult {
  businessType: string;
  confidence: number;
  detectionMethod: string;
  detectionSources: string[];
  subcategory?: string;
}

export class ClaudeBusinessDetector {
  
  /**
   * Detect business type using Claude API with enhanced location context
   */
  async detectBusinessType(domain: string, html: string, locationContext?: { locality?: string; region?: string; country?: string }): Promise<BusinessDetectionResult> {
    console.log(`🤖 Claude API business detection for: ${domain}`);
    
    try {
      const { ClaudeApiService } = await import('./claudeApiService');
      const claudeService = new ClaudeApiService();
      
      // Extract relevant content for analysis (first 3000 chars to stay within limits)
      const content = this.extractRelevantContent(html);
      
      // Pass location context to Claude API for better local keyword generation
      const businessAnalysis = await claudeService.analyzeBusinessWebsite(domain, html, locationContext);
      
      return {
        businessType: businessAnalysis.businessType.category,
        confidence: businessAnalysis.businessType.confidence === 'high' ? 0.9 : 
                   businessAnalysis.businessType.confidence === 'medium' ? 0.7 : 0.5,
        detectionMethod: 'claude_api',
        detectionSources: ['Claude API Content Analysis'],
        subcategory: businessAnalysis.businessType.subcategory
      };
      
    } catch (error) {
      console.error('Claude API business detection failed:', error);
      throw new Error('Claude API business detection failed and no fallback allowed');
    }
  }
  
  /**
   * Extract relevant content from HTML for analysis
   */
  private extractRelevantContent(html: string): string {
    // Remove HTML tags and extract key content
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Focus on key sections if available
    const keyPhrases = [
      'about us', 'what we do', 'our services', 'we are', 'we help',
      'specialist', 'expert', 'professional', 'leading', 'established'
    ];
    
    // Extract sentences containing key business description phrases
    const sentences = content.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence => 
      keyPhrases.some(phrase => 
        sentence.toLowerCase().includes(phrase.toLowerCase())
      )
    );
    
    // Combine relevant content
    const relevantContent = relevantSentences.join('. ').substring(0, 2500);
    
    // If no relevant content found, use first 2500 chars
    return relevantContent || content.substring(0, 2500);
  }
  
  /**
   * Parse Claude's JSON response
   */
  private parseClaudeResponse(response: string): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing for non-JSON responses
      const businessTypeMatch = response.match(/business.*?type.*?[":]\s*["']?([^"'\n,}]+)/i);
      const confidenceMatch = response.match(/confidence.*?[":]\s*([0-9.]+)/i);
      const subcategoryMatch = response.match(/subcategory.*?[":]\s*["']?([^"'\n,}]+)/i);
      
      return {
        businessType: businessTypeMatch?.[1]?.trim() || 'General Business',
        confidence: parseFloat(confidenceMatch?.[1] || '0.7'),
        subcategory: subcategoryMatch?.[1]?.trim() || null
      };
      
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return {
        businessType: 'General Business',
        confidence: 0.5,
        subcategory: null
      };
    }
  }
  
}