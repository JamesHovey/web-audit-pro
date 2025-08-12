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
    const { url, sections } = body

    if (!url || !sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Create audit record
    const audit = await prisma.audit.create({
      data: {
        userId: session.user.id,
        url,
        sections: sections,
        status: "pending"
      }
    })

    // Auto-complete audit with real data for traffic, mock for others
    setTimeout(async () => {
      try {
        const results: any = {}

        // Use cost-effective traffic data if requested
        if (sections.includes('traffic')) {
          const { getCostEffectiveTrafficData } = await import('@/lib/costEffectiveTrafficService')
          results.traffic = await getCostEffectiveTrafficData(url)
        }

        // Use mock data for other sections
        const { generateMockAuditResults } = await import('@/lib/mockData')
        const mockResults = generateMockAuditResults(url, sections)
        
        // Merge real and mock data
        const finalResults = { ...mockResults, ...results }
        
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
        const mockResults = generateMockAuditResults(url, sections)
        
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