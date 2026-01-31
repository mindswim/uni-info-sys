interface PageShellProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function PageShell({ children, title, description, actions }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {title && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
