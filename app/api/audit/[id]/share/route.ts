import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const { id: auditId } = params
    const { userIds } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No users specified' }, { status: 400 })
    }

    // Verify audit exists and belongs to current user
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        shares: {
          select: { sharedWithUserId: true }
        }
      }
    })

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    if (audit.userId !== currentUserId) {
      return NextResponse.json({ error: 'Not authorized to share this audit' }, { status: 403 })
    }

    // Get existing shares to avoid duplicates
    const existingShareUserIds = audit.shares.map(share => share.sharedWithUserId)
    const newUserIds = userIds.filter(userId => !existingShareUserIds.includes(userId))

    if (newUserIds.length === 0) {
      return NextResponse.json({
        message: 'All selected users already have access to this audit',
        alreadyShared: userIds.length
      })
    }

    // Create shares for new users
    const shares = await prisma.auditShare.createMany({
      data: newUserIds.map(userId => ({
        auditId,
        sharedWithUserId: userId,
        sharedByUserId: currentUserId
      })),
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      sharesCreated: shares.count,
      alreadyShared: userIds.length - shares.count
    })
  } catch (error) {
    console.error('Share audit error:', error)
    return NextResponse.json(
      { error: 'Failed to share audit' },
      { status: 500 }
    )
  }
}

// Get list of users an audit is shared with
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const { id: auditId } = params

    // Verify audit exists and belongs to current user
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      select: { userId: true }
    })

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    if (audit.userId !== currentUserId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Get list of shared users
    const shares = await prisma.auditShare.findMany({
      where: { auditId },
      include: {
        sharedWith: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      shares: shares.map(share => ({
        id: share.id,
        createdAt: share.createdAt,
        user: share.sharedWith
      }))
    })
  } catch (error) {
    console.error('Get shares error:', error)
    return NextResponse.json(
      { error: 'Failed to get shares' },
      { status: 500 }
    )
  }
}

// Remove share (unshare)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const { id: auditId } = params
    const { shareId } = await request.json()

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 })
    }

    // Verify share exists and audit belongs to current user
    const share = await prisma.auditShare.findUnique({
      where: { id: shareId },
      include: {
        audit: {
          select: { userId: true }
        }
      }
    })

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    if (share.audit.userId !== currentUserId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Delete the share
    await prisma.auditShare.delete({
      where: { id: shareId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete share error:', error)
    return NextResponse.json(
      { error: 'Failed to remove share' },
      { status: 500 }
    )
  }
}
