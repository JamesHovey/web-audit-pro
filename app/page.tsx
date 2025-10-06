import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Navigation } from "@/components/Navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
      <Navigation />
      <div className="container-pmw">
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          <div className="mb-8">
            <h1 className="h1">
              Web Audit Pro
            </h1>
            <p style={{ color: 'var(--pmw-text)' }} className="text-xl md:text-2xl mb-8 max-w-3xl">
              Comprehensive website audit tool for performance, SEO, and technical analysis
            </p>
          </div>
          
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/auth/signin"
              className="btn-pmw-primary"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-pmw-secondary"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
