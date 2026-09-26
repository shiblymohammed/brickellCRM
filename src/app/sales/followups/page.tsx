'use client'

import { useState, useEffect } from 'react'
import { format, isPast, isToday } from 'date-fns'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Phone, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface FollowUp {
  id: string
  date: string
  time: string
  reason: string
  status: string
  lead: {
    id: string
    customerName: string | null
    phone: string | null
    requirement: string | null
    leadTemperature: string | null
  }
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  MISSED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

export default function SalesFollowupsPage() {
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'MISSED'>('PENDING')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadFollowups()
  }, [filter])

  async function loadFollowups() {
    setLoading(true)
    const params = filter !== 'ALL' ? `?status=${filter}` : ''
    const res = await fetch(`/api/followups${params}`)
    const data = await res.json()
    setFollowups(data.followups || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    await fetch(`/api/followups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    await loadFollowups()
    setUpdating(null)
  }

  const overdue = followups.filter(f =>
    f.status === 'PENDING' && isPast(new Date(f.date)) && !isToday(new Date(f.date))
  )
  const today = followups.filter(f => isToday(new Date(f.date)) && f.status === 'PENDING')
  const upcoming = followups.filter(f =>
    f.status === 'PENDING' && !isPast(new Date(f.date)) && !isToday(new Date(f.date))
  )
  const done = followups.filter(f => f.status !== 'PENDING')

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto px-4 pt-4 md:px-0 md:pt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Follow-ups</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {overdue.length > 0 && (
              <span className="text-red-600 font-bold">{overdue.length} overdue · </span>
            )}
            {today.length} due today · {upcoming.length} upcoming
          </p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto w-full md:w-auto overflow-x-auto">
          {(['PENDING', 'ALL', 'COMPLETED', 'MISSED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors flex-1 md:flex-none ${
                filter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : followups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <Calendar className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No follow-ups {filter !== 'ALL' ? `with status "${filter.toLowerCase()}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue */}
          {overdue.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-semibold text-red-600">Overdue ({overdue.length})</h2>
              </div>
              <div className="space-y-3">
                {overdue.map(f => <FollowUpCard key={f.id} followup={f} onUpdate={updateStatus} updating={updating} variant="overdue" />)}
              </div>
            </section>
          )}

          {/* Today */}
          {today.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-amber-700">Today ({today.length})</h2>
              </div>
              <div className="space-y-3">
                {today.map(f => <FollowUpCard key={f.id} followup={f} onUpdate={updateStatus} updating={updating} variant="today" />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-600">Upcoming ({upcoming.length})</h2>
              </div>
              <div className="space-y-3">
                {upcoming.map(f => <FollowUpCard key={f.id} followup={f} onUpdate={updateStatus} updating={updating} variant="upcoming" />)}
              </div>
            </section>
          )}

          {/* Done */}
          {done.length > 0 && filter === 'ALL' && (
            <section>
              <h2 className="text-sm font-semibold text-slate-400 mb-3">History</h2>
              <div className="space-y-3">
                {done.map(f => <FollowUpCard key={f.id} followup={f} onUpdate={updateStatus} updating={updating} variant="done" />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function FollowUpCard({
  followup,
  onUpdate,
  updating,
  variant
}: {
  followup: FollowUp
  onUpdate: (id: string, status: string) => void
  updating: string | null
  variant: 'overdue' | 'today' | 'upcoming' | 'done'
}) {
  const borderColor = {
    overdue: 'border-l-red-400',
    today: 'border-l-amber-400',
    upcoming: 'border-l-slate-300',
    done: 'border-l-slate-200',
  }[variant]

  return (
    <Card className={`border-l-4 ${borderColor} shadow-sm`}>
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-xs md:text-sm">
                {followup.lead.customerName || 'Unknown Customer'}
              </span>
              <span className={`inline-flex items-center rounded-md px-1.5 md:px-2 py-0.5 text-[9px] md:text-xs font-bold uppercase tracking-wider ${statusStyles[followup.status]}`}>
                {followup.status}
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">{followup.lead.requirement || 'No requirement'}</p>
            <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
              <span className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 font-mono">
                <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                {format(new Date(followup.date), 'dd MMM yyyy')}
              </span>
              <span className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 font-mono">
                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                {followup.time}
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-slate-600 mt-1.5 font-medium">{followup.reason}</p>
          </div>

          <div className="flex md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
            {followup.status === 'PENDING' && (
              <>
                {followup.lead.phone && (
                  <div className="flex gap-1.5 flex-1 md:flex-none">
                    <a
                      href={`https://wa.me/${followup.lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none flex justify-center items-center gap-1 px-2 py-1.5 md:px-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3 md:w-3 md:h-3" /> WA
                    </a>
                    <a
                      href={`tel:${followup.lead.phone.replace(/\D/g, '')}`}
                      className="flex-1 md:flex-none flex justify-center items-center gap-1 px-2 py-1.5 md:px-2.5 rounded-lg bg-slate-900 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors"
                    >
                      <Phone className="w-3 h-3 md:w-3 md:h-3" /> Call
                    </a>
                  </div>
                )}
                <div className="flex gap-1.5 flex-1 md:flex-none">
                  <button
                    onClick={() => onUpdate(followup.id, 'COMPLETED')}
                    disabled={updating === followup.id}
                    className="flex-1 md:flex-none flex justify-center items-center gap-1 px-2 py-1.5 md:px-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    {updating === followup.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                    Done
                  </button>
                  <button
                    onClick={() => onUpdate(followup.id, 'MISSED')}
                    disabled={updating === followup.id}
                    className="flex-1 md:flex-none flex justify-center items-center gap-1 px-2 py-1.5 md:px-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3 h-3" /> Missed
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
