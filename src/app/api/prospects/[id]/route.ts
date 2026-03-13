import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id: params.id },
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }] },
      },
    })
    if (!prospect) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(prospect)
  } catch (error) {
    console.error('Get prospect error:', error)
    return NextResponse.json({ error: 'Failed to fetch prospect' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const prospect = await prisma.prospect.update({
      where: { id: params.id },
      data: { ...body, updatedAt: new Date() },
    })
    return NextResponse.json(prospect)
  } catch (error) {
    console.error('Update prospect error:', error)
    return NextResponse.json({ error: 'Failed to update prospect' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.prospect.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete prospect error:', error)
    return NextResponse.json({ error: 'Failed to delete prospect' }, { status: 500 })
  }
}
