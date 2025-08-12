"use client"

import { useState } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"

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
    label: "Website Performance",
    description: "Core Web Vitals assessment for desktop and mobile experiences"
  },
  {
    id: "backlinks",
    label: "Authority & Backlinks",
    description: "Domain authority assessment and comprehensive backlink analysis"
  },
  {
    id: "technical",
    label: "Technical Audit",
    description: "Site structure, image optimization, and technical SEO issues"
  },
  {
    id: "technology",
    label: "Technology Stack",
    description: "Technologies, frameworks, and platforms used in website construction"
  }
]

export function AuditForm() {
  const [url, setUrl] = useState("")
  const [selectedSections, setSelectedSections] = useState<string[]>(
    AUDIT_SECTIONS.map(section => section.id)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)

  const validateUrl = (urlString: string) => {
    try {
      // Add protocol if missing
      const urlToValidate = urlString.startsWith('http') ? urlString : `https://${urlString}`
      const url = new URL(urlToValidate)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    setError("")
    setIsValidUrl(validateUrl(value))
  }

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!isValidUrl) {
      setError("Please enter a valid URL")
      return
    }

    if (selectedSections.length === 0) {
      setError("Please select at least one audit section")
      return
    }

    setIsLoading(true)
    setError("")

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
          sections: selectedSections
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start audit')
      }

      const data = await response.json()
      
      // Redirect to results page
      window.location.href = `/audit/${data.id}`
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="relative">
            <input
              type="text"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="example.com or https://example.com"
              className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
        </div>

        {/* Section Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Audit Sections ({selectedSections.length} selected)
          </label>
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
                    <label htmlFor={section.id} className="font-medium text-gray-900 cursor-pointer">
                      {section.label}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
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
        <button
          type="submit"
          disabled={isLoading || !isValidUrl || selectedSections.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
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
      </form>
    </div>
  )
}