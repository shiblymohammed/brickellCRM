import React from 'react'
import Link from 'next/link'
import { Inbox, Calendar, UserCheck, LayoutDashboard, Search, Bell, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { logout } from '@/lib/auth/actions'

const salesLinks = [
  { name: 'Dashboard', href: '/sales', icon: LayoutDashboard },
  { name: 'My Leads', href: '/sales/leads', icon: Inbox },
  { name: 'Follow-ups', href: '/sales/followups', icon: Calendar },
  { name: 'Attendance', href: '/sales/attendance', icon: UserCheck },
]

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden flex-col md:flex-row">
      {/* Mobile-first bottom nav & desktop sidebar */}
      <aside className="w-full md:w-20 lg:w-64 border-r border-slate-200 bg-white h-auto md:h-full flex flex-row md:flex-col flex-shrink-0 order-last md:order-first border-t md:border-t-0 fixed bottom-0 md:static z-10">
        <div className="h-16 hidden md:flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-200">
          <h1 className="text-lg font-bold tracking-tight hidden lg:block">FELLOW AI</h1>
          <h1 className="text-lg font-bold tracking-tight lg:hidden">FA</h1>
        </div>
        <div className="flex-1 overflow-visible md:overflow-auto md:py-4 flex flex-row md:flex-col justify-around md:justify-start">
          <nav className="flex flex-row md:flex-col space-y-0 md:space-y-1 lg:px-3 w-full justify-around md:justify-start">
            {salesLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex flex-col md:flex-row items-center justify-center md:justify-start p-3 md:px-3 md:py-2 text-xs md:text-sm font-medium rounded-md transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon className="md:mr-3 h-6 w-6 md:h-5 md:w-5 flex-shrink-0 mb-1 md:mb-0" />
                  <span className="hidden lg:inline">{link.name}</span>
                  <span className="md:hidden">{link.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
        <header className="h-12 md:h-16 flex items-center justify-between px-3 md:px-6 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex-1 flex items-center">
             <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1.5 md:top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="search" 
                placeholder="Search my leads..." 
                className="w-full pl-9 h-8 md:h-10 text-xs md:text-sm bg-slate-50 border-transparent focus-visible:bg-white rounded-lg md:rounded-md" 
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="relative p-1.5 md:p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="relative p-1.5 md:p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </form>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs md:text-sm font-semibold shadow-sm">
              S
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto pb-6 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
