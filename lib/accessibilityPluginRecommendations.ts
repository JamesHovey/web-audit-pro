/**
 * Accessibility Plugin Recommendations Database
 * Curated list of WordPress accessibility plugins with detailed information
 */

export interface AccessibilityPluginMetadata {
  name: string
  slug: string
  description: string
  url: string
  category: 'accessibility-checker' | 'accessibility-fixer' | 'accessibility-widget' | 'compliance'
  rating: number
  reviews: number
  activeInstalls: string
  cost: 'Free' | 'Freemium' | 'Paid'
  pricingDetails?: string
  freeTierLimits?: string
  bestFor: string
  pros: string[]
  cons: string[]
  wcagCompliance: string
  features: string[]
}

export const ACCESSIBILITY_PLUGINS: AccessibilityPluginMetadata[] = [
  // Accessibility Checkers & Auditors
  {
    name: 'WP Accessibility Helper (WAH)',
    slug: 'wp-accessibility-helper',
    description: 'Toolbar that allows visitors to adjust font size, contrast, and other accessibility features',
    url: 'https://wordpress.org/plugins/wp-accessibility-helper/',
    category: 'accessibility-widget',
    rating: 4.5,
    reviews: 125,
    activeInstalls: '10,000+',
    cost: 'Freemium',
    pricingDetails: 'Free with premium features from £49/year',
    freeTierLimits: 'Basic toolbar, limited customization',
    bestFor: 'Sites wanting to provide visitor-controlled accessibility options',
    pros: [
      'Easy for visitors to adjust accessibility settings',
      'No coding required',
      'Customizable toolbar',
      'Works with all themes',
      'Helps with WCAG compliance'
    ],
    cons: [
      'Premium features required for full customization',
      'Adds extra scripts to page load',
      'Some features need manual configuration'
    ],
    wcagCompliance: 'WCAG 2.1 Level AA',
    features: [
      'Font size adjustment',
      'Contrast modes',
      'Highlight links',
      'Readable fonts',
      'Text spacing',
      'Hide images',
      'Reset button'
    ]
  },
  {
    name: 'One Click Accessibility',
    slug: 'pojo-accessibility',
    description: 'Fast accessibility plugin with toolbar for skip links, font size, contrast, and more',
    url: 'https://wordpress.org/plugins/pojo-accessibility/',
    category: 'accessibility-widget',
    rating: 4.7,
    reviews: 385,
    activeInstalls: '100,000+',
    cost: 'Free',
    bestFor: 'Quick accessibility improvements with minimal setup',
    pros: [
      'Completely free',
      'Very easy to install and configure',
      'Lightweight and fast',
      'Skip to content links',
      'Keyboard navigation support',
      'Regular updates'
    ],
    cons: [
      'Limited customization options',
      'Basic feature set',
      'No automated testing'
    ],
    wcagCompliance: 'WCAG 2.0 Level AA',
    features: [
      'Skip to content',
      'Font resize',
      'Contrast switcher',
      'Highlight links',
      'Keyboard navigation',
      'Accessible toolbar'
    ]
  },
  {
    name: 'Accessibility Checker',
    slug: 'accessibility-checker',
    description: 'Scans your content for accessibility issues and provides guidance on fixes',
    url: 'https://wordpress.org/plugins/accessibility-checker/',
    category: 'accessibility-checker',
    rating: 4.6,
    reviews: 156,
    activeInstalls: '40,000+',
    cost: 'Freemium',
    pricingDetails: 'Free version + Pro from £99/year',
    freeTierLimits: 'Limited to 25 checks per post/page',
    bestFor: 'Content editors who want real-time accessibility feedback',
    pros: [
      'Real-time scanning while editing',
      'Clear fix recommendations',
      'Integrates with Gutenberg',
      'Detailed reports',
      'Highlights specific issues'
    ],
    cons: [
      'Pro version needed for full scans',
      'Can slow down editor on large posts',
      'Limited to content only (not theme/plugins)'
    ],
    wcagCompliance: 'WCAG 2.1 Level AA',
    features: [
      'Automated content scanning',
      'Image alt text checker',
      'Heading structure validation',
      'Color contrast testing',
      'Link text analysis',
      'Form label verification'
    ]
  },
  {
    name: 'WP Accessibility',
    slug: 'wp-accessibility',
    description: 'Fixes common accessibility issues in WordPress themes and provides tools for improvement',
    url: 'https://wordpress.org/plugins/wp-accessibility/',
    category: 'accessibility-fixer',
    rating: 4.8,
    reviews: 215,
    activeInstalls: '100,000+',
    cost: 'Free',
    bestFor: 'Fixing theme-level accessibility issues automatically',
    pros: [
      '100% free',
      'Automatically fixes many issues',
      'Skip links',
      'Keyboard navigation improvements',
      'ARIA landmark roles',
      'Well maintained'
    ],
    cons: [
      'Requires technical knowledge for configuration',
      'May conflict with some themes',
      'Not a complete solution'
    ],
    wcagCompliance: 'WCAG 2.1 Level AA',
    features: [
      'Skip to content links',
      'Remove title attributes',
      'Add focus outlines',
      'Add ARIA landmarks',
      'Remove target="_blank"',
      'Add post titles to read more links'
    ]
  },
  {
    name: 'UserWay Accessibility Widget',
    slug: 'userway-accessibility-widget',
    description: 'AI-powered accessibility widget with automated fixes and compliance monitoring',
    url: 'https://wordpress.org/plugins/userway-accessibility-widget/',
    category: 'accessibility-widget',
    rating: 4.9,
    reviews: 892,
    activeInstalls: '200,000+',
    cost: 'Freemium',
    pricingDetails: 'Free basic + Pro from £490/year',
    freeTierLimits: 'Basic widget, UserWay branding',
    bestFor: 'Enterprise sites needing comprehensive accessibility solution',
    pros: [
      'AI-powered automatic fixes',
      'Very comprehensive feature set',
      'Legal compliance support',
      'Continuous monitoring',
      'Excellent support'
    ],
    cons: [
      'Expensive for full features',
      'Free version has branding',
      'Heavier than alternatives'
    ],
    wcagCompliance: 'WCAG 2.1 Level AA, ADA, Section 508',
    features: [
      'AI auto-remediation',
      'Screen reader optimization',
      'Keyboard navigation',
      'Content adjustments',
      'Color contrast fixes',
      'Compliance monitoring',
      'Accessibility statement generator'
    ]
  },
  {
    name: 'accessiBe',
    slug: 'accessibe',
    description: 'AI-powered accessibility solution with automated compliance and legal protection',
    url: 'https://accessibe.com/',
    category: 'compliance',
    rating: 4.7,
    reviews: 1250,
    activeInstalls: '50,000+',
    cost: 'Paid',
    pricingDetails: 'From £490/year',
    bestFor: 'Sites needing full ADA/WCAG compliance with legal protection',
    pros: [
      'Fully automated AI remediation',
      'Legal compliance guarantee',
      'Minimal manual work required',
      'Continuous scanning and fixes',
      'Excellent customer support'
    ],
    cons: [
      'No free tier',
      'Expensive for small sites',
      'Requires ongoing subscription'
    ],
    wcagCompliance: 'WCAG 2.1 Level AA & AAA, ADA, Section 508, EAA',
    features: [
      'AI-powered auto-remediation',
      'Blind user accessibility',
      'Keyboard navigation',
      'Seizure safe profiles',
      'Vision impairment profiles',
      'ADHD friendly mode',
      'Legal compliance certification'
    ]
  },
  {
    name: 'Equalize Digital Accessibility Checker',
    slug: 'equalize-digital-accessibility-checker',
    description: 'Premium accessibility checker with detailed reports and fix guidance',
    url: 'https://equalizedigital.com/',
    category: 'accessibility-checker',
    rating: 4.9,
    reviews: 87,
    activeInstalls: '5,000+',
    cost: 'Freemium',
    pricingDetails: 'Free + Premium from £199/year',
    freeTierLimits: 'Limited scans, basic reporting',
    bestFor: 'Developers wanting detailed technical accessibility reports',
    pros: [
      'Very detailed issue reporting',
      'Code-level fix recommendations',
      'Integrates with development workflow',
      'Checks theme and plugin code',
      'Regular updates'
    ],
    cons: [
      'More technical than alternatives',
      'Premium needed for full features',
      'Smaller user base'
    ],
    wcagCompliance: 'WCAG 2.1 Level AA',
    features: [
      'Automated full-site scans',
      'Color contrast checker',
      'Image alt text validation',
      'Heading hierarchy checks',
      'Form accessibility testing',
      'Link purpose verification',
      'PDF accessibility checks'
    ]
  },
  {
    name: 'Enable - Accessibility',
    slug: 'enable-accessibility',
    description: 'Lightweight accessibility toolbar for users to customize their viewing experience',
    url: 'https://wordpress.org/plugins/enable-accessibility/',
    category: 'accessibility-widget',
    rating: 4.4,
    reviews: 42,
    activeInstalls: '3,000+',
    cost: 'Free',
    bestFor: 'Small sites wanting basic accessibility options for visitors',
    pros: [
      'Completely free',
      'Very lightweight',
      'Simple to set up',
      'No performance impact',
      'Clean interface'
    ],
    cons: [
      'Limited features',
      'Basic styling options',
      'Not actively maintained'
    ],
    wcagCompliance: 'WCAG 2.0 Level A',
    features: [
      'Font size controls',
      'High contrast mode',
      'Underline links',
      'Grayscale mode',
      'Negative contrast',
      'Light background'
    ]
  }
]

/**
 * Get plugins by category
 */
export function getPluginsByCategory(category: AccessibilityPluginMetadata['category']): AccessibilityPluginMetadata[] {
  return ACCESSIBILITY_PLUGINS.filter(p => p.category === category)
}

/**
 * Get free plugins only
 */
export function getFreePlugins(): AccessibilityPluginMetadata[] {
  return ACCESSIBILITY_PLUGINS.filter(p => p.cost === 'Free')
}

/**
 * Get top-rated plugins
 */
export function getTopRatedPlugins(minRating: number = 4.5): AccessibilityPluginMetadata[] {
  return ACCESSIBILITY_PLUGINS.filter(p => p.rating >= minRating).sort((a, b) => b.rating - a.rating)
}

/**
 * Detect installed accessibility plugins from HTML
 */
export function detectInstalledAccessibilityPlugins(html: string): string[] {
  const lowerHtml = html.toLowerCase()
  const installedPlugins: string[] = []

  // Detect WP Accessibility Helper
  if (lowerHtml.includes('wp-accessibility-helper') || lowerHtml.includes('wah-toolbar')) {
    installedPlugins.push('WP Accessibility Helper (WAH)')
  }

  // Detect One Click Accessibility (Pojo)
  if (lowerHtml.includes('pojo-accessibility') || lowerHtml.includes('pojo-a11y')) {
    installedPlugins.push('One Click Accessibility')
  }

  // Detect Accessibility Checker
  if (lowerHtml.includes('accessibility-checker') || lowerHtml.includes('edac-')) {
    installedPlugins.push('Accessibility Checker')
  }

  // Detect WP Accessibility
  if (lowerHtml.includes('/wp-accessibility/') || lowerHtml.includes('wp-a11y')) {
    installedPlugins.push('WP Accessibility')
  }

  // Detect UserWay
  if (lowerHtml.includes('userway') || lowerHtml.includes('cdn.userway.org')) {
    installedPlugins.push('UserWay Accessibility Widget')
  }

  // Detect accessiBe
  if (lowerHtml.includes('accessibe') || lowerHtml.includes('acsbjs')) {
    installedPlugins.push('accessiBe')
  }

  // Detect Enable Accessibility
  if (lowerHtml.includes('enable-accessibility') || lowerHtml.includes('enable-jquery-accessibility')) {
    installedPlugins.push('Enable - Accessibility')
  }

  // Detect Equalize Digital
  if (lowerHtml.includes('equalize-digital') || lowerHtml.includes('accessibility-checker')) {
    installedPlugins.push('Equalize Digital Accessibility Checker')
  }

  return installedPlugins
}

/**
 * Get installed plugins from the database
 */
export function getInstalledAccessibilityPlugins(installedPluginNames: string[]): AccessibilityPluginMetadata[] {
  return ACCESSIBILITY_PLUGINS.filter(plugin =>
    installedPluginNames.some(installed =>
      installed.toLowerCase().includes(plugin.slug) ||
      plugin.name.toLowerCase().includes(installed.toLowerCase())
    )
  )
}

/**
 * Get recommended plugins based on issues found
 */
export function getRecommendedPlugins(issues: any[], installedPlugins: string[]): AccessibilityPluginMetadata[] {
  const installed = getInstalledAccessibilityPlugins(installedPlugins)
  const installedSlugs = installed.map(p => p.slug)

  // If they have critical issues, recommend comprehensive solutions
  const hasCriticalIssues = issues.some(i => i.impact === 'critical')
  const hasManyIssues = issues.length > 20

  if (hasCriticalIssues || hasManyIssues) {
    // Recommend enterprise solutions
    return ACCESSIBILITY_PLUGINS.filter(p =>
      !installedSlugs.includes(p.slug) &&
      (p.slug === 'userway-accessibility-widget' || p.slug === 'accessibe' || p.slug === 'wp-accessibility-helper')
    ).slice(0, 3)
  }

  // For moderate issues, recommend checkers and fixers
  return ACCESSIBILITY_PLUGINS.filter(p =>
    !installedSlugs.includes(p.slug) &&
    (p.category === 'accessibility-checker' || p.category === 'accessibility-fixer')
  ).slice(0, 3)
}
