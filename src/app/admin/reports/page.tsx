import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, Users, CheckCircle, XCircle, Clock, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [
    totalLeads,
    leadsByStatus,
    leadsByTemperature,
    staffPerformance,
    recentActivities,
    aiStats,
  ] = await Promise.all([
    prisma.lead.count(),

    prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

    prisma.lead.groupBy({
      by: ['leadTemperature'],
      _count: { id: true },
      where: { leadTemperature: { not: null } },
    }),

    prisma.employee.findMany({
      where: { role: 'SALES_STAFF', active: true },
      include: {
        _count: { select: { assignedLeads: true } },
        assignedLeads: {
          select: { status: true },
        }
      },
    }),

    prisma.leadActivity.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        lead: { select: { customerName: true } },
        createdBy: { select: { name: true } },
      },
    }),

    prisma.lead.groupBy({
      by: ['aiConfidence'],
      _count: { id: true },
      where: { aiConfidence: { not: null } },
    }),
  ])

  const wonLeads = leadsByStatus.find(s => s.status === 'WON')?._count.id ?? 0
  const lostLeads = leadsByStatus.find(s => s.status === 'LOST')?._count.id ?? 0
  const pendingAudit = leadsByStatus.filter(s => ['AI_DRAFT', 'PENDING_AUDIT'].includes(s.status)).reduce((a, b) => a + b._count.id, 0)
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  const statusColor: Record<string, string> = {
    AI_DRAFT: 'bg-slate-200',
    PENDING_AUDIT: 'bg-yellow-400',
    APPROVED: 'bg-emerald-400',
    ASSIGNED: 'bg-blue-400',
    CONTACTED: 'bg-purple-400',
    INTERESTED: 'bg-indigo-400',
    FOLLOW_UP: 'bg-cyan-400',
    QUOTATION: 'bg-orange-400',
    NEGOTIATION: 'bg-pink-400',
    WON: 'bg-green-500',
    LOST: 'bg-red-400',
    REJECTED: 'bg-slate-300',
  }

  const tempColor: Record<string, string> = {
    hot: 'bg-red-400',
    warm: 'bg-amber-400',
    cold: 'bg-blue-400',
  }

  return (
    <div className="space-y-4 md:space-y-8 max-w-7xl mx-auto px-4 pt-4 md:px-0 md:pt-0">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">Overview of sales pipeline and team performance.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-slate-700' },
          { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Won', value: wonLeads, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Lost', value: lostLeads, icon: XCircle, color: 'text-red-500' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-200">
            <CardContent className="p-3 md:p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide opacity-80 text-slate-500">{s.label}</p>
                <p className={`text-xl md:text-3xl font-black mt-0.5 md:mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`w-6 h-6 md:w-8 md:h-8 opacity-20 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Leads by Status */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-sm md:text-base font-bold uppercase md:normal-case tracking-wide md:tracking-normal">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-4 md:p-6 md:pt-0 space-y-2 md:space-y-2.5">
            {leadsByStatus.map(s => {
              const pct = Math.round((s._count.id / totalLeads) * 100)
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] md:text-xs font-bold text-slate-700 uppercase">{s.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] md:text-xs text-slate-500 font-medium">{s._count.id} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2">
                    <div
                      className={`h-1.5 md:h-2 rounded-full transition-all ${statusColor[s.status] || 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Lead Temperature */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-sm md:text-base font-bold uppercase md:normal-case tracking-wide md:tracking-normal">Lead Temperature</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-4 md:p-6 md:pt-0">
            <div className="space-y-3">
              {leadsByTemperature.map(t => {
                const pct = Math.round((t._count.id / totalLeads) * 100)
                return (
                  <div key={t.leadTemperature}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] md:text-xs font-bold text-slate-700 uppercase">{t.leadTemperature}</span>
                      <span className="text-[10px] md:text-xs text-slate-500 font-medium">{t._count.id} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2">
                      <div
                        className={`h-1.5 md:h-2 rounded-full ${tempColor[t.leadTemperature!] || 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-100">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-500 mb-1 md:mb-3">Pending Audit</p>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                <span className="text-lg md:text-2xl font-black text-amber-600">{pendingAudit}</span>
                <span className="text-[11px] md:text-sm text-slate-500 font-medium">leads awaiting review</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Performance */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-sm md:text-base font-bold uppercase md:normal-case tracking-wide md:tracking-normal">Staff Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-2 md:p-6 md:pt-0">
            <div className="space-y-1 md:space-y-3">
              {staffPerformance.map(emp => {
                const won = emp.assignedLeads.filter(l => l.status === 'WON').length
                const active = emp.assignedLeads.filter(l => !['WON', 'LOST', 'REJECTED'].includes(l.status)).length
                return (
                  <div key={emp.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-600 flex-shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] md:text-sm font-bold text-slate-900 truncate">{emp.name}</p>
                      <p className="text-[10px] md:text-xs font-medium text-slate-500">{active} active · {won} won</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm md:text-lg font-black text-slate-900">{emp._count.assignedLeads}</p>
                      <p className="text-[8px] md:text-xs font-bold uppercase text-slate-400 tracking-wide">total leads</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-sm md:text-base font-bold uppercase md:normal-case tracking-wide md:tracking-normal">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-4 md:p-6 md:pt-0 space-y-2.5 md:space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-[11px] md:text-sm text-slate-400 font-medium text-center py-4">No activity yet.</p>
            ) : (
              recentActivities.map(a => (
                <div key={a.id} className="flex items-start gap-2 md:gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 md:mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] md:text-xs font-medium text-slate-700 leading-snug">{a.description}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {a.lead && <span className="text-[9px] md:text-[10px] font-bold text-slate-400">{a.lead.customerName}</span>}
                      {a.createdBy && <><span className="text-[9px] text-slate-300">·</span><span className="text-[9px] md:text-[10px] font-bold text-slate-500">{a.createdBy.name}</span></>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
