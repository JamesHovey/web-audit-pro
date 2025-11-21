/**
 * Audit Configuration Types
 * Category-level toggles for controlling which audit checks to run
 */

export interface AuditConfiguration {
  technicalSEO: boolean          // H1, meta titles, descriptions, structured data, title length
  internalLinking: boolean        // Orphaned pages, weak links, broken links
  performanceMetrics: boolean     // Core Web Vitals, page speed, Lighthouse
  securityAndRedirects: boolean   // HTTPS, HSTS, 301/302 redirects, 4XX errors
  contentQuality: boolean         // Text-to-HTML ratio, content depth
  imageOptimization: boolean      // Large images, legacy formats, missing alt tags
  accessibilityAnalysis: boolean  // WCAG compliance, accessibility checks
  viewportAnalysis: boolean       // Mobile/tablet/desktop rendering
}

/**
 * Get default configuration (most common checks enabled)
 */
export function getDefaultAuditConfiguration(): AuditConfiguration {
  return {
    technicalSEO: true,
    internalLinking: true,
    performanceMetrics: true,
    securityAndRedirects: true,
    contentQuality: true,
    imageOptimization: true,
    accessibilityAnalysis: false,  // Disabled by default (expensive)
    viewportAnalysis: false         // Disabled by default (expensive)
  }
}
