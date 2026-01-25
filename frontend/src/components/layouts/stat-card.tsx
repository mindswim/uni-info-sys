import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  variant?: "default" | "success" | "warning" | "destructive"
}

/**
 * StatCard - Dashboard statistics card
 *
 * Use for displaying key metrics and statistics.
 * Supports trend indicators and custom icons.
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Students"
 *   value={1234}
 *   description="Active enrollments"
 *   trend={{ value: 12, label: "from last month" }}
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default"
}: StatCardProps) {
  const trendIcon = trend ? (
    trend.value > 0 ? (
      <ArrowUp className="h-4 w-4" />
    ) : trend.value < 0 ? (
      <ArrowDown className="h-4 w-4" />
    ) : (
      <Minus className="h-4 w-4" />
    )
  ) : null

  const trendColor = trend
    ? trend.value > 0
      ? "text-success"
      : trend.value < 0
      ? "text-danger"
      : "text-muted-foreground"
    : ""

  const variantClasses = {
    default: "",
    success: "border-success",
    warning: "border-warning",
    destructive: "border-danger"
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {description && <span>{description}</span>}
            {trend && (
              <span className={`flex items-center gap-1 ${trendColor}`}>
                {trendIcon}
                {Math.abs(trend.value)}% {trend.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
