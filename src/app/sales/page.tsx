import { prisma } from "@/lib/db/prisma"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { PhoneCall, Calendar, CheckCircle, Users, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

export const dynamic = 'force-dynamic'

const MOCK_EMPLOYEE_ID_INDEX = 0

export default async function SalesDashboard() {
  const staff = await prisma.employee.findMany({
    where: { role: 'SALES_STAFF' },
    take: 1
  })

  const employee = staff[0]

  const [myLeads, todayFollowups, statusColorsData] = await Promise.all([
    employee ? prisma.lead.findMany({
      where: { assignedToId: employee.id },
      orderBy: { createdAt: 'desc' },
      take: 9
    }) : [],
    employee ? prisma.followUp.count({
      where: {
        assignedStaffId: employee.id,
        status: 'PENDING',
        date: { gte: new Date(new Date().setHours(0,0,0,0)) }
      }
    }) : 0,
    prisma.statusColor.findMany()
  ])

  const themes: Record<string, string> = {}
  statusColorsData.forEach(sc => { themes[sc.status] = sc.theme })

  const getSafeColors = (status: string) => {
    const theme = themes[status] || 'slate'
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

  const temperatureColor: Record<string, string> = {
    hot: 'text-red-600 bg-red-50 border-red-200',
    warm: 'text-amber-600 bg-amber-50 border-amber-200',
    cold: 'text-blue-600 bg-blue-50 border-blue-200',
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4 pt-4 md:px-0 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            My Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {employee ? `Logged in as ${employee.name}` : 'Sales Staff View'}
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-emerald-600 text-white text-[11px] md:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
          Clock In/Out
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <StatsCard title="My Leads" value={myLeads.length} icon={Users} />
        <StatsCard title="Follow-ups" value={todayFollowups} icon={Calendar} />
        <StatsCard title="Calls" value="—" icon={PhoneCall} />
        <StatsCard title="Won" value={myLeads.filter(l => l.status === 'WON').length} icon={CheckCircle} />
      </div>

      <div className="space-y-2 md:space-y-4">
        <div className="flex items-center justify-between px-1 md:px-0">
          <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase md:normal-case tracking-wide md:tracking-normal">My Active Leads</h2>
          <a href="/sales/leads" className="text-[10px] md:text-sm font-bold text-blue-600 md:text-slate-500 hover:text-slate-900 transition-colors uppercase md:normal-case">View all &rarr;</a>
        </div>

        {myLeads.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 md:p-16 text-center shadow-sm">
            <p className="text-slate-400 text-xs md:text-sm font-medium">No leads assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {myLeads.map((lead) => {
              const colors = getSafeColors(lead.status)
              return (
              <Card key={lead.id} className={`flex flex-col hover:shadow-md transition-shadow shadow-sm ${colors.border} ${colors.bg}`}>
                <CardContent className="p-3 md:p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate">
                        {lead.customerName || 'Unknown Customer'}
                      </h3>
                      <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {lead.requirement || 'No requirement specified'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`flex-shrink-0 inline-flex items-center rounded-md border px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                      {lead.leadTemperature && (
                        <span className={`flex-shrink-0 inline-flex items-center rounded-md border px-1.5 md:px-2 py-0.5 text-[8px] md:text-[9px] font-bold uppercase tracking-wider ${temperatureColor[lead.leadTemperature] || ''}`}>
                          {lead.leadTemperature}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 md:gap-y-2 mb-3 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[9px] md:text-xs font-bold uppercase tracking-wide text-slate-400">Budget</p>
                      <p className="font-bold text-[11px] md:text-sm text-slate-800 truncate">{lead.budget || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] md:text-xs font-bold uppercase tracking-wide text-slate-400">Location</p>
                      <p className="font-bold text-[11px] md:text-sm text-slate-800 truncate">{lead.location || '—'}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {lead.phone ? (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[11px] md:text-xs font-bold uppercase tracking-wide hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        WhatsApp
                      </a>
                    ) : (
                      <button disabled className="flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-[11px] md:text-xs font-bold uppercase tracking-wide cursor-not-allowed">
                        <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        WhatsApp
                      </button>
                    )}
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone.replace(/\D/g, '')}`}
                        className="flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 rounded-lg bg-slate-900 text-white text-[11px] md:text-xs font-bold uppercase tracking-wide hover:bg-slate-700 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Call
                      </a>
                    ) : (
                      <button disabled className="flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 rounded-lg bg-slate-200 text-slate-400 text-[11px] md:text-xs font-bold uppercase tracking-wide cursor-not-allowed">
                        <PhoneCall className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Call
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
