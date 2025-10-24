import { NextRequest, NextResponse } from 'next/server';
import { openPageRankService } from '@/lib/openPageRankService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (_error) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch domain authority using OpenPageRank service
    const result = await openPageRankService.getDomainAuthority(url);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch domain authority',
          domainAuthority: null
        },
        { status: 200 } // Return 200 even on failure to avoid breaking the UI
      );
    }

    // Convert from 0-10 PageRank scale to 0-100 scale
    const domainAuthority = Math.round(result.authority * 10);

    return NextResponse.json({
      success: true,
      domainAuthority: domainAuthority,
      source: result.dataSource || 'OpenPageRank'
    });

  } catch (error) {
    console.error('Error in domain-authority API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        domainAuthority: null
      },
      { status: 500 }
    );
  }
}
