import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const audit = await prisma.audit.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    return NextResponse.json(audit)

  } catch (error) {
    console.error("Error fetching audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}