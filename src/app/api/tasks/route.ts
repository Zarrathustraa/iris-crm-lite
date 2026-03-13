import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prospectId = searchParams.get('prospectId')
    const completed = searchParams.get('completed')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (prospectId) where.prospectId = prospectId
    if (completed !== null) where.completed = completed === 'true'

    const tasks = await prisma.task.findMany({
      where,
      include: { prospect: { select: { companyName: true, contactName: true } } },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Tasks API error:', error)
    return NextResponse.json({ tasks: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const task = await prisma.task.create({ data: body })
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
