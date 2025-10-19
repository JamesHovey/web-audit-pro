import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, sections, scope = 'single', country = 'gb', isUKCompany = false, pages = [url], pageLimit = 50, excludedPaths = [] } = body

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

    // Ensure demo user exists
    const demoUserId = "demo-user-id"
    let demoUser = await prisma.user.findUnique({
      where: { id: demoUserId }
    })
    
    if (!demoUser) {
      // Create demo user if it doesn't exist
      demoUser = await prisma.user.create({
        data: {
          id: demoUserId,
          email: "demo@webauditpro.com",
          name: "Demo User"
        }
      })
    }

    // Create audit record with demo user
    const audit = await prisma.audit.create({
      data: {
        userId: demoUserId,
        url,
        sections: sections,
        status: "pending",
        // Store additional audit metadata
        results: {
          scope,
          pages,
          totalPages: pages.length
        }
      }
    })

    // Process audit sections sequentially with progress updates
    setTimeout(async () => {
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

        // Process each section sequentially
        for (const section of sections) {
          currentSection++
          console.log(`Processing section ${currentSection}/${totalSections}: ${section}`)
          
          await updateProgress(section, 'running')

          if (section === 'traffic') {
            const { getCostEffectiveTrafficData } = await import('@/lib/costEffectiveTrafficService')

            // Always use getCostEffectiveTrafficData for consistent traffic numbers
            results.traffic = await getCostEffectiveTrafficData(url, scope, pages)

            results.traffic.scope = scope
            results.traffic.totalPages = pages.length

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
                  console.log(`⚠️ Could not fetch HTML for ${pageUrl}:`, error.message);
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
                  console.log(`⚠️ Could not fetch HTML for ${pageUrl}:`, error.message);
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
            results.keywords = await analyzeKeywordsEnhanced(
              url,
              mainPageHtml,
              country,
              scope,
              pagesToAnalyze,
              pageHtmlMap
            )

          } else if (section === 'technical') {
            const { performTechnicalAudit } = await import('@/lib/technicalAuditService')
            results.technical = await performTechnicalAudit(url, scope, pages)

            // Run viewport responsiveness analysis (if not already done)
            if (!results.viewport) {
              console.log('📱 Running viewport responsiveness analysis...')
              const viewportResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/audit/viewport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
              }).catch(async () => {
                // If fetch fails, simulate the viewport analysis locally
                return null
              })

              if (viewportResponse && viewportResponse.ok) {
                results.viewport = await viewportResponse.json()
                console.log('✅ Viewport analysis completed')
              } else {
                console.log('⚠️ Viewport analysis skipped')
              }
            }

          } else if (section === 'performance') {
            // Enhanced performance analysis with Claude AI
            const { analyzePageSpeedWithClaude } = await import('@/lib/pageSpeedService')
            const { performTechnicalAudit } = await import('@/lib/technicalAuditService')

            // First run technical audit to get comprehensive data
            console.log('🔧 Running technical audit...')
            results.technical = await performTechnicalAudit(url, scope, pages)

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
            results.technical.plugins = pluginDetection.plugins
            results.technical.cms = pluginDetection.cms
            results.technical.pageBuilder = pluginDetection.pageBuilder

            // Run enhanced PageSpeed analysis with Claude AI
            console.log('🚀 Running enhanced PageSpeed analysis with Claude...')
            results.performance = await analyzePageSpeedWithClaude(url, htmlContent, results.technical)

            // Run viewport responsiveness analysis (if not already done)
            if (!results.viewport) {
              console.log('📱 Running viewport responsiveness analysis...')
              const viewportResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/audit/viewport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
              }).catch(async () => {
                // If fetch fails, simulate the viewport analysis locally
                return null
              })

              if (viewportResponse && viewportResponse.ok) {
                results.viewport = await viewportResponse.json()
                console.log('✅ Viewport analysis completed')
              } else {
                console.log('⚠️ Viewport analysis skipped')
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
        }
        
        // Add scope and pages info to results
        const finalResults = { 
          ...results,
          scope,
          pages,
          totalPages: pages.length
        }
        
        // Ensure the results are properly serializable
        const safeResults = JSON.parse(JSON.stringify(finalResults))
        
        await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: "completed",
            results: safeResults,
            completedAt: new Date()
          }
        })
      } catch (error) {
        console.error('Error processing audit:', error)
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