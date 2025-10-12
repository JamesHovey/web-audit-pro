/**
 * Claude-powered Technical SEO Intelligence
 * Analyzes content structure and provides actionable SEO recommendations
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TechnicalSEOIntelligence {
  seoHealthScore: number; // 0-100
  contentQuality: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  structureAnalysis: {
    headingStructure: string;
    contentFlow: string;
    readabilityScore: number;
    keywordOptimization: string;
  };
  schemaOpportunities: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    implementation: string;
    expectedBenefit: string;
  }>;
  mobileOptimization: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  technicalRecommendations: Array<{
    category: 'content' | 'structure' | 'meta' | 'performance' | 'mobile';
    priority: 'critical' | 'important' | 'moderate';
    title: string;
    description: string;
    implementation: string;
    impact: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }>;
  competitiveAdvantages: string[];
  quickSEOWins: Array<{
    title: string;
    action: string;
    timeRequired: string;
    expectedImprovement: string;
  }>;
}

export async function analyzeTechnicalSEOWithClaude(
  domain: string,
  htmlContent: string,
  technicalAuditData: any
): Promise<TechnicalSEOIntelligence> {
  try {
    console.log(`🔍 Analyzing Technical SEO with Claude for ${domain}`);

    // Extract content analysis data
    const pageTitle = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title found';
    const metaDescription = htmlContent.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 'No description found';
    const h1Tags = (htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []).map(h1 => h1.replace(/<[^>]*>/g, ''));
    const h2Tags = (htmlContent.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []).slice(0, 5);
    
    // Technical issues summary
    const issues = {
      missingTitles: technicalAuditData.issues?.missingMetaTitles || 0,
      missingDescriptions: technicalAuditData.issues?.missingMetaDescriptions || 0,
      missingH1s: technicalAuditData.issues?.missingH1Tags || 0,
      totalPages: technicalAuditData.totalPages || 1,
      sitemapStatus: technicalAuditData.sitemapStatus || 'missing',
      robotsStatus: technicalAuditData.robotsTxtStatus || 'missing',
      httpsStatus: technicalAuditData.httpsStatus || 'unknown'
    };

    const prompt = `As a Technical SEO expert, analyze this website's content and structure to provide actionable SEO recommendations.

WEBSITE: ${domain}

CURRENT CONTENT:
Title: "${pageTitle}"
Meta Description: "${metaDescription}"
H1 Tags: ${h1Tags.length > 0 ? h1Tags.join(', ') : 'None found'}
H2 Tags Sample: ${h2Tags.map(h2 => h2.replace(/<[^>]*>/g, '')).join(', ')}

TECHNICAL STATUS:
- ${issues.missingTitles}/${issues.totalPages} pages missing titles
- ${issues.missingDescriptions}/${issues.totalPages} pages missing meta descriptions  
- ${issues.missingH1s}/${issues.totalPages} pages missing H1 tags
- Sitemap: ${issues.sitemapStatus}
- Robots.txt: ${issues.robotsStatus}
- HTTPS: ${issues.httpsStatus}

CONTENT SAMPLE (first 2000 chars):
${htmlContent.substring(0, 2000)}

Provide a comprehensive Technical SEO analysis in this JSON format:

{
  "seoHealthScore": [0-100 overall SEO health score],
  "contentQuality": {
    "score": [0-100 content quality score],
    "strengths": ["List of content strengths"],
    "improvements": ["Specific content improvements needed"]
  },
  "structureAnalysis": {
    "headingStructure": "[Analysis of H1-H6 structure and hierarchy]",
    "contentFlow": "[How well content flows and connects]",
    "readabilityScore": [0-100 how easy content is to read],
    "keywordOptimization": "[Assessment of keyword usage and optimization]"
  },
  "schemaOpportunities": [
    {
      "type": "[Schema type like Organization, Article, Product, etc.]",
      "priority": "[high/medium/low]",
      "description": "[Why this schema would help]",
      "implementation": "[How to implement it]",
      "expectedBenefit": "[What improvement to expect]"
    }
  ],
  "mobileOptimization": {
    "score": [0-100 mobile SEO score],
    "issues": ["Mobile-specific issues found"],
    "recommendations": ["Mobile optimization recommendations"]
  },
  "technicalRecommendations": [
    {
      "category": "[content/structure/meta/performance/mobile]",
      "priority": "[critical/important/moderate]",
      "title": "[Clear, actionable title]",
      "description": "[User-friendly explanation]",
      "implementation": "[Step-by-step implementation guide]",
      "impact": "[Expected SEO impact]",
      "difficulty": "[Easy/Medium/Hard]"
    }
  ],
  "competitiveAdvantages": ["List of SEO opportunities that could give competitive edge"],
  "quickSEOWins": [
    {
      "title": "[Quick fix title]",
      "action": "[Specific action to take]",
      "timeRequired": "[How long it takes]",
      "expectedImprovement": "[What improvement to expect]"
    }
  ]
}

Focus on:
1. Making technical SEO concepts understandable for non-experts
2. Prioritizing recommendations by impact and difficulty
3. Providing specific, actionable steps
4. Explaining the business value of each recommendation
5. Identifying quick wins that can be implemented immediately

Consider the website's apparent industry/purpose and tailor recommendations accordingly.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    try {
      const analysis = JSON.parse(content.text);
      console.log(`✅ Claude Technical SEO analysis complete for ${domain}`);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse Claude Technical SEO response:', parseError);
      console.log('Raw response:', content.text);
      
      // Return fallback analysis
      return getFallbackTechnicalSEOAnalysis(technicalAuditData);
    }

  } catch (error) {
    console.error('Claude Technical SEO analysis failed:', error);
    return getFallbackTechnicalSEOAnalysis(technicalAuditData);
  }
}

function getFallbackTechnicalSEOAnalysis(technicalAuditData: any): TechnicalSEOIntelligence {
  const issues = technicalAuditData.issues || {};
  const totalPages = technicalAuditData.totalPages || 1;
  
  // Calculate basic SEO score
  const titleScore = Math.max(0, 100 - (issues.missingMetaTitles / totalPages) * 100);
  const descScore = Math.max(0, 100 - (issues.missingMetaDescriptions / totalPages) * 100);
  const h1Score = Math.max(0, 100 - (issues.missingH1Tags / totalPages) * 100);
  const seoScore = Math.round((titleScore + descScore + h1Score) / 3);
  
  return {
    seoHealthScore: seoScore,
    contentQuality: {
      score: seoScore,
      strengths: ['Basic page structure is present'],
      improvements: ['Improve meta titles and descriptions', 'Optimize heading structure']
    },
    structureAnalysis: {
      headingStructure: 'Basic heading structure detected',
      contentFlow: 'Content organization could be improved',
      readabilityScore: 70,
      keywordOptimization: 'Keyword optimization opportunities exist'
    },
    schemaOpportunities: [
      {
        type: 'Organization',
        priority: 'medium',
        description: 'Add organization schema to help search engines understand your business',
        implementation: 'Add JSON-LD schema markup to your website header',
        expectedBenefit: 'Better business information display in search results'
      }
    ],
    mobileOptimization: {
      score: 75,
      issues: ['Mobile responsiveness could be improved'],
      recommendations: ['Ensure text is readable without zooming', 'Optimize touch targets']
    },
    technicalRecommendations: [
      {
        category: 'meta',
        priority: 'important',
        title: 'Improve Meta Tags',
        description: 'Add missing title tags and meta descriptions to improve search visibility',
        implementation: 'Review each page and add unique, descriptive titles and descriptions',
        impact: 'Better search engine rankings and click-through rates',
        difficulty: 'Easy'
      }
    ],
    competitiveAdvantages: ['Optimize meta tags for better search visibility'],
    quickSEOWins: [
      {
        title: 'Add Missing Meta Descriptions',
        action: 'Write unique descriptions for pages missing them',
        timeRequired: '1-2 hours',
        expectedImprovement: 'Better search result appearance'
      }
    ]
  };
}