import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { LeadNotes } from '@/components/leads/LeadNotes'
import { ActivityTimeline } from '@/components/leads/ActivityTimeline'
import { Phone, MessageCircle, MapPin, DollarSign, Clock, Thermometer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import LeadStatusUpdater from './LeadStatusUpdater'

export const dynamic = 'force-dynamic'

const tempColor: Record<string, string> = {
  hot: 'text-red-600 bg-red-50 border-red-200',
  warm: 'text-amber-600 bg-amber-50 border-amber-200',
  cold: 'text-blue-600 bg-blue-50 border-blue-200',
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      notes: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { timestamp: 'asc' },
      },
      activities: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { timestamp: 'desc' },
        take: 20,
      },
      followUps: {
        where: { status: 'PENDING' },
        orderBy: { date: 'asc' },
        take: 3,
      },
    }
  })

  if (!lead) notFound()

  // For MVP: use first staff member as author. In production: use session.
  const firstStaff = await prisma.employee.findFirst({ where: { role: 'SALES_STAFF' } })
  const authorId = firstStaff?.id || ''

  const phoneDigits = lead.phone?.replace(/\D/g, '') || ''

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lead.customerName || 'Unknown Customer'}
            </h1>
            {lead.leadTemperature && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${tempColor[lead.leadTemperature] || ''}`}>
                <Thermometer className="w-3 h-3" />
                {lead.leadTemperature}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">{lead.requirement || 'No requirement specified'}</p>
        </div>

        {phoneDigits && (
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href={`tel:${phoneDigits}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Lead Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-0">
              {[
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: Phone, label: 'Alt. Phone', value: lead.alternatePhone },
                { icon: MapPin, label: 'Location', value: lead.location },
                { icon: DollarSign, label: 'Budget', value: lead.budget },
                { icon: Clock, label: 'Timeline', value: lead.timeline },
                { icon: Clock, label: 'Urgency', value: lead.urgency },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    <p className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-400">—</span>}</p>
                  </div>
                </div>
              ))}

              {lead.summary && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 font-medium mb-1">AI Summary</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">{lead.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Updater */}
          <LeadStatusUpdater leadId={lead.id} currentStatus={lead.status} staffId={authorId} />

          {/* Notes */}
          <Card className="h-80 flex flex-col">
            <CardContent className="p-5 flex flex-col h-full overflow-hidden">
              <LeadNotes
                leadId={lead.id}
                initialNotes={lead.notes.map(n => ({
                  id: n.id,
                  note: n.note,
                  timestamp: n.timestamp.toISOString(),
                  author: n.author,
                }))}
                authorId={authorId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Assigned Staff */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-400 font-medium mb-2">Assigned To</p>
              {lead.assignedTo ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                    {lead.assignedTo.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{lead.assignedTo.name}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Follow-ups */}
          {lead.followUps.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 font-medium mb-3">Upcoming Follow-ups</p>
                <div className="space-y-2">
                  {lead.followUps.map(fu => (
                    <div key={fu.id} className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="text-xs font-medium text-amber-800">{fu.reason}</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        {new Date(fu.date).toLocaleDateString()} at {fu.time}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold text-slate-700">Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-3 max-h-80 overflow-y-auto">
              <ActivityTimeline
                activities={lead.activities.map(a => ({
                  id: a.id,
                  type: a.type,
                  description: a.description,
                  timestamp: a.timestamp.toISOString(),
                  createdBy: a.createdBy,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
