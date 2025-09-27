"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Printer,
  Mail,
  Calendar,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export interface ExportColumn {
  id: string
  label: string
  selected: boolean
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  columns: string[]
  includeHeaders: boolean
  dateFormat: string
  fileName?: string
  emailTo?: string
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  format: 'pdf' | 'excel'
  sections: string[]
  filters?: any
}

interface DataExportProps {
  data: any[]
  columns: ExportColumn[]
  onExport: (options: ExportOptions) => void
  reportTemplates?: ReportTemplate[]
  onGenerateReport?: (templateId: string) => void
  hasFilters?: boolean
  filterCount?: number
}

export function DataExport({
  data,
  columns,
  onExport,
  reportTemplates = [],
  onGenerateReport,
  hasFilters = false,
  filterCount = 0
}: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [exportProgress, setExportProgress] = useState(0)

  const [format, setFormat] = useState<ExportOptions['format']>('csv')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.filter(c => c.selected).map(c => c.id)
  )
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy')
  const [fileName, setFileName] = useState('')
  const [emailTo, setEmailTo] = useState('')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [selectedReport, setSelectedReport] = useState<string>('')

  const formatIcons = {
    csv: FileSpreadsheet,
    excel: FileSpreadsheet,
    pdf: FileText,
    json: FileJson
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportStatus('idle')

    // Simulate export progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setExportProgress(i)
    }

    const options: ExportOptions = {
      format,
      columns: selectedColumns,
      includeHeaders,
      dateFormat,
      fileName: fileName || `export_${new Date().toISOString().split('T')[0]}`,
      emailTo: emailTo || undefined,
      schedule: scheduleEnabled ? {
        frequency: scheduleFrequency,
        time: scheduleTime
      } : undefined
    }

    try {
      onExport(options)
      setExportStatus('success')
      setTimeout(() => {
        setIsOpen(false)
        setExportStatus('idle')
        setIsExporting(false)
      }, 1500)
    } catch (error) {
      setExportStatus('error')
      setIsExporting(false)
    }
  }

  const handleGenerateReport = () => {
    if (selectedReport && onGenerateReport) {
      onGenerateReport(selectedReport)
      setIsOpen(false)
    }
  }

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    )
  }

  const selectAllColumns = () => {
    setSelectedColumns(columns.map(c => c.id))
  }

  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  const FormatIcon = formatIcons[format]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Data & Generate Reports</DialogTitle>
          <DialogDescription>
            Export your data in various formats or generate comprehensive reports
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="report" disabled={reportTemplates.length === 0}>
              Generate Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            {/* Export Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="text-sm">
                <p className="font-medium">{data.length} records to export</p>
                {hasFilters && filterCount > 0 && (
                  <p className="text-muted-foreground">
                    {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
                  </p>
                )}
              </div>
              <Badge variant="secondary">
                {selectedColumns.length} / {columns.length} columns
              </Badge>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label>Export Format</Label>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportOptions['format'])}>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="excel" />
                    <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                      <FileJson className="h-4 w-4" />
                      JSON
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Column Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Columns to Export</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllColumns}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAllColumns}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {columns.map(column => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-export-${column.id}`}
                      checked={selectedColumns.includes(column.id)}
                      onCheckedChange={() => handleColumnToggle(column.id)}
                    />
                    <Label
                      htmlFor={`col-export-${column.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-headers"
                  checked={includeHeaders}
                  onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
                />
                <Label htmlFor="include-headers" className="text-sm font-normal">
                  Include column headers
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file-name">File Name (optional)</Label>
                  <Input
                    id="file-name"
                    placeholder="export_data"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                      <SelectItem value="iso">ISO 8601</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email Option */}
              <div className="space-y-2">
                <Label htmlFor="email-to">Email To (optional)</Label>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-3" />
                  <Input
                    id="email-to"
                    type="email"
                    placeholder="email@example.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Schedule Export */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schedule-export"
                    checked={scheduleEnabled}
                    onCheckedChange={(checked) => setScheduleEnabled(checked as boolean)}
                  />
                  <Label htmlFor="schedule-export" className="text-sm font-normal">
                    Schedule recurring export
                  </Label>
                </div>

                {scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={scheduleFrequency} onValueChange={(v) => setScheduleFrequency(v as any)}>
                        <SelectTrigger id="frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule-time">Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export Status */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Preparing export...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}

            {exportStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Export completed successfully!
                </AlertDescription>
              </Alert>
            )}

            {exportStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Export failed. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            {reportTemplates.length > 0 ? (
              <>
                <div className="space-y-3">
                  <Label>Select Report Template</Label>
                  <RadioGroup value={selectedReport} onValueChange={setSelectedReport}>
                    <div className="space-y-2">
                      {reportTemplates.map(template => (
                        <div key={template.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                          <Label htmlFor={template.id} className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {template.format.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {template.sections.length} sections
                                </Badge>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {selectedReport && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This report will include all filtered data and generate a comprehensive
                      document based on the selected template.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No report templates available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {isExporting ? (
            <Button disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </Button>
          ) : (
            <Button onClick={handleExport}>
              <FormatIcon className="h-4 w-4 mr-2" />
              Export as {format.toUpperCase()}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}