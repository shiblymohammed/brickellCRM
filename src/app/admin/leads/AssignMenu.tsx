'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2 } from 'lucide-react'

export default function AssignMenu({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAssign(strategy: string) {
    setLoading(true)
    setIsOpen(false)
    try {
      const res = await fetch(`/api/leads/${leadId}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', strategy })
      })
      if (!res.ok) throw new Error('Failed to assign')
      router.refresh()
    } catch (e) {
      alert(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Assign'}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 text-xs">
          <button onClick={() => handleAssign('round_robin')} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700">Auto (Round Robin)</button>
          <button onClick={() => handleAssign('workload')} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700">Auto (Workload)</button>
          <button onClick={() => handleAssign('category')} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700">Auto (Category)</button>
        </div>
      )}
    </div>
  )
}
