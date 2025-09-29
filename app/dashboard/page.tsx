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
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
      <Navigation />
      <div className="container-pmw py-8">
        <div className="mb-8 spacing-pmw pt-8">
          <h1 className="h1">
            Welcome back, {session.user?.name || session.user?.email}
          </h1>
          <p style={{ color: 'var(--pmw-text)' }} className="text-lg mt-4">
            Enter a URL below to start your comprehensive website audit
          </p>
        </div>
        
        <AuditForm />
      </div>
    </div>
  )
}