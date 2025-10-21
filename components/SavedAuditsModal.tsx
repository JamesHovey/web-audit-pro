'use client'

import { useState, useEffect } from 'react'
import { X, Clock, ExternalLink, CheckCircle, Loader, AlertCircle, Trash2 } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface SavedAuditsModalProps {
  isOpen: boolean
  onClose: () => void
  onAuditsChange?: (hasAudits: boolean) => void
}

interface Audit {
  id: string
  url: string
  status: string
  createdAt: string
  completedAt?: string
  sections: string[]
}

export default function SavedAuditsModal({ isOpen, onClose, onAuditsChange }: SavedAuditsModalProps) {
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      fetchAudits()
    }
  }, [isOpen])

  const fetchAudits = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/audit/list')
      if (!response.ok) {
        throw new Error('Failed to fetch audits')
      }
      const data = await response.json()
      const auditList = data.audits || []
      setAudits(auditList)
      // Notify parent about audit status
      onAuditsChange?.(auditList.length > 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audits')
    } finally {
      setLoading(false)
    }
  }

  const handleAuditClick = (auditId: string) => {
    router.push(`/audit/${auditId}`)
    onClose()
  }

  const handleDelete = async (auditId: string, auditUrl: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent audit click when deleting

    if (!confirm(`Are you sure you want to delete the audit for "${auditUrl}"?`)) {
      return
    }

    // Check if we're deleting the currently viewed audit
    const isCurrentAudit = pathname?.includes(auditId)

    setDeletingId(auditId)
    try {
      const response = await fetch(`/api/audit/${auditId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete audit')
      }

      // Remove the deleted audit from the list
      const newAudits = audits.filter(audit => audit.id !== auditId)
      setAudits(newAudits)

      // Defer the parent notification to avoid setState during render
      setTimeout(() => {
        onAuditsChange?.(newAudits.length > 0)
      }, 0)

      // If user deleted the audit they're currently viewing, redirect to dashboard
      if (isCurrentAudit) {
        onClose()
        router.push('/dashboard')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete audit')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'running':
        return <Loader className="w-4 h-4 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#42499C] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Saved Audits</h3>
              <p className="text-sm text-blue-100">Your previous audit history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading audits...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={fetchAudits}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Try again
              </button>
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No audits yet</p>
              <p className="text-gray-400 text-sm mt-2">Your audit history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {audits.map((audit) => (
                <div
                  key={audit.id}
                  onClick={() => handleAuditClick(audit.id)}
                  className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {audit.url}
                        </h4>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(audit.createdAt)}</span>
                        </div>

                        {audit.completedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Completed {formatDate(audit.completedAt)}</span>
                          </div>
                        )}
                      </div>

                      {audit.sections && audit.sections.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {audit.sections.map((section) => (
                            <span
                              key={section}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(audit.status)}`}>
                        {getStatusIcon(audit.status)}
                        {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                      </span>

                      <button
                        onClick={(e) => handleDelete(audit.id, audit.url, e)}
                        disabled={deletingId === audit.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Delete audit"
                      >
                        {deletingId === audit.id ? (
                          <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && audits.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Total audits: <span className="font-semibold">{audits.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
