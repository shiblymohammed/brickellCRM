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
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-md transition-all duration-500 ease-out" onClick={() => setShowMore(false)}>
          <div 
            className="absolute bottom-[104px] left-6 right-6 bg-white/75 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white/60 flex flex-col p-6 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 gap-4 mb-4">
              {moreLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/50 shadow-sm border border-white/60 flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:text-slate-900 group-hover:bg-white transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-tight text-slate-500 group-hover:text-slate-900 transition-colors">{link.name}</span>
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
      <div className="md:hidden fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
        <nav className="relative h-16 w-max bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.1)] rounded-[2rem] flex items-center px-4 gap-2.5 pointer-events-auto">
          
          {/* Fluid Sliding Background Pill */}
          {(() => {
            const activeIndex = showMore 
              ? 4 
              : bottomLinks.findIndex(l => pathname === l.href);
            
            const leftPositions = [16, 74, 132, 190, 248];
            const isVisible = activeIndex >= 0;

            return (
              <div 
                className={cn(
                  "absolute top-1/2 w-[48px] h-[48px] bg-slate-900/90 shadow-md rounded-full transition-all duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 backdrop-blur-sm",
                  isVisible ? "opacity-100" : "opacity-0 scale-75"
                )}
                style={{
                  left: isVisible ? `${leftPositions[activeIndex]}px` : '16px',
                  transform: 'translateY(-50%)',
                }}
              />
            )
          })()}

          {/* Nav Buttons */}
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href && !showMore
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setShowMore(false)}
                className={cn(
                  "relative flex items-center justify-center w-[48px] h-[48px] rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10",
                  !isActive && "hover:bg-white/20 hover:scale-105"
                )}
              >
                <Icon className={cn(
                  "w-[22px] h-[22px] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]", 
                  isActive ? "text-white scale-110 drop-shadow-md" : "text-slate-700 drop-shadow-sm group-hover:text-slate-900"
                )} />
              </Link>
            )
          })}

          <div className="w-[1.5px] h-6 bg-slate-300/30 rounded-full mx-1" />

          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "relative flex items-center justify-center w-[48px] h-[48px] rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10",
              !showMore && "hover:bg-white/20 hover:scale-105"
            )}
          >
            <MoreHorizontal className={cn(
              "w-[22px] h-[22px] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              showMore ? "text-white scale-110 drop-shadow-md" : "text-slate-700 drop-shadow-sm"
            )} />
          </button>
        </nav>
      </div>
    </>
  )
}
