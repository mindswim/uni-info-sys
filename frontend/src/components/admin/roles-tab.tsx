"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Shield, Key, Pencil, Trash2 } from 'lucide-react'
import { getAuthToken } from '@/lib/api-client'

interface Role {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  permissions?: Permission[]
  user_count?: number
}

interface Permission {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export function RolesTab() {
  const { toast } = useToast()

  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [savingPermissions, setSavingPermissions] = useState(false)

  // Role CRUD state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }

      const [rolesRes, permissionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/permissions`, { headers })
      ])

      if (!rolesRes.ok || !permissionsRes.ok) throw new Error('Failed to fetch data')

      const rolesData = await rolesRes.json()
      const permissionsData = await permissionsRes.json()

      const fetchedRoles = rolesData.data || rolesData
      setRoles(fetchedRoles)
      setPermissions(permissionsData.data || permissionsData)

      // Refresh selected role if it exists
      if (selectedRole) {
        const updated = fetchedRoles.find((r: Role) => r.id === selectedRole.id)
        setSelectedRole(updated || null)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch roles data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const openRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setRoleFormData({ name: role.name, description: role.description || '' })
    } else {
      setEditingRole(null)
      setRoleFormData({ name: '', description: '' })
    }
    setRoleDialogOpen(true)
  }

  const handleSaveRole = async () => {
    if (!roleFormData.name) {
      toast({ title: 'Validation Error', description: 'Role name is required', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const token = getAuthToken()
      const url = editingRole
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles/${editingRole.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles`

      const response = await fetch(url, {
        method: editingRole ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: roleFormData.name,
          description: roleFormData.description || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save role')
      }

      toast({ title: 'Success', description: `Role ${editingRole ? 'updated' : 'created'} successfully` })
      setRoleDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save role', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!deletingRole) return

    setDeleting(true)
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles/${deletingRole.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete role')
      }

      toast({ title: 'Success', description: 'Role deleted successfully' })
      setDeleteDialogOpen(false)
      setDeletingRole(null)
      if (selectedRole?.id === deletingRole.id) setSelectedRole(null)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete role', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const handleTogglePermission = async (permissionId: number) => {
    if (!selectedRole) return

    const currentPermIds = selectedRole.permissions?.map(p => p.id) || []
    const newPermIds = currentPermIds.includes(permissionId)
      ? currentPermIds.filter(id => id !== permissionId)
      : [...currentPermIds, permissionId]

    setSavingPermissions(true)
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles/${selectedRole.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: selectedRole.name,
            description: selectedRole.description || undefined,
            permission_ids: newPermIds
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update permissions')
      }

      // Optimistic update
      setSelectedRole({
        ...selectedRole,
        permissions: permissions.filter(p => newPermIds.includes(p.id))
      })

      fetchData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update permissions', variant: 'destructive' })
    } finally {
      setSavingPermissions(false)
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group permissions by prefix (e.g., "manage-students" -> "manage")
  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const parts = perm.name.split('-')
    const group = parts.length > 1 ? parts[0] : 'other'
    if (!acc[group]) acc[group] = []
    acc[group].push(perm)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage roles and assign permissions</p>
        </div>
        <Button onClick={() => openRoleDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedRole ? selectedRole.permissions?.length || 0 : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedRole ? 'permissions assigned' : 'select a role'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-panel layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left panel: Role list */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Roles</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No roles found</div>
              ) : (
                <div className="space-y-1">
                  {filteredRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRole?.id === role.id
                          ? 'bg-accent border border-primary/20'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{role.name}</h3>
                          {role.user_count !== undefined && (
                            <Badge variant="outline" className="text-xs">{role.user_count} users</Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {role.permissions?.length || 0} permissions
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); openRoleDialog(role) }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingRole(role)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right panel: Permission checklist */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {selectedRole ? `Permissions for "${selectedRole.name}"` : 'Permissions'}
              </CardTitle>
              <CardDescription>
                {selectedRole
                  ? 'Toggle permissions on or off. Changes are saved automatically.'
                  : 'Select a role from the left to manage its permissions.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedRole ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Shield className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm">Select a role to view and manage permissions</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => (
                    <div key={group}>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        {group}
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {perms.sort((a, b) => a.name.localeCompare(b.name)).map((permission) => {
                          const isChecked = selectedRole.permissions?.some(p => p.id === permission.id) || false
                          return (
                            <div
                              key={permission.id}
                              className={`flex items-start space-x-3 p-2.5 rounded-md border transition-colors ${
                                isChecked ? 'bg-primary/5 border-primary/20' : 'border-transparent hover:bg-accent/50'
                              }`}
                            >
                              <Checkbox
                                id={`perm-toggle-${permission.id}`}
                                checked={isChecked}
                                disabled={savingPermissions}
                                onCheckedChange={() => handleTogglePermission(permission.id)}
                              />
                              <label
                                htmlFor={`perm-toggle-${permission.id}`}
                                className="text-sm leading-tight cursor-pointer"
                              >
                                <span className="font-medium">{permission.name}</span>
                                {permission.description && (
                                  <span className="block text-xs text-muted-foreground mt-0.5">
                                    {permission.description}
                                  </span>
                                )}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <DialogDescription>
              {editingRole ? 'Update role details' : 'Add a new role to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name *</Label>
              <Input
                id="role-name"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                placeholder="e.g., department_head"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Textarea
                id="role-desc"
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                placeholder="Brief description of this role..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} disabled={submitting}>
              {submitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role &quot;{deletingRole?.name}&quot; and remove it from all users. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
