/**
 * Master Business Analysis Service
 * Orchestrates the complete intelligent business analysis workflow
 */

import { analyzeBusinessIntelligently, type IntelligentBusinessResult } from './intelligentBusinessAnalyzer';
import { checkAndEnhanceBusinessType, type BusinessTypeExpansion } from './dynamicBusinessTypeManager';
import { generateBusinessKeywords, type BusinessContext, type LocationContext } from './dynamicKeywordGenerator';

export interface ComprehensiveBusinessAnalysis {
  // Step 1: Intelligent analysis results
  intelligentAnalysis: IntelligentBusinessResult;
  
  // Step 2: Business type expansion results
  businessTypeExpansion: BusinessTypeExpansion;
  
  // Step 3: Enhanced keyword generation
  enhancedKeywords: {
    totalGenerated: number;
    categoryBreakdown: {
      primary: number;
      secondary: number;
      longTail: number;
      local: number;
      commercial: number;
      informational: number;
      urgency: number;
    };
    keywordsByCategory: any;
  };
  
  // Step 4: Analysis summary
  analysisSummary: {
    businessConfidence: 'high' | 'medium' | 'low';
    keywordQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendedActions: string[];
    coverageGaps: string[];
  };
  
  // Metadata
  analysisMetadata: {
    processedAt: Date;
    analysisVersion: string;
    processingTimeMs: number;
    dataQuality: {
      contentRichness: number; // 0-1
      businessClarity: number; // 0-1
      keywordRelevance: number; // 0-1
    };
  };
}

export class MasterBusinessAnalysisService {
  
  /**
   * Complete intelligent business analysis workflow
   */
  async analyzeBusinessComprehensively(domain: string, html: string): Promise<ComprehensiveBusinessAnalysis> {
    const startTime = Date.now();
    console.log(`🚀 Starting comprehensive business analysis for: ${domain}`);
    
    try {
      // Step 1: Intelligent business analysis
      console.log(`📊 Step 1/4: Intelligent business detection...`);
      const intelligentAnalysis = await analyzeBusinessIntelligently(domain, html);
      
      // Step 2: Check and enhance business type database
      console.log(`🔧 Step 2/4: Enhancing business type database...`);
      const businessTypeExpansion = checkAndEnhanceBusinessType(
        intelligentAnalysis.confirmedBusinessType.category,
        intelligentAnalysis.confirmedBusinessType.subcategory,
        intelligentAnalysis.extractedData
      );
      
      // Step 3: Generate enhanced keywords using confirmed business type
      console.log(`🎯 Step 3/4: Generating targeted keywords...`);
      const enhancedKeywords = await this.generateEnhancedKeywords(
        intelligentAnalysis,
        businessTypeExpansion
      );
      
      // Step 4: Create analysis summary and recommendations
      console.log(`📋 Step 4/4: Creating analysis summary...`);
      const analysisSummary = this.createAnalysisSummary(
        intelligentAnalysis,
        businessTypeExpansion,
        enhancedKeywords
      );
      
      const processingTime = Date.now() - startTime;
      
      const result: ComprehensiveBusinessAnalysis = {
        intelligentAnalysis,
        businessTypeExpansion,
        enhancedKeywords,
        analysisSummary,
        analysisMetadata: {
          processedAt: new Date(),
          analysisVersion: '2.0.0',
          processingTimeMs: processingTime,
          dataQuality: this.assessDataQuality(intelligentAnalysis)
        }
      };
      
      console.log(`✅ Comprehensive analysis complete in ${processingTime}ms`);
      console.log(`📈 Generated ${enhancedKeywords.totalGenerated} keywords with ${analysisSummary.businessConfidence} confidence`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Analysis failed:`, error);
      throw new Error(`Business analysis failed: ${error.message}`);
    }
  }
  
  /**
   * Generate enhanced keywords using confirmed business type
   */
  private async generateEnhancedKeywords(
    intelligentAnalysis: IntelligentBusinessResult,
    businessTypeExpansion: BusinessTypeExpansion
  ) {
    // Prepare business context from intelligent analysis
    const businessContext: BusinessContext = {
      primaryType: intelligentAnalysis.confirmedBusinessType.category,
      subcategory: intelligentAnalysis.confirmedBusinessType.subcategory,
      businessName: intelligentAnalysis.extractedData.companyName,
      services: intelligentAnalysis.extractedData.services,
      isUkBusiness: true, // Default for UK domains
      companySize: this.determineCompanySize(intelligentAnalysis.extractedData)
    };
    
    // Prepare location context
    const locationContext: LocationContext = {
      isLocalBusiness: intelligentAnalysis.extractedData.locationIndicators.length > 0,
      detectedLocation: intelligentAnalysis.extractedData.locationIndicators[0] || undefined,
      targetCities: intelligentAnalysis.extractedData.locationIndicators.slice(0, 3)
    };
    
    // Use enhanced keywords from business type expansion if available
    const contentKeywords = businessTypeExpansion.isNewType || businessTypeExpansion.isNewSubcategory
      ? businessTypeExpansion.addedKeywords
      : intelligentAnalysis.extractedData.industryTerms;
    
    // Generate comprehensive keyword set
    const generatedKeywords = await generateBusinessKeywords(
      businessContext,
      locationContext,
      contentKeywords
    );
    
    return {
      totalGenerated: generatedKeywords.totalGenerated,
      categoryBreakdown: {
        primary: generatedKeywords.primary.length,
        secondary: generatedKeywords.secondary.length,
        longTail: generatedKeywords.longTail.length,
        local: generatedKeywords.local.length,
        commercial: generatedKeywords.commercial.length,
        informational: generatedKeywords.informational.length,
        urgency: generatedKeywords.urgency.length
      },
      keywordsByCategory: generatedKeywords
    };
  }
  
  /**
   * Create comprehensive analysis summary with recommendations
   */
  private createAnalysisSummary(
    intelligentAnalysis: IntelligentBusinessResult,
    businessTypeExpansion: BusinessTypeExpansion,
    enhancedKeywords: any
  ) {
    // Determine business confidence
    const businessConfidence = this.calculateBusinessConfidence(intelligentAnalysis, businessTypeExpansion);
    
    // Assess keyword quality
    const keywordQuality = this.assessKeywordQuality(enhancedKeywords);
    
    // Generate recommendations
    const recommendedActions = this.generateRecommendations(
      intelligentAnalysis,
      businessTypeExpansion,
      enhancedKeywords,
      businessConfidence,
      keywordQuality
    );
    
    // Identify coverage gaps
    const coverageGaps = this.identifyCoverageGaps(intelligentAnalysis, enhancedKeywords);
    
    return {
      businessConfidence,
      keywordQuality,
      recommendedActions,
      coverageGaps
    };
  }
  
  /**
   * Calculate overall business confidence score
   */
  private calculateBusinessConfidence(
    intelligentAnalysis: IntelligentBusinessResult,
    businessTypeExpansion: BusinessTypeExpansion
  ): 'high' | 'medium' | 'low' {
    let confidenceScore = 0;
    
    // Intelligent analysis confidence
    if (intelligentAnalysis.confirmedBusinessType.confidence === 'high') {
      confidenceScore += 0.4;
    } else if (intelligentAnalysis.confirmedBusinessType.confidence === 'medium') {
      confidenceScore += 0.2;
    }
    
    // Primary activity confidence
    if (intelligentAnalysis.extractedData.primaryActivities.length > 0) {
      confidenceScore += intelligentAnalysis.extractedData.primaryActivities[0].confidence * 0.3;
    }
    
    // Business type coverage
    if (!businessTypeExpansion.isNewType) {
      confidenceScore += 0.2; // Existing type = higher confidence
    }
    
    // Rich content indicators
    if (intelligentAnalysis.extractedData.services.length >= 3) {
      confidenceScore += 0.1;
    }
    
    if (confidenceScore >= 0.7) return 'high';
    if (confidenceScore >= 0.4) return 'medium';
    return 'low';
  }
  
  /**
   * Assess keyword generation quality
   */
  private assessKeywordQuality(enhancedKeywords: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const totalKeywords = enhancedKeywords.totalGenerated;
    const categoryBalance = Object.values(enhancedKeywords.categoryBreakdown).filter((count: any) => count > 0).length;
    
    if (totalKeywords >= 80 && categoryBalance >= 6) return 'excellent';
    if (totalKeywords >= 50 && categoryBalance >= 5) return 'good';
    if (totalKeywords >= 25 && categoryBalance >= 4) return 'fair';
    return 'poor';
  }
  
  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    intelligentAnalysis: IntelligentBusinessResult,
    businessTypeExpansion: BusinessTypeExpansion,
    enhancedKeywords: any,
    businessConfidence: string,
    keywordQuality: string
  ): string[] {
    const recommendations: string[] = [];
    
    // Business type recommendations
    if (businessTypeExpansion.isNewType) {
      recommendations.push(
        `New business type "${intelligentAnalysis.confirmedBusinessType.category}" detected - consider creating industry-specific content to establish authority`
      );
    }
    
    if (businessTypeExpansion.isNewSubcategory) {
      recommendations.push(
        `Subcategory "${intelligentAnalysis.confirmedBusinessType.subcategory}" identified - focus on specialized service pages to capture niche traffic`
      );
    }
    
    // Keyword strategy recommendations
    if (enhancedKeywords.categoryBreakdown.local > 0) {
      recommendations.push(
        'Strong local keyword opportunities found - optimize for local SEO and Google My Business'
      );
    }
    
    if (enhancedKeywords.categoryBreakdown.commercial > enhancedKeywords.categoryBreakdown.informational) {
      recommendations.push(
        'High commercial intent detected - focus on conversion-optimized service pages'
      );
    } else {
      recommendations.push(
        'Strong informational keyword potential - develop content marketing strategy with helpful guides and resources'
      );
    }
    
    // Content recommendations
    if (intelligentAnalysis.extractedData.services.length >= 5) {
      recommendations.push(
        'Multiple services identified - create dedicated landing pages for each service'
      );
    }
    
    if (businessConfidence === 'low') {
      recommendations.push(
        'Consider clarifying your service offerings and business focus on your website to improve SEO targeting'
      );
    }
    
    return recommendations;
  }
  
  /**
   * Identify potential coverage gaps
   */
  private identifyCoverageGaps(
    intelligentAnalysis: IntelligentBusinessResult,
    enhancedKeywords: any
  ): string[] {
    const gaps: string[] = [];
    
    // Check for missing keyword categories
    if (enhancedKeywords.categoryBreakdown.longTail < 5) {
      gaps.push('Limited long-tail keyword coverage - missing opportunities for specific customer queries');
    }
    
    if (enhancedKeywords.categoryBreakdown.local === 0 && intelligentAnalysis.extractedData.locationIndicators.length > 0) {
      gaps.push('Local business detected but no local keywords generated - location targeting needs improvement');
    }
    
    if (enhancedKeywords.categoryBreakdown.urgency === 0) {
      gaps.push('No urgency keywords found - missing emergency/immediate service opportunities');
    }
    
    // Check for service coverage gaps
    const uncoveredServices = intelligentAnalysis.extractedData.services.filter(service => 
      !Object.values(enhancedKeywords.keywordsByCategory).flat().some((kw: any) => 
        kw.keyword.includes(service.toLowerCase())
      )
    );
    
    if (uncoveredServices.length > 0) {
      gaps.push(`Services not covered by keywords: ${uncoveredServices.slice(0, 3).join(', ')}`);
    }
    
    return gaps;
  }
  
  /**
   * Assess overall data quality
   */
  private assessDataQuality(intelligentAnalysis: IntelligentBusinessResult) {
    // Content richness (0-1)
    const contentRichness = Math.min(
      (intelligentAnalysis.extractedData.websiteContent.serviceDescriptions.length * 0.2 +
       intelligentAnalysis.extractedData.websiteContent.navigation.length * 0.1 +
       intelligentAnalysis.extractedData.services.length * 0.1), 1.0
    );
    
    // Business clarity (0-1)
    const businessClarity = intelligentAnalysis.extractedData.primaryActivities.length > 0
      ? intelligentAnalysis.extractedData.primaryActivities[0].confidence
      : 0;
    
    // Keyword relevance (based on business type match)
    const keywordRelevance = intelligentAnalysis.confirmedBusinessType.confidence === 'high' ? 0.9 :
                           intelligentAnalysis.confirmedBusinessType.confidence === 'medium' ? 0.7 : 0.4;
    
    return {
      contentRichness,
      businessClarity,
      keywordRelevance
    };
  }
  
  /**
   * Determine company size from extracted data
   */
  private determineCompanySize(extractedData: any): 'micro' | 'small' | 'medium' | 'large' | 'enterprise' {
    const allContent = [
      extractedData.websiteContent.aboutText,
      ...extractedData.websiteContent.serviceDescriptions
    ].join(' ').toLowerCase();
    
    if (allContent.includes('enterprise') || allContent.includes('international')) return 'enterprise';
    if (allContent.includes('nationwide') || allContent.includes('group')) return 'large';
    if (allContent.includes('team') || allContent.includes('staff')) return 'medium';
    if (allContent.includes('family') || allContent.includes('independent')) return 'small';
    
    return 'micro';
  }
}

// Export convenience function
export async function analyzeBusinessComprehensively(domain: string, html: string): Promise<ComprehensiveBusinessAnalysis> {
  const service = new MasterBusinessAnalysisService();
  return await service.analyzeBusinessComprehensively(domain, html);
}