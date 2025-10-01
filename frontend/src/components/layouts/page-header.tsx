interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

/**
 * PageHeader - Consistent page header pattern
 *
 * Use this at the top of every page for consistency.
 * Supports optional description, actions, and breadcrumbs.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Students"
 *   description="Manage student records and enrollment"
 *   action={<Button>Add Student</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  action,
  breadcrumbs
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="mx-2">/</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
