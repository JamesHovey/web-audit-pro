import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClaudeService } from "@/lib/claudeService"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const audit = await prisma.audit.findFirst({
      where: { id }
    })

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    if (audit.status !== "completed") {
      return NextResponse.json({ error: "Audit not yet completed" }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: "Claude API not configured. Please set ANTHROPIC_API_KEY in your environment variables." 
      }, { status: 500 })
    }

    try {
      const claudeService = new ClaudeService()
      const summary = await claudeService.generateAuditSummary({
        url: audit.url,
        sections: audit.sections as string[],
        results: audit.results as Record<string, unknown>,
        completedAt: audit.completedAt?.toISOString()
      })

      return NextResponse.json({ summary })
    } catch (error) {
      console.error("Error generating summary:", error)
      return NextResponse.json({ 
        error: "Failed to generate summary. Please check your API key and try again." 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in summary route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}