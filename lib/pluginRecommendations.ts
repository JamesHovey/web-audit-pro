// Plugin recommendation database with metadata
export interface PluginMetadata {
  name: string
  slug: string
  category: 'seo' | 'images' | 'performance' | 'caching' | 'security'
  useCase: string[]
  description: string
  rating: number // out of 5
  reviews: number
  activeInstalls: string
  cost: 'Free' | 'Freemium' | 'Paid'
  pricingDetails?: string
  url: string
  freeTierLimits?: string
  pros: string[]
  cons: string[]
  bestFor: string
}

export const WORDPRESS_PLUGINS: PluginMetadata[] = [
  // SEO Plugins
  {
    name: 'Yoast SEO',
    slug: 'wordpress-seo',
    category: 'seo',
    useCase: ['meta-titles', 'meta-descriptions', 'h1-tags', 'seo-optimization'],
    description: 'Most popular WordPress SEO plugin with comprehensive on-page optimization',
    rating: 4.9,
    reviews: 28650,
    activeInstalls: '5+ million',
    cost: 'Freemium',
    pricingDetails: 'Free version available. Premium: $99/year',
    url: 'https://wordpress.org/plugins/wordpress-seo/',
    freeTierLimits: 'Free version covers all basic SEO needs',
    pros: [
      'User-friendly interface',
      'Real-time content analysis',
      'XML sitemap generation',
      'Breadcrumb navigation',
      'Social media integration'
    ],
    cons: [
      'Can slow down admin area',
      'Premium features needed for advanced schemas',
      'Some features overlap with theme functionality'
    ],
    bestFor: 'Beginners and general WordPress sites'
  },
  {
    name: 'Rank Math',
    slug: 'seo-by-rank-math',
    category: 'seo',
    useCase: ['meta-titles', 'meta-descriptions', 'h1-tags', 'seo-optimization', 'schema-markup'],
    description: 'Feature-rich SEO plugin with advanced schema markup and 404 monitoring',
    rating: 4.9,
    reviews: 6850,
    activeInstalls: '1+ million',
    cost: 'Freemium',
    pricingDetails: 'Free version very comprehensive. Pro: $59/year',
    url: 'https://wordpress.org/plugins/seo-by-rank-math/',
    freeTierLimits: 'Free version includes most features, even schema markup',
    pros: [
      'More features in free version than competitors',
      'Built-in 404 monitor',
      'Google Search Console integration',
      'Local SEO support',
      'Advanced schema markup'
    ],
    cons: [
      'Steeper learning curve',
      'Can be overwhelming for beginners',
      'Some advanced features require Pro'
    ],
    bestFor: 'Advanced users and SEO professionals'
  },
  {
    name: 'All in One SEO',
    slug: 'all-in-one-seo-pack',
    category: 'seo',
    useCase: ['meta-titles', 'meta-descriptions', 'h1-tags', 'seo-optimization'],
    description: 'Original WordPress SEO plugin with solid features and good support',
    rating: 4.6,
    reviews: 4520,
    activeInstalls: '3+ million',
    cost: 'Freemium',
    pricingDetails: 'Free version available. Premium: $49.60/year',
    url: 'https://wordpress.org/plugins/all-in-one-seo-pack/',
    freeTierLimits: 'Free version covers basic SEO',
    pros: [
      'Easy setup wizard',
      'Good for e-commerce',
      'WooCommerce integration',
      'TruSEO score analysis'
    ],
    cons: [
      'Less features in free version compared to Rank Math',
      'Premium required for many features',
      'Interface less modern than competitors'
    ],
    bestFor: 'E-commerce sites and WooCommerce stores'
  },

  // Image Optimization Plugins
  {
    name: 'Imagify',
    slug: 'imagify',
    category: 'images',
    useCase: ['large-images', 'image-optimization', 'webp-conversion'],
    description: 'Simple, powerful image compression with WebP conversion',
    rating: 4.6,
    reviews: 1280,
    activeInstalls: '400,000+',
    cost: 'Freemium',
    pricingDetails: 'Free: 20MB/month. Lite: $4.99/month (unlimited). Growth: $9.99/month',
    url: 'https://wordpress.org/plugins/imagify/',
    freeTierLimits: '20MB of images per month',
    pros: [
      'Excellent compression quality',
      'Easy to use interface',
      'WebP and AVIF support',
      'Bulk optimization',
      'Resize images on upload'
    ],
    cons: [
      'Free tier very limited (20MB)',
      'Requires cloud processing',
      'Monthly quota can run out quickly'
    ],
    bestFor: 'Sites with regular image uploads needing great compression'
  },
  {
    name: 'ShortPixel Image Optimizer',
    slug: 'shortpixel-image-optimiser',
    category: 'images',
    useCase: ['large-images', 'image-optimization', 'webp-conversion'],
    description: 'Powerful image optimization with generous free tier',
    rating: 4.8,
    reviews: 3640,
    activeInstalls: '400,000+',
    cost: 'Freemium',
    pricingDetails: 'Free: 100 images/month. One-time credits: $9.99 for 10,000 images',
    url: 'https://wordpress.org/plugins/shortpixel-image-optimiser/',
    freeTierLimits: '100 images per month',
    pros: [
      'Generous free tier (100 images/month)',
      'One-time credit purchase option',
      'WebP and AVIF support',
      'PDF optimization',
      'Smart adaptive images'
    ],
    cons: [
      'Requires API key signup',
      'Cloud processing only',
      'Interface can be complex'
    ],
    bestFor: 'Sites with moderate image uploads, budget-conscious users'
  },
  {
    name: 'EWWW Image Optimizer',
    slug: 'ewww-image-optimizer',
    category: 'images',
    useCase: ['large-images', 'image-optimization', 'webp-conversion'],
    description: 'Local or cloud image optimization with no monthly limits',
    rating: 4.7,
    reviews: 2340,
    activeInstalls: '1+ million',
    cost: 'Freemium',
    pricingDetails: 'Free: Local optimization. Premium: $7/month for cloud compression',
    url: 'https://wordpress.org/plugins/ewww-image-optimizer/',
    freeTierLimits: 'Unlimited with local optimization',
    pros: [
      'No limits with local optimization',
      'No API key needed for free version',
      'WebP conversion',
      'Works on any hosting',
      'Lazy loading built-in'
    ],
    cons: [
      'Local optimization less powerful',
      'Server resources intensive',
      'Cloud version needed for best results'
    ],
    bestFor: 'High-volume sites, users wanting unlimited free optimization'
  },
  {
    name: 'Smush',
    slug: 'wp-smushit',
    category: 'images',
    useCase: ['large-images', 'image-optimization', 'webp-conversion'],
    description: 'Popular image optimizer by WPMU DEV with lazy loading',
    rating: 4.8,
    reviews: 4520,
    activeInstalls: '1+ million',
    cost: 'Freemium',
    pricingDetails: 'Free: 5MB per image limit. Pro: $6/month',
    url: 'https://wordpress.org/plugins/wp-smushit/',
    freeTierLimits: '5MB max file size, 50 images bulk optimization',
    pros: [
      'Easy to use',
      'Unlimited free optimization',
      'Lazy loading included',
      'Automatic optimization',
      'Image resizing'
    ],
    cons: [
      '5MB file size limit on free',
      'Less compression than competitors',
      'WebP requires Pro version'
    ],
    bestFor: 'Beginners wanting simple, unlimited free optimization'
  },

  // Performance & Caching Plugins
  {
    name: 'WP Rocket',
    slug: 'wp-rocket',
    category: 'performance',
    useCase: ['caching', 'minification', 'lazy-loading', 'performance-optimization', 'javascript-optimization', 'css-optimization'],
    description: 'Premium all-in-one performance plugin - handles caching, JS/CSS optimization, lazy loading, and more',
    rating: 4.9,
    reviews: 8950,
    activeInstalls: '2+ million',
    cost: 'Paid',
    pricingDetails: 'Single: $59/year. Plus: $119/year. Infinite: $299/year',
    url: 'https://wp-rocket.me/',
    pros: [
      'Best overall performance plugin',
      'No configuration needed',
      'Automatic critical CSS',
      'Database optimization',
      'Cloudflare integration',
      'Excellent support'
    ],
    cons: [
      'No free version',
      'Annual subscription required',
      'Some features overlap with hosting'
    ],
    bestFor: 'Serious sites willing to invest in performance'
  },
  {
    name: 'W3 Total Cache',
    slug: 'w3-total-cache',
    category: 'caching',
    useCase: ['caching', 'minification', 'performance-optimization'],
    description: 'Comprehensive free caching plugin with advanced features',
    rating: 4.3,
    reviews: 3840,
    activeInstalls: '1+ million',
    cost: 'Freemium',
    pricingDetails: 'Free version very comprehensive. Pro: $99/year',
    url: 'https://wordpress.org/plugins/w3-total-cache/',
    freeTierLimits: 'Free version includes most features',
    pros: [
      'Completely free core features',
      'CDN integration',
      'Extensive caching options',
      'Database caching',
      'Browser caching'
    ],
    cons: [
      'Complex to configure',
      'Can break sites if misconfigured',
      'Support limited on free version'
    ],
    bestFor: 'Advanced users comfortable with caching configuration'
  },
  {
    name: 'WP Super Cache',
    slug: 'wp-super-cache',
    category: 'caching',
    useCase: ['caching', 'performance-optimization'],
    description: 'Simple, reliable caching plugin by Automattic',
    rating: 4.4,
    reviews: 2560,
    activeInstalls: '2+ million',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/wp-super-cache/',
    pros: [
      'Completely free',
      'Easy to setup',
      'Reliable and stable',
      'Works with CDNs',
      'Maintained by Automattic'
    ],
    cons: [
      'Basic features only',
      'No minification',
      'Limited advanced options'
    ],
    bestFor: 'Beginners wanting simple free caching'
  },
  {
    name: 'Autoptimize',
    slug: 'autoptimize',
    category: 'performance',
    useCase: ['minification', 'css-optimization', 'javascript-optimization'],
    description: 'Specialized plugin for minifying and optimizing CSS, JS, and HTML',
    rating: 4.7,
    reviews: 3420,
    activeInstalls: '1+ million',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/autoptimize/',
    pros: [
      'Completely free',
      'Excellent CSS/JS optimization',
      'Defer non-critical CSS',
      'Remove render-blocking resources',
      'Works well with caching plugins'
    ],
    cons: [
      'Can break sites if aggressive settings used',
      'No caching features',
      'Requires testing after setup'
    ],
    bestFor: 'Sites needing CSS/JS optimization to pair with caching'
  },
  {
    name: 'LiteSpeed Cache',
    slug: 'litespeed-cache',
    category: 'caching',
    useCase: ['caching', 'minification', 'image-optimization', 'performance-optimization'],
    description: 'All-in-one optimization for LiteSpeed servers (works on any server)',
    rating: 4.8,
    reviews: 6240,
    activeInstalls: '5+ million',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/litespeed-cache/',
    freeTierLimits: 'Some CDN features require LiteSpeed hosting',
    pros: [
      'Completely free',
      'All-in-one solution',
      'Image optimization included',
      'Database optimization',
      'Works on any hosting (limited features)',
      'Best on LiteSpeed servers'
    ],
    cons: [
      'Full features require LiteSpeed hosting',
      'Complex interface',
      'Some features competitive with hosting'
    ],
    bestFor: 'Sites on LiteSpeed hosting, or users wanting free all-in-one'
  },
  {
    name: 'WP Fastest Cache',
    slug: 'wp-fastest-cache',
    category: 'caching',
    useCase: ['caching', 'minification', 'performance-optimization'],
    description: 'Simple, fast caching plugin with good free version',
    rating: 4.7,
    reviews: 4120,
    activeInstalls: '1+ million',
    cost: 'Freemium',
    pricingDetails: 'Free version available. Premium: $49.99 one-time',
    url: 'https://wordpress.org/plugins/wp-fastest-cache/',
    pros: [
      'Easy to use',
      'Fast and lightweight',
      'Cache preloading',
      'Mobile cache',
      'One-time premium payment'
    ],
    cons: [
      'Basic features in free version',
      'Premium needed for image optimization',
      'No database optimization in free'
    ],
    bestFor: 'Users wanting simple, affordable caching'
  },

  // Additional Tools
  {
    name: 'Asset CleanUp',
    slug: 'wp-asset-clean-up',
    category: 'performance',
    useCase: ['css-optimization', 'javascript-optimization', 'performance-optimization'],
    description: 'Unload unnecessary CSS/JS on specific pages to reduce bloat',
    rating: 4.9,
    reviews: 1850,
    activeInstalls: '200,000+',
    cost: 'Freemium',
    pricingDetails: 'Free version available. Pro: $69/year',
    url: 'https://wordpress.org/plugins/wp-asset-clean-up/',
    pros: [
      'Reduce plugin bloat',
      'Page-specific asset control',
      'Test mode for safe testing',
      'RegEx unloading support',
      'Combines well with other plugins'
    ],
    cons: [
      'Manual configuration per page',
      'Can break functionality if misused',
      'Time-consuming to set up properly'
    ],
    bestFor: 'Advanced users dealing with plugin bloat'
  },
  {
    name: 'Perfmatters',
    slug: 'perfmatters',
    category: 'performance',
    useCase: ['performance-optimization', 'script-management', 'lazy-loading'],
    description: 'Lightweight performance plugin for script management and optimization',
    rating: 4.9,
    reviews: 2150,
    activeInstalls: '200,000+',
    cost: 'Paid',
    pricingDetails: 'Personal: $24.95/year. Business: $49.95/year',
    url: 'https://perfmatters.io/',
    pros: [
      'Very lightweight',
      'Script manager',
      'Database optimization',
      'Lazy loading',
      'CDN integration',
      'No bloat'
    ],
    cons: [
      'No free version',
      'Premium pricing',
      'Limited cache features'
    ],
    bestFor: 'Performance-focused sites wanting lightweight optimization'
  }
]

export const NON_WORDPRESS_TOOLS: PluginMetadata[] = [
  {
    name: 'TinyPNG',
    slug: 'tinypng',
    category: 'images',
    useCase: ['large-images', 'image-optimization'],
    description: 'Online tool for compressing PNG and JPEG images',
    rating: 4.8,
    reviews: 12500,
    activeInstalls: 'Web-based',
    cost: 'Freemium',
    pricingDetails: 'Free: 20 images at a time. API: $25 for 500 compressions',
    url: 'https://tinypng.com/',
    freeTierLimits: '20 images per upload session',
    pros: [
      'Excellent compression',
      'Easy to use',
      'No signup required',
      'Batch processing',
      'API available'
    ],
    cons: [
      'Manual upload process',
      '20 image limit per session',
      'No automation in free version'
    ],
    bestFor: 'Manual image optimization before upload'
  },
  {
    name: 'Squoosh',
    slug: 'squoosh',
    category: 'images',
    useCase: ['large-images', 'image-optimization', 'webp-conversion'],
    description: 'Google\'s web app for image compression with visual comparison',
    rating: 4.7,
    reviews: 8500,
    activeInstalls: 'Web-based',
    cost: 'Free',
    url: 'https://squoosh.app/',
    pros: [
      'Completely free',
      'Visual quality comparison',
      'Modern format support (WebP, AVIF)',
      'Works offline (PWA)',
      'Privacy-focused (local processing)',
      'No limits'
    ],
    cons: [
      'One image at a time',
      'No bulk processing',
      'Manual process'
    ],
    bestFor: 'Users wanting free, high-quality manual optimization'
  },
  {
    name: 'ImageOptim',
    slug: 'imageoptim',
    category: 'images',
    useCase: ['large-images', 'image-optimization'],
    description: 'Mac app for lossless image optimization',
    rating: 4.9,
    reviews: 15200,
    activeInstalls: 'Desktop app',
    cost: 'Free',
    url: 'https://imageoptim.com/',
    pros: [
      'Completely free',
      'Drag-and-drop interface',
      'Lossless and lossy options',
      'Batch processing',
      'Preserves image quality'
    ],
    cons: [
      'Mac only',
      'Desktop app required',
      'No WebP support in free version'
    ],
    bestFor: 'Mac users wanting local batch optimization'
  }
]

// Helper function to get plugins by use case
export function getPluginsByUseCase(useCase: string, installedPlugins: string[] = []): PluginMetadata[] {
  const allPlugins = [...WORDPRESS_PLUGINS, ...NON_WORDPRESS_TOOLS]
  const filtered = allPlugins.filter(plugin => plugin.useCase.includes(useCase))

  // Sort: installed plugins first, then by rating
  return filtered.sort((a, b) => {
    const aInstalled = installedPlugins.some(installed =>
      installed.toLowerCase().includes(a.name.toLowerCase()) ||
      installed.toLowerCase().includes(a.slug)
    )
    const bInstalled = installedPlugins.some(installed =>
      installed.toLowerCase().includes(b.name.toLowerCase()) ||
      b.slug.includes(installed.toLowerCase())
    )

    if (aInstalled && !bInstalled) return -1
    if (!aInstalled && bInstalled) return 1

    // If both installed or both not installed, sort by rating
    return b.rating - a.rating
  })
}

// Helper function to check if a plugin is already installed
export function isPluginInstalled(plugin: PluginMetadata, installedPlugins: string[]): boolean {
  return installedPlugins.some(installed =>
    installed.toLowerCase().includes(plugin.name.toLowerCase()) ||
    installed.toLowerCase().includes(plugin.slug)
  )
}

// Map issue types to use cases
export const ISSUE_TO_USECASE: Record<string, string> = {
  'missing-h1': 'h1-tags',
  'missing-meta-titles': 'meta-titles',
  'missing-meta-descriptions': 'meta-descriptions',
  'large-images': 'large-images',
  'image-optimization': 'image-optimization',
  'caching': 'caching',
  'minification': 'minification',
  'css-optimization': 'css-optimization',
  'javascript-optimization': 'javascript-optimization',
  'performance-optimization': 'performance-optimization'
}

// Helper function to calculate a plugin's quality score
function calculatePluginScore(plugin: PluginMetadata): number {
  let score = 0

  // Rating (0-50 points)
  score += plugin.rating * 10

  // Reviews (0-20 points) - more reviews = more trustworthy
  if (plugin.reviews > 10000) score += 20
  else if (plugin.reviews > 5000) score += 15
  else if (plugin.reviews > 2000) score += 10
  else if (plugin.reviews > 1000) score += 5

  // Active installs (0-20 points)
  const installsStr = plugin.activeInstalls.toLowerCase()
  if (installsStr.includes('5+') || installsStr.includes('million')) score += 20
  else if (installsStr.includes('3+') || installsStr.includes('2+') || installsStr.includes('1+')) score += 15
  else if (installsStr.includes('400,000') || installsStr.includes('500,000')) score += 10
  else if (installsStr.includes('200,000')) score += 5

  // Cost (0-10 points) - free is better
  if (plugin.cost === 'Free') score += 10
  else if (plugin.cost === 'Freemium') score += 5
  // Paid gets 0 points

  return score
}

// Helper function to check if a plugin is better than installed ones
export function isBetterThanInstalled(
  plugin: PluginMetadata,
  installedPlugins: PluginMetadata[]
): boolean {
  if (installedPlugins.length === 0) return true

  const pluginScore = calculatePluginScore(plugin)
  const maxInstalledScore = Math.max(...installedPlugins.map(p => calculatePluginScore(p)))

  // Plugin must be at least 10 points better to be recommended
  return pluginScore > maxInstalledScore + 10
}

// Helper function to get installed plugins from a list
export function getInstalledPlugins(
  allPlugins: PluginMetadata[],
  installedPluginNames: string[]
): PluginMetadata[] {
  return allPlugins.filter(plugin =>
    installedPluginNames.some(installed =>
      installed.toLowerCase().includes(plugin.name.toLowerCase()) ||
      installed.toLowerCase().includes(plugin.slug)
    )
  )
}

// Helper function to get non-installed plugins with smart filtering
export function getNonInstalledPlugins(
  allPlugins: PluginMetadata[],
  installedPluginNames: string[]
): PluginMetadata[] {
  const installedPlugins = getInstalledPlugins(allPlugins, installedPluginNames)

  return allPlugins.filter(plugin => {
    // Exclude installed plugins
    const isInstalled = installedPluginNames.some(installed =>
      installed.toLowerCase().includes(plugin.name.toLowerCase()) ||
      installed.toLowerCase().includes(plugin.slug)
    )

    if (isInstalled) return false

    // If no plugins installed, show all alternatives
    if (installedPlugins.length === 0) return true

    // Only show if better than installed plugins
    return isBetterThanInstalled(plugin, installedPlugins)
  })
}
