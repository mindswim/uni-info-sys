"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Document } from '@/stores/document-store'
import {
  X,
  Download,
  Share2,
  Printer,
  Edit,
  Trash2,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Shield,
  Eye,
  Copy,
  ExternalLink,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DocumentViewerProps {
  document: Document
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('preview')

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

  const StatusIcon = getStatusIcon(document.status)

  // Mock version history
  const versionHistory = [
    {
      version: document.version || 1,
      date: document.uploadedAt,
      user: document.uploadedBy,
      changes: 'Current version',
      current: true
    },
    ...(document.version && document.version > 1 ? [
      {
        version: document.version - 1,
        date: '2024-03-10',
        user: document.uploadedBy,
        changes: 'Updated content and formatting',
        current: false
      }
    ] : [])
  ]

  // Mock activity log
  const activityLog = [
    {
      action: 'Uploaded',
      user: document.uploadedBy,
      date: document.uploadedAt,
      icon: Upload
    },
    {
      action: 'Verified',
      user: 'System',
      date: document.uploadedAt,
      icon: CheckCircle
    },
    {
      action: 'Viewed',
      user: 'Current User',
      date: 'Just now',
      icon: Eye
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{document.name}</CardTitle>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(document.status)}`} />
                    <span className={`text-sm ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>
                  {document.version && document.version > 1 && (
                    <Badge variant="secondary">v{document.version}</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(document.size)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-4 h-[600px]">
            {/* Document Preview */}
            <div className="col-span-3 border-r">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <div className="border-b px-4">
                  <TabsList className="h-12 bg-transparent">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="preview" className="h-full p-0 mt-0">
                  <div className="h-full flex items-center justify-center bg-muted/10">
                    <div className="text-center">
                      <FileText className="h-24 w-24 text-muted-foreground/20 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Preview would be displayed here for supported file types
                      </p>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Download to View
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Document Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">File Name</span>
                          <span className="text-sm font-medium">{document.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">File Type</span>
                          <span className="text-sm font-medium">{document.type.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">File Size</span>
                          <span className="text-sm font-medium">{formatFileSize(document.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Category</span>
                          <Badge variant="outline">{document.category}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Uploaded By</span>
                          <span className="text-sm font-medium">{document.uploadedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Upload Date</span>
                          <span className="text-sm font-medium">{document.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    {document.description && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-3">Description</h3>
                          <p className="text-sm text-muted-foreground">{document.description}</p>
                        </div>
                      </>
                    )}

                    {document.metadata && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-3">Metadata</h3>
                          <div className="space-y-2">
                            {Object.entries(document.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-sm font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="versions" className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Version History</h3>
                    {versionHistory.map((version) => (
                      <div
                        key={version.version}
                        className={`p-4 rounded-lg border ${
                          version.current ? 'bg-primary/5 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Version {version.version}</span>
                              {version.current && (
                                <Badge className="text-xs">Current</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {version.changes}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {version.user}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {version.date}
                              </span>
                            </div>
                          </div>
                          {!version.current && (
                            <Button variant="outline" size="sm">
                              Restore
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Activity Log</h3>
                    <div className="space-y-3">
                      {activityLog.map((activity, index) => {
                        const Icon = activity.icon
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <Icon className="h-3 w-3" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium">{activity.user}</span>{' '}
                                {activity.action.toLowerCase()} this document
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.date}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="p-4 space-y-6">
              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared With */}
              {document.sharedWith && document.sharedWith.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Shared With</h4>
                  <div className="space-y-2">
                    {document.sharedWith.map((user) => (
                      <div key={user} className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{user}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security */}
              <div>
                <h4 className="text-sm font-medium mb-3">Security</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <span>Encrypted storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <History className="h-3 w-3" />
                    <span>Version controlled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}