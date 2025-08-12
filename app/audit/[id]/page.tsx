import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navigation } from "@/components/Navigation"
import { AuditResults } from "@/components/AuditResults"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AuditPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const { id } = await params

  const audit = await prisma.audit.findFirst({
    where: {
      id,
      userId: session.user?.id
    }
  })

  if (!audit) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Audit Results
          </h1>
          <p className="text-gray-600 mt-2">
            {audit.url}
          </p>
        </div>
        
        <AuditResults audit={audit} />
      </div>
    </div>
  )
}