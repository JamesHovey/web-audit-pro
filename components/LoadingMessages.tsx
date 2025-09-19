'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search, BarChart3, Globe, Zap, Target, TrendingUp } from 'lucide-react'

const LOADING_MESSAGES = [
  "🔍 Analyzing your website's SEO performance...",
  "📊 Gathering keyword intelligence from Google...",
  "🚀 Checking domain authority across multiple sources...",
  "💡 Discovering ranking opportunities...",
  "🎯 Analyzing competitor strategies...",
  "📈 Calculating traffic patterns...",
  "🔗 Evaluating backlink profiles...",
  "⚡ Processing real-time search data...",
  "🌐 Scanning technical SEO factors...",
  "📱 Checking mobile optimization...",
  "🎨 Analyzing user experience signals...",
  "🔧 Running comprehensive site diagnostics...",
  "📋 Compiling detailed insights...",
  "🎪 Almost ready to unveil your audit results...",
  "⭐ Putting the finishing touches on your report...",
  "🧙‍♂️ Working some SEO magic...",
  "🔮 Predicting future ranking potential...",
  "🏆 Identifying your competitive advantages...",
  "💻 Cross-referencing with industry benchmarks...",
  "🎉 Preparing your personalized recommendations...",
]

const SECTION_SPECIFIC_MESSAGES = {
  keywords: [
    "🔤 Extracting relevant keywords from your content...",
    "📝 Analyzing keyword density and distribution...",
    "🎯 Identifying high-value search opportunities...",
    "📊 Checking real Google ranking positions...",
    "🏷️ Categorizing keyword intent and difficulty...",
    "🌟 Finding your keyword goldmine...",
  ],
  traffic: [
    "📈 Estimating organic traffic potential...",
    "🌊 Analyzing traffic flow patterns...",
    "📍 Calculating geographic traffic distribution...",
    "🎭 Understanding visitor behavior...",
    "💹 Projecting growth opportunities...",
  ],
  backlinks: [
    "🔗 Scanning backlink ecosystem...",
    "⚖️ Evaluating link quality and authority...",
    "🕵️ Detecting toxic links...",
    "🏗️ Mapping link building opportunities...",
  ],
  performance: [
    "⚡ Testing page load speeds...",
    "📱 Checking mobile responsiveness...",
    "🎨 Analyzing Core Web Vitals...",
    "🔧 Identifying performance bottlenecks...",
  ]
}

interface LoadingMessagesProps {
  section?: string
  className?: string
}

export default function LoadingMessages({ section, className = "" }: LoadingMessagesProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Choose message pool based on section
  const messages = section && SECTION_SPECIFIC_MESSAGES[section as keyof typeof SECTION_SPECIFIC_MESSAGES] 
    ? SECTION_SPECIFIC_MESSAGES[section as keyof typeof SECTION_SPECIFIC_MESSAGES]
    : LOADING_MESSAGES

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentMessage(prev => (prev + 1) % messages.length)
        setIsVisible(true)
      }, 200)
    }, 2500)

    return () => clearInterval(interval)
  }, [messages.length])

  const getIcon = () => {
    const icons = [Search, BarChart3, Globe, Zap, Target, TrendingUp]
    const IconComponent = icons[currentMessage % icons.length]
    return <IconComponent className="w-6 h-6 text-blue-500" />
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 space-y-6 ${className}`}>
      {/* Animated loading spinner with pulsing dots */}
      <div className="flex items-center space-x-2">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Rotating message with icon */}
      <div className={`flex items-center space-x-3 transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className="text-gray-600 text-center max-w-md font-medium">
          {messages[currentMessage]}
        </p>
      </div>

      {/* Progress bar animation */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
      </div>

      {/* Subtle hint text */}
      <p className="text-sm text-gray-400 text-center max-w-sm">
        This usually takes 30-60 seconds. We're gathering data from multiple sources to give you the most accurate insights.
      </p>
    </div>
  )
}