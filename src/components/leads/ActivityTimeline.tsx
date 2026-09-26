import { formatDistanceToNow } from 'date-fns'
import {
  CheckCircle, XCircle, UserCheck, Phone, MessageCircle,
  FileText, Calendar, AlertCircle, Star, Zap, TrendingUp
} from 'lucide-react'

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  createdBy?: { name: string } | null
}

const activityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  LEAD_APPROVED: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  LEAD_REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  LEAD_ASSIGNED: { icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  CALL_INITIATED: { icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  WHATSAPP_OPENED: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
  NOTE_ADDED: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
  FOLLOWUP_SCHEDULED: { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
  FOLLOWUP_UPDATED: { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
  STATUS_CHANGED: { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  LEAD_WON: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  LEAD_LOST: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-50' },
}

const defaultConfig = { icon: Zap, color: 'text-slate-400', bg: 'bg-slate-50' }

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-xs">No activity yet.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100" />

      {activities.map((activity, i) => {
        const config = activityConfig[activity.type] || defaultConfig
        const Icon = config.icon

        return (
          <div key={activity.id} className="flex gap-3 pb-5 relative">
            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center border-2 border-white shadow-sm`}>
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            </div>
            <div className="flex-1 pt-1 min-w-0">
              <p className="text-sm text-slate-800 leading-snug">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1">
                {activity.createdBy && (
                  <>
                    <span className="text-xs text-slate-500">{activity.createdBy.name}</span>
                    <span className="text-xs text-slate-300">·</span>
                  </>
                )}
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
