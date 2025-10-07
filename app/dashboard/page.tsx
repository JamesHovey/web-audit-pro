import { AuditForm } from "@/components/AuditForm"
import { Navigation } from "@/components/Navigation"

export default async function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--pmw-soft-bg)' }}>
      <Navigation />
      <div className="container-pmw py-8">
        <div className="mb-8 spacing-pmw pt-8">
          <p style={{ color: 'var(--pmw-text)' }} className="text-lg">
            Enter a URL below to start your comprehensive website audit
          </p>
        </div>
        
        <AuditForm />
      </div>
    </div>
  )
}