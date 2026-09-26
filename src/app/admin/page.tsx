import { prisma } from "@/lib/db/prisma"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Users, Inbox, CheckCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatDistanceToNow } from "date-fns"

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const [totalLeads, pendingAudit, assignedLeads, wonLeads, recentLeads, staffCount] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: { in: ['AI_DRAFT', 'PENDING_AUDIT'] } } }),
    prisma.lead.count({ where: { status: 'ASSIGNED' } }),
    prisma.lead.count({ where: { status: 'WON' } }),
    prisma.lead.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { name: true } } }
    }),
    prisma.employee.count({ where: { active: true, role: { in: ['SALES_STAFF', 'ADMIN', 'SALES_MANAGER'] } } })
  ])

  return { totalLeads, pendingAudit, assignedLeads, wonLeads, recentLeads, staffCount }
}

const temperatureColor: Record<string, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-blue-100 text-blue-700',
}

const statusColor: Record<string, string> = {
  AI_DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_AUDIT: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-purple-100 text-purple-700',
  INTERESTED: 'bg-indigo-100 text-indigo-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
  REJECTED: 'bg-slate-100 text-slate-500',
}

export default async function AdminDashboard() {
  const { totalLeads, pendingAudit, assignedLeads, wonLeads, recentLeads, staffCount } = await getDashboardData()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of lead pipeline and team performance.</p>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={totalLeads} icon={Users} description="All time" />
        <StatsCard title="Unassigned" value={pendingAudit} icon={Clock} description="Needs staff assignment" />
        <StatsCard title="Active Assigned" value={assignedLeads} icon={TrendingUp} description="In pipeline" />
        <StatsCard title="Won Leads" value={wonLeads} icon={CheckCircle} description="Closed deals" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Leads</h2>
            <a href="/admin/leads" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">View all →</a>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            {recentLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No leads yet. Upload a screenshot to get started.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Requirement</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Temp</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Assigned To</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{lead.customerName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{lead.requirement || '—'}</td>
                      <td className="px-4 py-3">
                        {lead.leadTemperature ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${temperatureColor[lead.leadTemperature] || 'bg-slate-100 text-slate-600'}`}>
                            {lead.leadTemperature}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[lead.status] || 'bg-slate-100 text-slate-600'}`}>
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.assignedTo?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Quick Summary</h2>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Active Staff</span>
                <span className="text-sm font-semibold text-slate-900">{staffCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Leads in Pipeline</span>
                <span className="text-sm font-semibold text-slate-900">{assignedLeads}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Unassigned Leads</span>
                <span className={`text-sm font-semibold ${pendingAudit > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pendingAudit}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500">Total Won</span>
                <span className="text-sm font-semibold text-emerald-600">{wonLeads}</span>
              </div>
            </CardContent>
          </Card>

          <a
            href="/admin/leads/upload"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            + Upload WhatsApp Screenshots
          </a>
        </div>
      </div>
    </div>
  )
}
