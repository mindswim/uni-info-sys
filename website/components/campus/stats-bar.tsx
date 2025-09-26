import { LucideIcon } from "lucide-react"

interface StatItem {
  icon: LucideIcon
  value: string | number
  label: string
}

interface StatsBarProps {
  stats: StatItem[]
  className?: string
}

export function StatsBar({ stats, className = "" }: StatsBarProps) {
  return (
    <section className={`py-8 bg-slate-50 border-y ${className}`}>
      <div className="container">
        <div className={`grid grid-cols-2 md:grid-cols-${stats.length} gap-8 max-w-5xl mx-auto`}>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}