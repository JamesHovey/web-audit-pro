"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Navigation } from "@/components/Navigation"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Get the session to confirm login
        const session = await getSession()
        if (session) {
          router.push("/dashboard")
        }
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
      <Navigation />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="card-pmw">
            <div>
              <h2 className="h3 text-center">
                Sign in to Web Audit Pro
              </h2>
              <p className="mt-2 text-center text-sm" style={{ color: 'var(--pmw-text)' }}>
                Or{' '}
                <Link href="/auth/signup" className="font-medium" style={{ color: 'var(--pmw-secondary)' }}>
                  create a new account
                </Link>
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--pmw-text)' }}>
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--pmw-border)', 
                      focusRingColor: 'var(--pmw-secondary)',
                      color: 'var(--pmw-text)'
                    }}
                    placeholder="Email address"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--pmw-text)' }}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--pmw-border)', 
                      focusRingColor: 'var(--pmw-secondary)',
                      color: 'var(--pmw-text)'
                    }}
                    placeholder="Password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="border rounded-md p-4" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-pmw-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link href="/" className="text-sm hover:opacity-80" style={{ color: 'var(--pmw-text)' }}>
                  ← Back to home
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}