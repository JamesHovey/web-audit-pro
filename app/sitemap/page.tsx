import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Navigation } from "@/components/Navigation"
import SitemapContent from "@/components/SitemapContent"

export default async function SitemapPage({
  searchParams,
}: {
  searchParams: { domain?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = session.user as { username?: string }

  const domain = searchParams.domain

  if (!domain) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
        <Navigation user={user} />
        <div className="container-pmw pb-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">No domain provided in URL parameters.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
      <Navigation user={user} />
      <div className="container-pmw pb-4">
        <SitemapContent domain={domain} />
      </div>
    </div>
  )
}
