import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AuditForm } from "@/components/AuditForm"
import { Navigation } from "@/components/Navigation"
import UserHeader from "@/components/UserHeader"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = session.user as { name?: string | null; email?: string | null; image?: string | null }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pmw-soft-bg)' }} suppressHydrationWarning>
      <Navigation />
      <UserHeader user={user} />
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-4xl">
          <AuditForm />
        </div>
      </div>
    </div>
  )
}