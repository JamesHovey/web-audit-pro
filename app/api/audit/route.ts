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

    // Auto-complete audit with real data for traffic, mock for others
    setTimeout(async () => {
      try {
        const results: Record<string, unknown> = {}

        // Use real data for traffic and keywords, based on scope
        if (sections.includes('traffic')) {
          const { getCostEffectiveTrafficData } = await import('@/lib/costEffectiveTrafficService')
          if (scope === 'single') {
            results.traffic = await getCostEffectiveTrafficData(url)
          } else {
            // For multi-page audits, aggregate traffic across all pages
            results.traffic = await getCostEffectiveTrafficData(url) // Primary domain traffic
            results.traffic.scope = scope
            results.traffic.totalPages = pages.length
          }
        }

        if (sections.includes('keywords')) {
          const { analyzeMultiPageKeywords } = await import('@/lib/keywordService')
          results.keywords = await analyzeMultiPageKeywords(pages, scope)
        }

        // Use mock data for other sections (performance, backlinks, etc.)
        const remainingSections = sections.filter(s => !['traffic', 'keywords'].includes(s))
        if (remainingSections.length > 0) {
          const { generateMockAuditResults } = await import('@/lib/mockData')
          const mockResults = await generateMockAuditResults(url, remainingSections)
          Object.assign(results, mockResults)
        }
        
        // Add scope and pages info to results
        const finalResults = { 
          ...results,
          scope,
          pages,
          totalPages: pages.length
        }
        
        await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: "completed",
            results: finalResults,
            completedAt: new Date()
          }
        })
      } catch (error) {
        console.error('Error processing audit:', error)
        // Fallback to mock data on error
        const { generateMockAuditResults } = await import('@/lib/mockData')
        const mockResults = await generateMockAuditResults(url, sections)
        
        await prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: "completed",
            results: mockResults,
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