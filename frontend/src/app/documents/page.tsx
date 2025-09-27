"use client"

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { DocumentLibrary } from '@/components/documents/document-library'
import { DocumentUploader } from '@/components/documents/document-uploader'
import { DocumentViewer } from '@/components/documents/document-viewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Upload,
  FolderOpen,
  Download,
  Share2,
  Clock,
  AlertCircle,
  CheckCircle,
  Shield,
  HardDrive
} from 'lucide-react'
import { useDocumentStore } from '@/stores/document-store'

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Documents', href: '/documents' }
]

export default function DocumentsPage() {
  const [activeView, setActiveView] = useState<'library' | 'upload' | 'viewer'>('library')
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  const {
    documents,
    recentDocuments,
    storageUsed,
    storageLimit,
    pendingUploads
  } = useDocumentStore()

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc)
    setActiveView('viewer')
  }

  const storagePercentage = (storageUsed / storageLimit) * 100

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Center</h1>
            <p className="text-muted-foreground mt-1">
              Manage your academic documents, transcripts, and submissions
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setActiveView('upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>

        {/* Storage & Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                {recentDocuments.length} uploaded this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(storageUsed / 1024 / 1024).toFixed(1)} MB
              </div>
              <div className="mt-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      storagePercentage > 80 ? 'bg-destructive' :
                      storagePercentage > 60 ? 'bg-yellow-500' :
                      'bg-primary'
                    }`}
                    style={{ width: `${storagePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(storageLimit / 1024 / 1024).toFixed(0)} MB limit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUploads}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Shared With Me</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                From instructors & advisors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Document Requirements Alert */}
        {pendingUploads > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have {pendingUploads} required document(s) pending upload.
              Please submit them before the deadline to complete your registration.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {activeView === 'library' && (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="academic">Academic Records</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <DocumentLibrary
                filter="all"
                onViewDocument={handleViewDocument}
                onUploadClick={() => setActiveView('upload')}
              />
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <DocumentLibrary
                filter="academic"
                onViewDocument={handleViewDocument}
                onUploadClick={() => setActiveView('upload')}
              />
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <DocumentLibrary
                filter="financial"
                onViewDocument={handleViewDocument}
                onUploadClick={() => setActiveView('upload')}
              />
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <DocumentLibrary
                filter="assignments"
                onViewDocument={handleViewDocument}
                onUploadClick={() => setActiveView('upload')}
              />
            </TabsContent>

            <TabsContent value="forms" className="space-y-4">
              <DocumentLibrary
                filter="forms"
                onViewDocument={handleViewDocument}
                onUploadClick={() => setActiveView('upload')}
              />
            </TabsContent>

            <TabsContent value="shared" className="space-y-4">
              <DocumentLibrary
                filter="shared"
                onViewDocument={handleViewDocument}
                onUploadClick={() => setActiveView('upload')}
              />
            </TabsContent>
          </Tabs>
        )}

        {activeView === 'upload' && (
          <DocumentUploader
            onClose={() => setActiveView('library')}
            onUploadComplete={() => {
              setActiveView('library')
            }}
          />
        )}

        {activeView === 'viewer' && selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => {
              setActiveView('library')
              setSelectedDocument(null)
            }}
          />
        )}

        {/* Quick Access Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDocuments.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleViewDocument(doc)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.uploadedAt} • {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Document Security</p>
                <p className="text-xs text-muted-foreground">
                  All documents are encrypted and stored securely. Only authorized personnel can access your documents.
                  Documents are automatically backed up and retained according to university policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}