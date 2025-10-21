import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAuditData() {
  const audit = await prisma.audit.findFirst({
    where: { id: 'cmh0q22vj0005218xwxojog92' }
  })

  if (!audit) {
    console.log('Audit not found')
    return
  }

  console.log('=== Audit Info ===')
  console.log('URL:', audit.url)
  console.log('Sections:', audit.sections)
  console.log('Has technical?', audit.sections.includes('technical'))
  console.log('Has performance?', audit.sections.includes('performance'))

  const results = audit.results as any
  console.log('\n=== Results Structure ===')
  console.log('Top level keys:', Object.keys(results))

  if (results.technical) {
    console.log('\n=== Technical Results ===')
    console.log('Technical keys:', Object.keys(results.technical))
    console.log('largeImages:', results.technical.largeImages)
    console.log('largeImageDetails count:', results.technical.largeImageDetails?.length || 0)

    if (results.technical.largeImageDetails && results.technical.largeImageDetails.length > 0) {
      console.log('\nFirst image:', JSON.stringify(results.technical.largeImageDetails[0], null, 2))
    }
  } else {
    console.log('\n❌ No technical results found!')
  }

  await prisma.$disconnect()
}

checkAuditData()
