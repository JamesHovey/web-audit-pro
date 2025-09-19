import { NextRequest, NextResponse } from 'next/server'
import { discoverPages } from '@/lib/pageDiscovery'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

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

    // Discover pages
    const result = await discoverPages(url, 50)

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