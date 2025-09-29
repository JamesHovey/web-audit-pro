"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { PMWLogo } from "./PMWLogo"

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="shadow-sm border-b" style={{ backgroundColor: 'var(--pmw-primary)', borderColor: 'var(--pmw-border)' }}>
      <div className="container-pmw">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 text-xl font-bold text-white hover:opacity-90 transition-opacity">
              <PMWLogo size={40} />
              <span>Web Audit Pro</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-white">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-pmw-accent text-sm px-4 py-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}