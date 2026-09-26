"use client"

import { Bell, Search } from 'lucide-react'

interface TopbarProps {
  userName?: string
  userRole?: string
}

export default function Topbar({ userName = 'Admin' }: TopbarProps) {
  return (
    <>
      {/* Desktop Topbar */}
      <header className="hidden md:flex h-16 items-center justify-between px-6 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex-1 flex items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search leads..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            <Bell className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Top Header (Minimal) */}
      <header className="md:hidden h-11 flex items-center justify-between px-3 bg-white flex-shrink-0 pt-[env(safe-area-inset-top)] z-30 relative">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-[4px] bg-slate-900 flex items-center justify-center">
            <span className="text-white font-bold text-[9px]">F</span>
          </div>
          <h1 className="text-[13px] font-bold tracking-tight text-slate-900">FELLOW AI</h1>
        </div>
        <button className="relative p-1.5 text-slate-500">
          <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="h-4 w-4" />
        </button>
      </header>
    </>
  )
}
