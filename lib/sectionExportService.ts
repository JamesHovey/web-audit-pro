/**
 * Section Export Service
 * Exports individual audit sections to PDF and CSV
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const CHEWBACCA_LOGO_PATH = '/chewy.webp'

// Helper to strip emojis for PDF
function stripEmojis(text: string): string {
  if (!text) return text
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
}

// Helper to load logo
async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch(CHEWBACCA_LOGO_PATH)
    const blob = await response.blob()
    return new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.log('Could not load logo:', e)
    return null
  }
}

/**
 * Export a specific section to PDF
 */
export async function exportSectionToPDF(
  sectionName: string,
  sectionData: any,
  auditUrl: string
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Load logo
  const logoDataUrl = await loadLogo()

  // Helper to add logo
  const addLogo = () => {
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'WEBP', pageWidth - 50, 10, 40, 40)
      } catch (e) {
        doc.setFontSize(10)
        doc.setTextColor(139, 71, 137)
        doc.text('ROARR!!', pageWidth - 25, 20, { align: 'right' })
      }
    } else {
      doc.setFontSize(10)
      doc.setTextColor(139, 71, 137)
      doc.text('ROARR!!', pageWidth - 25, 20, { align: 'right' })
    }
  }

  // Helper to check page break
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      doc.addPage()
      yPosition = 20
      addLogo()
      return true
    }
    return false
  }

  // Add logo to first page
  addLogo()

  // Title
  doc.setFontSize(24)
  doc.setTextColor(66, 73, 156)
  doc.text(stripEmojis(sectionName), 20, yPosition)
  yPosition += 12

  // URL
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(auditUrl, 20, yPosition)
  yPosition += 10

  // Date
  doc.setFontSize(10)
  doc.text(`Exported: ${new Date().toLocaleDateString()}`, 20, yPosition)
  yPosition += 15

  // Export based on section type
  if (sectionName.includes('Traffic')) {
    exportTrafficSection(doc, sectionData, yPosition, checkNewPage)
  } else if (sectionName.includes('Keyword')) {
    exportKeywordSection(doc, sectionData, yPosition, checkNewPage)
  } else if (sectionName.includes('Performance') || sectionName.includes('Technical')) {
    exportPerformanceSection(doc, sectionData, yPosition, checkNewPage)
  } else if (sectionName.includes('Accessibility')) {
    exportAccessibilitySection(doc, sectionData, yPosition, checkNewPage)
  } else if (sectionName.includes('Competition')) {
    exportCompetitionSection(doc, sectionData, yPosition, checkNewPage)
  } else {
    exportGenericSection(doc, sectionData, yPosition, checkNewPage)
  }

  // Save PDF
  const fileName = `${stripEmojis(sectionName).replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.pdf`
  doc.save(fileName)
}

/**
 * Export a specific section to CSV
 */
export function exportSectionToCSV(
  sectionName: string,
  sectionData: any,
  auditUrl: string
) {
  let csvContent = `"${stripEmojis(sectionName)}"\n`
  csvContent += `"URL: ${auditUrl}"\n`
  csvContent += `"Exported: ${new Date().toLocaleString()}"\n\n`

  // Export based on section type
  if (sectionName.includes('Traffic')) {
    csvContent += exportTrafficToCSV(sectionData)
  } else if (sectionName.includes('Keyword')) {
    csvContent += exportKeywordToCSV(sectionData)
  } else if (sectionName.includes('Performance') || sectionName.includes('Technical')) {
    csvContent += exportPerformanceToCSV(sectionData)
  } else if (sectionName.includes('Accessibility')) {
    csvContent += exportAccessibilityToCSV(sectionData)
  } else if (sectionName.includes('Competition')) {
    csvContent += exportCompetitionToCSV(sectionData)
  } else {
    csvContent += exportGenericToCSV(sectionData)
  }

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  const fileName = `${stripEmojis(sectionName).replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Section-specific PDF exporters
function exportTrafficSection(doc: jsPDF, data: any, startY: number, checkNewPage: (h: number) => boolean) {
  let yPos = startY

  if (data.totalVisits) {
    checkNewPage(30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Traffic Overview', 20, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Monthly Visits', data.totalVisits?.toLocaleString() || 'N/A'],
        ['Organic Traffic', data.organic?.toLocaleString() || 'N/A'],
        ['Direct Traffic', data.direct?.toLocaleString() || 'N/A'],
        ['Referral Traffic', data.referral?.toLocaleString() || 'N/A'],
        ['Social Traffic', data.social?.toLocaleString() || 'N/A'],
      ],
      theme: 'striped',
      styles: { fontSize: 10 },
    })
  }
}

function exportKeywordSection(doc: jsPDF, data: any, startY: number, checkNewPage: (h: number) => boolean) {
  let yPos = startY

  // Branded Keywords
  if (data.brandedKeywords && data.brandedKeywords.length > 0) {
    checkNewPage(30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Branded Keywords', 20, yPos)
    yPos += 10

    const brandedRows = data.brandedKeywords.slice(0, 20).map((k: any) => [
      stripEmojis(k.keyword || k.term || ''),
      k.position || 'N/A',
      k.volume?.toLocaleString() || 'N/A'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Keyword', 'Position', 'Volume']],
      body: brandedRows,
      theme: 'striped',
      styles: { fontSize: 9 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Non-Branded Keywords
  if (data.nonBrandedKeywords && data.nonBrandedKeywords.length > 0) {
    checkNewPage(30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Non-Branded Keywords', 20, yPos)
    yPos += 10

    const nonBrandedRows = data.nonBrandedKeywords.slice(0, 20).map((k: any) => [
      stripEmojis(k.keyword || k.term || ''),
      k.position || 'N/A',
      k.volume?.toLocaleString() || 'N/A'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Keyword', 'Position', 'Volume']],
      body: nonBrandedRows,
      theme: 'striped',
      styles: { fontSize: 9 },
    })
  }
}

function exportPerformanceSection(doc: jsPDF, data: any, startY: number, checkNewPage: (h: number) => boolean) {
  let yPos = startY

  // Core Web Vitals
  if (data.desktop || data.mobile) {
    checkNewPage(30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Core Web Vitals', 20, yPos)
    yPos += 10

    const rows = []
    if (data.desktop) {
      rows.push(['Desktop LCP', data.desktop.lcp || 'N/A'])
      rows.push(['Desktop CLS', data.desktop.cls || 'N/A'])
      rows.push(['Desktop INP', data.desktop.inp || 'N/A'])
      rows.push(['Desktop Score', data.desktop.score || 'N/A'])
    }
    if (data.mobile) {
      rows.push(['Mobile LCP', data.mobile.lcp || 'N/A'])
      rows.push(['Mobile CLS', data.mobile.cls || 'N/A'])
      rows.push(['Mobile INP', data.mobile.inp || 'N/A'])
      rows.push(['Mobile Score', data.mobile.score || 'N/A'])
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 10 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Technical Issues
  if (data.issues) {
    checkNewPage(30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Technical Issues', 20, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Issue', 'Count']],
      body: [
        ['Missing Meta Titles', data.issues.missingMetaTitles || 0],
        ['Missing Meta Descriptions', data.issues.missingMetaDescriptions || 0],
        ['Missing H1 Tags', data.issues.missingH1Tags || 0],
        ['HTTP Errors', data.issues.httpErrors || 0],
      ],
      theme: 'striped',
      styles: { fontSize: 10 },
    })
  }
}

function exportAccessibilitySection(doc: jsPDF, data: any, startY: number, checkNewPage: (h: number) => boolean) {
  let yPos = startY

  if (data.score !== undefined) {
    checkNewPage(30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Accessibility Overview', 20, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Overall Score', `${data.score}/100`],
        ['Total Issues', data.totalIssues || 0],
        ['Critical Issues', data.issuesBySeverity?.critical || 0],
        ['Serious Issues', data.issuesBySeverity?.serious || 0],
        ['Moderate Issues', data.issuesBySeverity?.moderate || 0],
        ['EAA Compliant', data.eaaCompliant ? 'Yes' : 'No'],
      ],
      theme: 'striped',
      styles: { fontSize: 10 },
    })
  }
}

function exportCompetitionSection(doc: jsPDF, data: any, startY: number, checkNewPage: (h: number) => boolean) {
  let yPos = startY

  if (data.competitors && data.competitors.length > 0) {
    checkNewPage(30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Competitors', 20, yPos)
    yPos += 10

    const rows = data.competitors.slice(0, 15).map((c: any) => [
      c.domain || '',
      c.overlapPercentage ? `${c.overlapPercentage}%` : 'N/A',
      c.authority || 'N/A',
      c.competitorType || 'N/A'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Domain', 'Overlap', 'Authority', 'Type']],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 9 },
    })
  }
}

function exportGenericSection(doc: jsPDF, data: any, startY: number, checkNewPage: (h: number) => boolean) {
  let yPos = startY
  checkNewPage(20)
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Section data exported', 20, yPos)
  doc.setFontSize(10)
  doc.text('Please view the full audit report for detailed information.', 20, yPos + 10)
}

// Section-specific CSV exporters
function exportTrafficToCSV(data: any): string {
  let csv = '"Traffic Metrics"\n'
  csv += '"Metric","Value"\n'
  csv += `"Total Monthly Visits","${data.totalVisits?.toLocaleString() || 'N/A'}"\n`
  csv += `"Organic Traffic","${data.organic?.toLocaleString() || 'N/A'}"\n`
  csv += `"Direct Traffic","${data.direct?.toLocaleString() || 'N/A'}"\n`
  csv += `"Referral Traffic","${data.referral?.toLocaleString() || 'N/A'}"\n`
  csv += `"Social Traffic","${data.social?.toLocaleString() || 'N/A'}"\n`
  return csv
}

function exportKeywordToCSV(data: any): string {
  let csv = ''

  if (data.brandedKeywords && data.brandedKeywords.length > 0) {
    csv += '"Branded Keywords"\n'
    csv += '"Keyword","Position","Volume"\n'
    data.brandedKeywords.forEach((k: any) => {
      csv += `"${stripEmojis(k.keyword || k.term || '')}","${k.position || 'N/A'}","${k.volume?.toLocaleString() || 'N/A'}"\n`
    })
    csv += '\n'
  }

  if (data.nonBrandedKeywords && data.nonBrandedKeywords.length > 0) {
    csv += '"Non-Branded Keywords"\n'
    csv += '"Keyword","Position","Volume"\n'
    data.nonBrandedKeywords.forEach((k: any) => {
      csv += `"${stripEmojis(k.keyword || k.term || '')}","${k.position || 'N/A'}","${k.volume?.toLocaleString() || 'N/A'}"\n`
    })
  }

  return csv
}

function exportPerformanceToCSV(data: any): string {
  let csv = '"Performance Metrics"\n'
  csv += '"Metric","Value"\n'

  if (data.desktop) {
    csv += `"Desktop LCP","${data.desktop.lcp || 'N/A'}"\n`
    csv += `"Desktop CLS","${data.desktop.cls || 'N/A'}"\n`
    csv += `"Desktop INP","${data.desktop.inp || 'N/A'}"\n`
    csv += `"Desktop Score","${data.desktop.score || 'N/A'}"\n`
  }

  if (data.mobile) {
    csv += `"Mobile LCP","${data.mobile.lcp || 'N/A'}"\n`
    csv += `"Mobile CLS","${data.mobile.cls || 'N/A'}"\n`
    csv += `"Mobile INP","${data.mobile.inp || 'N/A'}"\n`
    csv += `"Mobile Score","${data.mobile.score || 'N/A'}"\n`
  }

  if (data.issues) {
    csv += '\n"Technical Issues"\n'
    csv += '"Issue","Count"\n'
    csv += `"Missing Meta Titles","${data.issues.missingMetaTitles || 0}"\n`
    csv += `"Missing Meta Descriptions","${data.issues.missingMetaDescriptions || 0}"\n`
    csv += `"Missing H1 Tags","${data.issues.missingH1Tags || 0}"\n`
    csv += `"HTTP Errors","${data.issues.httpErrors || 0}"\n`
  }

  return csv
}

function exportAccessibilityToCSV(data: any): string {
  let csv = '"Accessibility Metrics"\n'
  csv += '"Metric","Value"\n'
  csv += `"Overall Score","${data.score || 'N/A'}"\n`
  csv += `"Total Issues","${data.totalIssues || 0}"\n`
  csv += `"Critical Issues","${data.issuesBySeverity?.critical || 0}"\n`
  csv += `"Serious Issues","${data.issuesBySeverity?.serious || 0}"\n`
  csv += `"Moderate Issues","${data.issuesBySeverity?.moderate || 0}"\n`
  csv += `"EAA Compliant","${data.eaaCompliant ? 'Yes' : 'No'}"\n`
  return csv
}

function exportCompetitionToCSV(data: any): string {
  let csv = '"Competitors"\n'
  csv += '"Domain","Overlap %","Authority","Type"\n'

  if (data.competitors && data.competitors.length > 0) {
    data.competitors.forEach((c: any) => {
      csv += `"${c.domain || ''}","${c.overlapPercentage || 'N/A'}","${c.authority || 'N/A'}","${c.competitorType || 'N/A'}"\n`
    })
  }

  return csv
}

function exportGenericToCSV(data: any): string {
  return '"Section data available in full audit report"\n'
}
