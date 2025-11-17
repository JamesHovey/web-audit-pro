import { NextRequest, NextResponse } from 'next/server'
import { discoverPages } from '@/lib/pageDiscovery'
import type { DiscoverPagesRequestBody } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const { url, quick } = await request.json() as DiscoverPagesRequestBody

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Create a text encoder for SSE
    const encoder = new TextEncoder()

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Helper to send SSE formatted message
          const sendEvent = (data: { progress: number; message: string; pages?: number; warnings?: string[] }) => {
            const eventData = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(eventData))
          }

          // Discover pages with progress callback
          const result = await discoverPages(
            url,
            500,
            quick || false,
            (progress: number, message: string) => {
              // Send progress update as SSE event
              sendEvent({ progress, message })
            }
          )

          // Send final result with complete data
          sendEvent({
            progress: 100,
            message: 'Discovery complete',
            pages: result.totalFound,
            warnings: result.warnings
          })

          // Send the full result as a separate event
          const resultData = `data: ${JSON.stringify({ type: 'complete', result })}\n\n`
          controller.enqueue(encoder.encode(resultData))

          // Close the stream
          controller.close()
        } catch (error) {
          console.error('Page discovery error:', error)

          // Send error event
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to discover pages'
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Page discovery error:', error)
    return NextResponse.json(
      {
        error: 'Failed to discover pages',
        pages: [],
        totalFound: 0,
        sources: { sitemap: 0, internalLinks: 0, homepage: 0 }
      },
      { status: 500 }
    )
  }
}
