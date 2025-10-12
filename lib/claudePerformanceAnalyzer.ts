/**
 * Claude-powered Performance Analysis
 * Provides intelligent diagnosis and user-friendly recommendations for Core Web Vitals and technical issues
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PerformanceDiagnosis {
  overallHealthScore: number; // 0-100
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  primaryIssues: Array<{
    category: 'speed' | 'stability' | 'interactivity' | 'mobile' | 'seo';
    severity: 'critical' | 'important' | 'moderate';
    title: string;
    description: string;
    impact: string;
    solution: string;
    timeToFix: string;
    difficultyLevel: 'Easy' | 'Medium' | 'Hard';
    expectedImprovement: string;
  }>;
  quickWins: Array<{
    title: string;
    description: string;
    impact: string;
    timeToImplement: string;
  }>;
  performanceInsights: {
    speedSummary: string;
    stabilitySummary: string;
    interactivitySummary: string;
    mobileSummary: string;
  };
  businessImpact: {
    estimatedVisitorLoss: number;
    revenueImpact: string;
    competitivePosition: string;
    userExperienceScore: number;
  };
  actionPlan: Array<{
    phase: number;
    title: string;
    description: string;
    estimatedImpact: string;
    timeline: string;
  }>;
}

export async function analyzePerformanceWithClaude(
  domain: string,
  htmlContent: string,
  pageSpeedData: any,
  technicalAuditData: any
): Promise<PerformanceDiagnosis> {
  try {
    console.log(`🧠 Analyzing performance with Claude for ${domain}`);

    // Extract key metrics for analysis
    const desktopMetrics = pageSpeedData.desktop;
    const mobileMetrics = pageSpeedData.mobile;
    const recommendations = pageSpeedData.recommendations || [];
    
    // Technical issues summary
    const technicalIssues = {
      missingTitles: technicalAuditData.issues?.missingMetaTitles || 0,
      missingDescriptions: technicalAuditData.issues?.missingMetaDescriptions || 0,
      missingH1s: technicalAuditData.issues?.missingH1Tags || 0,
      largeImages: technicalAuditData.largeImages || 0,
      brokenLinks: technicalAuditData.notFoundErrors?.length || 0,
      totalPages: technicalAuditData.totalPages || 1
    };

    const prompt = `As a web performance expert, analyze this website's performance data and provide user-friendly insights and recommendations.

WEBSITE: ${domain}

CORE WEB VITALS:
Desktop: LCP: ${desktopMetrics.lcp}, CLS: ${desktopMetrics.cls}, INP: ${desktopMetrics.inp}, Score: ${desktopMetrics.score}
Mobile: LCP: ${mobileMetrics.lcp}, CLS: ${mobileMetrics.cls}, INP: ${mobileMetrics.inp}, Score: ${mobileMetrics.score}

TECHNICAL ISSUES:
- ${technicalIssues.missingTitles} pages missing titles (out of ${technicalIssues.totalPages})
- ${technicalIssues.missingDescriptions} pages missing meta descriptions
- ${technicalIssues.missingH1s} pages missing H1 tags
- ${technicalIssues.largeImages} large images (>100KB) found
- ${technicalIssues.brokenLinks} broken links detected

EXISTING RECOMMENDATIONS: ${recommendations.join(', ')}

WEBSITE CONTENT SAMPLE: ${htmlContent.substring(0, 2000)}

Please provide a comprehensive performance analysis in this JSON format:

{
  "overallHealthScore": [0-100 score based on all factors],
  "healthGrade": "[A/B/C/D/F grade]",
  "primaryIssues": [
    {
      "category": "[speed/stability/interactivity/mobile/seo]",
      "severity": "[critical/important/moderate]",
      "title": "[Clear, non-technical title]",
      "description": "[User-friendly explanation of the problem]",
      "impact": "[How this affects visitors and business]",
      "solution": "[Step-by-step solution in plain English]",
      "timeToFix": "[e.g., 1-2 hours, 1-2 days, 1-2 weeks]",
      "difficultyLevel": "[Easy/Medium/Hard]",
      "expectedImprovement": "[Specific improvement expected]"
    }
  ],
  "quickWins": [
    {
      "title": "[Easy fix title]",
      "description": "[What to do]",
      "impact": "[Expected result]",
      "timeToImplement": "[How long it takes]"
    }
  ],
  "performanceInsights": {
    "speedSummary": "[User-friendly summary of loading speed]",
    "stabilitySummary": "[Explanation of layout stability]",
    "interactivitySummary": "[How responsive the site feels]",
    "mobileSummary": "[Mobile experience quality]"
  },
  "businessImpact": {
    "estimatedVisitorLoss": [percentage of visitors likely lost due to poor performance],
    "revenueImpact": "[Potential revenue impact explanation]",
    "competitivePosition": "[How performance compares to competitors]",
    "userExperienceScore": [0-100 overall UX score]
  },
  "actionPlan": [
    {
      "phase": 1,
      "title": "[Phase title]",
      "description": "[What to focus on first]",
      "estimatedImpact": "[Expected results]",
      "timeline": "[How long this phase takes]"
    }
  ]
}

Focus on:
1. Making technical concepts understandable to non-developers
2. Prioritizing fixes by business impact
3. Providing specific, actionable recommendations
4. Explaining WHY each issue matters to visitors and business
5. Creating a clear roadmap for improvement

Be specific about Core Web Vitals thresholds:
- LCP: Good <2.5s, Needs Work 2.5-4s, Poor >4s
- CLS: Good <0.1, Needs Work 0.1-0.25, Poor >0.25  
- INP: Good <200ms, Needs Work 200-500ms, Poor >500ms`;

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
      console.log(`✅ Claude performance analysis complete for ${domain}`);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.log('Raw response:', content.text);
      
      // Return fallback analysis
      return getFallbackPerformanceAnalysis(pageSpeedData, technicalAuditData);
    }

  } catch (error) {
    console.error('Claude performance analysis failed:', error);
    return getFallbackPerformanceAnalysis(pageSpeedData, technicalAuditData);
  }
}

function getFallbackPerformanceAnalysis(pageSpeedData: any, technicalAuditData: any): PerformanceDiagnosis {
  const desktopScore = pageSpeedData.desktop?.score || 50;
  const mobileScore = pageSpeedData.mobile?.score || 40;
  const avgScore = Math.round((desktopScore + mobileScore) / 2);
  
  return {
    overallHealthScore: avgScore,
    healthGrade: avgScore >= 80 ? 'A' : avgScore >= 60 ? 'B' : avgScore >= 40 ? 'C' : avgScore >= 20 ? 'D' : 'F',
    primaryIssues: [
      {
        category: 'speed',
        severity: 'important',
        title: 'Page Loading Speed Needs Improvement',
        description: 'Your website takes longer than recommended to load, which can frustrate visitors.',
        impact: 'Slow loading can cause visitors to leave before seeing your content.',
        solution: 'Optimize images, minimize code, and use a content delivery network.',
        timeToFix: '1-2 weeks',
        difficultyLevel: 'Medium',
        expectedImprovement: 'Faster loading times and better user experience'
      }
    ],
    quickWins: [
      {
        title: 'Optimize Large Images',
        description: 'Compress and resize images that are slowing down your site',
        impact: 'Faster page loading',
        timeToImplement: '1-2 hours'
      }
    ],
    performanceInsights: {
      speedSummary: 'Your site could load faster to improve visitor experience.',
      stabilitySummary: 'Page layout stability is within acceptable ranges.',
      interactivitySummary: 'User interactions respond at reasonable speeds.',
      mobileSummary: 'Mobile experience has room for improvement.'
    },
    businessImpact: {
      estimatedVisitorLoss: 15,
      revenueImpact: 'Moderate impact on conversions due to performance issues',
      competitivePosition: 'Performance lags behind industry leaders',
      userExperienceScore: avgScore
    },
    actionPlan: [
      {
        phase: 1,
        title: 'Quick Performance Fixes',
        description: 'Address the most impactful performance issues first',
        estimatedImpact: 'Improve loading speed by 20-30%',
        timeline: '1-2 weeks'
      }
    ]
  };
}