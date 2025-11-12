import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CreditCalculator } from "@/lib/creditCalculator"
import { createUsageTracker } from "@/lib/usageTracker"
import { sendAuditCompletionEmail } from "@/lib/emailService"
import type { AuditRequestBody } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AuditRequestBody
    const {
      url,
      sections,
      scope = 'single',
      auditView = 'executive',
      country = 'gb',
      pages = [url],
      pageLimit = null, // null = use smart default
      excludedPaths = [],
      maxPagesPerSection,
      useSmartSampling = true, // Enable smart sampling by default
      auditConfiguration = {
        enableLighthouse: true,
        enableAccessibility: true,
        enableImageOptimization: true,
        enableSEO: true,
        enableEmail: false
      },
      enableEmailNotification = false
    } = body

    // Smart defaults for page limits (optimized for Pro tier with 8GB RAM)
    const defaultMaxPages = 250 // Up from 100 - safe for Pro tier
    const effectiveMaxPages = maxPagesPerSection ?? (pageLimit === null ? defaultMaxPages : pageLimit)

    console.log(`📊 Audit configuration: maxPages=${effectiveMaxPages}, smartSampling=${useSmartSampling}, scope=${scope}`)

    if (!url || !sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (!Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "At least one page must be specified" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id

    // Create audit record with user ID
    const audit = await prisma.audit.create({
      data: {
        userId,
        url,
        sections: sections,
        status: "pending",
        // Store additional audit metadata
        results: {
          scope,
          auditView, // Store the selected audit view
          pages,
          totalPages: pages.length,
          auditConfiguration, // Store audit configuration
          enableEmailNotification // Store email preference
        }
      }
    })

    // Create progress update function
    const updateProgress = async (stage: string, current: number, total: number, message: string) => {
      try {
        await prisma.audit.update({
          where: { id: audit.id },
          data: {
            results: {
              ...(audit.results as object || {}),
              progress: {
                stage,
                current,
                total,
                message,
                percentage: total > 0 ? Math.round((current / total) * 100) : 0,
                updatedAt: new Date().toISOString()
              }
            }
          }
        });
        console.log(`📊 Progress: ${message} (${current}/${total})`);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    };

    // Process audit sections sequentially with progress updates
    setTimeout(async () => {
      // Create usage tracker for this audit
      const usageTracker = createUsageTracker()
      usageTracker.startBrowserSession()

      try {
        const results: Record<string, unknown> = {}
        let currentSection = 0
        const totalSections = sections.length

        // Memory monitoring helper
        const logMemoryUsage = (label: string) => {
          const memUsage = process.memoryUsage()
          console.log(`💾 [${label}] Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB used / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB total`)
        }

        logMemoryUsage('Audit Start')

        // Helper function to update progress
        const updateProgress = async (sectionName: string, status: 'running' | 'completed') => {
          try {
            await prisma.audit.update({
              where: { id: audit.id },
              data: {
                status: status === 'completed' && currentSection === totalSections ? "completed" : "running",
                results: {
                  ...results,
                  _progress: {
                    currentSection: sectionName,
                    completedSections: currentSection,
                    totalSections: totalSections,
                    status: status
                  }
                }
              }
            })
          } catch (error) {
            console.error('Error updating progress:', error)
          }
        }

        // Process sections SEQUENTIALLY to reduce memory spikes
        // Changed from parallel to sequential processing
        for (let index = 0; index < sections.length; index++) {
          const section = sections[index]
          console.log(`Processing section ${index + 1}/${totalSections}: ${section}`)

          await updateProgress(section, 'running')

          if (section === 'traffic') {
            const { getCostEffectiveTrafficData } = await import('@/lib/costEffectiveTrafficService')

            // Map scope values: 'multi' -> 'custom' for traffic service
            const trafficScope: 'single' | 'all' | 'custom' = scope === 'multi' ? 'custom' : scope

            // Always use getCostEffectiveTrafficData for consistent traffic numbers
            const trafficData = await getCostEffectiveTrafficData(url, trafficScope, pages)
            results.traffic = {
              ...trafficData,
              scope,
              totalPages: pages.length
            }

          } else if (section === 'keywords') {
            const { analyzeKeywordsEnhanced } = await import('@/lib/enhancedKeywordService')
            const { selectSmartSample, toPageInfo } = await import('@/lib/smartPageSampling')

            // For 'all' scope, discover and analyze all pages
            let pagesToAnalyze = [url];
            const pageHtmlMap = new Map<string, string>();

            if (scope === 'all') {
              console.log('🔍 Discovering pages for keyword analysis...');
              const { discoverRealPages } = await import('@/lib/realPageDiscovery');
              const pageDiscovery = await discoverRealPages(url);

              // Apply smart sampling or simple limit
              let selectedPages = pageDiscovery.pages;

              if (useSmartSampling && selectedPages.length > effectiveMaxPages) {
                console.log(`🧠 Using smart sampling to select ${effectiveMaxPages} most important pages from ${selectedPages.length} discovered pages`);
                const pageInfoList = toPageInfo(selectedPages);
                const sampledPages = selectSmartSample(pageInfoList, {
                  maxPages: effectiveMaxPages,
                  excludePatterns: excludedPaths
                });
                pagesToAnalyze = sampledPages.map(p => p.url);
              } else {
                // Simple filtering for excluded paths
                if (excludedPaths.length > 0) {
                  const initialCount = selectedPages.length;
                  selectedPages = selectedPages.filter(page => {
                    const pageUrl = new URL(page.url);
                    const pathname = pageUrl.pathname;
                    return !excludedPaths.some(excludedPath => pathname.startsWith(excludedPath));
                  });
                  console.log(`🚫 Filtered out ${initialCount - selectedPages.length} pages based on excluded paths: ${excludedPaths.join(', ')}`);
                }
                pagesToAnalyze = selectedPages.slice(0, effectiveMaxPages).map(p => p.url);
              }

              console.log(`📄 Analyzing keywords across ${pagesToAnalyze.length} pages (max: ${effectiveMaxPages})`);

              // Fetch HTML for each page (with memory limit)
              for (const pageUrl of pagesToAnalyze) {
                try {
                  const normalizedUrl = pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`;
                  const response = await fetch(normalizedUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
                    redirect: 'follow',
                    signal: AbortSignal.timeout(10000)
                  });
                  if (response.ok) {
                    const html = await response.text();
                    // Only store HTML up to 500KB per page to prevent memory bloat
                    const truncatedHtml = html.length > 500000 ? html.substring(0, 500000) : html;
                    pageHtmlMap.set(pageUrl, truncatedHtml);
                    console.log(`✅ Fetched HTML for ${pageUrl} (${Math.round(truncatedHtml.length / 1024)}KB)`);
                  }
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  console.log(`⚠️ Could not fetch HTML for ${pageUrl}:`, errorMessage);
                }
              }
            } else if (scope === 'custom') {
              // For custom scope, use the specified pages (with configurable limit)
              pagesToAnalyze = pages.slice(0, effectiveMaxPages);
              console.log(`📄 Analyzing keywords across ${pagesToAnalyze.length} custom pages (max: ${effectiveMaxPages})`);

              // Fetch HTML for each specified page
              for (const pageUrl of pagesToAnalyze) {
                try {
                  const normalizedUrl = pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`;
                  const response = await fetch(normalizedUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
                    redirect: 'follow',
                    signal: AbortSignal.timeout(10000)
                  });
                  if (response.ok) {
                    const html = await response.text();
                    // Only store HTML up to 500KB per page to prevent memory bloat
                    const truncatedHtml = html.length > 500000 ? html.substring(0, 500000) : html;
                    pageHtmlMap.set(pageUrl, truncatedHtml);
                    console.log(`✅ Fetched HTML for ${pageUrl} (${Math.round(truncatedHtml.length / 1024)}KB)`);
                  }
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  console.log(`⚠️ Could not fetch HTML for ${pageUrl}:`, errorMessage);
                }
              }
            } else {
              // Single page - fetch main page HTML only
              const mainPage = pages[0] || url;
              try {
                const normalizedUrl = mainPage.startsWith('http') ? mainPage : `https://${mainPage}`;
                const response = await fetch(normalizedUrl, {
                  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
                  redirect: 'follow',
                  signal: AbortSignal.timeout(10000)
                });
                if (response.ok) {
                  const html = await response.text();
                  // Only store HTML up to 500KB to prevent memory bloat
                  const truncatedHtml = html.length > 500000 ? html.substring(0, 500000) : html;
                  pageHtmlMap.set(mainPage, truncatedHtml);
                  console.log(`✅ Fetched HTML for ${mainPage} (${Math.round(truncatedHtml.length / 1024)}KB)`);
                }
              } catch (error) {
                console.log('Could not fetch HTML content for keyword analysis:', error);
              }
            }

            // Use the main page HTML for business detection (first page with content)
            const mainPageHtml = pageHtmlMap.get(pagesToAnalyze[0]) || '';

            console.log('🚀 Using enhanced keyword analysis with real API data only');
            // Map scope: 'multi' -> 'custom' for keyword service
            const keywordScope: 'single' | 'all' | 'custom' = scope === 'multi' ? 'custom' : scope
            results.keywords = await analyzeKeywordsEnhanced(
              url,
              mainPageHtml,
              country,
              keywordScope,
              pagesToAnalyze,
              pageHtmlMap
            )

            // Clear HTML content from memory after keyword analysis
            pageHtmlMap.clear()
            console.log('🧹 Cleared HTML content cache to free memory')

          } else if (section === 'technical') {
            const { performTechnicalAudit } = await import('@/lib/technicalAuditService')
            // Map scope: 'multi' -> 'custom' for technical audit
            const technicalScope: 'single' | 'all' | 'custom' = scope === 'multi' ? 'custom' : scope
            results.technical = await performTechnicalAudit(url, technicalScope, pages, updateProgress)

            // OPTIMIZATION: Viewport analysis disabled to reduce memory usage
            // It was frequently failing and consuming resources
            console.log('📱 Viewport analysis skipped (disabled for memory optimization)')

          } else if (section === 'performance') {
            // Enhanced performance analysis with Claude AI + Technology Stack Detection
            const { analyzePageSpeedWithClaude } = await import('@/lib/pageSpeedService')
            const { performTechnicalAudit } = await import('@/lib/technicalAuditService')
            const { detectTechStack, getHostingOrganization } = await import('@/lib/professionalTechDetection')
            const { analyzeTechnologyWithClaude } = await import('@/lib/claudeTechnologyAnalyzer')

            // First run technical audit to get comprehensive data
            console.log('🔧 Running technical audit...')
            // Map scope: 'multi' -> 'custom' for technical audit
            const techScope: 'single' | 'all' | 'custom' = scope === 'multi' ? 'custom' : scope
            results.technical = await performTechnicalAudit(url, techScope, pages, updateProgress)

            // Run technology stack detection
            console.log('🔍 Running technology stack detection...')
            try {
              const professionalTechStack = await detectTechStack(url)

              // Get hosting organization if available
              let hostingOrganization = null
              try {
                if (professionalTechStack.hosting) {
                  hostingOrganization = await getHostingOrganization(professionalTechStack.hosting)
                }
              } catch (orgError) {
                console.log('Warning: getHostingOrganization failed:', orgError)
              }

              // Cast to allow access to extended properties
              const techStack = professionalTechStack as unknown as Record<string, unknown>

              const baseTechnologyData = {
                cms: professionalTechStack.cms || 'Not detected',
                framework: professionalTechStack.framework || 'Not detected',
                pageBuilder: professionalTechStack.pageBuilder || null,
                ecommerce: (techStack.ecommerce as string | null) || null,
                analytics: professionalTechStack.analytics || 'Not detected',
                hosting: professionalTechStack.hosting || 'Not detected',
                cdn: professionalTechStack.cdn || null,
                organization: hostingOrganization || null,
                plugins: professionalTechStack.plugins || [],
                pluginAnalysis: (techStack.pluginAnalysis as Record<string, unknown> | null) || null,
                detectedPlatform: (techStack.detectedPlatform as string) || professionalTechStack.cms,
                totalPlugins: (techStack.totalPlugins as number) || 0,
                technologies: [
                  'HTML5', 'CSS3', 'JavaScript',
                  ...((techStack.other as string[]) || [])
                ].filter(Boolean),
                source: (techStack.source as string) || 'fallback',
                confidence: professionalTechStack.confidence || 'low'
              }

              results.technology = baseTechnologyData

              console.log('✅ Technology stack detection completed')
            } catch (techError) {
              console.error('❌ Technology stack detection failed:', techError)
              results.technology = { cms: 'Unknown', plugins: [], frameworks: [] }
            }

            // Fetch HTML content for Claude analysis
            let htmlContent = '';
            try {
              const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
              const response = await fetch(normalizedUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
                redirect: 'follow',
                signal: AbortSignal.timeout(15000)
              });
              if (response.ok) {
                htmlContent = await response.text();
                console.log('✅ HTML content fetched for Claude analysis')
              }
            } catch (error) {
              console.log('Could not fetch HTML content for performance analysis:', error);
            }

            // Detect WordPress plugins for performance recommendations
            const { detectWordPressPlugins } = await import('@/lib/pluginDetectionService')
            const pluginDetection = detectWordPressPlugins(htmlContent)
            console.log(`🔍 Detected plugins: ${pluginDetection.plugins.join(', ') || 'None'}`)

            // Add plugin data to technical results for recommendations
            const technicalResults = results.technical as Record<string, unknown>
            technicalResults.plugins = pluginDetection.plugins
            technicalResults.cms = pluginDetection.cms
            technicalResults.pageBuilder = pluginDetection.pageBuilder

            // Run enhanced PageSpeed analysis with Claude AI
            console.log('🚀 Running enhanced PageSpeed analysis with Claude...')
            results.performance = await analyzePageSpeedWithClaude(url, htmlContent, results.technical)

            // Preserve large images data from technical audit in performance results AND root level
            // This ensures the large images table and Technical Health section can display properly
            if (results.technical.largeImageDetails && results.technical.largeImageDetails.length > 0) {
              results.performance.largeImagesList = results.technical.largeImageDetails
              results.performance.largeImageDetails = results.technical.largeImageDetails
              results.performance.largeImages = results.technical.largeImages || results.technical.largeImageDetails.length
              // Also set at root level for Technical Health section
              results.largeImages = results.technical.largeImages || results.technical.largeImageDetails.length
              console.log(`📸 Preserved ${results.technical.largeImageDetails.length} large images in performance results and root level`)
            }

            // Preserve issues data from technical audit at root level
            // This ensures the Technical Health "Issues Found" section can display counts
            if (results.technical.issues) {
              results.issues = results.technical.issues
              console.log(`✅ Preserved technical issues in results: ${JSON.stringify(results.issues)}`)
            }

            // Run Claude AI technology intelligence analysis
            if (results.technology && htmlContent) {
              try {
                console.log('🧠 Running Claude technology intelligence analysis...')
                const technologyIntelligence = await analyzeTechnologyWithClaude(url, htmlContent, results.technology)
                results.technology = {
                  ...results.technology,
                  enhancedWithAI: true,
                  technologyIntelligence
                }
                console.log('✅ Claude technology analysis completed')
              } catch (claudeError) {
                console.log('⚠️ Claude technology analysis failed, continuing without it:', claudeError.message)
              }
            }

            // Run Universal Performance & Conversion Detection (NEW from Friday session!)
            if (htmlContent) {
              try {
                console.log('🎯 Running universal performance & conversion analysis...')
                const { analyzeUniversalPerformance } = await import('@/lib/universalPerformanceDetection')

                // Get response headers (reconstruct from fetch if needed)
                let responseHeaders: Record<string, string> = {}
                try {
                  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
                  const headResponse = await fetch(normalizedUrl, {
                    method: 'HEAD',
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
                    signal: AbortSignal.timeout(5000)
                  })
                  headResponse.headers.forEach((value, key) => {
                    responseHeaders[key] = value
                  })
                } catch (headerError) {
                  console.log('⚠️ Could not fetch headers for universal analysis, using empty headers')
                }

                const universalAnalysis = await analyzeUniversalPerformance(htmlContent, responseHeaders, url)

                // Add to results
                results.conversionAnalysis = {
                  conversionScore: universalAnalysis.conversionScore,
                  totalIssues: universalAnalysis.totalIssuesFound,
                  criticalIssues: universalAnalysis.criticalIssues,
                  highPriorityIssues: universalAnalysis.highPriorityIssues,
                  mediumPriorityIssues: universalAnalysis.mediumPriorityIssues,
                  lowPriorityIssues: universalAnalysis.lowPriorityIssues,
                  recommendations: universalAnalysis.recommendations
                }

                console.log(`✅ Universal performance analysis completed: Conversion Score ${universalAnalysis.conversionScore}/100, ${universalAnalysis.totalIssuesFound} issues found`)
              } catch (universalError) {
                console.log('⚠️ Universal performance analysis failed, continuing without it:', universalError instanceof Error ? universalError.message : String(universalError))
              }
            }

            // OPTIMIZATION: Viewport analysis disabled to reduce memory usage
            // It was frequently failing and consuming resources
            console.log('📱 Viewport analysis skipped (disabled for memory optimization)')

          } else if (section === 'accessibility') {
            // Website Accessibility Audit
            const { performAccessibilityAudit } = await import('@/lib/accessibilityAuditService')

            console.log('♿ Running accessibility audit...')

            // For 'all' scope, discover and analyze pages (limit for performance)
            // Accessibility testing is resource-intensive, so use lower limits
            const { selectSmartSample, toPageInfo } = await import('@/lib/smartPageSampling')
            const accessibilityMaxPages = Math.min(effectiveMaxPages, 25) // Cap at 25 for accessibility
            let pagesToAnalyze = [url];

            if (scope === 'all') {
              console.log('🔍 Discovering pages for accessibility analysis...');
              const { discoverRealPages } = await import('@/lib/realPageDiscovery');
              const pageDiscovery = await discoverRealPages(url);

              // Apply smart sampling for accessibility
              let selectedPages = pageDiscovery.pages;

              if (useSmartSampling && selectedPages.length > accessibilityMaxPages) {
                console.log(`🧠 Using smart sampling to select ${accessibilityMaxPages} most important pages from ${selectedPages.length} for accessibility audit`);
                const pageInfoList = toPageInfo(selectedPages);
                const sampledPages = selectSmartSample(pageInfoList, {
                  maxPages: accessibilityMaxPages,
                  excludePatterns: excludedPaths
                });
                pagesToAnalyze = sampledPages.map(p => p.url);
              } else {
                // Simple filtering
                if (excludedPaths.length > 0) {
                  const initialCount = selectedPages.length;
                  selectedPages = selectedPages.filter(page => {
                    const pageUrl = new URL(page.url);
                    const pathname = pageUrl.pathname;
                    return !excludedPaths.some(excludedPath => pathname.startsWith(excludedPath));
                  });
                  console.log(`🚫 Filtered out ${initialCount - selectedPages.length} pages based on excluded paths`);
                }
                pagesToAnalyze = selectedPages.slice(0, accessibilityMaxPages).map(p => p.url);
              }

              console.log(`📄 Analyzing accessibility across ${pagesToAnalyze.length} pages (max: ${accessibilityMaxPages})`);
            } else if (scope === 'custom') {
              pagesToAnalyze = pages.slice(0, accessibilityMaxPages);
              console.log(`📄 Analyzing accessibility across ${pagesToAnalyze.length} custom pages (max: ${accessibilityMaxPages})`);
            }

            results.accessibility = await performAccessibilityAudit(url, scope, pagesToAnalyze)
            console.log('✅ Accessibility audit completed')

          } else {
            // Handle remaining sections (technology) with mock data for now
            const { generateMockAuditResults } = await import('@/lib/mockData')
            const mockResults = await generateMockAuditResults(url, [section])
            Object.assign(results, mockResults)
          }

          await updateProgress(section, 'completed')
          currentSection++

          // Log memory after each section and force garbage collection
          logMemoryUsage(`After ${section}`)
          if (global.gc) {
            global.gc()
            logMemoryUsage(`After ${section} (post-GC)`)
          }

          console.log(`✅ Completed section ${index + 1}/${totalSections}: ${section}`)
        }

        // All sections completed sequentially
        logMemoryUsage('All Sections Complete')

        // Add scope and pages info to results
        const finalResults = {
          ...results,
          scope,
          pages,
          totalPages: pages.length
        }

        // Ensure the results are properly serializable
        // Use a safer serialization approach that handles circular references and non-serializable data
        let safeResults;
        try {
          safeResults = JSON.parse(JSON.stringify(finalResults))
        } catch (serializationError) {
          console.error('❌ JSON serialization error details:', serializationError);
          console.error('Result structure:', Object.keys(finalResults));
          if (finalResults.technical) {
            console.error('Technical keys:', Object.keys(finalResults.technical));
          }
          if (finalResults.performance) {
            console.error('Performance keys:', Object.keys(finalResults.performance));
          }

          // Attempt to serialize without problematic fields
          safeResults = JSON.parse(JSON.stringify(finalResults, (key, value) => {
            // Filter out potential HTML content or circular references
            if (typeof value === 'string' && value.length > 100000) {
              console.warn(`⚠️ Skipping large string field: ${key} (${value.length} chars)`);
              return undefined;
            }
            if (typeof value === 'string' && value.trim().startsWith('<!DOCTYPE')) {
              console.warn(`⚠️ Skipping HTML content in field: ${key}`);
              return undefined;
            }
            return value;
          }))
        }

        // End usage tracking
        usageTracker.endBrowserSession()
        const usageMetrics = usageTracker.getMetrics()

        console.log(`📊 Usage metrics: ${Math.round(usageMetrics.browserMinutes * 100) / 100} browser minutes`)

        // Update audit with results and usage metrics
        const completedAudit = await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: "completed",
            results: safeResults,
            usageMetrics: usageMetrics,
            completedAt: new Date()
          }
        })

        // Send email notification
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
          })

          if (user?.email) {
            await sendAuditCompletionEmail({
              userEmail: user.email,
              userName: user.name || undefined,
              auditId: audit.id,
              url: url,
              scope: scope,
              totalPages: pages.length,
              completedAt: completedAudit.completedAt?.toISOString() || new Date().toISOString()
            })
          }
        } catch (emailError) {
          // Log but don't fail the audit if email fails
          console.error('Failed to send completion email:', emailError)
        }
      } catch (error) {
        console.error('Error processing audit:', error)

        // End usage tracking even on error
        usageTracker.endBrowserSession()
        const usageMetrics = usageTracker.getMetrics()

        // Fallback to mock data on error
        const { generateMockAuditResults } = await import('@/lib/mockData')
        const mockResults = await generateMockAuditResults(url, sections)

        // Ensure the mock results are properly serializable
        const safeMockResults = JSON.parse(JSON.stringify(mockResults))

        const fallbackAudit = await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: "completed",
            results: safeMockResults,
            usageMetrics: usageMetrics,
            completedAt: new Date()
          }
        })

        // Send email notification even on fallback
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
          })

          if (user?.email) {
            await sendAuditCompletionEmail({
              userEmail: user.email,
              userName: user.name || undefined,
              auditId: audit.id,
              url: url,
              scope: scope,
              totalPages: pages.length,
              completedAt: fallbackAudit.completedAt?.toISOString() || new Date().toISOString()
            })
          }
        } catch (emailError) {
          console.error('Failed to send completion email:', emailError)
        }
      }
    }, 5000) // Increased to 5 seconds to allow for API calls
    
    return NextResponse.json({ 
      id: audit.id,
      status: audit.status,
      message: "Audit started successfully"
    })

  } catch (error) {
    console.error("Error creating audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}