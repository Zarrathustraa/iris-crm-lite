import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        include: {
          _count: { select: { activities: true, tasks: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.prospect.count({ where }),
    ])

    return NextResponse.json({ prospects, total, page, limit })
  } catch (error) {
    console.error('Prospects API error:', error)
    return NextResponse.json({ prospects: [], total: 0, page: 1, limit: 50 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prospect = await prisma.prospect.create({ data: body })
    return NextResponse.json(prospect, { status: 201 })
  } catch (error) {
    console.error('Create prospect error:', error)
    return NextResponse.json({ error: 'Failed to create prospect' }, { status: 500 })
  }
}
