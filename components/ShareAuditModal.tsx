'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, Loader, CheckCircle, Users } from 'lucide-react'

interface User {
  id: string
  username: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ShareAuditModalProps {
  isOpen: boolean
  onClose: () => void
  auditId: string
  auditUrl: string
}

export default function ShareAuditModal({ isOpen, onClose, auditId, auditUrl }: ShareAuditModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searching, setSearching] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setUsers([])
      return
    }

    const timer = setTimeout(async () => {
      await searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchUsers = async (query: string) => {
    setSearching(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search users')
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users')
      setUsers([])
    } finally {
      setSearching(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleShare = async () => {
    if (selectedUsers.length === 0) return

    setSharing(true)
    setError(null)

    try {
      const response = await fetch(`/api/audit/${auditId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds: selectedUsers })
      })

      if (!response.ok) {
        throw new Error('Failed to share audit')
      }

      const result = await response.json()

      setSuccess(true)
      setSelectedUsers([])
      setSearchQuery('')
      setUsers([])

      // Show success message then close
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share audit')
    } finally {
      setSharing(false)
    }
  }

  const getUserDisplayName = (user: User) => {
    if (user.name) return user.name
    if (user.email) return user.email
    return user.username
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'white' }}>Share Audit</h3>
              <p className="text-sm text-blue-100">{auditUrl}</p>
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
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-600">Audit shared successfully!</p>
            </div>
          ) : (
            <>
              {/* Search Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username, name, or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type at least 2 characters to search
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Search Results */}
              <div className="mb-6">
                {searching ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Found {users.length} user(s):
                    </p>
                    {users.map(user => (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedUsers.includes(user.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.username}</p>
                              {user.name && (
                                <p className="text-sm text-gray-600">{user.name}</p>
                              )}
                              {user.email && (
                                <p className="text-xs text-gray-500">{user.email}</p>
                              )}
                            </div>
                          </div>
                          {selectedUsers.includes(user.id) && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No users found</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Start typing to search for users</p>
                  </div>
                )}
              </div>

              {/* Selected Users Summary */}
              {selectedUsers.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedUsers.length} user(s) selected
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={selectedUsers.length === 0 || sharing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sharing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>Share with {selectedUsers.length} user(s)</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
