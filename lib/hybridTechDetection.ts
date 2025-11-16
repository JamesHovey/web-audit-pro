/**
 * Hybrid Tech Stack Detection System
 * Extends the same proven pattern + AI approach used for WordPress plugins
 *
 * Detection Flow:
 * 1. Layer 1: Fast pattern matching (instant, free)
 * 2. Layer 2: Claude AI for unknown/low-confidence cases (intelligent, minimal cost)
 * 3. Layer 3: Merge and validate results
 */

import Anthropic from '@anthropic-ai/sdk';

export interface TechStackResult {
  cms?: string;
  cmsVersion?: string;
  framework?: string;
  frameworkVersion?: string;
  hosting?: string;
  ecommerce?: string;
  cdn?: string;
  phpVersion?: string;
  detectionMethod: 'pattern-only' | 'ai-enhanced';
  confidence: 'high' | 'medium' | 'low';
  aiUsed: boolean;
  costIncurred: number;
  detectionTimeMs: number;
}

interface PatternDetectionResult {
  cms?: string;
  cmsVersion?: string;
  framework?: string;
  frameworkVersion?: string;
  hosting?: string;
  ecommerce?: string;
  cdn?: string;
  phpVersion?: string;
  confidence: 'high' | 'medium' | 'low';
  matchCount: number;
}

/**
 * Analyzes tech stack using Claude AI
 */
async function analyzeTechStackWithClaude(
  html: string,
  headers: Record<string, string>,
  url: string,
  patternResults: PatternDetectionResult
): Promise<Partial<TechStackResult>> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Prepare HTML sample (first 8000 chars to stay within token limits)
  const htmlSample = html.substring(0, 8000);

  // Prepare headers summary
  const headersSummary = Object.entries(headers)
    .slice(0, 20)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `Analyze this website's technology stack. I need you to identify:

1. **CMS/Platform** (WordPress, Drupal, Shopify, Wix, custom, etc.)
2. **JavaScript Framework** (React, Vue, Angular, Next.js, Gatsby, etc.)
3. **Hosting Provider** (AWS, Google Cloud, Azure, Vercel, Netlify, etc.)
4. **E-commerce Platform** (WooCommerce, Shopify, Magento, etc.)
5. **CDN** (Cloudflare, CloudFront, Fastly, etc.)

**IMPORTANT - DO NOT confuse hosting providers with control panels:**
- Plesk, cPanel, DirectAdmin, ISPConfig, Webmin = CONTROL PANELS (NOT hosting providers)
- If you find a control panel but cannot identify the actual hosting provider, return "Bespoke" for hosting
- Control panels run ON TOP of hosting infrastructure, they are NOT the hosting provider

**Current pattern detection results:**
${JSON.stringify(patternResults, null, 2)}

**HTTP Headers:**
${headersSummary}

**HTML Sample (first 8000 chars):**
${htmlSample}

**IMPORTANT INSTRUCTIONS:**
- If pattern detection already found something with high confidence, DON'T override it unless you're very certain it's wrong
- Look for meta tags (generator, platform, etc.)
- Look for unique script URLs, CSS files, HTML comments
- Look for data attributes, class names, ID patterns
- Check for framework-specific patterns (__next, _react, __vue, ng-app, etc.)
- Be conservative - if you're not sure, say "Unknown" rather than guessing
- Extract version numbers when possible
- If you find Plesk, cPanel, DirectAdmin, or other control panels, return "Bespoke" for hosting (not the control panel name)

**Response Format (JSON only, no markdown):**
{
  "cms": "Platform name or null",
  "cmsVersion": "Version or null",
  "framework": "Framework name or null",
  "frameworkVersion": "Version or null",
  "hosting": "Hosting provider or null (use 'Bespoke' if only control panel detected)",
  "ecommerce": "E-commerce platform or null",
  "cdn": "CDN provider or null",
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of key indicators found"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Faster, cheaper model for this task
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse Claude's response
    const analysisText = content.text.trim();

    // Remove markdown code blocks if present
    const jsonMatch = analysisText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                      analysisText.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      console.error('Could not extract JSON from Claude response:', analysisText);
      throw new Error('Invalid JSON response from Claude');
    }

    const analysis = JSON.parse(jsonMatch[1]);

    console.log('🧠 Claude AI tech stack analysis:', analysis.reasoning);

    // Post-process: Filter out control panels from hosting
    let hosting = analysis.hosting;
    if (hosting) {
      const controlPanels = ['plesk', 'cpanel', 'directadmin', 'ispconfig', 'webmin', 'virtualmin', 'ajenti', 'froxlor', 'sentora', 'zpanel'];
      const hostingLower = hosting.toLowerCase();

      if (controlPanels.some(panel => hostingLower.includes(panel))) {
        console.log(`⚠️ Detected control panel "${hosting}" as hosting - converting to "Bespoke"`);
        hosting = 'Bespoke';
      }
    }

    return {
      cms: analysis.cms || undefined,
      cmsVersion: analysis.cmsVersion || undefined,
      framework: analysis.framework || undefined,
      frameworkVersion: analysis.frameworkVersion || undefined,
      hosting: hosting || undefined,
      ecommerce: analysis.ecommerce || undefined,
      cdn: analysis.cdn || undefined,
    };

  } catch (error) {
    console.error('Claude tech stack analysis failed:', error);
    return {};
  }
}

/**
 * Decides whether to use AI based on pattern detection results
 */
function shouldUseAI(patternResults: PatternDetectionResult): { use: boolean; reason: string } {
  // Rule 1: Nothing detected at all → Use AI
  if (patternResults.matchCount === 0) {
    return {
      use: true,
      reason: 'No technologies detected via patterns'
    };
  }

  // Rule 2: Low confidence → Use AI
  if (patternResults.confidence === 'low') {
    return {
      use: true,
      reason: 'Low confidence in pattern detection results'
    };
  }

  // Rule 3: Only 1-2 things detected → Use AI to find more
  if (patternResults.matchCount <= 2) {
    return {
      use: true,
      reason: `Only ${patternResults.matchCount} technologies detected, AI can find more`
    };
  }

  // Rule 4: No CMS detected but other things found → Use AI for CMS
  if (!patternResults.cms && patternResults.matchCount > 0) {
    return {
      use: true,
      reason: 'CMS not detected, AI can identify it'
    };
  }

  // Pattern detection found enough with high confidence
  return {
    use: false,
    reason: `Pattern detection found ${patternResults.matchCount} technologies with ${patternResults.confidence} confidence`
  };
}

/**
 * Merges pattern and AI results, preferring high-confidence pattern matches
 */
function mergeResults(
  patternResults: PatternDetectionResult,
  aiResults: Partial<TechStackResult>
): Partial<TechStackResult> {
  const merged: Partial<TechStackResult> = { ...patternResults };

  // Only use AI results if pattern didn't find it OR AI has better info
  if (!merged.cms && aiResults.cms) {
    merged.cms = aiResults.cms;
    merged.cmsVersion = aiResults.cmsVersion;
  }

  if (!merged.framework && aiResults.framework) {
    merged.framework = aiResults.framework;
    merged.frameworkVersion = aiResults.frameworkVersion;
  }

  if (!merged.hosting && aiResults.hosting) {
    merged.hosting = aiResults.hosting;
  }

  if (!merged.ecommerce && aiResults.ecommerce) {
    merged.ecommerce = aiResults.ecommerce;
  }

  if (!merged.cdn && aiResults.cdn) {
    merged.cdn = aiResults.cdn;
  }

  // Enhance existing pattern results with AI-discovered versions
  if (merged.cms && !merged.cmsVersion && aiResults.cmsVersion) {
    merged.cmsVersion = aiResults.cmsVersion;
  }

  if (merged.framework && !merged.frameworkVersion && aiResults.frameworkVersion) {
    merged.frameworkVersion = aiResults.frameworkVersion;
  }

  return merged;
}

/**
 * Main hybrid tech stack detection function
 * Same architecture as detectPluginsHybrid() but for general tech stack
 */
export async function detectTechStackHybrid(
  html: string,
  headers: Record<string, string>,
  url: string,
  patternResults: PatternDetectionResult
): Promise<TechStackResult> {
  const startTime = Date.now();

  console.log(`🔄 Starting hybrid tech stack detection for ${url}`);

  // Calculate initial match count and confidence
  const matchCount = [
    patternResults.cms,
    patternResults.framework,
    patternResults.hosting,
    patternResults.ecommerce,
    patternResults.cdn,
    patternResults.phpVersion
  ].filter(Boolean).length;

  const initialResults: PatternDetectionResult = {
    ...patternResults,
    matchCount,
    confidence: matchCount >= 3 ? 'high' : matchCount >= 1 ? 'medium' : 'low'
  };

  console.log(`📊 Pattern detection: ${matchCount} technologies found, ${initialResults.confidence} confidence`);

  // Decide if we should use AI
  const aiDecision = shouldUseAI(initialResults);

  if (!aiDecision.use) {
    console.log(`✅ ${aiDecision.reason} - skipping AI`);

    const detectionTimeMs = Date.now() - startTime;

    return {
      ...initialResults,
      detectionMethod: 'pattern-only',
      aiUsed: false,
      costIncurred: 0,
      detectionTimeMs
    };
  }

  // Use Claude AI to enhance detection
  console.log(`🧠 ${aiDecision.reason} - using Claude AI`);

  const aiStartTime = Date.now();
  const aiResults = await analyzeTechStackWithClaude(html, headers, url, initialResults);
  const aiTimeMs = Date.now() - aiStartTime;

  console.log(`✅ Claude AI analysis complete in ${aiTimeMs}ms`);

  // Merge pattern and AI results
  const mergedResults = mergeResults(initialResults, aiResults);

  const finalMatchCount = [
    mergedResults.cms,
    mergedResults.framework,
    mergedResults.hosting,
    mergedResults.ecommerce,
    mergedResults.cdn,
    mergedResults.phpVersion
  ].filter(Boolean).length;

  const detectionTimeMs = Date.now() - startTime;

  console.log(`📊 Final results: ${finalMatchCount} technologies (${finalMatchCount - matchCount} added by AI)`);

  return {
    ...mergedResults,
    detectionMethod: 'ai-enhanced',
    confidence: finalMatchCount >= 3 ? 'high' : finalMatchCount >= 1 ? 'medium' : 'low',
    aiUsed: true,
    costIncurred: 0.01, // Approximate cost for Haiku model
    detectionTimeMs
  };
}
