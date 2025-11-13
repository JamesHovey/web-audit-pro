"use client"

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Star, CheckCircle, Info, Filter, X } from 'lucide-react'
import { PluginMetadata, getInstalledPlugins, getNonInstalledPlugins } from '@/lib/pluginRecommendations'

interface PluginRecommendationTableProps {
  plugins: PluginMetadata[]
  installedPlugins: string[]
  issueType: string
  mode?: 'installed' | 'recommended' // New prop to determine what to show
}

type SortField = 'rating' | 'reviews' | 'cost' | 'activeInstalls'
type SortDirection = 'asc' | 'desc'
type CostFilter = 'all' | 'Free' | 'Freemium' | 'Paid'

// Helper function to get plugin-specific configuration steps
function getPluginConfigurationSteps(pluginName: string, issueType: string): string[] {
  const key = `${pluginName.toLowerCase()}:${issueType.toLowerCase()}`

  const configSteps: Record<string, string[]> = {
    // WP Rocket configurations
    'wp rocket:large-images': [
      'Log in to your WordPress admin dashboard',
      'Navigate to Settings → WP Rocket',
      'Click on the "Media" tab',
      'Enable "LazyLoad for images"',
      'Enable "Replace YouTube iframe with preview image"',
      'Scroll down and enable "WebP compatibility" if your server supports WebP',
      'Click "Save Changes"',
      'Test your site to ensure images load properly',
      '💡 Tip: WP Rocket works great with image optimization plugins like Imagify or ShortPixel'
    ],
    'wp rocket:minification': [
      'Go to Settings → WP Rocket in your WordPress dashboard',
      'Click on the "File Optimization" tab',
      'Under CSS Files: Enable "Minify CSS files"',
      'Under JavaScript Files: Enable "Minify JavaScript files"',
      'Enable "Combine JavaScript files" (test carefully as this can sometimes cause conflicts)',
      'Enable "Load JavaScript deferred" to improve page load time',
      'Click "Save Changes" and clear your cache',
      'Test your website thoroughly - if anything breaks, disable "Combine" options one by one',
      '⚠️ Important: Some themes/plugins may conflict with combining files'
    ],
    'wp rocket:css-optimization': [
      'Access WP Rocket settings: Settings → WP Rocket',
      'Go to the "File Optimization" tab',
      'Enable "Optimize CSS delivery" - this removes render-blocking CSS',
      'Enable "Minify CSS files" to reduce CSS file sizes',
      'WP Rocket will automatically generate critical CSS for above-the-fold content',
      'Click "Save Changes"',
      'Clear your cache and test your site',
      '💡 This feature eliminates render-blocking CSS warnings in PageSpeed Insights'
    ],
    'wp rocket:javascript-optimization': [
      'Navigate to Settings → WP Rocket → File Optimization',
      'Under JavaScript Files, enable "Minify JavaScript files"',
      'Enable "Load JavaScript deferred" to defer non-critical JS',
      'Optional: Enable "Delay JavaScript execution" to further improve initial page load',
      'If you use Delay JS, add critical scripts to the exclusion list (like Google Analytics)',
      'Save changes and clear cache',
      'Test all interactive features on your site (forms, sliders, menus, etc.)',
      '⚠️ If something breaks, use the exclusion field to exclude specific JS files'
    ],
    'wp rocket:caching': [
      'WP Rocket activates caching automatically upon installation',
      'To configure: Go to Settings → WP Rocket → Cache tab',
      'Ensure "Enable caching for mobile devices" is checked',
      'Enable "Separate cache files for mobile devices" if you have a responsive site',
      'Set cache lifespan (default 10 hours is usually good)',
      'Enable "Preload cache" to automatically build cache for your pages',
      'Add your sitemap URL in the "Preload" section',
      'Click "Save Changes"',
      '💡 WP Rocket automatically clears cache when you update content'
    ],

    // Autoptimize configurations
    'autoptimize:css-optimization': [
      'Go to Settings → Autoptimize in WordPress',
      'In the "CSS Options" section, check "Optimize CSS Code"',
      'Check "Aggregate CSS-files" to combine CSS files',
      'Optional: Enable "Inline all CSS" for small sites',
      'For most sites, keep "Inline and Defer CSS" checked',
      'Click "Save Changes and Empty Cache"',
      'Test your site - if styling breaks, try disabling "Aggregate CSS-files"',
      '💡 Autoptimize has a "Critical CSS" power-up for advanced optimization'
    ],
    'autoptimize:javascript-optimization': [
      'Access Settings → Autoptimize',
      'In "JS Options", check "Optimize JavaScript Code"',
      'Check "Aggregate JS-files" to combine JavaScript',
      'Enable "Also aggregate inline JS" if your theme allows it',
      'Optional: Enable "Force JavaScript in <head>" (test carefully)',
      'If you have jQuery issues, add "jquery" to the exclusion list',
      'Save Changes and Empty Cache',
      'Test all interactive features thoroughly',
      '⚠️ Common exclusions needed: "js/jquery/jquery.js,wp-includes/js/dist"'
    ],
    'autoptimize:minification': [
      'Navigate to Settings → Autoptimize',
      'Enable "Optimize HTML Code" to minify HTML',
      'Enable "Optimize CSS Code" to minify CSS',
      'Enable "Optimize JavaScript Code" to minify JS',
      'Click "Save Changes and Empty Cache"',
      'Check your website for any layout or functionality issues',
      '💡 Autoptimize is lightweight and specifically focuses on minification'
    ],

    // W3 Total Cache configurations
    'w3 total cache:caching': [
      'Go to Performance → General Settings in WordPress',
      'Enable "Page Cache" and select "Disk: Enhanced" as the method',
      'Enable "Minify" and set Minify mode to "Manual"',
      'Enable "Browser Cache" to leverage browser caching',
      'Optional: Enable "Object Cache" if you have a large database',
      'Scroll to bottom and click "Save all settings"',
      'Go to Performance → Page Cache → Cache Preload',
      'Enter your sitemap URL and enable "Automatically prime the page cache"',
      'Save settings and test your site',
      '⚠️ W3 Total Cache is powerful but complex - start with basic settings'
    ],
    'w3 total cache:minification': [
      'Navigate to Performance → Minify in WordPress',
      'Enable "Rewrite URL structure" for cleaner URLs',
      'Under HTML & XML: Enable "Enable" and "Inline CSS minification"',
      'Under JS: Enable "Enable", select "Before </body>" for operation',
      'Under CSS: Enable "Enable" and select "Header" for embedding',
      'Click "Save settings & purge cache"',
      'Test your website thoroughly',
      '💡 Use "Help" buttons in W3TC for guidance on each setting'
    ],

    // Image Optimization plugins
    'imagify:large-images': [
      'Install and activate Imagify from WordPress plugins',
      'Sign up for a free API key at imagify.io (20MB/month free)',
      'Go to Settings → Imagify',
      'Enter your API key',
      'Select optimization level: "Normal" is recommended (best balance)',
      'Enable "Auto-Optimize images on upload"',
      'Enable "Backup original images" for safety',
      'Check "Resize larger images" and set max width to 1920px',
      'Enable "Convert to WebP" for modern browsers',
      'Click "Save & Go to Bulk Optimizer" to optimize existing images',
      'Run the bulk optimizer on your image library',
      '💡 Monitor your monthly quota - upgrade if you upload many images'
    ],
    'shortpixel image optimizer:large-images': [
      'Install ShortPixel from WordPress plugins',
      'Sign up for free API key (100 images/month)',
      'Navigate to Settings → ShortPixel',
      'Enter your API key',
      'Choose compression type: "Lossy" for best compression with good quality',
      'Enable "Also include thumbnails"',
      'Check "Convert to WebP"',
      'Enable "Optimize on upload" for automatic optimization',
      'Go to Media → Bulk ShortPixel',
      'Click "Start Optimizing" to optimize existing images',
      '💡 You can buy one-time credits instead of monthly subscription'
    ],
    'ewww image optimizer:large-images': [
      'Install EWWW Image Optimizer plugin',
      'Go to Settings → EWWW Image Optimizer',
      'Choose "Pixel Perfect" or "Balanced" mode (Balanced recommended)',
      'Enable "Lazy Load" for images',
      'Enable "WebP Conversion"',
      'No API key needed for basic optimization!',
      'Enable "Optimize on Upload"',
      'Navigate to Media → Bulk Optimize',
      'Click "Start Scan" then "Start Optimizing"',
      '💡 Free tier uses local optimization - upgrade for cloud compression'
    ],
    'smush:large-images': [
      'Install and activate Smush plugin',
      'Go to Smush settings in WordPress dashboard',
      'Enable "Automatic compression" to optimize new uploads',
      'Turn on "Lazy Load" for images',
      'Enable "Resize Original Images" and set max width to 2000px',
      'Note: WebP conversion requires Smush Pro',
      'Go to "Bulk Smush" tab',
      'Click "Bulk Smush Now" to optimize up to 50 images at once',
      '💡 Free version is unlimited but limited to 5MB per image'
    ],

    // SEO plugins
    'yoast seo:meta-titles': [
      'Install Yoast SEO plugin if not already installed',
      'Edit the page/post that needs a meta title',
      'Scroll down to the "Yoast SEO" meta box below the editor',
      'In the "SEO title" field, enter your optimized title (50-60 characters)',
      'Include your primary keyword near the beginning',
      'Make it compelling and click-worthy',
      'Check the preview to see how it will look in Google',
      'Click "Update" or "Publish" to save changes',
      'Repeat for all pages missing meta titles',
      '💡 Yoast shows a traffic light indicator - aim for green!'
    ],
    'yoast seo:meta-descriptions': [
      'Edit the page/post in WordPress',
      'Find the Yoast SEO meta box below your content',
      'Click on the "Meta description" field',
      'Write a compelling description (150-160 characters)',
      'Include relevant keywords naturally',
      'Add a call-to-action if appropriate',
      'Check the preview snippet',
      'Save your changes',
      '💡 Good meta descriptions can improve click-through rates by 20-30%'
    ],
    'rank math:meta-titles': [
      'Install Rank Math SEO plugin',
      'Edit your page/post',
      'Look for the "Rank Math" meta box (usually below editor)',
      'Click "Edit Snippet"',
      'Enter your SEO Title in the field provided',
      'Rank Math shows a score and suggestions in real-time',
      'Keep title between 50-60 characters (Rank Math shows a progress bar)',
      'Include focus keyword for better rankings',
      'Save your post/page',
      '💡 Rank Math provides more free features than Yoast'
    ],
    'rank math:meta-descriptions': [
      'Open the page/post editor',
      'Scroll to the Rank Math SEO box',
      'Click "Edit Snippet" if not already visible',
      'Fill in the "Meta Description" field',
      'Keep it between 150-160 characters',
      'Rank Math shows a live preview and character count',
      'Include your focus keyword',
      'Make it action-oriented and engaging',
      'Update your content',
      '💡 Rank Math has built-in AI to suggest descriptions (Pro feature)'
    ],
  }

  // Try exact match first
  if (configSteps[key]) {
    return configSteps[key]
  }

  // Try partial matches based on issue type
  if (issueType.includes('image') || issueType.includes('large')) {
    return [
      'Install a recommended image optimization plugin from the list above',
      'Configure automatic optimization for new image uploads',
      'Enable WebP conversion for better compression',
      'Run bulk optimization on existing images',
      'Set maximum image dimensions to prevent oversized uploads',
      'Enable lazy loading for below-the-fold images'
    ]
  }

  if (issueType.includes('css')) {
    return [
      'Access your plugin settings from the WordPress dashboard',
      'Look for CSS optimization or minification options',
      'Enable CSS minification to reduce file sizes',
      'Enable CSS combining/aggregation if available',
      'Test your site after enabling to ensure styles work correctly',
      'Clear your cache after making changes'
    ]
  }

  if (issueType.includes('javascript') || issueType.includes('js')) {
    return [
      'Navigate to your plugin\'s JavaScript settings',
      'Enable JS minification',
      'Enable defer or async loading for non-critical scripts',
      'Test all interactive features (menus, forms, sliders)',
      'If something breaks, exclude problematic scripts',
      'Clear cache and test across different pages'
    ]
  }

  if (issueType.includes('cache') || issueType.includes('caching')) {
    return [
      'Enable page caching in your plugin settings',
      'Configure cache preloading with your sitemap',
      'Enable browser caching',
      'Set appropriate cache expiration times',
      'Enable mobile caching if you have a responsive site',
      'Configure cache clearing rules for when content updates'
    ]
  }

  // Default generic steps
  return [
    `This plugin can help resolve ${issueType} issues`,
    'Install and activate the plugin from your WordPress dashboard',
    'Navigate to the plugin settings page',
    'Look for options related to the specific issue',
    'Enable recommended optimizations',
    'Save your settings and clear any caches',
    'Test your website to verify the improvements'
  ]
}

export default function PluginRecommendationTable({
  plugins,
  installedPlugins,
  issueType,
  mode = 'recommended'
}: PluginRecommendationTableProps) {
  const [sortField, setSortField] = useState<SortField>('rating')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [costFilter, setCostFilter] = useState<CostFilter>('all')
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null)

  // Check if a plugin is installed - not currently used in UI but kept for potential future use
  const _isInstalled = (plugin: PluginMetadata): boolean => {
    return installedPlugins.some(installed =>
      installed.toLowerCase().includes(plugin.name.toLowerCase()) ||
      installed.toLowerCase().includes(plugin.slug)
    )
  }

  // Filter plugins based on mode
  const filteredByMode = useMemo(() => {
    if (mode === 'installed') {
      return getInstalledPlugins(plugins, installedPlugins)
    } else {
      return getNonInstalledPlugins(plugins, installedPlugins)
    }
  }, [plugins, installedPlugins, mode])

  // Sort and filter plugins
  const sortedAndFilteredPlugins = useMemo(() => {
    let filtered = filteredByMode

    // Apply cost filter
    if (costFilter !== 'all') {
      filtered = filtered.filter(p => p.cost === costFilter)
    }

    // Sort plugins
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'rating':
          comparison = b.rating - a.rating
          break
        case 'reviews':
          comparison = b.reviews - a.reviews
          break
        case 'cost':
          const costOrder = { 'Free': 0, 'Freemium': 1, 'Paid': 2 }
          comparison = costOrder[a.cost] - costOrder[b.cost]
          break
        case 'activeInstalls':
          // Simple numeric comparison based on the string
          const aInstalls = parseInt(a.activeInstalls.replace(/[^0-9]/g, '')) || 0
          const bInstalls = parseInt(b.activeInstalls.replace(/[^0-9]/g, '')) || 0
          comparison = bInstalls - aInstalls
          break
      }

      return sortDirection === 'asc' ? -comparison : comparison
    })

    return sorted
  }, [filteredByMode, costFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const getCostBadgeColor = (cost: string) => {
    switch (cost) {
      case 'Free':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'Freemium':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Paid':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (sortedAndFilteredPlugins.length === 0 && mode === 'installed') {
    // No installed plugins - don't show this section
    return null
  }

  if (sortedAndFilteredPlugins.length === 0 && mode === 'recommended') {
    // No better alternatives available
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-semibold text-gray-900">
            {mode === 'installed' ? 'Currently Installed Plugins' : 'Recommended Plugins & Tools'}
          </h5>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'installed'
              ? 'Plugins you already have that can fix this issue. Follow the steps below to configure them.'
              : getInstalledPlugins(plugins, installedPlugins).length > 0
                ? 'Alternative plugins that are objectively better than what you currently have installed.'
                : 'Compare options to fix this issue.'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by cost:</span>
        </div>
        {(['all', 'Free', 'Freemium', 'Paid'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setCostFilter(filter)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              costFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter === 'all' ? 'All' : filter}
          </button>
        ))}
        {costFilter !== 'all' && (
          <button
            onClick={() => setCostFilter('all')}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Plugin</th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center gap-1">
                  Rating {getSortIcon('rating')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reviews')}
              >
                <div className="flex items-center gap-1">
                  Reviews {getSortIcon('reviews')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('activeInstalls')}
              >
                <div className="flex items-center gap-1">
                  Active Installs {getSortIcon('activeInstalls')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cost')}
              >
                <div className="flex items-center gap-1">
                  Cost {getSortIcon('cost')}
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAndFilteredPlugins.map((plugin) => (
              <React.Fragment key={plugin.slug}>
                <tr className={`hover:bg-gray-50 ${mode === 'installed' ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{plugin.name}</span>
                          {mode === 'installed' && (
                            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Installed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{plugin.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{plugin.rating}</span>
                      <span className="text-gray-500">/ 5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {plugin.reviews.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{plugin.activeInstalls}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCostBadgeColor(plugin.cost)}`}>
                        {plugin.cost}
                      </span>
                      {plugin.pricingDetails && (
                        <div className="text-xs text-gray-500">{plugin.pricingDetails}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedPlugin(expandedPlugin === plugin.slug ? null : plugin.slug)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                      >
                        {expandedPlugin === plugin.slug ? 'Hide' : 'Details'}
                        {expandedPlugin === plugin.slug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <a
                        href={plugin.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                </tr>

                {/* Expanded Details */}
                {expandedPlugin === plugin.slug && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 bg-gray-50">
                      {mode === 'installed' ? (
                        // Show configuration steps for installed plugins
                        <div>
                          <h6 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> How to Configure {plugin.name} to Fix This Issue
                          </h6>
                          <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-700 mb-4">
                              Follow these steps to optimize <strong>{plugin.name}</strong> and resolve this issue:
                            </p>
                            <div className="space-y-2">
                              {getPluginConfigurationSteps(plugin.name, issueType).map((step, stepIndex) => (
                                <div key={stepIndex} className="flex items-start gap-2">
                                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                                    {stepIndex + 1}
                                  </span>
                                  <p className="text-sm text-gray-700 flex-1">{step}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <p className="text-xs text-gray-700">
                                <strong>💡 Best For:</strong> {plugin.bestFor}
                              </p>
                            </div>
                          </div>

                          {/* Still show pros/cons for installed plugins in collapsed section */}
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                              View plugin details (pros, cons, features)
                            </summary>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              {/* Pros */}
                              <div>
                                <h6 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" /> Pros
                                </h6>
                                <ul className="space-y-1">
                                  {plugin.pros.map((pro, i) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                      <span className="text-green-500 mt-0.5">✓</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Cons */}
                              <div>
                                <h6 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                                  <X className="w-4 h-4" /> Cons
                                </h6>
                                <ul className="space-y-1">
                                  {plugin.cons.map((con, i) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                      <span className="text-red-500 mt-0.5">✗</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Additional Info */}
                              <div>
                                <h6 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                  <Info className="w-4 h-4" /> Details
                                </h6>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-700">Best for:</span>
                                    <p className="text-gray-600 mt-0.5">{plugin.bestFor}</p>
                                  </div>
                                  {plugin.freeTierLimits && (
                                    <div>
                                      <span className="font-medium text-gray-700">Free tier limits:</span>
                                      <p className="text-gray-600 mt-0.5">{plugin.freeTierLimits}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium text-gray-700">Category:</span>
                                    <span className="text-gray-600 ml-1 capitalize">{plugin.category}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      ) : (
                        // Show pros/cons for recommended plugins
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Pros */}
                          <div>
                            <h6 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Pros
                            </h6>
                            <ul className="space-y-1">
                              {plugin.pros.map((pro, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cons */}
                          <div>
                            <h6 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                              <X className="w-4 h-4" /> Cons
                            </h6>
                            <ul className="space-y-1">
                              {plugin.cons.map((con, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-red-500 mt-0.5">✗</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Additional Info */}
                          <div>
                            <h6 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                              <Info className="w-4 h-4" /> Details
                            </h6>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="font-medium text-gray-700">Best for:</span>
                                <p className="text-gray-600 mt-0.5">{plugin.bestFor}</p>
                              </div>
                              {plugin.freeTierLimits && (
                                <div>
                                  <span className="font-medium text-gray-700">Free tier limits:</span>
                                  <p className="text-gray-600 mt-0.5">{plugin.freeTierLimits}</p>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-700">Category:</span>
                                <span className="text-gray-600 ml-1 capitalize">{plugin.category}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-xs text-gray-500 border-t pt-3">
        {mode === 'installed' ? (
          <>
            Showing {sortedAndFilteredPlugins.length} installed plugin{sortedAndFilteredPlugins.length !== 1 ? 's' : ''}
            {costFilter !== 'all' && ` (filtered by ${costFilter})`}
            . Sorted by {sortField} ({sortDirection === 'desc' ? 'high to low' : 'low to high'}).
          </>
        ) : (
          <>
            Showing {sortedAndFilteredPlugins.length} recommended plugin{sortedAndFilteredPlugins.length !== 1 ? 's' : ''}
            {costFilter !== 'all' && ` (filtered by ${costFilter})`}
            . Sorted by {sortField} ({sortDirection === 'desc' ? 'high to low' : 'low to high'}).
            {getInstalledPlugins(plugins, installedPlugins).length > 0 && (
              <> Only showing plugins that are objectively better than your installed plugins.</>
            )}
          </>
        )}
      </div>
    </div>
  )
}
