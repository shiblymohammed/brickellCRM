'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { CheckCircle } from 'lucide-react'

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
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure lead assignment rules and system preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Assignment Strategy</CardTitle>
          <CardDescription>
            Choose how approved leads are automatically distributed to sales staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selected === s.id
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{s.name}</span>
                    {selected === s.id && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                  <p className="text-xs text-slate-400 mt-2 font-mono bg-slate-100 px-2 py-1 rounded">{s.example}</p>
                </div>
                <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
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

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Save Settings
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle className="w-4 h-4" /> Saved successfully
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Integration</CardTitle>
          <CardDescription>
            Future: Connect Brickell-Connect directly to WhatsApp Business API to receive messages without screenshots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
            <p className="text-sm text-slate-500">WhatsApp Business API integration — coming in Phase 4.</p>
            <p className="text-xs text-slate-400 mt-1">Architecture is already prepared for webhook-based lead creation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
