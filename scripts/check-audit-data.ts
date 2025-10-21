import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAuditData() {
  const audit = await prisma.audit.findFirst({
    where: { url: { contains: 'livingspace' } },
    orderBy: { createdAt: 'desc' }
  })

  if (!audit) {
    console.log('Audit not found')
    return
  }

  console.log('=== Latest Audit Info ===')
  console.log('ID:', audit.id)
  console.log('URL:', audit.url)
  console.log('Created:', audit.createdAt)
  console.log('Status:', audit.status)
  console.log('Sections:', audit.sections)

  const results = audit.results as any
  console.log('\n=== Results Structure ===')
  console.log('Top level keys:', Object.keys(results))
  console.log('largeImages at root:', results.largeImages)
  console.log('issues at root:', results.issues)

  if (results.technical) {
    console.log('\n=== Technical Results ===')
    console.log('Technical keys:', Object.keys(results.technical))
    console.log('technical.largeImages:', results.technical.largeImages)
    console.log('technical.largeImageDetails count:', results.technical.largeImageDetails?.length || 0)
  } else {
    console.log('\n❌ No technical results found!')
  }

  if (results.performance) {
    console.log('\n=== Performance Results ===')
    console.log('Performance keys:', Object.keys(results.performance))
    console.log('performance.largeImages:', results.performance.largeImages)
    console.log('performance.largeImageDetails count:', results.performance.largeImageDetails?.length || 0)
    console.log('performance.largeImagesList count:', results.performance.largeImagesList?.length || 0)

    if (results.performance.largeImageDetails && results.performance.largeImageDetails.length > 0) {
      console.log('\n📸 First large image:')
      console.log(JSON.stringify(results.performance.largeImageDetails[0], null, 2))
    }
  }

  await prisma.$disconnect()
}

checkAuditData()
