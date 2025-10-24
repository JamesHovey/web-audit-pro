import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CreditCalculator } from "@/lib/creditCalculator"
import { createUsageTracker } from "@/lib/usageTracker"
import type { AuditRequestBody } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AuditRequestBody
    const { url, sections, scope = 'single', auditView = 'executive', country = 'gb', pages = [url], pageLimit = 50, excludedPaths = [] } = body

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

    // Calculate estimated credit cost
    const pageCount = pages.length
    const creditEstimate = CreditCalculator.estimateAuditCost(
      scope as 'single' | 'custom' | 'all',
      pageCount,
      sections
    )

    console.log(`💰 Audit estimate: ${creditEstimate.creditsRequired} credits for ${pageCount} pages`)

    // Get current user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, username: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Bypass credit checks for testing user
    const isBypassUser = user.username === 'james.hovey'

    if (!isBypassUser) {
      // Check if user has sufficient credits (will deduct actual cost after audit)
      if (!CreditCalculator.hasSufficientCredits(user.credits, creditEstimate.creditsRequired)) {
        return NextResponse.json({
          error: "Insufficient credits",
          required: creditEstimate.creditsRequired,
          available: user.credits,
          shortfall: creditEstimate.creditsRequired - user.credits
        }, { status: 402 }) // 402 Payment Required
      }

      console.log(`💰 User has ${user.credits} credits, estimated cost: ${creditEstimate.creditsRequired} credits`)
    } else {
      console.log(`🔓 Credit check bypassed for testing user: ${user.username}`)
    }

    // Create audit record with user ID and estimated cost
    const audit = await prisma.audit.create({
      data: {
        userId,
        url,
        sections: sections,
        status: "pending",
        estimatedCost: creditEstimate.creditsRequired,
        // Store additional audit metadata
        results: {
          scope,
          auditView, // Store the selected audit view
          pages,
          totalPages: pages.length
        }
      }
    })

    // Process audit sections sequentially with progress updates
    setTimeout(async () => {
      // Create usage tracker for this audit
      const usageTracker = createUsageTracker()
      usageTracker.startBrowserSession()

      try {
        const results: Record<string, unknown> = {}
        let currentSection = 0
        const totalSections = sections.length

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

        // Process sections in parallel for better performance
        const sectionPromises = sections.map(async (section, index) => {
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

            // For 'all' scope, discover and analyze all pages
            let pagesToAnalyze = [url];
            const pageHtmlMap = new Map<string, string>();

            if (scope === 'all') {
              console.log('🔍 Discovering pages for keyword analysis...');
              const { discoverRealPages } = await import('@/lib/realPageDiscovery');
              const pageDiscovery = await discoverRealPages(url);

              // Filter out excluded paths
              let filteredPages = pageDiscovery.pages;
              if (excludedPaths.length > 0) {
                const initialCount = filteredPages.length;
                filteredPages = filteredPages.filter(page => {
                  const pageUrl = new URL(page.url);
                  const pathname = pageUrl.pathname;
                  // Check if the pathname starts with any excluded path
                  return !excludedPaths.some(excludedPath => pathname.startsWith(excludedPath));
                });
                console.log(`🚫 Filtered out ${initialCount - filteredPages.length} pages based on excluded paths: ${excludedPaths.join(', ')}`);
              }

              // Apply page limit (null = unlimited, otherwise use the specified limit)
              const effectiveLimit = pageLimit === null ? filteredPages.length : pageLimit;
              pagesToAnalyze = filteredPages.slice(0, effectiveLimit).map(p => p.url);
              console.log(`📄 Analyzing keywords across ${pagesToAnalyze.length} pages${pageLimit === null ? ' (unlimited)' : ` (limited to ${pageLimit})`}`);

              // Fetch HTML for each page
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
                    pageHtmlMap.set(pageUrl, html);
                    console.log(`✅ Fetched HTML for ${pageUrl}`);
                  }
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  console.log(`⚠️ Could not fetch HTML for ${pageUrl}:`, errorMessage);
                }
              }
            } else if (scope === 'custom') {
              // For custom scope, use the specified pages
              pagesToAnalyze = pages;
              console.log(`📄 Analyzing keywords across ${pagesToAnalyze.length} custom pages`);

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
                    pageHtmlMap.set(pageUrl, html);
                    console.log(`✅ Fetched HTML for ${pageUrl}`);
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
                  pageHtmlMap.set(mainPage, html);
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

          } else if (section === 'technical') {
            const { performTechnicalAudit } = await import('@/lib/technicalAuditService')
            // Map scope: 'multi' -> 'custom' for technical audit
            const technicalScope: 'single' | 'all' | 'custom' = scope === 'multi' ? 'custom' : scope
            results.technical = await performTechnicalAudit(url, technicalScope, pages)

            // Run viewport responsiveness analysis (if not already done)
            if (!results.viewport) {
              try {
                console.log('📱 Running viewport responsiveness analysis...')
                const viewportResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/audit/viewport`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url })
                })

                if (viewportResponse.ok) {
                  const contentType = viewportResponse.headers.get('content-type')
                  if (contentType && contentType.includes('application/json')) {
                    results.viewport = await viewportResponse.json()
                    console.log('✅ Viewport analysis completed')
                  } else {
                    console.log('⚠️ Viewport API returned non-JSON response, skipping')
                  }
                } else {
                  console.log('⚠️ Viewport analysis request failed, skipping')
                }
              } catch (viewportError) {
                const errorMessage = viewportError instanceof Error ? viewportError.message : String(viewportError)
                console.log('⚠️ Viewport analysis error, skipping:', errorMessage)
              }
            }

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
            results.technical = await performTechnicalAudit(url, techScope, pages)

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

            // Run viewport responsiveness analysis (if not already done)
            if (!results.viewport) {
              try {
                console.log('📱 Running viewport responsiveness analysis...')
                const viewportResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/audit/viewport`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url })
                })

                if (viewportResponse.ok) {
                  const contentType = viewportResponse.headers.get('content-type')
                  if (contentType && contentType.includes('application/json')) {
                    results.viewport = await viewportResponse.json()
                    console.log('✅ Viewport analysis completed')
                  } else {
                    console.log('⚠️ Viewport API returned non-JSON response, skipping')
                  }
                } else {
                  console.log('⚠️ Viewport analysis request failed, skipping')
                }
              } catch (viewportError) {
                const errorMessage = viewportError instanceof Error ? viewportError.message : String(viewportError)
                console.log('⚠️ Viewport analysis error, skipping:', errorMessage)
              }
            }

          } else if (section === 'accessibility') {
            // Website Accessibility Audit
            const { performAccessibilityAudit } = await import('@/lib/accessibilityAuditService')

            console.log('♿ Running accessibility audit...')

            // For 'all' scope, discover and analyze pages (limit for performance)
            let pagesToAnalyze = [url];

            if (scope === 'all') {
              console.log('🔍 Discovering pages for accessibility analysis...');
              const { discoverRealPages } = await import('@/lib/realPageDiscovery');
              const pageDiscovery = await discoverRealPages(url);

              // Filter out excluded paths
              let filteredPages = pageDiscovery.pages;
              if (excludedPaths.length > 0) {
                const initialCount = filteredPages.length;
                filteredPages = filteredPages.filter(page => {
                  const pageUrl = new URL(page.url);
                  const pathname = pageUrl.pathname;
                  return !excludedPaths.some(excludedPath => pathname.startsWith(excludedPath));
                });
                console.log(`🚫 Filtered out ${initialCount - filteredPages.length} pages based on excluded paths`);
              }

              // Limit to 10 pages for accessibility testing (can be resource-intensive)
              const effectiveLimit = Math.min(pageLimit === null ? 10 : pageLimit, 10);
              pagesToAnalyze = filteredPages.slice(0, effectiveLimit).map(p => p.url);
              console.log(`📄 Analyzing accessibility across ${pagesToAnalyze.length} pages (max 10 for performance)`);
            } else if (scope === 'custom') {
              pagesToAnalyze = pages.slice(0, 10); // Limit custom pages too
              console.log(`📄 Analyzing accessibility across ${pagesToAnalyze.length} custom pages`);
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
          console.log(`Completed section: ${section}`)
        })

        // Wait for all sections to complete in parallel
        await Promise.all(sectionPromises)

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

        // Calculate actual cost based on usage
        // For now, use estimates for APIs (can be enhanced later with actual API metrics)
        const actualCost = CreditCalculator.convertActualCostToCredits(
          0, // keywordsEverywhereCredits - TODO: track actual usage
          0, // serperSearches - TODO: track actual usage
          0, // claudeInputTokens - TODO: track actual usage
          0, // claudeOutputTokens - TODO: track actual usage
          usageMetrics.browserMinutes
        )

        console.log(`📊 Usage metrics: ${Math.round(usageMetrics.browserMinutes * 100) / 100} browser minutes`)
        console.log(`💰 Actual cost: ${actualCost} credits (estimated was ${creditEstimate.creditsRequired})`)

        // Deduct actual credits from user (unless bypass user)
        if (!isBypassUser) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              credits: {
                decrement: actualCost
              }
            }
          })
          console.log(`✅ Deducted ${actualCost} credits from user ${userId}`)
        }

        // Update audit with results, actual cost, and usage metrics
        await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: "completed",
            results: safeResults,
            actualCost: actualCost,
            usageMetrics: usageMetrics,
            completedAt: new Date()
          }
        })
      } catch (error) {
        console.error('Error processing audit:', error)

        // End usage tracking even on error
        usageTracker.endBrowserSession()
        const usageMetrics = usageTracker.getMetrics()

        // Calculate actual cost (even for failed audits, to track partial usage)
        const actualCost = CreditCalculator.convertActualCostToCredits(
          0, 0, 0, 0, usageMetrics.browserMinutes
        )

        // Deduct actual credits from user (unless bypass user)
        if (!isBypassUser) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              credits: {
                decrement: actualCost
              }
            }
          })
          console.log(`✅ Deducted ${actualCost} credits from user ${userId} (error fallback)`)
        }

        // Fallback to mock data on error
        const { generateMockAuditResults } = await import('@/lib/mockData')
        const mockResults = await generateMockAuditResults(url, sections)

        // Ensure the mock results are properly serializable
        const safeMockResults = JSON.parse(JSON.stringify(mockResults))

        await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: "completed",
            results: safeMockResults,
            actualCost: actualCost,
            usageMetrics: usageMetrics,
            completedAt: new Date()
          }
        })
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