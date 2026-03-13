import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const prospect = await prisma.prospect.findUnique({
    where: { id: params.id },
    include: {
      activities: { orderBy: { occurredAt: 'desc' } },
      tasks: { orderBy: { dueDate: 'asc' } },
    },
  })
  if (!prospect) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: prospect })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const prospect = await prisma.prospect.update({ where: { id: params.id }, data: body })
  return NextResponse.json({ data: prospect })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.prospect.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
