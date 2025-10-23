const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAudit() {
  try {
    const audits = await prisma.audit.findMany({
      where: {
        url: {
          contains: 'livingspacearchitects'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1,
      select: {
        id: true,
        url: true,
        createdAt: true,
        results: true
      }
    });

    if (audits.length > 0) {
      const audit = audits[0];
      const results = typeof audit.results === 'string' ? JSON.parse(audit.results) : audit.results;
      console.log('Audit ID:', audit.id);
      console.log('Website:', audit.url);
      console.log('Has aboveFoldCompetitors:', results.aboveFoldCompetitors ? 'YES' : 'NO');
      console.log('Has aboveFoldKeywordsList:', results.aboveFoldKeywordsList ? 'YES' : 'NO');
      console.log('AboveFoldKeywordsList length:', results.aboveFoldKeywordsList?.length || 0);
      if (results.aboveFoldCompetitors) {
        console.log('Competitors count:', results.aboveFoldCompetitors.competitors?.length || 0);
        console.log('Total competitors:', results.aboveFoldCompetitors.totalCompetitors || 0);
      } else {
        console.log('\nNo competitor data found. This could mean:');
        console.log('1. No above-fold keywords were detected');
        console.log('2. Competition analysis failed');
        console.log('3. No competitors were found');
      }
    } else {
      console.log('No audits found for livingspacearchitects.com');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAudit();
