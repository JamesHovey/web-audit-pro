"use client"

import { Navigation } from "@/components/Navigation"
import { AuditResults } from "@/components/AuditResults"
import { notFound, useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { exportAuditToPDF } from "@/lib/pdfExportService"
import { generateAuditSummary } from "@/lib/auditSummaryService"
import { Trash2, Loader, Clock } from "lucide-react"
import SavedAuditsModal from "@/components/SavedAuditsModal"

interface Audit {
  id: string
  url: string
  status: string
  results: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export default function AuditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [audit, setAudit] = useState<Audit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSavedAuditsModal, setShowSavedAuditsModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Generate audit summary to get issues for Synergist basket
  const auditIssues = useMemo(() => {
    if (!audit?.results) return []
    const summary = generateAuditSummary(audit.results, audit.url)
    return summary.topPriorities
  }, [audit])

  // Helper function to determine audit type and get appropriate title
  const getAuditTitle = () => {
    if (!audit?.results) return 'Audit Results'

    // Check the scope from results
    const results = audit.results as any
    const scope = results?.scope
    const totalPages = results?.totalPages || 1

    // Determine audit type based on scope
    if (scope === 'all') {
      return `All Discoverable Pages audit results${totalPages > 1 ? ` (${totalPages} pages)` : ''}`
    } else if (scope === 'custom' || scope === 'multi') {
      return `Specific Pages audit results (${totalPages} ${totalPages === 1 ? 'page' : 'pages'})`
    } else {
      return 'Single page audit results'
    }
  }

  const handleDelete = async () => {
    if (!audit) return

    if (!confirm(`Are you sure you want to delete the audit for "${audit.url}"?`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/audit/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete audit')
      }

      // Redirect to dashboard after successful deletion
      router.push('/dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete audit')
      setDeleting(false)
    }
  }

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`/api/audit/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
            return
          }
          throw new Error('Failed to fetch audit')
        }
        const auditData = await response.json()
        setAudit(auditData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAudit()
      
      // Set up polling for pending and running audits
      const interval = setInterval(() => {
        if (audit?.status === 'pending' || audit?.status === 'running') {
          fetchAudit()
        }
      }, 3000) // Check every 3 seconds
      
      return () => clearInterval(interval)
    }
  }, [id, audit?.status])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
        <Navigation auditIssues={[]} />
        <div className="container-pmw pt-24 pb-8">
          <div className="flex items-center justify-center">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
        <Navigation auditIssues={[]} />
        <div className="container-pmw pt-24 pb-8">
          <div className="flex items-center justify-center">
            <div className="text-red-600">{error || 'Audit not found'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
      <Navigation auditIssues={auditIssues} pageTitle={getAuditTitle()} />
      <div className="container-pmw pt-24 pb-8">
        <div className="mb-6">
          
          {/* Main content row */}
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-6 py-3">
            {/* URL with Domain Authority */}
            <div className="flex items-center gap-3">
              <div className="text-lg font-medium text-gray-800">
                {audit.url}
              </div>
              {audit.results?.authority?.domainAuthority && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">DA:</span>
                  <span className="text-lg font-bold text-blue-600">{audit.results.authority.domainAuthority}</span>
                  <div className="relative group">
                    <svg className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-help transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                      <circle cx="12" cy="12" r="9.5" />
                      <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                      <p className="font-medium mb-2">Domain Authority (DA)</p>
                      <p className="mb-2">A score from 0-100 that predicts how well a website will rank on search engines.</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li><strong>0-30:</strong> New or low authority site</li>
                        <li><strong>30-50:</strong> Moderate authority</li>
                        <li><strong>50-70:</strong> Good authority</li>
                        <li><strong>70+:</strong> Excellent authority</li>
                      </ul>
                      <div className="mt-2 p-2 bg-blue-900 rounded text-xs">
                        <p className="font-medium">How it&apos;s calculated:</p>
                        <p>Based on factors like backlink quality, domain age, content quality, and technical SEO.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                audit.status === 'completed' ? 'bg-green-100 text-green-800' :
                audit.status === 'running' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {audit.status === 'completed' ? 'Completed' :
                 audit.status === 'running' ? 'Running' : 'Pending'}
              </span>
            </div>
            
            {/* Action buttons - inline on the right */}
            <div className="ml-auto flex items-center gap-2">
              {/* Saved Audits Button */}
              <button
                onClick={() => setShowSavedAuditsModal(true)}
                className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                title="Saved Audits"
              >
                <Clock className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  const sitemapUrl = `/sitemap?domain=${encodeURIComponent(audit.url)}`;
                  window.open(sitemapUrl, '_blank');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-[#42499c] transition-colors w-32"
              >
                <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 9.75H10.5C10.0367 9.74738 9.59309 9.56216 9.26546 9.23454C8.93784 8.90691 8.75263 8.46332 8.75 8V5C8.75263 4.53668 8.93784 4.09309 9.26546 3.76546C9.59309 3.43784 10.0367 3.25263 10.5 3.25H13.5C13.9633 3.25263 14.4069 3.43784 14.7345 3.76546C15.0622 4.09309 15.2474 4.53668 15.25 5V8C15.2474 8.46332 15.0622 8.90691 14.7345 9.23454C14.4069 9.56216 13.9633 9.74738 13.5 9.75ZM10.5 4.75C10.4337 4.75 10.3701 4.77634 10.3232 4.82322C10.2763 4.87011 10.25 4.9337 10.25 5V8C10.25 8.0663 10.2763 8.12989 10.3232 8.17678C10.3701 8.22366 10.4337 8.25 10.5 8.25H13.5C13.5663 8.25 13.6299 8.22366 13.6768 8.17678C13.7237 8.12989 13.75 8.0663 13.75 8V5C13.75 4.9337 13.7237 4.87011 13.6768 4.82322C13.6299 4.77634 13.5663 4.75 13.5 4.75H10.5Z" />
                  <path d="M6 19.75H4C3.53668 19.7474 3.09309 19.5622 2.76546 19.2345C2.43784 18.9069 2.25263 18.4633 2.25 18V16C2.25263 15.5367 2.43784 15.0931 2.76546 14.7655C3.09309 14.4378 3.53668 14.2526 4 14.25H6C6.46332 14.2526 6.90691 14.4378 7.23454 14.7655C7.56216 15.0931 7.74738 15.5367 7.75 16V18C7.74738 18.4633 7.56216 18.9069 7.23454 19.2345C6.90691 19.5622 6.46332 19.7474 6 19.75ZM4 15.75C3.9337 15.75 3.87011 15.7763 3.82322 15.8232C3.77634 15.8701 3.75 15.9337 3.75 16V18C3.75 18.0663 3.77634 18.1299 3.82322 18.1768C3.87011 18.2237 3.9337 18.25 4 18.25H6C6.0663 18.25 6.12989 18.2237 6.17678 18.1768C6.22366 18.1299 6.25 18.0663 6.25 18V16C6.25 15.9337 6.22366 15.8701 6.17678 15.8232C6.12989 15.7763 6.0663 15.75 6 15.75H4Z" />
                  <path d="M13 19.75H11C10.5367 19.7474 10.0931 19.5622 9.76546 19.2345C9.43784 18.9069 9.25263 18.4633 9.25 18V16C9.25263 15.5367 9.43784 15.0931 9.76546 14.7655C10.0931 14.4378 10.5367 14.2526 11 14.25H13C13.4633 14.2526 13.9069 14.4378 14.2345 14.7655C14.5622 15.0931 14.7474 15.5367 14.75 16V18C14.7474 18.4633 14.5622 18.9069 14.2345 19.2345C13.9069 19.5622 13.4633 19.7474 13 19.75ZM11 15.75C10.9337 15.75 10.8701 15.7763 10.8232 15.8232C10.7763 15.8701 10.75 15.9337 10.75 16V18C10.75 18.0663 10.7763 18.1299 10.8232 18.1768C10.8701 18.2237 10.9337 18.25 11 18.25H13C13.0663 18.25 13.1299 18.2237 13.1768 18.1768C13.2237 18.1299 13.25 18.0663 13.25 18V16C13.25 15.9337 13.2237 15.8701 13.1768 15.8232C13.1299 15.7763 13.0663 15.75 13 15.75H11Z" />
                  <path d="M20 19.75H18C17.5367 19.7474 17.0931 19.5622 16.7655 19.2345C16.4378 18.9069 16.2526 18.4633 16.25 18V16C16.2526 15.5367 16.4378 15.0931 16.7655 14.7655C17.0931 14.4378 17.5367 14.2526 18 14.25H20C20.4633 14.2526 20.9069 14.4378 21.2345 14.7655C21.5622 15.0931 21.7474 15.5367 21.75 16V18C21.7474 18.4633 21.7474 18.9069 21.2345 19.2345C20.9069 19.5622 20.4633 19.7474 20 19.75ZM18 15.75C17.9337 15.75 17.8701 15.7763 17.8232 15.8232C17.7763 15.8701 17.75 15.9337 17.75 16V18C17.75 18.0663 17.7763 18.1299 17.8232 18.1768C17.8701 18.2237 17.9337 18.25 18 18.25H20C20.0663 18.25 20.1299 18.2237 20.1768 18.1768C20.2237 18.1299 20.25 18.0663 20.25 18V16C20.25 15.9337 20.2237 15.8701 20.1768 15.8232C20.1299 15.7763 20.0663 15.75 20 15.75H18Z" />
                  <path d="M19 15.75C18.8019 15.7474 18.6126 15.6676 18.4725 15.5275C18.3324 15.3874 18.2526 15.1981 18.25 15V13C18.25 12.9337 18.2237 12.8701 18.1768 12.8232C18.1299 12.7763 18.0663 12.75 18 12.75H6C5.9337 12.75 5.87011 12.7763 5.82322 12.8232C5.77634 12.8701 5.75 12.9337 5.75 13V15C5.75 15.1989 5.67098 15.3897 5.53033 15.5303C5.38968 15.671 5.19891 15.75 5 15.75C4.80109 15.75 4.61032 15.671 4.46967 15.5303C4.32902 15.3897 4.25 15.1989 4.25 15V13C4.25263 12.5367 4.43784 12.0931 4.76546 11.7655C5.09309 11.4378 5.53668 11.2526 6 11.25H18C18.4633 11.2526 18.9069 11.4378 19.2345 11.7655C19.5622 12.0931 19.7474 12.5367 19.75 13V15C19.7474 15.1981 19.6676 15.3874 19.5275 15.5275C19.3874 15.6676 19.1981 15.7474 19 15.75Z" />
                  <path d="M12 15.75C11.8019 15.7474 11.6126 15.6676 11.4725 15.5275C11.3324 15.3874 11.2526 15.1981 11.25 15V9C11.25 8.80109 11.329 8.61032 11.4697 8.46967C11.6103 8.32902 11.8011 8.25 12 8.25C12.1989 8.25 12.3897 8.32902 12.5303 8.46967C12.671 8.61032 12.75 8.80109 12.75 9V15C12.7474 15.1981 12.6676 15.3874 12.5275 15.5275C12.3874 15.6676 12.1981 15.7474 12 15.75Z" />
                </svg>
                Sitemap
              </button>
              
              {audit.status === 'completed' && (
                <>
                  <button
                    onClick={() => exportAuditToPDF(audit)}
                    className="px-4 py-2 bg-[#42499c] text-white rounded-md text-sm font-medium hover:bg-[#42499c]/80 transition-colors w-32"
                  >
                    Export PDF
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors w-32"
                  >
                    Export Excel
                  </button>
                </>
              )}

              {/* Delete button */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete audit"
              >
                {deleting ? (
                  <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AuditResults audit={audit} />
      </div>

      {/* Saved Audits Modal */}
      <SavedAuditsModal
        isOpen={showSavedAuditsModal}
        onClose={() => setShowSavedAuditsModal(false)}
      />
    </div>
  )
}