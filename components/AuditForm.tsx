"use client"

import React, { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Tooltip from "@/components/Tooltip"
import { ukDetectionService, UKDetectionResult } from "@/lib/ukDetectionService"
import { cachePageDiscovery, getCachedPageDiscovery, cacheExcludedPaths, clearExpiredCaches } from "@/lib/pageDiscoveryCache"

const AUDIT_SECTIONS = [
  {
    id: "traffic",
    label: "Traffic Insights",
    description: "Organic search performance, paid advertising metrics, and geographic distribution"
  },
  {
    id: "performance",
    label: "Performance & Technical Audit",
    description: "Core Web Vitals, technical SEO health, image optimization, site structure analysis, and technology stack detection"
  },
  {
    id: "keywords",
    label: "Keywords",
    description: "Branded and non-branded keyword analysis with competitive intelligence"
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "WCAG 2.2 Level AA compliance testing for UK/EAA requirements with actionable fixes",
    phase: 2
  },
  {
    id: "backlinks",
    label: "Backlinks",
    description: "Possible merger with Keywords.",
    phase: 2
  }
]

type AuditScope = 'single' | 'all' | 'custom'

interface PageOption {
  url: string
  title: string
  selected: boolean
}

// Rotating comments for different audit types
const AUDIT_COMMENTS: Record<string, string[]> = {
  traffic: [
    "Analysing organic search traffic patterns and user engagement metrics...",
    "Comparing your organic performance against industry benchmarks...",
    "Evaluating geographic distribution and traffic sources...",
    "Assessing paid advertising effectiveness and opportunities..."
  ],
  performance: [
    "Running Core Web Vitals assessment for optimal user experience...",
    "Scanning site structure and technical SEO health...",
    "Analyzing page speed and performance metrics...",
    "Detecting technology stack and optimization opportunities...",
    "Checking image optimization and resource loading..."
  ],
  keywords: [
    "Identifying branded vs non-branded keyword opportunities...",
    "Analyzing keyword rankings and search visibility...",
    "Discovering high-value keyword gaps and opportunities...",
    "Assessing competitive keyword positioning..."
  ],
  accessibility: [
    "Testing WCAG 2.2 Level AA compliance requirements...",
    "Scanning for accessibility barriers and fixes...",
    "Evaluating keyboard navigation and screen reader support...",
    "Checking color contrast and visual accessibility..."
  ],
  backlinks: [
    "Analyzing backlink profile and domain authority...",
    "Identifying high-quality link opportunities...",
    "Assessing link diversity and anchor text distribution..."
  ]
}

// Countries supported by Keywords Everywhere API
const COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'co', name: 'Colombia', flag: '🇨🇴' },
  { code: 'cl', name: 'Chile', flag: '🇨🇱' },
  { code: 'pe', name: 'Peru', flag: '🇵🇪' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'th', name: 'Thailand', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
  { code: 'fi', name: 'Finland', flag: '🇫🇮' },
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungary', flag: '🇭🇺' },
  { code: 'ro', name: 'Romania', flag: '🇷🇴' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'il', name: 'Israel', flag: '🇮🇱' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'ua', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'tw', name: 'Taiwan', flag: '🇹🇼' }
]

export function AuditForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [selectedSections, setSelectedSections] = useState<string[]>([]) // Default to nothing selected
  const [auditScope, setAuditScope] = useState<AuditScope>('single')
  const [auditView, setAuditView] = useState<'executive' | 'manager' | 'developer'>('executive') // Default to executive view
  const [country, setCountry] = useState('gb') // Default to United Kingdom
  const [isUKCompany, setIsUKCompany] = useState(false) // New state for UK company flag
  const [ukDetection, setUkDetection] = useState<UKDetectionResult | null>(null)
  const [discoveredPages, setDiscoveredPages] = useState<PageOption[]>([])
  const [isDiscoveringPages, setIsDiscoveringPages] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [currentComment, setCurrentComment] = useState("")
  const [error, setError] = useState("")
  const [showErrorTooltip, setShowErrorTooltip] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [pageLimit, setPageLimit] = useState<number | null>(50) // 50 by default, null for unlimited
  const [showPageLimitControls, setShowPageLimitControls] = useState(false)
  const [allPagesCount, setAllPagesCount] = useState<number | null>(null) // Count of discovered pages
  const [allDiscoveredPagesList, setAllDiscoveredPagesList] = useState<{url: string}[]>([]) // Full list of discovered pages
  const [isCountingPages, setIsCountingPages] = useState(false)
  const [excludedPaths, setExcludedPaths] = useState<string[]>([]) // Paths to exclude (e.g., /blog)
  const [excludeInput, setExcludeInput] = useState('')
  const [estimatedCost, setEstimatedCost] = useState({
    keywordsEverywhere: 0,
    serper: 0,
    claude: 0,
    total: 0,
    creditsRequired: 0
  })
  const [confirmCost, setConfirmCost] = useState(false)
  const [domainAuthority, setDomainAuthority] = useState<number | null>(null)
  const [isDomainAuthorityLoading, setIsDomainAuthorityLoading] = useState(false)

  // Helper function to check if a URL should be excluded
  const isPathExcluded = (url: string): boolean => {
    if (excludedPaths.length === 0) return false
    return excludedPaths.some(excludedPath => {
      try {
        const urlObj = new URL(url)
        return urlObj.pathname.startsWith(excludedPath)
      } catch {
        // If URL parsing fails, check the string directly
        return url.includes(excludedPath)
      }
    })
  }

  // Extract path pattern from URL for bulk exclusion (e.g., /property/, /blog/)
  const extractPathPattern = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname

      // Remove trailing filename and get directory path
      const pathParts = pathname.split('/').filter(p => p.length > 0)

      if (pathParts.length === 0) return null

      // Return first level path (e.g., /property/)
      return `/${pathParts[0]}/`
    } catch {
      return null
    }
  }

  // Quick add path to exclusions
  const quickExcludePath = (url: string) => {
    const pathPattern = extractPathPattern(url)
    if (pathPattern && !excludedPaths.includes(pathPattern)) {
      setExcludedPaths(prev => [...prev, pathPattern])
    }
  }

  // Calculate filtered page counts (excluding paths)
  const getFilteredPageCount = (scope: 'all' | 'custom'): number => {
    if (scope === 'all') {
      return allDiscoveredPagesList.filter(page => !isPathExcluded(page.url)).length
    } else {
      return discoveredPages.filter(page => !isPathExcluded(page.url)).length
    }
  }

  // Format cost with smart pence/pounds display
  const formatCost = (amount: number) => {
    if (amount < 1) {
      const pence = Math.round(amount * 100)
      const exactPence = (amount * 100).toFixed(2)

      // If there's a cost but it rounds to 0, show "< 1p" with exact decimal
      if (pence === 0 && amount > 0) {
        return (
          <span className="flex flex-col items-end">
            <span>{'< 1p'}</span>
            <span className="text-xs text-gray-500">({exactPence}p)</span>
          </span>
        )
      }
      return `${pence}p`
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Calculate estimated audit cost
  const calculateEstimatedCost = () => {
    const hasKeywords = selectedSections.includes('keywords')
    let pageCount = 1

    // Determine page count based on scope
    if (auditScope === 'single') {
      pageCount = 1
    } else if (auditScope === 'custom' && discoveredPages.length > 0) {
      // Count selected pages that aren't excluded
      pageCount = discoveredPages.filter(p => p.selected && !isPathExcluded(p.url)).length || 1
    } else if (auditScope === 'all') {
      // Use filtered count (accounting for exclusions), respecting page limit
      const filteredCount = getFilteredPageCount('all')
      const effectiveCount = filteredCount || allPagesCount || 50
      pageCount = pageLimit !== null ? Math.min(pageLimit, effectiveCount) : effectiveCount
    }

    // Cost calculations in USD - using actual usage from API implementation
    let keCreditsUsed = 0
    let vsSearchesUsed = 0

    if (hasKeywords) {
      if (pageCount === 1) {
        // Single page audit
        keCreditsUsed = 116
        vsSearchesUsed = 75
      } else {
        // Multi-page audit: first page costs more, additional pages cost less
        const homePage = 1
        const additionalPages = pageCount - 1
        keCreditsUsed = (homePage * 116) + (additionalPages * 25)
        vsSearchesUsed = (homePage * 75) + (additionalPages * 15)
      }
    }

    const keCostUSD = keCreditsUsed * 0.00024 // $0.24 per 1000 credits
    const serperCostUSD = vsSearchesUsed * 0.0006 // $0.60 per 1000 searches (2 credits per search)

    // Claude API costs (Haiku: $0.25/MTok input, $1.25/MTok output) - PER PAGE
    const claudeBusinessAnalysisPerPageUSD = hasKeywords ? 0.0019 : 0 // ~5K input + 1.5K output tokens
    const claudeConclusionPerPageUSD = 0.00088 // ~1K input + 500 output tokens (always runs for performance section)
    const claudePerPageUSD = claudeBusinessAnalysisPerPageUSD + claudeConclusionPerPageUSD
    const totalClaudeCostUSD = claudePerPageUSD * pageCount

    const totalCostUSD = keCostUSD + serperCostUSD + totalClaudeCostUSD

    // Convert to GBP (using approximate rate of 0.79)
    const usdToGbp = 0.79
    const totalCostGBP = totalCostUSD * usdToGbp

    // Calculate credits with 100% markup (1 credit = 1p = £0.01)
    const totalCostWithMarkupGBP = totalCostGBP * 2 // Apply 100% markup
    const creditsRequired = Math.ceil(totalCostWithMarkupGBP / 0.01) // Convert to credits

    setEstimatedCost({
      keywordsEverywhere: keCostUSD * usdToGbp,
      serper: serperCostUSD * usdToGbp,
      claude: totalClaudeCostUSD * usdToGbp,
      total: totalCostWithMarkupGBP, // Display cost WITH markup
      creditsRequired: creditsRequired
    })
  }

  // Recalculate cost when selections change
  useEffect(() => {
    if (isValidUrl) {
      calculateEstimatedCost()
      // Reset cost confirmation when selections change
      setConfirmCost(false)
    }
  }, [selectedSections, auditScope, discoveredPages, allPagesCount, pageLimit, isValidUrl, excludedPaths])


  // Recalculate page count when excluded paths change
  useEffect(() => {
    if (allDiscoveredPagesList.length > 0) {
      // Filter pages based on excluded paths
      const filteredPages = allDiscoveredPagesList.filter(page => {
        try {
          const pageUrl = new URL(page.url)
          const pathname = pageUrl.pathname
          // Check if the pathname starts with any excluded path
          return !excludedPaths.some(excludedPath => pathname.startsWith(excludedPath))
        } catch {
          return true // Keep pages with invalid URLs
        }
      })
      setAllPagesCount(filteredPages.length)
    }
  }, [allDiscoveredPagesList, excludedPaths])

  // Save excluded paths to cache whenever they change
  useEffect(() => {
    if (isValidUrl && excludedPaths.length > 0) {
      const urlToCache = url.startsWith('http') ? url : `https://${url}`
      cacheExcludedPaths(urlToCache, excludedPaths)
    }
  }, [excludedPaths, url, isValidUrl])

  // Rotate comments based on selected audit sections
  useEffect(() => {
    if (!showLoadingOverlay) return

    // Collect all relevant comments from selected audit types
    const allComments: string[] = []
    selectedSections.forEach(section => {
      if (AUDIT_COMMENTS[section]) {
        allComments.push(...AUDIT_COMMENTS[section])
      }
    })

    // If no comments found, use a generic one
    if (allComments.length === 0) {
      allComments.push("Running comprehensive website analysis...")
    }

    // Set initial comment
    let currentIndex = 0
    setCurrentComment(allComments[0])

    // Rotate comments every 3 seconds
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % allComments.length
      setCurrentComment(allComments[currentIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [showLoadingOverlay, selectedSections])

  // Fetch domain authority when URL is valid
  useEffect(() => {
    if (!isValidUrl || !url) {
      setDomainAuthority(null)
      return
    }

    const fetchDomainAuthority = async () => {
      setIsDomainAuthorityLoading(true)
      try {
        const urlToCheck = url.startsWith('http') ? url : `https://${url}`
        const response = await fetch(`/api/domain-authority?url=${encodeURIComponent(urlToCheck)}`)
        const data = await response.json()

        if (data.success && data.domainAuthority !== undefined) {
          setDomainAuthority(data.domainAuthority)
        } else {
          setDomainAuthority(null)
        }
      } catch (error) {
        console.error('Error fetching domain authority:', error)
        setDomainAuthority(null)
      } finally {
        setIsDomainAuthorityLoading(false)
      }
    }

    // Debounce the fetch to avoid too many requests
    const timeoutId = setTimeout(fetchDomainAuthority, 500)
    return () => clearTimeout(timeoutId)
  }, [url, isValidUrl])

  const validateUrl = (urlString: string) => {
    try {
      // Add protocol if missing
      const urlToValidate = urlString.startsWith('http') ? urlString : `https://${urlString}`
      const url = new URL(urlToValidate)
      
      // Check if protocol is valid
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return false
      }
      
      // Check if hostname has at least one dot and a valid TLD
      const hostname = url.hostname
      if (!hostname || hostname === 'localhost') {
        return false
      }
      
      // Must contain at least one dot
      if (!hostname.includes('.')) {
        return false
      }
      
      // Get the TLD (last part after the last dot)
      const parts = hostname.split('.')
      const tld = parts[parts.length - 1].toLowerCase()
      
      // Check for valid TLD (minimum 2 characters, only letters)
      if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
        return false
      }
      
      // Common TLD validation - ensure it's a real TLD
      const validTlds = [
        'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'uk', 'ca', 'au', 'de', 'fr', 'it', 'es', 'nl', 'jp', 'br', 'mx', 'ar', 'cl', 'pe', 'kr', 'sg', 'my', 'th', 'id', 'ph', 'vn', 'za', 'ng', 'eg', 'be', 'ie', 'se', 'no', 'dk', 'fi', 'at', 'ch', 'pt', 'pl', 'cz', 'hu', 'ro', 'gr', 'tr', 'il', 'ae', 'sa', 'nz', 'ru', 'ua', 'cn', 'hk', 'tw', 'in', 'io', 'me', 'tv', 'biz', 'info', 'name', 'pro', 'mobi', 'tel', 'travel', 'museum', 'aero', 'coop', 'jobs', 'cat', 'asia', 'xxx', 'app', 'dev', 'tech', 'online', 'site', 'website', 'store', 'shop', 'blog', 'news'
      ]
      
      // For compound TLDs like co.uk, check if the combination is valid
      if (parts.length >= 2) {
        const secondLevelTld = parts[parts.length - 2].toLowerCase()
        const compoundTld = `${secondLevelTld}.${tld}`
        const validCompoundTlds = ['co.uk', 'org.uk', 'ac.uk', 'com.au', 'org.au', 'net.au', 'edu.au', 'com.br', 'org.br', 'net.br', 'com.mx', 'org.mx', 'net.mx']
        
        if (validCompoundTlds.includes(compoundTld)) {
          return true
        }
      }
      
      return validTlds.includes(tld)
    } catch {
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    setError("")
    setShowErrorTooltip(false) // Hide tooltip when user starts typing
    setIsValidUrl(validateUrl(value))
    // Reset discovered pages when URL changes
    setDiscoveredPages([])
    setAuditScope('single')
    setAllPagesCount(null) // Reset page count
    setAllDiscoveredPagesList([]) // Reset discovered pages list
    // Reset UK detection when URL changes
    setUkDetection(null)

    // Auto-detect UK if URL is valid
    if (validateUrl(value)) {
      detectUKCompany(value)
    }
  }

  const detectUKCompany = async (urlToDetect: string) => {
    try {
      const detection = await ukDetectionService.detectUKCompany(urlToDetect)
      setUkDetection(detection)
      
      // Auto-set UK company flag based on detection (behind the scenes)
      setIsUKCompany(detection.isUKCompany)
      
      console.log('🔍 UK Detection (Hidden):', {
        url: urlToDetect,
        isUK: detection.isUKCompany,
        confidence: detection.confidence,
        reasoning: detection.reasoning
      })
    } catch (error) {
      console.error('UK detection failed:', error)
      setUkDetection(null)
      setIsUKCompany(false) // Default to non-UK on failure
    }
  }

  const discoverPages = async () => {
    if (!isValidUrl) return

    // Check cache first
    const urlToDiscover = url.startsWith('http') ? url : `https://${url}`
    const cached = getCachedPageDiscovery(urlToDiscover)

    if (cached) {
      // Use cached data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pages: PageOption[] = cached.pages.map((page: any) => ({
        url: page.url,
        title: page.title || page.url.split('/').pop() || page.url,
        selected: true
      }))
      setDiscoveredPages(pages)

      // Load excluded paths from cache
      if (cached.excludedPaths && cached.excludedPaths.length > 0) {
        setExcludedPaths(cached.excludedPaths)
      }

      return // Skip API call
    }

    // No cache, proceed with API call
    setIsDiscoveringPages(true)
    setError("")

    try {
      const response = await fetch('/api/discover-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToDiscover }),
      })

      if (!response.ok) {
        throw new Error('Failed to discover pages')
      }

      const data = await response.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pages: PageOption[] = data.pages.map((page: any) => ({
        url: page.url,
        title: page.title || page.url,
        selected: true
      }))

      setDiscoveredPages(pages)

      // Cache the results
      cachePageDiscovery(urlToDiscover, data.pages, data.totalFound)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover pages')
      setDiscoveredPages([])
    } finally {
      setIsDiscoveringPages(false)
    }
  }

  const handlePageToggle = (pageUrl: string) => {
    setDiscoveredPages(prev => 
      prev.map(page => 
        page.url === pageUrl 
          ? { ...page, selected: !page.selected }
          : page
      )
    )
  }

  const discoverPagesCount = async () => {
    if (!isValidUrl) return

    // Check cache first
    const urlToDiscover = url.startsWith('http') ? url : `https://${url}`
    const cached = getCachedPageDiscovery(urlToDiscover)

    if (cached) {
      // Use cached data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pagesList = cached.pages.map((page: any) => ({ url: page.url }))
      setAllDiscoveredPagesList(pagesList)
      setAllPagesCount(cached.totalFound)

      // Load excluded paths from cache
      if (cached.excludedPaths && cached.excludedPaths.length > 0) {
        setExcludedPaths(cached.excludedPaths)
      }

      return // Skip API call
    }

    // No cache, proceed with API call
    setIsCountingPages(true)

    try {
      const response = await fetch('/api/discover-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToDiscover }),
      })

      if (!response.ok) {
        throw new Error('Failed to discover pages')
      }

      const data = await response.json()
      // Store full list of pages for filtering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pagesList = (data.pages || []).map((page: any) => ({ url: page.url }))
      setAllDiscoveredPagesList(pagesList)
      setAllPagesCount(data.totalFound || 0)

      // Cache the results
      cachePageDiscovery(urlToDiscover, data.pages, data.totalFound)

    } catch (err) {
      console.error('Failed to count pages:', err)
      setAllDiscoveredPagesList([])
      setAllPagesCount(0)
    } finally {
      setIsCountingPages(false)
    }
  }

  const handleAuditScopeChange = (scope: AuditScope) => {
    setAuditScope(scope)

    // Discover pages when "All Discoverable Pages" is selected
    if (scope === 'all' && isValidUrl && allPagesCount === null) {
      // Check if we already have data from "Select Specific Pages"
      if (discoveredPages.length > 0) {
        // Reuse the existing discovery results
        const pagesList = discoveredPages.map(page => ({ url: page.url }))
        setAllDiscoveredPagesList(pagesList)
        setAllPagesCount(discoveredPages.length)
      } else {
        // No existing data, fetch new
        discoverPagesCount()
      }
    }

    // Discover pages when "Select Specific Pages" is selected
    if (scope === 'custom' && isValidUrl && discoveredPages.length === 0) {
      // Check if we already have data from "All Discoverable Pages"
      if (allDiscoveredPagesList.length > 0) {
        // Reuse the existing discovery results
        const pages: PageOption[] = allDiscoveredPagesList.map(page => ({
          url: page.url,
          title: page.url.split('/').pop() || page.url, // Use last part of URL as title
          selected: true
        }))
        setDiscoveredPages(pages)
      } else {
        // No existing data, fetch new
        discoverPages()
      }
    }
  }

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
    setShowErrorTooltip(false) // Hide tooltip when user selects sections
  }

  const handleSelectAll = () => {
    const phase1Sections = AUDIT_SECTIONS.filter(section => section.phase !== 2);
    const allPhase1Selected = phase1Sections.every(section => selectedSections.includes(section.id));
    setSelectedSections(allPhase1Selected ? [] : phase1Sections.map(section => section.id));
    setShowErrorTooltip(false) // Hide tooltip when user uses select all
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError("Please enter a website URL to analyze")
      setShowErrorTooltip(true)
      setTimeout(() => setShowErrorTooltip(false), 4000)
      return
    }

    if (!isValidUrl) {
      setError("Please enter a valid website URL (e.g., example.com)")
      setShowErrorTooltip(true)
      setTimeout(() => setShowErrorTooltip(false), 4000)
      return
    }

    if (selectedSections.length === 0) {
      setError("Please choose one or more audit sections first. Select the analyses you'd like to include in your website audit.")
      setShowErrorTooltip(true)
      setTimeout(() => setShowErrorTooltip(false), 4000)
      return
    }

    // Show loading immediately for instant feedback
    setIsLoading(true)
    setError("")
    setShowErrorTooltip(false)

    // Show overlay immediately
    setShowLoadingOverlay(true)

    try {
      // Add protocol if missing
      const urlToAudit = url.startsWith('http') ? url : `https://${url}`
      
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToAudit,
          sections: selectedSections,
          scope: auditScope,
          auditView: auditView, // Include selected audit view
          country: country, // Include selected country
          isUKCompany: isUKCompany, // Include UK company flag
          pageLimit: auditScope === 'all' ? pageLimit : undefined, // Only send page limit for 'all' scope
          excludedPaths: auditScope === 'all' && excludedPaths.length > 0 ? excludedPaths : undefined, // Only send excluded paths for 'all' scope
          pages: auditScope === 'custom'
            ? discoveredPages.filter(page => page.selected).map(page => page.url)
            : [urlToAudit] // For both 'single' and 'all' scopes, just send the main URL
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle insufficient credits error (402)
        if (response.status === 402) {
          setError(`Insufficient credits. This audit requires ${data.required} credits but you only have ${data.available}. You need ${data.shortfall} more credits.`)
        } else if (response.status === 401) {
          setError('Please log in to run an audit')
        } else {
          setError(data.error || 'Failed to start audit')
        }
        setShowErrorTooltip(false)
        setIsLoading(false)
        setShowLoadingOverlay(false)
        return
      }

      // Use Next.js router for client-side navigation
      router.push(`/audit/${data.id}`)
      // Don't set loading to false here - let the navigation handle it

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setShowErrorTooltip(false) // Hide tooltip for regular errors (they use the box)
      setIsLoading(false) // Only set to false on error
      setShowLoadingOverlay(false)
    }
  }

  return (
    <div className="card-pmw relative">
      <form onSubmit={handleSubmit} className="space-y-4 transition-opacity duration-200" style={showLoadingOverlay ? { display: 'none' } : {}}>
        {/* URL Input */}
        <div>
          <div className="flex gap-2 items-stretch flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <input
                type="text"
                id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Enter a URL to start"
                className={`w-full px-4 py-3 border rounded-lg text-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  url && !isValidUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {url && isValidUrl && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Domain Authority Display */}
            {isValidUrl && (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">DA:</span>
                {isDomainAuthorityLoading ? (
                  <div className="w-8 h-5 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                ) : domainAuthority !== null ? (
                  <span className="text-lg font-bold text-blue-600">{domainAuthority}</span>
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <p className="font-medium">Domain Authority (DA)</p>
                      <p>A score from 0-100 that predicts how well a website will rank on search engines.</p>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li><strong>0-30:</strong> New or low authority site</li>
                        <li><strong>30-50:</strong> Moderate authority</li>
                        <li><strong>50-70:</strong> Good authority</li>
                        <li><strong>70+:</strong> Excellent authority</li>
                      </ul>
                      <div className="mt-3 p-2 bg-blue-900 rounded text-white text-sm">
                        <p className="font-medium">How it's calculated:</p>
                        <p>Based on factors like backlink quality, domain age, content quality, and technical SEO.</p>
                      </div>
                    </div>
                  }
                  position="right"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-help transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="12" cy="12" r="9.5" />
                    <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Tooltip>
              </div>
            )}

            {isValidUrl && (
              <button
                type="button"
                onClick={() => {
                  const sitemapUrl = `/sitemap?domain=${encodeURIComponent(url.startsWith('http') ? url : `https://${url}`)}`;
                  window.open(sitemapUrl, '_blank');
                }}
                className="inline-flex items-center gap-2 px-4 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-[#42499c] transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 9.75H10.5C10.0367 9.74738 9.59309 9.56216 9.26546 9.23454C8.93784 8.90691 8.75263 8.46332 8.75 8V5C8.75263 4.53668 8.93784 4.09309 9.26546 3.76546C9.59309 3.43784 10.0367 3.25263 10.5 3.25H13.5C13.9633 3.25263 14.4069 3.43784 14.7345 3.76546C15.0622 4.09309 15.2474 4.53668 15.25 5V8C15.2474 8.46332 15.0622 8.90691 14.7345 9.23454C14.4069 9.56216 13.9633 9.74738 13.5 9.75ZM10.5 4.75C10.4337 4.75 10.3701 4.77634 10.3232 4.82322C10.2763 4.87011 10.25 4.9337 10.25 5V8C10.25 8.0663 10.2763 8.12989 10.3232 8.17678C10.3701 8.22366 10.4337 8.25 10.5 8.25H13.5C13.5663 8.25 13.6299 8.22366 13.6768 8.17678C13.7237 8.12989 13.75 8.0663 13.75 8V5C13.75 4.9337 13.7237 4.87011 13.6768 4.82322C13.6299 4.77634 13.5663 4.75 13.5 4.75H10.5Z" />
                  <path d="M6 19.75H4C3.53668 19.7474 3.09309 19.5622 2.76546 19.2345C2.43784 18.9069 2.25263 18.4633 2.25 18V16C2.25263 15.5367 2.43784 15.0931 2.76546 14.7655C3.09309 14.4378 3.53668 14.2526 4 14.25H6C6.46332 14.2526 6.90691 14.4378 7.23454 14.7655C7.56216 15.0931 7.74738 15.5367 7.75 16V18C7.74738 18.4633 7.56216 18.9069 7.23454 19.2345C6.90691 19.5622 6.46332 19.7474 6 19.75ZM4 15.75C3.9337 15.75 3.87011 15.7763 3.82322 15.8232C3.77634 15.8701 3.75 15.9337 3.75 16V18C3.75 18.0663 3.77634 18.1299 3.82322 18.1768C3.87011 18.2237 3.9337 18.25 4 18.25H6C6.0663 18.25 6.12989 18.2237 6.17678 18.1768C6.22366 18.1299 6.25 18.0663 6.25 18V16C6.25 15.9337 6.22366 15.8701 6.17678 15.8232C6.12989 15.7763 6.0663 15.75 6 15.75H4Z" />
                  <path d="M13 19.75H11C10.5367 19.7474 10.0931 19.5622 9.76546 19.2345C9.43784 18.9069 9.25263 18.4633 9.25 18V16C9.25263 15.5367 9.43784 15.0931 9.76546 14.7655C10.0931 14.4378 10.5367 14.2526 11 14.25H13C13.4633 14.2526 13.9069 14.4378 14.2345 14.7655C14.5622 15.0931 14.7474 15.5367 14.75 16V18C14.7474 18.4633 14.5622 18.9069 14.2345 19.2345C13.9069 19.5622 13.4633 19.7474 13 19.75ZM11 15.75C10.9337 15.75 10.8701 15.7763 10.8232 15.8232C10.7763 15.8701 10.75 15.9337 10.75 16V18C10.75 18.0663 10.7763 18.1299 10.8232 18.1768C10.8701 18.2237 10.9337 18.25 11 18.25H13C13.0663 18.25 13.1299 18.2237 13.1768 18.1768C13.2237 18.1299 13.25 18.0663 13.25 18V16C13.25 15.9337 13.2237 15.8701 13.1768 15.8232C13.1299 15.7763 13.0663 15.75 13 15.75H11Z" />
                  <path d="M20 19.75H18C17.5367 19.7474 17.0931 19.5622 16.7655 19.2345C16.4378 18.9069 16.2526 18.4633 16.25 18V16C16.2526 15.5367 16.4378 15.0931 16.7655 14.7655C17.0931 14.4378 17.5367 14.2526 18 14.25H20C20.4633 14.2526 20.9069 14.4378 21.2345 14.7655C21.5622 15.0931 21.7474 15.5367 21.75 16V18C21.7474 18.4633 21.5622 18.9069 21.2345 19.2345C20.9069 19.5622 20.4633 19.7474 20 19.75ZM18 15.75C17.9337 15.75 17.8701 15.7763 17.8232 15.8232C17.7763 15.8701 17.75 15.9337 17.75 16V18C17.75 18.0663 17.7763 18.1299 17.8232 18.1768C17.8701 18.2237 17.9337 18.25 18 18.25H20C20.0663 18.25 20.1299 18.2237 20.1768 18.1768C20.2237 18.1299 20.25 18.0663 20.25 18V16C20.25 15.9337 20.2237 15.8701 20.1768 15.8232C20.1299 15.7763 20.0663 15.75 20 15.75H18Z" />
                  <path d="M19 15.75C18.8019 15.7474 18.6126 15.6676 18.4725 15.5275C18.3324 15.3874 18.2526 15.1981 18.25 15V13C18.25 12.9337 18.2237 12.8701 18.1768 12.8232C18.1299 12.7763 18.0663 12.75 18 12.75H6C5.9337 12.75 5.87011 12.7763 5.82322 12.8232C5.77634 12.8701 5.75 12.9337 5.75 13V15C5.75 15.1989 5.67098 15.3897 5.53033 15.5303C5.38968 15.671 5.19891 15.75 5 15.75C4.80109 15.75 4.61032 15.671 4.46967 15.5303C4.32902 15.3897 4.25 15.1989 4.25 15V13C4.25263 12.5367 4.43784 12.0931 4.76546 11.7655C5.09309 11.4378 5.53668 11.2526 6 11.25H18C18.4633 11.2526 18.9069 11.4378 19.2345 11.7655C19.5622 12.0931 19.7474 12.5367 19.75 13V15C19.7474 15.1981 19.6676 15.3874 19.5275 15.5275C19.3874 15.6676 19.1981 15.7474 19 15.75Z" />
                  <path d="M12 15.75C11.8019 15.7474 11.6126 15.6676 11.4725 15.5275C11.3324 15.3874 11.2526 15.1981 11.25 15V9C11.25 8.80109 11.329 8.61032 11.4697 8.46967C11.6103 8.32902 11.8011 8.25 12 8.25C12.1989 8.25 12.3897 8.32902 12.5303 8.46967C12.671 8.61032 12.75 8.80109 12.75 9V15C12.7474 15.1981 12.6676 15.3874 12.5275 15.5275C12.3874 15.6676 12.1981 15.7474 12 15.75Z" />
                </svg>
                View Sitemap
              </button>
            )}
          </div>
          {url && !isValidUrl && (
            <p className="text-red-600 text-sm mt-1">Please enter a valid URL</p>
          )}
        </div>


        {/* Audit Scope Selection */}
        {isValidUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Audit Scope
            </label>
            <div className="space-y-4">
              <div className="py-2">
                <label htmlFor="single-page" className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    id="single-page"
                    name="auditScope"
                    value="single"
                    checked={auditScope === 'single'}
                    onChange={() => handleAuditScopeChange('single')}
                    className="h-4 w-4 text-[#42499c] border-black focus:ring-[#42499c]"
                    style={{ accentColor: '#42499c' }}
                  />
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    Single Page
                    <Tooltip 
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Single Page Analysis</p>
                          <p>This option audits only the specific URL you entered:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Homepage or specified URL only</li>
                            <li>Fastest audit option</li>
                            <li>Perfect for testing specific pages</li>
                          </ul>
                          <div className="mt-3 p-2 bg-blue-900 rounded text-white">
                            <p className="font-medium">✓ Quick and focused analysis</p>
                            <p className="text-sm">Ideal for testing changes to specific pages.</p>
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <svg className="w-5 h-5 text-black hover:text-[#42499c] cursor-help transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                        <circle cx="12" cy="12" r="9.5" />
                        <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Tooltip>
                  </div>
                </label>
                <div className="text-sm text-gray-600 ml-7">Audit only the homepage/specified URL</div>
              </div>
              
              <div className="py-2">
                <label htmlFor="all-pages" className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    id="all-pages"
                    name="auditScope"
                    value="all"
                    checked={auditScope === 'all'}
                    onChange={() => handleAuditScopeChange('all')}
                    className="h-4 w-4 text-[#42499c] border-black focus:ring-[#42499c]"
                    style={{ accentColor: '#42499c' }}
                  />
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    All Discoverable Pages
                    <Tooltip
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Discover All Website Pages</p>
                          <p>This option scans the website to find all pages through:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>XML Sitemaps</li>
                            <li>Internal navigation links</li>
                            <li>Common page patterns</li>
                          </ul>
                          <div className="mt-3 p-2 bg-blue-900 rounded text-white">
                            <p className="font-medium">How it works:</p>
                            <p className="text-sm">1. We'll scrape the site to count all discoverable pages</p>
                            <p className="text-sm">2. You can set how many pages to audit (default: 50)</p>
                            <p className="text-sm">3. Click "Start Audit" when ready</p>
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <svg className="w-5 h-5 text-black hover:text-[#42499c] cursor-help transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                        <circle cx="12" cy="12" r="9.5" />
                        <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Tooltip>
                  </div>
                </label>
                <div className="text-sm text-gray-600 ml-7">Scan sitemap and internal links to audit all pages</div>

                {/* Show all page discovery info when "All Discoverable Pages" is selected */}
                {auditScope === 'all' && (
                  <div className="ml-7 mt-3 space-y-3">
                    {/* Page Discovery Status */}
                    {isCountingPages ? (
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                        <LoadingSpinner size="sm" />
                        <span className="text-blue-700">Discovering all pages...</span>
                      </div>
                    ) : allPagesCount !== null ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-blue-900">
                            {(() => {
                              const filteredCount = getFilteredPageCount('all')
                              const hasExclusions = excludedPaths.length > 0 && filteredCount < allPagesCount

                              if (hasExclusions) {
                                return `${filteredCount.toLocaleString()} pages (${allPagesCount.toLocaleString()} discovered, ${allPagesCount - filteredCount} excluded)`
                              }
                              return allPagesCount === 1 ? '1 page discovered' : `${allPagesCount.toLocaleString()} pages discovered`
                            })()}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          {(() => {
                            const filteredCount = getFilteredPageCount('all')
                            const effectiveCount = excludedPaths.length > 0 ? filteredCount : allPagesCount

                            if (pageLimit !== null && effectiveCount > pageLimit) {
                              return `This website has ${effectiveCount.toLocaleString()} pages${excludedPaths.length > 0 ? ' (after exclusions)' : ''}, but audit is limited to ${pageLimit} pages.`
                            } else if (pageLimit !== null) {
                              return `Audit will analyze all ${effectiveCount.toLocaleString()} pages (within ${pageLimit} page limit).`
                            } else {
                              return `All ${effectiveCount.toLocaleString()} pages will be analyzed.`
                            }
                          })()}
                        </p>
                      </div>
                    ) : null}

                    {/* Page Limit Notice - Only show when limiting is actually happening */}
                    {allPagesCount !== null && (pageLimit === null || allPagesCount > pageLimit) && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-amber-900">
                            {pageLimit === null
                              ? 'No page limit set'
                              : `Auditing ${Math.min(pageLimit, allPagesCount)} of ${allPagesCount.toLocaleString()} pages`}
                          </span>
                        </div>
                        <p className="text-xs text-amber-700 mb-2">
                          {pageLimit === null
                            ? 'All discoverable pages will be analyzed. This may take longer and incur higher costs.'
                            : `Limiting to ${pageLimit} pages helps control processing time and API costs.`
                          }
                        </p>
                      </div>
                    )}

                    {/* Page Limit Controls - Always available when pages are discovered */}
                    {allPagesCount !== null && (
                      <div className={pageLimit === null || allPagesCount > pageLimit ? '' : 'mt-3'}>
                      {/* Page Limit Controls Toggle */}
                      {!showPageLimitControls && (
                        <button
                          type="button"
                          onClick={() => setShowPageLimitControls(true)}
                          className="text-xs text-blue-800 hover:text-blue-900 font-medium underline"
                        >
                          Change page limit settings
                        </button>
                      )}

                      {/* Page Limit Controls Expanded */}
                      {showPageLimitControls && (
                        <div className="space-y-3 mt-2">
                          {/* Remove Limit Option */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pageLimit === null}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPageLimit(null)
                                } else {
                                  setPageLimit(50)
                                }
                              }}
                              className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                            />
                            <span className="text-sm text-amber-900">Remove page limit (analyze all pages)</span>
                          </label>

                          {/* Custom Page Limit */}
                          {pageLimit !== null && (
                            <div className="flex items-center gap-3">
                              <label htmlFor="pageLimit" className="text-sm text-amber-900 whitespace-nowrap">
                                Custom limit:
                              </label>
                              <input
                                type="number"
                                id="pageLimit"
                                min="1"
                                max="500"
                                value={pageLimit}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value)
                                  if (!isNaN(value) && value > 0) {
                                    setPageLimit(value)
                                  }
                                }}
                                className="w-24 px-3 py-1.5 text-sm border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              />
                              <span className="text-sm text-amber-700">pages</span>
                            </div>
                          )}

                          {/* Path Exclusion */}
                          <div className="space-y-2 pt-3 border-t border-amber-300">
                            <label className="text-sm font-medium text-amber-900">Exclude Paths</label>
                            <p className="text-xs text-amber-700">
                              Exclude specific paths from analysis (e.g., /blog, /admin)
                            </p>

                            {/* Excluded paths chips */}
                            {excludedPaths.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {excludedPaths.map((path, index) => (
                                  <div
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-200 border border-amber-400 rounded text-xs text-amber-900"
                                  >
                                    <span>{path}</span>
                                    <button
                                      type="button"
                                      onClick={() => setExcludedPaths(prev => prev.filter((_, i) => i !== index))}
                                      className="hover:text-red-700 font-bold"
                                      aria-label="Remove path"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add path input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={excludeInput}
                                onChange={(e) => setExcludeInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const path = excludeInput.trim()
                                    if (path && !excludedPaths.includes(path)) {
                                      const normalizedPath = path.startsWith('/') ? path : `/${path}`
                                      setExcludedPaths(prev => [...prev, normalizedPath])
                                      setExcludeInput('')
                                    }
                                  }
                                }}
                                placeholder="/blog"
                                className="flex-1 px-2 py-1.5 text-sm border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const path = excludeInput.trim()
                                  if (path && !excludedPaths.includes(path)) {
                                    const normalizedPath = path.startsWith('/') ? path : `/${path}`
                                    setExcludedPaths(prev => [...prev, normalizedPath])
                                    setExcludeInput('')
                                  }
                                }}
                                className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Cost Estimate */}
                          <div className="p-2 bg-amber-100 rounded border border-amber-300">
                            <p className="text-xs font-medium text-amber-900 mb-1">💰 Estimated Cost Impact</p>
                            <p className="text-xs text-amber-800">
                              {pageLimit === null
                                ? 'Unlimited analysis may result in higher API costs (Keywords Everywhere & Serper)'
                                : pageLimit <= 25
                                  ? 'Low cost - minimal API usage'
                                  : pageLimit <= 50
                                    ? 'Moderate cost - balanced analysis'
                                    : pageLimit <= 100
                                      ? 'Higher cost - comprehensive analysis'
                                      : 'Very high cost - extensive API usage'
                              }
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowPageLimitControls(false)}
                            className="text-xs text-amber-800 hover:text-amber-900 font-medium underline"
                          >
                            Hide settings
                          </button>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                )}
              </div>

              <div className="py-2">
                <label htmlFor="custom-pages" className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    id="custom-pages"
                    name="auditScope"
                    value="custom"
                    checked={auditScope === 'custom'}
                    onChange={() => handleAuditScopeChange('custom')}
                    className="h-4 w-4 text-[#42499c] border-black focus:ring-[#42499c]"
                    style={{ accentColor: '#42499c' }}
                  />
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    Select Specific Pages
                    <Tooltip 
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Custom Page Selection</p>
                          <p>This option lets you choose exactly which pages to audit:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Click "Discover Pages" to find available pages</li>
                            <li>Select/deselect individual pages</li>
                            <li>Perfect for targeted analysis</li>
                          </ul>
                          <div className="mt-3 p-2 bg-blue-900 rounded text-white">
                            <p className="font-medium">✓ Full control over audit scope</p>
                            <p className="text-sm">Ideal for focusing on specific sections or page types.</p>
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <svg className="w-5 h-5 text-black hover:text-[#42499c] cursor-help transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                        <circle cx="12" cy="12" r="9.5" />
                        <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Tooltip>
                  </div>
                </label>
                <div className="text-sm text-gray-600 ml-7">Choose which pages to include in the audit</div>

                {/* Show discovery status when custom scope is selected */}
                {auditScope === 'custom' && (
                  <div className="ml-7 mt-3">
                    {isDiscoveringPages ? (
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                        <LoadingSpinner size="sm" />
                        <span className="text-blue-700">Discovering all pages...</span>
                      </div>
                    ) : discoveredPages.length > 0 ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-blue-900">
                            {(() => {
                              const totalPages = discoveredPages.length
                              const filteredCount = getFilteredPageCount('custom')
                              const hasExclusions = excludedPaths.length > 0 && filteredCount < totalPages

                              if (hasExclusions) {
                                return `${filteredCount.toLocaleString()} pages (${totalPages.toLocaleString()} discovered, ${totalPages - filteredCount} excluded)`
                              }
                              return totalPages === 1 ? '1 page discovered' : `${totalPages.toLocaleString()} pages discovered`
                            })()}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          Select the pages you want to audit from the list below{excludedPaths.length > 0 ? ' (excluded pages are hidden)' : ''}.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Page Selection for Custom Scope */}
            {auditScope === 'custom' && discoveredPages.length > 0 && (
              <div className="ml-7 mt-3 space-y-3">
                {/* Page Selection Controls */}
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-900">
                    Select Pages ({discoveredPages.filter(p => p.selected && !isPathExcluded(p.url)).length} of {getFilteredPageCount('custom')} selected)
                  </h4>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setDiscoveredPages(prev => prev.map(p => ({ ...p, selected: true })))}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscoveredPages(prev => prev.map(p => ({ ...p, selected: false })))}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Select None
                    </button>
                  </div>
                </div>

                {/* Common Paths Analysis */}
                {(() => {
                  // Analyze discovered pages to find common path patterns
                  const pathCounts = new Map<string, number>()
                  discoveredPages.forEach(page => {
                    const pattern = extractPathPattern(page.url)
                    if (pattern) {
                      pathCounts.set(pattern, (pathCounts.get(pattern) || 0) + 1)
                    }
                  })

                  // Filter to only show paths with multiple pages and not already excluded
                  const commonPaths = Array.from(pathCounts.entries())
                    .filter(([path, count]) => count > 1 && !excludedPaths.includes(path))
                    .sort((a, b) => b[1] - a[1]) // Sort by count descending

                  if (commonPaths.length === 0) return null

                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-amber-900">Common Paths (Quick Exclude)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {commonPaths.map(([path, count]) => (
                          <button
                            key={path}
                            type="button"
                            onClick={() => {
                              if (!excludedPaths.includes(path)) {
                                setExcludedPaths(prev => [...prev, path])
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-amber-300 rounded text-xs text-amber-900 hover:bg-amber-100 transition-colors"
                            title={`Exclude all ${count} pages under ${path}`}
                          >
                            <span className="font-medium">{path}</span>
                            <span className="text-amber-600">({count})</span>
                            <span className="text-red-600 ml-1">✕</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Page List */}
                <div className="p-3 bg-white border border-gray-200 rounded-lg max-h-60 overflow-y-auto space-y-2">
                  {discoveredPages.filter(page => !isPathExcluded(page.url)).map((page) => {
                    const pathPattern = extractPathPattern(page.url)
                    return (
                      <div key={page.url} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded group">
                        <input
                          type="checkbox"
                          id={page.url}
                          checked={page.selected}
                          onChange={() => handlePageToggle(page.url)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={page.url} className="text-sm font-medium text-gray-900 cursor-pointer block">
                            {page.title}
                          </label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-xs text-gray-500 truncate flex-1">{page.url}</div>
                            {pathPattern && (
                              <button
                                type="button"
                                onClick={() => quickExcludePath(page.url)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 bg-red-100 text-red-700 hover:bg-red-200 rounded border border-red-300 whitespace-nowrap"
                                title={`Exclude all pages under ${pathPattern}`}
                              >
                                ✕ Exclude {pathPattern}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Path Exclusion for Custom Pages */}
                <div className="space-y-2 pt-3 border-t border-gray-300">
                  <label className="text-sm font-medium text-gray-900">Exclude Paths</label>
                  <p className="text-xs text-gray-600">
                    Exclude specific paths from analysis (e.g., /blog, /admin)
                  </p>

                  {/* Excluded paths chips */}
                  {excludedPaths.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {excludedPaths.map((path, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 border border-gray-400 rounded text-xs text-gray-900"
                        >
                          <span>{path}</span>
                          <button
                            type="button"
                            onClick={() => setExcludedPaths(prev => prev.filter((_, i) => i !== index))}
                            className="hover:text-red-700 font-bold"
                            aria-label="Remove path"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add path input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const path = excludeInput.trim()
                          if (path && !excludedPaths.includes(path)) {
                            const normalizedPath = path.startsWith('/') ? path : `/${path}`
                            setExcludedPaths(prev => [...prev, normalizedPath])
                            setExcludeInput('')
                          }
                        }
                      }}
                      placeholder="/blog"
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const path = excludeInput.trim()
                        if (path && !excludedPaths.includes(path)) {
                          const normalizedPath = path.startsWith('/') ? path : `/${path}`
                          setExcludedPaths(prev => [...prev, normalizedPath])
                          setExcludeInput('')
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary for All Pages */}
            {auditScope === 'all' && discoveredPages.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-blue-900">
                    {discoveredPages.length} pages discovered and will be audited
                  </div>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  This will provide comprehensive insights across your entire website
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Audit Sections ({selectedSections.length} selected)
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {(() => {
                const phase1Sections = AUDIT_SECTIONS.filter(section => section.phase !== 2);
                const allPhase1Selected = phase1Sections.every(section => selectedSections.includes(section.id));
                return allPhase1Selected ? 'Unselect All' : 'Select All';
              })()}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AUDIT_SECTIONS.map((section, index) => {
              const isFirstPhase2 = section.phase === 2 && (index === 0 || AUDIT_SECTIONS[index - 1]?.phase !== 2)

              return (
                <React.Fragment key={section.id}>
                  {isFirstPhase2 && (
                    <div className="col-span-1 md:col-span-3 flex items-center my-4">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="px-4 text-sm font-medium text-gray-600">Phase 2</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                  )}
                  <div
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedSections.includes(section.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={section.id}
                        checked={selectedSections.includes(section.id)}
                        onChange={() => handleSectionToggle(section.id)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <label htmlFor={section.id} className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                              {section.label}
                              {section.phase === 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ef86ce] text-white">
                                  Phase 2
                                </span>
                              )}
                            </label>
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          </div>

                          {/* Inline Country Selection for Keywords Section */}
                          {section.id === 'keywords' && selectedSections.includes('keywords') && (
                            <div className="ml-4 min-w-0 flex-shrink-0">
                              <label htmlFor={`${section.id}-country`} className="block text-xs font-medium text-gray-700 mb-1">
                                Target Country
                              </label>
                              <div className="relative">
                                <select
                                  id={`${section.id}-country`}
                                  value={country}
                                  onChange={(e) => setCountry(e.target.value)}
                                  className="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                                  disabled={isLoading}
                                >
                                  {COUNTRIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                      {c.flag} {c.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Audit Views */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Audit View
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Choose how you want to view the audit results. You can change this later.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Executive View */}
            <button
              type="button"
              onClick={() => setAuditView('executive')}
              className={`relative p-6 border-2 rounded-lg transition-all text-left ${
                auditView === 'executive'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="font-semibold text-gray-900">Executive View</h4>
                </div>
                {auditView === 'executive' && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Clean, high-level summary perfect for presenting to clients and stakeholders.
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Summary only</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>All details collapsed</span>
                </div>
              </div>
            </button>

            {/* Manager View */}
            <button
              type="button"
              onClick={() => setAuditView('manager')}
              className={`relative p-6 border-2 rounded-lg transition-all text-left ${
                auditView === 'manager'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h4 className="font-semibold text-gray-900">Manager View</h4>
                </div>
                {auditView === 'manager' && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Balanced view with key insights and priority issues for task delegation.
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Summary + key sections</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Top issues expanded</span>
                </div>
              </div>
            </button>

            {/* Developer View */}
            <button
              type="button"
              onClick={() => setAuditView('developer')}
              className={`relative p-6 border-2 rounded-lg transition-all text-left ${
                auditView === 'developer'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <h4 className="font-semibold text-gray-900">Developer View</h4>
                </div>
                {auditView === 'developer' && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Complete technical breakdown with all details for implementing fixes.
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Everything expanded</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Full technical details</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Estimated Cost Section */}
        {isValidUrl && estimatedCost.total > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
                <text x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">£</text>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Estimated Audit Cost</h3>
            </div>

            {/* Page Count Display */}
            <div className="mb-3 p-2 bg-blue-100 rounded border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Pages to audit:</strong> {(() => {
                  if (auditScope === 'single') {
                    return '1 page'
                  } else if (auditScope === 'custom' && discoveredPages.length > 0) {
                    const count = discoveredPages.filter(p => p.selected && !isPathExcluded(p.url)).length
                    return `${count.toLocaleString()} ${count === 1 ? 'page' : 'pages'}`
                  } else if (auditScope === 'all') {
                    const filteredCount = getFilteredPageCount('all')
                    const effectiveCount = filteredCount || allPagesCount || 50
                    const count = pageLimit !== null ? Math.min(pageLimit, effectiveCount) : effectiveCount
                    return `${count.toLocaleString()} ${count === 1 ? 'page' : 'pages'}`
                  }
                  return '1 page'
                })()}
              </p>
            </div>

            <div className="space-y-3">
              {/* Cost Breakdown */}
              <div className="space-y-2">
                {selectedSections.map((sectionId) => {
                  const section = AUDIT_SECTIONS.find(s => s.id === sectionId)
                  // Calculate cost for this section
                  let sectionCost = estimatedCost.claude / selectedSections.length

                  // For keywords section, include API costs
                  if (sectionId === 'keywords') {
                    sectionCost += estimatedCost.keywordsEverywhere + estimatedCost.serper
                  }

                  return (
                    <div key={sectionId} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{section?.label}</span>
                      <span className="font-semibold text-gray-900">{formatCost(sectionCost)}</span>
                    </div>
                  )
                })}

                <div className="border-t border-blue-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 text-base">Customer Price (with 100% markup)</span>
                    <div className="text-right">
                      <span className="font-bold text-2xl text-blue-600">{formatCost(estimatedCost.total)}</span>
                      <div className="text-sm text-gray-700 mt-1">
                        ({estimatedCost.creditsRequired} credits required)
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-blue-200 bg-green-50 -mx-4 px-4 py-2 rounded">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Your Actual API Cost:</span>
                      <span className="font-semibold text-green-700">{formatCost(estimatedCost.total / 2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-700">Your Profit (100% markup):</span>
                      <span className="font-bold text-green-600">{formatCost(estimatedCost.total / 2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info message */}
              <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> {selectedSections.includes('keywords')
                    ? 'Costs vary based on selected sections and page count. Keywords section uses paid APIs.'
                    : 'Without keywords section, costs are significantly lower and based primarily on automated analysis.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cost Confirmation Checkbox */}
        {isValidUrl && estimatedCost.total > 0 && (
          <div className="bg-white border-2 border-[#42499c] rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmCost}
                onChange={(e) => setConfirmCost(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900">
                  I understand this audit will cost {formatCost(estimatedCost.total)} ({estimatedCost.creditsRequired} credits) and confirm I want to proceed
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  Credits will be deducted from your account when the audit starts.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Submit Button */}
        <div className="relative">
          <button
            type="submit"
            disabled={isLoading || (estimatedCost.total > 0 && !confirmCost)}
            className={`w-full justify-center disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${
              selectedSections.length > 0
                ? 'bg-[#42499c] hover:bg-[#353f85] text-white font-medium py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200'
                : 'btn-pmw-primary'
            }`}
            style={selectedSections.length > 0 ? { borderRadius: '20px' } : {}}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Starting Audit...</span>
              </>
            ) : (
              'Start Audit'
            )}
          </button>

          {/* Error Tooltip */}
          {showErrorTooltip && error && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="relative">
                <div className="px-4 py-3 text-sm text-white bg-red-600 rounded-lg shadow-xl whitespace-nowrap max-w-sm">
                  {error}
                </div>
                {/* Arrow pointing down to button */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Page Discovery Modal - Disabled in favor of inline display */}
      {/* <PageDiscoveryModal
        isOpen={showDiscoveryModal}
        onClose={() => setShowDiscoveryModal(false)}
        websiteUrl={url.startsWith('http') ? url : `https://${url}`}
      /> */}

      {/* Website Analysis Loading Overlay */}
      {showLoadingOverlay && (
        <div className="flex items-center justify-center p-8 rounded-lg">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-gray-200">
            <div className="mb-4">
              <LoadingSpinner size="lg" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Analysing Website
            </h2>
            <p className="text-gray-600 mb-6">
              We're conducting a comprehensive audit of {selectedSections.length} {selectedSections.length === 1 ? 'section' : 'sections'}.
            </p>

            {/* Rotating Comment */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <p className="text-center text-gray-700 italic transition-opacity duration-500">
                {currentComment}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}