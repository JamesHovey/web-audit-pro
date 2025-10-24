'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PasswordResult {
  username: string
  password: string
}

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('')
  const [result, setResult] = useState<PasswordResult | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to retrieve password information')
      } else {
        setResult(data)
      }
    } catch (_error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Warning Header */}
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">⚠️ Testing Mode Only</h3>
              <p className="text-xs text-amber-800 mt-1">
                This is a temporary password recovery feature. In production, we&apos;ll send secure password reset links via email.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600">
            Enter your username to retrieve your password
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Retrieve Password Info'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✓ Account Found</h3>
              <p className="text-sm text-green-800 mb-3">
                Username: <strong>{result.username}</strong>
              </p>
              <div className="bg-white border border-green-300 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Password:</span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-[#42499c] hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <code className="text-sm font-semibold text-gray-900 break-all block">
                  {showPassword ? result.password : '••••••••••••••••••••'}
                </code>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Testing Mode:</strong> Your password is shown in plaintext above for testing convenience.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                In production, you would receive a password reset email with a secure link to create a new password.
              </p>
            </div>

            <button
              onClick={() => {
                setResult(null)
                setUsername('')
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Search Another Account
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-[#42499c] hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Need an account?{' '}
            <Link href="/register" className="text-[#42499c] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Production Note */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Production Feature:</strong> Email-based password reset with secure tokens will replace this temporary solution.
          </p>
        </div>
      </div>
    </div>
  )
}
