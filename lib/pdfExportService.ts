import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Chewbacca logo will be loaded dynamically from public folder
const CHEWBACCA_LOGO_PATH = '/chewy.webp'

interface AuditData {
  id: string
  url: string
  status: string
  sections: string[]
  results?: Record<string, any>
  createdAt: string
  completedAt?: string
}

// Helper function to remove emojis and special characters that don't render in PDF
function stripEmojis(text: string): string {
  if (!text) return text
  // Remove emojis and other unicode symbols that don't render in PDF
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
}

export async function exportAuditToPDF(audit: AuditData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Load Chewbacca logo
  let logoDataUrl: string | null = null
  try {
    const response = await fetch(CHEWBACCA_LOGO_PATH)
    const blob = await response.blob()
    logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.log('Could not load logo:', e)
  }

  // Helper function to add logo on each page
  const addLogo = (isFirstPage = false) => {
    if (logoDataUrl) {
      try {
        // Add Chewbacca logo in top right
        doc.addImage(logoDataUrl, 'WEBP', pageWidth - 50, 10, 40, 40)
      } catch (e) {
        console.log('Logo could not be added:', e)
        // Fallback to text branding
        doc.setFontSize(10)
        doc.setTextColor(139, 71, 137)
        doc.text('ROARR!!', pageWidth - 25, 20, { align: 'right' })
      }
    } else {
      // Add text branding if logo not available
      doc.setFontSize(10)
      doc.setTextColor(139, 71, 137) // Purple color
      doc.text('ROARR!!', pageWidth - 25, 20, { align: 'right' })
    }
  }

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      doc.addPage()
      yPosition = 20
      addLogo()
      return true
    }
    return false
  }

  // Add logo to first page (moved higher to avoid overlap)
  addLogo(true)

  // Title
  doc.setFontSize(24)
  doc.setTextColor(66, 73, 156) // Purple color
  doc.text('SEO Audit Report', 20, yPosition)
  yPosition += 12

  // URL
  doc.setFontSize(14)
  doc.setTextColor(100, 100, 100)
  doc.text(audit.url, 20, yPosition)
  yPosition += 15

  // Audit Info Box - positioned lower to avoid logo overlap
  doc.setFillColor(248, 249, 250)
  doc.rect(20, yPosition, pageWidth - 70, 35, 'F')  // Reduced width to avoid logo
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)

  const auditDate = new Date(audit.completedAt || audit.createdAt)
  doc.text(`Audit Date: ${auditDate.toLocaleDateString()}`, 25, yPosition + 10)
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 25, yPosition + 20)
  doc.text(`Sections: ${audit.sections.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`, 25, yPosition + 30)
  yPosition += 45

  if (!audit.results) {
    doc.text('No audit data available', 20, yPosition)
    doc.save(`audit-${audit.id}.pdf`)
    return
  }

  // Helper function to format section titles properly (keep on one line)
  const formatSectionTitle = (section: string): string => {
    // Map specific section names to avoid word breaks
    const sectionMap: Record<string, string> = {
      'technicalPerformance': 'Technical Performance',
      'performance': 'Performance',
      'technical': 'Technical',
      'keywords': 'Keywords',
      'traffic': 'Traffic',
      'backlinks': 'Backlinks',
      'viewport': 'Viewport Responsiveness',
      'authority': 'Domain Authority',
      'technology': 'Technology Stack',
      'Technical Performance': 'Technical Performance' // Handle pre-formatted titles
    }

    // Check if we have a specific mapping
    if (sectionMap[section]) {
      return sectionMap[section]
    }

    // If it's already a readable title (contains spaces), return as-is
    if (section.includes(' ')) {
      return section
    }

    // Otherwise convert camelCase to Title Case
    const formatted = section
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
    return formatted
  }

  // Define section order to match UI display
  const sectionOrder = [
    'traffic',
    'performance',
    'technical',
    'technology',
    'keywords',
    'backlinks',
    'viewport',
    'authority'
  ]

  // Get all sections in the correct order
  const sectionsToProcess = sectionOrder
    .filter(section => audit.results[section] && audit.results[section] !== null)
    .map(section => [section, audit.results[section]])

  // Add any additional sections not in the predefined order
  const processedSections = new Set(sectionOrder)
  Object.entries(audit.results).forEach(([section, data]) => {
    if (!processedSections.has(section) &&
        data &&
        section !== 'completedSections' &&
        section !== 'scope' &&
        section !== 'pages' &&
        section !== 'totalPages' &&
        section !== '_progress' &&
        section !== 'country') {
      sectionsToProcess.push([section, data])
    }
  })

  // Process each section in order
  for (const [section, data] of sectionsToProcess) {
    if (!data) continue

    checkNewPage(30)

    // Section Title - single line, no wrapping
    doc.setFontSize(16)
    doc.setTextColor(66, 73, 156)
    const sectionTitle = formatSectionTitle(section)
    // Use splitTextToSize with a large width to prevent wrapping
    doc.text(sectionTitle, 20, yPosition)
    yPosition += 10

    // Keywords Section
    if (section === 'keywords' && typeof data === 'object') {
      const keywordData = data as any

      // Metrics
      checkNewPage(40)
      const metrics = [
        ['Domain Authority', keywordData.domainAuthority || 'N/A'],
        ['Organic Traffic', keywordData.organicTraffic?.toLocaleString() || 'N/A'],
        ['Branded Keywords', keywordData.brandedKeywords || 0],
        ['Non-Branded Keywords', keywordData.nonBrandedKeywords || 0],
        ['Total Keywords', keywordData.totalKeywords || 0]
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: metrics,
        theme: 'grid',
        headStyles: { fillColor: [66, 73, 156] },
        margin: { left: 20, right: 20 }
      })
      yPosition = (doc as any).lastAutoTable.finalY + 10

      // ALL Top Keywords (no pagination limit)
      if (keywordData.topKeywords && keywordData.topKeywords.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('Top Keywords', 20, yPosition)
        yPosition += 8

        const keywordRows = keywordData.topKeywords.map((kw: any) => [
          kw.keyword || 'N/A',
          kw.volume?.toLocaleString() || 'N/A',
          kw.position || 'N/A',
          kw.type || 'N/A',
          kw.difficulty || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Keyword', 'Volume', 'Position', 'Type', 'Difficulty']],
          body: keywordRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // ALL Branded Keywords
      if (keywordData.brandedKeywordsList && keywordData.brandedKeywordsList.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.text('Branded Keywords', 20, yPosition)
        yPosition += 8

        const brandedRows = keywordData.brandedKeywordsList.map((kw: any) => [
          kw.keyword || 'N/A',
          kw.volume?.toLocaleString() || 'N/A',
          kw.position || 'N/A',
          kw.difficulty || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Keyword', 'Volume', 'Position', 'Difficulty']],
          body: brandedRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // ALL Non-Branded Keywords
      if (keywordData.nonBrandedKeywordsList && keywordData.nonBrandedKeywordsList.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.text('Non-Branded Keywords', 20, yPosition)
        yPosition += 8

        const nonBrandedRows = keywordData.nonBrandedKeywordsList.map((kw: any) => [
          kw.keyword || 'N/A',
          kw.volume?.toLocaleString() || 'N/A',
          kw.position || 'N/A',
          kw.difficulty || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Keyword', 'Volume', 'Position', 'Difficulty']],
          body: nonBrandedRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // ALL Competitors
      if (keywordData.competitors && keywordData.competitors.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.text('Keyword Competitors', 20, yPosition)
        yPosition += 8

        const competitorRows = keywordData.competitors.map((comp: any) => [
          comp.domain || 'N/A',
          comp.commonKeywords || 0,
          comp.organicTraffic?.toLocaleString() || 'N/A',
          comp.domainAuthority || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Domain', 'Common Keywords', 'Traffic', 'Authority']],
          body: competitorRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }
    }

    // Traffic Section
    else if (section === 'traffic' && typeof data === 'object') {
      const trafficData = data as any

      checkNewPage(40)
      const trafficMetrics = []

      // Add metrics only if they have actual values
      if (trafficData.totalVisits || trafficData.estimatedMonthlyVisits) {
        trafficMetrics.push(['Total Visits', (trafficData.totalVisits || trafficData.estimatedMonthlyVisits)?.toLocaleString() || 'N/A'])
      }
      if (trafficData.organicTraffic || trafficData.estimatedOrganicTraffic) {
        trafficMetrics.push(['Organic Traffic', (trafficData.organicTraffic || trafficData.estimatedOrganicTraffic)?.toLocaleString() || 'N/A'])
      }
      if (trafficData.directTraffic) {
        trafficMetrics.push(['Direct Traffic', trafficData.directTraffic?.toLocaleString() || 'N/A'])
      }
      if (trafficData.referralTraffic) {
        trafficMetrics.push(['Referral Traffic', trafficData.referralTraffic?.toLocaleString() || 'N/A'])
      }
      if (trafficData.bounceRate) {
        trafficMetrics.push(['Bounce Rate', `${trafficData.bounceRate}%`])
      }
      if (trafficData.avgSessionDuration) {
        trafficMetrics.push(['Avg Session Duration', trafficData.avgSessionDuration])
      }

      // Geographic distribution
      if (trafficData.geographicDistribution && trafficData.geographicDistribution.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('Geographic Distribution', 20, yPosition)
        yPosition += 8

        const geoRows = trafficData.geographicDistribution.map((geo: any) => [
          geo.country || 'N/A',
          geo.percentage ? `${geo.percentage}%` : 'N/A',
          geo.traffic?.toLocaleString() || '0'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Country', 'Percentage', 'Estimated Traffic']],
          body: geoRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Only show metrics table if we have data
      if (trafficMetrics.length > 0) {
        checkNewPage(40)
        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: trafficMetrics,
          theme: 'grid',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }
    }

    // Performance Section
    else if (section === 'performance' && typeof data === 'object') {
      const perfData = data as any

      // Only show summary metrics if they exist
      const hasSummaryMetrics = perfData.performanceScore || perfData.score || perfData.desktop || perfData.mobile

      if (hasSummaryMetrics) {
        checkNewPage(40)
        const perfMetrics = []

        if (perfData.score) perfMetrics.push(['Performance Score', perfData.score])
        if (perfData.desktop?.score) perfMetrics.push(['Desktop Score', perfData.desktop.score])
        if (perfData.mobile?.score) perfMetrics.push(['Mobile Score', perfData.mobile.score])
        if (perfData.desktop?.lcp && typeof perfData.desktop.lcp === 'number') {
          perfMetrics.push(['Desktop LCP', `${(perfData.desktop.lcp / 1000).toFixed(1)}s`])
        }
        if (perfData.mobile?.lcp && typeof perfData.mobile.lcp === 'number') {
          perfMetrics.push(['Mobile LCP', `${(perfData.mobile.lcp / 1000).toFixed(1)}s`])
        }
        if (perfData.desktop?.cls && typeof perfData.desktop.cls === 'number') {
          perfMetrics.push(['Desktop CLS', perfData.desktop.cls.toFixed(3)])
        }
        if (perfData.mobile?.cls && typeof perfData.mobile.cls === 'number') {
          perfMetrics.push(['Mobile CLS', perfData.mobile.cls.toFixed(3)])
        }
        if (perfData.desktop?.inp && typeof perfData.desktop.inp === 'number') {
          perfMetrics.push(['Desktop INP', `${perfData.desktop.inp}ms`])
        }
        if (perfData.mobile?.inp && typeof perfData.mobile.inp === 'number') {
          perfMetrics.push(['Mobile INP', `${perfData.mobile.inp}ms`])
        }

        if (perfMetrics.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [['Metric', 'Value']],
            body: perfMetrics,
            theme: 'grid',
            headStyles: { fillColor: [66, 73, 156] },
            margin: { left: 20, right: 20 }
          })
          yPosition = (doc as any).lastAutoTable.finalY + 10
        }
      }

      // Page Performance Metrics (per-page data)
      if (audit.results?.pages && audit.results.pages.some((page: any) => page.performance)) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('Page Performance Metrics', 20, yPosition)
        yPosition += 8

        const pagePerformanceRows = audit.results.pages
          .filter((page: any) => page.performance)
          .map((page: any) => {
            const perf = page.performance
            return [
              page.url || 'N/A',
              perf.desktop?.score || 'N/A',
              perf.mobile?.score || 'N/A',
              (perf.desktop?.lcp && typeof perf.desktop.lcp === 'number') ? `${(perf.desktop.lcp / 1000).toFixed(1)}s` : 'N/A',
              (perf.desktop?.cls && typeof perf.desktop.cls === 'number') ? perf.desktop.cls.toFixed(3) : 'N/A',
              (perf.desktop?.inp && typeof perf.desktop.inp === 'number') ? `${perf.desktop.inp}ms` : 'N/A',
              (perf.mobile?.lcp && typeof perf.mobile.lcp === 'number') ? `${(perf.mobile.lcp / 1000).toFixed(1)}s` : 'N/A',
              (perf.mobile?.cls && typeof perf.mobile.cls === 'number') ? perf.mobile.cls.toFixed(3) : 'N/A',
              (perf.mobile?.inp && typeof perf.mobile.inp === 'number') ? `${perf.mobile.inp}ms` : 'N/A'
            ]
          })

        autoTable(doc, {
          startY: yPosition,
          head: [['Page URL', 'Desktop Score', 'Mobile Score', 'Desktop LCP', 'Desktop CLS', 'Desktop INP', 'Mobile LCP', 'Mobile CLS', 'Mobile INP']],
          body: pagePerformanceRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Large Images Need Optimization
      const largeImages = perfData.largeImagesList || perfData.largeImageDetails || audit.results?.largeImagesList || audit.results?.largeImageDetails
      if (largeImages && largeImages.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.setTextColor(255, 140, 0) // Orange color
        doc.text('Large Images Need Optimization', 20, yPosition)
        yPosition += 8

        const largeImageRows = largeImages.map((img: any) => [
          img.url || img.src || 'N/A',
          img.size || img.transferSize || 'N/A',
          img.potentialSavings || img.wastedBytes || 'N/A',
          img.format || img.type || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Image URL', 'Current Size', 'Potential Savings', 'Format']],
          body: largeImageRows,
          theme: 'striped',
          headStyles: { fillColor: [255, 140, 0] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Key Recommendations with expanded "How to Fix"
      if (perfData.recommendations && perfData.recommendations.length > 0) {
        // Ensure header and content stay together - check if we need at least 60 units of space
        checkNewPage(60)
        doc.setFontSize(14)
        doc.setTextColor(66, 73, 156)
        doc.text('Key Recommendations', 20, yPosition)
        yPosition += 10

        // Enhance recommendations with howTo steps (like EnhancedRecommendations component)
        const enhanceRecommendation = (rec: any) => {
          // If it's already an object with howTo, return as-is
          if (typeof rec === 'object' && rec.howTo) return rec

          // Otherwise it's a string, so enhance it
          const recText = typeof rec === 'string' ? rec : (rec.title || rec.description || String(rec))
          const lowerRec = recText.toLowerCase()

          let howTo: string[] = []
          let title = recText
          let description = ''
          let impact = 'Medium'
          let effort = 'Medium'

          if (lowerRec.includes('unused css') || lowerRec.includes('remove unused css')) {
            title = 'Remove Unused CSS'
            description = 'Your site has CSS code that is not being used, slowing down loading'
            howTo = [
              'Use developer tools to identify unused CSS',
              'Remove or comment out unused styles',
              'Consider using CSS purging tools',
              'Split CSS into smaller, page-specific files',
              'WordPress: Use WP Rocket (File Optimization > CSS) or Autoptimize to minify and combine CSS'
            ]
            impact = 'Medium'
            effort = 'Medium'
          } else if (lowerRec.includes('unused javascript') || lowerRec.includes('remove unused javascript')) {
            title = 'Remove Unused JavaScript'
            description = 'JavaScript files contain code that is not being executed'
            howTo = [
              'Audit JavaScript files for unused code',
              'Remove unnecessary third-party scripts',
              'Use code splitting to load JS only when needed',
              'Minify and compress remaining JavaScript',
              'WordPress: Use WP Rocket (File Optimization > JavaScript) to defer and minify JS'
            ]
            impact = 'High'
            effort = 'Medium'
          } else if (lowerRec.includes('render-blocking') || lowerRec.includes('blocking resources')) {
            title = 'Fix Render-Blocking Resources'
            description = 'CSS and JS files are preventing your page from displaying quickly'
            howTo = [
              'Inline critical CSS in the HTML head',
              'Load non-critical CSS asynchronously',
              'Defer non-essential JavaScript',
              'Use resource hints like preload for critical resources',
              'WordPress: Use WP Rocket (File Optimization) to defer JavaScript and optimize CSS delivery'
            ]
            impact = 'High'
            effort = 'Hard'
          } else if (lowerRec.includes('images') && (lowerRec.includes('offscreen') || lowerRec.includes('defer') || lowerRec.includes('lazy'))) {
            title = 'Lazy Load Images'
            description = 'Images below the fold are loading immediately, wasting bandwidth'
            howTo = [
              'Add loading="lazy" to img tags',
              'Use intersection observer for custom lazy loading',
              'Prioritize above-the-fold images',
              'Consider using modern image formats',
              'WordPress: Use WP Rocket (Media > LazyLoad) or a3 Lazy Load plugin'
            ]
            impact = 'Medium'
            effort = 'Easy'
          } else if (lowerRec.includes('webp') || lowerRec.includes('next-gen') || lowerRec.includes('image format')) {
            title = 'Use Modern Image Formats'
            description = 'Convert images to WebP or AVIF for better compression'
            howTo = [
              'Convert JPEG/PNG to WebP format',
              'Use picture element with fallbacks',
              'Set up automatic conversion on your server',
              'Test image quality after conversion',
              'WordPress: Use Imagify, ShortPixel, or EWWW Image Optimizer for automatic WebP conversion'
            ]
            impact = 'Medium'
            effort = 'Easy'
          } else if (lowerRec.includes('minify')) {
            title = 'Minify Code Files'
            description = 'Remove unnecessary characters from CSS/JS to reduce file sizes'
            howTo = [
              'Use build tools like Webpack or Gulp',
              'Enable minification in your CMS/platform',
              'Use online minification tools',
              'Set up automated minification in deployment',
              'WordPress: Use WP Rocket or Autoptimize for automatic minification'
            ]
            impact = 'Low'
            effort = 'Easy'
          } else if (lowerRec.includes('server response') || lowerRec.includes('response time')) {
            title = 'Improve Server Response Time'
            description = 'Your server takes too long to respond to requests'
            howTo = [
              'Upgrade to faster hosting',
              'Enable caching on your server',
              'Optimize database queries',
              'Use a Content Delivery Network (CDN)',
              'WordPress: Use WP Rocket for page caching, and consider upgrading to managed WordPress hosting'
            ]
            impact = 'High'
            effort = 'Hard'
          } else if (lowerRec.includes('text compression') || lowerRec.includes('compression')) {
            title = 'Enable Text Compression'
            description = 'Compress text files before sending them to browsers'
            howTo = [
              'Enable Gzip compression on your server',
              'Use Brotli compression for better results',
              'Configure compression for CSS, JS, and HTML',
              'Test compression is working properly',
              'WordPress: WP Rocket automatically enables Gzip compression'
            ]
            impact = 'Medium'
            effort = 'Easy'
          } else if (lowerRec.includes('largest contentful paint') || lowerRec.includes('lcp')) {
            title = 'Optimize Largest Contentful Paint (LCP)'
            description = 'The largest element on your page is loading too slowly'
            howTo = [
              'Optimize and compress hero images',
              'Use preload for critical resources',
              'Reduce server response times',
              'Remove render-blocking CSS and JavaScript',
              'WordPress: Use WP Rocket + image optimization plugin (Imagify/ShortPixel) for comprehensive optimization'
            ]
            impact = 'High'
            effort = 'Medium'
          } else {
            // Generic fallback
            title = recText
            howTo = [
              'Research best practices for this optimization',
              'Test changes on a staging environment first',
              'Monitor performance before and after changes',
              'Document the improvements made'
            ]
          }

          return { title, description, howTo, impact, effort }
        }

        for (const rec of perfData.recommendations.slice(0, 6)) {
          const enhanced = enhanceRecommendation(rec)
          checkNewPage(50)

          // Recommendation title (strip emojis)
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
          doc.setFont('helvetica', 'bold')
          doc.text(stripEmojis(enhanced.title), 25, yPosition)
          yPosition += 6

          // Impact and Effort badges
          if (enhanced.impact || enhanced.effort) {
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            let badgeText = ''
            if (enhanced.impact) badgeText += `Impact: ${enhanced.impact}`
            if (enhanced.effort) badgeText += ` | Effort: ${enhanced.effort}`
            doc.setTextColor(100, 100, 100)
            doc.text(badgeText, 25, yPosition)
            yPosition += 6
          }

          // Description (strip emojis)
          if (enhanced.description) {
            doc.setFontSize(9)
            doc.setTextColor(60, 60, 60)
            doc.setFont('helvetica', 'normal')
            const descLines = doc.splitTextToSize(stripEmojis(enhanced.description), pageWidth - 50)
            doc.text(descLines, 25, yPosition)
            yPosition += (descLines.length * 5) + 4
          }

          // How to Fix section (expanded, strip emojis)
          if (enhanced.howTo && enhanced.howTo.length > 0) {
            checkNewPage(30)
            doc.setFontSize(10)
            doc.setTextColor(66, 73, 156)
            doc.setFont('helvetica', 'bold')
            doc.text('How to fix this:', 25, yPosition)
            yPosition += 6

            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'normal')

            enhanced.howTo.forEach((step: string, index: number) => {
              checkNewPage(15)
              const cleanStep = stripEmojis(step)
              const stepLines = doc.splitTextToSize(`- ${cleanStep}`, pageWidth - 55)
              doc.text(stepLines, 30, yPosition)
              yPosition += (stepLines.length * 5) + 2
            })
          }

          yPosition += 5 // Space between recommendations
        }
      }

      // ALL Opportunities
      if (perfData.opportunities && perfData.opportunities.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('Performance Opportunities', 20, yPosition)
        yPosition += 8

        const opportunityRows = perfData.opportunities.map((opp: any) => [
          opp.title || 'N/A',
          opp.description || 'N/A',
          opp.savings || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Opportunity', 'Description', 'Potential Savings']],
          body: opportunityRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }
    }

    // Technical Section
    else if (section === 'technical' && typeof data === 'object') {
      const techData = data as any

      checkNewPage(40)
      const techMetrics = []

      if (techData.seoScore) techMetrics.push(['SEO Score', techData.seoScore])
      if (techData.mobileScore) techMetrics.push(['Mobile Score', techData.mobileScore])
      if (techData.httpsEnabled !== undefined) techMetrics.push(['HTTPS', techData.httpsEnabled ? 'Yes' : 'No'])
      if (techData.hasRobotsTxt !== undefined) techMetrics.push(['Robots.txt', techData.hasRobotsTxt ? 'Yes' : 'No'])
      if (techData.hasSitemap !== undefined) techMetrics.push(['Sitemap', techData.hasSitemap ? 'Yes' : 'No'])

      if (techMetrics.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Technical Aspect', 'Status']],
          body: techMetrics,
          theme: 'grid',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Technical Health Issues - Pages Missing Meta Titles
      if (audit.results?.pages && audit.results.pages.length > 0) {
        const pagesWithoutTitles = audit.results.pages.filter((p: any) => !p.hasTitle && p.url)
        if (pagesWithoutTitles.length > 0) {
          checkNewPage(40)
          doc.setFontSize(12)
          doc.setTextColor(255, 0, 0)
          doc.text(`Pages Missing Meta Titles (${pagesWithoutTitles.length})`, 20, yPosition)
          doc.setTextColor(0, 0, 0)
          yPosition += 8

          const titleRows = pagesWithoutTitles.slice(0, 50).map((page: any) => {
            // Truncate long URLs for PDF readability
            const url = page.url || 'Unknown URL'
            return [url.length > 100 ? url.substring(0, 97) + '...' : url]
          })

          if (titleRows.length > 0) {
            autoTable(doc, {
              startY: yPosition,
              head: [['Page URL']],
              body: titleRows,
              theme: 'striped',
              headStyles: { fillColor: [239, 68, 68] },
              margin: { left: 20, right: 20 },
              styles: { fontSize: 8 }
            })
            yPosition = (doc as any).lastAutoTable.finalY + 10
          }
        }

        // Pages Missing Meta Descriptions
        const pagesWithoutDescriptions = audit.results.pages.filter((p: any) => !p.hasDescription && p.url)
        if (pagesWithoutDescriptions.length > 0) {
          checkNewPage(40)
          doc.setFontSize(12)
          doc.setTextColor(255, 0, 0)
          doc.text(`Pages Missing Meta Descriptions (${pagesWithoutDescriptions.length})`, 20, yPosition)
          doc.setTextColor(0, 0, 0)
          yPosition += 8

          const descRows = pagesWithoutDescriptions.slice(0, 50).map((page: any) => {
            const url = page.url || 'Unknown URL'
            return [url.length > 100 ? url.substring(0, 97) + '...' : url]
          })

          if (descRows.length > 0) {
            autoTable(doc, {
              startY: yPosition,
              head: [['Page URL']],
              body: descRows,
              theme: 'striped',
              headStyles: { fillColor: [239, 68, 68] },
              margin: { left: 20, right: 20 },
              styles: { fontSize: 8 }
            })
            yPosition = (doc as any).lastAutoTable.finalY + 10
          }
        }

        // Pages Missing H1 Tags
        const pagesWithoutH1 = audit.results.pages.filter((p: any) => !p.hasH1 && p.url)
        if (pagesWithoutH1.length > 0) {
          checkNewPage(40)
          doc.setFontSize(12)
          doc.setTextColor(255, 0, 0)
          doc.text(`Pages Missing H1 Tags (${pagesWithoutH1.length})`, 20, yPosition)
          doc.setTextColor(0, 0, 0)
          yPosition += 8

          const h1Rows = pagesWithoutH1.slice(0, 50).map((page: any) => {
            const url = page.url || 'Unknown URL'
            return [url.length > 100 ? url.substring(0, 97) + '...' : url]
          })

          if (h1Rows.length > 0) {
            autoTable(doc, {
              startY: yPosition,
              head: [['Page URL']],
              body: h1Rows,
              theme: 'striped',
              headStyles: { fillColor: [239, 68, 68] },
              margin: { left: 20, right: 20 },
              styles: { fontSize: 8 }
            })
            yPosition = (doc as any).lastAutoTable.finalY + 10
          }
        }
      }

      // ALL Technical Issues
      if (techData.issues && techData.issues.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.text('Technical Issues', 20, yPosition)
        yPosition += 8

        const issueRows = techData.issues.map((issue: any) => [
          issue.type || 'N/A',
          issue.severity || 'N/A',
          issue.description || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Issue Type', 'Severity', 'Description']],
          body: issueRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }
    }

    // Backlinks Section
    else if (section === 'backlinks' && typeof data === 'object') {
      const backlinkData = data as any

      checkNewPage(40)
      const backlinkMetrics = [
        ['Domain Authority', backlinkData.domainAuthority || 'N/A'],
        ['Total Backlinks', backlinkData.totalBacklinks?.toLocaleString() || 'N/A'],
        ['Referring Domains', backlinkData.referringDomains?.toLocaleString() || 'N/A'],
        ['Follow Links', backlinkData.followLinks?.toLocaleString() || 'N/A'],
        ['NoFollow Links', backlinkData.nofollowLinks?.toLocaleString() || 'N/A']
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: backlinkMetrics,
        theme: 'grid',
        headStyles: { fillColor: [66, 73, 156] },
        margin: { left: 20, right: 20 }
      })
      yPosition = (doc as any).lastAutoTable.finalY + 10

      // ALL Top Backlinks
      if (backlinkData.topBacklinks && backlinkData.topBacklinks.length > 0) {
        checkNewPage(40)
        doc.setFontSize(12)
        doc.text('Top Backlinks', 20, yPosition)
        yPosition += 8

        const backlinkRows = backlinkData.topBacklinks.map((link: any) => [
          link.source || 'N/A',
          link.authority || 'N/A',
          link.type || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Source', 'Authority', 'Type']],
          body: backlinkRows,
          theme: 'striped',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }
    }

    // Viewport Section
    else if (section === 'viewport' && typeof data === 'object') {
      const viewportData = data as any

      if (viewportData.summary) {
        checkNewPage(30)
        const summaryMetrics = [
          ['Overall Score', `${viewportData.summary.score}/100`],
          ['Critical Issues', viewportData.summary.criticalIssues],
          ['Warnings', viewportData.summary.warnings],
          ['Viewports Tested', viewportData.summary.testedViewports]
        ]

        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: summaryMetrics,
          theme: 'grid',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // ALL Viewport Results
      if (viewportData.viewports && viewportData.viewports.length > 0) {
        for (const viewport of viewportData.viewports) {
          checkNewPage(40)
          doc.setFontSize(12)
          doc.text(`${viewport.viewport} (${viewport.width}px) - Score: ${viewport.score}/100`, 20, yPosition)
          yPosition += 8

          if (viewport.issues && viewport.issues.length > 0) {
            const issueRows = viewport.issues.map((issue: any) => [
              issue.type || 'N/A',
              issue.issue || 'N/A',
              issue.recommendation || 'N/A'
            ])

            autoTable(doc, {
              startY: yPosition,
              head: [['Type', 'Issue', 'Recommendation']],
              body: issueRows,
              theme: 'striped',
              headStyles: { fillColor: [66, 73, 156] },
              margin: { left: 20, right: 20 },
              styles: { fontSize: 8 }
            })
            yPosition = (doc as any).lastAutoTable.finalY + 10
          }
        }
      }
    }

    // Generic section handling
    else if (typeof data === 'object' && data !== null) {
      checkNewPage(30)
      const entries = Object.entries(data).filter(([key]) =>
        !['completedSections', 'scope', 'pages', 'totalPages', '_progress'].includes(key)
      )

      if (entries.length > 0) {
        const rows = entries.slice(0, 20).map(([key, value]) => [
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          typeof value === 'object' ? JSON.stringify(value).slice(0, 100) : String(value)
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Property', 'Value']],
          body: rows,
          theme: 'grid',
          headStyles: { fillColor: [66, 73, 156] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        })
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }
    }
  }

  // Footer on last page
  checkNewPage(30)
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated by Web Audit Pro - ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' })
  doc.text(`Complete SEO analysis for ${audit.url}`, pageWidth / 2, yPosition + 8, { align: 'center' })

  // Save the PDF
  const fileName = `audit-${audit.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
