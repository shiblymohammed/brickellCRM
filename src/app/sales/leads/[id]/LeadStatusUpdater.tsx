'use client'

import { useState } from 'react'
import { TrendingUp, Loader2 } from 'lucide-react'

import { useStatusColors } from '@/components/providers/StatusColorProvider'

const STATUSES = [
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'FOLLOW_UP', label: 'Follow Up' },
  { value: 'QUOTATION', label: 'Quotation' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: '🎉 Won' },
  { value: 'LOST', label: 'Lost' },
]

export default function LeadStatusUpdater({
  leadId,
  currentStatus,
  staffId,
}: {
  leadId: string
  currentStatus: string
  staffId: string
}) {
  const { getColors } = useStatusColors()
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleUpdate() {
    if (status === currentStatus) return
    setUpdating(true)
    setSuccess(false)
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedById: staffId, note }),
      })
      if (res.ok) {
        setSuccess(true)
        setNote('')
        setTimeout(() => setSuccess(false), 3000)
      }
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Update Status</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {STATUSES.map(s => {
          const colors = getColors(s.value)
          return (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
              status === s.value
                ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-offset-1 ring-slate-400`
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {s.label}
          </button>
        )})}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note with this update (optional)"
          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdate}
            disabled={status === currentStatus || updating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Update Status
          </button>
          {success && <span className="text-sm text-emerald-600 font-medium">✓ Status updated</span>}
        </div>
      </div>
    </div>
  )
}
