'use client'

import { useState, useEffect } from 'react'
import { Search, BarChart3, Globe, Zap, Target, CheckCircle } from 'lucide-react'

const WAITING_ACTIVITIES = [
  "🔍 Analyzing HTML structure and semantic markup...",
  "⚡ Measuring Core Web Vitals and performance metrics...",
  "🔒 Checking SSL certificates and security headers...",
  "📱 Testing mobile responsiveness across viewports...",
  "🎯 Evaluating SEO meta tags and structured data...",
  "🌐 Scanning for broken links and redirect chains...",
  "💾 Analyzing page weight and resource optimization...",
  "🚀 Testing server response times and TTFB...",
  "📊 Auditing accessibility compliance (WCAG 2.1)...",
  "🔧 Detecting CMS platform and technology stack...",
  "🎨 Reviewing image optimization and lazy loading...",
  "📈 Measuring JavaScript execution and bundle size...",
  "🔐 Verifying HTTPS implementation and mixed content...",
  "🏗️ Analyzing DOM size and rendering performance...",
  "⚙️ Checking HTTP headers and caching strategies...",
  "🌟 Evaluating schema markup and rich snippets...",
  "🔎 Scanning sitemap.xml and robots.txt configuration...",
  "💡 Testing lighthouse scores across categories...",
  "🎪 Analyzing third-party script impact...",
  "📋 Reviewing canonical tags and URL structure...",
  "🛡️ Checking for common security vulnerabilities...",
  "🎯 Measuring LCP, FID, and CLS metrics...",
  "🔄 Testing browser caching and compression...",
  "📊 Analyzing crawlability and indexation issues...",
  "🌍 Checking internationalization and hreflang tags...",
  "⚡ Evaluating render-blocking resources...",
  "🔧 Scanning for deprecated HTML and CSS...",
  "📱 Testing touch targets and mobile usability...",
  "🎨 Analyzing contrast ratios for readability...",
  "🚀 Measuring Time to Interactive (TTI)...",
  "🔍 Checking meta descriptions and title tags...",
  "💾 Analyzing database queries and N+1 issues...",
  "🌐 Testing CDN configuration and asset delivery...",
  "📈 Evaluating conversion funnel performance...",
  "🔒 Scanning HTTP security headers (CSP, HSTS)...",
  "🎯 Measuring First Contentful Paint (FCP)..."
]

// Section configurations with realistic time estimates
const SECTION_CONFIG = {
  keywords: {
    name: "Keyword Analysis",
    icon: Search,
    estimatedTime: 60, // seconds
    steps: [
      { name: "Analysing business type", time: 15 },
      { name: "Discovering branded keywords", time: 20 },
      { name: "Finding competitor keywords", time: 15 },
      { name: "Getting real search volumes", time: 10 }
    ],
    color: "#4F46E5"
  },
  traffic: {
    name: "Traffic Analysis", 
    icon: BarChart3,
    estimatedTime: 45,
    steps: [
      { name: "Estimating organic traffic", time: 15 },
      { name: "Analysing traffic patterns", time: 15 },
      { name: "Geographic distribution", time: 15 }
    ],
    color: "#059669"
  },
  performance: {
    name: "Performance Audit",
    icon: Zap,
    estimatedTime: 50,
    steps: [
      { name: "Testing page load speeds", time: 20 },
      { name: "Core Web Vitals analysis", time: 15 },
      { name: "Mobile responsiveness check", time: 15 }
    ],
    color: "#DC2626"
  },
  backlinks: {
    name: "Authority & Backlinks",
    icon: Globe,
    estimatedTime: 40,
    steps: [
      { name: "Scanning backlink profile", time: 20 },
      { name: "Evaluating link quality", time: 10 },
      { name: "Finding opportunities", time: 10 }
    ],
    color: "#7C2D12"
  },
  technology: {
    name: "Technology Stack",
    icon: Target,
    estimatedTime: 35,
    steps: [
      { name: "Detecting CMS platform", time: 10 },
      { name: "Analysing frameworks", time: 15 },
      { name: "Security assessment", time: 10 }
    ],
    color: "#1F2937"
  },
  accessibility: {
    name: "Accessibility",
    icon: CheckCircle,
    estimatedTime: 60,
    steps: [
      { name: "Running axe-core WCAG tests", time: 20 },
      { name: "Running Pa11y compliance scan", time: 20 },
      { name: "Analysing accessibility issues", time: 15 },
      { name: "Generating fix recommendations", time: 5 }
    ],
    color: "#7C3AED"
  }
}

interface LoadingMessagesProps {
  section?: string
  className?: string
  progress?: {
    currentSection: string
    completedSections: number
    totalSections: number
    status: 'running' | 'completed'
  }
  startTime?: Date
}

export default function LoadingMessages({ section, className = "", progress, startTime }: LoadingMessagesProps) {
  const [currentActivity, setCurrentActivity] = useState(0)
  
  // Rotate waiting activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % WAITING_ACTIVITIES.length)
    }, 12000) // 12 seconds per message for better readability of technical content

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex flex-col items-center justify-center h-screen px-8 overflow-hidden ${className}`}>
      {/* Centered container with border only */}
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-8 mx-auto my-auto">
        
        {/* Header - Minimal */}
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-black">
              Analysing Website
            </h2>
            <p className="text-base text-black mt-2">
              Please wait while we analyse your website
            </p>
          </div>
        </div>


        {/* Waiting activity with single icon matching PMW colors */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center space-x-3">
            <BarChart3 className="w-6 h-6 text-red-700" />
            <p className="text-base text-gray-800 font-medium text-center">
              {WAITING_ACTIVITIES[currentActivity]}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}