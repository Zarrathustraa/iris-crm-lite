import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prospectId = searchParams.get('prospectId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (prospectId) where.prospectId = prospectId

    const activities = await prisma.activity.findMany({
      where,
      include: { prospect: { select: { companyName: true, contactName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Activities API error:', error)
    return NextResponse.json({ activities: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prospectId, type, notes, outcome, duration } = body

    const activity = await prisma.activity.create({
      data: { prospectId, type, notes, outcome, duration: duration ? parseInt(duration) : null },
    })

    // Update prospect lastContactedAt
    await prisma.prospect.update({
      where: { id: prospectId },
      data: { lastContactedAt: new Date() },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
