"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface CsvImportExportProps {
  entityName: string // e.g., "students", "courses"
  entityDisplayName: string // e.g., "Students", "Courses"
  importEndpoint: string // e.g., "/api/v1/students/csv/import"
  exportEndpoint: string // e.g., "/api/v1/students/csv/export"
  templateEndpoint: string // e.g., "/api/v1/students/csv/template"
  onImportComplete?: () => void // Callback to refresh data after import
}

export function CsvImportExport({
  entityName,
  entityDisplayName,
  importEndpoint,
  exportEndpoint,
  templateEndpoint,
  onImportComplete
}: CsvImportExportProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive"
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive"
      })
      return
    }

    setImporting(true)

    try {
      const token = sessionStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${importEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to import ${entityDisplayName}`)
      }

      toast({
        title: "Import Started",
        description: data.message || `${entityDisplayName} import has been queued. You'll be notified when complete.`,
      })

      setImportDialogOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh data after a delay to allow processing
      if (onImportComplete) {
        setTimeout(() => {
          onImportComplete()
        }, 3000)
      }

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || `Failed to import ${entityDisplayName}`,
        variant: "destructive"
      })
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)

    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${exportEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to export ${entityDisplayName}`)
      }

      // Decode base64 content and download
      const csvContent = atob(data.content)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Successful",
        description: `${entityDisplayName} exported successfully`,
      })

    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || `Failed to export ${entityDisplayName}`,
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${templateEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to download template')
      }

      // Decode base64 content and download
      const csvContent = atob(data.content)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Template Downloaded",
        description: "CSV template downloaded successfully",
      })

    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || 'Failed to download template',
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportDialogOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
        >
          <FileText className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import {entityDisplayName} from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import {entityDisplayName.toLowerCase()}. The import will be processed in the background.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your CSV file follows the correct format. Download the template if you need a reference.
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">CSV files only (MAX. 10MB)</p>
                      </div>
                      <input
                        id="csv-upload"
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>

                  {selectedFile && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false)
                setSelectedFile(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
