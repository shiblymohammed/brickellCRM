'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useStatusColors } from '@/components/providers/StatusColorProvider'

const strategies = [
  {
    id: 'ROUND_ROBIN',
    name: 'Round Robin',
    description: 'Leads are distributed evenly in rotation. Each sales staff member receives the next lead in turn, regardless of current workload.',
    example: 'Lead 1 → Afsal, Lead 2 → Rahul, Lead 3 → Priya, Lead 4 → Afsal...',
  },
  {
    id: 'WORKLOAD',
    name: 'Workload Based',
    description: 'Leads are assigned to the staff member with the fewest active leads. Ensures balanced workload across the team.',
    example: 'Afsal has 3 leads, Rahul has 1 lead → next lead goes to Rahul',
  },
  {
    id: 'CATEGORY',
    name: 'Category Based',
    description: 'Leads are assigned based on the lead category matching staff department. Falls back to workload-based if no match.',
    example: 'E-commerce lead → E-commerce team, ERP lead → ERP team',
  },
]

export default function SettingsPage() {
  const [selected, setSelected] = useState('ROUND_ROBIN')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // In production, save to DB settings table
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4 md:space-y-8 max-w-3xl mx-auto px-4 pt-4 md:px-0 md:pt-0">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">Configure lead assignment rules and system preferences.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-sm md:text-base font-bold uppercase md:normal-case tracking-wide md:tracking-normal text-slate-900">Lead Assignment Strategy</CardTitle>
          <CardDescription className="text-[11px] md:text-sm">
            Choose how approved leads are automatically distributed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6 pt-0 md:pt-0">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all ${
                selected === s.id
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs md:text-sm">{s.name}</span>
                    {selected === s.id && (
                      <span className="inline-flex items-center gap-1 text-[9px] md:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 md:px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] md:text-sm text-slate-500 mt-1 leading-snug">{s.description}</p>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-2 font-mono bg-slate-100 px-2 py-1 rounded inline-block">{s.example}</p>
                </div>
                <div className={`mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                  selected === s.id ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                }`}>
                  {selected === s.id && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          <div className="pt-3 md:pt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-[11px] md:text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Save Settings
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-[11px] md:text-sm font-bold text-emerald-600 uppercase tracking-wide">
                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-sm md:text-base font-bold uppercase md:normal-case tracking-wide md:tracking-normal text-slate-900">Lead Status Colors</CardTitle>
          <CardDescription className="text-[11px] md:text-sm">
            Customize the background and border colors for each lead status across the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <StatusColorSettings />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-sm md:text-base font-bold uppercase md:normal-case tracking-wide md:tracking-normal text-slate-900">WhatsApp Integration</CardTitle>
          <CardDescription className="text-[11px] md:text-sm">
            Future: Direct WhatsApp Business API connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="p-3 md:p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <p className="text-[11px] md:text-sm font-bold text-slate-500 uppercase tracking-wide">Coming in Phase 4</p>
            <p className="text-[10px] md:text-xs text-slate-400 mt-1">Architecture prepared for webhook-based creation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusColorSettings() {
  const { themes, getColors, setThemes } = useStatusColors()
  const [saving, setSaving] = useState<string | null>(null)

  const availableThemes = [
    'slate', 'gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green',
    'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
  ]

  const statuses = [
    'AI_DRAFT', 'PENDING_AUDIT', 'REJECTED', 'APPROVED', 'ASSIGNED',
    'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'QUOTATION', 'NEGOTIATION', 'WON', 'LOST'
  ]

  const handleUpdate = async (status: string, theme: string) => {
    setSaving(status)
    try {
      const res = await fetch('/api/settings/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, theme })
      })
      if (res.ok) {
        setThemes({ ...themes, [status]: theme })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {statuses.map(status => {
        const colors = getColors(status)
        return (
          <div key={status} className={`p-3 rounded-lg border ${colors.bg} ${colors.border} flex items-center justify-between`}>
            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              {status.replace(/_/g, ' ')}
            </span>
            <select
              value={themes[status] || 'slate'}
              onChange={(e) => handleUpdate(status, e.target.value)}
              disabled={saving === status}
              className={`ml-2 w-24 h-7 text-xs rounded border-slate-200 bg-white shadow-sm focus:ring-1 focus:ring-slate-900 ${saving === status ? 'opacity-50' : ''}`}
            >
              {availableThemes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}
