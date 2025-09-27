"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDocumentStore, Document } from '@/stores/document-store'
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Search,
  Filter,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Grid,
  List,
  FolderOpen
} from 'lucide-react'

interface DocumentLibraryProps {
  filter?: string
  onViewDocument: (document: Document) => void
  onUploadClick: () => void
}

export function DocumentLibrary({ filter = 'all', onViewDocument, onUploadClick }: DocumentLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const { documents, removeDocument, searchDocuments, getDocumentsByCategory } = useDocumentStore()

  // Filter documents
  let filteredDocuments = filter === 'all'
    ? documents
    : filter === 'shared'
    ? documents.filter(d => d.sharedWith && d.sharedWith.length > 0)
    : getDocumentsByCategory(filter as Document['category'])

  // Apply search
  if (searchQuery) {
    filteredDocuments = searchDocuments(searchQuery)
  }

  // Sort documents
  filteredDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'date':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    }
  })

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return FileText
      case 'jpg':
      case 'png':
        return FileImage
      case 'xlsx':
        return FileSpreadsheet
      case 'ppt':
        return FileCode
      default:
        return FileText
    }
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return CheckCircle
      case 'rejected':
        return XCircle
      case 'expired':
        return AlertCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'text-green-600'
      case 'rejected':
        return 'text-destructive'
      case 'expired':
        return 'text-yellow-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDelete = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      removeDocument(documentId)
    }
  }

  if (filteredDocuments.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? `No documents match "${searchQuery}"`
              : 'Upload your first document to get started'}
          </p>
          <Button onClick={onUploadClick}>
            Upload Document
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((document) => {
            const Icon = getFileIcon(document.type)
            const StatusIcon = getStatusIcon(document.status)

            return (
              <Card
                key={document.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewDocument(document)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-6 w-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onViewDocument(document)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(document.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm truncate">{document.name}</h4>
                    {document.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatFileSize(document.size)}
                    </span>
                    <span className="text-muted-foreground">
                      {document.uploadedAt}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`h-3 w-3 ${getStatusColor(document.status)}`} />
                      <span className={`text-xs ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                    </div>
                    {document.version && document.version > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        v{document.version}
                      </Badge>
                    )}
                  </div>

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredDocuments.map((document) => {
              const Icon = getFileIcon(document.type)
              const StatusIcon = getStatusIcon(document.status)

              return (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 hover:bg-accent cursor-pointer"
                  onClick={() => onViewDocument(document)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{document.name}</h4>
                        {document.version && document.version > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            v{document.version}
                          </Badge>
                        )}
                      </div>
                      {document.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(document.size)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {document.uploadedAt}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {document.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(document.status)}`} />
                      <span className={`text-sm ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onViewDocument(document)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(document.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}