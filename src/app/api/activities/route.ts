import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const prospectId = searchParams.get('prospectId')
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where: Record<string, unknown> = {}
  if (prospectId) where.prospectId = prospectId
  if (type) where.type = type

  const [total, activities] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { prospect: { select: { businessName: true } } },
    }),
  ])

  return NextResponse.json({ data: activities, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const activity = await prisma.activity.create({
    data: body,
    include: { prospect: { select: { businessName: true } } },
  })
  return NextResponse.json({ data: activity }, { status: 201 })
}
