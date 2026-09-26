import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, icon: Icon, description, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
              {trend && (
                <span className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}>
                  {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            <Icon className="h-6 w-6 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
