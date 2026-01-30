"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface AuditRecord {
  id: number
  user_type: string | null
  user_id: number | null
  event: string
  auditable_type: string
  auditable_id: number
  old_values: Record<string, unknown>
  new_values: Record<string, unknown>
  url: string | null
  ip_address: string | null
  user_agent: string | null
  tags: string | null
  created_at: string
  user?: { id: number; name: string; email: string } | null
}

const MODEL_TYPES = [
  'Student', 'Enrollment', 'CourseSection', 'AdmissionApplication',
  'Course', 'Program', 'Department', 'Faculty',
]

const EVENT_TYPES = ['created', 'updated', 'deleted']

export function AuditsTab() {
  const [audits, setAudits] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [modelFilter, setModelFilter] = useState<string>("all")
  const [eventFilter, setEventFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const fetchAudits = async () => {
    setLoading(true)
    const token = getAuthToken()
    const params = new URLSearchParams()
    params.set('per_page', '50')
    params.set('page', page.toString())
    if (modelFilter !== 'all') params.set('auditable_type', modelFilter)
    if (eventFilter !== 'all') params.set('event', eventFilter)
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/audits?${params}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      setAudits(data.data || [])
      setLastPage(data.last_page || 1)
    }
    setLoading(false)
  }

  useEffect(() => { fetchAudits() }, [modelFilter, eventFilter, dateFrom, dateTo, page])

  const shortModel = (type: string) => {
    return type.replace('App\\Models\\', '')
  }

  const eventBadge = (event: string) => {
    switch (event) {
      case 'created': return <Badge className="bg-green-600">created</Badge>
      case 'updated': return <Badge className="bg-blue-600">updated</Badge>
      case 'deleted': return <Badge variant="destructive">deleted</Badge>
      default: return <Badge variant="outline">{event}</Badge>
    }
  }

  const renderChanges = (audit: AuditRecord) => {
    const oldVals = audit.old_values || {}
    const newVals = audit.new_values || {}
    const allKeys = new Set([...Object.keys(oldVals), ...Object.keys(newVals)])

    if (allKeys.size === 0) return <p className="text-sm text-muted-foreground">No change details recorded</p>

    return (
      <div className="space-y-1">
        {Array.from(allKeys).map(key => (
          <div key={key} className="text-sm font-mono">
            <span className="font-semibold">{key}:</span>{' '}
            {audit.event === 'created' ? (
              <span className="text-green-600">{JSON.stringify(newVals[key])}</span>
            ) : audit.event === 'deleted' ? (
              <span className="text-red-600 line-through">{JSON.stringify(oldVals[key])}</span>
            ) : (
              <>
                <span className="text-red-600 line-through">{JSON.stringify(oldVals[key])}</span>
                {' -> '}
                <span className="text-green-600">{JSON.stringify(newVals[key])}</span>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={modelFilter} onValueChange={(v) => { setModelFilter(v); setPage(1) }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Model type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {MODEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} placeholder="From" />
        <Input type="date" className="w-40" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} placeholder="To" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : audits.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No audit records found</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map(audit => (
                    <>
                      <TableRow
                        key={audit.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setExpandedId(expandedId === audit.id ? null : audit.id)}
                      >
                        <TableCell>
                          {expandedId === audit.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="text-sm">{new Date(audit.created_at).toLocaleString()}</TableCell>
                        <TableCell>{audit.user?.name || 'System'}</TableCell>
                        <TableCell><Badge variant="outline">{shortModel(audit.auditable_type)}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">{audit.auditable_id}</TableCell>
                        <TableCell>{eventBadge(audit.event)}</TableCell>
                      </TableRow>
                      {expandedId === audit.id && (
                        <TableRow key={`${audit.id}-details`}>
                          <TableCell></TableCell>
                          <TableCell colSpan={5} className="bg-muted/50 p-4">
                            {renderChanges(audit)}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Page {page} of {lastPage}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
