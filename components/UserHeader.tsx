'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UserHeaderProps {
  user: {
    username: string
  }
}

export default function UserHeader({ user }: UserHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm mb-8">
      <div className="container-pmw">
        <div className="py-4 flex items-center justify-between">
          {/* Welcome Message */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back, <span className="text-[#42499c]">{user.username}</span>!
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Run comprehensive websites audits across multiple categories
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
