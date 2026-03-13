import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfWeek } from 'date-fns'

export async function GET() {
  const weekStart = startOfWeek(new Date())

  const [total, byStatusRaw, byServiceRaw, byPriorityRaw,
         newThisWeek, pendingTasks, overdueTasks, activitiesThisWeek] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.prospect.groupBy({ by: ['serviceType'], _count: { id: true }, where: { serviceType: { not: null } } }),
    prisma.prospect.groupBy({ by: ['priority'], _count: { id: true } }),
    prisma.prospect.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.task.count({ where: { status: 'PENDING' } }),
    prisma.task.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] }, dueDate: { lt: new Date() } } }),
    prisma.activity.count({ where: { occurredAt: { gte: weekStart } } }),
  ])

  const byStatus = Object.fromEntries(byStatusRaw.map(r => [r.status, r._count.id]))
  const byServiceType = Object.fromEntries(byServiceRaw.map(r => [r.serviceType || 'Unknown', r._count.id]))
  const byPriority = Object.fromEntries(byPriorityRaw.map(r => [r.priority, r._count.id]))

  return NextResponse.json({
    data: {
      totalProspects: total,
      newThisWeek,
      contactedCount: byStatus.CONTACTED || 0,
      qualifiedCount: byStatus.QUALIFIED || 0,
      closedWonCount: byStatus.CLOSED_WON || 0,
      closedLostCount: byStatus.CLOSED_LOST || 0,
      pendingTasksCount: pendingTasks,
      overdueTasksCount: overdueTasks,
      activitiesThisWeek,
      byStatus,
      byServiceType,
      byPriority,
    },
  })
}
