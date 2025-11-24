"use client"

import React from 'react'
import packageJson from '../package.json'

export default function VersionDisplay() {
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="bg-gray-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-mono">
        v{packageJson.version}
      </div>
    </div>
  )
}
