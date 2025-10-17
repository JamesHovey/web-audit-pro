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
      // Enhanced JSON extraction with multiple strategies
      let jsonText = content.text.trim();

      // Strategy 1: Find JSON between first { and last }
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }

      // Strategy 2: Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Strategy 3: Fix common JSON issues
      // Remove control characters that break JSON parsing
      jsonText = jsonText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

      // Strategy 4: Handle escaped newlines in strings
      jsonText = jsonText.replace(/\\n/g, ' ').replace(/\n/g, ' ');

      // Strategy 5: Fix trailing commas (common Claude mistake)
      jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');

      const analysis = JSON.parse(jsonText);
      console.log(`✅ Claude technology analysis complete for ${domain}`);
      return analysis;
    } catch (parseError) {
      console.error('❌ Failed to parse Claude technology response:', parseError);
      console.log('📄 Raw response length:', content.text.length, 'chars');
      console.log('📄 First 500 chars:', content.text.substring(0, 500));
      console.log('📄 Last 200 chars:', content.text.substring(content.text.length - 200));

      // Return contextual fallback analysis
      console.log('🔄 Using enhanced contextual fallback analysis');
      return getFallbackTechnologyAnalysis(technologyData, domain);
    }

  } catch (error) {
    console.error('❌ Claude technology analysis failed:', error);
    console.log('🔄 Using enhanced contextual fallback analysis');
    return getFallbackTechnologyAnalysis(technologyData, domain);
  }
}

function getFallbackTechnologyAnalysis(technologyData: any, domain: string = 'website'): TechnologyIntelligence {
  console.log(`🔧 Generating contextual fallback analysis for ${domain}`);

  // Extract all technology information
  const cms = technologyData.cms || 'Not detected';
  const framework = technologyData.framework || 'Not detected';
  const hosting = technologyData.hosting || 'Not detected';
  const analytics = technologyData.analytics || 'Not detected';
  const cdn = technologyData.cdn || 'None detected';
  const pageBuilder = technologyData.pageBuilder || 'Not detected';
  const plugins = Array.isArray(technologyData.plugins) ? technologyData.plugins : [];
  const pluginsByCategory = !Array.isArray(technologyData.plugins) ? technologyData.plugins : {};

  const hasModernTech = framework !== 'Not detected';
  const hasCDN = cdn !== 'None detected';
  const isWordPress = cms.toLowerCase().includes('wordpress');
  const hasPageBuilder = pageBuilder !== 'Not detected';
  const totalPlugins = plugins.length || Object.values(pluginsByCategory).flat().length || 0;

  // Calculate contextual score
  let overallScore = 60; // Base score
  if (cms !== 'Not detected') overallScore += 10;
  if (hasModernTech) overallScore += 15;
  if (hasCDN) overallScore += 10;
  if (technologyData.confidence === 'high') overallScore += 5;
  if (isWordPress && totalPlugins > 0) overallScore += 5; // WordPress with plugins is good

  const maturityLevel = overallScore >= 85 ? 'modern' :
                       overallScore >= 70 ? 'stable' :
                       overallScore >= 50 ? 'outdated' : 'legacy';

  // Generate contextual strengths
  const strengths: string[] = [];
  if (cms !== 'Not detected') strengths.push(`Uses ${cms} CMS for easy content management`);
  if (hasCDN) strengths.push(`${cdn} CDN improves global loading speeds`);
  if (hasModernTech) strengths.push(`Modern ${framework} framework for better performance`);
  if (hasPageBuilder) strengths.push(`${pageBuilder} page builder for flexible design`);
  if (hosting !== 'Not detected') strengths.push(`Hosted on ${hosting}`);
  if (analytics !== 'Not detected') strengths.push(`${analytics} tracking for visitor insights`);
  if (strengths.length === 0) strengths.push('Standard web hosting configuration');

  // Generate contextual weaknesses
  const weaknesses: string[] = [];
  if (!hasCDN) weaknesses.push('No CDN detected - could improve global performance');
  if (!hasModernTech && isWordPress) weaknesses.push('Could benefit from modern JavaScript framework for enhanced interactivity');
  if (analytics === 'Not detected') weaknesses.push('No analytics detected - unable to track visitor behavior');
  if (isWordPress && totalPlugins === 0) weaknesses.push('No WordPress plugins detected - may be missing essential functionality');
  if (isWordPress && totalPlugins > 20) weaknesses.push(`High plugin count (${totalPlugins}) may impact performance`);

  // Generate contextual quick wins based on detected stack
  const quickWins: Array<{title: string; description: string; benefit: string; timeToImplement: string; estimatedImpact: string}> = [];

  // WordPress-specific quick wins
  if (isWordPress) {
    // Check for caching plugins
    const hasCachingPlugin = plugins.some((p: string) =>
      p.toLowerCase().includes('cache') ||
      p.toLowerCase().includes('wp rocket') ||
      p.toLowerCase().includes('w3 total')
    );

    if (!hasCachingPlugin) {
      quickWins.push({
        title: 'Install WordPress Caching Plugin',
        description: `Install WP Rocket, W3 Total Cache, or WP Super Cache on your ${cms} site`,
        benefit: 'Dramatically reduces page load times for repeat visitors',
        timeToImplement: '30 minutes',
        estimatedImpact: '40-60% faster page loads'
      });
    }

    // Check for image optimization
    const hasImageOptimization = plugins.some((p: string) =>
      p.toLowerCase().includes('image') ||
      p.toLowerCase().includes('smush') ||
      p.toLowerCase().includes('imagify')
    );

    if (!hasImageOptimization) {
      quickWins.push({
        title: 'Add Image Optimization Plugin',
        description: 'Install Smush, Imagify, or ShortPixel to automatically compress images',
        benefit: 'Reduces bandwidth usage and improves page speed',
        timeToImplement: '20 minutes',
        estimatedImpact: '25-35% reduction in page size'
      });
    }

    // Check for security plugin
    const hasSecurityPlugin = plugins.some((p: string) =>
      p.toLowerCase().includes('security') ||
      p.toLowerCase().includes('wordfence') ||
      p.toLowerCase().includes('sucuri')
    );

    if (!hasSecurityPlugin) {
      quickWins.push({
        title: 'Install WordPress Security Plugin',
        description: 'Add Wordfence or iThemes Security to protect against attacks',
        benefit: 'Protects site from hacking attempts and malware',
        timeToImplement: '45 minutes',
        estimatedImpact: 'Significant reduction in security vulnerabilities'
      });
    }
  }

  // CDN recommendation if not present
  if (!hasCDN) {
    quickWins.push({
      title: 'Implement Content Delivery Network',
      description: isWordPress ?
        'Enable Cloudflare (free tier) through your hosting panel or WordPress plugin' :
        'Set up Cloudflare CDN to serve content from global edge servers',
      benefit: 'Faster loading for visitors worldwide, reduced server load',
      timeToImplement: '1-2 hours',
      estimatedImpact: '30-50% faster international load times'
    });
  }

  // Analytics if not present
  if (analytics === 'Not detected') {
    quickWins.push({
      title: 'Add Website Analytics',
      description: 'Install Google Analytics 4 or a privacy-friendly alternative like Plausible',
      benefit: 'Understand visitor behavior and improve marketing effectiveness',
      timeToImplement: '30 minutes',
      estimatedImpact: 'Data-driven decision making for website improvements'
    });
  }

  // Generic performance win if we don't have many specific ones
  if (quickWins.length < 2) {
    quickWins.push({
      title: 'Optimize Image Formats',
      description: 'Convert images to WebP format for better compression without quality loss',
      benefit: 'Significantly reduces page size while maintaining visual quality',
      timeToImplement: '2-3 hours',
      estimatedImpact: '30-45% reduction in image file sizes'
    });
  }

  // Ensure we have at least one quick win
  if (quickWins.length === 0) {
    quickWins.push({
      title: 'Enable Browser Caching',
      description: 'Configure server to tell browsers to cache static assets locally',
      benefit: 'Faster repeat visits as browsers reuse cached files',
      timeToImplement: '30 minutes',
      estimatedImpact: '40-50% faster repeat page loads'
    });
  }

  // Contextual optimization opportunities
  const optimizationOpportunities: string[] = [];
  if (isWordPress) {
    optimizationOpportunities.push('Review and remove unused WordPress plugins to reduce overhead');
    optimizationOpportunities.push('Keep WordPress core and all plugins updated to latest versions');
  }
  if (!hasCDN) optimizationOpportunities.push('Implement CDN for global performance improvement');
  optimizationOpportunities.push('Compress and optimize all images (aim for <200KB per image)');
  optimizationOpportunities.push('Minify CSS, JavaScript, and HTML files');
  if (isWordPress) optimizationOpportunities.push('Use lazy loading for images below the fold');

  // Contextual security recommendations
  const updateRecommendations: string[] = [];
  if (isWordPress) {
    updateRecommendations.push('Keep WordPress core updated (currently released updates should be applied monthly)');
    updateRecommendations.push('Update all plugins to their latest versions to patch security vulnerabilities');
    updateRecommendations.push('Implement strong admin passwords and two-factor authentication');
  }
  updateRecommendations.push('Configure security headers (Content-Security-Policy, X-Frame-Options)');
  updateRecommendations.push('Enable HTTPS and install SSL certificate if not already done');
  if (isWordPress) updateRecommendations.push('Disable XML-RPC if not needed to prevent brute force attacks');

  const vulnerabilities: string[] = [];
  if (isWordPress && totalPlugins > 15) {
    vulnerabilities.push(`High plugin count (${totalPlugins}) increases attack surface - audit and remove unused plugins`);
  }
  if (!hasCDN && hosting !== 'Not detected') {
    vulnerabilities.push('Without CDN, site more vulnerable to DDoS attacks');
  }

  return {
    stackAnalysis: {
      overallScore: Math.min(100, overallScore),
      maturityLevel,
      architectureType: cms !== 'Not detected' ?
        `${cms}${hasPageBuilder ? ` with ${pageBuilder}` : ''} website architecture` :
        'Standard web architecture',
      strengths,
      weaknesses: weaknesses.length > 0 ? weaknesses : ['No significant weaknesses detected'],
      suitabilityRating: cms !== 'Not detected' ?
        `${cms} is a solid choice for content management, ${hosting !== 'Not detected' ? `hosted on ${hosting}` : 'with standard hosting'}` :
        'Technology stack appears suitable for basic website needs'
    },
    performanceImpact: {
      loadTimeContribution: isWordPress && totalPlugins > 15 ?
        `WordPress with ${totalPlugins} plugins may add 1-3 seconds to load time` :
        isWordPress ?
        'WordPress with optimized plugins typically loads in 2-3 seconds' :
        'Technology stack has moderate impact on loading speed',
      performanceScore: overallScore,
      optimizationOpportunities,
      criticalIssues: overallScore < 50 ?
        ['Outdated technology stack may severely impact performance', 'Consider platform modernization'] :
        [],
      estimatedSpeedGain: hasCDN && isWordPress ?
        '15-25% with caching optimization' :
        !hasCDN ?
        '40-60% with CDN and caching implementation' :
        '20-35% with performance optimizations'
    },
    securityAssessment: {
      riskLevel: (overallScore >= 70 && (isWordPress ? totalPlugins < 20 : true)) ? 'low' :
                 overallScore >= 50 ? 'medium' : 'high',
      securityScore: Math.max(0, overallScore - (isWordPress && totalPlugins > 20 ? 10 : 0)),
      vulnerabilities,
      updateRecommendations,
      complianceNotes: [
        'Ensure GDPR compliance for EU visitors (cookie consent, privacy policy)',
        'Consider WCAG 2.1 accessibility standards for inclusive design',
        isWordPress ? 'Regular WordPress security audits recommended (monthly)' : 'Regular security audits recommended'
      ]
    },
    businessImpact: {
      maintenanceCost: isWordPress && totalPlugins > 15 ? 'medium' :
                       isWordPress ? 'low' :
                       overallScore >= 70 ? 'low' : 'medium',
      scalabilityRating: hasModernTech ? 80 : hasCDN ? 70 : 60,
      futureProofScore: hasModernTech ? 85 :
                       isWordPress ? 75 :
                       overallScore,
      competitiveAdvantage: cms !== 'Not detected' ?
        `${cms} provides ${hasCDN ? 'strong' : 'good'} foundation with ${hasModernTech ? 'modern' : 'standard'} capabilities` :
        'Technology stack provides standard competitive positioning',
      businessRisks: [
        ...(overallScore < 60 ? ['Potential security vulnerabilities from outdated components'] : []),
        ...(isWordPress && totalPlugins > 20 ? ['High plugin count may lead to conflicts and maintenance burden'] : []),
        ...(!hasCDN ? ['Limited global reach without CDN'] : [])
      ]
    },
    modernizationRoadmap: [
      {
        phase: 1,
        title: isWordPress ? 'WordPress Performance Audit' : 'Performance Assessment',
        description: isWordPress ?
          'Review all WordPress plugins, remove unused ones, and optimize database' :
          'Evaluate current technology performance and identify immediate improvements',
        impact: isWordPress ?
          'Cleaner, faster WordPress installation with reduced security risk' :
          'Better understanding of optimization opportunities',
        timeframe: '1-2 weeks',
        difficulty: 'Easy',
        estimatedCost: 'Low',
        priority: 'high'
      },
      ...(!hasCDN ? [{
        phase: 2,
        title: 'Implement CDN',
        description: 'Set up Cloudflare or similar CDN to distribute content globally',
        impact: 'Dramatically faster load times for international visitors',
        timeframe: '2-3 days',
        difficulty: 'Easy',
        estimatedCost: 'Free (Cloudflare free tier)',
        priority: 'high' as const
      }] : [])
    ],
    quickWins: quickWins.slice(0, 3), // Limit to top 3 most relevant
    industryBenchmark: {
      comparison: cms !== 'Not detected' ?
        `${cms} is used by ${isWordPress ? '43%' : 'millions'} of websites worldwide and ${hasCDN ? 'with CDN ' : ''}meets ${hasModernTech ? 'modern' : 'standard'} industry practices` :
        'Technology stack meets basic industry standards',
      modernityRank: maturityLevel === 'modern' ? 'Above average' :
                    maturityLevel === 'stable' ? 'Average' :
                    'Below average',
      recommendedUpgrades: [
        ...(isWordPress && !hasCDN ? ['Cloudflare CDN integration for WordPress'] : []),
        ...(isWordPress ? ['Premium caching solution (WP Rocket)'] : []),
        ...(!hasModernTech ? ['Consider modern frontend framework for enhanced user experience'] : []),
        ...(analytics === 'Not detected' ? ['Website analytics implementation'] : [])
      ].slice(0, 3)
    }
  };
}