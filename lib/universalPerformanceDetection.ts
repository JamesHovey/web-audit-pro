/**
 * Universal Performance & Conversion Issue Detection
 * Works on ANY website regardless of platform or CMS
 *
 * Detects issues that directly impact conversions:
 * - JavaScript errors (broken forms/checkout)
 * - Mobile usability problems
 * - Accessibility violations
 * - Security issues (SSL, headers)
 * - Form optimization problems
 * - Missing trust signals
 * - Performance bottlenecks
 */

export interface PerformanceIssue {
  id: string;
  category: 'javascript-errors' | 'mobile-ux' | 'accessibility' | 'security' | 'forms' | 'trust' | 'performance' | 'seo' | 'analytics' | 'browser-compatibility';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  conversionImpact: 'blocks-conversions' | 'reduces-trust' | 'hurts-usability' | 'slows-site' | 'minor';
  fix: string;
  evidence: string[];
}

export interface UniversalPerformanceAnalysis {
  totalIssuesFound: number;
  criticalIssues: PerformanceIssue[];
  highPriorityIssues: PerformanceIssue[];
  mediumPriorityIssues: PerformanceIssue[];
  lowPriorityIssues: PerformanceIssue[];
  conversionScore: number; // 0-100
  recommendations: string[];
}

/**
 * Analyze website for universal performance and conversion issues
 */
export async function analyzeUniversalPerformance(
  htmlContent: string,
  headers: Record<string, string>,
  url: string
): Promise<UniversalPerformanceAnalysis> {
  const issues: PerformanceIssue[] = [];

  // Run all detection functions
  issues.push(...detectJavaScriptErrors(htmlContent));
  issues.push(...detectMobileUsabilityIssues(htmlContent));
  issues.push(...detectAccessibilityViolations(htmlContent));
  issues.push(...detectSecurityIssues(htmlContent, headers, url));
  issues.push(...detectFormOptimizationIssues(htmlContent));
  issues.push(...detectMissingTrustSignals(htmlContent));
  issues.push(...detectPerformanceBottlenecks(htmlContent, headers));
  issues.push(...detectSEOIssues(htmlContent, headers));
  issues.push(...detectAnalyticsTracking(htmlContent));
  issues.push(...detectBrowserCompatibility(htmlContent));

  // Categorize by severity
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highPriorityIssues = issues.filter(i => i.severity === 'high');
  const mediumPriorityIssues = issues.filter(i => i.severity === 'medium');
  const lowPriorityIssues = issues.filter(i => i.severity === 'low');

  // Calculate conversion score (100 - deductions for issues)
  let score = 100;
  score -= criticalIssues.length * 20;
  score -= highPriorityIssues.length * 10;
  score -= mediumPriorityIssues.length * 5;
  score -= lowPriorityIssues.length * 2;
  score = Math.max(0, Math.min(100, score));

  // Generate recommendations
  const recommendations = generateRecommendations(issues);

  return {
    totalIssuesFound: issues.length,
    criticalIssues,
    highPriorityIssues,
    mediumPriorityIssues,
    lowPriorityIssues,
    conversionScore: score,
    recommendations
  };
}

/**
 * Detect JavaScript errors that could break functionality
 */
function detectJavaScriptErrors(html: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Check for inline JavaScript errors (basic detection)
  const scriptErrors = [
    { pattern: /onerror\s*=\s*["'].*["']/gi, name: 'inline error handlers' },
    { pattern: /try\s*\{\s*\}\s*catch/gi, name: 'empty catch blocks' },
    { pattern: /console\.(error|warn)\(/gi, name: 'console errors/warnings' }
  ];

  for (const { pattern, name } of scriptErrors) {
    const matches = html.match(pattern);
    if (matches && matches.length > 3) {
      issues.push({
        id: `js-${name.replace(/\s+/g, '-')}`,
        category: 'javascript-errors',
        severity: 'high',
        title: `Potential JavaScript Issues Detected`,
        description: `Found ${matches.length} instances of ${name} which may indicate errors`,
        impact: 'JavaScript errors can break forms, checkout flows, and interactive features',
        conversionImpact: 'blocks-conversions',
        fix: 'Review browser console for errors and fix all JavaScript issues',
        evidence: matches.slice(0, 3)
      });
    }
  }

  return issues;
}

/**
 * Detect mobile usability issues
 */
function detectMobileUsabilityIssues(html: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  const htmlLower = html.toLowerCase();

  // Check for viewport meta tag
  if (!htmlLower.includes('viewport') || !htmlLower.includes('width=device-width')) {
    issues.push({
      id: 'mobile-no-viewport',
      category: 'mobile-ux',
      severity: 'critical',
      title: 'Missing Viewport Meta Tag',
      description: 'Site does not have proper mobile viewport configuration',
      impact: 'Content will not scale properly on mobile devices (60%+ of traffic)',
      conversionImpact: 'blocks-conversions',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      evidence: ['No viewport meta tag found in HTML']
    });
  }

  // Check for small text
  const smallFontMatches = html.match(/font-size:\s*([0-9]+)px/gi);
  if (smallFontMatches) {
    const smallFonts = smallFontMatches.filter(match => {
      const size = parseInt(match.match(/([0-9]+)/)?.[1] || '16');
      return size < 12;
    });
    if (smallFonts.length > 5) {
      issues.push({
        id: 'mobile-small-text',
        category: 'mobile-ux',
        severity: 'medium',
        title: 'Text Too Small for Mobile',
        description: `Found ${smallFonts.length} instances of text smaller than 12px`,
        impact: 'Users cannot read content on mobile devices',
        conversionImpact: 'hurts-usability',
        fix: 'Use minimum 14px font size for body text on mobile',
        evidence: smallFonts.slice(0, 3)
      });
    }
  }

  // Check for tap target size issues
  const buttonPattern = /<button[^>]*style=["'][^"']*width:\s*([0-9]+)px[^"']*["']/gi;
  const smallButtons = [];
  let match;
  while ((match = buttonPattern.exec(html)) !== null) {
    const width = parseInt(match[1]);
    if (width < 44) { // Apple's minimum 44x44px recommendation
      smallButtons.push(match[0]);
    }
  }
  if (smallButtons.length > 0) {
    issues.push({
      id: 'mobile-small-tap-targets',
      category: 'mobile-ux',
      severity: 'high',
      title: 'Tap Targets Too Small',
      description: `Found ${smallButtons.length} buttons/links smaller than recommended 44x44px`,
      impact: 'Users struggle to tap buttons and links on mobile',
      conversionImpact: 'blocks-conversions',
      fix: 'Make all tap targets at least 44x44px with adequate spacing',
      evidence: smallButtons.slice(0, 2)
    });
  }

  return issues;
}

/**
 * Detect accessibility violations (WCAG)
 */
function detectAccessibilityViolations(html: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Missing alt text on images
  const imgWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi);
  if (imgWithoutAlt && imgWithoutAlt.length > 0) {
    issues.push({
      id: 'a11y-missing-alt-text',
      category: 'accessibility',
      severity: 'high',
      title: 'Images Missing Alt Text',
      description: `Found ${imgWithoutAlt.length} images without alt attributes`,
      impact: 'Screen readers cannot describe images to visually impaired users',
      conversionImpact: 'hurts-usability',
      fix: 'Add descriptive alt text to all images',
      evidence: imgWithoutAlt.slice(0, 3)
    });
  }

  // Missing form labels
  const inputsWithoutLabels = html.match(/<input(?![^>]*aria-label)(?![^>]*id="[^"]*")(?![^>]*placeholder)[^>]*>/gi);
  if (inputsWithoutLabels && inputsWithoutLabels.length > 2) {
    issues.push({
      id: 'a11y-missing-form-labels',
      category: 'accessibility',
      severity: 'high',
      title: 'Form Inputs Missing Labels',
      description: `Found ${inputsWithoutLabels.length} form inputs without proper labels`,
      impact: 'Screen reader users cannot identify form fields',
      conversionImpact: 'blocks-conversions',
      fix: 'Add <label> tags or aria-label attributes to all form inputs',
      evidence: inputsWithoutLabels.slice(0, 2)
    });
  }

  // Missing language attribute
  if (!html.match(/<html[^>]*lang=/i)) {
    issues.push({
      id: 'a11y-missing-lang',
      category: 'accessibility',
      severity: 'medium',
      title: 'Missing Language Attribute',
      description: 'HTML element does not specify page language',
      impact: 'Screen readers may not pronounce content correctly',
      conversionImpact: 'hurts-usability',
      fix: 'Add lang attribute to <html> tag (e.g., <html lang="en">)',
      evidence: ['No lang attribute found on <html> element']
    });
  }

  // Low contrast (basic detection)
  const whiteOnWhite = html.match(/color:\s*white[^}]*background(-color)?:\s*white/gi);
  if (whiteOnWhite && whiteOnWhite.length > 0) {
    issues.push({
      id: 'a11y-low-contrast',
      category: 'accessibility',
      severity: 'medium',
      title: 'Potential Low Contrast Issues',
      description: 'Found color combinations that may have insufficient contrast',
      impact: 'Users with visual impairments cannot read content',
      conversionImpact: 'hurts-usability',
      fix: 'Ensure text has minimum 4.5:1 contrast ratio with background',
      evidence: whiteOnWhite.slice(0, 2)
    });
  }

  return issues;
}

/**
 * Detect security issues
 */
function detectSecurityIssues(html: string, headers: Record<string, string>, url: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Check for HTTPS
  if (url.startsWith('http://') && !url.startsWith('http://localhost')) {
    issues.push({
      id: 'security-no-https',
      category: 'security',
      severity: 'critical',
      title: 'Site Not Using HTTPS',
      description: 'Website is not secured with SSL/TLS encryption',
      impact: 'Browsers show "Not Secure" warning, data transmitted in plain text',
      conversionImpact: 'reduces-trust',
      fix: 'Install SSL certificate and redirect all HTTP traffic to HTTPS',
      evidence: [`URL starts with http:// instead of https://`]
    });
  }

  // Check for mixed content
  const mixedContent = html.match(/src=["']http:\/\/[^"']+["']/gi);
  if (mixedContent && mixedContent.length > 0) {
    issues.push({
      id: 'security-mixed-content',
      category: 'security',
      severity: 'high',
      title: 'Mixed Content Warnings',
      description: `Found ${mixedContent.length} insecure resources loaded over HTTP on HTTPS page`,
      impact: 'Browsers may block content or show security warnings',
      conversionImpact: 'reduces-trust',
      fix: 'Update all resource URLs to use HTTPS',
      evidence: mixedContent.slice(0, 3)
    });
  }

  // Check security headers
  const missingHeaders = [];
  if (!headers['strict-transport-security']) {
    missingHeaders.push('Strict-Transport-Security (HSTS)');
  }
  if (!headers['x-content-type-options']) {
    missingHeaders.push('X-Content-Type-Options');
  }
  if (!headers['x-frame-options']) {
    missingHeaders.push('X-Frame-Options (clickjacking protection)');
  }

  if (missingHeaders.length > 0) {
    issues.push({
      id: 'security-missing-headers',
      category: 'security',
      severity: 'medium',
      title: 'Missing Security Headers',
      description: `${missingHeaders.length} important security headers not configured`,
      impact: 'Site vulnerable to various security attacks',
      conversionImpact: 'reduces-trust',
      fix: `Add security headers: ${missingHeaders.join(', ')}`,
      evidence: missingHeaders
    });
  }

  return issues;
}

/**
 * Detect form optimization issues
 */
function detectFormOptimizationIssues(html: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Find all forms
  const forms = html.match(/<form[^>]*>[\s\S]*?<\/form>/gi);
  if (!forms || forms.length === 0) {
    return issues; // No forms to analyze
  }

  for (let i = 0; i < Math.min(forms.length, 3); i++) {
    const form = forms[i];

    // Count form fields
    const inputs = form.match(/<input[^>]*>/gi) || [];
    const textareas = form.match(/<textarea[^>]*>/gi) || [];
    const selects = form.match(/<select[^>]*>/gi) || [];
    const totalFields = inputs.length + textareas.length + selects.length;

    // Too many fields
    if (totalFields > 10) {
      issues.push({
        id: `form-too-many-fields-${i}`,
        category: 'forms',
        severity: 'medium',
        title: `Form Has Too Many Fields (${totalFields})`,
        description: 'Long forms increase abandonment rates',
        impact: 'Each additional field reduces conversion rate by ~5%',
        conversionImpact: 'blocks-conversions',
        fix: 'Reduce to essential fields only, use multi-step form if necessary',
        evidence: [`Form #${i+1} has ${totalFields} fields`]
      });
    }

    // Missing autocomplete
    const hasAutocomplete = form.includes('autocomplete=');
    if (!hasAutocomplete && totalFields > 3) {
      issues.push({
        id: `form-no-autocomplete-${i}`,
        category: 'forms',
        severity: 'medium',
        title: 'Form Missing Autocomplete Attributes',
        description: 'Form does not use autocomplete to help users fill fields faster',
        impact: 'Users must manually type all information (slower, more errors)',
        conversionImpact: 'hurts-usability',
        fix: 'Add autocomplete attributes (name, email, address, etc.)',
        evidence: [`Form #${i+1} missing autocomplete`]
      });
    }

    // No validation feedback
    const hasValidation = form.includes('required') || form.includes('pattern=') || form.includes('aria-invalid');
    if (!hasValidation && totalFields > 2) {
      issues.push({
        id: `form-no-validation-${i}`,
        category: 'forms',
        severity: 'low',
        title: 'Form Missing Validation Attributes',
        description: 'Form lacks client-side validation',
        impact: 'Users may submit invalid data and see confusing error messages',
        conversionImpact: 'hurts-usability',
        fix: 'Add HTML5 validation (required, type, pattern attributes)',
        evidence: [`Form #${i+1} has no validation`]
      });
    }
  }

  return issues;
}

/**
 * Detect missing trust signals
 */
function detectMissingTrustSignals(html: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  const htmlLower = html.toLowerCase();

  // Check for SSL/security badges
  const hasSecurityBadge = htmlLower.includes('secure') && (
    htmlLower.includes('badge') || htmlLower.includes('seal') || htmlLower.includes('verified')
  );

  // Check for testimonials/reviews
  const hasTestimonials = htmlLower.includes('testimonial') || htmlLower.includes('review') || htmlLower.includes('rating');

  // Check for trust indicators
  const hasTrustIndicators = htmlLower.includes('money back') || htmlLower.includes('guarantee') ||
    htmlLower.includes('free shipping') || htmlLower.includes('free returns');

  // Check for contact information
  const hasContactInfo = htmlLower.includes('contact') || htmlLower.includes('phone') || htmlLower.includes('email');

  const missingSignals = [];
  if (!hasSecurityBadge) missingSignals.push('Security/SSL badges');
  if (!hasTestimonials) missingSignals.push('Customer testimonials or reviews');
  if (!hasTrustIndicators) missingSignals.push('Trust indicators (guarantees, free shipping)');
  if (!hasContactInfo) missingSignals.push('Contact information');

  if (missingSignals.length >= 3) {
    issues.push({
      id: 'trust-missing-signals',
      category: 'trust',
      severity: 'medium',
      title: 'Missing Trust Signals',
      description: `Site lacks ${missingSignals.length} important trust indicators`,
      impact: 'Visitors may not trust the site enough to convert',
      conversionImpact: 'reduces-trust',
      fix: `Add: ${missingSignals.join(', ')}`,
      evidence: missingSignals
    });
  }

  return issues;
}

/**
 * Detect performance bottlenecks
 */
function detectPerformanceBottlenecks(html: string, headers: Record<string, string>): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Check for render-blocking resources
  const renderBlockingCSS = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi);
  if (renderBlockingCSS && renderBlockingCSS.length > 5) {
    issues.push({
      id: 'perf-render-blocking-css',
      category: 'performance',
      severity: 'high',
      title: 'Too Many Render-Blocking Stylesheets',
      description: `Found ${renderBlockingCSS.length} external CSS files blocking render`,
      impact: 'Page appears blank while CSS loads (poor LCP)',
      conversionImpact: 'slows-site',
      fix: 'Inline critical CSS, defer non-critical CSS, or combine files',
      evidence: renderBlockingCSS.slice(0, 3)
    });
  }

  // Check for unoptimized images
  const images = html.match(/<img[^>]*src=["'][^"']*\.(?:jpg|jpeg|png)["'][^>]*>/gi);
  if (images && images.length > 10) {
    const hasWebP = html.includes('.webp') || html.includes('image/webp');
    const hasLazyLoad = html.includes('loading="lazy"') || html.includes('data-src=');

    if (!hasWebP) {
      issues.push({
        id: 'perf-no-webp',
        category: 'performance',
        severity: 'medium',
        title: 'Images Not Using Modern Formats',
        description: `${images.length} images could be optimized with WebP format`,
        impact: 'Images are larger than necessary (slower load times)',
        conversionImpact: 'slows-site',
        fix: 'Convert images to WebP format (20-30% smaller)',
        evidence: images.slice(0, 2)
      });
    }

    if (!hasLazyLoad) {
      issues.push({
        id: 'perf-no-lazy-loading',
        category: 'performance',
        severity: 'medium',
        title: 'Images Not Lazy Loaded',
        description: 'All images load immediately instead of on-demand',
        impact: 'Unnecessary images slow down initial page load',
        conversionImpact: 'slows-site',
        fix: 'Add loading="lazy" to off-screen images',
        evidence: ['No lazy loading detected']
      });
    }
  }

  // Check compression
  const hasCompression = headers['content-encoding']?.includes('gzip') || headers['content-encoding']?.includes('br');
  if (!hasCompression) {
    issues.push({
      id: 'perf-no-compression',
      category: 'performance',
      severity: 'high',
      title: 'No Text Compression Enabled',
      description: 'HTML/CSS/JS not compressed with Gzip or Brotli',
      impact: 'Files are 3-5x larger than necessary',
      conversionImpact: 'slows-site',
      fix: 'Enable Gzip or Brotli compression on server',
      evidence: [`Content-Encoding header: ${headers['content-encoding'] || 'missing'}`]
    });
  }

  return issues;
}

/**
 * Detect basic SEO issues
 */
function detectSEOIssues(html: string, headers: Record<string, string>): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Missing title tag
  const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(html);
  if (!hasTitle) {
    issues.push({
      id: 'seo-missing-title',
      category: 'seo',
      severity: 'critical',
      title: 'Missing Page Title',
      description: 'Page does not have a <title> tag',
      impact: 'Search engines cannot understand page content, poor rankings',
      conversionImpact: 'hurts-usability',
      fix: 'Add descriptive <title> tag in <head> section',
      evidence: ['No <title> tag found']
    });
  }

  // Missing meta description
  const hasMetaDesc = /<meta[^>]*name=["']description["'][^>]*content=/i.test(html);
  if (!hasMetaDesc) {
    issues.push({
      id: 'seo-missing-description',
      category: 'seo',
      severity: 'high',
      title: 'Missing Meta Description',
      description: 'Page does not have a meta description',
      impact: 'Search engines show generic snippet, lower click-through rates',
      conversionImpact: 'minor',
      fix: 'Add <meta name="description" content="..."> in <head>',
      evidence: ['No meta description found']
    });
  }

  // Multiple H1 tags
  const h1Tags = html.match(/<h1[^>]*>/gi);
  if (h1Tags && h1Tags.length > 1) {
    issues.push({
      id: 'seo-multiple-h1',
      category: 'seo',
      severity: 'low',
      title: 'Multiple H1 Tags',
      description: `Page has ${h1Tags.length} H1 tags (should have only 1)`,
      impact: 'Dilutes page focus for search engines',
      conversionImpact: 'minor',
      fix: 'Use only one H1 tag per page for main heading',
      evidence: [`Found ${h1Tags.length} H1 tags`]
    });
  }

  return issues;
}

/**
 * Detect analytics and tracking implementation issues
 */
function detectAnalyticsTracking(html: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Check for Google Analytics
  const hasGA4 = /gtag\(|googletagmanager\.com\/gtag\/js\?id=G-|analytics\.google\.com/i.test(html);
  const hasUA = /google-analytics\.com\/analytics\.js|ga\('create'/i.test(html);
  const hasAnyGA = hasGA4 || hasUA;

  if (!hasAnyGA) {
    issues.push({
      id: 'analytics-missing-ga',
      category: 'analytics',
      severity: 'high',
      title: 'No Google Analytics Detected',
      description: 'Google Analytics tracking code not found on this page',
      impact: 'Cannot track visitor behavior, conversions, or traffic sources',
      conversionImpact: 'hurts-usability',
      fix: 'Install Google Analytics 4 (GA4) or Universal Analytics tracking code in <head> section',
      evidence: ['No GA tracking code found']
    });
  } else if (hasUA && !hasGA4) {
    issues.push({
      id: 'analytics-outdated-ga',
      category: 'analytics',
      severity: 'medium',
      title: 'Using Outdated Google Analytics (Universal Analytics)',
      description: 'Site uses old Universal Analytics (UA) which stopped collecting data July 1, 2023',
      impact: 'Data collection has stopped, losing valuable visitor insights',
      conversionImpact: 'hurts-usability',
      fix: 'Migrate to Google Analytics 4 (GA4) immediately',
      evidence: ['Universal Analytics code detected', 'No GA4 code found']
    });
  }

  // Check for Facebook Pixel
  const hasFBPixel = /connect\.facebook\.net\/.*\/fbevents\.js|fbq\(/i.test(html);
  if (!hasFBPixel) {
    issues.push({
      id: 'analytics-missing-fb-pixel',
      category: 'analytics',
      severity: 'medium',
      title: 'No Facebook Pixel Detected',
      description: 'Facebook Pixel tracking not found',
      impact: 'Cannot track Facebook ad conversions or build retargeting audiences',
      conversionImpact: 'minor',
      fix: 'Install Facebook Pixel if running Facebook/Instagram ads',
      evidence: ['No Facebook Pixel code found']
    });
  }

  // Check for Google Tag Manager
  const hasGTM = /googletagmanager\.com\/gtm\.js/i.test(html);

  // Check for multiple tracking scripts (overhead)
  const trackingScripts: string[] = [];
  if (hasGA4) trackingScripts.push('Google Analytics 4');
  if (hasUA) trackingScripts.push('Universal Analytics');
  if (hasFBPixel) trackingScripts.push('Facebook Pixel');
  if (hasGTM) trackingScripts.push('Google Tag Manager');

  // Check for other analytics
  if (/hotjar\.com/i.test(html)) trackingScripts.push('Hotjar');
  if (/mouseflow\.com/i.test(html)) trackingScripts.push('Mouseflow');
  if (/clarity\.ms/i.test(html)) trackingScripts.push('Microsoft Clarity');
  if (/mixpanel\.com/i.test(html)) trackingScripts.push('Mixpanel');

  if (trackingScripts.length > 4) {
    issues.push({
      id: 'analytics-too-many',
      category: 'analytics',
      severity: 'medium',
      title: 'Too Many Tracking Scripts',
      description: `Site has ${trackingScripts.length} different tracking scripts: ${trackingScripts.join(', ')}`,
      impact: 'Slows page load time and may impact user experience',
      conversionImpact: 'slows-site',
      fix: 'Consolidate tracking through Google Tag Manager to reduce script overhead',
      evidence: trackingScripts
    });
  }

  // Check for proper GTM implementation (if GTM exists)
  if (hasGTM) {
    const hasGTMNoscript = /<noscript[^>]*>[\s\S]*?googletagmanager\.com\/ns\.html[\s\S]*?<\/noscript>/i.test(html);
    if (!hasGTMNoscript) {
      issues.push({
        id: 'analytics-gtm-noscript-missing',
        category: 'analytics',
        severity: 'low',
        title: 'Google Tag Manager Missing <noscript> Fallback',
        description: 'GTM <noscript> tag not found in <body>',
        impact: 'Tracking fails for users with JavaScript disabled',
        conversionImpact: 'minor',
        fix: 'Add GTM <noscript> tag immediately after opening <body> tag',
        evidence: ['GTM found but no <noscript> fallback']
      });
    }
  }

  return issues;
}

/**
 * Detect browser compatibility issues
 */
function detectBrowserCompatibility(html: string): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Check for modern ES6+ JavaScript without transpilation
  const scriptContent = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)?.join(' ') || '';

  // Check for arrow functions, let/const, template literals (not transpiled)
  const hasModernJS = /=>\s*{|const\s+\w+|let\s+\w+|`[^`]*\${/i.test(scriptContent);
  const hasBabelPolyfill = /babel-polyfill|@babel\/polyfill|core-js/i.test(html);

  if (hasModernJS && !hasBabelPolyfill) {
    issues.push({
      id: 'browser-compat-modern-js',
      category: 'browser-compatibility',
      severity: 'medium',
      title: 'Modern JavaScript Without Polyfills',
      description: 'Site uses ES6+ JavaScript features that may not work in older browsers',
      impact: 'Site may break for users on Internet Explorer 11 and older browsers (5-10% of users)',
      conversionImpact: 'blocks-conversions',
      fix: 'Use Babel to transpile modern JavaScript or add polyfills for older browsers',
      evidence: ['ES6+ features detected', 'No Babel/polyfill found']
    });
  }

  // Check for CSS Grid/Flexbox without fallbacks
  const styleContent = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)?.join(' ') || '';
  const hasGrid = /display:\s*grid/i.test(styleContent);
  const hasFlex = /display:\s*flex/i.test(styleContent);

  if ((hasGrid || hasFlex) && !/@supports/i.test(styleContent)) {
    issues.push({
      id: 'browser-compat-modern-css',
      category: 'browser-compatibility',
      severity: 'low',
      title: 'Modern CSS Without Feature Detection',
      description: 'Site uses Grid/Flexbox without @supports feature queries',
      impact: 'Layout may break in older browsers without proper fallbacks',
      conversionImpact: 'hurts-usability',
      fix: 'Add @supports feature queries with fallback layouts for older browsers',
      evidence: ['Grid/Flexbox detected', 'No @supports queries found']
    });
  }

  // Check for vendor prefixes
  const missingPrefixes = [];
  if (/transform:|transition:|animation:/i.test(styleContent)) {
    const hasWebkitPrefix = /-webkit-/i.test(styleContent);
    if (!hasWebkitPrefix) {
      missingPrefixes.push('-webkit-');
    }
  }

  if (missingPrefixes.length > 0 && /transform:|transition:|animation:/i.test(styleContent)) {
    issues.push({
      id: 'browser-compat-prefixes',
      category: 'browser-compatibility',
      severity: 'low',
      title: 'Missing CSS Vendor Prefixes',
      description: 'CSS animations/transforms may not work in some browsers',
      impact: 'Visual effects may not work in Safari and older Chrome versions',
      conversionImpact: 'minor',
      fix: 'Use Autoprefixer or add vendor prefixes manually (-webkit-, -moz-, -ms-, -o-)',
      evidence: ['CSS transforms/animations without prefixes']
    });
  }

  // Check for unsupported HTML5 elements
  const hasHTML5Elements = /<(article|aside|details|figcaption|figure|footer|header|main|mark|nav|section|summary|time)/i.test(html);
  const hasHTML5Shiv = /html5shiv|html5shim/i.test(html);

  if (hasHTML5Elements && !hasHTML5Shiv) {
    issues.push({
      id: 'browser-compat-html5',
      category: 'browser-compatibility',
      severity: 'low',
      title: 'HTML5 Elements Without IE Fallback',
      description: 'Site uses HTML5 semantic elements without html5shiv for IE support',
      impact: 'Layout may break in Internet Explorer 8 and below',
      conversionImpact: 'minor',
      fix: 'Add html5shiv polyfill for IE8 support or use <div> for older browser compatibility',
      evidence: ['HTML5 semantic elements found', 'No html5shiv detected']
    });
  }

  // Check for viewport meta tag (mobile compatibility)
  const hasViewportMeta = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
  if (!hasViewportMeta) {
    issues.push({
      id: 'browser-compat-no-viewport',
      category: 'browser-compatibility',
      severity: 'critical',
      title: 'Missing Viewport Meta Tag',
      description: 'Page lacks viewport meta tag for mobile browsers',
      impact: 'Site displays incorrectly on mobile devices (60%+ of traffic)',
      conversionImpact: 'blocks-conversions',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> in <head>',
      evidence: ['No viewport meta tag found']
    });
  }

  // Check for charset declaration
  const hasCharset = /<meta[^>]*charset=["']?utf-8["']?[^>]*>/i.test(html);
  if (!hasCharset) {
    issues.push({
      id: 'browser-compat-no-charset',
      category: 'browser-compatibility',
      severity: 'medium',
      title: 'Missing Character Encoding Declaration',
      description: 'Page lacks UTF-8 charset declaration',
      impact: 'Special characters may display incorrectly in some browsers',
      conversionImpact: 'minor',
      fix: 'Add <meta charset="UTF-8"> as first element in <head>',
      evidence: ['No charset declaration found']
    });
  }

  return issues;
}

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(issues: PerformanceIssue[]): string[] {
  const recommendations: string[] = [];

  // Prioritize conversion-blocking issues
  const blockingIssues = issues.filter(i => i.conversionImpact === 'blocks-conversions');
  if (blockingIssues.length > 0) {
    recommendations.push(`Fix ${blockingIssues.length} conversion-blocking issues immediately (forms, mobile UX, JavaScript errors)`);
  }

  // Trust issues
  const trustIssues = issues.filter(i => i.conversionImpact === 'reduces-trust');
  if (trustIssues.length > 0) {
    recommendations.push(`Address ${trustIssues.length} trust issues (HTTPS, security, trust signals)`);
  }

  // Performance issues
  const perfIssues = issues.filter(i => i.category === 'performance');
  if (perfIssues.length > 3) {
    recommendations.push(`Optimize performance: ${perfIssues.length} issues detected (images, compression, render-blocking resources)`);
  }

  // Accessibility
  const a11yIssues = issues.filter(i => i.category === 'accessibility');
  if (a11yIssues.length > 2) {
    recommendations.push(`Improve accessibility: ${a11yIssues.length} violations found (affects 15% of users + SEO)`);
  }

  // General recommendation
  if (recommendations.length === 0) {
    recommendations.push('Site is performing well! Consider A/B testing to further optimize conversions');
  }

  return recommendations;
}
