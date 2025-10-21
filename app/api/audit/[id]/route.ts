import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const audit = await prisma.audit.findFirst({
      where: {
        id
      }
    })

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    // Ensure the audit data is properly serializable
    let safeResults = null;
    try {
      // If results is a string, try to parse it; if it's already an object, use it directly
      if (audit.results) {
        if (typeof audit.results === 'string') {
          safeResults = JSON.parse(audit.results);
        } else {
          safeResults = audit.results;
        }
      }
    } catch (parseError) {
      console.error("Error parsing audit results JSON:", parseError);
      // If parsing fails, set results to null and continue
      safeResults = null;
    }

    const safeAudit = {
      ...audit,
      results: safeResults,
      createdAt: audit.createdAt.toISOString(),
      updatedAt: audit.updatedAt.toISOString(),
      completedAt: audit.completedAt?.toISOString() || null
    }

    return NextResponse.json(safeAudit)

  } catch (error) {
    console.error("Error fetching audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id } = await params

    // Find the audit and verify ownership
    const audit = await prisma.audit.findFirst({
      where: {
        id,
        userId // Ensure the user owns this audit
      }
    })

    if (!audit) {
      return NextResponse.json({ error: "Audit not found or access denied" }, { status: 404 })
    }

    // Delete the audit
    await prisma.audit.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ success: true, message: "Audit deleted successfully" })

  } catch (error) {
    console.error("Error deleting audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}