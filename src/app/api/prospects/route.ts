import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ProspectStatus, Priority } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const serviceType = searchParams.get('serviceType')
  const city = searchParams.get('city')
  const assignedTo = searchParams.get('assignedTo')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '25')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { serviceType: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status as ProspectStatus
  if (priority) where.priority = priority as Priority
  if (serviceType) where.serviceType = { contains: serviceType, mode: 'insensitive' }
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (assignedTo) where.assignedTo = { contains: assignedTo, mode: 'insensitive' }

  const [total, prospects] = await Promise.all([
    prisma.prospect.count({ where }),
    prisma.prospect.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { activities: true, tasks: true } },
      },
    }),
  ])

  return NextResponse.json({
    data: prospects,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const prospect = await prisma.prospect.create({ data: body })
  return NextResponse.json({ data: prospect }, { status: 201 })
}
