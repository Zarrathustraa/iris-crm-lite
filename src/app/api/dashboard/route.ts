import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [totalProspects, totalActivities, pendingTasks, byStatus, byType, recentActivity] = await Promise.all([
      prisma.prospect.count(),
      prisma.activity.count(),
      prisma.task.count({ where: { completed: false } }),
      prisma.prospect.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.prospect.groupBy({ by: ['type'], _count: { id: true } }),
      prisma.prospect.count({ where: { lastContactedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ])

    const statusCounts: Record<string, number> = {}
    byStatus.forEach((s) => { statusCounts[s.status] = s._count.id })

    const typeCounts: Record<string, number> = {}
    byType.forEach((t) => { typeCounts[t.type || 'Unknown'] = t._count.id })

    return NextResponse.json({
      totalProspects,
      totalActivities,
      pendingTasks,
      recentActivity,
      statusCounts,
      typeCounts,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({
      totalProspects: 0,
      totalActivities: 0,
      pendingTasks: 0,
      recentActivity: 0,
      statusCounts: {},
      typeCounts: {},
      error: 'Database not initialized yet. Please run: prisma db push',
    })
  }
}
