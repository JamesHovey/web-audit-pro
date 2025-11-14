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

    // Get audits owned by the user
    const myAudits = await prisma.audit.findMany({
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
        results: true,
        shares: {
          select: {
            id: true,
            sharedWith: {
              select: {
                username: true
              }
            }
          }
        }
      },
      take: 50 // Limit to last 50 audits
    })

    // Get audits shared with the user
    const sharedAudits = await prisma.audit.findMany({
      where: {
        shares: {
          some: {
            sharedWithUserId: userId
          }
        }
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
        results: true,
        user: {
          select: {
            username: true,
            name: true
          }
        },
        shares: {
          where: {
            sharedWithUserId: userId
          },
          select: {
            id: true,
            createdAt: true,
            sharedBy: {
              select: {
                username: true,
                name: true
              }
            }
          }
        }
      },
      take: 50
    })

    // Extract scope and totalPages from results for each audit
    const myAuditsWithScope = myAudits.map(audit => {
      const results = audit.results as any
      return {
        ...audit,
        scope: results?.scope || 'single',
        totalPages: results?.totalPages || 1,
        shareCount: audit.shares.length,
        isOwner: true
      }
    })

    const sharedAuditsWithScope = sharedAudits.map(audit => {
      const results = audit.results as any
      const share = audit.shares[0] // Current user's share
      return {
        ...audit,
        scope: results?.scope || 'single',
        totalPages: results?.totalPages || 1,
        sharedBy: share.sharedBy,
        sharedAt: share.createdAt,
        isOwner: false
      }
    })

    return NextResponse.json({
      myAudits: myAuditsWithScope,
      sharedAudits: sharedAuditsWithScope,
      total: myAuditsWithScope.length + sharedAuditsWithScope.length
    })

  } catch (error) {
    console.error("Error fetching audit list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
