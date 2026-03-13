"use client"
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, Circle, Plus, Calendar, Building2 } from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', notes: '', dueDate: '', priority: 'medium', prospectId: '' })
  const [prospects, setProspects] = useState<Record<string, unknown>[]>([])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ completed: String(showCompleted), limit: '100' })
      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [showCompleted])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  useEffect(() => {
    fetch('/api/prospects?limit=200').then(r => r.json()).then(d => setProspects(d.prospects || []))
  }, [])

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) })
      fetchTasks()
    } catch (e) { console.error(e) }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body: Record<string, unknown> = { ...newTask }
      if (!body.prospectId) delete body.prospectId
      if (!body.dueDate) delete body.dueDate
      else body.dueDate = new Date(body.dueDate as string).toISOString()
      await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setShowAddModal(false)
      setNewTask({ title: '', notes: '', dueDate: '', priority: 'medium', prospectId: '' })
      fetchTasks()
    } catch (e) { console.error(e) }
  }

  const PRIORITY_COLORS: Record<string, string> = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-green-600 bg-green-50',
  }

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate as string) < new Date() && !t.completed)
  const today = tasks.filter(t => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate as string)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const upcoming = tasks.filter(t => !t.dueDate || new Date(t.dueDate as string) > new Date())

  const renderTask = (t: Record<string, unknown>) => (
    <div key={t.id as string} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <button onClick={() => toggleTask(t.id as string, t.completed as boolean)} className="mt-0.5 flex-shrink-0">
        {t.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-400" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${t.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title as string}</p>
        {t.notes && <p className="text-sm text-gray-500 mt-0.5">{t.notes as string}</p>}
        <div className="flex items-center gap-3 mt-1">
          {t.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(t.dueDate as string).toLocaleDateString()}
            </span>
          )}
          {(t.prospect as Record<string, unknown>)?.companyName && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Building2 className="w-3 h-3" />
              {(t.prospect as Record<string, unknown>).companyName as string}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[t.priority as string] || ''}`}>
            {t.priority as string}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} className="rounded" />
            Show completed
          </label>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">Overdue ({overdue.length})</h2>
              <div className="space-y-2">{overdue.map(renderTask)}</div>
            </div>
          )}
          {today.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Today ({today.length})</h2>
              <div className="space-y-2">{today.map(renderTask)}</div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
              <div className="space-y-2">{upcoming.map(renderTask)}</div>
            </div>
          )}
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">No tasks yet. Add a task to get started.</div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" required value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={newTask.notes} onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Prospect</label>
                <select value={newTask.prospectId} onChange={e => setNewTask(p => ({ ...p, prospectId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">None</option>
                  {prospects.map((p: Record<string, unknown>) => <option key={p.id as string} value={p.id as string}>{p.companyName as string}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Add Task</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
