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

    // Discover pages - set high limit to find all pages (user can limit audit separately)
    // Use quick mode (skip deep crawling) when quick=true for faster dashboard preview
    const result = await discoverPages(url, 500, quick || false)

    return NextResponse.json(result)

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