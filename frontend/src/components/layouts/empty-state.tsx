import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * EmptyState - Consistent empty state pattern
 *
 * Use when lists/tables/content areas are empty.
 * Provides clear messaging and optional call-to-action.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Users className="h-12 w-12" />}
 *   title="No students found"
 *   description="Get started by adding your first student"
 *   action={{ label: "Add Student", onClick: () => setOpen(true) }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">{icon}</div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
