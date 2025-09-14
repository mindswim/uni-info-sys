import { StatusConfig, StatusVariant } from "@/types/university"

// Status configurations for different entity types
export const enrollmentStatuses: Record<string, StatusConfig> = {
  enrolled: { label: "Enrolled", variant: "default" },
  waitlisted: { label: "Waitlisted", variant: "secondary" },
  completed: { label: "Completed", variant: "outline" },
  withdrawn: { label: "Withdrawn", variant: "destructive" }
}

export const applicationStatuses: Record<string, StatusConfig> = {
  pending: { label: "Pending", variant: "secondary" },
  under_review: { label: "Under Review", variant: "outline" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  waitlisted: { label: "Waitlisted", variant: "secondary" }
}

export const courseSectionStatuses: Record<string, StatusConfig> = {
  open: { label: "Open", variant: "default" },
  closed: { label: "Closed", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" }
}

export const degreeTypes: Record<string, StatusConfig> = {
  bachelor: { label: "Bachelor's", variant: "default" },
  master: { label: "Master's", variant: "outline" },
  phd: { label: "Ph.D.", variant: "secondary" },
  certificate: { label: "Certificate", variant: "outline" }
}

// Utility functions - return config objects instead of JSX
export function getStatusConfig(status: string, statusMap: Record<string, StatusConfig>) {
  return statusMap[status] || { label: status, variant: "outline" as StatusVariant }
}

export function renderDate(dateString: string | null | undefined): string {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString()
}

export function renderDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleString()
}

export function renderCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—"
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function renderPercentage(value: number | null | undefined, total?: number): string {
  if (value === null || value === undefined) return "—"
  
  if (total !== undefined) {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return `${percentage.toFixed(1)}%`
  }
  
  return `${value.toFixed(1)}%`
}

export function getCapacityConfig(enrolled: number, capacity: number) {
  const percentage = capacity > 0 ? (enrolled / capacity) * 100 : 0
  const variant: StatusVariant = percentage >= 100 ? "destructive" : percentage >= 80 ? "secondary" : "default"
  
  return {
    enrolled,
    capacity,
    percentage: percentage.toFixed(0),
    variant,
    display: `${enrolled}/${capacity}`
  }
}

export function getGradeConfig(grade: string | null | undefined) {
  if (!grade) return { label: "—", variant: "outline" as StatusVariant }
  
  const gradeColors: Record<string, StatusVariant> = {
    'A+': 'default', 'A': 'default', 'A-': 'default',
    'B+': 'outline', 'B': 'outline', 'B-': 'outline',
    'C+': 'secondary', 'C': 'secondary', 'C-': 'secondary',
    'D+': 'destructive', 'D': 'destructive', 'D-': 'destructive',
    'F': 'destructive'
  }
  
  const variant = gradeColors[grade] || 'outline'
  return { label: grade, variant }
}

// Common table actions configuration
export interface TableActionConfig {
  label: string
  onClick: () => void
  icon?: string
  destructive?: boolean
}

export interface TableActionsConfig {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  customActions?: TableActionConfig[]
}

// Table column builders for common patterns
export function buildNameColumn<T>(accessor: keyof T, title: string = "Name") {
  return {
    key: accessor,
    title,
    sortable: true,
    render: (value: any) => value
  }
}

export function buildDateColumn<T>(accessor: keyof T, title: string) {
  return {
    key: accessor,
    title,
    sortable: true,
    render: (value: any) => renderDate(value)
  }
}

export function buildStatusColumn<T>(
  accessor: keyof T, 
  title: string, 
  statusMap: Record<string, StatusConfig>
) {
  return {
    key: accessor,
    title,
    sortable: true,
    filterable: true,
    render: (value: any) => getStatusConfig(value, statusMap)
  }
}

export function buildActionsColumn<T>(actions: (row: T) => any) {
  return {
    key: 'actions' as keyof T,
    title: '',
    render: (_: any, row: T) => actions(row)
  }
}