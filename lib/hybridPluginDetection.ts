/**
 * Hybrid Plugin Detection System
 * Combines fast pattern matching with AI-powered detection
 *
 * Detection Flow:
 * 1. Layer 1: Fast pattern matching for common plugins (instant, free)
 * 2. Layer 2: Claude AI for unknown/complex plugins (intelligent, minimal cost)
 * 3. Layer 3: Merge and deduplicate results
 */

import { detectPluginsByPatterns, DetectedPlugin, PLUGIN_SIGNATURES } from './pluginSignatures';
import { detectPluginsWithClaude, PlatformAnalysis } from './claudePluginDetection';

export interface HybridDetectionResult {
  detectedPlugins: DetectedPlugin[];
  totalPluginsDetected: number;
  detectionMethod: 'pattern-only' | 'pattern-with-ai' | 'ai-only' | 'fallback';
  patternMatchCount: number;
  aiEnhancedCount: number;
  confidence: 'high' | 'medium' | 'low';
  platformAnalysis?: PlatformAnalysis;
  performanceMetrics: {
    patternMatchTimeMs: number;
    aiDetectionTimeMs: number;
    totalTimeMs: number;
  };
}

export async function detectPluginsHybrid(
  platform: string,
  htmlContent: string,
  headers: Record<string, string>,
  url: string
): Promise<HybridDetectionResult> {
  const startTime = Date.now();
  let patternMatchTimeMs = 0;
  let aiDetectionTimeMs = 0;

  console.log(`🔄 Starting hybrid plugin detection for ${url} (${platform})`);

  // ============================================
  // LAYER 1: FAST PATTERN MATCHING
  // ============================================
  const patternStartTime = Date.now();
  const patternPlugins = detectPluginsByPatterns(htmlContent, headers);
  patternMatchTimeMs = Date.now() - patternStartTime;

  console.log(`✅ Pattern matching complete: ${patternPlugins.length} plugins detected in ${patternMatchTimeMs}ms`);

  // Count high-confidence pattern matches
  const highConfidencePatternMatches = patternPlugins.filter(p => p.confidence === 'high').length;

  // ============================================
  // DECISION LOGIC: Should we invoke Claude AI?
  // ============================================
  const shouldUseAI = decideShouldUseAI(patternPlugins, platform, htmlContent);

  if (shouldUseAI.use) {
    console.log(`🧠 Invoking Claude AI: ${shouldUseAI.reason}`);

    // ============================================
    // LAYER 2: CLAUDE AI DETECTION
    // ============================================
    const aiStartTime = Date.now();
    let platformAnalysis: PlatformAnalysis | null = null;

    try {
      platformAnalysis = await detectPluginsWithClaude(platform, htmlContent, headers, url);
      aiDetectionTimeMs = Date.now() - aiStartTime;

      console.log(`✅ Claude AI detection complete: ${platformAnalysis.totalPluginsDetected} plugins detected in ${aiDetectionTimeMs}ms`);

      // ============================================
      // LAYER 3: MERGE AND DEDUPLICATE
      // ============================================
      const mergedPlugins = mergeDetectionResults(patternPlugins, platformAnalysis);

      const totalTimeMs = Date.now() - startTime;

      return {
        detectedPlugins: mergedPlugins,
        totalPluginsDetected: mergedPlugins.length,
        detectionMethod: 'pattern-with-ai',
        patternMatchCount: patternPlugins.length,
        aiEnhancedCount: platformAnalysis.totalPluginsDetected,
        confidence: 'high',
        platformAnalysis,
        performanceMetrics: {
          patternMatchTimeMs,
          aiDetectionTimeMs,
          totalTimeMs
        }
      };

    } catch (error) {
      console.error('❌ Claude AI detection failed, falling back to pattern-only:', error);
      aiDetectionTimeMs = Date.now() - aiStartTime;

      // Fall back to pattern-only results
      const totalTimeMs = Date.now() - startTime;

      return {
        detectedPlugins: patternPlugins,
        totalPluginsDetected: patternPlugins.length,
        detectionMethod: patternPlugins.length > 0 ? 'pattern-only' : 'fallback',
        patternMatchCount: patternPlugins.length,
        aiEnhancedCount: 0,
        confidence: patternPlugins.length > 5 ? 'high' : patternPlugins.length > 2 ? 'medium' : 'low',
        performanceMetrics: {
          patternMatchTimeMs,
          aiDetectionTimeMs,
          totalTimeMs
        }
      };
    }

  } else {
    console.log(`✅ Pattern matching sufficient: ${shouldUseAI.reason}`);

    const totalTimeMs = Date.now() - startTime;

    return {
      detectedPlugins: patternPlugins,
      totalPluginsDetected: patternPlugins.length,
      detectionMethod: 'pattern-only',
      patternMatchCount: patternPlugins.length,
      aiEnhancedCount: 0,
      confidence: highConfidencePatternMatches > 5 ? 'high' : highConfidencePatternMatches > 2 ? 'medium' : 'low',
      performanceMetrics: {
        patternMatchTimeMs,
        aiDetectionTimeMs: 0,
        totalTimeMs
      }
    };
  }
}

/**
 * Decision logic for whether to invoke Claude AI
 */
function decideShouldUseAI(
  patternPlugins: DetectedPlugin[],
  platform: string,
  htmlContent: string
): { use: boolean; reason: string } {
  // Count high-confidence matches
  const highConfidenceCount = patternPlugins.filter(p => p.confidence === 'high').length;

  // For WordPress sites with fewer than 5 high-confidence plugins, use AI
  if (platform === 'WordPress' && highConfidenceCount < 5) {
    return {
      use: true,
      reason: `Only ${highConfidenceCount} high-confidence plugins detected, AI can find more`
    };
  }

  // For WordPress sites with no pattern matches at all, definitely use AI
  if (platform === 'WordPress' && patternPlugins.length === 0) {
    return {
      use: true,
      reason: 'No plugins detected via patterns, AI analysis required'
    };
  }

  // For non-WordPress platforms, always use AI (less pattern coverage)
  if (platform !== 'WordPress' && platform !== 'Static Website') {
    return {
      use: true,
      reason: `Non-WordPress platform (${platform}), AI provides better coverage`
    };
  }

  // Check if the HTML is very large (complex site), might need AI
  const htmlSizeKB = htmlContent.length / 1024;
  if (htmlSizeKB > 500 && highConfidenceCount < 3) {
    return {
      use: true,
      reason: `Large HTML (${Math.round(htmlSizeKB)}KB) with few plugins detected, AI might find more`
    };
  }

  // If we have good pattern matches, skip AI
  if (highConfidenceCount >= 5) {
    return {
      use: false,
      reason: `${highConfidenceCount} high-confidence plugins detected, pattern matching sufficient`
    };
  }

  // Default: use pattern matching only for WordPress with some matches
  if (patternPlugins.length >= 3) {
    return {
      use: false,
      reason: `${patternPlugins.length} plugins detected via patterns, sufficient for WordPress`
    };
  }

  // Edge case: use AI as backup
  return {
    use: true,
    reason: 'Low pattern match confidence, AI backup recommended'
  };
}

/**
 * Merges pattern-based and AI-based detection results
 * Deduplicates and prioritizes high-confidence matches
 */
function mergeDetectionResults(
  patternPlugins: DetectedPlugin[],
  platformAnalysis: PlatformAnalysis
): DetectedPlugin[] {
  const merged: DetectedPlugin[] = [...patternPlugins];
  const patternPluginNames = new Set(patternPlugins.map(p => p.name.toLowerCase()));

  // Add AI-detected plugins that weren't found by patterns
  if (platformAnalysis.pluginsByCategory) {
    for (const category in platformAnalysis.pluginsByCategory) {
      const aiPlugins = platformAnalysis.pluginsByCategory[category];

      for (const aiPlugin of aiPlugins) {
        const aiPluginNameLower = aiPlugin.name.toLowerCase();

        // Check for exact or partial matches (e.g., "WP Rocket" vs "wp-rocket")
        const isDuplicate = Array.from(patternPluginNames).some(patternName => {
          return patternName.includes(aiPluginNameLower) ||
                 aiPluginNameLower.includes(patternName) ||
                 patternName === aiPluginNameLower;
        });

        if (!isDuplicate) {
          // AI found a new plugin not detected by patterns
          merged.push({
            ...aiPlugin,
            description: `${aiPlugin.description} (AI-detected)`
          });
        } else {
          // Plugin already detected by patterns, enhance existing entry
          const existingPlugin = merged.find(p => {
            const existingNameLower = p.name.toLowerCase();
            return existingNameLower.includes(aiPluginNameLower) ||
                   aiPluginNameLower.includes(existingNameLower);
          });

          if (existingPlugin && aiPlugin.recommendations.length > 0) {
            // Merge AI recommendations into existing plugin
            existingPlugin.recommendations = [
              ...existingPlugin.recommendations,
              ...aiPlugin.recommendations
            ];
            existingPlugin.description = `${existingPlugin.description} (AI-enhanced)`;
          }
        }
      }
    }
  }

  // Sort by confidence (high first) and then by name
  return merged.sort((a, b) => {
    const confidenceOrder = { high: 0, medium: 1, low: 2 };
    const confidenceDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];

    if (confidenceDiff !== 0) return confidenceDiff;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Categorizes detected plugins for reporting
 */
export function categorizePlugins(plugins: DetectedPlugin[]): Record<string, DetectedPlugin[]> {
  const categorized: Record<string, DetectedPlugin[]> = {};

  for (const plugin of plugins) {
    const category = plugin.category || 'other';
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(plugin);
  }

  return categorized;
}

/**
 * Generates detection summary for logging
 */
export function generateDetectionSummary(result: HybridDetectionResult): string {
  const lines = [
    `📊 Detection Summary:`,
    `   Method: ${result.detectionMethod}`,
    `   Total Plugins: ${result.totalPluginsDetected}`,
    `   Pattern Matches: ${result.patternMatchCount}`,
    `   AI Enhanced: ${result.aiEnhancedCount}`,
    `   Confidence: ${result.confidence}`,
    `   Time: ${result.performanceMetrics.totalTimeMs}ms (pattern: ${result.performanceMetrics.patternMatchTimeMs}ms, ai: ${result.performanceMetrics.aiDetectionTimeMs}ms)`,
  ];

  // Add category breakdown
  const categorized = categorizePlugins(result.detectedPlugins);
  const categoryStats = Object.entries(categorized)
    .map(([cat, plugins]) => `${cat}(${plugins.length})`)
    .join(', ');

  lines.push(`   Categories: ${categoryStats}`);

  return lines.join('\n');
}

/**
 * Checks if essential plugins are missing for WordPress sites
 */
export function checkMissingEssentials(
  platform: string,
  detectedPlugins: DetectedPlugin[]
): { category: string; missing: boolean; severity: 'high' | 'medium' | 'low' }[] {
  if (platform !== 'WordPress') {
    return [];
  }

  const essentials = [
    { category: 'seo', severity: 'medium' as const, name: 'SEO Plugin' },
    { category: 'performance', subcategory: 'caching', severity: 'high' as const, name: 'Caching Plugin' },
    { category: 'security', severity: 'medium' as const, name: 'Security Plugin' },
    { category: 'backup', severity: 'medium' as const, name: 'Backup Plugin' },
  ];

  return essentials.map(essential => {
    const hasPlugin = detectedPlugins.some(p => {
      if (essential.subcategory) {
        return p.category === essential.category && p.subcategory === essential.subcategory;
      }
      return p.category === essential.category;
    });

    return {
      category: essential.name,
      missing: !hasPlugin,
      severity: essential.severity
    };
  });
}
