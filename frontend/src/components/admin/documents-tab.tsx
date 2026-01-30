"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface Document {
  id: number
  student_id: number
  document_type: string
  file_name: string
  status: string
  created_at: string
  student?: {
    id: number
    student_id: string
    user?: { name: string }
  }
}

export function DocumentsTab() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [processing, setProcessing] = useState<number | null>(null)

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingDoc, setRejectingDoc] = useState<Document | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const fetchDocuments = async () => {
    setLoading(true)
    const token = getAuthToken()
    // Fetch all students with documents -- we need to iterate through students
    // Since there's no global documents endpoint, fetch admission applications to get student IDs with documents
    // Actually, let's fetch students and their documents
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students?per_page=100`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      if (!res.ok) throw new Error('Failed to fetch students')
      const studentsData = await res.json()
      const students = studentsData.data || []

      const allDocs: Document[] = []
      // Fetch documents for each student in parallel (batch)
      const docPromises = students.map(async (student: any) => {
        const docRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/${student.id}/documents`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        })
        if (docRes.ok) {
          const docData = await docRes.json()
          const docs = docData.data || []
          return docs.map((d: any) => ({ ...d, student_id: student.id, student }))
        }
        return []
      })
      const results = await Promise.all(docPromises)
      results.forEach(docs => allDocs.push(...docs))

      setDocuments(allDocs)
    } catch (err) {
      toast({ title: "Error", description: "Failed to load documents", variant: "destructive" })
    }
    setLoading(false)
  }

  useEffect(() => { fetchDocuments() }, [])

  const filteredDocs = statusFilter === 'all'
    ? documents
    : documents.filter(d => d.status === statusFilter)

  const handleVerify = async (doc: Document) => {
    setProcessing(doc.id)
    const token = getAuthToken()
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/${doc.student_id}/documents/${doc.id}/verify`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        }
      )
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to verify')
      toast({ title: "Verified", description: "Document has been verified" })
      fetchDocuments()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!rejectingDoc) return
    setProcessing(rejectingDoc.id)
    const token = getAuthToken()
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/${rejectingDoc.student_id}/documents/${rejectingDoc.id}/reject`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectReason }),
        }
      )
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to reject')
      toast({ title: "Rejected", description: "Document has been rejected" })
      setRejectDialogOpen(false)
      setRejectingDoc(null)
      setRejectReason("")
      fetchDocuments()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'verified': return <Badge className="bg-green-600">Verified</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.student?.user?.name || doc.student?.student_id || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{doc.document_type}</Badge></TableCell>
                    <TableCell className="max-w-48 truncate">{doc.file_name}</TableCell>
                    <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{statusBadge(doc.status)}</TableCell>
                    <TableCell>
                      {doc.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            disabled={processing === doc.id}
                            onClick={() => handleVerify(doc)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            disabled={processing === doc.id}
                            onClick={() => { setRejectingDoc(doc); setRejectDialogOpen(true) }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this document</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing !== null}>
              {processing !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
