import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllAudits() {
  console.log('🗑️  Deleting all audits...')

  const result = await prisma.audit.deleteMany({})

  console.log(`✅ Deleted ${result.count} audits`)

  await prisma.$disconnect()
}

deleteAllAudits()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
