'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Clock, LogIn, LogOut, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface AttendanceRecord {
  id: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: string
  employee?: { id: string; name: string; role: string }
}

const statusStyles: Record<string, { label: string; color: string }> = {
  PRESENT: { label: 'Present', color: 'bg-emerald-100 text-emerald-700' },
  LATE: { label: 'Late', color: 'bg-amber-100 text-amber-700' },
  HALF_DAY: { label: 'Half Day', color: 'bg-orange-100 text-orange-700' },
  ABSENT: { label: 'Absent', color: 'bg-red-100 text-red-700' },
  ON_LEAVE: { label: 'On Leave', color: 'bg-blue-100 text-blue-700' },
}

// MVP: Using first employee — production would use auth session
const MOCK_EMPLOYEE_ID_PLACEHOLDER = 'LOADED_FROM_API'

export default function SalesAttendancePage() {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch first SALES_STAFF employee for MVP demo
    fetch('/api/attendance')
      .then(r => r.json())
      .then(data => {
        const records: AttendanceRecord[] = data.attendance || []
        if (records.length > 0) {
          setEmployeeId(records[0].employee?.id || null)
        }
        setTodayRecord(records[0] || null)
        setLoading(false)
      })
  }, [])

  async function handleCheckIn() {
    if (!employeeId && !todayRecord) {
      // If no employee found, try fetching from staff list
      const staffRes = await fetch('/api/staff')
      if (staffRes.ok) {
        const staffData = await staffRes.json()
        if (staffData.staff?.length > 0) {
          setEmployeeId(staffData.staff[0].id)
        }
      }
    }

    setProcessing(true)
    setMessage(null)
    try {
      // For MVP demo, use a placeholder employee lookup
      const staffRes = await fetch('/api/attendance')
      const staffData = await staffRes.json()
      const empId = staffData.attendance?.[0]?.employee?.id

      if (!empId) {
        setMessage({ type: 'error', text: 'Could not identify your employee profile.' })
        return
      }

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, type: 'CHECK_IN' })
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Check-in failed' })
      } else {
        setMessage({ type: 'success', text: `Checked in at ${format(new Date(data.time), 'hh:mm a')} — ${data.status}` })
        setTodayRecord(data.attendance)
      }
    } finally {
      setProcessing(false)
    }
  }

  async function handleCheckOut() {
    if (!todayRecord) return
    setProcessing(true)
    setMessage(null)
    try {
      const staffRes = await fetch('/api/attendance')
      const staffData = await staffRes.json()
      const empId = staffData.attendance?.[0]?.employee?.id || todayRecord.id

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, type: 'CHECK_OUT' })
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Check-out failed' })
      } else {
        setMessage({ type: 'success', text: `Checked out at ${format(new Date(data.time), 'hh:mm a')} · ${data.hoursWorked}h worked` })
        setTodayRecord(data.attendance)
      }
    } finally {
      setProcessing(false)
    }
  }

  const hasCheckedIn = !!todayRecord?.checkInTime
  const hasCheckedOut = !!todayRecord?.checkOutTime

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Today's Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5">Today</h2>

          {message && (
            <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Check In</p>
              <p className="text-lg font-bold text-slate-900">
                {hasCheckedIn ? format(new Date(todayRecord!.checkInTime!), 'hh:mm a') : '—'}
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Check Out</p>
              <p className="text-lg font-bold text-slate-900">
                {hasCheckedOut ? format(new Date(todayRecord!.checkOutTime!), 'hh:mm a') : '—'}
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              {todayRecord ? (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[todayRecord.status]?.color}`}>
                  {statusStyles[todayRecord.status]?.label}
                </span>
              ) : (
                <p className="text-sm font-medium text-slate-400">Not in</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedIn || processing}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {hasCheckedIn ? 'Checked In ✓' : 'Clock In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut || processing}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              {hasCheckedOut ? 'Checked Out ✓' : 'Clock Out'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Attendance Policy</p>
          <p className="mt-0.5 text-blue-600">Check-in before 9:00 AM is marked Present. After 9:00 AM is marked Late. Less than 5 hours is marked Half Day.</p>
        </div>
      </div>
    </div>
  )
}
