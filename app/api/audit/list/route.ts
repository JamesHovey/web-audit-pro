import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = (session.user as any).id

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
        sections: true
      },
      take: 50 // Limit to last 50 audits
    })

    return NextResponse.json({
      audits,
      total: audits.length
    })

  } catch (error) {
    console.error("Error fetching audit list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
