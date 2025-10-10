'use client'

import Link from "next/link"
import { useState } from "react"
import { PoundSterling } from "lucide-react"
import { PMWLogo } from "./PMWLogo"
import CostingModal from "./CostingModal"

export function Navigation() {
  const [showCostingModal, setShowCostingModal] = useState(false)

  return (
    <>
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
              {/* Costing Section */}
              <button
                onClick={() => setShowCostingModal(true)}
                className="flex items-center justify-center w-8 h-8 bg-white rounded-full hover:bg-opacity-90 transition-all duration-200"
                title="View API costs and usage"
              >
                <span className="text-lg font-bold text-gray-800">£</span>
              </button>
              
              <span className="text-white text-sm">
                Demo Version
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Costing Modal */}
      <CostingModal 
        isOpen={showCostingModal}
        onClose={() => setShowCostingModal(false)}
      />
    </>
  )
}