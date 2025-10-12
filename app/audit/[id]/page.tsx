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
  const { id } = await params

  const audit = await prisma.audit.findFirst({
    where: {
      id
    }
  })

  if (!audit) {
    notFound()
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
      <Navigation />
      <div className="container-pmw py-8">
        <div className="mb-8 spacing-pmw pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="h1">
                Audit Results
              </h1>
              <p style={{ color: 'var(--pmw-text)' }} className="text-lg mt-4">
                {audit.url}
              </p>
            </div>
            {/* Domain Authority - aligned to the right */}
            {audit.results?.keywords && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{audit.results.keywords.domainAuthority || 'N/A'}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  Domain Authority
                </div>
              </div>
            )}
          </div>
        </div>
        
        <AuditResults audit={audit} />
      </div>
    </div>
  )
}