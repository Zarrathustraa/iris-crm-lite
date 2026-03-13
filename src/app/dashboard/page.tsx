'use client'
import { useEffect, useState } from 'react'
import { DashboardStats } from '@/types'

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(j => setStats(j.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>
  if (!stats) return <div className="text-center py-20 text-red-500">Failed to load stats</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">NJ Home-Service Contractor Outreach</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Prospects" value={stats.totalProspects} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="Qualified" value={stats.qualifiedCount} />
        <StatCard label="Closed Won" value={stats.closedWonCount} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Contacted" value={stats.contactedCount} />
        <StatCard label="Closed Lost" value={stats.closedLostCount} />
        <StatCard label="Pending Tasks" value={stats.pendingTasksCount} />
        <StatCard label="Overdue Tasks" value={stats.overdueTasksCount} sub={stats.overdueTasksCount > 0 ? 'Needs attention' : 'All clear'} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Prospects by Status</h2>
          <div className="space-y-2">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (count / Math.max(1, stats.totalProspects)) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-4">By Service Type</h2>
          <div className="space-y-2">
            {Object.entries(stats.byServiceType).slice(0, 8).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, (count / Math.max(1, stats.totalProspects)) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card p-4">
        <p className="text-sm text-gray-500">Activities this week: <span className="font-semibold text-gray-800">{stats.activitiesThisWeek}</span></p>
      </div>
    </div>
  )
}
