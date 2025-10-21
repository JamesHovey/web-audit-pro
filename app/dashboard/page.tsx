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

  const user = session.user as any

  return (
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }} suppressHydrationWarning>
      <Navigation />
      <UserHeader user={user} />
      <div className="container-pmw pt-4 pb-4">
        <AuditForm />
      </div>
    </div>
  )
}