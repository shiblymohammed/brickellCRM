import { prisma } from "@/lib/db/prisma"
import { formatDistanceToNow } from "date-fns"
import { Users } from "lucide-react"
import StaffClient from "./StaffClient"

export const dynamic = 'force-dynamic'

const roleColor: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  SALES_MANAGER: 'bg-indigo-100 text-indigo-700',
  SALES_STAFF: 'bg-slate-100 text-slate-700',
}

export default async function StaffPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { assignedLeads: true }
      }
    }
  })

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4 pt-4 md:px-0 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Sales Team</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">{employees.length} team members</p>
        </div>
        <StaffClient />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {employees.length === 0 ? (
          <div className="p-8 md:p-16 text-center">
            <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-400 text-xs md:text-sm font-medium">No staff members yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile Dense List */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {employees.map(emp => (
                <div key={emp.id} className="flex flex-col p-3 gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 text-[12px] truncate">{emp.name}</span>
                    </div>
                    <span className={`inline-flex items-center rounded text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${roleColor[emp.role] || 'bg-slate-100 text-slate-600'}`}>
                      {emp.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-7">
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{emp.phone || emp.email}</span>
                    <span className="text-[10px] font-bold text-slate-700">{emp._count.assignedLeads} leads</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Active Leads</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{emp.email}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{emp.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleColor[emp.role] || 'bg-slate-100 text-slate-600'}`}>
                          {emp.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{emp.department || '—'}</td>
                      <td className="px-4 py-3 text-slate-900 font-bold text-xs">{emp._count.assignedLeads}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${emp.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {emp.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {formatDistanceToNow(new Date(emp.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
