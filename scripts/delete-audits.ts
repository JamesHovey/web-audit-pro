import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAuditsForDomain(domain: string) {
  try {
    console.log(`🔍 Looking for audits matching domain: "${domain}"`)

    // Find all audits for this domain
    const audits = await prisma.audit.findMany({
      where: {
        url: {
          contains: domain
        }
      },
      select: {
        id: true,
        url: true,
        createdAt: true
      }
    })

    console.log(`📋 Found ${audits.length} audit(s) to delete:`)
    audits.forEach(audit => {
      console.log(`  - ${audit.url} (ID: ${audit.id}, Created: ${audit.createdAt})`)
    })

    if (audits.length === 0) {
      console.log('✅ No audits found to delete')
      return
    }

    // Delete all matching audits
    const result = await prisma.audit.deleteMany({
      where: {
        url: {
          contains: domain
        }
      }
    })

    console.log(`✅ Successfully deleted ${result.count} audit(s)`)

  } catch (error) {
    console.error('❌ Error deleting audits:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get domain from command line argument
const domain = process.argv[2] || 'livingspacearchitects'

deleteAuditsForDomain(domain)
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Failed:', error)
    process.exit(1)
  })
