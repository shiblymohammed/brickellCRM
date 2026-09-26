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
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 px-4 pt-4 md:px-0 md:pt-0">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 md:gap-4">
        <div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              {lead.customerName || 'Unknown Customer'}
            </h1>
            {lead.leadTemperature && (
              <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-wide ${tempColor[lead.leadTemperature] || ''}`}>
                <Thermometer className="w-3 h-3" />
                {lead.leadTemperature}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">{lead.requirement || 'No requirement specified'}</p>
        </div>

        {phoneDigits && (
          <div className="flex gap-2 w-full md:w-auto">
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex justify-center items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg bg-green-600 text-white text-[11px] md:text-sm font-bold uppercase md:normal-case tracking-wide hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> WhatsApp
            </a>
            <a
              href={`tel:${phoneDigits}`}
              className="flex-1 md:flex-none flex justify-center items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg bg-slate-900 text-white text-[11px] md:text-sm font-bold uppercase md:normal-case tracking-wide hover:bg-slate-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" /> Call
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          {/* Lead Info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-5 border-b border-slate-100 md:border-none mb-3 md:mb-0">
              <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wide text-slate-700">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 md:gap-4 p-3 md:p-5 pt-0 md:pt-0">
              {[
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: Phone, label: 'Alt. Phone', value: lead.alternatePhone },
                { icon: MapPin, label: 'Location', value: lead.location },
                { icon: DollarSign, label: 'Budget', value: lead.budget },
                { icon: Clock, label: 'Timeline', value: lead.timeline },
                { icon: Clock, label: 'Urgency', value: lead.urgency },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wide mb-0.5">{label}</p>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-300 flex-shrink-0" />
                    <p className="text-[11px] md:text-sm text-slate-800 font-bold truncate">{value || <span className="text-slate-400">—</span>}</p>
                  </div>
                </div>
              ))}

              {lead.summary && (
                <div className="col-span-2 mt-2 md:mt-0">
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wide mb-1.5">AI Summary</p>
                  <p className="text-[11px] md:text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-2.5 md:p-3 border border-slate-100">{lead.summary}</p>
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
        <div className="space-y-4 md:space-y-5">
          {/* Assigned Staff */}
          <Card className="shadow-sm">
            <CardContent className="p-3 md:p-4">
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wide mb-1.5 md:mb-2">Assigned To</p>
              {lead.assignedTo ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-700">
                    {lead.assignedTo.name.charAt(0)}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-slate-900">{lead.assignedTo.name}</span>
                </div>
              ) : (
                <p className="text-[11px] md:text-sm text-slate-400 font-medium">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Follow-ups */}
          {lead.followUps.length > 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-3 md:p-4">
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wide mb-2 md:mb-3">Upcoming Follow-ups</p>
                <div className="space-y-2">
                  {lead.followUps.map(fu => (
                    <div key={fu.id} className="p-2 md:p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="text-[11px] md:text-xs font-bold text-amber-800">{fu.reason}</p>
                      <p className="text-[9px] md:text-xs font-bold text-amber-600 mt-0.5 uppercase tracking-wide">
                        {new Date(fu.date).toLocaleDateString()} at {fu.time}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="pb-0 p-3 md:p-6 md:pb-0">
              <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wide text-slate-700">Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-2 md:pt-3 max-h-60 md:max-h-80 overflow-y-auto">
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
