export type { Prospect, Activity, Task, SyncLog } from '@prisma/client'
export { ProspectStatus, Priority, ActivityType, TaskStatus } from '@prisma/client'

export interface ProspectFilters {
  search?: string
  status?: string
  priority?: string
  serviceType?: string
  city?: string
  assignedTo?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiResponse<T> {
  data: T
  total?: number
  page?: number
  pageSize?: number
  totalPages?: number
}

export interface DashboardStats {
  totalProspects: number
  newThisWeek: number
  contactedCount: number
  qualifiedCount: number
  closedWonCount: number
  closedLostCount: number
  pendingTasksCount: number
  overdueTasksCount: number
  activitiesThisWeek: number
  byStatus: Record<string, number>
  byServiceType: Record<string, number>
  byPriority: Record<string, number>
}
