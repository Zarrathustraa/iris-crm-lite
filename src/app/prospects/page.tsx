"use client"
import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Phone, Mail, MapPin, Filter } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  interested: 'bg-green-100 text-green-800',
  not_interested: 'bg-red-100 text-red-800',
  callback: 'bg-purple-100 text-purple-800',
  converted: 'bg-emerald-100 text-emerald-800',
  do_not_call: 'bg-gray-100 text-gray-800',
}

const STATUSES = ['all', 'new', 'contacted', 'interested', 'not_interested', 'callback', 'converted', 'do_not_call']

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProspect, setNewProspect] = useState({ companyName: '', contactName: '', phone: '', email: '', type: '', status: 'new', city: '', state: 'NJ' })

  const fetchProspects = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' })
      if (search) params.set('search', search)
      if (status !== 'all') params.set('status', status)
      const res = await fetch(`/api/prospects?${params}`)
      const data = await res.json()
      setProspects(data.prospects || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => { fetchProspects() }, [fetchProspects])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/prospects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProspect) })
      setShowAddModal(false)
      setNewProspect({ companyName: '', contactName: '', phone: '', email: '', type: '', status: 'new', city: '', state: 'NJ' })
      fetchProspects()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Prospect
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search prospects..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500 mb-4">{total} prospects found</div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Company', 'Contact', 'Phone', 'Status', 'Type', 'Location', 'Activities', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prospects.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No prospects found. Add your first prospect or import from Google Sheets.</td></tr>
                ) : (
                  prospects.map((p: Record<string, unknown>) => (
                    <tr key={p.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <a href={`/prospects/${p.id}`} className="font-medium text-blue-600 hover:underline">{p.companyName as string}</a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.contactName as string || '—'}</td>
                      <td className="px-4 py-3">
                        {p.phone ? <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><Phone className="w-3 h-3" />{p.phone as string}</a> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[(p.status as string)] || 'bg-gray-100 text-gray-800'}`}>
                          {(p.status as string).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.type as string || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {p.city ? `${p.city}, ${p.state}` : (p.state as string || '—')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {((p._count as Record<string, number>)?.activities || 0)} calls
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/prospects/${p.id}`} className="text-sm text-blue-600 hover:underline">View</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {total > 50 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 50)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 50)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Add New Prospect</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              {[['companyName', 'Company Name', true], ['contactName', 'Contact Name', false], ['phone', 'Phone', false], ['email', 'Email', false], ['type', 'Business Type', false], ['city', 'City', false]].map(([field, label, required]) => (
                <div key={field as string}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                  <input type="text" required={required as boolean} value={(newProspect as Record<string, string>)[field as string]}
                    onChange={(e) => setNewProspect(prev => ({ ...prev, [field as string]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={newProspect.status} onChange={(e) => setNewProspect(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {['new', 'contacted', 'interested', 'callback', 'converted'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Add Prospect</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
