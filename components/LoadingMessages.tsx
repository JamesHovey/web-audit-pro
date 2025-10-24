'use client'

import { useState, useEffect } from 'react'
import { Search, BarChart3, Globe, Zap, Target, CheckCircle } from 'lucide-react'

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
    }, 8000) // Slower rotation for better readability

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