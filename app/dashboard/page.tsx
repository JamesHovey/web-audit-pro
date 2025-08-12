import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AuditForm } from "@/components/AuditForm"
import { Navigation } from "@/components/Navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name || session.user?.email}
          </h1>
          <p className="text-gray-600 mt-2">
            Enter a URL below to start your comprehensive website audit
          </p>
        </div>
        
        <AuditForm />
      </div>
    </div>
  )
}