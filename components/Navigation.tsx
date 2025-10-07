import Link from "next/link"
import { PMWLogo } from "./PMWLogo"

export function Navigation() {
  return (
    <nav className="shadow-sm border-b" style={{ backgroundColor: 'var(--pmw-primary)', borderColor: 'var(--pmw-border)' }}>
      <div className="container-pmw">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 text-xl font-bold text-white hover:opacity-90 transition-opacity">
              <PMWLogo size={40} />
              <span>Web Audit Pro</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">
              Demo Version
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}