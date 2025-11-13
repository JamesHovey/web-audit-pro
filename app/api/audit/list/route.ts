import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id

    // Get all audits for the user, sorted by creation date (newest first)
    const audits = await prisma.audit.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        url: true,
        status: true,
        createdAt: true,
        completedAt: true,
        sections: true,
        results: true // Include results to get scope and totalPages
      },
      take: 50 // Limit to last 50 audits
    })

    // Extract scope and totalPages from results for each audit
    const auditsWithScope = audits.map(audit => {
      const results = audit.results as any
      return {
        ...audit,
        scope: results?.scope || 'single',
        totalPages: results?.totalPages || 1
      }
    })

    return NextResponse.json({
      audits: auditsWithScope,
      total: auditsWithScope.length
    })

  } catch (error) {
    console.error("Error fetching audit list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
