"use client"

import React, { useState } from 'react'
import { AlertTriangle, Clock, Zap, Image, Code, Server, TrendingUp, HelpCircle } from 'lucide-react'
import Tooltip from './Tooltip'
import PluginRecommendationTable from './PluginRecommendationTable'
import { getPluginsByUseCase, isPluginInstalled } from '@/lib/pluginRecommendations'

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
}

export default function EnhancedRecommendations({
  recommendations,
  desktopScore,
  mobileScore,
  lcpScore,
  clsScore,
  inpScore,
  detectedPlugins = [],
  pageBuilder,
  cms,
  technicalIssues
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
        title: 'Optimize Large Images',
        description: `${technicalIssues.largeImages} image(s) over 100KB are slowing down your site`,
        impact: 'High',
        effort: 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: 'Large images significantly impact page load time and user experience',
        useCase: 'large-images',
        howTo: cms === 'WordPress' ? [
          'Install an image optimization plugin:',
          'Recommended: Imagify, ShortPixel, or EWWW Image Optimizer (all have free tiers)',
          'These plugins automatically compress images on upload',
          'Imagify: Install → Settings → Choose "Normal" compression → Enable "Auto-optimize images"',
          'ShortPixel: Install → Settings → Enter API key (free 100 images/month) → Enable "Optimize on upload"',
          'EWWW: Install → Enable "Compress images on upload" and "Convert to WebP"',
          'For existing images: Use the bulk optimizer in the plugin',
          'Alternative: Compress images before uploading using TinyPNG.com or Squoosh.app',
          'Target: Keep images under 200KB, preferably under 100KB'
        ] : [
          'Compress images before uploading to your site',
          'Use online tools: TinyPNG.com, Squoosh.app, or ImageOptim',
          'Convert to modern formats: WebP or AVIF',
          'Set appropriate dimensions - don\'t upload larger than needed',
          'Use responsive images with srcset attribute',
          'For e-commerce: Shopify has built-in image optimization',
          'For Wix/Squarespace: Use their built-in image optimization tools',
          'Target: Keep images under 200KB, preferably under 100KB'
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
      const baseInstructions = [
        'Audit JavaScript files for unused code',
        'Remove unnecessary third-party scripts',
        'Use code splitting to load JS only when needed',
        'Minify and compress remaining JavaScript'
      ]
      
      return {
        title: 'Remove Unused JavaScript',
        description: 'JavaScript files contain code that\'s not being executed',
        impact: 'High',
        effort: 'Medium',
        icon: <Code className="w-4 h-4" />,
        details: 'Unused JavaScript blocks the browser and wastes bandwidth',
        howTo: getPluginSpecificInstructions(baseInstructions, 'javascript')
      }
    }
    
    if (lowerRec.includes('render-blocking') || lowerRec.includes('blocking resources')) {
      return {
        title: 'Fix Render-Blocking Resources',
        description: 'CSS and JS files are preventing your page from displaying quickly',
        impact: 'High',
        effort: 'Hard',
        icon: <AlertTriangle className="w-4 h-4" />,
        details: 'Critical resources must load before the page can be displayed',
        howTo: [
          'Inline critical CSS in the HTML head',
          'Load non-critical CSS asynchronously',
          'Defer non-essential JavaScript',
          'Use resource hints like preload for critical resources'
        ]
      }
    }
    
    if (lowerRec.includes('images') && (lowerRec.includes('offscreen') || lowerRec.includes('defer'))) {
      const baseInstructions = [
        'Add loading="lazy" to img tags',
        'Use intersection observer for custom lazy loading',
        'Prioritize above-the-fold images',
        'Consider using modern image formats'
      ]
      
      return {
        title: 'Lazy Load Images',
        description: 'Images below the fold are loading immediately, wasting bandwidth',
        impact: 'Medium',
        effort: 'Easy',
        icon: <Image className="w-4 h-4" />,
        details: 'Loading images only when needed improves initial page load',
        howTo: getPluginSpecificInstructions(baseInstructions, 'images')
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
      return {
        title: 'Improve Server Response Time',
        description: 'Your server takes too long to respond to requests',
        impact: 'High',
        effort: 'Hard',
        icon: <Server className="w-4 h-4" />,
        details: 'Slow server response delays everything else on your page',
        howTo: [
          'Upgrade to faster hosting',
          'Enable caching on your server',
          'Optimize database queries',
          'Use a Content Delivery Network (CDN)'
        ]
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

  // Sort by impact (High > Medium > Low) and limit to top 10
  const sortedRecs = allRecs.sort((a, b) => {
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

                  <details open className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                      How to fix this →
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="text-gray-700 mb-3">{rec.details}</p>

                      {/* Regular Steps */}
                      <div className="space-y-2 mb-4">
                        <div className="font-medium text-gray-800">Steps:</div>
                        {rec.howTo
                          .filter(step => !step.includes('plugin') && !step.includes('Plugin') && !step.toLowerCase().includes('yoast') && !step.toLowerCase().includes('rank math') && !step.toLowerCase().includes('imagify') && !step.toLowerCase().includes('shortpixel') && !step.toLowerCase().includes('ewww') && !step.toLowerCase().includes('wp rocket') && !step.toLowerCase().includes('autoptimize'))
                          .map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2">
                              <span className="text-blue-500 text-xs mt-1">•</span>
                              <span className="text-gray-700">{step}</span>
                            </div>
                          ))}
                      </div>

                      {/* Recommended Plugins */}
                      {(() => {
                        const pluginSteps = rec.howTo.filter(step =>
                          step.toLowerCase().includes('plugin') ||
                          step.toLowerCase().includes('yoast') ||
                          step.toLowerCase().includes('rank math') ||
                          step.toLowerCase().includes('all in one seo') ||
                          step.toLowerCase().includes('imagify') ||
                          step.toLowerCase().includes('shortpixel') ||
                          step.toLowerCase().includes('ewww') ||
                          step.toLowerCase().includes('wp rocket') ||
                          step.toLowerCase().includes('autoptimize') ||
                          step.toLowerCase().includes('w3 total cache') ||
                          step.toLowerCase().includes('tinypng') ||
                          step.toLowerCase().includes('squoosh')
                        )

                        const getPluginLink = (text: string): string | null => {
                          const lower = text.toLowerCase()
                          if (lower.includes('yoast')) return 'https://wordpress.org/plugins/wordpress-seo/'
                          if (lower.includes('rank math')) return 'https://wordpress.org/plugins/seo-by-rank-math/'
                          if (lower.includes('all in one seo')) return 'https://wordpress.org/plugins/all-in-one-seo-pack/'
                          if (lower.includes('imagify')) return 'https://wordpress.org/plugins/imagify/'
                          if (lower.includes('shortpixel')) return 'https://wordpress.org/plugins/shortpixel-image-optimiser/'
                          if (lower.includes('ewww')) return 'https://wordpress.org/plugins/ewww-image-optimizer/'
                          if (lower.includes('wp rocket')) return 'https://wp-rocket.me/'
                          if (lower.includes('autoptimize')) return 'https://wordpress.org/plugins/autoptimize/'
                          if (lower.includes('w3 total cache')) return 'https://wordpress.org/plugins/w3-total-cache/'
                          if (lower.includes('tinypng')) return 'https://tinypng.com/'
                          if (lower.includes('squoosh')) return 'https://squoosh.app/'
                          return null
                        }

                        if (pluginSteps.length === 0) return null

                        return (
                          <div className="space-y-2 pt-3 border-t border-gray-300">
                            <div className="font-medium text-gray-800 flex items-center gap-2">
                              <span>Recommended Plugins & Tools:</span>
                            </div>
                            {pluginSteps.map((step, stepIndex) => {
                              const link = getPluginLink(step)
                              return (
                                <div key={stepIndex} className="flex items-start gap-2">
                                  <span className="text-green-500 text-xs mt-1">🔧</span>
                                  <span className="text-gray-700">
                                    {step}
                                    {link && (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                                      >
                                        Visit plugin →
                                      </a>
                                    )}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}

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
              const { getPageBuilderOptimizations } = require('@/lib/pluginDetectionService')
              const optimizations = getPageBuilderOptimizations(pageBuilder)
              
              return optimizations.map((opt: any, index: number) => (
                <details key={index} className="mb-3 last:mb-0">
                  <summary className="cursor-pointer text-blue-700 hover:text-blue-900 font-medium flex items-center gap-2">
                    {opt.title}
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
        💡 <strong>Tip:</strong> Start with "High Impact" and "Easy" fixes first for quick wins. 
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