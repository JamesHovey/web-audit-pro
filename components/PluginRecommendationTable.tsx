"use client"

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Star, CheckCircle, Info, Filter, X } from 'lucide-react'
import { PluginMetadata, getInstalledPlugins, getNonInstalledPlugins } from '@/lib/pluginRecommendations'

interface PluginRecommendationTableProps {
  plugins: PluginMetadata[]
  installedPlugins: string[]
  issueType: string
  mode?: 'installed' | 'recommended' // New prop to determine what to show
}

type SortField = 'rating' | 'reviews' | 'cost' | 'activeInstalls'
type SortDirection = 'asc' | 'desc'
type CostFilter = 'all' | 'Free' | 'Freemium' | 'Paid'

export default function PluginRecommendationTable({
  plugins,
  installedPlugins,
  issueType,
  mode = 'recommended'
}: PluginRecommendationTableProps) {
  const [sortField, setSortField] = useState<SortField>('rating')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [costFilter, setCostFilter] = useState<CostFilter>('all')
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null)

  // Check if a plugin is installed
  const isInstalled = (plugin: PluginMetadata): boolean => {
    return installedPlugins.some(installed =>
      installed.toLowerCase().includes(plugin.name.toLowerCase()) ||
      installed.toLowerCase().includes(plugin.slug)
    )
  }

  // Filter plugins based on mode
  const filteredByMode = useMemo(() => {
    if (mode === 'installed') {
      return getInstalledPlugins(plugins, installedPlugins)
    } else {
      return getNonInstalledPlugins(plugins, installedPlugins)
    }
  }, [plugins, installedPlugins, mode])

  // Sort and filter plugins
  const sortedAndFilteredPlugins = useMemo(() => {
    let filtered = filteredByMode

    // Apply cost filter
    if (costFilter !== 'all') {
      filtered = filtered.filter(p => p.cost === costFilter)
    }

    // Sort plugins
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'rating':
          comparison = b.rating - a.rating
          break
        case 'reviews':
          comparison = b.reviews - a.reviews
          break
        case 'cost':
          const costOrder = { 'Free': 0, 'Freemium': 1, 'Paid': 2 }
          comparison = costOrder[a.cost] - costOrder[b.cost]
          break
        case 'activeInstalls':
          // Simple numeric comparison based on the string
          const aInstalls = parseInt(a.activeInstalls.replace(/[^0-9]/g, '')) || 0
          const bInstalls = parseInt(b.activeInstalls.replace(/[^0-9]/g, '')) || 0
          comparison = bInstalls - aInstalls
          break
      }

      return sortDirection === 'asc' ? -comparison : comparison
    })

    return sorted
  }, [filteredByMode, costFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const getCostBadgeColor = (cost: string) => {
    switch (cost) {
      case 'Free':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'Freemium':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Paid':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (sortedAndFilteredPlugins.length === 0 && mode === 'installed') {
    // No installed plugins - don't show this section
    return null
  }

  if (sortedAndFilteredPlugins.length === 0 && mode === 'recommended') {
    // No better alternatives available
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-semibold text-gray-900">
            {mode === 'installed' ? 'Currently Installed Plugins' : 'Recommended Plugins & Tools'}
          </h5>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'installed'
              ? 'Plugins you already have that can fix this issue. Follow the steps below to configure them.'
              : getInstalledPlugins(plugins, installedPlugins).length > 0
                ? 'Alternative plugins that are objectively better than what you currently have installed.'
                : 'Compare options to fix this issue.'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by cost:</span>
        </div>
        {(['all', 'Free', 'Freemium', 'Paid'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setCostFilter(filter)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              costFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter === 'all' ? 'All' : filter}
          </button>
        ))}
        {costFilter !== 'all' && (
          <button
            onClick={() => setCostFilter('all')}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Plugin</th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center gap-1">
                  Rating {getSortIcon('rating')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reviews')}
              >
                <div className="flex items-center gap-1">
                  Reviews {getSortIcon('reviews')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('activeInstalls')}
              >
                <div className="flex items-center gap-1">
                  Active Installs {getSortIcon('activeInstalls')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cost')}
              >
                <div className="flex items-center gap-1">
                  Cost {getSortIcon('cost')}
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAndFilteredPlugins.map((plugin, index) => (
              <React.Fragment key={plugin.slug}>
                <tr className={`hover:bg-gray-50 ${mode === 'installed' ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{plugin.name}</span>
                          {mode === 'installed' && (
                            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Installed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{plugin.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{plugin.rating}</span>
                      <span className="text-gray-500">/ 5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {plugin.reviews.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{plugin.activeInstalls}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCostBadgeColor(plugin.cost)}`}>
                        {plugin.cost}
                      </span>
                      {plugin.pricingDetails && (
                        <div className="text-xs text-gray-500">{plugin.pricingDetails}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedPlugin(expandedPlugin === plugin.slug ? null : plugin.slug)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                      >
                        {expandedPlugin === plugin.slug ? 'Hide' : 'Details'}
                        {expandedPlugin === plugin.slug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
                {expandedPlugin === plugin.slug && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 bg-gray-50">
                      {mode === 'installed' ? (
                        // Show configuration steps for installed plugins
                        <div>
                          <h6 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> How to Configure {plugin.name} to Fix This Issue
                          </h6>
                          <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-700 mb-4">
                              Follow these steps to optimize <strong>{plugin.name}</strong> and resolve this issue:
                            </p>
                            <div className="space-y-3">
                              {/* We'll add specific configuration steps based on the issue type */}
                              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                <p className="text-sm text-gray-800">
                                  <strong>Configuration steps will be displayed here based on the issue type.</strong>
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                  {plugin.bestFor}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Still show pros/cons for installed plugins in collapsed section */}
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                              View plugin details (pros, cons, features)
                            </summary>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              {/* Pros */}
                              <div>
                                <h6 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" /> Pros
                                </h6>
                                <ul className="space-y-1">
                                  {plugin.pros.map((pro, i) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                      <span className="text-green-500 mt-0.5">✓</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Cons */}
                              <div>
                                <h6 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                                  <X className="w-4 h-4" /> Cons
                                </h6>
                                <ul className="space-y-1">
                                  {plugin.cons.map((con, i) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                      <span className="text-red-500 mt-0.5">✗</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Additional Info */}
                              <div>
                                <h6 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                  <Info className="w-4 h-4" /> Details
                                </h6>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-700">Best for:</span>
                                    <p className="text-gray-600 mt-0.5">{plugin.bestFor}</p>
                                  </div>
                                  {plugin.freeTierLimits && (
                                    <div>
                                      <span className="font-medium text-gray-700">Free tier limits:</span>
                                      <p className="text-gray-600 mt-0.5">{plugin.freeTierLimits}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium text-gray-700">Category:</span>
                                    <span className="text-gray-600 ml-1 capitalize">{plugin.category}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      ) : (
                        // Show pros/cons for recommended plugins
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Pros */}
                          <div>
                            <h6 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Pros
                            </h6>
                            <ul className="space-y-1">
                              {plugin.pros.map((pro, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cons */}
                          <div>
                            <h6 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                              <X className="w-4 h-4" /> Cons
                            </h6>
                            <ul className="space-y-1">
                              {plugin.cons.map((con, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-red-500 mt-0.5">✗</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Additional Info */}
                          <div>
                            <h6 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                              <Info className="w-4 h-4" /> Details
                            </h6>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="font-medium text-gray-700">Best for:</span>
                                <p className="text-gray-600 mt-0.5">{plugin.bestFor}</p>
                              </div>
                              {plugin.freeTierLimits && (
                                <div>
                                  <span className="font-medium text-gray-700">Free tier limits:</span>
                                  <p className="text-gray-600 mt-0.5">{plugin.freeTierLimits}</p>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-700">Category:</span>
                                <span className="text-gray-600 ml-1 capitalize">{plugin.category}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-xs text-gray-500 border-t pt-3">
        {mode === 'installed' ? (
          <>
            Showing {sortedAndFilteredPlugins.length} installed plugin{sortedAndFilteredPlugins.length !== 1 ? 's' : ''}
            {costFilter !== 'all' && ` (filtered by ${costFilter})`}
            . Sorted by {sortField} ({sortDirection === 'desc' ? 'high to low' : 'low to high'}).
          </>
        ) : (
          <>
            Showing {sortedAndFilteredPlugins.length} recommended plugin{sortedAndFilteredPlugins.length !== 1 ? 's' : ''}
            {costFilter !== 'all' && ` (filtered by ${costFilter})`}
            . Sorted by {sortField} ({sortDirection === 'desc' ? 'high to low' : 'low to high'}).
            {getInstalledPlugins(plugins, installedPlugins).length > 0 && (
              <> Only showing plugins that are objectively better than your installed plugins.</>
            )}
          </>
        )}
      </div>
    </div>
  )
}
