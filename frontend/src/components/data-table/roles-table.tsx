"use client"

import { Role, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface RolesTableProps {
  data: TableData<Role>
  loading?: boolean
  onRoleSelect?: (role: Role) => void
  onRoleEdit?: (role: Role) => void
  onRoleView?: (role: Role) => void
  onRoleDelete?: (role: Role) => void
}

export function RolesTable({ 
  data, 
  loading, 
  onRoleSelect,
  onRoleEdit,
  onRoleView,
  onRoleDelete
}: RolesTableProps) {

  const getRoleVariant = (roleName: string) => {
    const variants = {
      'administrator': 'destructive',
      'admin': 'destructive',
      'dean': 'default',
      'staff': 'default',
      'instructor': 'secondary',
      'student': 'secondary'
    } as const
    return variants[roleName.toLowerCase() as keyof typeof variants] || 'outline'
  }

  const columns: TableColumn<Role>[] = [
    {
      key: 'name',
      title: 'Role Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Badge variant={getRoleVariant(value)} className="capitalize">
            {value}
          </Badge>
        </div>
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
      key: 'user_count',
      title: 'Users',
      render: (_, row) => {
        const userCount = row.user_count || 0
        return (
          <div className="text-center">
            <Badge variant="outline">{userCount} users</Badge>
          </div>
        )
      }
    },
    {
      key: 'permission_count',
      title: 'Permissions',
      render: (_, row) => {
        const permissionCount = row.permission_count || 0
        return (
          <div className="text-center">
            <Badge variant={permissionCount > 10 ? "default" : permissionCount > 5 ? "secondary" : "outline"}>
              {permissionCount} permissions
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'key_permissions',
      title: 'Key Permissions',
      render: (_, row) => {
        // Mock key permissions - would come from API
        const keyPerms = {
          'administrator': ['manage_users', 'manage_system', 'view_all'],
          'dean': ['manage_faculty', 'approve_programs', 'view_reports'],
          'staff': ['manage_courses', 'view_students', 'update_records'],
          'instructor': ['manage_sections', 'grade_students', 'view_roster'],
          'student': ['view_courses', 'enroll', 'view_grades']
        }[row.name.toLowerCase()] || []
        
        return (
          <div className="flex flex-wrap gap-1">
            {keyPerms.slice(0, 2).map((perm: string) => (
              <Badge key={perm} variant="outline" className="text-xs">
                {perm}
              </Badge>
            ))}
            {keyPerms.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{keyPerms.length - 2}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'system_role',
      title: 'Type',
      render: (_, row) => {
        const systemRoles = ['administrator', 'admin', 'staff', 'student']
        const isSystemRole = systemRoles.includes(row.name.toLowerCase())
        return (
          <Badge variant={isSystemRole ? "default" : "secondary"}>
            {isSystemRole ? "System" : "Custom"}
          </Badge>
        )
      }
    },
    buildDateColumn('created_at', 'Created'),
    buildActionsColumn<Role>((role) => (
      <TableActions
        onView={() => onRoleView?.(role)}
        onEdit={() => onRoleEdit?.(role)}
        onDelete={() => onRoleDelete?.(role)}
        customActions={[
          {
            label: "Manage Permissions",
            onClick: () => console.log("Manage permissions for role", role.name)
          },
          {
            label: "View Users",
            onClick: () => console.log("View users with role", role.name)
          },
          {
            label: "Clone Role",
            onClick: () => console.log("Clone role", role.name)
          },
          {
            label: "Permission Report",
            onClick: () => console.log("Generate permission report for", role.name)
          },
          {
            label: "Audit Log",
            onClick: () => console.log("View audit log for role", role.name)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Roles</h2>
          <p className="text-muted-foreground">
            Manage user roles and access control
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onRoleSelect}
        selectable={true}
      />
    </div>
  )
}