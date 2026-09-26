"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Inbox, Upload, Users, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { UserCheck, BarChart, Settings, LogOut } from 'lucide-react'
import { logout } from '@/lib/auth/actions'
import { InstallButton } from '@/components/pwa/InstallButton'

const bottomLinks = [
  { name: 'Home', href: '/admin', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/leads', icon: Inbox },
  { name: 'Upload', href: '/admin/leads/upload', icon: Upload, isPrimary: true },
  { name: 'Team', href: '/admin/staff', icon: Users },
]

const moreLinks = [
  { name: 'Attendance', href: '/admin/attendance', icon: UserCheck },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function BottomBar() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {/* More Menu Drawer */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div 
            className="absolute bottom-[64px] left-0 right-0 bg-white rounded-t-2xl shadow-xl border-t border-slate-200 flex flex-col p-4 animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-4 gap-4 mb-4">
              {moreLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600">{link.name}</span>
                  </Link>
                )
              })}
            </div>
            <div className="mt-2 pt-4 border-t border-slate-100 space-y-3">
              <InstallButton className="w-full justify-center" />
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 pb-[env(safe-area-inset-bottom)]">
        {bottomLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          if (link.isPrimary) {
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 bg-slate-900 rounded-full shadow-lg text-white hover:scale-105 transition-transform"
              >
                <Icon className="w-6 h-6" />
              </Link>
            )
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                isActive ? "text-slate-900" : "text-slate-400"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-slate-100")} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          )
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
            showMore ? "text-slate-900" : "text-slate-400"
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  )
}
