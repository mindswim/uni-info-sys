import { cn } from "@/lib/utils"

interface PageSectionProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "muted" | "dark"
  size?: "default" | "sm" | "lg"
}

export function PageSection({
  children,
  className,
  variant = "default",
  size = "default"
}: PageSectionProps) {
  return (
    <section
      className={cn(
        size === "default" && "py-16",
        size === "sm" && "py-12",
        size === "lg" && "py-24",
        variant === "muted" && "bg-slate-50",
        variant === "dark" && "bg-slate-900 text-white",
        className
      )}
    >
      <div className="container">
        {children}
      </div>
    </section>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <PageSection variant="dark" className={className}>
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      {description && (
        <p className="text-xl text-slate-200 max-w-3xl">
          {description}
        </p>
      )}
    </PageSection>
  )
}

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
  centered?: boolean
}

export function SectionContainer({
  children,
  className,
  size = "lg",
  centered = true
}: SectionContainerProps) {
  return (
    <div
      className={cn(
        size === "sm" && "max-w-2xl",
        size === "md" && "max-w-3xl",
        size === "lg" && "max-w-4xl",
        size === "xl" && "max-w-5xl",
        size === "full" && "w-full",
        centered && "mx-auto",
        className
      )}
    >
      {children}
    </div>
  )
}