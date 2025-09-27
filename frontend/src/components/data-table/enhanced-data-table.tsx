"use client"

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { AdvancedFilter, FilterField, FilterValue, FilterPreset } from '@/components/filters/advanced-filter'
import { DataExport, ExportColumn, ExportOptions, ReportTemplate } from '@/components/filters/data-export'
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter
} from 'lucide-react'

export interface Column<T> {
  id: string
  label: string
  accessor: keyof T | ((item: T) => any)
  sortable?: boolean
  searchable?: boolean
  filterable?: boolean
  visible?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

export interface EnhancedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  description?: string
  searchPlaceholder?: string
  filterFields?: FilterField[]
  filterPresets?: FilterPreset[]
  reportTemplates?: ReportTemplate[]
  onRowSelect?: (selectedRows: T[]) => void
  onRowAction?: (action: string, item: T) => void
  actions?: { label: string; icon?: React.ReactNode; onClick: (item: T) => void }[]
  loading?: boolean
}

export function EnhancedDataTable<T extends { id: string | number }>({
  data,
  columns: initialColumns,
  title,
  description,
  searchPlaceholder = "Search...",
  filterFields = [],
  filterPresets = [],
  reportTemplates = [],
  onRowSelect,
  onRowAction,
  actions = [],
  loading = false
}: EnhancedDataTableProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  const [filterValues, setFilterValues] = useState<FilterValue>({})
  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(initialColumns.map(col => [col.id, col.visible !== false]))
  )
  const [savedFilterPresets, setSavedFilterPresets] = useState<FilterPreset[]>(filterPresets)

  // Visible columns
  const visibleColumns = initialColumns.filter(col => columnVisibility[col.id] !== false)

  // Apply search filter
  const searchFilteredData = useMemo(() => {
    if (!searchQuery) return data

    const query = searchQuery.toLowerCase()
    return data.filter(item => {
      return visibleColumns.some(column => {
        if (!column.searchable && column.searchable !== undefined) return false

        const value = typeof column.accessor === 'function'
          ? column.accessor(item)
          : item[column.accessor as keyof T]

        return String(value).toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, visibleColumns])

  // Apply advanced filters
  const filteredData = useMemo(() => {
    let result = searchFilteredData

    Object.entries(filterValues).forEach(([fieldId, value]) => {
      if (value === null || value === undefined || value === '') return

      const field = filterFields.find(f => f.id === fieldId)
      if (!field) return

      result = result.filter(item => {
        const itemValue = (item as any)[fieldId]

        switch (field.type) {
          case 'text':
            return String(itemValue).toLowerCase().includes(String(value).toLowerCase())

          case 'select':
            return itemValue === value

          case 'multiselect':
            return Array.isArray(value) && value.includes(itemValue)

          case 'number':
            return Number(itemValue) === Number(value)

          case 'range':
            const numValue = Number(itemValue)
            return numValue >= value.min && numValue <= value.max

          case 'date':
            return new Date(itemValue).toDateString() === new Date(value).toDateString()

          case 'daterange':
            const date = new Date(itemValue)
            const from = value.from ? new Date(value.from) : null
            const to = value.to ? new Date(value.to) : null
            return (!from || date >= from) && (!to || date <= to)

          case 'boolean':
            return Boolean(itemValue) === Boolean(value)

          default:
            return true
        }
      })
    })

    return result
  }, [searchFilteredData, filterValues, filterFields])

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    const column = visibleColumns.find(col => col.id === sortColumn)
    if (!column) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = typeof column.accessor === 'function'
        ? column.accessor(a)
        : a[column.accessor as keyof T]
      const bValue = typeof column.accessor === 'function'
        ? column.accessor(b)
        : b[column.accessor as keyof T]

      if (aValue === bValue) return 0

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1
      } else {
        return aValue > bValue ? -1 : 1
      }
    })
  }, [filteredData, sortColumn, sortDirection, visibleColumns])

  // Handlers
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map(item => item.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows)
    if (checked) {
      newSelectedRows.add(id)
    } else {
      newSelectedRows.delete(id)
    }
    setSelectedRows(newSelectedRows)

    if (onRowSelect) {
      const selected = sortedData.filter(item => newSelectedRows.has(item.id))
      onRowSelect(selected)
    }
  }

  const handleExport = (options: ExportOptions) => {
    // In a real app, this would generate the actual export
    console.log('Exporting data with options:', options)
    console.log('Data to export:', sortedData)
  }

  const handleGenerateReport = (templateId: string) => {
    // In a real app, this would generate the report
    console.log('Generating report with template:', templateId)
    console.log('Data for report:', sortedData)
  }

  const handleSaveFilterPreset = (name: string, filters: FilterValue) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters
    }
    setSavedFilterPresets([...savedFilterPresets, newPreset])
  }

  const handleDeleteFilterPreset = (id: string) => {
    setSavedFilterPresets(savedFilterPresets.filter(p => p.id !== id))
  }

  const handleResetFilters = () => {
    setFilterValues({})
    setSearchQuery('')
  }

  const exportColumns: ExportColumn[] = visibleColumns.map(col => ({
    id: col.id,
    label: col.label,
    selected: true
  }))

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />
  }

  const activeFilterCount = Object.values(filterValues).filter(v =>
    v !== undefined && v !== null && v !== '' &&
    (Array.isArray(v) ? v.length > 0 : true)
  ).length

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {sortedData.length} / {data.length} records
              </Badge>
              {selectedRows.size > 0 && (
                <Badge variant="default">
                  {selectedRows.size} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Advanced Filters */}
            {filterFields.length > 0 && (
              <AdvancedFilter
                fields={filterFields}
                values={filterValues}
                onChange={setFilterValues}
                onReset={handleResetFilters}
                presets={savedFilterPresets}
                onSavePreset={handleSaveFilterPreset}
                onDeletePreset={handleDeleteFilterPreset}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                availableColumns={initialColumns.map(col => ({
                  id: col.id,
                  label: col.label
                }))}
              />
            )}
          </div>

          {/* Export */}
          <DataExport
            data={sortedData}
            columns={exportColumns}
            onExport={handleExport}
            reportTemplates={reportTemplates}
            onGenerateReport={handleGenerateReport}
            hasFilters={activeFilterCount > 0 || searchQuery !== ''}
            filterCount={activeFilterCount}
          />
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {onRowSelect && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      indeterminate={selectedRows.size > 0 && selectedRows.size < sortedData.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {visibleColumns.map(column => (
                  <TableHead key={column.id}>
                    {column.sortable !== false ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.id)}
                        className="-ml-3"
                      >
                        {column.label}
                        {getSortIcon(column.id)}
                      </Button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
                {(actions.length > 0 || onRowAction) && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + (onRowSelect ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                    <div className="text-center py-8">Loading...</div>
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + (onRowSelect ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery || activeFilterCount > 0
                        ? 'No results found. Try adjusting your filters.'
                        : 'No data available.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map(item => (
                  <TableRow key={item.id}>
                    {onRowSelect && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(item.id)}
                          onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map(column => {
                      const value = typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : item[column.accessor as keyof T]

                      return (
                        <TableCell key={column.id}>
                          {column.render ? column.render(value, item) : String(value)}
                        </TableCell>
                      )
                    })}
                    {(actions.length > 0 || onRowAction) && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {actions.map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => action.onClick(item)}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                            {onRowAction && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onRowAction('view', item)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRowAction('edit', item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRowAction('delete', item)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {sortedData.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {sortedData.length} of {data.length} results
              {(searchQuery || activeFilterCount > 0) && ' (filtered)'}
            </p>
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
                </p>
                <Button variant="outline" size="sm" onClick={() => setSelectedRows(new Set())}>
                  Clear selection
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}