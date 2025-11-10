"use client"

import React from 'react'
import { AlertTriangle, Zap, Image, Code, Server, TrendingUp, HelpCircle } from 'lucide-react'
import Tooltip from './Tooltip'
import PluginRecommendationTable from './PluginRecommendationTable'
import { getPluginsByUseCase } from '@/lib/pluginRecommendations'
import { getPageBuilderOptimizations } from '@/lib/pluginDetectionService'

interface Recommendation {
  title: string
  description: string
  impact: 'High' | 'Medium' | 'Low'
  effort: 'Easy' | 'Medium' | 'Hard'
  icon: React.ReactNode
  details: string
  howTo: string[]
  useCase?: string  // Added to map to plugin recommendations
}

interface EnhancedRecommendationsProps {
  recommendations: string[]
  desktopScore?: number
  mobileScore?: number
  lcpScore?: string
  clsScore?: string
  inpScore?: string
  detectedPlugins?: string[]
  pageBuilder?: string
  cms?: string
  technicalIssues?: {
    missingH1Tags?: number
    missingMetaTitles?: number
    missingMetaDescriptions?: number
    largeImages?: number
    http404Errors?: number
  }
  largeImagesList?: Array<{
    imageUrl: string
    pageUrl: string
    sizeKB: number
  }>
}

export default function EnhancedRecommendations({
  recommendations,
  desktopScore,
  mobileScore,
  detectedPlugins = [],
  pageBuilder,
  cms,
  technicalIssues,
  largeImagesList = []
}: EnhancedRecommendationsProps) {
  
  // Helper function to generate recommendations for technical SEO issues
  const getTechnicalSEORecommendations = (): Recommendation[] => {
    const techRecs: Recommendation[] = []

    // Missing H1 Tags
    if (technicalIssues?.missingH1Tags && technicalIssues.missingH1Tags > 0) {
      techRecs.push({
        title: 'Add Missing H1 Tags',
        description: `${technicalIssues.missingH1Tags} page(s) are missing H1 tags, which are critical for SEO`,
        impact: 'High',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'H1 tags help search engines understand the main topic of your pages and improve accessibility',
        useCase: 'h1-tags',
        howTo: cms === 'WordPress' ? [
          'Edit each page in WordPress editor',
          'Add a clear, descriptive heading at the top of the page content',
          'Ensure it uses the H1 heading format (usually "Heading 1" in the editor)',
          'Make the H1 unique and descriptive of the page content',
          'Include your primary keyword if relevant',
          'WordPress: Most themes automatically make the page title an H1. Check Theme → Customize → Typography settings',
          'Yoast SEO plugin: Will warn you if H1 is missing in the SEO analysis',
          'Rank Math plugin: Provides H1 tag analysis in the content editor'
        ] : [
          'Add a clear, descriptive <h1> tag at the top of each page',
          'Ensure each page has exactly one H1 tag',
          'Make the H1 unique and descriptive of the page content',
          'Include your primary keyword if relevant',
          'HTML: <h1>Your Main Page Heading</h1>',
          'For CMS platforms, usually the page title becomes the H1 automatically'
        ]
      })
    }

    // Missing Meta Titles
    if (technicalIssues?.missingMetaTitles && technicalIssues.missingMetaTitles > 0) {
      techRecs.push({
        title: 'Add Missing Meta Titles',
        description: `${technicalIssues.missingMetaTitles} page(s) lack meta titles, hurting search visibility`,
        impact: 'High',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Meta titles appear in search results and browser tabs, and are one of the most important SEO elements',
        useCase: 'meta-titles',
        howTo: cms === 'WordPress' ? [
          'Install an SEO plugin: Yoast SEO, Rank Math, or All in One SEO',
          'Edit each page/post and find the SEO section below the editor',
          'Add a compelling title (50-60 characters recommended)',
          'Include your primary keyword near the beginning',
          'Make each title unique and descriptive',
          'Yoast SEO: Edit the "SEO title" field in the Yoast meta box',
          'Rank Math: Use the "SEO Title" field in Rank Math meta box',
          'Preview how it will look in search results using the plugin preview'
        ] : [
          'Add <title> tag in the <head> section of each page',
          'Keep titles between 50-60 characters',
          'Include primary keyword near the beginning',
          'Make each title unique and compelling',
          'HTML: <title>Your Page Title - Brand Name</title>',
          'For e-commerce: Include product name, category, and brand'
        ]
      })
    }

    // Missing Meta Descriptions
    if (technicalIssues?.missingMetaDescriptions && technicalIssues.missingMetaDescriptions > 0) {
      techRecs.push({
        title: 'Add Missing Meta Descriptions',
        description: `${technicalIssues.missingMetaDescriptions} page(s) need meta descriptions for better search previews`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Meta descriptions appear in search results and influence click-through rates',
        useCase: 'meta-descriptions',
        howTo: cms === 'WordPress' ? [
          'Use your SEO plugin to add meta descriptions',
          'Write compelling descriptions (150-160 characters)',
          'Include relevant keywords naturally',
          'Make each description unique and actionable',
          'Add a call-to-action if appropriate',
          'Yoast SEO: Edit the "Meta description" field',
          'Rank Math: Use the "Description" field in the meta box',
          'All in One SEO: Fill in the "Meta Description" field'
        ] : [
          'Add <meta name="description"> tag in the <head> section',
          'Keep descriptions between 150-160 characters',
          'Include relevant keywords naturally',
          'Write compelling, actionable copy',
          'HTML: <meta name="description" content="Your page description here">',
          'Each page should have a unique description'
        ]
      })
    }

    // Large Images
    if (technicalIssues?.largeImages && technicalIssues.largeImages > 0) {
      techRecs.push({
        title: 'Optimise Large Images',
        description: `${technicalIssues.largeImages} image(s) over 100KB are slowing down your site. See "Large Images Need Optimisation" table below for specific images.`,
        impact: 'High',
        effort: 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: 'Large images significantly impact page load time and user experience. The table below shows which specific images need optimisation and where they appear.',
        useCase: 'large-images',
        howTo: cms === 'WordPress' ? [
          '📋 Check the "Large Images Need Optimisation" table below to see which images need fixing',
          'Install an image optimisation plugin (see recommended plugins below):',
          'Recommended: Imagify, ShortPixel, or EWWW Image Optimiser (all have free tiers)',
          'These plugins automatically compress images on upload',
          'Imagify: Install → Settings → Choose "Normal" compression → Enable "Auto-optimise images"',
          'ShortPixel: Install → Settings → Enter API key (free 100 images/month) → Enable "Optimise on upload"',
          'EWWW: Install → Enable "Compress images on upload" and "Convert to WebP"',
          'For existing images: Use the bulk optimiser in the plugin',
          'Alternative: Compress images before uploading using TinyPNG.com or Squoosh.app',
          'Target: Keep images under 200KB, preferably under 100KB',
          '✅ After optimisation, re-run the audit to verify improvements'
        ] : [
          '📋 Check the "Large Images Need Optimisation" table below to see which images need fixing',
          'Compress images before uploading to your site',
          'Use online tools: TinyPNG.com, Squoosh.app, or ImageOptim',
          'Convert to modern formats: WebP or AVIF',
          'Set appropriate dimensions - don\'t upload larger than needed',
          'Use responsive images with srcset attribute',
          'For e-commerce: Shopify has built-in image optimisation',
          'For Wix/Squarespace: Use their built-in image optimisation tools',
          'Target: Keep images under 200KB, preferably under 100KB',
          '✅ After optimisation, re-run the audit to verify improvements'
        ]
      })
    }

    return techRecs
  }

  // Helper function to get plugin-specific instructions
  const getPluginSpecificInstructions = (baseInstructions: string[], recommendationType: string): string[] => {
    const pluginInstructions: string[] = [...baseInstructions]
    
    // Add plugin-specific instructions based on detected plugins
    if (recommendationType === 'css' && detectedPlugins.length > 0) {
      if (detectedPlugins.includes('WP Rocket')) {
        pluginInstructions.splice(1, 0, '🚀 In WP Rocket: Go to File Optimization → CSS Files → Enable "Minify CSS" and "Combine CSS files"')
      }
      if (detectedPlugins.includes('Autoptimize')) {
        pluginInstructions.splice(1, 0, '⚡ In Autoptimize: Enable "Optimize CSS Code" and "Aggregate CSS-files"')
      }
      if (detectedPlugins.includes('W3 Total Cache')) {
        pluginInstructions.splice(1, 0, '🎯 In W3 Total Cache: Enable "Minify CSS" under Performance → Minify settings')
      }
    }
    
    if (recommendationType === 'javascript' && detectedPlugins.length > 0) {
      if (detectedPlugins.includes('WP Rocket')) {
        pluginInstructions.splice(1, 0, '🚀 In WP Rocket: Enable "Minify JavaScript", "Combine JavaScript files", and "Load JavaScript deferred"')
      }
      if (detectedPlugins.includes('Autoptimize')) {
        pluginInstructions.splice(1, 0, '⚡ In Autoptimize: Enable "Optimize JavaScript Code" and consider "Defer non-aggregated JS"')
      }
      if (detectedPlugins.includes('W3 Total Cache')) {
        pluginInstructions.splice(1, 0, '🎯 In W3 Total Cache: Enable "Minify JS" and configure JS minification settings')
      }
    }
    
    if (recommendationType === 'images' && detectedPlugins.length > 0) {
      if (detectedPlugins.includes('WP Rocket')) {
        pluginInstructions.splice(1, 0, '🚀 In WP Rocket: Enable "LazyLoad for images" and "Convert images to WebP" if available')
      }
      if (detectedPlugins.includes('Autoptimize')) {
        pluginInstructions.splice(1, 0, '⚡ In Autoptimize: Enable "Optimize Images" in the Images tab for automatic compression')
      }
    }
    
    if (recommendationType === 'compression' && detectedPlugins.length > 0) {
      if (detectedPlugins.includes('WP Rocket')) {
        pluginInstructions.splice(1, 0, '🚀 WP Rocket handles Gzip compression automatically - check File Optimization settings')
      }
      if (detectedPlugins.includes('W3 Total Cache')) {
        pluginInstructions.splice(1, 0, '🎯 In W3 Total Cache: Enable "Disk: Enhanced" for page cache to improve compression')
      }
    }
    
    // Add page builder-specific instructions
    if (pageBuilder && recommendationType === 'css') {
      if (pageBuilder === 'Elementor') {
        pluginInstructions.splice(1, 0, '🎨 In Elementor: Go to Settings → Advanced → Set "CSS Print Method" to "Internal Embedding" for better loading')
      } else if (pageBuilder === 'Divi') {
        pluginInstructions.splice(1, 0, '🎨 In Divi: Go to Theme Options → Builder → Advanced → Enable "Static CSS File Generation"')
      } else if (pageBuilder === 'Fusion Builder (Avada)') {
        pluginInstructions.splice(1, 0, '🎨 In Avada: Go to Theme Options → Performance → Set "CSS Compiling Method" to "File"')
      }
    }
    
    if (pageBuilder && recommendationType === 'javascript') {
      if (pageBuilder === 'Divi') {
        pluginInstructions.splice(1, 0, '🎨 In Divi: Go to Theme Options → General → Performance → Enable "Defer jQuery And jQuery Migrate"')
      } else if (pageBuilder === 'Fusion Builder (Avada)') {
        pluginInstructions.splice(1, 0, '🎨 In Avada: Go to Theme Options → Performance → Enable "JS Compiler" for better loading')
      }
    }
    
    if (pageBuilder && recommendationType === 'fonts') {
      if (pageBuilder === 'Elementor') {
        pluginInstructions.splice(1, 0, '🎨 In Elementor: Go to Settings → Advanced → Set "Google Fonts Display" to "swap" for better loading')
      } else if (pageBuilder === 'Divi') {
        pluginInstructions.splice(1, 0, '🎨 In Divi: Go to Theme Options → General → Performance → Disable unused Google Fonts')
      }
    }
    
    return pluginInstructions
  }

  // Map basic recommendations to enhanced data
  const enhanceRecommendation = (rec: string): Recommendation => {
    const lowerRec = rec.toLowerCase()
    
    if (lowerRec.includes('unused css') || lowerRec.includes('remove unused css')) {
      const baseInstructions = [
        'Use developer tools to identify unused CSS',
        'Remove or comment out unused styles',
        'Consider using CSS purging tools',
        'Split CSS into smaller, page-specific files'
      ]
      
      return {
        title: 'Remove Unused CSS',
        description: 'Your site has CSS code that\'s not being used, slowing down loading',
        impact: 'Medium',
        effort: 'Medium',
        icon: <Code className="w-4 h-4" />,
        details: 'Unused CSS increases file sizes and slows down your website',
        howTo: getPluginSpecificInstructions(baseInstructions, 'css')
      }
    }
    
    if (lowerRec.includes('unused javascript') || lowerRec.includes('remove unused javascript')) {
      const baseInstructions = cms === 'WordPress' ? [
        'Install a performance optimisation plugin (see recommended plugins below)',
        'Identify unused JavaScript using Chrome DevTools → Coverage tab',
        'Remove unnecessary third-party scripts (analytics, chat widgets not in use)',
        'Review installed plugins - deactivate unused ones as they add JavaScript',
        'Consider replacing heavy plugins with lighter alternatives',
        'Test thoroughly after making changes to ensure functionality'
      ] : [
        'Audit JavaScript files for unused code using Chrome DevTools → Coverage tab',
        'Remove unnecessary third-party scripts',
        'Use code splitting to load JS only when needed',
        'Minify and compress remaining JavaScript',
        'Consider using a bundler like Webpack or Rollup',
        'Implement tree-shaking to remove dead code'
      ]

      const wpRocketInstalled = detectedPlugins.includes('WP Rocket')

      return {
        title: 'Remove Unused JavaScript',
        description: 'JavaScript files contain code that\'s not being executed',
        impact: 'High',
        effort: 'Medium',
        icon: <Code className="w-4 h-4" />,
        details: cms === 'WordPress'
          ? wpRocketInstalled
            ? '✅ Good news! WP Rocket is already installed on your site. To fix this issue:\n\n1. Go to WordPress Dashboard → Settings → WP Rocket\n2. Click the "File Optimization" tab\n3. Enable "Minify JavaScript files"\n4. Enable "Combine JavaScript files" \n5. Enable "Load JavaScript deferred"\n6. Click "Save Changes"\n7. Clear the cache and test your site\n\nUnused JavaScript blocks the browser and wastes bandwidth. WP Rocket will optimize your JavaScript automatically with these settings.'
            : 'Unused JavaScript blocks the browser and wastes bandwidth. WP Rocket is the recommended all-in-one solution that handles JS optimisation plus caching, lazy loading, and more - reducing the number of plugins needed.'
          : 'Unused JavaScript blocks the browser and wastes bandwidth. Reducing JavaScript improves page load speed and interactivity.',
        useCase: 'javascript-optimization',
        howTo: getPluginSpecificInstructions(baseInstructions, 'javascript')
      }
    }
    
    if (lowerRec.includes('render-blocking') || lowerRec.includes('blocking resources')) {
      const baseInstructions = cms === 'WordPress' ? [
        '🚀 RECOMMENDED: Install WP Rocket (Premium) - comprehensive solution for blocking resources:',
        '   • Automatically generates critical CSS',
        '   • Defers JavaScript loading',
        '   • Minifies and combines CSS/JS files',
        '   • Also includes: caching, lazy loading, database optimisation',
        '   • One plugin solves multiple issues',
        '   • Cost: £59/year (saves money vs multiple plugins)',
        '   • Setup: Install WP Rocket → File Optimisation settings configured automatically',
        '',
        'FREE ALTERNATIVES (require manual configuration):',
        'Autoptimize (Free): Aggregate and minify CSS/JS files',
        'Async JavaScript (Free): Defer JavaScript execution',
        'Critical CSS (Free): Generate and inline critical CSS',
        '',
        'MANUAL STEPS:',
        'Inline critical CSS in the HTML head',
        'Load non-critical CSS asynchronously',
        'Defer non-essential JavaScript',
        'Use resource hints like preload for critical resources'
      ] : [
        'Inline critical CSS in the HTML head',
        'Load non-critical CSS asynchronously',
        'Defer non-essential JavaScript',
        'Use resource hints like preload for critical resources',
        'Consider using a build tool to optimize resource loading'
      ]

      const wpRocketInstalled = detectedPlugins.includes('WP Rocket')

      return {
        title: 'Fix Render-Blocking Resources',
        description: 'CSS and JS files are preventing your page from displaying quickly',
        impact: 'High',
        effort: cms === 'WordPress' ? 'Medium' : 'Hard',
        icon: <AlertTriangle className="w-4 h-4" />,
        details: cms === 'WordPress'
          ? wpRocketInstalled
            ? '✅ Good news! WP Rocket is already installed on your site. To fix this issue:\n\n1. Go to WordPress Dashboard → Settings → WP Rocket\n2. Click the "File Optimization" tab\n3. Enable "Optimize CSS delivery" - WP Rocket will automatically generate critical CSS\n4. Enable "Load JavaScript deferred" to defer JavaScript loading\n5. Under "CSS Files", enable "Minify CSS files" and "Combine CSS files"\n6. Click "Save Changes"\n7. Clear the cache and test your site\n\nRender-blocking resources prevent your page from displaying quickly. WP Rocket automatically handles this complex optimization.'
            : 'Critical resources must load before the page can be displayed. WP Rocket automatically handles this complex optimization, including critical CSS generation and resource deferral.'
          : 'Critical resources must load before the page can be displayed. This requires technical optimization of how CSS and JavaScript are loaded.',
        useCase: cms === 'WordPress' ? 'javascript-optimization' : undefined,
        howTo: baseInstructions
      }
    }
    
    if (lowerRec.includes('images') && (lowerRec.includes('offscreen') || lowerRec.includes('defer') || lowerRec.includes('lazy'))) {
      const baseInstructions = cms === 'WordPress' ? [
        '🚀 BEST OPTION: WP Rocket (Premium) includes lazy loading plus many other optimizations',
        '   • Handles lazy loading for images, iframes, and videos',
        '   • Also includes: JS/CSS optimization, caching, minification',
        '   • Setup: Install WP Rocket → Enable "LazyLoad for images" in Media settings',
        '',
        'FREE ALTERNATIVES (if not using WP Rocket):',
        'Smush (Free): Enable "Lazy Load" in the Lazy Load tab',
        'a3 Lazy Load (Free): Install and activate - works automatically with default settings',
        'Jetpack (Free): Enable "Speed up image load times" in Performance settings',
        'WordPress 5.5+ has native lazy loading built-in (check it\'s not disabled)',
        '',
        'MANUAL OPTION:',
        'Add loading="lazy" to images manually in your theme',
        'Exclude above-the-fold images from lazy loading (first 2-3 images)',
        'Test on mobile devices to ensure images load properly when scrolling'
      ] : [
        'Add loading="lazy" attribute to img tags below the fold',
        'Example: <img src="image.jpg" loading="lazy" alt="Description">',
        'Use Intersection Observer API for custom lazy loading',
        'Prioritize above-the-fold images (don\'t lazy load them)',
        'Consider using modern image formats like WebP',
        'JavaScript libraries: lazysizes, lozad.js, or vanilla-lazyload',
        'Ensure images have width/height attributes to prevent layout shifts'
      ]

      return {
        title: 'Implement Lazy Loading for Images',
        description: 'Images below the fold are loading immediately, wasting bandwidth',
        impact: 'Medium',
        effort: 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: cms === 'WordPress'
          ? 'Lazy loading defers loading of offscreen images until users scroll near them. If you use WP Rocket for JavaScript optimization, it also includes lazy loading - no need for separate plugins.'
          : 'Lazy loading defers loading of offscreen images until users scroll near them, improving initial page load speed and reducing bandwidth usage.',
        useCase: 'lazy-loading',
        howTo: getPluginSpecificInstructions(baseInstructions, 'images')
      }
    }
    
    if (lowerRec.includes('mobile') && lowerRec.includes('image')) {
      // CMSs that automatically handle responsive images - skip this recommendation
      const cmsWithAutoResponsiveImages = ['WordPress', 'Shopify', 'Wix', 'Squarespace', 'Webflow', 'Drupal'];

      if (cms && cmsWithAutoResponsiveImages.some(autoCms => cms.toLowerCase().includes(autoCms.toLowerCase()))) {
        // CMS handles this automatically, skip recommendation
        return {
          title: '', // Empty title will be filtered out
          description: '',
          impact: 'Low' as 'Low',
          effort: 'Easy' as 'Easy',
          icon: <Image className="w-4 h-4" />,
          details: '',
          howTo: []
        }
      }

      // Only show for custom sites without automatic responsive images
      const baseInstructions = [
        'Use responsive images with srcset and sizes attributes',
        'Example: <img srcset="small.jpg 480w, medium.jpg 768w, large.jpg 1200w" sizes="(max-width: 768px) 100vw, 50vw" src="medium.jpg" alt="Description">',
        'Serve appropriately sized images for different screen sizes',
        'Use picture element for art direction (different images for mobile vs desktop)',
        'Implement WebP format with JPEG/PNG fallbacks',
        'Consider using a CDN with automatic image resizing (Cloudinary, Imgix)',
        'Test on actual mobile devices, not just browser emulation'
      ]

      return {
        title: 'Optimise Images for Mobile Devices',
        description: 'Serve appropriately sized images for mobile screens to save bandwidth',
        impact: 'Medium',
        effort: 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: 'Mobile devices don\'t need full desktop-sized images. Serving smaller images saves bandwidth and improves load times on mobile connections.',
        useCase: 'large-images',
        howTo: baseInstructions
      }
    }

    if (lowerRec.includes('webp') || lowerRec.includes('next-gen') || lowerRec.includes('image format')) {
      return {
        title: 'Use Modern Image Formats',
        description: 'Convert images to WebP or AVIF for better compression',
        impact: 'Medium',
        effort: 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: 'Modern formats reduce file size by 25-50% with same quality',
        howTo: [
          'Convert JPEG/PNG to WebP format',
          'Use picture element with fallbacks',
          'Set up automatic conversion on your server',
          'Test image quality after conversion'
        ]
      }
    }
    
    if (lowerRec.includes('minify')) {
      return {
        title: 'Minify Code Files',
        description: 'Remove unnecessary characters from CSS/JS to reduce file sizes',
        impact: 'Low',
        effort: 'Easy',
        icon: <Zap className="w-4 h-4" />,
        details: 'Minification removes whitespace and comments, reducing file sizes',
        howTo: [
          'Use build tools like Webpack or Gulp',
          'Enable minification in your CMS/platform',
          'Use online minification tools',
          'Set up automated minification in deployment'
        ]
      }
    }
    
    if (lowerRec.includes('server response') || lowerRec.includes('response time')) {
      const baseInstructions = cms === 'WordPress' ? [
        '📊 CURRENT METRICS:',
        'Server response time is the time it takes for your server to respond to a browser request',
        'Google recommends: < 200ms (Good), < 600ms (Needs Improvement), > 600ms (Poor)',
        'This affects: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Time to First Byte (TTFB)',
        '',
        '🚀 QUICK WINS (WordPress):',
        'Install WP Rocket (Premium): Includes page caching, database optimization, and CDN integration',
        'W3 Total Cache (Free): Page caching and minification',
        'LiteSpeed Cache (Free): High-performance caching if using LiteSpeed hosting',
        'WP Super Cache (Free): Simple page caching by Automattic',
        '',
        '🔧 TECHNICAL IMPROVEMENTS:',
        'Enable page caching (stores HTML to avoid regenerating pages)',
        'Enable object caching (Redis/Memcached for database queries)',
        'Optimise database queries (use Query Monitor plugin to find slow queries)',
        'Upgrade hosting plan (shared hosting is often slow under load)',
        'Consider managed WordPress hosting (WP Engine, Kinsta, Flywheel)',
        'Enable opcode caching (OPcache for PHP)',
        '',
        '☁️ CDN & INFRASTRUCTURE:',
        'Use a Content Delivery Network (see "Use a CDN" recommendation)',
        'Enable Cloudflare (free CDN and security)',
        'Upgrade to PHP 8.0+ (significantly faster than PHP 7.x)',
        'Use HTTP/2 or HTTP/3 (faster protocol)',
        '',
        '⚠️ IF STILL SLOW:',
        'Check server resources (CPU, RAM, disk I/O)',
        'Review plugin overhead (disable unnecessary plugins)',
        'Consider dedicated or VPS hosting',
        'Hire a performance consultant for deep optimization'
      ] : [
        '📊 CURRENT METRICS:',
        'Server response time is the time it takes for your server to respond to a browser request',
        'Google recommends: < 200ms (Good), < 600ms (Needs Improvement), > 600ms (Poor)',
        'This affects: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Time to First Byte (TTFB)',
        '',
        '🔧 TECHNICAL IMPROVEMENTS:',
        'Upgrade to faster hosting (VPS or dedicated server)',
        'Enable server-side caching (Varnish, Redis)',
        'Optimise database queries and indexes',
        'Use a Content Delivery Network (CDN)',
        'Enable HTTP/2 or HTTP/3',
        'Optimise server configuration (Nginx, Apache)',
        'Consider serverless architecture for dynamic content'
      ]

      const wpRocketInstalled = detectedPlugins.includes('WP Rocket')

      return {
        title: 'Improve Server Response Time (TTFB)',
        description: 'Your server takes too long to respond to requests, delaying page load',
        impact: 'High',
        effort: cms === 'WordPress' ? 'Medium' : 'Hard',
        icon: <Server className="w-4 h-4" />,
        details: cms === 'WordPress'
          ? wpRocketInstalled
            ? '✅ Good news! WP Rocket is already installed on your site. To fix this issue:\n\n1. Go to WordPress Dashboard → Settings → WP Rocket\n2. Click the "Cache" tab\n3. Ensure "Enable caching for mobile devices" is enabled\n4. Click the "File Optimization" tab and enable minification options\n5. Click the "Database" tab and enable "Post Cleanup" and "Database Cleanup"\n6. Go to the "Preload" tab and enable "Preload Cache" to build the cache automatically\n7. Click "Save Changes"\n8. Clear the cache and test your site\n\nServer response time (TTFB) is how long it takes for your server to start sending data. WP Rocket\'s caching will dramatically improve this by serving cached pages instead of generating them on each request.'
            : 'Server response time (Time to First Byte - TTFB) is how long it takes for your server to start sending data. This is the foundation of page speed - if your server is slow, everything else is delayed. For WordPress, caching plugins can dramatically improve this.'
          : 'Server response time (Time to First Byte - TTFB) measures how long it takes for your server to respond to requests. Slow TTFB delays everything on your page. Typical causes: slow hosting, unoptimised database queries, lack of caching, or heavy server-side processing.',
        useCase: cms === 'WordPress' ? 'caching' : undefined,
        howTo: baseInstructions
      }
    }

    if (lowerRec.includes('cdn') || lowerRec.includes('content delivery network')) {
      const baseInstructions = cms === 'WordPress' ? [
        '🌍 WHAT IS A CDN?',
        'A Content Delivery Network stores copies of your site on servers worldwide',
        'Users load your site from the nearest server, reducing distance and load time',
        'Benefits: Faster global load times, reduced server load, better reliability',
        '',
        '🚀 RECOMMENDED CDN SOLUTIONS:',
        'Cloudflare (Free + Paid): Best all-around CDN with free plan, DDoS protection, SSL',
        '  • Setup: Sign up → Add site → Update nameservers → Enable CDN',
        '  • Free plan includes: CDN, SSL, DDoS protection, firewall',
        '  • Paid plans (£20/month+): Better performance, more features',
        '',
        'WP Rocket + RocketCDN (£8.99/month): WordPress-optimised CDN',
        '  • Seamless integration with WP Rocket',
        '  • Designed specifically for WordPress',
        '  • Easy setup via WP Rocket dashboard',
        '',
        'Bunny CDN (£1/month+): Budget-friendly, fast performance',
        '  • Pay-as-you-go pricing',
        '  • Excellent performance',
        '  • Requires manual configuration',
        '',
        'StackPath (Paid): Enterprise-grade CDN',
        '  • Advanced features and security',
        '  • Best for high-traffic sites',
        '',
        '📦 WORDPRESS PLUGINS FOR CDN:',
        'WP Rocket: Built-in CDN integration',
        'Cloudflare Plugin: Official Cloudflare integration',
        'CDN Enabler: Simple CDN integration for any provider',
        'W3 Total Cache: Supports multiple CDN providers',
        '',
        '⚙️ SETUP STEPS:',
        '1. Choose CDN provider (Cloudflare recommended for beginners)',
        '2. Create account and add your domain',
        '3. Update DNS settings or install plugin',
        '4. Test CDN is working (check browser network tab)',
        '5. Configure caching rules if needed'
      ] : [
        '🌍 WHAT IS A CDN?',
        'A Content Delivery Network stores copies of your site on servers worldwide',
        'Users load your site from the nearest server, reducing distance and load time',
        '',
        '🚀 RECOMMENDED CDN SOLUTIONS:',
        'Cloudflare (Free + Paid): Best all-around, easy setup',
        'Bunny CDN: Budget-friendly, excellent performance',
        'Amazon CloudFront: Integrates with AWS services',
        'Fastly: Enterprise-grade, advanced features',
        '',
        '⚙️ SETUP STEPS:',
        'Sign up for CDN provider',
        'Add your domain to CDN',
        'Update DNS settings to point to CDN',
        'Configure caching rules',
        'Test CDN is working properly',
        'Monitor performance improvements'
      ]

      return {
        title: 'Use a Content Delivery Network (CDN)',
        description: 'Serve static assets from servers closer to your users worldwide',
        impact: 'High',
        effort: 'Easy',
        icon: <Server className="w-4 h-4" />,
        details: cms === 'WordPress'
          ? 'A CDN dramatically improves global load times by serving your site from multiple locations worldwide. Cloudflare offers a generous free plan with easy setup. For WordPress sites, WP Rocket includes seamless CDN integration.'
          : 'A CDN caches and serves your static assets (images, CSS, JS) from servers geographically close to your users, dramatically reducing load times globally. Essential for international audiences.',
        useCase: cms === 'WordPress' ? 'caching' : undefined,
        howTo: baseInstructions
      }
    }
    
    if (lowerRec.includes('text compression') || lowerRec.includes('compression')) {
      const baseInstructions = [
        'Enable Gzip compression on your server',
        'Use Brotli compression for better results',
        'Configure compression for CSS, JS, and HTML',
        'Test compression is working properly'
      ]
      
      return {
        title: 'Enable Text Compression',
        description: 'Compress text files before sending them to browsers',
        impact: 'Medium',
        effort: 'Easy',
        icon: <Zap className="w-4 h-4" />,
        details: 'Gzip/Brotli compression reduces text file sizes by 60-80%',
        howTo: getPluginSpecificInstructions(baseInstructions, 'compression')
      }
    }
    
    // Default fallback for other recommendations
    return {
      title: rec,
      description: 'Improve this aspect of your website performance',
      impact: 'Medium',
      effort: 'Medium',
      icon: <TrendingUp className="w-4 h-4" />,
      details: 'This optimization will help improve your website speed',
      howTo: [
        'Research best practices for this optimization',
        'Test changes on a staging environment first',
        'Monitor performance before and after changes'
      ]
    }
  }

  // Get technical SEO recommendations
  const technicalRecs = getTechnicalSEORecommendations()

  // Get performance recommendations
  const performanceRecs = recommendations.slice(0, 6).map(enhanceRecommendation)

  // Combine and prioritize: Technical SEO issues first (High impact), then performance recommendations
  const allRecs = [...technicalRecs, ...performanceRecs]

  // Filter out recommendations with empty titles (skipped recommendations)
  const validRecs = allRecs.filter(rec => rec.title && rec.title.trim() !== '')

  // Deduplicate by title (keep first occurrence)
  const deduplicatedRecs = validRecs.filter((rec, index, self) =>
    index === self.findIndex((r) => r.title === rec.title)
  )

  // Sort by impact (High > Medium > Low) and limit to top 10
  const sortedRecs = deduplicatedRecs.sort((a, b) => {
    const impactOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
    return impactOrder[a.impact] - impactOrder[b.impact]
  })

  const enhancedRecs = sortedRecs.slice(0, 10)

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Easy': return 'bg-green-50 text-green-600'
      case 'Medium': return 'bg-yellow-50 text-yellow-600'
      case 'Hard': return 'bg-red-50 text-red-600'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-lg">🎯 Key Recommendations</h4>
          <Tooltip 
            content={
              <div>
                <p className="font-semibold mb-2">Key Recommendations</p>
                <p className="mb-2">Performance improvements ranked by impact and implementation difficulty.</p>
                <div className="text-xs space-y-1">
                  <p><strong>Impact Levels:</strong> High (major speed improvement) | Medium (noticeable improvement) | Low (minor improvement)</p>
                  <p><strong>Effort Levels:</strong> Easy (quick fixes) | Medium (moderate work) | Hard (complex changes)</p>
                  <p><strong>Plugin-Specific:</strong> Tailored instructions for your detected WordPress plugins</p>
                  <p><strong>How-To Guides:</strong> Step-by-step implementation instructions</p>
                </div>
              </div>
            }
            position="top"
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        </div>
        <div className="text-xs text-gray-500">
          Based on PageSpeed Insights data
        </div>
      </div>
      
      {/* Performance Score Summary */}
      {(desktopScore || mobileScore) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Current Performance:</span>
            <div className="flex gap-4">
              {desktopScore && (
                <span className={`font-medium ${desktopScore >= 90 ? 'text-green-600' : desktopScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Desktop: {desktopScore}/100
                </span>
              )}
              {mobileScore && (
                <span className={`font-medium ${mobileScore >= 90 ? 'text-green-600' : mobileScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Mobile: {mobileScore}/100
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {enhancedRecs.length === 0 ? (
        <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-600 text-lg font-medium mb-2">🎉 Great job!</div>
          <div className="text-sm text-green-700">No major performance issues found</div>
        </div>
      ) : (
        <div className="space-y-4">
          {enhancedRecs.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-1">
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{rec.title}</h5>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(rec.impact)}`}>
                        {rec.impact} Impact
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEffortColor(rec.effort)}`}>
                        {rec.effort}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      <svg
                        className="w-4 h-4 transform transition-transform details-chevron"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      How to fix this
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="text-gray-700 mb-3">{rec.details}</p>

                      {/* Large Images Table - Show at TOP of "Optimise Large Images" recommendation */}
                      {rec.title.includes('Large Image') && largeImagesList.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-300">
                          <h5 className="font-semibold mb-3 text-orange-600">⚠️ Large Images Need Optimisation</h5>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-orange-100">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">Image</th>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">Found On Page</th>
                                    <th className="px-4 py-3 text-right font-medium text-orange-800">Size</th>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">Action Needed</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-orange-200">
                                  {largeImagesList.slice(0, 10).map((image, imageIndex) => (
                                    <tr key={imageIndex} className="hover:bg-orange-50">
                                      <td className="px-4 py-3">
                                        <a
                                          href={image.imageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline break-all"
                                        >
                                          {image.imageUrl.split('/').pop() || image.imageUrl}
                                        </a>
                                      </td>
                                      <td className="px-4 py-3">
                                        <Tooltip content={image.pageUrl}>
                                          <a
                                            href={image.pageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                          >
                                            {image.pageUrl.replace(/^https?:\/\//, '').substring(0, 50)}...
                                          </a>
                                        </Tooltip>
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium text-red-600">
                                        {(image.sizeKB || 0).toLocaleString()}KB
                                      </td>
                                      <td className="px-4 py-3 text-gray-600">
                                        {image.sizeKB > 500 ? 'Optimise urgently' : 'Compress image'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            💡 Tip: Use image compression tools like TinyPNG or WebP format to reduce file sizes without losing quality.
                          </p>
                        </div>
                      )}

                      {/* Regular Steps */}
                      <div className="space-y-2 mb-4">
                        <div className="font-medium text-gray-800">Steps:</div>
                        {rec.howTo
                          .filter(step => {
                            // Filter out plugin-specific steps since they're shown in PluginRecommendationTable
                            const lower = step.toLowerCase()
                            return !(
                              lower.includes('install') && lower.includes('plugin') ||
                              lower.includes('yoast') ||
                              lower.includes('rank math') ||
                              lower.includes('imagify') ||
                              lower.includes('shortpixel') ||
                              lower.includes('ewww') ||
                              lower.includes('wp rocket') ||
                              lower.includes('autoptimize') ||
                              lower.includes('w3 total cache')
                            )
                          })
                          .map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2">
                              <span className="text-blue-500 text-xs mt-1">•</span>
                              <span className="text-gray-700">{step}</span>
                            </div>
                          ))}
                      </div>

                      {/* Plugin Recommendation Tables */}
                      {rec.useCase && cms === 'WordPress' && (
                        <div className="mt-4 pt-4 border-t border-gray-300 space-y-6">
                          {/* Currently Installed Plugins Section */}
                          <PluginRecommendationTable
                            plugins={getPluginsByUseCase(rec.useCase, detectedPlugins)}
                            installedPlugins={detectedPlugins}
                            issueType={rec.useCase}
                            mode="installed"
                          />

                          {/* Recommended Plugins Section */}
                          <PluginRecommendationTable
                            plugins={getPluginsByUseCase(rec.useCase, detectedPlugins)}
                            installedPlugins={detectedPlugins}
                            issueType={rec.useCase}
                            mode="recommended"
                          />
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Page Builder Specific Recommendations */}
      {pageBuilder && (
        <div className="mt-6">
          <h5 className="font-semibold text-lg mb-4 flex items-center gap-2">
            🎨 {pageBuilder} Optimization Settings
          </h5>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-3">
              Your site uses <strong>{pageBuilder}</strong>. Here are specific optimization settings you can enable:
            </p>
            {(() => {
              const optimizations = getPageBuilderOptimizations(pageBuilder)

              return optimizations.map((opt: { title: string; description: string; impact: string; steps: string[] }, index: number) => (
                <details key={index} className="mb-3 last:mb-0">
                  <summary className="cursor-pointer text-blue-700 hover:text-blue-900 font-medium flex items-center gap-2">
                    <svg
                      className="w-4 h-4 transform transition-transform details-chevron flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="flex-1">{opt.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      opt.impact === 'High' ? 'bg-red-100 text-red-700' :
                      opt.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {opt.impact} Impact
                    </span>
                  </summary>
                  <div className="mt-2 p-3 bg-white rounded border-l-4 border-blue-300">
                    <p className="text-sm text-gray-700 mb-2">{opt.description}</p>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-800 text-sm">Steps:</div>
                      {opt.instructions.map((step: string, stepIndex: number) => (
                        <div key={stepIndex} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 text-xs mt-1">•</span>
                          <span className="text-gray-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              ))
            })()}
          </div>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        💡 <strong>Tip:</strong> Start with &quot;High Impact&quot; and &quot;Easy&quot; fixes first for quick wins. 
        Test each change and measure the improvement before moving to harder fixes.
        {detectedPlugins.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            🔧 <strong>Detected plugins:</strong> {detectedPlugins.join(', ')} - Look for plugin-specific instructions marked with 🚀⚡🎯 above!
          </div>
        )}
        {pageBuilder && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            🎨 <strong>Page Builder:</strong> {pageBuilder} - Check the dedicated optimization settings section above!
          </div>
        )}
      </div>
    </div>
  )
}