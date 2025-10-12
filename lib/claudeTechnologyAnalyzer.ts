/**
 * Claude-powered Technology Intelligence Analyzer
 * Provides intelligent analysis, insights, and recommendations for website technology stacks
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TechnologyIntelligence {
  stackAnalysis: {
    overallScore: number; // 0-100
    maturityLevel: 'modern' | 'stable' | 'outdated' | 'legacy';
    architectureType: string;
    strengths: string[];
    weaknesses: string[];
    suitabilityRating: string;
  };
  performanceImpact: {
    loadTimeContribution: string;
    performanceScore: number; // 0-100
    optimizationOpportunities: string[];
    criticalIssues: string[];
    estimatedSpeedGain: string;
  };
  securityAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    securityScore: number; // 0-100
    vulnerabilities: string[];
    updateRecommendations: string[];
    complianceNotes: string[];
  };
  businessImpact: {
    maintenanceCost: 'low' | 'medium' | 'high';
    scalabilityRating: number; // 0-100
    futureProofScore: number; // 0-100
    competitiveAdvantage: string;
    businessRisks: string[];
  };
  modernizationRoadmap: Array<{
    phase: number;
    title: string;
    description: string;
    impact: string;
    timeframe: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    estimatedCost: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }>;
  quickWins: Array<{
    title: string;
    description: string;
    benefit: string;
    timeToImplement: string;
    estimatedImpact: string;
  }>;
  industryBenchmark: {
    comparison: string;
    modernityRank: string;
    recommendedUpgrades: string[];
  };
}

export async function analyzeTechnologyWithClaude(
  domain: string,
  htmlContent: string,
  technologyData: any
): Promise<TechnologyIntelligence> {
  try {
    console.log(`🧠 Analyzing technology stack with Claude for ${domain}`);

    // Extract technology information
    const cms = technologyData.cms || 'Not detected';
    const framework = technologyData.framework || 'Not detected';
    const hosting = technologyData.hosting || 'Not detected';
    const analytics = technologyData.analytics || 'Not detected';
    const cdn = technologyData.cdn || 'None detected';
    const plugins = Array.isArray(technologyData.plugins) ? technologyData.plugins : [];
    const pluginsByCategory = !Array.isArray(technologyData.plugins) ? technologyData.plugins : {};
    const totalPlugins = technologyData.totalPlugins || plugins.length;
    const technologies = technologyData.technologies || [];
    const confidence = technologyData.confidence || 'low';
    
    // Analyze HTML for additional context
    const contentLength = htmlContent.length;
    const scriptCount = (htmlContent.match(/<script[^>]*>/gi) || []).length;
    const linkCount = (htmlContent.match(/<link[^>]*>/gi) || []).length;
    const hasServiceWorker = htmlContent.includes('serviceWorker') || htmlContent.includes('sw.js');
    const hasWebComponents = htmlContent.includes('customElements') || htmlContent.includes('web-components');
    
    const prompt = `As a technology consultant and web development expert, analyze this website's technology stack and provide comprehensive insights and recommendations.

WEBSITE: ${domain}

DETECTED TECHNOLOGY STACK:
- CMS: ${cms}
- Framework: ${framework} 
- Hosting: ${hosting}
- Analytics: ${analytics}
- CDN: ${cdn}
- Plugins: ${totalPlugins > 0 ? `${totalPlugins} plugins detected` : plugins.join(', ') || 'None detected'}
- Other Technologies: ${technologies.join(', ') || 'Basic web technologies'}
- Detection Confidence: ${confidence}

WEBSITE CHARACTERISTICS:
- Content Size: ${Math.round(contentLength / 1024)}KB
- Script Elements: ${scriptCount}
- Stylesheet Links: ${linkCount}
- Service Worker: ${hasServiceWorker ? 'Yes' : 'No'}
- Web Components: ${hasWebComponents ? 'Yes' : 'No'}

CONTENT SAMPLE (first 2000 chars):
${htmlContent.substring(0, 2000)}

Provide a comprehensive technology intelligence analysis in this JSON format:

{
  "stackAnalysis": {
    "overallScore": [0-100 overall technology stack quality score],
    "maturityLevel": "[modern/stable/outdated/legacy]",
    "architectureType": "[Brief description of the architecture approach]",
    "strengths": ["List of key strengths of this technology combination"],
    "weaknesses": ["List of potential weaknesses or limitations"],
    "suitabilityRating": "[How well this stack suits the website's apparent purpose]"
  },
  "performanceImpact": {
    "loadTimeContribution": "[How the tech stack affects loading speed]",
    "performanceScore": [0-100 performance optimization score],
    "optimizationOpportunities": ["Specific ways to improve performance"],
    "criticalIssues": ["Performance-related issues that need immediate attention"],
    "estimatedSpeedGain": "[Potential speed improvement with optimizations]"
  },
  "securityAssessment": {
    "riskLevel": "[low/medium/high/critical]",
    "securityScore": [0-100 security posture score],
    "vulnerabilities": ["Known security concerns with detected technologies"],
    "updateRecommendations": ["Specific security updates or patches needed"],
    "complianceNotes": ["Compliance considerations (GDPR, accessibility, etc.)"]
  },
  "businessImpact": {
    "maintenanceCost": "[low/medium/high]",
    "scalabilityRating": [0-100 how well the stack scales],
    "futureProofScore": [0-100 how future-proof the technology choices are],
    "competitiveAdvantage": "[How the tech stack affects competitive position]",
    "businessRisks": ["Business risks associated with current technology choices"]
  },
  "modernizationRoadmap": [
    {
      "phase": 1,
      "title": "[Modernization step title]",
      "description": "[What this step involves]",
      "impact": "[Expected business/performance impact]",
      "timeframe": "[Implementation timeline]",
      "difficulty": "[Easy/Medium/Hard]",
      "estimatedCost": "[Rough cost estimate]",
      "priority": "[critical/high/medium/low]"
    }
  ],
  "quickWins": [
    {
      "title": "[Quick improvement title]",
      "description": "[What to do]",
      "benefit": "[Expected benefit]",
      "timeToImplement": "[How long it takes]",
      "estimatedImpact": "[Specific impact expected]"
    }
  ],
  "industryBenchmark": {
    "comparison": "[How this stack compares to industry standards]",
    "modernityRank": "[Rank against current industry practices]",
    "recommendedUpgrades": ["Technologies that would improve competitive position"]
  }
}

Focus on:
1. Making technical concepts understandable for business users
2. Providing specific, actionable recommendations
3. Explaining the business impact of technology choices
4. Prioritizing recommendations by impact and feasibility
5. Considering security, performance, maintainability, and cost
6. Providing realistic timelines and cost estimates
7. Explaining why each recommendation matters

Consider the website's apparent industry, size, and purpose when making recommendations.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
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
      // Handle Claude responses that might have text before/after JSON
      let jsonText = content.text.trim();
      
      // Find the JSON content by looking for the first { and last }
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }
      
      const analysis = JSON.parse(jsonText);
      console.log(`✅ Claude technology analysis complete for ${domain}`);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse Claude technology response:', parseError);
      console.log('Raw response:', content.text);
      
      // Return fallback analysis
      return getFallbackTechnologyAnalysis(technologyData);
    }

  } catch (error) {
    console.error('Claude technology analysis failed:', error);
    return getFallbackTechnologyAnalysis(technologyData);
  }
}

function getFallbackTechnologyAnalysis(technologyData: any): TechnologyIntelligence {
  const cms = technologyData.cms || 'Not detected';
  const hasModernTech = technologyData.framework && technologyData.framework !== 'Not detected';
  const hasCDN = technologyData.cdn && technologyData.cdn !== 'None detected';
  
  // Calculate basic scores based on detected technologies
  let overallScore = 60; // Base score
  if (cms !== 'Not detected') overallScore += 10;
  if (hasModernTech) overallScore += 15;
  if (hasCDN) overallScore += 10;
  if (technologyData.confidence === 'high') overallScore += 5;
  
  const maturityLevel = overallScore >= 85 ? 'modern' : 
                       overallScore >= 70 ? 'stable' : 
                       overallScore >= 50 ? 'outdated' : 'legacy';

  return {
    stackAnalysis: {
      overallScore: Math.min(100, overallScore),
      maturityLevel,
      architectureType: cms !== 'Not detected' ? `${cms}-based website architecture` : 'Standard web architecture',
      strengths: [
        cms !== 'Not detected' ? `Uses ${cms} for content management` : 'Basic web structure',
        hasCDN ? 'Content delivery network for faster loading' : 'Standard hosting setup'
      ].filter(Boolean),
      weaknesses: [
        !hasModernTech ? 'No modern JavaScript framework detected' : '',
        !hasCDN ? 'No CDN detected for global performance' : '',
        technologyData.confidence === 'low' ? 'Limited technology detection confidence' : ''
      ].filter(Boolean),
      suitabilityRating: 'Technology stack appears suitable for basic website needs'
    },
    performanceImpact: {
      loadTimeContribution: 'Technology stack has moderate impact on loading speed',
      performanceScore: overallScore,
      optimizationOpportunities: [
        'Implement caching strategies',
        'Optimize images and assets',
        'Consider CDN implementation'
      ],
      criticalIssues: overallScore < 50 ? ['Outdated technology stack may impact performance'] : [],
      estimatedSpeedGain: '10-30% improvement possible with optimizations'
    },
    securityAssessment: {
      riskLevel: overallScore >= 70 ? 'low' : overallScore >= 50 ? 'medium' : 'high',
      securityScore: overallScore,
      vulnerabilities: overallScore < 60 ? ['Potentially outdated software components'] : [],
      updateRecommendations: ['Keep all software components up to date', 'Implement security headers'],
      complianceNotes: ['Ensure GDPR compliance for EU visitors', 'Consider accessibility standards']
    },
    businessImpact: {
      maintenanceCost: overallScore >= 70 ? 'medium' : 'high',
      scalabilityRating: overallScore,
      futureProofScore: overallScore,
      competitiveAdvantage: 'Technology stack provides standard competitive positioning',
      businessRisks: overallScore < 60 ? ['Potential security vulnerabilities', 'Performance limitations'] : []
    },
    modernizationRoadmap: [
      {
        phase: 1,
        title: 'Assess Current Performance',
        description: 'Evaluate current technology performance and identify immediate improvements',
        impact: 'Better understanding of optimization opportunities',
        timeframe: '1-2 weeks',
        difficulty: 'Easy',
        estimatedCost: 'Low',
        priority: 'high'
      }
    ],
    quickWins: [
      {
        title: 'Enable Caching',
        description: 'Implement browser and server-side caching',
        benefit: 'Faster page loading for returning visitors',
        timeToImplement: '1-2 hours',
        estimatedImpact: '20-40% faster repeat visits'
      }
    ],
    industryBenchmark: {
      comparison: 'Technology stack meets basic industry standards',
      modernityRank: maturityLevel === 'modern' ? 'Above average' : 
                    maturityLevel === 'stable' ? 'Average' : 'Below average',
      recommendedUpgrades: ['Consider modern performance optimizations', 'Evaluate security enhancements']
    }
  };
}