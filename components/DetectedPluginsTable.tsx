"use client"

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Star, Info } from 'lucide-react'

interface DetectedPluginsTableProps {
  plugins: Array<Record<string, unknown>>
  terminology: { singular: string; plural: string }
}

interface PluginWithMetadata {
  name: string;
  categoryKey?: string;
  description: string;
  rating: number;
  reviews: number;
  activeInstalls: string;
  url: string;
  found: boolean;
}

export default function DetectedPluginsTable({
  plugins,
  terminology
}: DetectedPluginsTableProps) {
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null)
  const [pluginsWithMetadata, setPluginsWithMetadata] = useState<PluginWithMetadata[]>([])
  const [loading, setLoading] = useState(true)

  const categoryLabels: Record<string, string> = {
    'seo': 'SEO',
    'page-builder': 'Page Builder',
    'builder': 'Page Builder',
    'analytics': 'Analytics',
    'compliance': 'Compliance',
    'forms': 'Forms',
    'ecommerce': 'E-commerce',
    'security': 'Security',
    'performance': 'Performance',
    'media': 'Media',
    'gallery': 'Gallery',
    'social': 'Social Media',
    'admin': 'Administration',
    'marketing': 'Marketing',
    'email': 'Email Marketing',
    'reviews': 'Reviews & Ratings',
    'upsell': 'Upsell & Cross-sell',
    'shipping': 'Shipping',
    'payment': 'Payment',
    'conversion': 'Conversion Optimization',
    'other': 'Other'
  };

  // Fetch metadata for all plugins
  useEffect(() => {
    async function fetchMetadata() {
      setLoading(true)

      try {
        // Get all plugin names
        const pluginNames = plugins.map(p => p.name as string)

        // Fetch metadata from server-side API
        const response = await fetch('/api/wordpress-plugin-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plugins: pluginNames })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch plugin metadata')
        }

        const data = await response.json()
        const results: PluginWithMetadata[] = []

        // Map the results back to our plugins
        for (const plugin of plugins) {
          const pluginName = plugin.name as string
          const metadata = data.results[pluginName]

          if (metadata) {
            results.push({
              name: pluginName,
              categoryKey: plugin.categoryKey as string,
              description: metadata.description,
              rating: metadata.rating,
              reviews: metadata.reviews,
              activeInstalls: metadata.activeInstalls,
              url: metadata.url,
              found: metadata.found
            })
          } else {
            // Fallback if no metadata found
            results.push({
              name: pluginName,
              categoryKey: plugin.categoryKey as string,
              description: 'Description not available',
              rating: 0,
              reviews: 0,
              activeInstalls: 'N/A',
              url: `https://wordpress.org/plugins/${pluginName.toLowerCase().replace(/\s+/g, '-')}/`,
              found: false
            })
          }
        }

        setPluginsWithMetadata(results)
      } catch (error) {
        console.error('Error fetching plugin metadata:', error)

        // Fallback: create basic plugin data
        const fallbackResults: PluginWithMetadata[] = plugins.map(plugin => ({
          name: plugin.name as string,
          categoryKey: plugin.categoryKey as string,
          description: 'Unable to load description at this time',
          rating: 0,
          reviews: 0,
          activeInstalls: 'N/A',
          url: `https://wordpress.org/plugins/${(plugin.name as string).toLowerCase().replace(/\s+/g, '-')}/`,
          found: false
        }))

        setPluginsWithMetadata(fallbackResults)
      } finally {
        setLoading(false)
      }
    }

    if (plugins.length > 0) {
      fetchMetadata()
    }
  }, [plugins])

  if (loading) {
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p>Loading plugin details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">{terminology.singular}</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Rating</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Reviews</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pluginsWithMetadata.map((plugin, index) => (
            <React.Fragment key={index}>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{plugin.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-600 max-w-md truncate" title={plugin.description}>
                    {plugin.description}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {plugin.categoryKey ? categoryLabels[plugin.categoryKey] || plugin.categoryKey : 'Other'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {plugin.rating > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{plugin.rating.toFixed(1)}</span>
                      <span className="text-gray-500">/ 5</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {plugin.reviews > 0 ? plugin.reviews.toLocaleString() : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedPlugin(expandedPlugin === plugin.name ? null : plugin.name)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                    >
                      {expandedPlugin === plugin.name ? 'Hide' : 'Details'}
                      {expandedPlugin === plugin.name ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <a
                      href={plugin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                    >
                      Visit <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </td>
              </tr>

              {/* Expanded Details */}
              {expandedPlugin === plugin.name && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 bg-gray-50">
                    <div className="space-y-3">
                      {/* Full Description */}
                      <div>
                        <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4" /> About {plugin.name}
                        </h6>
                        <p className="text-sm text-gray-700 mb-3">
                          {plugin.description}
                        </p>
                      </div>

                      {/* Plugin Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Rating</div>
                          {plugin.rating > 0 ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                              <span className="text-lg font-bold text-gray-900">{plugin.rating.toFixed(1)}</span>
                              <span className="text-gray-500">/ 5</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not rated</span>
                          )}
                        </div>

                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Reviews</div>
                          <div className="text-lg font-bold text-gray-900">
                            {plugin.reviews > 0 ? plugin.reviews.toLocaleString() : 'No reviews'}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Active Installs</div>
                          <div className="text-lg font-bold text-gray-900">
                            {plugin.activeInstalls}
                          </div>
                        </div>
                      </div>

                      {/* Plugin Links */}
                      <div className="flex items-center gap-3 pt-2">
                        <a
                          href={plugin.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          View on WordPress.org <ExternalLink className="w-4 h-4" />
                        </a>
                        {!plugin.found && (
                          <span className="text-xs text-gray-500">
                            (Premium or custom plugin - limited information available)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
