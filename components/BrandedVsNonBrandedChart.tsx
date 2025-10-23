'use client'

import { HelpCircle, PieChart } from 'lucide-react'
import Tooltip from './Tooltip'

interface BrandedVsNonBrandedChartProps {
  brandedKeywords: any[]
  nonBrandedKeywords: any[]
}

export default function BrandedVsNonBrandedChart({
  brandedKeywords,
  nonBrandedKeywords
}: BrandedVsNonBrandedChartProps) {
  // Function to scroll to branded keywords section
  const scrollToBrandedSection = () => {
    const section = document.getElementById('branded-keywords-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const brandedCount = brandedKeywords?.length || 0
  const nonBrandedCount = nonBrandedKeywords?.length || 0
  const totalCount = brandedCount + nonBrandedCount

  const brandedPercentage = totalCount > 0 ? Math.round((brandedCount / totalCount) * 100) : 0
  const nonBrandedPercentage = totalCount > 0 ? 100 - brandedPercentage : 0 // Ensure they add up to 100%

  // Calculate SVG pie chart paths
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const brandedLength = (brandedPercentage / 100) * circumference
  const nonBrandedLength = (nonBrandedPercentage / 100) * circumference

  // Calculate curved paths for text
  const pathRadius = 90 // Radius for text path (middle of the segment)

  const nonBrandedStartAngle = -90
  const nonBrandedEndAngle = -90 + nonBrandedPercentage * 3.6
  const nonBrandedMidAngle = (nonBrandedStartAngle + nonBrandedEndAngle) / 2

  const brandedStartAngle = nonBrandedEndAngle
  const brandedEndAngle = brandedStartAngle + brandedPercentage * 3.6
  const brandedMidAngle = (brandedStartAngle + brandedEndAngle) / 2

  // Create arc paths - reverse direction for bottom half to keep text upright
  // Non-branded path
  const nbArcSpan = nonBrandedPercentage * 3.6 / 2 * 0.8 // Use 80% of segment for text
  const nbPathStartAngle = nonBrandedMidAngle - nbArcSpan
  const nbPathEndAngle = nonBrandedMidAngle + nbArcSpan

  // Check if midpoint is on bottom half (between 0 and 180 degrees)
  const nbIsBottomHalf = (nonBrandedMidAngle >= 0 && nonBrandedMidAngle <= 180)

  let nbStartX, nbStartY, nbEndX, nbEndY, nbSweepFlag
  if (nbIsBottomHalf) {
    // Reverse the path for bottom half
    nbStartX = 200 + pathRadius * Math.cos(nbPathEndAngle * Math.PI / 180)
    nbStartY = 130 + pathRadius * Math.sin(nbPathEndAngle * Math.PI / 180)
    nbEndX = 200 + pathRadius * Math.cos(nbPathStartAngle * Math.PI / 180)
    nbEndY = 130 + pathRadius * Math.sin(nbPathStartAngle * Math.PI / 180)
    nbSweepFlag = 0 // counter-clockwise
  } else {
    nbStartX = 200 + pathRadius * Math.cos(nbPathStartAngle * Math.PI / 180)
    nbStartY = 130 + pathRadius * Math.sin(nbPathStartAngle * Math.PI / 180)
    nbEndX = 200 + pathRadius * Math.cos(nbPathEndAngle * Math.PI / 180)
    nbEndY = 130 + pathRadius * Math.sin(nbPathEndAngle * Math.PI / 180)
    nbSweepFlag = 1 // clockwise
  }

  // Branded path
  const bArcSpan = brandedPercentage * 3.6 / 2 * 0.8
  const bPathStartAngle = brandedMidAngle - bArcSpan
  const bPathEndAngle = brandedMidAngle + bArcSpan

  const bIsBottomHalf = (brandedMidAngle >= 0 && brandedMidAngle <= 180)

  let bStartX, bStartY, bEndX, bEndY, bSweepFlag
  if (bIsBottomHalf) {
    bStartX = 200 + pathRadius * Math.cos(bPathEndAngle * Math.PI / 180)
    bStartY = 130 + pathRadius * Math.sin(bPathEndAngle * Math.PI / 180)
    bEndX = 200 + pathRadius * Math.cos(bPathStartAngle * Math.PI / 180)
    bEndY = 130 + pathRadius * Math.sin(bPathStartAngle * Math.PI / 180)
    bSweepFlag = 0
  } else {
    bStartX = 200 + pathRadius * Math.cos(bPathStartAngle * Math.PI / 180)
    bStartY = 130 + pathRadius * Math.sin(bPathStartAngle * Math.PI / 180)
    bEndX = 200 + pathRadius * Math.cos(bPathEndAngle * Math.PI / 180)
    bEndY = 130 + pathRadius * Math.sin(bPathEndAngle * Math.PI / 180)
    bSweepFlag = 1
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-5 h-5 text-[#42499c]" />
        <h3 className="text-lg font-semibold text-gray-900">Branded vs Non-Branded Keywords</h3>
        <Tooltip
          content={
            <div className="max-w-md">
              <p className="font-semibold mb-3">Why This Matters</p>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">Understanding Search Intent</p>
                  <p className="text-gray-200">
                    <strong>Branded keywords</strong> (like your company name) indicate searchers already know about you.
                    They're further along in the buyer journey with higher conversion rates.
                  </p>
                  <p className="text-gray-200 mt-1">
                    <strong>Business-relevant keywords</strong> capture people who have a need but don't yet know about your solution.
                    These represent your true growth opportunity.
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Accurate Performance Assessment</p>
                  <p className="text-gray-200">
                    Strong brand keyword rankings are relatively easy to achieve. But ranking for competitive industry terms?
                    That's where real SEO work happens.
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Resource Allocation</p>
                  <ul className="list-disc list-inside text-gray-200 space-y-1">
                    <li>Don't waste time optimizing pages that already rank #1 for your brand</li>
                    <li>If most traffic comes from brand terms, you need more content targeting business keywords</li>
                    <li>Your visibility for non-brand terms shows market share you're capturing</li>
                  </ul>
                </div>

                <div className="bg-blue-900/30 rounded p-2 mt-2">
                  <p className="text-xs text-gray-200">
                    <strong>Key Insight:</strong> This distinction separates "demand you've already created" from "demand you're trying to capture."
                  </p>
                </div>
              </div>
            </div>
          }
          position="top"
        >
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        </Tooltip>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* 3D Pie Chart */}
        <div className="flex justify-center">
          <div className="relative w-full h-80" style={{ perspective: '600px' }}>
            <svg viewBox="0 0 400 280" className="w-full h-full" style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}>
              <defs>
                {/* Gradients for 3D effect */}
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#5a67d8', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#42499c', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="blueGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#4a57b8', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#3a3d7a', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#38c172', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#27ae60', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="greenGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#2d9b5d', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#1e8449', stopOpacity: 1 }} />
                </linearGradient>
                <radialGradient id="innerShadow">
                  <stop offset="60%" style={{ stopColor: '#f8f9fa', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#e9ecef', stopOpacity: 1 }} />
                </radialGradient>

                {/* Curved text paths */}
                <path
                  id="nonBrandedTextPath"
                  d={`M ${nbStartX} ${nbStartY} A ${pathRadius} ${pathRadius} 0 0 ${nbSweepFlag} ${nbEndX} ${nbEndY}`}
                  fill="none"
                />
                <path
                  id="brandedTextPath"
                  d={`M ${bStartX} ${bStartY} A ${pathRadius} ${pathRadius} 0 0 ${bSweepFlag} ${bEndX} ${bEndY}`}
                  fill="none"
                />
              </defs>

              {/* 3D depth layers (bottom) */}
              <g transform="translate(80, 30)">
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  fill="none"
                  stroke="rgba(39, 174, 96, 0.3)"
                  strokeWidth="45"
                  strokeDasharray={`${nonBrandedLength} ${brandedLength}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 120 120)"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  fill="none"
                  stroke="rgba(66, 73, 156, 0.3)"
                  strokeWidth="45"
                  strokeDasharray={`${brandedLength} ${nonBrandedLength}`}
                  strokeDashoffset={-nonBrandedLength}
                  transform="rotate(-90 120 120)"
                />
              </g>

              {/* Main pie chart */}
              <g transform="translate(80, 20)">
                {/* Non-Branded segment */}
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  fill="none"
                  stroke="url(#greenGradient)"
                  strokeWidth="45"
                  strokeDasharray={`${nonBrandedLength} ${brandedLength}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 120 120)"
                />

                {/* Branded segment - clickable */}
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  fill="none"
                  stroke="url(#blueGradient)"
                  strokeWidth="45"
                  strokeDasharray={`${brandedLength} ${nonBrandedLength}`}
                  strokeDashoffset={-nonBrandedLength}
                  transform="rotate(-90 120 120)"
                  onClick={scrollToBrandedSection}
                  style={{ cursor: 'pointer' }}
                />
              </g>

              {/* Top highlight layer */}
              <g transform="translate(80, 10)" opacity="0.6">
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="45"
                  strokeDasharray={`${nonBrandedLength} ${brandedLength}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 120 120)"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="45"
                  strokeDasharray={`${brandedLength} ${nonBrandedLength}`}
                  strokeDashoffset={-nonBrandedLength}
                  transform="rotate(-90 120 120)"
                  style={{ pointerEvents: 'none' }}
                />
              </g>

              {/* Center circle with gradient */}
              <circle cx="200" cy="130" r="67" fill="url(#innerShadow)" />

              {/* Label lines and text for segments */}
              {nonBrandedPercentage > 0 && (
                <>
                  {/* Label line and text for Non-Branded */}
                  <line x1="275" y1="75" x2="320" y2="50" stroke="black" strokeWidth="2" />
                  <text x="325" y="55" fill="black" fontSize="14" fontWeight="600">
                    Non-Branded
                  </text>
                </>
              )}

              {brandedPercentage > 0 && (
                <>
                  {/* Label line and text for Branded */}
                  <line x1="125" y1="95" x2="80" y2="70" stroke="black" strokeWidth="2" />
                  <text x="75" y="65" fill="black" fontSize="14" fontWeight="600" textAnchor="end">
                    Branded
                  </text>
                </>
              )}

              {/* Center text */}
              <text x="200" y="130" fill="#1f2937" fontSize="36" fontWeight="bold" textAnchor="middle">
                {totalCount}
              </text>
              <text x="200" y="150" fill="#6b7280" fontSize="14" textAnchor="middle">
                Total Keywords
              </text>
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          <button
            onClick={scrollToBrandedSection}
            className="w-full p-4 bg-[#42499c]/5 border-2 border-[#42499c]/20 rounded-lg hover:border-[#42499c] hover:bg-[#42499c]/10 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#42499c] rounded"></div>
                <span className="font-semibold text-gray-900">Branded Keywords</span>
              </div>
              <span className="text-2xl font-bold text-[#42499c]">{brandedPercentage}%</span>
            </div>
            <div className="text-sm text-gray-600">
              {brandedCount} keywords - Search terms that include your brand name
            </div>
            <div className="text-xs text-[#42499c] mt-2 font-medium">
              Click to view section below →
            </div>
          </button>

          <div className="p-4 bg-[#27ae60]/5 border-2 border-[#27ae60]/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#27ae60] rounded"></div>
                <span className="font-semibold text-gray-900">Non-Branded Keywords</span>
              </div>
              <span className="text-2xl font-bold text-[#27ae60]">{nonBrandedPercentage}%</span>
            </div>
            <div className="text-sm text-gray-600">
              {nonBrandedCount} keywords - Industry and service-related terms
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
