import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Helper to create Prisma client
function createPrismaClient() {
  // In Cloudflare environment, D1 binding will be available via getRequestContext
  // For now, create standard client - will be enhanced per-request if needed
  return new PrismaClient()
}

// Helper to get Prisma client with D1 adapter (for Cloudflare)
export function getPrismaWithD1(d1Database: D1Database) {
  const adapter = new PrismaD1(d1Database)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma