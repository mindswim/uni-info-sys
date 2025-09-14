"use client"

import { User, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UsersTableProps {
  data: TableData<User>
  loading?: boolean
  onUserSelect?: (user: User) => void
  onUserEdit?: (user: User) => void
  onUserView?: (user: User) => void
  onUserDelete?: (user: User) => void
}

export function UsersTable({ 
  data, 
  loading, 
  onUserSelect,
  onUserEdit,
  onUserView,
  onUserDelete
}: UsersTableProps) {

  const getRoleVariant = (roleName: string) => {
    const variants = {
      'administrator': 'destructive',
      'staff': 'default',
      'student': 'secondary',
      'instructor': 'default',
      'admin': 'destructive'
    } as const
    return variants[roleName.toLowerCase() as keyof typeof variants] || 'outline'
  }

  const columns: TableColumn<User>[] = [
    {
      key: 'profile',
      title: 'User',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.email}`} />
            <AvatarFallback className="text-sm">
              {row.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'roles',
      title: 'Roles',
      filterable: true,
      render: (_, row) => {
        const roleNames = row.role_names || []
        if (roleNames.length === 0) {
          return <Badge variant="outline">No roles</Badge>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roleNames.slice(0, 2).map((role: string) => (
              <Badge key={role} variant={getRoleVariant(role)} className="capitalize">
                {role}
              </Badge>
            ))}
            {roleNames.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{roleNames.length - 2}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'user_type',
      title: 'User Type',
      render: (_, row) => {
        if (row.student) {
          return <Badge variant="secondary">Student</Badge>
        }
        if (row.staff) {
          return <Badge variant="default">Staff</Badge>
        }
        return <Badge variant="outline">Basic User</Badge>
      }
    },
    {
      key: 'email_verified_at',
      title: 'Email Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Verified" : "Unverified"}
        </Badge>
      )
    },
    {
      key: 'permissions_count',
      title: 'Permissions',
      render: (_, row) => {
        const permissionCount = row.all_permissions?.length || 0
        return (
          <div className="text-center">
            <Badge variant="outline">{permissionCount} permissions</Badge>
          </div>
        )
      }
    },
    {
      key: 'password_algorithm',
      title: 'Security',
      render: (value) => (
        <div className="text-xs text-muted-foreground font-mono">
          {value || 'bcrypt'}
        </div>
      )
    },
    {
      key: 'last_activity',
      title: 'Last Activity',
      render: (_, row) => {
        // Mock last activity - would come from API/session data
        const activities = ['2 hours ago', '1 day ago', '3 days ago', '1 week ago', 'Never']
        const activity = activities[row.id % activities.length]
        return (
          <div className="text-sm text-muted-foreground">{activity}</div>
        )
      }
    },
    buildDateColumn('created_at', 'Created'),
    buildActionsColumn<User>((user) => (
      <TableActions
        onView={() => onUserView?.(user)}
        onEdit={() => onUserEdit?.(user)}
        onDelete={() => onUserDelete?.(user)}
        customActions={[
          {
            label: "Manage Roles",
            onClick: () => console.log("Manage roles for", user.name)
          },
          {
            label: "View Permissions",
            onClick: () => console.log("View permissions for", user.name)
          },
          {
            label: "Reset Password",
            onClick: () => console.log("Reset password for", user.name)
          },
          {
            label: user.email_verified_at ? "Revoke Email" : "Verify Email",
            onClick: () => console.log(user.email_verified_at ? "Revoke" : "Verify", "email for", user.name)
          },
          {
            label: "Login History",
            onClick: () => console.log("View login history for", user.name)
          },
          {
            label: "Impersonate User",
            onClick: () => console.log("Impersonate", user.name),
            destructive: false
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Users</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onUserSelect}
        selectable={true}
      />
    </div>
  )
}