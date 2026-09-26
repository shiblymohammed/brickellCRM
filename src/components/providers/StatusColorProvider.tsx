'use client'

import React, { createContext, useContext, useState } from 'react'

export type StatusThemeMap = Record<string, string>

type StatusColorContextType = {
  themes: StatusThemeMap
  setThemes: (themes: StatusThemeMap) => void
  getColors: (status: string) => { bg: string, text: string, border: string }
}

const defaultThemes: StatusThemeMap = {
  AI_DRAFT: 'slate',
  PENDING_AUDIT: 'amber',
  APPROVED: 'emerald',
  ASSIGNED: 'blue',
  CONTACTED: 'purple',
  INTERESTED: 'indigo',
  FOLLOW_UP: 'cyan',
  QUOTATION: 'orange',
  NEGOTIATION: 'pink',
  WON: 'green',
  LOST: 'red',
  REJECTED: 'slate',
}

const StatusColorContext = createContext<StatusColorContextType>({
  themes: defaultThemes,
  setThemes: () => {},
  getColors: () => ({ bg: 'bg-slate-50 text-slate-600', text: 'text-slate-600', border: 'border-slate-200' })
})

export function StatusColorProvider({ children, initialThemes }: { children: React.ReactNode, initialThemes?: StatusThemeMap }) {
  const [themes, setThemes] = useState<StatusThemeMap>(initialThemes && Object.keys(initialThemes).length > 0 ? initialThemes : defaultThemes)

  const getColors = (status: string) => {
    const theme = themes[status] || 'slate'
    // Map theme names to their safe Tailwind classes to ensure PurgeCSS keeps them
    const safeClasses: Record<string, { bg: string, text: string, border: string }> = {
      slate: { bg: 'bg-slate-50/40', text: 'text-slate-600', border: 'border-slate-200' },
      gray: { bg: 'bg-gray-50/40', text: 'text-gray-600', border: 'border-gray-200' },
      red: { bg: 'bg-red-50/40', text: 'text-red-600', border: 'border-red-200' },
      orange: { bg: 'bg-orange-50/40', text: 'text-orange-600', border: 'border-orange-200' },
      amber: { bg: 'bg-amber-50/40', text: 'text-amber-600', border: 'border-amber-200' },
      yellow: { bg: 'bg-yellow-50/40', text: 'text-yellow-700', border: 'border-yellow-200' },
      lime: { bg: 'bg-lime-50/40', text: 'text-lime-700', border: 'border-lime-200' },
      green: { bg: 'bg-green-50/40', text: 'text-green-700', border: 'border-green-200' },
      emerald: { bg: 'bg-emerald-50/40', text: 'text-emerald-700', border: 'border-emerald-200' },
      teal: { bg: 'bg-teal-50/40', text: 'text-teal-700', border: 'border-teal-200' },
      cyan: { bg: 'bg-cyan-50/40', text: 'text-cyan-700', border: 'border-cyan-200' },
      sky: { bg: 'bg-sky-50/40', text: 'text-sky-700', border: 'border-sky-200' },
      blue: { bg: 'bg-blue-50/40', text: 'text-blue-700', border: 'border-blue-200' },
      indigo: { bg: 'bg-indigo-50/40', text: 'text-indigo-700', border: 'border-indigo-200' },
      violet: { bg: 'bg-violet-50/40', text: 'text-violet-700', border: 'border-violet-200' },
      purple: { bg: 'bg-purple-50/40', text: 'text-purple-700', border: 'border-purple-200' },
      fuchsia: { bg: 'bg-fuchsia-50/40', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
      pink: { bg: 'bg-pink-50/40', text: 'text-pink-700', border: 'border-pink-200' },
      rose: { bg: 'bg-rose-50/40', text: 'text-rose-700', border: 'border-rose-200' },
    }
    
    return safeClasses[theme] || safeClasses.slate
  }

  return (
    <StatusColorContext.Provider value={{ themes, setThemes, getColors }}>
      {children}
    </StatusColorContext.Provider>
  )
}

export const useStatusColors = () => useContext(StatusColorContext)
