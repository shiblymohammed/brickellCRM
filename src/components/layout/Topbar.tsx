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
      <header className="hidden md:flex h-16 items-center justify-between px-6 border-b border-white/30 bg-white/40 backdrop-blur-[40px] backdrop-saturate-[150%] shadow-sm flex-shrink-0 z-40 relative">
        <div className="flex-1 flex items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search leads..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-white/50 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white/80 backdrop-blur-md transition shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-white/50 transition-colors shadow-sm bg-white/20 border border-white/50 backdrop-blur-md">
            <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white/50" />
            <Bell className="h-4 w-4" />
          </button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Top Header (Minimal) */}
      <header className="md:hidden h-[52px] flex items-center justify-between px-4 bg-white/40 backdrop-blur-[40px] backdrop-saturate-[150%] border-b border-white/30 z-40 relative shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 shadow-md flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">F</span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">Fellow AI</h1>
        </div>
        <button className="relative p-2 text-slate-500 hover:bg-white/50 rounded-full transition-all bg-white/20 border border-white/40 shadow-sm backdrop-blur-md">
          <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white/50" />
          <Bell className="h-4 w-4" />
        </button>
      </header>
    </>
  )
}
