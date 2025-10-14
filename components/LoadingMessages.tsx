'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search, BarChart3, Globe, Zap, Target, TrendingUp, Coffee, Heart, Brain, Dumbbell, Book, Music, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const WAITING_ACTIVITIES = [
  "☕ Perfect time to grab a coffee...",
  "🧘‍♀️ Quick meditation break? Your site's being analyzed...",
  "🍵 Tea time! We're diving deep into your data...",
  "🤸‍♂️ Do a quick stretch - we're crunching the numbers...",
  "📱 Check your messages while we audit...",
  "🎵 Play your favorite song - this won't take long...",
  "💭 Dream about your improved rankings...",
  "🏃‍♀️ Quick walk around the office?",
  "🍿 Grab a snack, we're almost there...",
  "🧠 Plan your content strategy...",
  "📚 Bookmark that article you've been meaning to read...",
  "🎯 Set your SEO goals for next quarter...",
  "💪 Do 10 push-ups - stay sharp!",
  "🌱 Water your desk plant, we've got this...",
  "🎨 Doodle your success story...",
  "🐕 Pet your dog - they deserve it...",
  "🎮 Quick game break? We're processing...",
  "📸 Take a selfie to commemorate this audit...",
  "✨ Manifest your traffic goals...",
  "🍕 Order lunch? We'll be done soon...",
  "🎪 Practice your victory dance...",
  "🔮 Predict your future rankings...",
  "🎸 Air guitar solo time!",
  "🌟 Count your blessings while we count your keywords...",
  "🎭 Practice your pitch for the results...",
  "🦄 Believe in SEO magic happening right now...",
  "🏖️ Plan your vacation with all that new traffic...",
  "🎯 Visualize page one rankings...",
  "🚀 Prepare for takeoff - almost ready!",
  "🎨 Imagine your improved conversion rates..."
]

// Section configurations with realistic time estimates
const SECTION_CONFIG = {
  keywords: {
    name: "Keyword Analysis",
    icon: Search,
    estimatedTime: 60, // seconds
    steps: [
      { name: "Analyzing business type with Claude AI", time: 15 },
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
      { name: "Analyzing traffic patterns", time: 15 },
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
      { name: "Analyzing frameworks", time: 15 },
      { name: "Security assessment", time: 10 }
    ],
    color: "#1F2937"
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
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentActivity, setCurrentActivity] = useState(0)

  // Get current section configuration
  const currentSectionKey = progress?.currentSection || section || 'keywords'
  const sectionConfig = SECTION_CONFIG[currentSectionKey as keyof typeof SECTION_CONFIG]
  
  // Rotate waiting activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % WAITING_ACTIVITIES.length)
    }, 8000) // Slower rotation for better readability

    return () => clearInterval(interval)
  }, [])

  // Update elapsed time
  useEffect(() => {
    if (startTime) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateProgress = () => {
    if (!progress) return 0
    return Math.round((progress.completedSections / progress.totalSections) * 100)
  }

  const getTotalEstimatedTime = () => {
    if (!progress) return '2-4 minutes'
    
    // Base estimate on actual section count with realistic times
    const baseTimePerSection = 60 // 1 minute average per section
    const totalSeconds = progress.totalSections * baseTimePerSection
    const totalMinutes = Math.ceil(totalSeconds / 60)
    
    // Add some buffer for variability
    const minTime = Math.max(1, totalMinutes - 1)
    const maxTime = totalMinutes + 2
    
    return `${minTime}-${maxTime} minutes`
  }

  const getRemainingTime = () => {
    if (!progress) return '2-4 minutes'
    
    const remainingSections = progress.totalSections - progress.completedSections
    if (remainingSections <= 0) return 'Finalizing...'
    
    // More realistic remaining time based on actual progress
    if (remainingSections === 1 && progress.status === 'running') {
      return 'Less than 1 minute'
    }
    
    const avgTimePerSection = 60 // seconds
    const remainingSeconds = remainingSections * avgTimePerSection
    
    if (remainingSeconds < 60) {
      return `~${Math.max(30, remainingSeconds)} seconds`
    }
    
    const remainingMinutes = Math.ceil(remainingSeconds / 60)
    return remainingMinutes === 1 ? '~1 minute' : `~${remainingMinutes} minutes`
  }

  const getCurrentSectionProgress = () => {
    if (!progress) return 0
    
    // Show progress based on actual status
    if (progress.status === 'completed') return 100
    if (progress.status === 'running') {
      // For running sections, show partial progress
      return 50 // Show that we're working on it
    }
    
    return 0
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen py-6 px-8 ${className}`}>
      {/* Centered container with border only */}
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-8 mx-auto">
        
        {/* Header - Minimal */}
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-black">
              Analyzing Website
            </h2>
            <p className="text-base text-black mt-2">
              Please wait while we analyze your website
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