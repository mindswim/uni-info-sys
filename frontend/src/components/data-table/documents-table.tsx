"use client"

import { Document, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DocumentsTableProps {
  data: TableData<Document>
  loading?: boolean
  onDocumentSelect?: (document: Document) => void
  onDocumentEdit?: (document: Document) => void
  onDocumentView?: (document: Document) => void
  onDocumentDelete?: (document: Document) => void
}

export function DocumentsTable({ 
  data, 
  loading, 
  onDocumentSelect,
  onDocumentEdit,
  onDocumentView,
  onDocumentDelete
}: DocumentsTableProps) {

  const getDocumentTypeVariant = (type: string) => {
    const variants = {
      'transcript': 'default',
      'recommendation': 'secondary',
      'personal_statement': 'secondary',
      'test_scores': 'default',
      'id_document': 'outline',
      'other': 'outline'
    } as const
    return variants[type as keyof typeof variants] || 'outline'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('word')) return '📝'
    return '📁'
  }

  const columns: TableColumn<Document>[] = [
    {
      key: 'student',
      title: 'Student',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student?.student_number}`} />
            <AvatarFallback className="text-xs">
              {row.student?.first_name?.[0]}{row.student?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{row.student?.first_name} {row.student?.last_name}</div>
            <div className="text-xs text-muted-foreground">{row.student?.student_number}</div>
          </div>
        </div>
      )
    },
    {
      key: 'document_type',
      title: 'Document Type',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={getDocumentTypeVariant(value)} className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'file_info',
      title: 'File',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFileTypeIcon(row.mime_type)}</span>
          <div>
            <div className="font-medium text-sm max-w-32 truncate">{row.file_name}</div>
            <div className="text-xs text-muted-foreground">{formatFileSize(row.file_size)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'mime_type',
      title: 'File Type',
      render: (value) => (
        <div className="font-mono text-xs text-muted-foreground">{value}</div>
      )
    },
    {
      key: 'version',
      title: 'Version',
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <Badge variant="outline">v{value}</Badge>
        </div>
      )
    },
    {
      key: 'is_verified',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Verified" : "Pending"}
        </Badge>
      )
    },
    {
      key: 'file_health',
      title: 'File Health',
      render: (_, row) => {
        // Mock file health check
        const isHealthy = row.file_size > 0 && row.file_size < 10000000 // < 10MB
        return (
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {isHealthy ? "Good" : "Issue"}
          </Badge>
        )
      }
    },
    buildDateColumn('created_at', 'Uploaded'),
    buildActionsColumn<Document>((document) => (
      <TableActions
        onView={() => onDocumentView?.(document)}
        onEdit={() => onDocumentEdit?.(document)}
        onDelete={() => onDocumentDelete?.(document)}
        customActions={[
          {
            label: "Download File",
            onClick: () => console.log("Download", document.file_name)
          },
          {
            label: "Preview Document",
            onClick: () => console.log("Preview", document.file_name)
          },
          {
            label: document.is_verified ? "Re-verify" : "Verify Document",
            onClick: () => console.log(document.is_verified ? "Re-verify" : "Verify", document.file_name)
          },
          {
            label: "Upload New Version",
            onClick: () => console.log("Upload new version of", document.file_name)
          },
          {
            label: "Share Document",
            onClick: () => console.log("Share", document.file_name)
          },
          {
            label: "Document History",
            onClick: () => console.log("View history for", document.file_name)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Documents</h2>
          <p className="text-muted-foreground">
            Manage uploaded files and document verification
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onDocumentSelect}
        selectable={true}
      />
    </div>
  )
}