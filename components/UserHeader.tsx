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
    <div className="bg-[#42499c] shadow-sm mb-8">
      <div className="container-pmw">
        <div className="py-3 flex items-center justify-between">
          {/* Welcome Message - Left */}
          <div className="text-sm text-white">
            Welcome back, <span className="font-medium">{user.username}</span>
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="text-white hover:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Logout
            </button>

            {/* Settings Icon */}
            <button
              onClick={() => router.push('/settings')}
              className="text-white hover:text-gray-200 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
