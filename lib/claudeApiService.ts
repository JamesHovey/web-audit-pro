/**
 * Claude API Service for Pure Intelligence Business Analysis
 * Uses Claude to understand any business type and generate relevant keywords
 */

export interface ClaudeUsageMetrics {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  requestCount: number;
  timestamp: Date;
}

export interface BusinessAnalysisResult {
  businessType: {
    category: string;
    subcategory: string;
    confidence: 'high' | 'medium' | 'low';
    description: string;
  };
  targetAudience: {
    primary: string[];
    secondary: string[];
    businessModel: 'B2B' | 'B2C' | 'B2B2C';
  };
  services: string[];
  keywordCategories: {
    primary: string[];
    secondary: string[];
    longTail: string[];
    local: string[];
    commercial: string[];
    informational: string[];
    urgency: string[];
  };
  competitiveKeywords: string[];
  contentOpportunities: string[];
  usageMetrics: ClaudeUsageMetrics;
}

export class ClaudeApiService {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';
  private model = 'claude-3-5-haiku-20241022'; // Using Haiku for cost-effective business analysis
  private pricing = {
    inputTokens: 0.25, // $0.25 per million tokens (Haiku pricing)
    outputTokens: 1.25 // $1.25 per million tokens (Haiku pricing)
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Claude API key not provided. Service will use mock data.');
    }
  }

  /**
   * Analyze business website using Claude's intelligence
   */
  async analyzeBusinessWebsite(domain: string, htmlContent: string, locationContext?: { locality?: string; region?: string; country?: string }): Promise<BusinessAnalysisResult> {
    console.log(`🧠 Analyzing business with Claude API: ${domain}`);
    
    if (locationContext?.locality) {
      console.log(`📍 Using location context: ${locationContext.locality}, ${locationContext.region || locationContext.country || 'UK'}`);
    }
    
    const startTime = Date.now();
    
    if (!this.apiKey) {
      console.log('🔧 Using mock analysis (no API key provided)');
      return this.getMockAnalysis(domain, htmlContent);
    }

    try {
      const prompt = this.buildAnalysisPrompt(domain, htmlContent, locationContext);
      const response = await this.callClaudeApiWithRetry(prompt);
      
      const analysisResult = this.parseClaudeResponse(response);
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Claude analysis complete in ${processingTime}ms`);
      console.log(`💰 API cost: $${analysisResult.usageMetrics.totalCost.toFixed(4)}`);
      
      return analysisResult;

    } catch (error) {
      console.error('❌ Claude API analysis failed after retries:', error);
      console.log('🔄 Falling back to mock analysis');
      return this.getMockAnalysis(domain, htmlContent);
    }
  }

  /**
   * Build comprehensive analysis prompt for Claude
   */
  private buildAnalysisPrompt(domain: string, htmlContent: string, locationContext?: { locality?: string; region?: string; country?: string }): string {
    // Clean and truncate HTML to stay within token limits
    const cleanHtml = this.cleanHtmlForAnalysis(htmlContent);
    
    // Add location context if available
    const locationInfo = locationContext 
      ? `\nBusiness Location: ${locationContext.locality || ''} ${locationContext.region || ''} ${locationContext.country || 'UK'}`.trim()
      : '';
    
    return `You are an expert business analyst and SEO strategist. Analyze the following website and provide a comprehensive business analysis for keyword research and SEO strategy.

Website Domain: ${domain}${locationInfo ? '\n' + locationInfo : ''}
Website Content: ${cleanHtml}

Please analyze this business and provide a detailed response in the following JSON format:

{
  "businessType": {
    "category": "Primary business category (e.g., 'Scientific Equipment', 'Insurance Services', 'Entertainment')",
    "subcategory": "Specific subcategory (e.g., 'Particle Science Equipment', 'Commercial Insurance', 'Indoor Karting')",
    "confidence": "high|medium|low",
    "description": "2-3 sentence description of what this business does"
  },
  "targetAudience": {
    "primary": ["List of primary target customers"],
    "secondary": ["List of secondary target customers"],
    "businessModel": "B2B|B2C|B2B2C"
  },
  "services": ["List of main services/products offered"],
  "keywordCategories": {
    "primary": ["Core business keywords (10-15 keywords)"],
    "secondary": ["Related service keywords (15-20 keywords)"],
    "longTail": ["Specific long-tail keywords (10-15 keywords)"],
    "local": ["Location-based keywords if applicable (10-15 keywords)"],
    "commercial": ["Buying intent keywords (10-15 keywords)"],
    "informational": ["Research/learning keywords (10-15 keywords)"],
    "urgency": ["Time-sensitive keywords if applicable (5-10 keywords)"]
  },
  "competitiveKeywords": ["Keywords competitors likely target (10-15 keywords)"],
  "contentOpportunities": ["Content topics this business should create (8-12 topics)"]
}

Guidelines:
1. Focus on understanding the actual business model and services
2. Generate keywords that real customers would search for
3. Consider both B2B and B2C angles where appropriate
4. Include industry-specific terminology
5. ${locationContext ? `IMPORTANT: Focus on local keywords for ${locationContext.locality || locationContext.region || 'the UK'} area` : 'Suggest local keywords if it\'s a location-based business'}
6. Think about the customer journey from awareness to purchase
7. Consider seasonal or urgent needs where relevant
8. Ensure keywords are commercially viable and have search potential
9. ${locationContext ? 'Prioritize UK-specific terms and avoid non-UK locations' : ''}

Provide only the JSON response, no additional text.`;
  }

  /**
   * Call Claude API with retry logic for 529 errors
   */
  private async callClaudeApiWithRetry(prompt: string, maxRetries = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add progressive delay between retries
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 2s, 4s, 8s
          console.log(`⏳ Retry attempt ${attempt}/${maxRetries}, waiting ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return await this.callClaudeApi(prompt);
        
      } catch (error) {
        const isOverloadError = error.message.includes('529') || error.message.includes('overloaded');
        
        if (isOverloadError && attempt < maxRetries) {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} failed with overload error, retrying...`);
          continue;
        }
        
        // If not an overload error, or we've exhausted retries, throw
        throw error;
      }
    }
  }

  /**
   * Call Claude API with prompt (single attempt)
   */
  private async callClaudeApi(prompt: string): Promise<any> {
    const requestBody = {
      model: this.model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Parse Claude's response and calculate usage metrics
   */
  private parseClaudeResponse(response: any): BusinessAnalysisResult {
    const content = response.content[0].text;
    const usage = response.usage;

    // Calculate costs
    const inputCost = (usage.input_tokens / 1000000) * this.pricing.inputTokens;
    const outputCost = (usage.output_tokens / 1000000) * this.pricing.outputTokens;
    const totalCost = inputCost + outputCost;

    const usageMetrics: ClaudeUsageMetrics = {
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      totalCost,
      requestCount: 1,
      timestamp: new Date()
    };

    try {
      // Parse JSON response from Claude
      const analysisData = JSON.parse(content);
      
      return {
        ...analysisData,
        usageMetrics
      };
    } catch (error) {
      console.error('❌ Failed to parse Claude response:', error);
      throw new Error('Invalid JSON response from Claude API');
    }
  }

  /**
   * Clean HTML for analysis (remove noise, keep meaningful content)
   */
  private cleanHtmlForAnalysis(html: string): string {
    // Remove script and style tags
    let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags but keep content
    cleaned = cleaned.replace(/<[^>]*>/g, ' ');
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long (keep within reasonable token limits)
    if (cleaned.length > 8000) {
      cleaned = cleaned.substring(0, 8000) + '...';
    }
    
    return cleaned;
  }

  /**
   * Mock analysis for testing without API key
   */
  private getMockAnalysis(domain: string, htmlContent: string): BusinessAnalysisResult {
    const mockUsage: ClaudeUsageMetrics = {
      inputTokens: 5000,
      outputTokens: 1500,
      totalCost: 0.0375, // $3.75/100 audits
      requestCount: 1,
      timestamp: new Date()
    };

    // Actually analyze the content to detect business type
    const businessAnalysis = this.detectBusinessTypeFromContent(htmlContent, domain);

    return {
      businessType: {
        category: businessAnalysis.category,
        subcategory: businessAnalysis.subcategory,
        confidence: 'medium',
        description: `Mock analysis - API key not configured. Detected as ${businessAnalysis.category}.`
      },
      targetAudience: {
        primary: ['Business professionals', 'Corporate clients'],
        secondary: ['Small businesses', 'Entrepreneurs'],
        businessModel: 'B2B'
      },
      services: this.getServicesForBusinessType(businessAnalysis.category),
      keywordCategories: this.getKeywordCategoriesForBusinessType(businessAnalysis.category),
      competitiveKeywords: ['business consulting', 'professional advisory', 'corporate services'],
      contentOpportunities: ['Business consulting guide', 'Professional services overview'],
      usageMetrics: mockUsage
    };
  }

  /**
   * Detect business type from content analysis (fallback method)
   */
  private detectBusinessTypeFromContent(htmlContent: string, domain: string): {category: string, subcategory: string} {
    const content = htmlContent.toLowerCase();
    
    // Marketing & Digital Agency Detection
    const marketingIndicators = ['marketing', 'digital marketing', 'seo', 'ppc', 'social media', 'branding', 'advertising', 'web design', 'campaign', 'digital agency', 'marketing agency'];
    const marketingScore = marketingIndicators.filter(indicator => content.includes(indicator)).length;
    
    // Architecture Detection  
    const architectureIndicators = ['architect', 'architectural', 'design', 'planning permission', 'building', 'construction', 'residential', 'commercial'];
    const architectureScore = architectureIndicators.filter(indicator => content.includes(indicator)).length;
    
    // Legal Services Detection
    const legalIndicators = ['solicitor', 'lawyer', 'legal', 'law', 'barrister', 'litigation', 'conveyancing'];
    const legalScore = legalIndicators.filter(indicator => content.includes(indicator)).length;
    
    // Financial Services Detection
    const financialIndicators = ['investment', 'trading', 'portfolio', 'financial advisor', 'wealth management', 'fund'];
    const financialScore = financialIndicators.filter(indicator => content.includes(indicator)).length;
    
    // Determine business type based on highest score
    const scores = [
      { type: 'Marketing & Digital', subcategory: 'Digital Marketing Agency', score: marketingScore },
      { type: 'Architecture & Design', subcategory: 'Residential Architecture', score: architectureScore },
      { type: 'Legal Services', subcategory: 'General Practice', score: legalScore },
      { type: 'Financial Services', subcategory: 'Investment Management', score: financialScore }
    ];
    
    const highestScore = scores.reduce((max, current) => current.score > max.score ? current : max);
    
    // If no clear match, default to professional services
    if (highestScore.score === 0) {
      return { category: 'Business Services', subcategory: 'Professional Services' };
    }
    
    console.log(`🎯 Mock analysis detected: ${highestScore.type} (score: ${highestScore.score})`);
    return { category: highestScore.type, subcategory: highestScore.subcategory };
  }

  /**
   * Get services based on business type
   */
  private getServicesForBusinessType(businessType: string): string[] {
    const serviceMap: Record<string, string[]> = {
      'Marketing & Digital': ['Digital Marketing', 'SEO Services', 'PPC Management', 'Social Media Marketing', 'Web Design', 'Branding'],
      'Architecture & Design': ['Architectural Design', 'Planning Permission', 'Building Design', 'Interior Design'],
      'Legal Services': ['Legal Advice', 'Conveyancing', 'Family Law', 'Commercial Law'],
      'Financial Services': ['Investment Management', 'Financial Planning', 'Wealth Management', 'Tax Advisory']
    };
    
    return serviceMap[businessType] || ['Professional consulting', 'Business services', 'Advisory services'];
  }

  /**
   * Get keyword categories based on business type
   */
  private getKeywordCategoriesForBusinessType(businessType: string): any {
    const keywordMap: Record<string, any> = {
      'Marketing & Digital': {
        primary: ['digital marketing', 'marketing agency', 'seo services', 'web design'],
        secondary: ['social media marketing', 'ppc management', 'branding services'],
        longTail: ['digital marketing agency sussex', 'professional web design services'],
        local: ['marketing agency near me', 'local digital marketing'],
        commercial: ['hire marketing agency', 'digital marketing cost'],
        informational: ['what is digital marketing', 'marketing agency guide'],
        urgency: ['urgent marketing help', 'immediate seo services']
      },
      'Architecture & Design': {
        primary: ['architect', 'architectural design', 'building design'],
        secondary: ['planning permission', 'interior design', 'residential architect'],
        longTail: ['chartered architect sussex', 'planning permission services'],
        local: ['architect near me', 'local architectural services'],
        commercial: ['hire architect', 'architectural design cost'],
        informational: ['what does architect do', 'planning permission guide'],
        urgency: ['urgent architect needed', 'emergency building design']
      }
    };

    return keywordMap[businessType] || {
      primary: ['professional services', 'business consulting', 'corporate advisory'],
      secondary: ['business solutions', 'professional advice', 'consulting services'],
      longTail: ['professional business consulting services', 'corporate advisory solutions'],
      local: ['professional services near me', 'local business consultant'],
      commercial: ['hire business consultant', 'professional services cost'],
      informational: ['what is business consulting', 'professional services guide'],
      urgency: ['urgent business advice', 'immediate professional help']
    };
  }

  /**
   * Get total usage statistics
   */
  getTotalUsage(): ClaudeUsageMetrics {
    // In a real implementation, this would aggregate from a database
    // For now, return current session usage
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      requestCount: 0,
      timestamp: new Date()
    };
  }

  /**
   * Estimate cost for a given HTML content size
   */
  estimateCost(htmlContent: string): { estimatedCost: number; estimatedTokens: number } {
    const cleanedContent = this.cleanHtmlForAnalysis(htmlContent);
    const estimatedInputTokens = Math.ceil(cleanedContent.length / 4); // Rough token estimation
    const estimatedOutputTokens = 1500; // Typical output size
    
    const inputCost = (estimatedInputTokens / 1000000) * this.pricing.inputTokens;
    const outputCost = (estimatedOutputTokens / 1000000) * this.pricing.outputTokens;
    
    return {
      estimatedCost: inputCost + outputCost,
      estimatedTokens: estimatedInputTokens + estimatedOutputTokens
    };
  }
}

// Export convenience function
export async function analyzeBusinessWithClaude(
  domain: string, 
  htmlContent: string, 
  apiKey?: string
): Promise<BusinessAnalysisResult> {
  const service = new ClaudeApiService(apiKey);
  return await service.analyzeBusinessWebsite(domain, htmlContent);
}

// Export for usage tracking
export function createClaudeService(apiKey?: string): ClaudeApiService {
  return new ClaudeApiService(apiKey);
}