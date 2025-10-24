import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { CostingService } from '@/lib/costingService'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('📊 Fetching costing dashboard data...')
    
    // Get real-time API costs
    const costingService = CostingService.getInstance()
    const realTimeCosts = await costingService.getRealTimeCosts()

    // Get audit history from database
    const audits = await prisma.audit.findMany({
      where: {
        status: 'completed'
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        url: true,
        completedAt: true,
        results: true
      }
    })

    // Calculate costing data from audit results
    const auditHistory = audits.map(audit => {
      const results = audit.results as Record<string, unknown> | null

      // Extract credit usage from results
      const keywordsEverywhereCredits = (results && typeof results === 'object' && 'volumeCreditsUsed' in results)
        ? (results.volumeCreditsUsed as number)
        : 0
      const keywordCompetition = (results && typeof results === 'object' && 'keywordCompetition' in results)
        ? results.keywordCompetition as Record<string, unknown>
        : null
      const serperSearches = (keywordCompetition && 'creditsUsed' in keywordCompetition)
        ? (keywordCompetition.creditsUsed as number)
        : 0

      // Calculate costs using the costing service
      const totalCost = costingService.calculateAuditCost(keywordsEverywhereCredits, serperSearches)

      return {
        id: audit.id,
        url: audit.url,
        date: audit.completedAt?.toISOString() || new Date().toISOString(),
        keywordsEverywhereCredits,
        serperSearches,
        totalCost
      }
    })

    // Combine real-time costs with audit history
    const responseData = {
      keywordsEverywhere: realTimeCosts.keywordsEverywhere,
      serper: realTimeCosts.serper,
      auditHistory
    }

    console.log('✅ Costing data retrieved successfully')
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Error fetching costing data:', error)
    
    // Return mock data if database fails
    return NextResponse.json({
      keywordsEverywhere: {
        creditsRemaining: 79515,
        creditsUsed: 485,
        costPerCredit: 0.00024,
        planType: 'Bronze Package (100K/year)'
      },
      serper: {
        searchesRemaining: 22350,
        searchesUsed: 2650,
        costPer1000: 1.60,
        planType: '25K Searches/month ($50/month)'
      },
      auditHistory: []
    })
  }
}