'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/prospects', label: 'Prospects' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/import', label: 'Import / Sync' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 bg-indigo-900 text-white flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-indigo-800">
        <span className="text-xl font-bold tracking-tight">Iris CRM</span>
        <p className="text-indigo-300 text-xs mt-0.5">NJ Outreach Tracker</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-indigo-700 text-white'
                : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-indigo-800 text-xs text-indigo-400">
        Iris CRM Lite v0.1
      </div>
    </aside>
  )
}
