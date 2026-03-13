import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const prospectId = searchParams.get('prospectId')
  const status = searchParams.get('status')
  const overdue = searchParams.get('overdue') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where: Record<string, unknown> = {}
  if (prospectId) where.prospectId = prospectId
  if (status) where.status = status
  if (overdue) where.dueDate = { lt: new Date() }

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { prospect: { select: { businessName: true, id: true } } },
    }),
  ])

  return NextResponse.json({ data: tasks, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const task = await prisma.task.create({
    data: body,
    include: { prospect: { select: { businessName: true, id: true } } },
  })
  return NextResponse.json({ data: task }, { status: 201 })
}
