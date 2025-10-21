'use client'

import { FileDown, FileSpreadsheet } from 'lucide-react'
import { exportSectionToPDF, exportSectionToCSV } from '@/lib/sectionExportService'
import { useState } from 'react'

interface SectionExportButtonsProps {
  sectionName: string
  sectionData: any
  auditUrl: string
  className?: string
}

export default function SectionExportButtons({
  sectionName,
  sectionData,
  auditUrl,
  className = ''
}: SectionExportButtonsProps) {
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null)

  const handleExportPDF = async () => {
    setExporting('pdf')
    try {
      await exportSectionToPDF(sectionName, sectionData, auditUrl)
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const handleExportCSV = () => {
    setExporting('csv')
    try {
      exportSectionToCSV(sectionName, sectionData, auditUrl)
    } catch (error) {
      console.error('Failed to export CSV:', error)
      alert('Failed to export CSV. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleExportPDF}
        disabled={exporting === 'pdf'}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export section to PDF"
      >
        <FileDown className="w-3.5 h-3.5" />
        {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
      </button>
      <button
        onClick={handleExportCSV}
        disabled={exporting === 'csv'}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export section to CSV"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        {exporting === 'csv' ? 'Exporting...' : 'CSV'}
      </button>
    </div>
  )
}
