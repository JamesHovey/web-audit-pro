"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Tooltip from "@/components/Tooltip"
import { PageDiscoveryModal } from "@/components/PageDiscoveryModal"
import { ukDetectionService, UKDetectionResult } from "@/lib/ukDetectionService"

const AUDIT_SECTIONS = [
  {
    id: "traffic",
    label: "Traffic Insights",
    description: "Organic search performance, paid advertising metrics, and geographic distribution"
  },
  {
    id: "keywords",
    label: "Keywords",
    description: "Branded and non-branded keyword analysis with competitive intelligence"
  },
  {
    id: "performance",
    label: "Performance & Technical Audit",
    description: "Core Web Vitals, technical SEO health, image optimization, and site structure analysis"
  },
  {
    id: "backlinks",
    label: "Authority & Backlinks",
    description: "Domain authority assessment and comprehensive backlink analysis"
  },
  {
    id: "technology",
    label: "Technology Stack",
    description: "Technologies, frameworks, and platforms used in website construction"
  }
]

type AuditScope = 'single' | 'all' | 'custom'

interface PageOption {
  url: string
  title: string
  selected: boolean
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
  const [country, setCountry] = useState('gb') // Default to United Kingdom
  const [isUKCompany, setIsUKCompany] = useState(false) // New state for UK company flag
  const [ukDetection, setUkDetection] = useState<UKDetectionResult | null>(null)
  const [discoveredPages, setDiscoveredPages] = useState<PageOption[]>([])
  const [isDiscoveringPages, setIsDiscoveringPages] = useState(false)
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showErrorTooltip, setShowErrorTooltip] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(false)

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
    
    setIsDiscoveringPages(true)
    setShowDiscoveryModal(true)
    setError("")
    
    try {
      const urlToDiscover = url.startsWith('http') ? url : `https://${url}`
      
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover pages')
      setDiscoveredPages([])
    } finally {
      setIsDiscoveringPages(false)
      setShowDiscoveryModal(false)
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

  const handleAuditScopeChange = (scope: AuditScope) => {
    setAuditScope(scope)
    // Remove automatic page discovery for 'all' scope
    // Page discovery will happen during the audit process instead
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
    const allSelected = selectedSections.length === AUDIT_SECTIONS.length;
    setSelectedSections(allSelected ? [] : AUDIT_SECTIONS.map(section => section.id));
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
          country: country, // Include selected country
          isUKCompany: isUKCompany, // Include UK company flag
          pages: auditScope === 'custom' 
            ? discoveredPages.filter(page => page.selected).map(page => page.url)
            : [urlToAudit] // For both 'single' and 'all' scopes, just send the main URL
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start audit')
      }

      const data = await response.json()
      
      // Use Next.js router for client-side navigation
      router.push(`/audit/${data.id}`)
      // Don't set loading to false here - let the navigation handle it
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setShowErrorTooltip(false) // Hide tooltip for regular errors (they use the box)
      setIsLoading(false) // Only set to false on error
    }
  }

  return (
    <div className="card-pmw">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="url" className="text-sm font-medium text-gray-700">
              Website URL
            </label>
            {isValidUrl && (
              <button
                type="button"
                onClick={() => {
                  const sitemapUrl = `/sitemap?domain=${encodeURIComponent(url.startsWith('http') ? url : `https://${url}`)}`;
                  window.open(sitemapUrl, '_blank');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-[#42499c] transition-colors"
              >
                <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          <div className="relative">
            <input
              type="text"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="example.com or https://example.com"
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
          {url && !isValidUrl && (
            <p className="text-red-600 text-sm mt-1">Please enter a valid URL</p>
          )}
          
          {/* Sitemap Button */}
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
                          <p className="font-medium">Comprehensive Website Analysis</p>
                          <p>This option automatically discovers and audits all pages found through:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>XML Sitemaps</li>
                            <li>Internal navigation links</li>
                            <li>Common page patterns</li>
                          </ul>
                          <div className="mt-3 p-2 bg-blue-900 rounded text-white">
                            <p className="font-medium">✓ You can click "Start Audit" immediately</p>
                            <p className="text-sm">Page discovery happens automatically during the audit process.</p>
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
                <div className="flex items-center justify-between text-sm text-gray-600 ml-7">
                  <span>Choose which pages to include in the audit</span>
                  {auditScope === 'custom' && discoveredPages.length === 0 && (
                    <button
                      type="button"
                      onClick={discoverPages}
                      disabled={isDiscoveringPages}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#42499c] text-white rounded-md text-sm font-medium hover:bg-[#ef86ce] hover:text-[#42499c] disabled:bg-gray-400 disabled:text-white transition-colors ml-4"
                    >
                      {isDiscoveringPages ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 1H6V6L1 6V10H6V15H10V10H15V6L10 6V1Z" />
                        </svg>
                      )}
                      <span>Discover Pages</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Page Selection for Custom Scope */}
            {auditScope === 'custom' && discoveredPages.length > 0 && (
              <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">
                    Select Pages ({discoveredPages.filter(p => p.selected).length} of {discoveredPages.length} selected)
                  </h4>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setDiscoveredPages(prev => prev.map(p => ({ ...p, selected: true })))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscoveredPages(prev => prev.map(p => ({ ...p, selected: false })))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select None
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {discoveredPages.map((page) => (
                    <div key={page.url} className="flex items-start space-x-3">
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
                        <div className="text-xs text-gray-500 truncate">{page.url}</div>
                      </div>
                    </div>
                  ))}
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
              {selectedSections.length === AUDIT_SECTIONS.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIT_SECTIONS.map((section) => (
              <div
                key={section.id}
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
                        <label htmlFor={section.id} className="font-medium text-gray-900 cursor-pointer">
                          {section.label}
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
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="relative">
          <button
            type="submit"
            disabled={isLoading}
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

      {/* Website Analysis Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-lg border border-gray-200">
            <div className="mb-4">
              <LoadingSpinner size="lg" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Website
            </h3>
            <p className="text-gray-600 mb-4">
              Initializing comprehensive audit for {url.startsWith('http') ? url : `https://${url}`}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                ✓ URL validated and audit parameters configured
              </p>
              <p className="text-blue-700 text-xs mt-1">
                You'll be redirected to the live audit progress page shortly...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Discovery Modal */}
      <PageDiscoveryModal
        isOpen={showDiscoveryModal}
        onClose={() => setShowDiscoveryModal(false)}
        websiteUrl={url.startsWith('http') ? url : `https://${url}`}
      />

    </div>
  )
}