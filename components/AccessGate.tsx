'use client'

import { useState, useEffect } from 'react'

const ACCESS_KEY = 'access_granted'
const CORRECT_USERNAME = 'pmw'
const CORRECT_PASSWORD = 'pmw'

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [isGranted, setIsGranted] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if access was previously granted
    const hasAccess = localStorage.getItem(ACCESS_KEY)
    if (hasAccess === 'true') {
      setIsGranted(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      localStorage.setItem(ACCESS_KEY, 'true')
      setIsGranted(true)
    } else {
      setError('Invalid credentials')
      setPassword('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#42499c] to-[#353f85] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#42499c] rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-[1]">
              Web Audit Pro
            </h1>
            <p className="text-xs text-gray-500 -mt-[2px] mb-2">(Working title)</p>
            <p className="text-gray-600 text-sm">
              Testing Access Gate
            </p>
          </div>

          {/* Access Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="gate-username" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                id="gate-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42499c] focus:border-[#42499c] transition-colors"
                placeholder="Enter access code"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="gate-password" className="block text-sm font-medium text-gray-700 mb-2">
                Access Key
              </label>
              <input
                id="gate-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42499c] focus:border-[#42499c] transition-colors"
                placeholder="Enter access key"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#42499c] hover:bg-[#353f85] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Enter Application
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 p-4 bg-white border-2 border-[#42499c] rounded-lg">
            <p className="text-xs text-black text-center">
              <strong>⚠️ Testing Phase:</strong> This access gate is temporary and will be removed in production.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
