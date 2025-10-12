/**
 * Claude-Powered Universal Plugin & Extension Detection System
 * Detects and categorizes plugins/extensions for WordPress and top 100 CMS platforms
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DetectedPlugin {
  name: string;
  category: 'security' | 'performance' | 'seo' | 'ecommerce' | 'analytics' | 'social' | 'backup' | 'forms' | 'page-builder' | 'content' | 'payment' | 'marketing' | 'integration' | 'utility' | 'theme' | 'other';
  subcategory?: string;
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  performanceImpact: 'minimal' | 'low' | 'medium' | 'high';
  recommendations: string[];
  detectionEvidence: string[];
}

export interface PlatformAnalysis {
  platform: string;
  platformVersion?: string;
  totalPluginsDetected: number;
  pluginsByCategory: Record<string, DetectedPlugin[]>;
  securityAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    vulnerablePlugins: DetectedPlugin[];
    recommendations: string[];
  };
  performanceAnalysis: {
    heavyPlugins: DetectedPlugin[];
    optimizationOpportunities: string[];
    estimatedSpeedImpact: string;
  };
  businessInsights: {
    pluginPurpose: string;
    businessType: string;
    recommendedImprovements: string[];
    missingEssentials: string[];
  };
  conflicts: {
    redundantPlugins: string[];
    potentialConflicts: string[];
  };
}

export async function detectPluginsWithClaude(
  platform: string,
  htmlContent: string,
  headers: Record<string, string>,
  url: string
): Promise<PlatformAnalysis> {
  try {
    console.log(`🧠 Analyzing ${platform} plugins and extensions with Claude for ${url}`);

    // Analyze HTML for content clues
    const contentLength = htmlContent.length;
    const scriptCount = (htmlContent.match(/<script[^>]*>/gi) || []).length;
    const linkCount = (htmlContent.match(/<link[^>]*>/gi) || []).length;
    const formCount = (htmlContent.match(/<form[^>]*>/gi) || []).length;
    
    // Extract key HTML sections for analysis
    const headSection = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
    const scriptTags = htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    const linkTags = htmlContent.match(/<link[^>]*>/gi) || [];
    const metaTags = htmlContent.match(/<meta[^>]*>/gi) || [];
    
    // Prepare comprehensive content sample for Claude
    const analysisContent = {
      htmlSample: htmlContent.substring(0, 8000), // First 8KB for context
      headSection: headSection.substring(0, 3000),
      scriptSources: scriptTags.slice(0, 20).map(tag => {
        const src = tag.match(/src=["']([^"']+)["']/)?.[1];
        return src ? src.substring(src.lastIndexOf('/') + 1) : 'inline';
      }),
      linkSources: linkTags.slice(0, 15).map(tag => {
        const href = tag.match(/href=["']([^"']+)["']/)?.[1];
        return href ? href.substring(href.lastIndexOf('/') + 1) : 'unknown';
      }),
      metaInfo: metaTags.slice(0, 10),
      serverHeaders: Object.keys(headers).map(key => `${key}: ${headers[key]}`).slice(0, 10)
    };

    const prompt = `As an expert web technology analyst, analyze this ${platform} website and provide comprehensive plugin/extension detection and categorization.

WEBSITE: ${url}
PLATFORM: ${platform}

WEBSITE CHARACTERISTICS:
- Content Size: ${Math.round(contentLength / 1024)}KB
- Script Elements: ${scriptCount}
- Stylesheet Links: ${linkCount}
- Forms: ${formCount}

HTML HEAD SECTION:
${analysisContent.headSection}

SCRIPT SOURCES (first 20):
${analysisContent.scriptSources.join('\n')}

STYLESHEET SOURCES (first 15):
${analysisContent.linkSources.join('\n')}

META TAGS:
${analysisContent.metaInfo.join('\n')}

SERVER HEADERS:
${analysisContent.serverHeaders.join('\n')}

HTML CONTENT SAMPLE:
${analysisContent.htmlSample}

Provide a comprehensive analysis in this JSON format:

{
  "platform": "${platform}",
  "platformVersion": "[detected version if possible]",
  "detectedPlugins": [
    {
      "name": "[plugin/extension name]",
      "category": "[security|performance|seo|ecommerce|analytics|social|backup|forms|page-builder|content|payment|marketing|integration|utility|theme|other]",
      "subcategory": "[specific subcategory like 'caching', 'firewall', 'social-sharing', etc.]",
      "confidence": "[high|medium|low]",
      "version": "[version if detectable]",
      "description": "[what this plugin does]",
      "riskLevel": "[low|medium|high|critical]",
      "performanceImpact": "[minimal|low|medium|high]",
      "recommendations": ["specific recommendations for this plugin"],
      "detectionEvidence": ["specific HTML/CSS/JS evidence found"]
    }
  ],
  "securityAssessment": {
    "overallRisk": "[low|medium|high|critical]",
    "vulnerablePlugins": ["list of plugin names with known issues"],
    "recommendations": ["security-specific recommendations"]
  },
  "performanceAnalysis": {
    "heavyPlugins": ["plugins that significantly impact performance"],
    "optimizationOpportunities": ["specific performance improvement suggestions"],
    "estimatedSpeedImpact": "[description of how plugins affect loading speed]"
  },
  "businessInsights": {
    "pluginPurpose": "[what the website is trying to achieve based on plugins]",
    "businessType": "[inferred business type from plugin usage]",
    "recommendedImprovements": ["business-focused plugin recommendations"],
    "missingEssentials": ["essential plugins/features this site should have"]
  },
  "conflicts": {
    "redundantPlugins": ["plugins that provide overlapping functionality"],
    "potentialConflicts": ["plugins that might conflict with each other"]
  }
}

DETECTION GUIDELINES:
1. For WordPress: Look for /wp-content/plugins/, /wp-content/themes/, plugin-specific CSS/JS files, and HTML signatures
2. For Shopify: Look for shopify-analytics, shopify.com references, Liquid template patterns, and app-specific code
3. For Drupal: Look for /sites/default/files/, Drupal.*, and module-specific patterns
4. For Webflow: Look for webflow.com references, webflow-specific CSS classes, and Webflow CMS patterns
5. For Squarespace: Look for squarespace.com, Static1.squarespace.com, and Squarespace-specific patterns
6. For Wix: Look for wix.com, wixstatic.com, and Wix-specific patterns
7. For Joomla: Look for /media/jui/, Joomla.*, and component patterns
8. For other platforms: Identify based on unique signatures, file structures, and coding patterns

CATEGORIZATION FOCUS:
- Be specific with categories and subcategories
- Assess business impact, not just technical details
- Provide actionable recommendations
- Consider security implications of each plugin
- Evaluate performance impact realistically
- Identify missing essential functionality

IMPORTANT: Only detect plugins/extensions you're confident about based on clear evidence. Provide specific evidence for each detection.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
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
      
      // Process the analysis into our expected format
      const processedAnalysis: PlatformAnalysis = {
        platform: analysis.platform || platform,
        platformVersion: analysis.platformVersion,
        totalPluginsDetected: analysis.detectedPlugins?.length || 0,
        pluginsByCategory: {},
        securityAssessment: {
          overallRisk: analysis.securityAssessment?.overallRisk || 'low',
          vulnerablePlugins: [],
          recommendations: analysis.securityAssessment?.recommendations || []
        },
        performanceAnalysis: {
          heavyPlugins: [],
          optimizationOpportunities: analysis.performanceAnalysis?.optimizationOpportunities || [],
          estimatedSpeedImpact: analysis.performanceAnalysis?.estimatedSpeedImpact || 'minimal impact detected'
        },
        businessInsights: {
          pluginPurpose: analysis.businessInsights?.pluginPurpose || 'Standard website functionality',
          businessType: analysis.businessInsights?.businessType || 'General website',
          recommendedImprovements: analysis.businessInsights?.recommendedImprovements || [],
          missingEssentials: analysis.businessInsights?.missingEssentials || []
        },
        conflicts: {
          redundantPlugins: analysis.conflicts?.redundantPlugins || [],
          potentialConflicts: analysis.conflicts?.potentialConflicts || []
        }
      };

      // Categorize plugins
      if (analysis.detectedPlugins) {
        for (const plugin of analysis.detectedPlugins) {
          const category = plugin.category || 'other';
          if (!processedAnalysis.pluginsByCategory[category]) {
            processedAnalysis.pluginsByCategory[category] = [];
          }
          processedAnalysis.pluginsByCategory[category].push(plugin);

          // Add to vulnerable plugins if high risk
          if (plugin.riskLevel === 'high' || plugin.riskLevel === 'critical') {
            processedAnalysis.securityAssessment.vulnerablePlugins.push(plugin);
          }

          // Add to heavy plugins if high performance impact
          if (plugin.performanceImpact === 'high' || plugin.performanceImpact === 'medium') {
            processedAnalysis.performanceAnalysis.heavyPlugins.push(plugin);
          }
        }
      }

      console.log(`✅ Claude plugin analysis complete for ${platform}: ${processedAnalysis.totalPluginsDetected} plugins detected`);
      return processedAnalysis;

    } catch (parseError) {
      console.error('Failed to parse Claude plugin response:', parseError);
      console.log('Raw response:', content.text);
      
      // Return fallback analysis
      return getFallbackPluginAnalysis(platform);
    }

  } catch (error) {
    console.error('Claude plugin analysis failed:', error);
    return getFallbackPluginAnalysis(platform);
  }
}

function getFallbackPluginAnalysis(platform: string): PlatformAnalysis {
  return {
    platform,
    totalPluginsDetected: 0,
    pluginsByCategory: {},
    securityAssessment: {
      overallRisk: 'low',
      vulnerablePlugins: [],
      recommendations: ['Unable to perform detailed security analysis', 'Consider manual plugin review']
    },
    performanceAnalysis: {
      heavyPlugins: [],
      optimizationOpportunities: ['Unable to analyze plugin performance impact'],
      estimatedSpeedImpact: 'Analysis not available'
    },
    businessInsights: {
      pluginPurpose: 'Unable to determine from available data',
      businessType: 'Unknown',
      recommendedImprovements: ['Consider comprehensive plugin audit'],
      missingEssentials: ['Analysis not available']
    },
    conflicts: {
      redundantPlugins: [],
      potentialConflicts: []
    }
  };
}

// Universal plugin detection for all major CMS platforms
export async function detectUniversalPlugins(
  htmlContent: string,
  headers: Record<string, string>,
  url: string,
  detectedCMS?: string
): Promise<PlatformAnalysis> {
  
  // If we already know the CMS, use it, otherwise detect it
  let platform = detectedCMS;
  
  if (!platform) {
    platform = detectPlatformFromHTML(htmlContent, headers);
  }
  
  console.log(`🔍 Detected platform: ${platform} for universal plugin analysis`);
  
  return await detectPluginsWithClaude(platform, htmlContent, headers, url);
}

// Platform detection helper
function detectPlatformFromHTML(html: string, headers: Record<string, string>): string {
  const lowerHtml = html.toLowerCase();
  
  // WordPress detection
  if (lowerHtml.includes('/wp-content/') || lowerHtml.includes('/wp-includes/') || lowerHtml.includes('wp-emoji')) {
    return 'WordPress';
  }
  
  // Shopify detection
  if (lowerHtml.includes('shopify') && (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify-analytics'))) {
    return 'Shopify';
  }
  
  // Drupal detection
  if (lowerHtml.includes('/sites/default/files/') || lowerHtml.includes('drupal.js') || lowerHtml.includes('drupal.settings')) {
    return 'Drupal';
  }
  
  // Webflow detection
  if (lowerHtml.includes('webflow.com') || lowerHtml.includes('webflow-assets') || lowerHtml.includes('webflow.css')) {
    return 'Webflow';
  }
  
  // Squarespace detection
  if (lowerHtml.includes('squarespace') || lowerHtml.includes('squarespace-cdn') || lowerHtml.includes('static1.squarespace.com')) {
    return 'Squarespace';
  }
  
  // Wix detection
  if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixstatic.com') || lowerHtml.includes('wix-code')) {
    return 'Wix';
  }
  
  // Joomla detection
  if (lowerHtml.includes('/media/jui/') || lowerHtml.includes('joomla') || lowerHtml.includes('mootools')) {
    return 'Joomla';
  }
  
  // Magento detection
  if (lowerHtml.includes('mage/') || lowerHtml.includes('magento') || lowerHtml.includes('varien/')) {
    return 'Magento';
  }
  
  // PrestaShop detection
  if (lowerHtml.includes('prestashop') || lowerHtml.includes('/modules/') && lowerHtml.includes('/themes/')) {
    return 'PrestaShop';
  }
  
  // Ghost detection
  if (lowerHtml.includes('ghost.org') || lowerHtml.includes('ghost-url') || lowerHtml.includes('ghost.min.css')) {
    return 'Ghost';
  }
  
  // HubSpot detection
  if (lowerHtml.includes('hubspot') || lowerHtml.includes('hs-scripts.com') || lowerHtml.includes('hsforms.net')) {
    return 'HubSpot CMS';
  }
  
  // Contentful detection
  if (lowerHtml.includes('contentful') || lowerHtml.includes('ctfassets.net')) {
    return 'Contentful';
  }
  
  // Strapi detection
  if (lowerHtml.includes('strapi') || headers['x-powered-by']?.toLowerCase().includes('strapi')) {
    return 'Strapi';
  }
  
  // Next.js detection
  if (lowerHtml.includes('__next') || lowerHtml.includes('_buildmanifest') || lowerHtml.includes('next.js')) {
    return 'Next.js';
  }
  
  // Gatsby detection
  if (lowerHtml.includes('gatsby') || lowerHtml.includes('___gatsby')) {
    return 'Gatsby';
  }
  
  // React detection (fallback)
  if (lowerHtml.includes('react') || lowerHtml.includes('_react') || lowerHtml.includes('__react')) {
    return 'React Application';
  }
  
  // Vue.js detection
  if (lowerHtml.includes('vue.js') || lowerHtml.includes('__vue') || lowerHtml.includes('vue-')) {
    return 'Vue.js Application';
  }
  
  // Angular detection
  if (lowerHtml.includes('angular') || lowerHtml.includes('ng-version') || lowerHtml.includes('ng-')) {
    return 'Angular Application';
  }
  
  // Generic CMS detection
  if (lowerHtml.includes('/administrator/') || lowerHtml.includes('/admin/') || lowerHtml.includes('cms')) {
    return 'Generic CMS';
  }
  
  return 'Static Website';
}