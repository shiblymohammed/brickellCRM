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
      take: 5,
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
    <div className="space-y-4 md:space-y-8 max-w-7xl mx-auto px-4 pt-4 md:px-0 md:pt-0">
      <div className="flex items-center justify-between pt-1 md:pt-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Pipeline and team overview.</p>
        </div>
        <a
          href="/admin/leads/upload"
          className="md:hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          + Upload
        </a>
      </div>

      {/* Stats - Highly compact on mobile (2 columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide">Total Leads</span>
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900">{totalLeads}</span>
        </div>
        <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide">Unassigned</span>
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900">{pendingAudit}</span>
        </div>
        <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide">Pipeline</span>
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900">{assignedLeads}</span>
        </div>
        <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 mb-1">
            <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide">Won</span>
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900">{wonLeads}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 space-y-2 md:space-y-3">
          <div className="flex items-center justify-between px-1 md:px-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase md:normal-case tracking-wide md:tracking-normal">Recent Leads</h2>
            <a href="/admin/leads" className="text-[10px] md:text-sm font-bold text-blue-600 md:text-slate-500 hover:text-slate-900 transition-colors uppercase md:normal-case">View all &rarr;</a>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {recentLeads.length === 0 ? (
              <div className="p-8 md:p-12 text-center text-slate-400">
                <Inbox className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs md:text-sm">No leads yet.</p>
              </div>
            ) : (
              <>
                {/* Mobile Ultra Dense View */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex flex-col p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-slate-900 text-[12px] truncate">{lead.customerName || 'Unknown'}</span>
                        <span className={`inline-flex items-center rounded text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${statusColor[lead.status] || 'bg-slate-100 text-slate-600'}`}>
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 truncate max-w-[180px]">{lead.requirement || '—'}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{formatDistanceToNow(new Date(lead.createdAt))} ago</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-500">Requirement</th>
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
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${statusColor[lead.status] || 'bg-slate-100 text-slate-600'}`}>
                              {lead.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{lead.assignedTo?.name || '—'}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-3">
          <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase md:normal-case tracking-wide md:tracking-normal px-1 md:px-0">Summary</h2>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] md:text-sm font-bold md:font-medium text-slate-500 uppercase md:normal-case">Active Staff</span>
              <span className="text-xs md:text-sm font-bold text-slate-900">{staffCount}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] md:text-sm font-bold md:font-medium text-slate-500 uppercase md:normal-case">Leads in Pipeline</span>
              <span className="text-xs md:text-sm font-bold text-slate-900">{assignedLeads}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] md:text-sm font-bold md:font-medium text-slate-500 uppercase md:normal-case">Unassigned Leads</span>
              <span className={`text-xs md:text-sm font-bold ${pendingAudit > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pendingAudit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] md:text-sm font-bold md:font-medium text-slate-500 uppercase md:normal-case">Total Won</span>
              <span className="text-xs md:text-sm font-bold text-emerald-600">{wonLeads}</span>
            </div>
          </div>

          <a
            href="/admin/leads/upload"
            className="hidden md:flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            + Upload WhatsApp Screenshots
          </a>
        </div>
      </div>
    </div>
  )
}
