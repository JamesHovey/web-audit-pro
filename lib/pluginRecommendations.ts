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
    pricingDetails: 'Free version available. Premium: £99/year',
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
    pricingDetails: 'Free version very comprehensive. Pro: £59/year',
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
    pricingDetails: 'Free version available. Premium: £49.60/year',
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
    pricingDetails: 'Free: 20MB/month. Lite: £4.99/month (unlimited). Growth: £9.99/month',
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
    pricingDetails: 'Free: 100 images/month. One-time credits: £9.99 for 10,000 images',
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
    pricingDetails: 'Free: Local optimization. Premium: £7/month for cloud compression',
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
    pricingDetails: 'Free: 5MB per image limit. Pro: £6/month',
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
    pricingDetails: 'Single: £59/year. Plus: £119/year. Infinite: £299/year',
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
    pricingDetails: 'Free version very comprehensive. Pro: £99/year',
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
    pricingDetails: 'Free version available. Premium: £49.99 one-time',
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
    pricingDetails: 'Free version available. Pro: £69/year',
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
    pricingDetails: 'Personal: £24.95/year. Business: £49.95/year',
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
  },

  // Lazy Loading Plugins
  {
    name: 'a3 Lazy Load',
    slug: 'a3-lazy-load',
    category: 'performance',
    useCase: ['lazy-loading', 'performance-optimization'],
    description: 'Simple, effective lazy loading for images with automatic configuration',
    rating: 4.7,
    reviews: 840,
    activeInstalls: '100,000+',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/a3-lazy-load/',
    pros: [
      'Completely free',
      'Works automatically after activation',
      'Lazy loads images, iframes, and videos',
      'Mobile optimized',
      'No configuration needed',
      'Lightweight'
    ],
    cons: [
      'Basic features only',
      'No advanced options',
      'Limited customization'
    ],
    bestFor: 'Sites wanting simple, free lazy loading without configuration'
  },
  {
    name: 'Jetpack',
    slug: 'jetpack',
    category: 'performance',
    useCase: ['lazy-loading', 'performance-optimization', 'security'],
    description: 'All-in-one WordPress plugin with free lazy loading, CDN, and security features',
    rating: 3.9,
    reviews: 5280,
    activeInstalls: '5+ million',
    cost: 'Freemium',
    pricingDetails: 'Free: Lazy loading + basic features. Premium: from £3.50/month',
    url: 'https://wordpress.org/plugins/jetpack/',
    freeTierLimits: 'Free tier includes lazy loading, CDN, basic security',
    pros: [
      'Free lazy loading',
      'Free CDN for images',
      'Security features included',
      'Very active development',
      'WordPress.com integration'
    ],
    cons: [
      'Heavy plugin (many features)',
      'Can slow down admin area',
      'Some features require paid plan',
      'Connects to WordPress.com'
    ],
    bestFor: 'Sites already using Jetpack or wanting multiple features in one plugin'
  },
  {
    name: 'Lazy Load by WP Rocket',
    slug: 'rocket-lazy-load',
    category: 'performance',
    useCase: ['lazy-loading', 'performance-optimization'],
    description: 'Free standalone lazy loading plugin from the WP Rocket team',
    rating: 4.4,
    reviews: 520,
    activeInstalls: '100,000+',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/rocket-lazy-load/',
    pros: [
      'Completely free',
      'From trusted WP Rocket team',
      'Lightweight',
      'Lazy loads images and iframes',
      'YouTube video thumbnails',
      'Easy to configure'
    ],
    cons: [
      'No longer actively developed',
      'Basic features compared to paid WP Rocket',
      'Missing some advanced options'
    ],
    bestFor: 'Sites wanting free lazy loading from a reputable developer'
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
    pricingDetails: 'Free: 20 images at a time. API: £25 for 500 compressions',
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
  },

  // Internal Linking Plugins
  {
    name: 'Link Whisper',
    slug: 'link-whisper',
    category: 'seo',
    useCase: ['internal-linking', 'seo-optimization'],
    description: 'AI-powered internal linking plugin that suggests relevant internal links',
    rating: 4.9,
    reviews: 625,
    activeInstalls: '50,000+',
    cost: 'Paid',
    pricingDetails: 'Starter: £77/year. Agency: £117/year',
    url: 'https://linkwhisper.com/',
    pros: [
      'AI-powered link suggestions',
      'Automatic internal linking',
      'Link reports and analytics',
      'Orphaned content detection',
      'Broken link fixing',
      'Very user-friendly'
    ],
    cons: [
      'No free version',
      'Premium pricing',
      'Requires annual subscription'
    ],
    bestFor: 'Content-heavy sites wanting automated intelligent internal linking'
  },
  {
    name: 'Internal Link Juicer',
    slug: 'internal-links',
    category: 'seo',
    useCase: ['internal-linking', 'seo-optimization'],
    description: 'Automatic internal linking based on keywords with customizable rules',
    rating: 4.8,
    reviews: 145,
    activeInstalls: '10,000+',
    cost: 'Freemium',
    pricingDetails: 'Free version available. Pro: £79/year',
    url: 'https://wordpress.org/plugins/internal-links/',
    freeTierLimits: 'Free version has basic auto-linking features',
    pros: [
      'Automatic internal linking',
      'Keyword-based linking',
      'Link limits per post',
      'Blacklist/whitelist support',
      'Free version available',
      'Easy to configure'
    ],
    cons: [
      'Less intelligent than AI solutions',
      'Can create too many links if not configured properly',
      'Pro needed for advanced features'
    ],
    bestFor: 'Sites wanting affordable automated internal linking'
  },
  {
    name: 'Yet Another Related Posts Plugin (YARPP)',
    slug: 'yet-another-related-posts-plugin',
    category: 'seo',
    useCase: ['internal-linking', 'seo-optimization'],
    description: 'Shows related posts to improve internal linking and user engagement',
    rating: 4.6,
    reviews: 845,
    activeInstalls: '100,000+',
    cost: 'Freemium',
    pricingDetails: 'Free version available. Premium: £49/year',
    url: 'https://wordpress.org/plugins/yet-another-related-posts-plugin/',
    freeTierLimits: 'Free version has core features',
    pros: [
      'Completely free core features',
      'Multiple display options',
      'Automatic related content',
      'Customizable algorithms',
      'Works with any theme'
    ],
    cons: [
      'Only shows related posts (not inline linking)',
      'Can slow down sites with many posts',
      'Premium needed for advanced matching'
    ],
    bestFor: 'Sites wanting to increase internal linking through related posts'
  },

  // Structured Data / Schema Plugins
  {
    name: 'Schema Pro',
    slug: 'schema-pro',
    category: 'seo',
    useCase: ['schema-markup', 'structured-data', 'seo-optimization'],
    description: 'Comprehensive schema markup plugin with support for 35+ schema types',
    rating: 4.9,
    reviews: 580,
    activeInstalls: '200,000+',
    cost: 'Paid',
    pricingDetails: 'Personal: £63/year. Agency Unlimited: £188/year',
    url: 'https://wpschema.com/',
    pros: [
      'Most comprehensive schema support',
      'Visual schema editor',
      'Automatic schema generation',
      'Custom schema types',
      'Google Rich Results compatible',
      'WooCommerce support'
    ],
    cons: [
      'No free version',
      'Can be complex for beginners',
      'Premium pricing'
    ],
    bestFor: 'Professional sites needing comprehensive rich results'
  },
  {
    name: 'Schema & Structured Data for WP & AMP',
    slug: 'schema-and-structured-data-for-wp',
    category: 'seo',
    useCase: ['schema-markup', 'structured-data', 'seo-optimization'],
    description: 'Free schema plugin with support for many schema types and AMP',
    rating: 4.7,
    reviews: 612,
    activeInstalls: '100,000+',
    cost: 'Freemium',
    pricingDetails: 'Free version very comprehensive. Pro: £49/year',
    url: 'https://wordpress.org/plugins/schema-and-structured-data-for-wp/',
    freeTierLimits: 'Free version includes 35+ schema types',
    pros: [
      'Generous free version',
      'Easy to use interface',
      'AMP compatibility',
      'Automatic schema generation',
      'Regular updates',
      'Google validation'
    ],
    cons: [
      'Some advanced features need Pro',
      'Documentation could be better',
      'Interface less polished than premium options'
    ],
    bestFor: 'Sites wanting free comprehensive schema markup'
  },

  // Redirect Management Plugins
  {
    name: 'Redirection',
    slug: 'redirection',
    category: 'seo',
    useCase: ['redirects', '404-errors', 'seo-optimization'],
    description: 'Most popular redirect manager for WordPress with comprehensive 404 monitoring',
    rating: 4.8,
    reviews: 2150,
    activeInstalls: '2+ million',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/redirection/',
    pros: [
      'Completely free',
      'Track 404 errors automatically',
      'Import/export redirects',
      'Regular expressions support',
      'Conditional redirects',
      'Monitor all redirects'
    ],
    cons: [
      'Can be complex for beginners',
      'No premium support',
      'Interface could be more modern'
    ],
    bestFor: 'Sites needing comprehensive redirect management and 404 tracking'
  },
  {
    name: 'Simple 301 Redirects',
    slug: 'simple-301-redirects',
    category: 'seo',
    useCase: ['redirects', '404-errors'],
    description: 'Lightweight plugin for simple 301 redirects without extra features',
    rating: 4.5,
    reviews: 284,
    activeInstalls: '100,000+',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/simple-301-redirects/',
    pros: [
      'Extremely simple and lightweight',
      'No learning curve',
      'Fast and efficient',
      'No database bloat',
      'Perfect for basic needs'
    ],
    cons: [
      'No 404 monitoring',
      'No wildcard redirects',
      'Limited to simple redirects',
      'No advanced features'
    ],
    bestFor: 'Users wanting simple redirect functionality without complexity'
  },
  {
    name: 'Safe Redirect Manager',
    slug: 'safe-redirect-manager',
    category: 'seo',
    useCase: ['redirects', '404-errors'],
    description: 'Developer-friendly redirect plugin by 10up with clean interface',
    rating: 4.7,
    reviews: 147,
    activeInstalls: '100,000+',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/safe-redirect-manager/',
    pros: [
      'Clean, modern interface',
      'Supports HTTP status codes',
      'Wildcard redirects',
      'Import/export',
      'Developer hooks available',
      'No database overhead'
    ],
    cons: [
      'No 404 monitoring',
      'Fewer features than Redirection',
      'Less popular/tested'
    ],
    bestFor: 'Developers and users wanting a clean, efficient redirect solution'
  },

  // Schema/Structured Data Plugins
  {
    name: 'Schema Pro',
    slug: 'wp-schema-pro',
    category: 'seo',
    useCase: ['schema-markup', 'seo-optimization'],
    description: 'Premium schema plugin with visual builder and comprehensive schema types',
    rating: 4.9,
    reviews: 428,
    activeInstalls: '200,000+',
    cost: 'Paid',
    pricingDetails: '£63/year for single site',
    url: 'https://wpschema.com/',
    pros: [
      'Visual schema builder',
      'Supports 20+ schema types',
      'Automatic schema generation',
      'Works with any theme/builder',
      'Regular updates for Google changes',
      'Excellent support'
    ],
    cons: [
      'Premium only (no free version)',
      'Annual subscription required',
      'May be overkill for simple sites'
    ],
    bestFor: 'Professional sites needing comprehensive schema management'
  },
  {
    name: 'Schema & Structured Data for WP',
    slug: 'schema-and-structured-data-for-wp',
    category: 'seo',
    useCase: ['schema-markup', 'seo-optimization'],
    description: 'Free schema plugin supporting multiple schema types with easy setup',
    rating: 4.5,
    reviews: 582,
    activeInstalls: '100,000+',
    cost: 'Freemium',
    pricingDetails: 'Free version available. Pro: £79/year',
    url: 'https://wordpress.org/plugins/schema-and-structured-data-for-wp/',
    freeTierLimits: 'Free version includes 35+ schema types',
    pros: [
      'Generous free version',
      'Supports 35+ schema types',
      'Automatic schema insertion',
      'Compatible with major themes',
      'Google validation tools integration',
      'Regular updates'
    ],
    cons: [
      'Interface less intuitive than Schema Pro',
      'Some advanced features require Pro',
      'Limited customization in free version'
    ],
    bestFor: 'Sites wanting comprehensive free schema without complexity'
  },
  {
    name: 'WP SEO Structured Data Schema',
    slug: 'wp-seo-structured-data-schema',
    category: 'seo',
    useCase: ['schema-markup', 'seo-optimization'],
    description: 'Lightweight free schema plugin with focus on essential schema types',
    rating: 4.4,
    reviews: 234,
    activeInstalls: '50,000+',
    cost: 'Free',
    url: 'https://wordpress.org/plugins/wp-seo-structured-data-schema/',
    pros: [
      'Completely free',
      'Lightweight and fast',
      'Easy setup wizard',
      'No coding required',
      'Automatic JSON-LD output',
      'Works with all themes'
    ],
    cons: [
      'Limited schema types',
      'Basic features only',
      'Less frequent updates',
      'Smaller user base'
    ],
    bestFor: 'Simple sites needing basic Organization and Article schemas'
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
  return installedPlugins.some(installed => {
    const installedLower = installed.toLowerCase()
    const pluginNameLower = plugin.name.toLowerCase()
    const pluginSlugLower = plugin.slug.toLowerCase()

    // Bidirectional matching: check if either contains the other
    return (
      installedLower.includes(pluginNameLower) ||
      pluginNameLower.includes(installedLower) ||
      installedLower.includes(pluginSlugLower) ||
      pluginSlugLower.includes(installedLower)
    )
  })
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
  'performance-optimization': 'performance-optimization',
  'internal-linking': 'internal-linking',
  'low-internal-links': 'internal-linking',
  '404-errors': '404-errors',
  'broken-links': '404-errors',
  'redirects': 'redirects',
  'structured-data': 'structured-data',
  'schema-markup': 'schema-markup',
  'invalid-schema': 'schema-markup',
  'unminified-files': 'minification',
  'unminified-javascript': 'javascript-optimization',
  'unminified-css': 'css-optimization'
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
    installedPluginNames.some(installed => {
      const installedLower = installed.toLowerCase()
      const pluginNameLower = plugin.name.toLowerCase()
      const pluginSlugLower = plugin.slug.toLowerCase()

      // Bidirectional matching: check if either contains the other
      return (
        installedLower.includes(pluginNameLower) ||
        pluginNameLower.includes(installedLower) ||
        installedLower.includes(pluginSlugLower) ||
        pluginSlugLower.includes(installedLower)
      )
    })
  )
}

// Helper function to get non-installed plugins with smart filtering
export function getNonInstalledPlugins(
  allPlugins: PluginMetadata[],
  installedPluginNames: string[]
): PluginMetadata[] {
  const installedPlugins = getInstalledPlugins(allPlugins, installedPluginNames)

  return allPlugins.filter(plugin => {
    // Exclude installed plugins - use bidirectional matching
    const isInstalled = installedPluginNames.some(installed => {
      const installedLower = installed.toLowerCase()
      const pluginNameLower = plugin.name.toLowerCase()
      const pluginSlugLower = plugin.slug.toLowerCase()

      // Bidirectional matching: check if either contains the other
      return (
        installedLower.includes(pluginNameLower) ||
        pluginNameLower.includes(installedLower) ||
        installedLower.includes(pluginSlugLower) ||
        pluginSlugLower.includes(installedLower)
      )
    })

    if (isInstalled) return false

    // If no plugins installed, show all alternatives
    if (installedPlugins.length === 0) return true

    // Only show if better than installed plugins
    return isBetterThanInstalled(plugin, installedPlugins)
  })
}
