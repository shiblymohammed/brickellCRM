"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, UserCheck, Inbox, Upload, Settings, BarChart, LogOut, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth/actions'

import { InstallButton } from '@/components/pwa/InstallButton'

const adminLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'All Leads', href: '/admin/leads', icon: Inbox },
  { name: 'Upload', href: '/admin/leads/upload', icon: Upload },
  { name: 'Sales Team', href: '/admin/staff', icon: Users },
  { name: 'Attendance', href: '/admin/attendance', icon: UserCheck },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
  userName?: string
  userRole?: string
}

export default function Sidebar({ userName = 'Admin', userRole = 'Admin' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white h-full flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">F</span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">FELLOW AI</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-0.5 px-3">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-4 w-4 flex-shrink-0",
                  isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-500"
                )} />
                {link.name}
              </Link>
            )
          })}
          
          <div className="pt-4 mt-4 border-t border-slate-100">
            <InstallButton className="w-full" />
          </div>
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors mb-1">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userRole}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
