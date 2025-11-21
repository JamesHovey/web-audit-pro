'use client'

import { useState } from 'react'
import { AuditConfiguration } from '@/types/auditConfiguration'

interface AuditConfigurationPanelProps {
  onConfigurationChange: (config: AuditConfiguration) => void
}

export default function AuditConfigurationPanel({
  onConfigurationChange
}: AuditConfigurationPanelProps) {
  const [config, setConfig] = useState<AuditConfiguration>({
    technicalSEO: true,
    internalLinking: true,
    performanceMetrics: true,
    securityAndRedirects: true,
    contentQuality: true,
    imageOptimization: true,
    accessibilityAnalysis: false,
    viewportAnalysis: false
  })

  const handleToggle = (category: keyof AuditConfiguration) => {
    const newConfig = {
      ...config,
      [category]: !config[category]
    }
    setConfig(newConfig)
    onConfigurationChange(newConfig)
  }

  const categories = [
    {
      key: 'technicalSEO' as keyof AuditConfiguration,
      label: 'Technical SEO',
      description: 'H1 tags, meta titles, descriptions, structured data, title length'
    },
    {
      key: 'internalLinking' as keyof AuditConfiguration,
      label: 'Internal Linking',
      description: 'Orphaned pages, weak links, broken links'
    },
    {
      key: 'performanceMetrics' as keyof AuditConfiguration,
      label: 'Performance Metrics',
      description: 'Core Web Vitals, page speed'
    },
    {
      key: 'securityAndRedirects' as keyof AuditConfiguration,
      label: 'Security & Redirects',
      description: 'HTTPS, HSTS, 301/302 redirects, 4XX errors'
    },
    {
      key: 'contentQuality' as keyof AuditConfiguration,
      label: 'Content Quality',
      description: 'Text-to-HTML ratio, content depth'
    },
    {
      key: 'imageOptimization' as keyof AuditConfiguration,
      label: 'Image Optimization',
      description: 'Large images, legacy formats, missing alt tags'
    },
    {
      key: 'accessibilityAnalysis' as keyof AuditConfiguration,
      label: 'Accessibility Analysis',
      description: 'WCAG compliance, color contrast, keyboard navigation'
    },
    {
      key: 'viewportAnalysis' as keyof AuditConfiguration,
      label: 'Viewport Analysis',
      description: 'Mobile/tablet/desktop rendering'
    }
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Configuration</h3>

      <div className="space-y-3">
        {categories.map((category) => (
          <label
            key={category.key}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={config[category.key]}
              onChange={() => handleToggle(category.key)}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">
                {category.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {category.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
