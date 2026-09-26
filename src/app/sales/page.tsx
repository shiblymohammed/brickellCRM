import { prisma } from "@/lib/db/prisma"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { PhoneCall, Calendar, CheckCircle, Users, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

export const dynamic = 'force-dynamic'

// In production this would use the session user's employee ID
const MOCK_EMPLOYEE_ID_INDEX = 0

export default async function SalesDashboard() {
  const staff = await prisma.employee.findMany({
    where: { role: 'SALES_STAFF' },
    take: 1
  })

  const employee = staff[0]

  const [myLeads, todayFollowups] = await Promise.all([
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
    }) : 0
  ])

  const temperatureColor: Record<string, string> = {
    hot: 'text-red-600 bg-red-50 border-red-200',
    warm: 'text-amber-600 bg-amber-50 border-amber-200',
    cold: 'text-blue-600 bg-blue-50 border-blue-200',
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {employee ? `Logged in as ${employee.name}` : 'Sales Staff View'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          Clock In / Out
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Leads" value={myLeads.length} icon={Users} />
        <StatsCard title="Follow-ups Today" value={todayFollowups} icon={Calendar} />
        <StatsCard title="Calls Today" value="—" icon={PhoneCall} />
        <StatsCard title="Won" value={myLeads.filter(l => l.status === 'WON').length} icon={CheckCircle} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">My Active Leads</h2>
          <a href="/sales/leads" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">View all →</a>
        </div>

        {myLeads.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
            <p className="text-slate-400 text-sm">No leads assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myLeads.map((lead) => (
              <Card key={lead.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 leading-tight">
                        {lead.customerName || 'Unknown Customer'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[160px]">
                        {lead.requirement || 'No requirement specified'}
                      </p>
                    </div>
                    {lead.leadTemperature && (
                      <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${temperatureColor[lead.leadTemperature] || ''}`}>
                        {lead.leadTemperature}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Budget</p>
                      <p className="font-medium text-slate-800 truncate">{lead.budget || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="font-medium text-slate-800 truncate">{lead.location || '—'}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {lead.phone ? (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    ) : (
                      <button disabled className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-xs font-medium cursor-not-allowed">
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                    )}
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone.replace(/\D/g, '')}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call
                      </a>
                    ) : (
                      <button disabled className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 text-slate-400 text-xs font-medium cursor-not-allowed">
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
