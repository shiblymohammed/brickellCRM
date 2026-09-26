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
    <aside className="hidden md:flex w-[260px] bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full flex-col flex-shrink-0 relative z-20">
      
      <div className="h-20 flex items-center px-6 border-b border-slate-200/50 flex-shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-slate-900 shadow-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">F</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900">Fellow AI</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Workspace</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-6 relative z-10 no-scrollbar">
        <nav className="space-y-1 px-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Main Menu</p>
          {adminLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-500 ease-out group",
                  isActive
                    ? "bg-slate-900 text-white shadow-[0_8px_30px_rgba(15,23,42,0.25)] scale-[1.03]"
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-[18px] w-[18px] flex-shrink-0 transition-transform duration-500",
                  isActive ? "text-white scale-110" : "text-slate-400 group-hover:text-slate-700"
                )} />
                <span className="tracking-tight">{link.name}</span>
              </Link>
            )
          })}
          
          <div className="pt-6 mt-6 border-t border-slate-200/50">
            <InstallButton className="w-full bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm" />
          </div>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200/50 flex-shrink-0 relative z-10 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white shadow-sm border border-slate-200/60 mb-2">
          <div className="h-9 w-9 rounded-[10px] bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700 flex-shrink-0 border border-slate-200/50">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">{userName}</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate uppercase">{userRole}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
