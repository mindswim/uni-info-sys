"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, DollarSign, Pencil, Trash2, Filter } from 'lucide-react'
import { getAuthToken } from '@/lib/api-client'

interface TuitionRate {
  id: number
  program_id: number
  term_id: number
  student_type: string
  enrollment_status: string
  tuition_per_credit: string
  base_fee: string
  technology_fee: string | null
  activity_fee: string | null
  health_fee: string | null
  effective_date: string
  end_date: string | null
  is_active: boolean
  notes: string | null
  program?: { id: number; name: string }
  term?: { id: number; name: string }
}

interface Program {
  id: number
  name: string
}

interface Term {
  id: number
  name: string
}

const EMPTY_FORM = {
  program_id: '',
  term_id: '',
  student_type: 'domestic',
  enrollment_status: 'full_time',
  tuition_per_credit: '',
  base_fee: '',
  technology_fee: '',
  activity_fee: '',
  health_fee: '',
  effective_date: '',
  end_date: '',
  is_active: true,
  notes: '',
}

export function TuitionRatesTab() {
  const { toast } = useToast()

  const [rates, setRates] = useState<TuitionRate[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Filters
  const [filterProgram, setFilterProgram] = useState<string>('all')
  const [filterTerm, setFilterTerm] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<TuitionRate | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRate, setDeletingRate] = useState<TuitionRate | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }

      const [ratesRes, programsRes, termsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tuition-rates`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, { headers }),
      ])

      if (!ratesRes.ok) throw new Error('Failed to fetch tuition rates')

      const ratesData = await ratesRes.json()
      const programsData = programsRes.ok ? await programsRes.json() : { data: [] }
      const termsData = termsRes.ok ? await termsRes.json() : { data: [] }

      setRates(ratesData.data || ratesData)
      setPrograms(programsData.data || programsData)
      setTerms(termsData.data || termsData)
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch tuition rates', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const openDialog = (rate?: TuitionRate) => {
    if (rate) {
      setEditingRate(rate)
      setFormData({
        program_id: String(rate.program_id),
        term_id: String(rate.term_id),
        student_type: rate.student_type,
        enrollment_status: rate.enrollment_status,
        tuition_per_credit: rate.tuition_per_credit,
        base_fee: rate.base_fee,
        technology_fee: rate.technology_fee || '',
        activity_fee: rate.activity_fee || '',
        health_fee: rate.health_fee || '',
        effective_date: rate.effective_date?.split('T')[0] || '',
        end_date: rate.end_date?.split('T')[0] || '',
        is_active: rate.is_active,
        notes: rate.notes || '',
      })
    } else {
      setEditingRate(null)
      setFormData(EMPTY_FORM)
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.program_id || !formData.term_id || !formData.tuition_per_credit || !formData.base_fee || !formData.effective_date) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const token = getAuthToken()
      const url = editingRate
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tuition-rates/${editingRate.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tuition-rates`

      const body: Record<string, unknown> = {
        program_id: parseInt(formData.program_id),
        term_id: parseInt(formData.term_id),
        student_type: formData.student_type,
        enrollment_status: formData.enrollment_status,
        tuition_per_credit: parseFloat(formData.tuition_per_credit),
        base_fee: parseFloat(formData.base_fee),
        effective_date: formData.effective_date,
        is_active: formData.is_active,
      }
      if (formData.technology_fee) body.technology_fee = parseFloat(formData.technology_fee)
      if (formData.activity_fee) body.activity_fee = parseFloat(formData.activity_fee)
      if (formData.health_fee) body.health_fee = parseFloat(formData.health_fee)
      if (formData.end_date) body.end_date = formData.end_date
      if (formData.notes) body.notes = formData.notes

      const response = await fetch(url, {
        method: editingRate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save tuition rate')
      }

      toast({ title: 'Success', description: `Tuition rate ${editingRate ? 'updated' : 'created'} successfully` })
      setDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingRate) return
    setDeleting(true)
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tuition-rates/${deletingRate.id}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
      )
      if (!response.ok) throw new Error('Failed to delete')
      toast({ title: 'Success', description: 'Tuition rate deleted' })
      setDeleteDialogOpen(false)
      setDeletingRate(null)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (value: string | null) => {
    if (!value) return '--'
    return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const getProgramName = (id: number) => programs.find(p => p.id === id)?.name || `Program #${id}`
  const getTermName = (id: number) => terms.find(t => t.id === id)?.name || `Term #${id}`

  const filteredRates = rates.filter(rate => {
    if (filterProgram !== 'all' && String(rate.program_id) !== filterProgram) return false
    if (filterTerm !== 'all' && String(rate.term_id) !== filterTerm) return false
    if (filterType !== 'all' && rate.student_type !== filterType) return false
    if (filterActive === 'active' && !rate.is_active) return false
    if (filterActive === 'inactive' && rate.is_active) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const progName = getProgramName(rate.program_id).toLowerCase()
      const termName = getTermName(rate.term_id).toLowerCase()
      return progName.includes(q) || termName.includes(q) || rate.student_type.includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tuition Rates</h1>
          <p className="text-muted-foreground">Manage tuition and fee schedules by program, term, and student type</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Rate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rates</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rates</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rates.filter(r => r.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs Covered</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(rates.map(r => r.program_id)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterProgram} onValueChange={setFilterProgram}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Program" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterTerm} onValueChange={setFilterTerm}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Term" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terms</SelectItem>
            {terms.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="domestic">Domestic</SelectItem>
            <SelectItem value="international">International</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Schedule ({filteredRates.length})</CardTitle>
          <CardDescription>Tuition per credit and fees by program and term</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
            </div>
          ) : filteredRates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No tuition rates found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Program</th>
                    <th className="pb-3 font-medium">Term</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Per Credit</th>
                    <th className="pb-3 font-medium text-right">Base Fee</th>
                    <th className="pb-3 font-medium text-right">Tech Fee</th>
                    <th className="pb-3 font-medium">Active</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map((rate) => (
                    <tr key={rate.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="py-3 max-w-[200px] truncate">{rate.program?.name || getProgramName(rate.program_id)}</td>
                      <td className="py-3">{rate.term?.name || getTermName(rate.term_id)}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs capitalize">{rate.student_type}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs capitalize">{rate.enrollment_status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-3 text-right font-mono">{formatCurrency(rate.tuition_per_credit)}</td>
                      <td className="py-3 text-right font-mono">{formatCurrency(rate.base_fee)}</td>
                      <td className="py-3 text-right font-mono">{formatCurrency(rate.technology_fee)}</td>
                      <td className="py-3">
                        {rate.is_active
                          ? <Badge className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
                          : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDialog(rate)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setDeletingRate(rate); setDeleteDialogOpen(true) }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Edit Tuition Rate' : 'Create Tuition Rate'}</DialogTitle>
            <DialogDescription>Set tuition and fee amounts for a program-term combination</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Program *</Label>
                <Select value={formData.program_id} onValueChange={(v) => setFormData({ ...formData, program_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term *</Label>
                <Select value={formData.term_id} onValueChange={(v) => setFormData({ ...formData, term_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                  <SelectContent>
                    {terms.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Student Type *</Label>
                <Select value={formData.student_type} onValueChange={(v) => setFormData({ ...formData, student_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enrollment Status *</Label>
                <Select value={formData.enrollment_status} onValueChange={(v) => setFormData({ ...formData, enrollment_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tuition Per Credit ($) *</Label>
                <Input type="number" step="0.01" min="0" value={formData.tuition_per_credit} onChange={(e) => setFormData({ ...formData, tuition_per_credit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Base Fee ($) *</Label>
                <Input type="number" step="0.01" min="0" value={formData.base_fee} onChange={(e) => setFormData({ ...formData, base_fee: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Technology Fee ($)</Label>
                <Input type="number" step="0.01" min="0" value={formData.technology_fee} onChange={(e) => setFormData({ ...formData, technology_fee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Activity Fee ($)</Label>
                <Input type="number" step="0.01" min="0" value={formData.activity_fee} onChange={(e) => setFormData({ ...formData, activity_fee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Health Fee ($)</Label>
                <Input type="number" step="0.01" min="0" value={formData.health_fee} onChange={(e) => setFormData({ ...formData, health_fee: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Effective Date *</Label>
                <Input type="date" value={formData.effective_date} onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Active</label>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving...' : editingRate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tuition rate?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
