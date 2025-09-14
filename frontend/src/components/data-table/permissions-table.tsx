"use client"

import { Permission, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface PermissionsTableProps {
  data: TableData<Permission>
  loading?: boolean
  onPermissionSelect?: (permission: Permission) => void
  onPermissionEdit?: (permission: Permission) => void
  onPermissionView?: (permission: Permission) => void
  onPermissionDelete?: (permission: Permission) => void
}

export function PermissionsTable({ 
  data, 
  loading, 
  onPermissionSelect,
  onPermissionEdit,
  onPermissionView,
  onPermissionDelete
}: PermissionsTableProps) {

  const getPermissionCategory = (permissionName: string) => {
    if (permissionName.includes('manage') || permissionName.includes('create') || permissionName.includes('delete')) {
      return { category: 'Administrative', variant: 'destructive' as const }
    }
    if (permissionName.includes('edit') || permissionName.includes('update')) {
      return { category: 'Modify', variant: 'default' as const }
    }
    if (permissionName.includes('view') || permissionName.includes('read')) {
      return { category: 'Read-Only', variant: 'secondary' as const }
    }
    return { category: 'Other', variant: 'outline' as const }
  }

  const getPermissionScope = (permissionName: string) => {
    if (permissionName.includes('system') || permissionName.includes('admin')) return 'System'
    if (permissionName.includes('user') || permissionName.includes('student') || permissionName.includes('staff')) return 'Users'
    if (permissionName.includes('course') || permissionName.includes('program') || permissionName.includes('enrollment')) return 'Academic'
    if (permissionName.includes('application') || permissionName.includes('admission')) return 'Admissions'
    if (permissionName.includes('building') || permissionName.includes('room')) return 'Infrastructure'
    return 'General'
  }

  const columns: TableColumn<Permission>[] = [
    {
      key: 'name',
      title: 'Permission Name',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-medium">{value}</div>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="text-sm text-muted-foreground max-w-md">
          {value || 'No description provided'}
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      filterable: true,
      render: (_, row) => {
        const { category, variant } = getPermissionCategory(row.name)
        return <Badge variant={variant}>{category}</Badge>
      }
    },
    {
      key: 'scope',
      title: 'Scope',
      filterable: true,
      render: (_, row) => {
        const scope = getPermissionScope(row.name)
        return <Badge variant="outline">{scope}</Badge>
      }
    },
    {
      key: 'role_count',
      title: 'Assigned Roles',
      render: (_, row) => {
        const roleCount = row.role_count || 0
        return (
          <div className="text-center">
            <Badge variant={roleCount > 5 ? "default" : roleCount > 2 ? "secondary" : "outline"}>
              {roleCount} roles
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'usage_frequency',
      title: 'Usage',
      render: (_, row) => {
        // Mock usage frequency based on permission type
        const highUsage = ['view_students', 'view_courses', 'enroll_courses', 'view_grades']
        const mediumUsage = ['edit_profile', 'manage_courses', 'grade_students']
        const isHighUsage = highUsage.some(perm => row.name.includes(perm))
        const isMediumUsage = mediumUsage.some(perm => row.name.includes(perm))
        
        const frequency = isHighUsage ? 'High' : isMediumUsage ? 'Medium' : 'Low'
        const variant = frequency === 'High' ? 'default' : frequency === 'Medium' ? 'secondary' : 'outline'
        
        return <Badge variant={variant}>{frequency}</Badge>
      }
    },
    {
      key: 'security_level',
      title: 'Security Level',
      render: (_, row) => {
        const { category } = getPermissionCategory(row.name)
        const level = category === 'Administrative' ? 'Critical' : 
                     category === 'Modify' ? 'High' : 
                     category === 'Read-Only' ? 'Standard' : 'Standard'
        const variant = level === 'Critical' ? 'destructive' : 
                       level === 'High' ? 'default' : 'secondary'
        
        return <Badge variant={variant}>{level}</Badge>
      }
    },
    buildDateColumn('created_at', 'Created'),
    buildActionsColumn<Permission>((permission) => (
      <TableActions
        onView={() => onPermissionView?.(permission)}
        onEdit={() => onPermissionEdit?.(permission)}
        onDelete={() => onPermissionDelete?.(permission)}
        customActions={[
          {
            label: "View Assigned Roles",
            onClick: () => console.log("View roles with permission", permission.name)
          },
          {
            label: "Clone Permission",
            onClick: () => console.log("Clone permission", permission.name)
          },
          {
            label: "Usage Analytics",
            onClick: () => console.log("View usage analytics for", permission.name)
          },
          {
            label: "Security Audit",
            onClick: () => console.log("Run security audit for", permission.name)
          },
          {
            label: "Permission Dependencies",
            onClick: () => console.log("View dependencies for", permission.name)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Permissions</h2>
          <p className="text-muted-foreground">
            Manage granular access permissions and security controls
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onPermissionSelect}
        selectable={true}
      />
    </div>
  )
}