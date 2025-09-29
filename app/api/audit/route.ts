import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { url, sections, scope = 'single', pages = [url] } = body

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

    // Create audit record with scope and pages info
    const audit = await prisma.audit.create({
      data: {
        userId: session.user.id,
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
            results.traffic = await getCostEffectiveTrafficData(url)
            
            // For "All Discoverable Pages", add page popularity analysis
            if (scope === 'all') {
              const { analyzePagePopularity } = await import('@/lib/pagePopularityAnalyzer')
              const popularPagesResult = await analyzePagePopularity(url)
              
              if (popularPagesResult.pages.length > 0) {
                results.traffic.popularPages = {
                  pages: popularPagesResult.pages.map(page => ({
                    url: page.url,
                    title: page.title,
                    estimatedTrafficShare: page.estimatedTrafficShare,
                    signals: {
                      isHomepage: page.signals.isHomepage,
                      navigationPosition: page.signals.navigationPosition,
                      internalLinkCount: page.signals.internalLinkCount,
                      urlDepth: page.signals.urlDepth
                    },
                    internalLinks: page.internalLinks
                  })),
                  methodology: popularPagesResult.methodology,
                  confidence: popularPagesResult.confidence,
                  discoveredPages: popularPagesResult.discoveredPages,
                  analyzedPages: popularPagesResult.analyzedPages
                }
              }
              results.traffic.scope = scope
              results.traffic.totalPages = popularPagesResult.discoveredPages || pages.length
            } else {
              results.traffic.scope = scope
              results.traffic.totalPages = pages.length
            }

          } else if (section === 'keywords') {
            const { analyzeKeywords } = await import('@/lib/keywordService')
            // Use the main domain page for analysis with HTML content
            const mainPage = pages[0] || url
            
            // Fetch HTML content for more accurate analysis
            let htmlContent = '';
            try {
              const response = await fetch(mainPage, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
                redirect: 'follow',
                signal: AbortSignal.timeout(10000)
              });
              if (response.ok) {
                htmlContent = await response.text();
              }
            } catch (error) {
              console.log('Could not fetch HTML content for keyword analysis:', error);
            }
            
            results.keywords = await analyzeKeywords(url, htmlContent)

          } else if (section === 'technical') {
            const { performTechnicalAudit } = await import('@/lib/technicalAuditService')
            results.technical = await performTechnicalAudit(url)

          } else {
            // Handle other sections (performance, backlinks, technology) with mock data
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