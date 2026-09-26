import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

const statusStyles: Record<string, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  LATE: 'bg-amber-100 text-amber-700',
  HALF_DAY: 'bg-orange-100 text-orange-700',
  ABSENT: 'bg-red-100 text-red-700',
  ON_LEAVE: 'bg-blue-100 text-blue-700',
}

export default async function AdminAttendancePage() {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))

  const [todayAttendance, employees] = await Promise.all([
    prisma.attendance.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: { employee: { select: { id: true, name: true, role: true } } },
      orderBy: { checkInTime: 'asc' }
    }),
    prisma.employee.findMany({
      where: { active: true, role: { in: ['SALES_STAFF', 'ADMIN', 'SALES_MANAGER'] } },
      select: { id: true, name: true }
    })
  ])

  const presentIds = new Set(todayAttendance.map(a => a.employeeId))
  const absentEmployees = employees.filter(e => !presentIds.has(e.id))

  const stats = {
    present: todayAttendance.filter(a => a.status === 'PRESENT').length,
    late: todayAttendance.filter(a => a.status === 'LATE').length,
    halfDay: todayAttendance.filter(a => a.status === 'HALF_DAY').length,
    absent: absentEmployees.length,
  }

  function getHoursWorked(record: typeof todayAttendance[0]) {
    if (!record.checkInTime || !record.checkOutTime) return null
    const diff = (new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60)
    return diff.toFixed(1) + 'h'
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4 pt-4 md:px-0 md:pt-0">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Attendance</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          {format(new Date(), 'EEEE, dd MMMM yyyy')} · {employees.length} total staff
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: 'Present', value: stats.present, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Late', value: stats.late, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'Half Day', value: stats.halfDay, color: 'text-orange-600 bg-orange-50 border-orange-200' },
          { label: 'Absent', value: stats.absent, color: 'text-red-600 bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 md:p-4 shadow-sm flex flex-col gap-0.5 md:gap-1 ${s.color}`}>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide opacity-80">{s.label}</p>
            <p className="text-2xl md:text-3xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Today's Attendance Log */}
      <div className="space-y-2 md:space-y-3">
        <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase md:normal-case tracking-wide md:tracking-normal px-1 md:px-0">Today's Log</h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          
          {/* Mobile Ultra Dense List */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {todayAttendance.map(record => (
              <div key={record.id} className="flex flex-col p-3 gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[12px]">{record.employee.name}</span>
                  <span className={`inline-flex items-center rounded text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${statusStyles[record.status] || ''}`}>
                    {record.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '—'} 
                    {' → '} 
                    {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : 'Still in'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700">{getHoursWorked(record as any) ?? '—'}</span>
                </div>
              </div>
            ))}
            {absentEmployees.map(emp => (
              <div key={emp.id} className="flex flex-col p-3 gap-1.5 opacity-50 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 text-[12px]">{emp.name}</span>
                  <span className="inline-flex items-center rounded text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-red-100 text-red-600">
                    Absent
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">— → —</span>
                  <span className="text-[10px] font-bold text-slate-400">—</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Employee</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Check In</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Check Out</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Hours Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAttendance.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
                          {record.employee.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{record.employee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusStyles[record.status] || ''}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                      {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                      {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : <span className="text-slate-400 font-sans font-medium text-xs">Still in</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold text-xs">
                      {getHoursWorked(record as any) ?? <span className="text-slate-400 font-normal">—</span>}
                    </td>
                  </tr>
                ))}
                {absentEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 opacity-50 bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 flex-shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-600">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-red-100 text-red-600">
                        Absent
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">—</td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">—</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
