"use client"

import React from 'react'
import { AlertTriangle, Zap, Image, Code, Server, TrendingUp, HelpCircle, FileText, FileCode } from 'lucide-react'
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
    invalidStructuredData?: number
    lowTextHtmlRatio?: number
    unminifiedFiles?: number
    shortTitles?: number
    longTitles?: number
    pagesWithOneIncomingLink?: number
    orphanedSitemapPages?: number
    trueOrphanPages?: number
    pagesWithBrokenLinks?: number
    pagesWithNofollowLinks?: number
    pagesDeepInSite?: number
    genericAnchors?: number
    poorDeepLinkRatio?: number
    permanentRedirects?: number
    subdomainsWithoutHSTS?: number
    missingLlmsTxt?: number
    missingRobotsTxt?: number
  }
  technicalAudit?: {
    unminifiedFiles?: {
      totalUnminified: number
      javascriptFiles: Array<{
        url: string
        sizeKB?: number
        reason: string
      }>
      cssFiles: Array<{
        url: string
        sizeKB?: number
        reason: string
      }>
    }
    titleLengthIssues?: {
      tooShort: Array<{ url: string; title: string; length: number }>
      tooLong: Array<{ url: string; title: string; length: number }>
    }
    internalLinkAnalysis?: {
      pagesWithOneIncomingLink: Array<{
        url: string
        incomingLinkCount: number
        linkingPage: string
      }>
      orphanedSitemapPages?: Array<{
        url: string
        inSitemap: boolean
        incomingLinkCount: number
      }>
      trueOrphanPages?: Array<{
        url: string
        incomingLinkCount: number
        discoveryMethod: string
      }>
      pagesWithBrokenLinks?: Array<{
        url: string
        brokenLinkCount: number
        brokenLinks: Array<{ targetUrl: string; anchorText: string }>
      }>
      pagesWithNofollowLinks?: Array<{
        url: string
        nofollowLinkCount: number
        nofollowLinks: Array<{ targetUrl: string; anchorText: string }>
      }>
      linkDepthAnalysis?: {
        pagesDeepInSite: Array<{
          url: string
          depth: number
        }>
        averageDepth: number
        maxDepth: number
      }
      anchorTextAnalysis?: {
        genericAnchors: Array<{
          url: string
          anchorText: string
          count: number
        }>
        overOptimized: Array<{
          url: string
          anchorText: string
          count: number
        }>
      }
      deepLinkRatio?: {
        homepageLinks: number
        deepContentLinks: number
        ratio: number
      }
      totalPagesAnalyzed: number
    }
    permanentRedirects?: {
      totalRedirects: number
      redirects: Array<{
        fromUrl: string
        toUrl: string
        statusCode: number
      }>
    }
  }
  textHtmlRatioPages?: Array<{
    url: string
    textLength: number
    htmlLength: number
    ratio: number
    status: 'good' | 'warning' | 'poor'
  }>
  issuePages?: {
    missingH1Tags?: string[]
    missingMetaTitles?: string[]
    missingMetaDescriptions?: string[]
    httpErrors?: string[]
  }
  structuredDataItems?: Array<{
    type: string
    format: string
    location: string
    isValid: boolean
    errors: string[]
    warnings: string[]
  }>
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
  technicalAudit,
  issuePages,
  largeImagesList = [],
  legacyFormatImagesList = [],
  structuredDataItems = [],
  textHtmlRatioPages = []
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

    // Title Tag Length Issues (Too Short)
    if (technicalIssues?.shortTitles && technicalIssues.shortTitles > 0) {
      techRecs.push({
        title: 'Fix Short Title Tags',
        description: `${technicalIssues.shortTitles} page(s) have title tags that are too short (< 30 characters). Short titles don't provide enough context for search engines and users.`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <FileText className="w-4 h-4" />,
        details: 'Title tags should be 30-60 characters for optimal display in search results. Short titles miss opportunities to include relevant keywords and compelling copy that improves click-through rates.',
        useCase: 'title-optimization',
        howTo: cms === 'WordPress' ? [
          '🎯 OPTIMAL TITLE LENGTH: 30-60 characters',
          'Current titles are too short and need more descriptive text.',
          '',
          '✏️ HOW TO FIX (using SEO plugin):',
          '',
          '1️⃣ If using Yoast SEO:',
          '   • Edit the page/post in WordPress',
          '   • Scroll to "Yoast SEO" section',
          '   • Look for "SEO title" field',
          '   • Expand your title to 30-60 characters',
          '   • Yoast will show a green bar when length is optimal',
          '',
          '2️⃣ If using Rank Math:',
          '   • Edit the page/post',
          '   • Find "Rank Math SEO" box',
          '   • Update the "Title" field',
          '   • Watch for the character counter (aim for 30-60)',
          '',
          '3️⃣ If using All in One SEO:',
          '   • Edit the page/post',
          '   • Scroll to "AIOSEO Settings"',
          '   • Update the "Post Title"',
          '   • Keep it between 30-60 characters',
          '',
          '📋 TITLE WRITING TIPS:',
          '   • Include your main keyword',
          '   • Add your brand/company name',
          '   • Make it descriptive and compelling',
          '   • Use action words or benefits',
          '   • Example: "Professional Web Design Services | YourBrand"',
          '',
          '✅ GOOD TITLE EXAMPLES:',
          '   • "Affordable Plumbing Services in London | 24/7 Emergency"',
          '   • "Buy Organic Coffee Beans Online | Free UK Delivery"',
          '   • "Web Development Agency | Custom WordPress Sites"',
          '',
          '❌ TOO SHORT EXAMPLES:',
          '   • "Home" (4 chars)',
          '   • "About Us" (8 chars)',
          '   • "Services" (8 chars)',
          '',
          '💡 After updating, re-run the audit to verify improvements'
        ] : [
          '🎯 OPTIMAL TITLE LENGTH: 30-60 characters',
          '',
          '📋 PAGES WITH SHORT TITLES:',
          ...(technicalAudit?.titleLengthIssues?.tooShort?.slice(0, 5).map(item =>
            `   • "${item.title}" (${item.length} chars) - ${item.url}`
          ) || []),
          ...(technicalIssues.shortTitles && technicalIssues.shortTitles > 5 ? [`   • ...and ${technicalIssues.shortTitles - 5} more`] : []),
          '',
          '✏️ HOW TO FIX:',
          '1. Edit the <title> tag in your HTML <head> section',
          '2. Expand to 30-60 characters',
          '3. Include main keyword + brand name',
          '4. Make it descriptive and compelling',
          '',
          '📝 TITLE FORMULA:',
          '[Primary Keyword] | [Secondary Keyword/Benefit] | [Brand]',
          '',
          '✅ GOOD EXAMPLES:',
          '   • "Professional Web Design Services | Fast & Affordable | WebCo"',
          '   • "Buy Organic Coffee Beans | Free Delivery | CoffeeCo"',
          '',
          '❌ TOO SHORT:',
          '   • "Home" (4 characters)',
          '   • "About" (5 characters)',
          '',
          '💡 Each page needs a unique, descriptive title'
        ]
      });
    }

    // Title Tag Length Issues (Too Long)
    if (technicalIssues?.longTitles && technicalIssues.longTitles > 0) {
      techRecs.push({
        title: 'Shorten Long Title Tags',
        description: `${technicalIssues.longTitles} page(s) have title tags that are too long (> 70 characters). Long titles get truncated in search results.`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <FileText className="w-4 h-4" />,
        details: 'Google typically displays the first 50-60 characters of a title tag. Titles longer than 70 characters get cut off with "..." which looks unprofessional and may hide important keywords.',
        useCase: 'title-optimization',
        howTo: cms === 'WordPress' ? [
          '🎯 OPTIMAL TITLE LENGTH: 30-60 characters (max 70)',
          'Current titles are too long and will be truncated in search results.',
          '',
          '✂️ HOW TO SHORTEN:',
          '',
          '1️⃣ Remove unnecessary words:',
          '   • "Best", "Top", "Leading", "Professional" (if redundant)',
          '   • "Welcome to", "Official Website of"',
          '   • Repetitive location names',
          '   • Year dates (unless critical)',
          '',
          '2️⃣ Use abbreviations where appropriate:',
          '   • "UK" instead of "United Kingdom"',
          '   • "&" instead of "and"',
          '   • "SEO" instead of "Search Engine Optimization"',
          '',
          '3️⃣ Focus on essentials:',
          '   • Main keyword',
          '   • Key differentiator',
          '   • Brand name',
          '',
          '✏️ EDIT IN YOUR SEO PLUGIN:',
          '   • Yoast SEO: Edit "SEO title" field',
          '   • Rank Math: Update "Title" field',
          '   • All in One SEO: Modify "Post Title"',
          '   • Watch the character counter - keep under 60',
          '',
          '✅ BEFORE & AFTER EXAMPLES:',
          '',
          '❌ TOO LONG (85 chars):',
          '"Professional Web Design and Development Services for Small Businesses in London, UK"',
          '',
          '✅ OPTIMIZED (58 chars):',
          '"Web Design Services for Small Businesses | London UK"',
          '',
          '💡 Every character counts - make them matter!',
          '💡 After shortening, re-run the audit to verify'
        ] : [
          '🎯 OPTIMAL TITLE LENGTH: 30-60 characters',
          'Titles over 70 characters get truncated in Google search results.',
          '',
          '📋 PAGES WITH LONG TITLES:',
          ...(technicalAudit?.titleLengthIssues?.tooLong?.slice(0, 5).map(item =>
            `   • "${item.title.substring(0, 60)}..." (${item.length} chars)`
          ) || []),
          ...(technicalIssues.longTitles && technicalIssues.longTitles > 5 ? [`   • ...and ${technicalIssues.longTitles - 5} more`] : []),
          '',
          '✂️ HOW TO FIX:',
          '1. Edit your <title> tag in HTML',
          '2. Shorten to 30-60 characters',
          '3. Keep the most important keywords',
          '4. Remove filler words and redundancy',
          '',
          '🔧 SHORTENING TIPS:',
          '   • Remove "Welcome to", "Official site"',
          '   • Use "&" instead of "and"',
          '   • Remove redundant words',
          '   • Focus on core message',
          '',
          '✅ EXAMPLE:',
          '❌ "Welcome to the Best Professional Web Design and Development Agency in London"',
          '✅ "Web Design & Development Agency London | WebCo"'
        ]
      });
    }

    // Pages with Only One Incoming Internal Link
    if (technicalIssues?.pagesWithOneIncomingLink && technicalIssues.pagesWithOneIncomingLink > 0) {
      techRecs.push({
        title: 'Improve Internal Linking',
        description: `${technicalIssues.pagesWithOneIncomingLink} page(s) have only one incoming internal link. Poor internal linking weakens SEO and makes pages harder for users and search engines to discover.`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Pages with only one incoming link are poorly integrated into your site structure. Good internal linking improves SEO, helps users navigate, and distributes page authority throughout your site. Aim for 3-5+ internal links to each important page.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS MATTERS:',
          '   • Search engines use internal links to discover and understand pages',
          '   • More incoming links = more "link equity" and better rankings',
          '   • Helps users discover related content',
          '   • Reduces bounce rate by offering navigation options',
          '',
          '📋 PAGES WITH WEAK INTERNAL LINKING:',
          ...(technicalAudit?.internalLinkAnalysis?.pagesWithOneIncomingLink?.slice(0, 5).map(item => {
            // Extract just the path for cleaner display
            const urlPath = item.url.replace(/^https?:\/\/[^/]+/, '') || '/';
            const linkingPath = item.linkingPage.replace(/^https?:\/\/[^/]+/, '') || '/';
            return `   • ${urlPath} (linked from: ${linkingPath})`;
          }) || []),
          ...(technicalIssues.pagesWithOneIncomingLink && technicalIssues.pagesWithOneIncomingLink > 5
            ? [`   • ...and ${technicalIssues.pagesWithOneIncomingLink - 5} more pages`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Add contextual links from related content:',
          '   • Review pages on similar topics',
          '   • Add natural links within body content',
          '   • Use descriptive anchor text (not "click here")',
          '   • Link to the orphaned page from 3-5 relevant pages',
          '',
          '2️⃣ Add to navigation menus:',
          '   • Main navigation (for important pages)',
          '   • Footer links (for secondary pages)',
          '   • Sidebar widgets (for popular or recent content)',
          '   • Breadcrumb navigation',
          '',
          '3️⃣ Create hub pages or content clusters:',
          '   • Build pillar pages that link to related content',
          '   • Create "Related Posts" or "You May Also Like" sections',
          '   • Add category/tag pages that link to relevant posts',
          '',
          '4️⃣ For WordPress:',
          '   • Use "Related Posts" plugins (e.g., YARPP, Related Posts)',
          '   • Add manual links in post/page editor',
          '   • Use block editor to insert link blocks',
          '   • Create custom menus in Appearance → Menus',
          '',
          '5️⃣ For other platforms:',
          '   • Manually edit page content to add links',
          '   • Update navigation templates',
          '   • Use site-wide widgets or components',
          '',
          '✅ BEST PRACTICES:',
          '   • Use descriptive anchor text (include target keywords)',
          '   • Link from high-authority pages to newer/weaker pages',
          '   • Keep link relevance high (only link related content)',
          '   • Aim for 3-5+ internal links per page',
          '   • Don\'t over-optimize (keep it natural)',
          '',
          '📊 TARGET:',
          '   • All important pages should have 3+ incoming links',
          '   • Homepage should link to key landing pages',
          '   • Blog posts should link to 2-3 related articles',
          '',
          '💡 After adding links, re-run the audit to verify improvements'
        ]
      });
    }

    // Orphaned Sitemap Pages
    if (technicalIssues?.orphanedSitemapPages && technicalIssues.orphanedSitemapPages > 0) {
      techRecs.push({
        title: 'Fix Orphaned Sitemap Pages',
        description: `${technicalIssues.orphanedSitemapPages} page(s) in your sitemap have NO incoming internal links. These orphaned pages are invisible to users and hurt SEO by wasting crawl budget.`,
        impact: 'High',
        effort: 'Easy',
        icon: <AlertTriangle className="w-4 h-4" />,
        details: 'Orphaned pages appear in your XML sitemap but have zero internal links from other pages. Search engines find them via sitemap but users cannot navigate to them. This creates a poor user experience and wastes search engine crawl budget on pages that are disconnected from your site structure.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS IS CRITICAL:',
          '   • Users CANNOT navigate to these pages (they are invisible)',
          '   • Search engines see a disconnect between sitemap and actual site structure',
          '   • Wastes crawl budget on disconnected content',
          '   • Signals poor site architecture to Google',
          '   • These pages rarely rank well due to lack of internal link equity',
          '',
          '📋 ORPHANED SITEMAP PAGES (0 INCOMING LINKS):',
          ...(technicalAudit?.internalLinkAnalysis?.orphanedSitemapPages?.slice(0, 5).map(item => {
            // Extract just the path for cleaner display
            const urlPath = item.url.replace(/^https?:\/\/[^/]+/, '') || '/';
            return `   • ${urlPath} (in sitemap, but 0 internal links)`;
          }) || []),
          ...(technicalIssues.orphanedSitemapPages && technicalIssues.orphanedSitemapPages > 5
            ? [`   • ...and ${technicalIssues.orphanedSitemapPages - 5} more orphaned pages`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Add internal links from relevant pages:',
          '   • Find 3-5 related pages on your site',
          '   • Add contextual links to the orphaned page',
          '   • Use descriptive anchor text with target keywords',
          '   • Ensure links make sense in context',
          '',
          '2️⃣ Add to site navigation:',
          '   • Main menu (for important pages)',
          '   • Footer menu (for secondary pages)',
          '   • Sidebar widgets (category lists, recent posts)',
          '   • Breadcrumb navigation',
          '',
          '3️⃣ Create hub/category pages:',
          '   • Build landing pages that link to related content',
          '   • Add "Related Articles" sections',
          '   • Create category pages with links to all posts in that category',
          '',
          '4️⃣ For WordPress:',
          '   • Edit posts/pages → Add links in content editor',
          '   • Appearance → Menus → Add pages to menu',
          '   • Widgets → Add "Recent Posts" or "Custom Menu"',
          '   • Use plugins: YARPP, Related Posts, Link Whisper',
          '',
          '5️⃣ Alternative: Remove from sitemap:',
          '   • If the page is truly not important, remove it from sitemap',
          '   • Delete or noindex the page if it is low-quality',
          '   • Only keep pages in sitemap that you want indexed',
          '',
          '✅ BEST PRACTICES:',
          '   • Every page in your sitemap should be linked from at least 3 other pages',
          '   • Use natural, descriptive anchor text',
          '   • Link from high-authority pages to distribute link equity',
          '   • Ensure links are visible and clickable (not hidden)',
          '   • Review your sitemap regularly - remove unnecessary URLs',
          '',
          '📊 TARGET:',
          '   • 0 orphaned pages (all sitemap URLs should have 3+ incoming links)',
          '   • Keep sitemap clean - only include important pages',
          '   • Maximum 3 clicks from homepage to any page',
          '',
          '💡 IMPORTANT: Orphaned pages are a red flag to search engines',
          '💡 Fix these immediately to improve site structure and SEO',
          '💡 After fixing, re-run audit to confirm all pages are linked'
        ]
      });
    }

    // True Orphan Pages (0 Incoming Links)
    if (technicalIssues?.trueOrphanPages && technicalIssues.trueOrphanPages > 0) {
      techRecs.push({
        title: 'Fix True Orphan Pages',
        description: `${technicalIssues.trueOrphanPages} page(s) have ZERO incoming internal links. These pages are completely isolated and invisible to users navigating your site.`,
        impact: 'High',
        effort: 'Easy',
        icon: <AlertTriangle className="w-4 h-4" />,
        details: 'True orphan pages have no incoming internal links from any page on your site. Users cannot discover these pages through navigation. Search engines can only find them through sitemaps or external links, but they receive no internal link equity, severely harming their ranking potential.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS IS CRITICAL:',
          '   • Pages are completely invisible to site visitors',
          '   • Zero internal link equity = very poor rankings',
          '   • Search engines see these as disconnected/low-priority',
          '   • Wastes crawl budget on isolated content',
          '   • Signals serious site architecture problems',
          '',
          '📋 TRUE ORPHAN PAGES (0 INCOMING LINKS):',
          ...(technicalAudit?.internalLinkAnalysis?.trueOrphanPages?.slice(0, 5).map(item => {
            const urlPath = item.url.replace(/^https?:\/\/[^/]+/, '') || '/';
            return `   • ${urlPath} (discovered via ${item.discoveryMethod})`;
          }) || []),
          ...(technicalIssues.trueOrphanPages && technicalIssues.trueOrphanPages > 5
            ? [`   • ...and ${technicalIssues.trueOrphanPages - 5} more orphan pages`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Add internal links immediately:',
          '   • Add links from 3-5 relevant pages',
          '   • Use descriptive anchor text with keywords',
          '   • Place links in contextual content (not just footers)',
          '   • Ensure links are visible and clickable',
          '',
          '2️⃣ Add to navigation structure:',
          '   • Main navigation menu (for important pages)',
          '   • Category/section pages (for content pages)',
          '   • Related posts sections',
          '   • Footer or sidebar menus',
          '',
          '3️⃣ OR consider deletion:',
          '   • If page is low-quality or outdated, delete it',
          '   • If not valuable, set to noindex or remove',
          '   • Only keep pages that serve a purpose',
          '',
          '✅ TARGET: 0 orphan pages - every page should have 3+ incoming links',
          '',
          '💡 This is the most severe internal linking issue - fix immediately!'
        ]
      });
    }

    // Pages with Broken Internal Links
    if (technicalIssues?.pagesWithBrokenLinks && technicalIssues.pagesWithBrokenLinks > 0) {
      techRecs.push({
        title: 'Fix Broken Internal Links',
        description: `${technicalIssues.pagesWithBrokenLinks} page(s) contain broken internal links. Broken links hurt user experience and waste link equity by pointing to non-existent pages.`,
        impact: 'High',
        effort: 'Medium',
        icon: <AlertTriangle className="w-4 h-4" />,
        details: 'Broken internal links (404 errors) create a poor user experience and waste the SEO value of internal linking. Search engines see broken links as a sign of poor site maintenance. Fix or remove all broken internal links.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS MATTERS:',
          '   • Broken links frustrate users and increase bounce rate',
          '   • Wastes link equity on non-existent pages',
          '   • Search engines see broken links as poor site quality',
          '   • Hurts crawl efficiency and indexing',
          '   • May impact overall site rankings',
          '',
          '📋 PAGES WITH BROKEN INTERNAL LINKS:',
          ...(technicalAudit?.internalLinkAnalysis?.pagesWithBrokenLinks?.slice(0, 5).map(item => {
            const urlPath = item.url.replace(/^https?:\/\/[^/]+/, '') || '/';
            const brokenExample = item.brokenLinks[0];
            const brokenPath = brokenExample?.targetUrl.replace(/^https?:\/\/[^/]+/, '') || '';
            return `   • ${urlPath} → has ${item.brokenLinkCount} broken link(s) (e.g., ${brokenPath})`;
          }) || []),
          ...(technicalIssues.pagesWithBrokenLinks && technicalIssues.pagesWithBrokenLinks > 5
            ? [`   • ...and ${technicalIssues.pagesWithBrokenLinks - 5} more pages with broken links`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Update links to correct URLs:',
          '   • Find the correct destination page',
          '   • Update the href to the working URL',
          '   • Test the link after updating',
          '',
          '2️⃣ Restore deleted pages:',
          '   • If content was accidentally deleted, restore it',
          '   • Or create a new page at the expected URL',
          '',
          '3️⃣ Remove broken links:',
          '   • If target page is gone permanently, remove the link',
          '   • Update content to remove references',
          '',
          '4️⃣ Add redirects:',
          '   • Set up 301 redirects from old URLs to new ones',
          '   • Then update internal links to point directly to new URLs',
          '',
          '✅ TARGET: 0 broken internal links',
          '',
          '💡 Use browser dev tools or link checker tools to find all broken links'
        ]
      });
    }

    // Pages with Nofollow Internal Links
    if (technicalIssues?.pagesWithNofollowLinks && technicalIssues.pagesWithNofollowLinks > 0) {
      techRecs.push({
        title: 'Remove Nofollow from Internal Links',
        description: `${technicalIssues.pagesWithNofollowLinks} page(s) have internal links with rel="nofollow". Nofollow on internal links prevents link equity distribution and can harm SEO.`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Using rel="nofollow" on internal links tells search engines not to follow or pass authority through those links. This wastes link equity and can hurt the rankings of important pages. Nofollow should only be used for external links to untrusted sites, never for internal links.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS MATTERS:',
          '   • Nofollow prevents link equity from flowing to target pages',
          '   • Wastes the SEO value of internal linking',
          '   • Can cause important pages to not rank well',
          '   • Search engines may not discover/crawl nofollowed pages',
          '   • Signals you don\'t trust your own content',
          '',
          '📋 PAGES WITH NOFOLLOW INTERNAL LINKS:',
          ...(technicalAudit?.internalLinkAnalysis?.pagesWithNofollowLinks?.slice(0, 5).map(item => {
            const urlPath = item.url.replace(/^https?:\/\/[^/]+/, '') || '/';
            const nofollowExample = item.nofollowLinks[0];
            const nofollowPath = nofollowExample?.targetUrl.replace(/^https?:\/\/[^/]+/, '') || '';
            return `   • ${urlPath} → has ${item.nofollowLinkCount} nofollow link(s) (e.g., to ${nofollowPath})`;
          }) || []),
          ...(technicalIssues.pagesWithNofollowLinks && technicalIssues.pagesWithNofollowLinks > 5
            ? [`   • ...and ${technicalIssues.pagesWithNofollowLinks - 5} more pages`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Remove rel="nofollow" from internal links:',
          '   • Find links with rel="nofollow" in your HTML',
          '   • Remove the rel attribute or change to rel="dofollow"',
          '   • Or simply remove rel entirely for internal links',
          '',
          '2️⃣ Check your CMS/theme settings:',
          '   • Some plugins add nofollow automatically',
          '   • Review plugin settings and disable nofollow for internal links',
          '   • Check theme options for link settings',
          '',
          '3️⃣ For WordPress:',
          '   • Edit page/post → Find links in editor',
          '   • Click link → Advanced → Remove "nofollow"',
          '   • Check plugins like Yoast SEO for global settings',
          '',
          '✅ BEST PRACTICE: Never use nofollow on internal links',
          '   • Only use nofollow for external links to untrusted sites',
          '   • All internal links should pass link equity',
          '',
          '💡 Removing nofollow can significantly improve internal page rankings'
        ]
      });
    }

    // Pages Deep in Site Structure
    if (technicalIssues?.pagesDeepInSite && technicalIssues.pagesDeepInSite > 0) {
      techRecs.push({
        title: 'Reduce Link Depth',
        description: `${technicalIssues.pagesDeepInSite} page(s) are buried deep in your site (4+ clicks from homepage). Pages deep in site structure receive less authority and may not be crawled efficiently.`,
        impact: 'Medium',
        effort: 'Medium',
        icon: <Code className="w-4 h-4" />,
        details: 'Link depth measures how many clicks it takes to reach a page from the homepage. Pages 4+ clicks deep receive significantly less link equity and may be crawled less frequently by search engines. Best practice is to keep important pages within 3 clicks of the homepage.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS MATTERS:',
          '   • Pages far from homepage receive less link authority',
          '   • Search engines may crawl deep pages less frequently',
          '   • Users are unlikely to navigate 4+ levels deep',
          '   • Deep pages often don\'t rank as well',
          '   • Indicates poor site architecture',
          '',
          '📋 PAGES DEEP IN SITE (4+ CLICKS FROM HOMEPAGE):',
          ...(technicalAudit?.internalLinkAnalysis?.linkDepthAnalysis?.pagesDeepInSite?.slice(0, 5).map(item => {
            const urlPath = item.url.replace(/^https?:\/\/[^/]+/, '') || '/';
            return `   • ${urlPath} (${item.depth} clicks from homepage)`;
          }) || []),
          ...(technicalIssues.pagesDeepInSite && technicalIssues.pagesDeepInSite > 5
            ? [`   • ...and ${technicalIssues.pagesDeepInSite - 5} more deep pages`]
            : []),
          ...(technicalAudit?.internalLinkAnalysis?.linkDepthAnalysis?.averageDepth
            ? [`   • Average depth: ${technicalAudit.internalLinkAnalysis.linkDepthAnalysis.averageDepth.toFixed(1)} clicks`]
            : []),
          ...(technicalAudit?.internalLinkAnalysis?.linkDepthAnalysis?.maxDepth
            ? [`   • Maximum depth: ${technicalAudit.internalLinkAnalysis.linkDepthAnalysis.maxDepth} clicks`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Add direct links from homepage:',
          '   • Add important pages to main navigation',
          '   • Create featured sections on homepage',
          '   • Add to homepage sidebar or footer',
          '',
          '2️⃣ Create hub/pillar pages:',
          '   • Build category landing pages linked from homepage',
          '   • Link from these hub pages to deep content',
          '   • Reduces effective depth by creating shortcuts',
          '',
          '3️⃣ Improve internal linking:',
          '   • Add more cross-links between related pages',
          '   • Create breadcrumb navigation',
          '   • Add "related content" sections',
          '',
          '4️⃣ Flatten site architecture:',
          '   • Reduce category nesting levels',
          '   • Move important content closer to homepage',
          '   • Simplify navigation structure',
          '',
          '✅ TARGET: All important pages within 3 clicks of homepage',
          '',
          '💡 Flat site architecture = better SEO and user experience'
        ]
      });
    }

    // Generic Anchor Text
    if (technicalIssues?.genericAnchors && technicalIssues.genericAnchors > 0) {
      techRecs.push({
        title: 'Improve Anchor Text',
        description: `${technicalIssues.genericAnchors} internal link(s) use generic anchor text like "click here" or "read more". Descriptive anchor text improves SEO and user experience.`,
        impact: 'Low',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Generic anchor text like "click here", "read more", or "learn more" provides no context to users or search engines about the linked content. Descriptive anchor text helps SEO by including relevant keywords and helps users understand where the link leads.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS MATTERS:',
          '   • Search engines use anchor text to understand linked content',
          '   • Descriptive anchors help pages rank for target keywords',
          '   • Improves accessibility for screen readers',
          '   • Users know what to expect before clicking',
          '   • Generic anchors waste SEO opportunity',
          '',
          '📋 GENERIC ANCHOR TEXT EXAMPLES:',
          ...(technicalAudit?.internalLinkAnalysis?.anchorTextAnalysis?.genericAnchors?.slice(0, 5).map(item => {
            const urlPath = item.url.replace(/^https?:\/\/[^/]+/, '') || '/';
            return `   • "${item.anchorText}" → ${urlPath} (used ${item.count}x)`;
          }) || []),
          ...(technicalIssues.genericAnchors && technicalIssues.genericAnchors > 5
            ? [`   • ...and ${technicalIssues.genericAnchors - 5} more generic anchors`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Replace generic text with descriptive keywords:',
          '   • Instead of "click here" → "view our pricing plans"',
          '   • Instead of "read more" → "learn about technical SEO"',
          '   • Instead of "learn more" → "explore our portfolio"',
          '   • Include target keywords naturally',
          '',
          '2️⃣ Be specific and contextual:',
          '   • Describe what the user will find',
          '   • Use action words + topic keywords',
          '   • Keep it concise (3-6 words ideal)',
          '',
          '3️⃣ For WordPress:',
          '   • Edit post/page → Select link text',
          '   • Replace with descriptive text',
          '   • Keep link URL the same',
          '',
          '✅ BEST PRACTICES:',
          '   • Use descriptive keywords (but don\'t over-optimize)',
          '   • Make anchor text relevant to target page',
          '   • Vary anchor text (don\'t use same text everywhere)',
          '   • Keep it natural and readable',
          '',
          '❌ AVOID:',
          '   • "Click here", "Read more", "Learn more"',
          '   • "This page", "This link"',
          '   • Naked URLs (https://example.com)',
          '   • Generic phrases with no context',
          '',
          '💡 Descriptive anchor text is a simple SEO win with big impact'
        ]
      });
    }

    // Poor Deep Link Ratio
    if (technicalIssues?.poorDeepLinkRatio && technicalIssues.poorDeepLinkRatio > 0) {
      techRecs.push({
        title: 'Improve Deep Link Ratio',
        description: `Your site has a poor deep link ratio (${technicalAudit?.internalLinkAnalysis?.deepLinkRatio?.ratio ? (technicalAudit.internalLinkAnalysis.deepLinkRatio.ratio * 100).toFixed(1) : '?'}% to deep content). Too many links go to the homepage instead of valuable inner pages.`,
        impact: 'Medium',
        effort: 'Medium',
        icon: <Code className="w-4 h-4" />,
        details: 'Deep link ratio measures the percentage of internal links pointing to inner pages vs. the homepage. A healthy site should have 60%+ of internal links pointing to deep content. Over-linking to the homepage wastes link equity and doesn\'t help inner pages rank.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS MATTERS:',
          '   • Inner pages need link equity to rank well',
          '   • Over-linking to homepage concentrates authority unnecessarily',
          '   • Homepage already has natural authority from external links',
          '   • Deep linking distributes SEO value throughout site',
          '   • Shows search engines you have valuable content beyond homepage',
          '',
          '📊 YOUR DEEP LINK RATIO:',
          ...(technicalAudit?.internalLinkAnalysis?.deepLinkRatio ? [
            `   • Homepage links: ${technicalAudit.internalLinkAnalysis.deepLinkRatio.homepageLinks}`,
            `   • Deep content links: ${technicalAudit.internalLinkAnalysis.deepLinkRatio.deepContentLinks}`,
            `   • Deep link ratio: ${(technicalAudit.internalLinkAnalysis.deepLinkRatio.ratio * 100).toFixed(1)}%`,
            `   • TARGET: ≥60% deep links`
          ] : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Replace homepage links with deep links:',
          '   • Review navigation menus',
          '   • Instead of linking logo to homepage in every page, link contextually',
          '   • Link to specific category/product pages instead of homepage',
          '',
          '2️⃣ Add more contextual internal links:',
          '   • Link to relevant blog posts within content',
          '   • Add "Related Articles" sections',
          '   • Create resource hubs linking to deep content',
          '   • Add category pages with links to articles',
          '',
          '3️⃣ Reduce unnecessary homepage links:',
          '   • Don\'t link "Home" in every navigation element',
          '   • Remove redundant homepage links from content',
          '   • One homepage link per page is enough (usually logo)',
          '',
          '4️⃣ Create internal linking strategy:',
          '   • Link from high-authority pages to newer content',
          '   • Build content clusters with hub pages',
          '   • Add breadcrumb navigation',
          '   • Use footer to link to key inner pages',
          '',
          '✅ TARGET: 60-80% of internal links should point to deep content',
          '',
          '💡 Deep linking is how you distribute SEO value across your entire site'
        ]
      });
    }

    // Permanent Redirects (301/308)
    if (technicalIssues?.permanentRedirects && technicalIssues.permanentRedirects > 0) {
      techRecs.push({
        title: 'Fix Permanent Redirects',
        description: `${technicalIssues.permanentRedirects} URL(s) have permanent redirects (301/308). Internal links pointing to redirected URLs waste link equity and slow down page loads with extra HTTP requests.`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <Code className="w-4 h-4" />,
        details: 'Permanent redirects (301/308) are often necessary when URLs change, but internal links should point directly to the final destination. Each redirect adds latency and dilutes link equity. Update internal links to point directly to the target URL.',
        useCase: 'internal-linking',
        howTo: [
          '🎯 WHY THIS MATTERS:',
          '   • Each redirect adds 200-500ms of latency',
          '   • Search engines pass less "link juice" through redirects',
          '   • Users experience slower page loads',
          '   • Increases server load with extra HTTP requests',
          '   • May impact SEO rankings due to redirect chains',
          '',
          '📋 URLS WITH PERMANENT REDIRECTS:',
          ...(technicalAudit?.permanentRedirects?.redirects?.slice(0, 5).map(item => {
            // Extract just the path for cleaner display
            const fromPath = item.fromUrl.replace(/^https?:\/\/[^/]+/, '') || '/';
            const toPath = item.toUrl.replace(/^https?:\/\/[^/]+/, '') || '/';
            return `   • ${fromPath} → ${toPath} (${item.statusCode})`;
          }) || []),
          ...(technicalIssues.permanentRedirects && technicalIssues.permanentRedirects > 5
            ? [`   • ...and ${technicalIssues.permanentRedirects - 5} more redirects`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ Update internal links:',
          '   • Find pages linking to the old URL',
          '   • Update links to point directly to the final destination',
          '   • Search your site for the old URL and replace all occurrences',
          '   • Update navigation menus, sidebars, footers',
          '',
          '2️⃣ For WordPress:',
          '   • Use "Better Search Replace" plugin to update links in database',
          '   • Update menu items in Appearance → Menus',
          '   • Check widgets in Appearance → Widgets',
          '   • Update links in page/post content',
          '   • Use Yoast/Rank Math to find internal links to old URLs',
          '',
          '3️⃣ For static sites:',
          '   • Search your codebase for the old URL',
          '   • Update all references in HTML/templates',
          '   • Update navigation components',
          '   • Rebuild and redeploy',
          '',
          '4️⃣ Keep redirects for external links:',
          '   • DO NOT remove the redirect itself',
          '   • Redirects are still needed for external links and bookmarks',
          '   • Only update YOUR OWN internal links',
          '',
          '5️⃣ Check for redirect chains:',
          '   • Ensure redirects go directly to final destination',
          '   • Avoid: A → B → C (redirect chain)',
          '   • Instead: A → C and B → C (direct redirects)',
          '',
          '✅ BEST PRACTICES:',
          '   • All internal links should point to final URLs (no redirects)',
          '   • Keep 301 redirects in place for SEO and external links',
          '   • Use 301 (permanent) not 302 (temporary) for moved content',
          '   • Monitor redirect chains - eliminate any multi-hop redirects',
          '   • Update sitemap.xml to use final URLs only',
          '',
          '📊 TARGET:',
          '   • 0 internal links pointing to redirected URLs',
          '   • All sitemaps use final destination URLs',
          '   • No redirect chains (A → B → C)',
          '   • Max 1 redirect for any URL (A → B)',
          '',
          '💡 IMPORTANT: Keep the redirects themselves (for external links)',
          '💡 Only update YOUR internal links to skip the redirect',
          '💡 After fixing, re-run audit to verify improvements'
        ]
      });
    }

    // Subdomains Without HSTS
    if (technicalIssues?.subdomainsWithoutHSTS && technicalIssues.subdomainsWithoutHSTS > 0) {
      techRecs.push({
        title: 'Enable HSTS on Subdomains',
        description: `${technicalIssues.subdomainsWithoutHSTS} subdomain(s) don't support HSTS (HTTP Strict Transport Security). This leaves subdomains vulnerable to SSL stripping attacks and man-in-the-middle attacks.`,
        impact: 'High',
        effort: 'Medium',
        icon: <AlertTriangle className="w-4 h-4" />,
        details: 'HSTS (HTTP Strict Transport Security) tells browsers to only access your site over HTTPS, preventing SSL stripping attacks. Subdomains without HSTS can be exploited even if your main domain is secure. Fix this by adding HSTS headers on subdomains or using includeSubDomains directive on main domain.',
        useCase: 'security',
        howTo: [
          '🎯 WHY THIS IS CRITICAL:',
          '   • Prevents SSL stripping attacks (downgrade to HTTP)',
          '   • Stops man-in-the-middle attacks on subdomains',
          '   • Required for PCI-DSS compliance',
          '   • Improves SEO rankings (Google favors secure sites)',
          '   • Protects user cookies and session data',
          '',
          '📋 SUBDOMAINS WITHOUT HSTS:',
          ...(technicalAudit?.hstsAnalysis?.subdomainsWithoutHSTS?.slice(0, 5).map(item =>
            `   • ${item.subdomain} - ${item.reason}`
          ) || []),
          ...(technicalIssues.subdomainsWithoutHSTS && technicalIssues.subdomainsWithoutHSTS > 5
            ? [`   • ...and ${technicalIssues.subdomainsWithoutHSTS - 5} more subdomains`]
            : []),
          '',
          '✏️ HOW TO FIX:',
          '',
          '1️⃣ EASIEST: Add includeSubDomains on main domain:',
          '   • Add this HTTP header on your main domain:',
          '   • Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
          '   • This automatically protects ALL subdomains',
          '   • No need to configure each subdomain individually',
          '',
          '2️⃣ For Apache (.htaccess or httpd.conf):',
          '   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
          '',
          '3️⃣ For Nginx:',
          '   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
          '',
          '4️⃣ For Cloudflare:',
          '   • Go to SSL/TLS → Edge Certificates',
          '   • Enable "HTTP Strict Transport Security (HSTS)"',
          '   • Check "Include subdomains"',
          '   • Set Max Age to 12 months',
          '',
          '5️⃣ For WordPress:',
          '   • Add to wp-config.php (before "That\'s all, stop editing!"):',
          '   • header(\'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\');',
          '   • Or use "Really Simple SSL" plugin (Pro version)',
          '',
          '6️⃣ For Next.js/Vercel:',
          '   • Add to next.config.js headers:',
          '   • { key: \'Strict-Transport-Security\', value: \'max-age=31536000; includeSubDomains; preload\' }',
          '',
          '⚠️ IMPORTANT CONSIDERATIONS:',
          '   • Test on staging first - HSTS can break non-HTTPS content',
          '   • Ensure ALL subdomains support HTTPS before enabling',
          '   • includeSubDomains affects www, api, cdn, etc.',
          '   • Start with shorter max-age (e.g., 300) for testing',
          '   • Increase to 31536000 (1 year) after testing',
          '',
          '✅ BEST PRACTICES:',
          '   • Always use includeSubDomains on main domain',
          '   • Use preload directive to get on Chrome\'s HSTS preload list',
          '   • Set max-age to at least 31536000 (1 year)',
          '   • Ensure HTTPS works on ALL subdomains first',
          '   • Submit to https://hstspreload.org/ after enabling',
          '',
          '📊 TARGET:',
          '   • Main domain: HSTS with includeSubDomains enabled',
          '   • All subdomains: Protected by main domain\'s HSTS',
          '   • Max-age: 31536000 (1 year) or higher',
          '   • Preload list: Submitted to hstspreload.org',
          '',
          '💡 CRITICAL: Use includeSubDomains on main domain to protect all subdomains',
          '💡 Test thoroughly - HSTS cannot be easily disabled once set',
          '💡 After fixing, re-run audit to verify HSTS is working'
        ]
      });
    }

    // Missing llms.txt
    if (technicalIssues?.missingLlmsTxt && technicalIssues.missingLlmsTxt > 0) {
      techRecs.push({
        title: 'Add llms.txt File',
        description: `Your website doesn't have an llms.txt file. This file helps AI assistants and LLMs understand your website better, improving how they represent and recommend your content.`,
        impact: 'Low',
        effort: 'Easy',
        icon: <FileText className="w-4 h-4" />,
        details: 'llms.txt is a new standard (similar to robots.txt) that provides context to AI assistants about your website. It helps LLMs like ChatGPT, Claude, and others understand what your site is about, improving how they cite and recommend your content in AI-generated responses.',
        useCase: 'seo',
        howTo: [
          '🎯 WHY ADD LLMS.TXT:',
          '   • Helps AI assistants understand your website accurately',
          '   • Improves how LLMs cite and recommend your content',
          '   • Controls what information AI models prioritize',
          '   • Future-proofs your site for AI-driven search',
          '   • Emerging standard backed by major AI companies',
          '',
          '📋 WHAT TO INCLUDE:',
          '   • Website name and primary purpose',
          '   • Key products, services, or topics',
          '   • Target audience',
          '   • Important pages and their context',
          '   • Sitemap or main navigation structure',
          '   • Contact information',
          '   • Any context that helps LLMs understand your site',
          '',
          '✏️ HOW TO CREATE:',
          '',
          '1️⃣ Create a file named "llms.txt" in your website root:',
          '   • File location: https://yourdomain.com/llms.txt',
          '   • Must be plain text (not HTML)',
          '   • Use Markdown format for structure',
          '',
          '2️⃣ Basic llms.txt template:',
          '   # [Your Website Name]',
          '   ',
          '   > [Brief description of what your site does]',
          '   ',
          '   ## About',
          '   [Your company/organization description]',
          '   ',
          '   ## Products/Services',
          '   - [Product 1]: [Description]',
          '   - [Product 2]: [Description]',
          '   ',
          '   ## Key Pages',
          '   - [Page URL]: [What this page is about]',
          '   ',
          '   ## Target Audience',
          '   [Who your site is for]',
          '',
          '3️⃣ For WordPress:',
          '   • Create llms.txt file in your text editor',
          '   • Upload via FTP/cPanel to website root (same level as wp-config.php)',
          '   • Or use File Manager in hosting control panel',
          '   • Ensure it\'s accessible at https://yoursite.com/llms.txt',
          '',
          '4️⃣ For Next.js/Vercel:',
          '   • Add llms.txt to /public folder',
          '   • Deploy - it will be accessible at root',
          '',
          '5️⃣ For static sites:',
          '   • Add llms.txt to root directory',
          '   • Commit and deploy',
          '',
          '6️⃣ For Apache/Nginx:',
          '   • Upload llms.txt to document root (usually /var/www/html or public_html)',
          '   • Ensure proper permissions (644)',
          '',
          '✅ EXAMPLE llms.txt:',
          '   # Web Audit Pro',
          '   ',
          '   > Professional SEO and technical website auditing tool',
          '   ',
          '   ## About',
          '   Web Audit Pro helps businesses analyze and improve their',
          '   website\'s SEO, performance, and technical health.',
          '   ',
          '   ## Features',
          '   - Technical SEO audits',
          '   - Performance analysis',
          '   - Keyword research',
          '   - Competitor analysis',
          '   ',
          '   ## Target Audience',
          '   SEO professionals, digital marketers, web developers',
          '',
          '📊 BEST PRACTICES:',
          '   • Keep it concise but informative (200-500 words)',
          '   • Use Markdown for formatting',
          '   • Update when major site changes happen',
          '   • Include your most important pages',
          '   • Be factual and accurate',
          '   • Don\'t stuff with keywords',
          '',
          '🔗 RESOURCES:',
          '   • Official standard: https://llmstxt.org/',
          '   • Examples: https://github.com/topics/llms-txt',
          '',
          '💡 This is a NEW standard (2024) - early adoption gives you an advantage',
          '💡 Takes only 10-15 minutes to create',
          '💡 After adding, verify at https://yourdomain.com/llms.txt'
        ]
      });
    }

    // Missing robots.txt
    if (technicalIssues?.missingRobotsTxt && technicalIssues.missingRobotsTxt > 0) {
      // Detect CMS and SEO plugins for contextual instructions
      const isWordPress = cms === 'WordPress';
      const detectedSEOPlugin = detectedPlugins?.find(plugin =>
        plugin.toLowerCase().includes('yoast') ||
        plugin.toLowerCase().includes('rank math') ||
        plugin.toLowerCase().includes('seopress')
      );

      // Build contextual description
      let contextualDesc = `Your website doesn't have a robots.txt file. `;
      if (isWordPress && detectedSEOPlugin) {
        contextualDesc += `Since you're using WordPress with ${detectedSEOPlugin}, you can easily create one using the plugin's built-in tools.`;
      } else if (isWordPress) {
        contextualDesc += `Since you're using WordPress, you can create one via an SEO plugin or manually.`;
      } else {
        contextualDesc += `This file is essential for controlling how search engines crawl and index your website.`;
      }

      // Build contextual how-to steps
      const howToSteps: string[] = [
        '🎯 WHY ROBOTS.TXT IS CRITICAL:',
        'Controls which pages search engines can crawl',
        'Prevents indexing of admin pages, staging sites, duplicate content',
        'Optimizes crawl budget for important pages',
        'Blocks bad bots from wasting server resources',
        'Points search engines to your sitemap.xml',
        'Industry standard since 1994 - expected by all search engines',
        ''
      ];

      if (isWordPress) {
        howToSteps.push(
          `✏️ HOW TO ADD ROBOTS.TXT TO YOUR WORDPRESS SITE:`,
          ''
        );

        // Add plugin-specific instructions if detected
        if (detectedSEOPlugin?.toLowerCase().includes('yoast')) {
          howToSteps.push(
            `📌 USING ${detectedSEOPlugin.toUpperCase()} (DETECTED ON YOUR SITE):`,
            '',
            '1️⃣ Log into your WordPress admin dashboard',
            '2️⃣ Navigate to: SEO → Tools → File Editor',
            '3️⃣ Click on "Create robots.txt file" button',
            '4️⃣ Add the recommended rules below',
            '5️⃣ Click "Save changes to robots.txt"',
            ''
          );
        } else if (detectedSEOPlugin?.toLowerCase().includes('rank math')) {
          howToSteps.push(
            `📌 USING ${detectedSEOPlugin.toUpperCase()} (DETECTED ON YOUR SITE):`,
            '',
            '1️⃣ Log into your WordPress admin dashboard',
            '2️⃣ Navigate to: Rank Math → General Settings → Edit robots.txt',
            '3️⃣ Add the recommended rules below',
            '4️⃣ Click "Save Changes"',
            ''
          );
        } else if (detectedSEOPlugin?.toLowerCase().includes('seopress')) {
          howToSteps.push(
            `📌 USING ${detectedSEOPlugin.toUpperCase()} (DETECTED ON YOUR SITE):`,
            '',
            '1️⃣ Log into your WordPress admin dashboard',
            '2️⃣ Navigate to: SEOPress → PRO → Advanced',
            '3️⃣ Scroll down to the "robots.txt" section',
            '4️⃣ Enable "Customize your robots.txt file"',
            '5️⃣ Add the recommended rules below in the text area',
            '6️⃣ Click "Save Changes"',
            ''
          );
        } else {
          howToSteps.push(
            '📌 RECOMMENDED: INSTALL AN SEO PLUGIN:',
            'Yoast SEO (most popular)',
            'Rank Math (feature-rich)',
            'SEOPress (lightweight)',
            '',
            'After installing, use the plugin\'s robots.txt editor (much easier than manual FTP)',
            ''
          );
        }

        howToSteps.push(
          '📋 RECOMMENDED WORDPRESS ROBOTS.TXT:',
          '',
          'User-agent: *',
          'Disallow: /wp-admin/',
          'Allow: /wp-admin/admin-ajax.php',
          'Disallow: /wp-includes/',
          'Disallow: /wp-content/plugins/',
          'Disallow: /wp-content/themes/',
          'Disallow: /readme.html',
          'Disallow: /license.txt',
          '',
          '# Point to your sitemap (auto-generated by your SEO plugin)',
          'Sitemap: https://yourdomain.com/sitemap_index.xml',
          ''
        );

        // Add e-commerce specific rules if WooCommerce detected
        if (detectedPlugins?.some(p => p.toLowerCase().includes('woocommerce'))) {
          howToSteps.push(
            '🛒 ADDITIONAL WOOCOMMERCE RULES (DETECTED ON YOUR SITE):',
            'Add these lines to block cart and checkout pages:',
            '',
            'Disallow: /cart/',
            'Disallow: /checkout/',
            'Disallow: /my-account/',
            'Disallow: /*?add-to-cart=',
            'Disallow: /*?removed_item',
            ''
          );
        }

        howToSteps.push(
          '⚠️ ALTERNATIVE: MANUAL FTP UPLOAD (if no SEO plugin):',
          '1. Create a text file named "robots.txt"',
          '2. Add the WordPress template above',
          '3. Upload via FTP to your website root directory',
          '4. Ensure file permissions are set to 644',
          ''
        );
      } else {
        // Non-WordPress instructions
        howToSteps.push(
          '✏️ HOW TO CREATE ROBOTS.TXT:',
          '',
          '1️⃣ Create a file named "robots.txt" in your website root:',
          'File location: https://yourdomain.com/robots.txt',
          'Must be plain text (not HTML)',
          'Case-sensitive filename: robots.txt (all lowercase)',
          '',
          '2️⃣ Basic robots.txt template:',
          'User-agent: *',
          'Disallow:',
          '',
          '# Point to sitemap',
          'Sitemap: https://yourdomain.com/sitemap.xml',
          '',
          '3️⃣ Upload to your web server:',
          'Via FTP/SFTP to document root',
          'Or through your hosting control panel',
          'Ensure proper permissions (644)',
          ''
        );
      }

      howToSteps.push(
        '⚠️ COMMON MISTAKES TO AVOID:',
        'DON\'T block your entire site: Disallow: / (unless intentional)',
        'DON\'T use robots.txt for security (it\'s public and not enforced)',
        'DON\'T block CSS/JS files (hurts Google\'s ability to render pages)',
        'DON\'T list sensitive URLs (robots.txt is publicly visible)',
        'DON\'T forget the Sitemap directive',
        '',
        '📊 TESTING:',
        'Visit https://yourdomain.com/robots.txt directly to verify',
        'Test with Google Search Console → robots.txt Tester',
        'Use online robots.txt validators',
        '',
        '💡 CRITICAL: This is one of the most important SEO files',
        '💡 Takes only 5 minutes to create',
        isWordPress && detectedSEOPlugin
          ? `💡 You already have ${detectedSEOPlugin} - use its built-in editor!`
          : '💡 After adding, test at https://yourdomain.com/robots.txt'
      );

      techRecs.push({
        title: 'Add robots.txt File',
        description: contextualDesc,
        impact: 'High',
        effort: 'Easy',
        icon: <Server className="w-4 h-4" />,
        details: 'robots.txt is a critical SEO file that tells search engines which pages to crawl and index. Missing robots.txt can result in inefficient crawling, wasted crawl budget, and potential indexing of pages you want to keep private (like admin areas, staging sites, or duplicate content).',
        useCase: 'seo',
        howTo: howToSteps
      });
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

    // Unminified JavaScript and CSS Files
    if (technicalIssues?.unminifiedFiles && technicalIssues.unminifiedFiles > 0) {
      const jsCount = technicalAudit?.unminifiedFiles?.javascriptFiles?.length || 0;
      const cssCount = technicalAudit?.unminifiedFiles?.cssFiles?.length || 0;

      techRecs.push({
        title: 'Minify JavaScript and CSS Files',
        description: `${technicalIssues.unminifiedFiles} unminified file(s) detected (${jsCount} JavaScript, ${cssCount} CSS). Minification removes whitespace and comments, reducing file sizes by 20-40%.`,
        impact: 'Medium',
        effort: 'Easy',
        icon: <FileCode className="w-4 h-4" />,
        details: 'Unminified files contain unnecessary whitespace, comments, and formatting that increase file sizes and slow down page loads. Minification removes these, significantly improving load times and reducing bandwidth usage.',
        useCase: 'file-minification',
        howTo: cms === 'WordPress' ? [
          '🎯 RECOMMENDED SOLUTION (Easiest):',
          'Use a performance plugin to automatically minify files.',
          '',
          '✅ BEST PLUGINS FOR MINIFICATION:',
          '',
          '1️⃣ WP Rocket (Premium - £49/year):',
          '   • Go to Settings → File Optimization',
          '   • Enable "Minify CSS files"',
          '   • Enable "Minify JavaScript files"',
          '   • Enable "Combine CSS files" (optional)',
          '   • Enable "Combine JavaScript files" (optional)',
          '   • Files are automatically minified',
          '',
          '2️⃣ Autoptimize (Free):',
          '   • Go to Settings → Autoptimize',
          '   • Enable "Optimize JavaScript Code"',
          '   • Enable "Optimize CSS Code"',
          '   • Enable "Optimize HTML Code"',
          '   • Click "Save Changes and Empty Cache"',
          '',
          '3️⃣ W3 Total Cache (Free):',
          '   • Go to Performance → Minify',
          '   • Enable minify',
          '   • Select "Minify" mode',
          '   • Enable JS and CSS minification',
          '',
          '⚙️ ALTERNATIVE - Build Process:',
          'If you\'re using a custom theme or plugin development:',
          '   • Use a build tool like Webpack, Gulp, or Vite',
          '   • Configure minification in your build process',
          '   • Example tools: Terser (JS), cssnano (CSS)',
          '',
          '📋 FILES TO MINIFY:',
          ...(jsCount > 0 ? [`   JavaScript files (${jsCount}):`] : []),
          ...(technicalAudit?.unminifiedFiles?.javascriptFiles?.slice(0, 5).map(f =>
            `   • ${f.url.split('/').pop()}`
          ) || []),
          ...(jsCount > 5 ? [`   • ...and ${jsCount - 5} more`] : []),
          ...(cssCount > 0 ? ['', `   CSS files (${cssCount}):`] : []),
          ...(technicalAudit?.unminifiedFiles?.cssFiles?.slice(0, 5).map(f =>
            `   • ${f.url.split('/').pop()}`
          ) || []),
          ...(cssCount > 5 ? [`   • ...and ${cssCount - 5} more`] : []),
          '',
          '✅ EXPECTED RESULTS:',
          '   • 20-40% reduction in JavaScript file sizes',
          '   • 15-30% reduction in CSS file sizes',
          '   • Faster page load times',
          '   • Reduced bandwidth usage',
          '',
          '⚠️ IMPORTANT:',
          '   • Test your site after enabling minification',
          '   • Some plugins may conflict - disable if issues occur',
          '   • Use "Combine files" carefully - can break some sites',
          '',
          '💡 After minification, re-run the audit to verify improvements'
        ] : [
          '🎯 SOLUTION - Use Build Tools:',
          'Minify files during your build process before deployment.',
          '',
          '🛠️ RECOMMENDED TOOLS:',
          '',
          'For JavaScript:',
          '   • Terser - Modern ES6+ minifier',
          '   • UglifyJS - Classic minifier',
          '   • esbuild - Extremely fast bundler & minifier',
          '',
          'For CSS:',
          '   • cssnano - PostCSS-based minifier',
          '   • clean-css - Fast and efficient',
          '   • Lightning CSS - Modern CSS minifier',
          '',
          'Build Systems (All-in-one):',
          '   • Webpack - Add TerserPlugin and CssMinimizerPlugin',
          '   • Vite - Minification built-in for production',
          '   • Parcel - Zero-config minification',
          '   • Rollup - With terser and cssnano plugins',
          '',
          '📋 FILES DETECTED:',
          ...(jsCount > 0 ? [`   JavaScript (${jsCount} files):`] : []),
          ...(technicalAudit?.unminifiedFiles?.javascriptFiles?.slice(0, 5).map(f =>
            `   • ${f.url}`
          ) || []),
          ...(jsCount > 5 ? [`   • ...and ${jsCount - 5} more`] : []),
          ...(cssCount > 0 ? ['', `   CSS (${cssCount} files):`] : []),
          ...(technicalAudit?.unminifiedFiles?.cssFiles?.slice(0, 5).map(f =>
            `   • ${f.url}`
          ) || []),
          ...(cssCount > 5 ? [`   • ...and ${cssCount - 5} more`] : []),
          '',
          '✅ EXPECTED RESULTS:',
          '   • 20-40% smaller JavaScript files',
          '   • 15-30% smaller CSS files',
          '   • Faster page loads',
          '',
          '💡 For Shopify: Use theme compilation tools',
          '💡 For custom sites: Integrate minification in CI/CD pipeline'
        ]
      });
    }

    // Invalid Structured Data
    if (technicalIssues?.invalidStructuredData && technicalIssues.invalidStructuredData > 0) {
      const hasRankMath = detectedPlugins.some(p => p.toLowerCase().includes('rank math'))
      const hasYoast = detectedPlugins.some(p => p.toLowerCase().includes('yoast'))
      const hasSchemaPlugin = detectedPlugins.some(p =>
        p.toLowerCase().includes('schema') ||
        p.toLowerCase().includes('rank math') ||
        p.toLowerCase().includes('yoast')
      )

      const wordpressSteps = hasSchemaPlugin ? [
        '✅ Good news! You have a schema plugin installed',
        '1. Review the structured data errors in the table below',
        '2. Use Google Rich Results Test to identify specific issues:',
        '   • Visit: https://search.google.com/test/rich-results',
        '   • Enter your URL or paste the schema markup',
        '   • Review validation errors and warnings',
        '',
        '🔧 FIXING SCHEMA ISSUES:',
        hasRankMath ? '1. Go to WordPress Dashboard → Rank Math → Schema' : hasYoast ? '1. Go to WordPress Dashboard → SEO → Search Appearance → Content Types' : '1. Go to your schema plugin settings',
        '2. Review each schema type configured on your site',
        '3. Ensure all required properties are filled:',
        '   • Organization: name, logo, url',
        '   • Article: headline, author, datePublished, image',
        '   • Product: name, image, offers (price)',
        '   • LocalBusiness: name, address, telephone',
        '4. Remove duplicate schemas if detected',
        '5. Test each page with Google Rich Results Test',
        '',
        '📋 COMMON ISSUES:',
        'Missing required properties (name, image, url)',
        'Invalid date formats (use ISO 8601: YYYY-MM-DD)',
        'Missing @context or @type in JSON-LD',
        'Duplicate schemas of the same type',
        'Logo images not meeting size requirements (112x112px minimum)',
        '',
        '💡 TIP: Fix invalid schemas to qualify for rich search results (star ratings, breadcrumbs, etc.)'
      ] : [
        '⚠️ You don\'t have a schema plugin installed yet',
        '📦 Install a schema plugin to make managing structured data easy:',
        '   • Rank Math (includes comprehensive schema builder)',
        '   • Schema Pro (dedicated schema plugin)',
        '   • WP Schema Pro (visual schema builder)',
        '',
        'After installing a schema plugin:',
        '1. Complete the setup wizard',
        '2. Configure Organization schema for your business',
        '3. Enable automatic schema for content types (Articles, Pages)',
        '4. Review and fix any validation errors',
        '5. Test with Google Rich Results Test',
        '',
        '🎯 PRIORITY SCHEMAS:',
        'Organization/LocalBusiness - for your business info',
        'BreadcrumbList - for navigation breadcrumbs',
        'Article/BlogPosting - for blog content',
        'Product - for WooCommerce products',
        '',
        '💡 TIP: Valid structured data can significantly improve search visibility with rich results'
      ]

      const generalSteps = [
        '📋 Review the structured data errors below',
        '',
        '🔍 VALIDATE YOUR SCHEMA:',
        '1. Go to Google Rich Results Test:',
        '   https://search.google.com/test/rich-results',
        '2. Enter your URL or paste your schema markup',
        '3. Review all errors and warnings',
        '4. Check Schema.org documentation for requirements',
        '',
        '🛠️ FIXING JSON-LD ERRORS:',
        '1. Ensure @context is "https://schema.org"',
        '2. Include all required properties for your schema type',
        '3. Use proper date format: YYYY-MM-DD or ISO 8601',
        '4. Ensure image URLs are absolute, not relative',
        '5. Remove duplicate schemas of the same type',
        '',
        '📊 COMMON SCHEMA TYPES & REQUIRED PROPERTIES:',
        '',
        'Organization/LocalBusiness:',
        '  • name (required)',
        '  • logo (required for rich results)',
        '  • url (recommended)',
        '  • address (required for LocalBusiness)',
        '',
        'Article/BlogPosting:',
        '  • headline (required)',
        '  • author (required)',
        '  • datePublished (required)',
        '  • image (required for rich results)',
        '  • publisher with logo (required)',
        '',
        'Product:',
        '  • name (required)',
        '  • image (required)',
        '  • offers with price & priceCurrency (required)',
        '  • aggregateRating or review (for star ratings)',
        '',
        '💡 RESOURCES:',
        'Google Rich Results Test: https://search.google.com/test/rich-results',
        'Schema.org Documentation: https://schema.org/docs/schemas.html',
        'Google Search Central: https://developers.google.com/search/docs/appearance/structured-data'
      ]

      techRecs.push({
        title: 'Fix Invalid Structured Data',
        description: `${technicalIssues.invalidStructuredData} structured data item(s) have validation errors, preventing rich results`,
        impact: 'High',
        effort: 'Medium',
        icon: <Code className="w-4 h-4" />,
        details: 'Structured data (schema markup) helps search engines understand your content and display rich results like star ratings, breadcrumbs, and event details. Invalid schemas won\'t qualify for these enhanced search appearances. Use Google Rich Results Test (https://search.google.com/test/rich-results) to validate your markup.',
        useCase: cms === 'WordPress' ? 'schema-markup' : undefined,
        howTo: cms === 'WordPress' ? wordpressSteps : generalSteps
      })
    }

    // HTTP 404 Errors
    if (technicalIssues?.http404Errors && technicalIssues.http404Errors > 0) {
      const hasRedirectionPlugin = detectedPlugins.some(p =>
        p.toLowerCase().includes('redirection') ||
        p.toLowerCase().includes('redirect') ||
        p.toLowerCase().includes('yoast')
      )

      const wordpressSteps = hasRedirectionPlugin ? [
        '✅ Good news! You have a redirection plugin installed',
        '1. Review the list of 404 errors in the table below',
        '2. For each broken URL, determine the correct destination:',
        '   • If page moved → Set up 301 redirect to new location',
        '   • If page deleted → Redirect to relevant category/homepage',
        '   • If typo in link → Fix the link on the source page',
        '',
        '🔧 SETTING UP REDIRECTS:',
        '1. Go to WordPress Dashboard → Tools → Redirection',
        '2. Click "Add New" redirect',
        '3. Enter the broken URL in "Source URL" field',
        '4. Enter the correct destination in "Target URL" field',
        '5. Ensure "Match" is set to "URL only"',
        '6. Click "Add Redirect"',
        '7. Test the redirect by visiting the old URL',
        '',
        '📋 BEST PRACTICES:',
        'Use 301 redirects for permanently moved pages',
        'Redirect to the most relevant alternative page',
        'Avoid redirect chains (A→B→C)',
        'Create a custom 404 page to help lost visitors',
        '',
        '💡 TIP: If external sites link to these broken URLs, redirects are essential for preserving SEO value'
      ] : [
        '⚠️ You don\'t have a redirection plugin installed yet',
        '📦 Install a free redirection plugin to make fixing 404s easy:',
        '   • Redirection (most popular, 2M+ installs)',
        '   • Simple 301 Redirects',
        '   • Yoast SEO (includes redirect manager)',
        '',
        'After installing Redirection plugin:',
        '1. Go to WordPress Dashboard → Tools → Redirection',
        '2. Complete the setup wizard',
        '3. Review the list of 404 errors below',
        '4. For each broken URL, click "Add New" redirect',
        '5. Enter broken URL as "Source URL"',
        '6. Enter correct destination as "Target URL"',
        '7. Click "Add Redirect"',
        '',
        '🎯 WHAT TO DO:',
        'If page moved → 301 redirect to new location',
        'If page deleted → Redirect to relevant category/homepage',
        'If typo in link → Fix the link on source page',
        '',
        '💡 TIP: Create a custom 404 page template in your theme for better user experience'
      ]

      const generalSteps = [
        '📋 Review the list of 404 errors in the table below',
        '',
        '🔍 DIAGNOSE THE ISSUE:',
        'Check if the page was moved, deleted, or if there\'s a typo in the link',
        'Determine if the link is internal (your site) or external',
        '',
        '🛠️ SOLUTIONS:',
        '1. Set up 301 redirects for moved/deleted pages:',
        '   • Configure in your web server (.htaccess for Apache)',
        '   • Use your hosting control panel redirect manager',
        '   • For Nginx, add redirect rules to server config',
        '',
        '2. Fix broken links at the source:',
        '   • Update internal links to point to correct URLs',
        '   • Remove or update broken external links',
        '',
        '3. Create a custom 404 page:',
        '   • Include site navigation',
        '   • Add search functionality',
        '   • Suggest popular pages',
        '   • Provide contact information',
        '',
        '📊 EXAMPLE .HTACCESS REDIRECT:',
        'Redirect 301 /old-page /new-page',
        'Redirect 301 /deleted-page /',
        '',
        '💡 TIP: Monitor 404 errors regularly using Google Search Console'
      ]

      techRecs.push({
        title: 'Fix 404 Errors',
        description: `${technicalIssues.http404Errors} page(s) are returning 404 errors, harming user experience and SEO`,
        impact: 'High',
        effort: 'Medium',
        icon: <AlertTriangle className="w-4 h-4" />,
        details: '404 errors occur when a page cannot be found. They harm user experience, waste crawl budget, and can damage SEO if external sites link to these broken URLs. Setting up proper redirects preserves SEO value and provides a better user experience.',
        useCase: cms === 'WordPress' ? 'redirects' : undefined,
        howTo: cms === 'WordPress' ? wordpressSteps : generalSteps
      })
    }

    // Low Text-to-HTML Ratio
    if (technicalIssues?.lowTextHtmlRatio && technicalIssues.lowTextHtmlRatio > 0) {
      const wordpressSteps = [
        '📋 Review the pages with low text-to-HTML ratio in the table below',
        '',
        '🎯 UNDERSTANDING THE ISSUE:',
        'Text-to-HTML ratio measures visible text vs total HTML code',
        'Low ratios (< 25%) indicate thin content or excessive code',
        'Search engines prefer pages with substantial, meaningful content',
        '',
        '🔧 WORDPRESS-SPECIFIC FIXES:',
        '1. Add more meaningful, unique content to your pages',
        '   • Expand product descriptions',
        '   • Add helpful blog posts and articles',
        '   • Include detailed service information',
        '   • Add FAQ sections',
        '',
        '2. Optimize your theme and plugins:',
        '   • Use a lightweight, well-coded theme',
        '   • Avoid plugins that add excessive HTML/CSS/JS',
        '   • Consider switching to a performance-focused theme',
        '   • Use Elementor or other page builders sparingly',
        '',
        '3. Clean up your HTML:',
        '   • Remove inline CSS - move to external stylesheets',
        '   • Remove inline JavaScript - move to external files',
        '   • Minify HTML in production (use WP Rocket or similar)',
        '   • Remove HTML comments and unnecessary whitespace',
        '   • Disable unused WordPress features (emojis, etc.)',
        '',
        '4. Use performance plugins to optimize code:',
        '   • WP Rocket: Minify HTML, CSS, JS',
        '   • Autoptimize: Aggregate and minify code',
        '   • Asset CleanUp: Disable unused CSS/JS per page',
        '',
        '💡 RECOMMENDED PLUGINS:',
        'WP Rocket - Minifies HTML, CSS, JS automatically',
        'Autoptimize - Free alternative for code optimization',
        'Perfmatters - Remove bloat and unused features',
        '',
        '⚠️ IMPORTANT: Don\'t sacrifice user experience for ratios',
        'The goal is meaningful content, not artificially inflating text'
      ]

      const generalSteps = [
        '📋 Review the pages with low text-to-HTML ratio in the table below',
        '',
        '🎯 UNDERSTANDING THE ISSUE:',
        'Text-to-HTML ratio = (visible text / total HTML) × 100',
        'Industry standards:',
        '  • Good: > 25%',
        '  • Warning: 15-25%',
        '  • Poor: < 15%',
        '',
        '🛠️ HOW TO FIX:',
        '',
        '1. ADD MORE QUALITY CONTENT:',
        '   • Write detailed, informative content',
        '   • Expand thin pages with useful information',
        '   • Add product descriptions, FAQs, guides',
        '   • Focus on user value, not just keywords',
        '',
        '2. OPTIMIZE YOUR HTML:',
        '   • Move inline CSS to external stylesheets',
        '   • Move inline JavaScript to external files',
        '   • Minify HTML (remove whitespace, comments)',
        '   • Use CSS classes instead of inline styles',
        '   • Avoid excessive div nesting',
        '',
        '3. CLEAN UP YOUR CODE:',
        '   • Remove unnecessary HTML comments',
        '   • Delete unused CSS and JavaScript',
        '   • Use HTML5 semantic elements',
        '   • Validate HTML at validator.w3.org',
        '   • Consider using a build tool for minification',
        '',
        '4. REDUCE CODE BLOAT:',
        '   • Minimize use of heavy frameworks',
        '   • Remove unused libraries and plugins',
        '   • Use modern CSS instead of Bootstrap if possible',
        '   • Lazy load below-the-fold content',
        '',
        '📊 CHECKING YOUR RATIO:',
        'Use browser DevTools:',
        '  1. Right-click → Inspect',
        '  2. View HTML length in Elements tab',
        '  3. Copy visible text to check length',
        '  4. Calculate: (text length / HTML length) × 100',
        '',
        '💡 TIP: Focus on quality content first, code optimization second',
        'Search engines value meaningful content over arbitrary ratios'
      ]

      techRecs.push({
        title: 'Improve Low Text-to-HTML Ratio',
        description: `${technicalIssues.lowTextHtmlRatio} page(s) have low text-to-HTML ratio, indicating thin content or excessive code`,
        impact: 'Medium',
        effort: 'Medium',
        icon: <FileText className="w-4 h-4" />,
        details: 'Text-to-HTML ratio measures the percentage of actual text content compared to HTML code. A low ratio (< 25%) can indicate thin content, excessive code bloat, or over-reliance on JavaScript. While not a direct ranking factor, it correlates with content quality and user experience. Pages should have substantial, meaningful content rather than just code.',
        useCase: undefined, // No specific plugin recommendations
        howTo: cms === 'WordPress' ? wordpressSteps : generalSteps
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
      // Check for WP Rocket and Elementor
      const hasWPRocket = detectedPlugins?.some(p => p.toLowerCase().includes('wp rocket'));
      const hasElementor = pageBuilder?.toLowerCase().includes('elementor');

      // Build contextual instructions based on what's detected
      let baseInstructions: string[] = [];

      if (cms === 'WordPress') {
        if (hasWPRocket && hasElementor) {
          // Both detected - recommend WP Rocket as it's more comprehensive
          baseInstructions = [
            `📌 RECOMMENDED: USE WP ROCKET (DETECTED ON YOUR SITE):`,
            '',
            'Since you have both WP Rocket and Elementor, we recommend using WP Rocket for lazy loading as it provides more comprehensive optimization across your entire site, not just Elementor pages.',
            '',
            '1️⃣ Log into your WordPress admin dashboard',
            '2️⃣ Navigate to: Settings → WP Rocket → Media',
            '3️⃣ Under "LazyLoad", enable these options:',
            '   ✓ Enable for images',
            '   ✓ Enable for iframes and videos',
            '   ✓ Enable for CSS background images',
            '4️⃣ Scroll down and click "Save Changes"',
            '5️⃣ WP Rocket will automatically clear cache and apply lazy loading',
            '',
            '⚠️ IMPORTANT: Disable Elementor\'s lazy loading to avoid conflicts:',
            '1. Go to: Elementor → Settings → Advanced',
            '2. Set "Lazy Load Background Images" to "Inactive"',
            '3. Click "Save Changes"',
            '',
            '💡 Why WP Rocket over Elementor for lazy loading:',
            'Works on ALL pages (not just Elementor pages)',
            'Handles images, iframes, videos, and CSS backgrounds',
            'Better exclusion controls for above-the-fold content',
            'Integrates with WP Rocket\'s other performance features',
            ''
          ];
        } else if (hasWPRocket) {
          // Only WP Rocket detected
          baseInstructions = [
            `📌 USE WP ROCKET (DETECTED ON YOUR SITE):`,
            '',
            '1️⃣ Log into your WordPress admin dashboard',
            '2️⃣ Navigate to: Settings → WP Rocket → Media',
            '3️⃣ Under "LazyLoad", enable these options:',
            '   ✓ Enable for images',
            '   ✓ Enable for iframes and videos',
            '   ✓ Enable for CSS background images',
            '4️⃣ Scroll down and click "Save Changes"',
            '5️⃣ WP Rocket will automatically clear cache and apply lazy loading',
            '',
            '💡 TIP: Test the site after enabling to ensure images load properly',
            ''
          ];
        } else if (hasElementor) {
          // Only Elementor detected
          baseInstructions = [
            `📌 USE ELEMENTOR (DETECTED ON YOUR SITE):`,
            '',
            '1️⃣ Log into your WordPress admin dashboard',
            '2️⃣ Navigate to: Elementor → Settings → Advanced',
            '3️⃣ Find "Lazy Load Background Images" setting',
            '4️⃣ Set to "Active"',
            '5️⃣ Click "Save Changes"',
            '',
            '⚠️ NOTE: Elementor\'s lazy loading only works on Elementor-built pages',
            'For site-wide lazy loading, consider adding a dedicated plugin like:',
            'WP Rocket (premium, most comprehensive)',
            'a3 Lazy Load (free)',
            'Jetpack (free, but requires WordPress.com connection)',
            '',
            '💡 WordPress 5.5+ has native lazy loading built-in for most images',
            ''
          ];
        } else {
          // Neither detected - generic WordPress instructions
          baseInstructions = [
            '📌 PLUGIN OPTIONS:',
            'See the "Recommended Plugins & Tools" table below for plugin comparisons.',
            'Premium option: WP Rocket (also includes caching, JS/CSS optimization)',
            'Free options: a3 Lazy Load, Jetpack',
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
          ];
        }
      } else {
        // Non-WordPress instructions
        baseInstructions = [
          'Add loading="lazy" attribute to img tags below the fold',
          'Example: <img src="image.jpg" loading="lazy" alt="Description">',
          'Use Intersection Observer API for custom lazy loading',
          'Prioritize above-the-fold images (don\'t lazy load them)',
          'Consider using modern image formats like WebP',
          'JavaScript libraries: lazysizes, lozad.js, or vanilla-lazyload',
          'Ensure images have width/height attributes to prevent layout shifts'
        ];
      }

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
        howTo: baseInstructions
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

                      {/* Structured Data Validation Table */}
                      {rec.title.includes('Invalid Structured Data') && structuredDataItems && structuredDataItems.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-300">
                          <h5 className="font-semibold mb-3 text-red-600">❌ Structured Data Validation Results</h5>
                          <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-red-100">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-medium text-red-800">Schema Type</th>
                                    <th className="px-4 py-3 text-left font-medium text-red-800">Format</th>
                                    <th className="px-4 py-3 text-left font-medium text-red-800">Location</th>
                                    <th className="px-4 py-3 text-left font-medium text-red-800">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-red-800">Issues</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-red-200">
                                  {structuredDataItems.map((item: { type: string; format: string; location: string; isValid: boolean; errors: string[]; warnings: string[] }, idx: number) => (
                                    <tr key={idx} className={`hover:bg-red-50 ${!item.isValid ? 'bg-red-100' : ''}`}>
                                      <td className="px-4 py-3">
                                        <span className="font-medium text-gray-900">{item.type}</span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                          {item.format}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-gray-600">
                                        {item.location}
                                      </td>
                                      <td className="px-4 py-3">
                                        {item.isValid ? (
                                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                            Valid
                                          </span>
                                        ) : (
                                          <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                                            Invalid
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {item.errors.length > 0 && (
                                          <div className="space-y-1">
                                            {item.errors.map((error, errorIdx) => (
                                              <div key={errorIdx} className="text-xs text-red-700">
                                                • {error}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {item.warnings.length > 0 && (
                                          <div className="space-y-1 mt-1">
                                            {item.warnings.map((warning, warningIdx) => (
                                              <div key={warningIdx} className="text-xs text-orange-600">
                                                ⚠ {warning}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {item.errors.length === 0 && item.warnings.length === 0 && (
                                          <span className="text-xs text-gray-500">No issues</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            💡 Tip: Use <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google Rich Results Test</a> to validate your structured data and see how it appears in search results.
                          </p>
                        </div>
                      )}

                      {/* Text-to-HTML Ratio Table */}
                      {rec.title.includes('Low Text-to-HTML Ratio') && textHtmlRatioPages && textHtmlRatioPages.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-300">
                          <h5 className="font-semibold mb-3 text-orange-600">⚠️ Pages with Low Text-to-HTML Ratio</h5>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-orange-100">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">Page URL</th>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">Text Length</th>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">HTML Length</th>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">Ratio</th>
                                    <th className="px-4 py-3 text-left font-medium text-orange-800">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-orange-200">
                                  {textHtmlRatioPages
                                    .filter(page => page.status === 'warning' || page.status === 'poor')
                                    .slice(0, 20)
                                    .map((page, idx) => (
                                      <tr key={idx} className={`hover:bg-orange-50 ${page.status === 'poor' ? 'bg-red-50' : ''}`}>
                                        <td className="px-4 py-3">
                                          <a
                                            href={page.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline break-all text-xs"
                                          >
                                            {page.url}
                                          </a>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                          {page.textLength.toLocaleString()} chars
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                          {page.htmlLength.toLocaleString()} chars
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`font-medium ${
                                            page.ratio >= 25 ? 'text-green-600' :
                                            page.ratio >= 15 ? 'text-orange-600' :
                                            'text-red-600'
                                          }`}>
                                            {page.ratio.toFixed(1)}%
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          {page.status === 'good' && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                              Good (&gt; 25%)
                                            </span>
                                          )}
                                          {page.status === 'warning' && (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                              Warning (15-25%)
                                            </span>
                                          )}
                                          {page.status === 'poor' && (
                                            <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                                              Poor (&lt; 15%)
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            💡 Tip: Focus on adding quality content first. A good text-to-HTML ratio is above 25%. Industry standards: Good (&gt; 25%), Warning (15-25%), Poor (&lt; 15%).
                          </p>
                          {textHtmlRatioPages.filter(p => p.status === 'warning' || p.status === 'poor').length > 20 && (
                            <p className="text-xs text-gray-600 mt-1">
                              Showing first 20 pages. Additional pages may also be affected.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Plugin Recommendation Tables - Now shown FIRST */}
                      {rec.useCase && cms === 'WordPress' && (
                        <div className="mt-6 mb-4 pb-4 pt-4 border-t border-gray-300 space-y-6">
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