import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AuditForm } from "@/components/AuditForm"
import { Navigation } from "@/components/Navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = session.user as { username?: string }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pmw-soft-bg)' }} suppressHydrationWarning>
      <Navigation user={user} />
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-4xl">
          <AuditForm />
        </div>
      </div>
    </div>
  )
}