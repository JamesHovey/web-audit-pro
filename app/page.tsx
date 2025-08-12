import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Web Audit Pro
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl">
              Comprehensive website audit tool for performance, SEO, and technical analysis
            </p>
          </div>
          
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Performance Analysis</h3>
              <p className="text-gray-600">Core Web Vitals and performance metrics for desktop and mobile</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">SEO Insights</h3>
              <p className="text-gray-600">Traffic analysis, keyword research, and competitive intelligence</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Technical Audit</h3>
              <p className="text-gray-600">Site structure, image optimization, and technical SEO issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
