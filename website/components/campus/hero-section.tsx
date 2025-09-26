import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReactNode } from "react"

interface HeroAction {
  label: string
  href: string
  variant?: "default" | "outline"
}

interface HeroSectionProps {
  title: string
  subtitle: string
  actions?: HeroAction[]
  className?: string
  children?: ReactNode
}

export function HeroSection({
  title,
  subtitle,
  actions = [],
  className = "",
  children
}: HeroSectionProps) {
  return (
    <section className={`bg-slate-900 text-white py-20 ${className}`}>
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">{title}</h1>
          <p className="text-xl text-slate-200 mb-8">
            {subtitle}
          </p>
          {children}
          {actions.length > 0 && (
            <div className="flex gap-4 justify-center">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={action.variant || "default"}
                  className={action.variant === "outline" ? "bg-transparent text-white border-white hover:bg-white/10" : ""}
                  asChild
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}