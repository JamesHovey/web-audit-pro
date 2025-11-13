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
  issuePages?: {
    missingH1Tags?: string[]
    missingMetaTitles?: string[]
    missingMetaDescriptions?: string[]
    httpErrors?: string[]
  }
  largeImagesList?: Array<{
    imageUrl: string
    pageUrl: string
    sizeKB: number
  }>
  legacyFormatImagesList?: Array<{
    imageUrl: string
    pageUrl: string
    currentFormat: string
    suggestedFormat: string
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
  issuePages,
  largeImagesList = [],
  legacyFormatImagesList = []
}: EnhancedRecommendationsProps) {
  
  // Helper function to generate recommendations for technical SEO issues
  const getTechnicalSEORecommendations = (): Recommendation[] => {
    const techRecs: Recommendation[] = []

    // Missing H1 Tags
    if (technicalIssues?.missingH1Tags && technicalIssues.missingH1Tags > 0) {
      // Check which SEO plugin is installed
      const hasYoast = detectedPlugins.some(p => p.toLowerCase().includes('yoast'))
      const hasRankMath = detectedPlugins.some(p => p.toLowerCase().includes('rank math'))

      let h1Steps: string[]
      if (hasYoast || hasRankMath) {
        h1Steps = [
          hasYoast ? '✅ Yoast SEO can help you check for H1 tags' : '✅ Rank Math can help you check for H1 tags',
          '1. Edit the page missing an H1 tag',
          '2. Add a clear, descriptive heading at the very top of your page content',
          '3. Select the text and format it as "Heading 1" (H1) using the block editor',
          '4. Make sure it\'s unique and describes the page content',
          '5. Include your primary keyword if relevant',
          hasYoast ? '6. Yoast SEO will show a green checkmark if H1 is properly set' : '6. Rank Math will validate your H1 in the SEO analysis',
          '7. Update/Publish the page',
          '',
          '💡 Pro Tip: Most WordPress themes automatically convert your page title into an H1',
          '   Check your theme settings to see if this is already happening!'
        ]
      } else {
        h1Steps = [
          '1. Edit the page missing an H1 tag',
          '2. Add a clear, descriptive heading at the top of the page content',
          '3. Ensure it uses the H1 heading format (usually "Heading 1" in the editor)',
          '4. Make the H1 unique and descriptive of the page content',
          '5. Include your primary keyword if relevant',
          '',
          '💡 WordPress Tip: Most themes automatically make the page title an H1',
          '   Check Theme → Customize → Typography settings',
          '',
          '📦 Consider installing an SEO plugin (see recommendations below) to:',
          '   • Automatically check for missing H1 tags',
          '   • Provide SEO analysis and warnings',
          '   • See real-time optimization tips'
        ]
      }

      techRecs.push({
        title: 'Add Missing H1 Tags',
        description: `${technicalIssues.missingH1Tags} page(s) are missing H1 tags, which are critical for SEO`,
        impact: 'High',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'H1 tags help search engines understand the main topic of your pages and improve accessibility',
        useCase: 'h1-tags',
        howTo: cms === 'WordPress' ? h1Steps : [
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
      // Check which SEO plugin is installed
      const hasYoast = detectedPlugins.some(p => p.toLowerCase().includes('yoast'))
      const hasRankMath = detectedPlugins.some(p => p.toLowerCase().includes('rank math'))
      const hasAIOSEO = detectedPlugins.some(p => p.toLowerCase().includes('all in one seo'))

      let metaTitleSteps: string[]

      if (hasYoast) {
        metaTitleSteps = [
          '✅ You have Yoast SEO installed - perfect for this!',
          '1. Edit the page/post with missing meta title',
          '2. Scroll down to the "Yoast SEO" meta box',
          '3. Click "Edit snippet" if collapsed',
          '4. Fill in the "SEO title" field (50-60 characters)',
          '5. Include your primary keyword near the beginning',
          '6. Make it unique and compelling for searchers',
          '7. Yoast shows how it appears in Google search results',
          '8. Update/Publish the page',
          '💡 Tip: Yoast shows title length with color coding (green = perfect length)'
        ]
      } else if (hasRankMath) {
        metaTitleSteps = [
          '✅ You have Rank Math installed - perfect for this!',
          '1. Edit the page/post with missing meta title',
          '2. Scroll down to the "Rank Math" meta box',
          '3. Click "Edit Snippet"',
          '4. Fill in the "SEO Title" field (50-60 characters)',
          '5. Include your primary keyword near the beginning',
          '6. Make it unique and compelling for searchers',
          '7. View the real-time Google SERP preview',
          '8. Update/Publish the page',
          '💡 Tip: Rank Math scores your title and shows optimization suggestions'
        ]
      } else if (hasAIOSEO) {
        metaTitleSteps = [
          '✅ You have All in One SEO installed - perfect for this!',
          '1. Edit the page/post with missing meta title',
          '2. Scroll down to "AIOSEO Settings"',
          '3. Find the "Post Title" field under "General" tab',
          '4. Fill in a compelling title (50-60 characters)',
          '5. Include your primary keyword near the beginning',
          '6. Make it unique and compelling',
          '7. Check the Google search preview',
          '8. Update/Publish the page',
          '💡 Tip: AIOSEO provides TruSEO score for your title'
        ]
      } else {
        metaTitleSteps = [
          '⚠️ You don\'t have an SEO plugin installed yet',
          '📦 Install a free SEO plugin to make this easy:',
          '   • Yoast SEO (most popular, beginner-friendly)',
          '   • Rank Math (feature-rich, advanced)',
          '   • All in One SEO (good for e-commerce)',
          '',
          'After installing, follow these steps:',
          '1. Edit the page/post needing a meta title',
          '2. Find the SEO plugin meta box (below editor)',
          '3. Fill in the "SEO Title" or "Meta Title" field',
          '4. Keep it 50-60 characters',
          '5. Include primary keyword near the beginning',
          '6. Make each title unique and compelling',
          '7. Update/Publish the page',
          '',
          '💡 See "Recommended Plugins" below to compare options'
        ]
      }

      techRecs.push({
        title: 'Add Missing Meta Titles',
        description: `${technicalIssues.missingMetaTitles} page(s) lack meta titles, hurting search visibility`,
        impact: 'High',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Meta titles appear in search results and browser tabs, and are one of the most important SEO elements',
        useCase: 'meta-titles',
        howTo: cms === 'WordPress' ? metaTitleSteps : [
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
      // Check which SEO plugin is installed
      const hasYoast = detectedPlugins.some(p => p.toLowerCase().includes('yoast'))
      const hasRankMath = detectedPlugins.some(p => p.toLowerCase().includes('rank math'))
      const hasAIOSEO = detectedPlugins.some(p => p.toLowerCase().includes('all in one seo'))

      let wordpressSteps: string[]

      if (hasYoast) {
        wordpressSteps = [
          '✅ You have Yoast SEO installed - perfect for this!',
          '1. Edit the page/post with missing meta description',
          '2. Scroll down to the "Yoast SEO" meta box',
          '3. Click "Edit snippet" if collapsed',
          '4. Fill in the "Meta description" field (150-160 characters)',
          '5. Write a compelling description with relevant keywords',
          '6. Include a call-to-action if appropriate',
          '7. Yoast shows a preview of how it appears in search results',
          '8. Update/Publish the page',
          '💡 Tip: Yoast color-codes the length (green = good, orange = too short/long)'
        ]
      } else if (hasRankMath) {
        wordpressSteps = [
          '✅ You have Rank Math installed - perfect for this!',
          '1. Edit the page/post with missing meta description',
          '2. Scroll down to the "Rank Math" meta box',
          '3. Click on the "Edit Snippet" button',
          '4. Fill in the "Description" field (150-160 characters)',
          '5. Write a compelling description with relevant keywords',
          '6. Include a call-to-action if appropriate',
          '7. Rank Math shows real-time Google SERP preview',
          '8. Update/Publish the page',
          '💡 Tip: Rank Math scores your description and gives optimization suggestions'
        ]
      } else if (hasAIOSEO) {
        wordpressSteps = [
          '✅ You have All in One SEO installed - perfect for this!',
          '1. Edit the page/post with missing meta description',
          '2. Scroll down to the "AIOSEO Settings" section',
          '3. Find the "Meta Description" field under "General" tab',
          '4. Fill in the description (150-160 characters)',
          '5. Write a compelling description with relevant keywords',
          '6. Include a call-to-action if appropriate',
          '7. AIOSEO shows a Google search preview',
          '8. Update/Publish the page',
          '💡 Tip: AIOSEO provides a TruSEO score for your meta description'
        ]
      } else {
        // No SEO plugin detected - recommend installing one
        wordpressSteps = [
          '⚠️ You don\'t have an SEO plugin installed yet',
          '📦 Install a free SEO plugin to make this easy:',
          '   • Yoast SEO (most popular, beginner-friendly)',
          '   • Rank Math (feature-rich, advanced)',
          '   • All in One SEO (good for e-commerce)',
          '',
          'After installing, follow these general steps:',
          '1. Edit the page/post needing a meta description',
          '2. Find the SEO plugin meta box (usually below editor)',
          '3. Fill in the "Meta Description" field',
          '4. Keep it 150-160 characters',
          '5. Include relevant keywords naturally',
          '6. Make it compelling with a call-to-action',
          '7. Make each description unique',
          '8. Update/Publish the page',
          '',
          '💡 See "Recommended Plugins" below to compare options'
        ]
      }

      techRecs.push({
        title: 'Add Missing Meta Descriptions',
        description: `${technicalIssues.missingMetaDescriptions} page(s) need meta descriptions for better search previews`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Meta descriptions appear in search results and influence click-through rates',
        useCase: 'meta-descriptions',
        howTo: cms === 'WordPress' ? wordpressSteps : [
          'Add <meta name="description"> tag in the <head> section',
          'Keep descriptions between 150-160 characters',
          'Include relevant keywords naturally',
          'Write compelling, actionable copy',
          'HTML: <meta name="description" content="Your page description here">',
          'Each page should have a unique description'
        ]
      })
    }

    // Large Images and Modern Formats (Combined)
    if (technicalIssues?.largeImages && technicalIssues.largeImages > 0) {
      // Check if we also have legacy format images
      const hasLegacyFormats = legacyFormatImagesList && legacyFormatImagesList.length > 0

      techRecs.push({
        title: 'Optimise Images',
        description: hasLegacyFormats
          ? `${technicalIssues.largeImages} large image(s) + ${legacyFormatImagesList.length} image(s) using legacy formats are slowing down your site. See table below for details.`
          : `${technicalIssues.largeImages} image(s) over 100KB are slowing down your site. See table below for specific images.`,
        impact: 'High',
        effort: 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: hasLegacyFormats
          ? 'Large images and legacy formats (JPEG/PNG) significantly impact page load time. Modern formats like WebP reduce file sizes by 25-50% while maintaining quality. The table below shows which images need optimization.'
          : 'Large images significantly impact page load time and user experience. The table below shows which specific images need optimisation and where they appear.',
        useCase: 'image-optimization',
        howTo: cms === 'WordPress' ? [
          '📋 Review the table above to see which images need fixing',
          '',
          '🎯 RECOMMENDED SOLUTION:',
          'Install an image optimization plugin from the "Recommended Plugins & Tools" section below.',
          'All plugins can compress images AND convert to WebP automatically.',
          '',
          '⚙️ SETUP STEPS (example using Imagify):',
          '1. Install and activate the plugin from the recommendations below',
          '2. Go to Settings and choose "Normal" compression level',
          '3. Enable "Convert images to WebP format"',
          '4. Enable "Auto-optimize images on upload" for future images',
          '5. Click "Bulk Optimization" to compress all existing images',
          '',
          '✅ WHAT THIS FIXES:',
          'Compresses large images (reduces file size by 40-70%)',
          'Converts JPEG/PNG to WebP (additional 25-35% reduction)',
          'Automatically optimizes future uploads',
          '',
          '🔄 ALTERNATIVE - Manual Optimization:',
          'Use TinyPNG.com or Squoosh.app before uploading',
          'Convert to WebP manually using online converters',
          'Target: Keep images under 100KB when possible',
          '',
          '💡 After optimization, re-run the audit to verify improvements'
        ] : [
          '📋 Review the table above to see which images need fixing',
          '',
          '🎯 TWO ISSUES TO FIX:',
          '1. Large file sizes (over 100KB)',
          '2. Legacy formats (JPEG/PNG instead of WebP/AVIF)',
          '',
          '🛠️ SOLUTIONS:',
          'Compress images before uploading:',
          '   • Use TinyPNG.com, Squoosh.app, or ImageOptim',
          '   • Target: Keep images under 100KB',
          '',
          'Convert to modern formats:',
          '   • Convert JPEG/PNG to WebP or AVIF',
          '   • WebP reduces file size by 25-50% with same quality',
          '   • Use Squoosh.app for conversion',
          '',
          'Set appropriate dimensions:',
          '   • Don\'t upload images larger than needed',
          '   • Use responsive images with srcset attribute',
          '',
          'For Shopify: Built-in image optimization available',
          'For Wix/Squarespace: Use built-in tools',
          '',
          '✅ After optimization, re-run the audit to verify improvements'
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
        '📌 PLUGIN OPTIONS:',
        'See the "Recommended Plugins & Tools" table below for plugin comparisons.',
        'Free options: a3 Lazy Load, Jetpack, Lazy Load by WP Rocket',
        'Premium option: WP Rocket (also includes caching, JS/CSS optimization)',
        'Note: WordPress 5.5+ has native lazy loading built-in',
        '',
        '⚙️ MANUAL OPTION (No Plugin Required):',
        '1. Add loading="lazy" attribute to images in your theme files',
        '2. Example: <img src="image.jpg" loading="lazy" alt="Description">',
        '3. IMPORTANT: Exclude above-the-fold images from lazy loading (first 2-3 images)',
        '4. Ensure images have width/height attributes to prevent layout shifts',
        '5. Test on mobile devices to ensure images load properly when scrolling',
        '',
        '💡 TIP: If you\'re already using a performance plugin for other issues,',
        'check if it includes lazy loading to avoid installing multiple plugins.'
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
          ? 'Lazy loading defers loading of offscreen images until users scroll near them. This improves initial page load speed by only loading images as users scroll to them. WordPress has native lazy loading since version 5.5, but plugins offer more advanced options.'
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
      // Skip this - now handled in the combined "Optimise Images" recommendation
      return {
        title: '', // Empty title will be filtered out
        description: '',
        impact: 'Medium' as 'Medium',
        effort: 'Easy' as 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: '',
        howTo: []
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
                      {/* Format details with better structure for plugin-specific instructions */}
                      {(() => {
                        const details = rec.details;

                        // Check if details contains plugin-specific instructions (indicated by numbered steps)
                        if (details.includes('✅ Good news!') && details.match(/\d+\./)) {
                          const parts = details.split('\n\n');

                          return (
                            <div className="space-y-3">
                              {parts.map((part, idx) => {
                                // Check if this part contains numbered steps
                                if (part.match(/^\d+\./m)) {
                                  const steps = part.split('\n').filter(line => line.trim());
                                  return (
                                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-3">
                                      <div className="font-medium text-blue-800 mb-2">Configuration Steps:</div>
                                      <div className="space-y-1">
                                        {steps.map((step, stepIdx) => (
                                          <div key={stepIdx} className="flex items-start gap-2">
                                            <span className="text-blue-600 font-medium text-sm mt-0.5">
                                              {step.match(/^\d+\./) ? step.match(/^\d+\./)?.[0] : '•'}
                                            </span>
                                            <span className="text-gray-700 text-sm">
                                              {step.replace(/^\d+\.\s*/, '')}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <p key={idx} className="text-gray-700">
                                      {part}
                                    </p>
                                  );
                                }
                              })}
                            </div>
                          );
                        } else {
                          // Regular details without plugin-specific instructions
                          return <p className="text-gray-700 mb-3">{details}</p>;
                        }
                      })()}

                      {/* Combined Images Table - Show for "Optimise Images" recommendation */}
                      {(rec.title === 'Optimise Images' || rec.title.includes('Large Image') || rec.title.includes('Modern Image') || rec.title.toLowerCase().includes('image format')) && (largeImagesList.length > 0 || legacyFormatImagesList.length > 0) && (() => {
                        // Combine and deduplicate images from both lists
                        const imageMap = new Map();

                        // Add large images
                        largeImagesList.forEach((image: { imageUrl: string; pageUrl: string; sizeKB: number }) => {
                          const key = image.imageUrl;
                          if (!imageMap.has(key)) {
                            imageMap.set(key, {
                              ...image,
                              isLarge: true,
                              currentFormat: image.imageUrl.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)?.[1]?.toUpperCase() || 'Unknown',
                              isLegacyFormat: false
                            });
                          }
                        });

                        // Add/merge legacy format images
                        legacyFormatImagesList.forEach((image: { imageUrl: string; pageUrl: string; sizeKB: number; currentFormat: string; suggestedFormat: string }) => {
                          const key = image.imageUrl;
                          if (imageMap.has(key)) {
                            // Merge with existing entry
                            const existing = imageMap.get(key);
                            imageMap.set(key, {
                              ...existing,
                              currentFormat: image.currentFormat,
                              suggestedFormat: image.suggestedFormat,
                              isLegacyFormat: true
                            });
                          } else {
                            // Add new entry
                            imageMap.set(key, {
                              ...image,
                              isLarge: (image.sizeKB || 0) > 100,
                              isLegacyFormat: true
                            });
                          }
                        });

                        const combinedImages = Array.from(imageMap.values()).slice(0, 20);

                        return (
                          <div className="mb-4 pb-4 border-b border-gray-300">
                            <h5 className="font-semibold mb-3 text-orange-600">⚠️ Images Need Optimisation</h5>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-orange-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left font-medium text-orange-800">Image</th>
                                      <th className="px-4 py-3 text-left font-medium text-orange-800">Found On Page</th>
                                      <th className="px-4 py-3 text-left font-medium text-orange-800">Current Format</th>
                                      <th className="px-4 py-3 text-right font-medium text-orange-800">Size</th>
                                      <th className="px-4 py-3 text-left font-medium text-orange-800">Action Needed</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-orange-200">
                                    {combinedImages.map((image: { imageUrl: string; pageUrl: string; sizeKB: number; currentFormat: string; suggestedFormat?: string; isLarge: boolean; isLegacyFormat: boolean }, imageIndex: number) => (
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
                                              {image.pageUrl.replace(/^https?:\/\//, '').substring(0, 40)}...
                                            </a>
                                          </Tooltip>
                                        </td>
                                        <td className="px-4 py-3">
                                          {image.isLegacyFormat ? (
                                            <Tooltip content={`Legacy format - consider converting to ${image.suggestedFormat || 'WebP'} for better performance`}>
                                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                                {image.currentFormat} (Legacy)
                                              </span>
                                            </Tooltip>
                                          ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                              {image.currentFormat}
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                          <span className={image.isLarge ? 'text-red-600' : 'text-gray-700'}>
                                            {(image.sizeKB || 0).toLocaleString()}KB
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                          {image.isLarge && image.isLegacyFormat ? (
                                            <span className="text-red-600 font-medium">Compress & convert to {image.suggestedFormat || 'WebP'}</span>
                                          ) : image.isLarge ? (
                                            <span>{image.sizeKB > 500 ? 'Compress urgently' : 'Compress image'}</span>
                                          ) : image.isLegacyFormat ? (
                                            <span>Convert to {image.suggestedFormat || 'WebP'}</span>
                                          ) : (
                                            <span className="text-gray-500">OK</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              💡 Tip: Use image compression tools like TinyPNG and convert to WebP format to reduce file sizes by 40-70% without losing quality.
                            </p>
                          </div>
                        );
                      })()}

                      {/* Pages With Issues - Show for technical SEO issues */}
                      {rec.title.includes('Missing H1 Tags') && issuePages?.missingH1Tags && issuePages.missingH1Tags.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-300">
                          <h5 className="font-semibold mb-3 text-orange-600">⚠️ Pages Missing H1 Tags</h5>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {issuePages.missingH1Tags.map((pageUrl, idx) => (
                                <div key={idx} className="text-sm">
                                  <a
                                    href={pageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                  >
                                    {pageUrl}
                                  </a>
                                </div>
                              ))}
                            </div>
                            {issuePages.missingH1Tags.length >= 20 && (
                              <p className="text-xs text-gray-600 mt-2">
                                Showing first 20 pages. Additional pages may also be affected.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {rec.title.includes('Missing Meta Titles') && issuePages?.missingMetaTitles && issuePages.missingMetaTitles.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-300">
                          <h5 className="font-semibold mb-3 text-orange-600">⚠️ Pages Missing Meta Titles</h5>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {issuePages.missingMetaTitles.map((pageUrl, idx) => (
                                <div key={idx} className="text-sm">
                                  <a
                                    href={pageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                  >
                                    {pageUrl}
                                  </a>
                                </div>
                              ))}
                            </div>
                            {issuePages.missingMetaTitles.length >= 20 && (
                              <p className="text-xs text-gray-600 mt-2">
                                Showing first 20 pages. Additional pages may also be affected.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {rec.title.includes('Missing Meta Descriptions') && issuePages?.missingMetaDescriptions && issuePages.missingMetaDescriptions.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-300">
                          <h5 className="font-semibold mb-3 text-orange-600">⚠️ Pages Missing Meta Descriptions</h5>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {issuePages.missingMetaDescriptions.map((pageUrl, idx) => (
                                <div key={idx} className="text-sm">
                                  <a
                                    href={pageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                  >
                                    {pageUrl}
                                  </a>
                                </div>
                              ))}
                            </div>
                            {issuePages.missingMetaDescriptions.length >= 20 && (
                              <p className="text-xs text-gray-600 mt-2">
                                Showing first 20 pages. Additional pages may also be affected.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Plugin Recommendation Tables - Now shown FIRST */}
                      {rec.useCase && cms === 'WordPress' && (
                        <div className="mb-4 pb-4 border-b border-gray-300 space-y-6">
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

                      {/* Summary Section - Now shown AFTER plugin tables */}
                      <div className="space-y-2">
                        <div className="font-medium text-gray-800">Summary:</div>
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