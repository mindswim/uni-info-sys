"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react"
import { TableColumn, TableData, TableFilters } from "@/types/university"

interface DataTableProps<T> {
  data: TableData<T>
  columns: TableColumn<T>[]
  loading?: boolean
  onFiltersChange?: (filters: TableFilters) => void
  onRowSelect?: (row: T) => void
  selectable?: boolean
  actions?: (row: T) => React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  onFiltersChange,
  onRowSelect,
  selectable = false,
  actions
}: DataTableProps<T>) {
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    sort_by: "",
    sort_direction: "asc",
    filters: {}
  })
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => String(col.key)))
  )

  const handleFilterChange = (newFilters: Partial<TableFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const handleSort = (columnKey: string) => {
    const isCurrentlySorted = filters.sort_by === columnKey
    const newDirection = isCurrentlySorted && filters.sort_direction === "asc" ? "desc" : "asc"
    
    handleFilterChange({
      sort_by: columnKey,
      sort_direction: newDirection
    })
  }

  const handleSearch = (value: string) => {
    handleFilterChange({ search: value })
  }

  const handleRowSelection = (rowIndex: number, selected: boolean) => {
    const newSelected = new Set(selectedRows)
    if (selected) {
      newSelected.add(rowIndex)
    } else {
      newSelected.delete(rowIndex)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(data.data.map((_, index) => index)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const toggleColumnVisibility = (columnKey: string) => {
    const newVisible = new Set(visibleColumns)
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey)
    } else {
      newVisible.add(columnKey)
    }
    setVisibleColumns(newVisible)
  }

  const visibleColumnsList = columns.filter(col => visibleColumns.has(String(col.key)))

  const getSortIcon = (columnKey: string) => {
    if (filters.sort_by !== columnKey) return null
    return filters.sort_direction === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    )
  }

  const renderCellValue = (column: TableColumn<T>, value: any, row: T) => {
    if (column.render) {
      return column.render(value, row)
    }

    // Default rendering based on value type
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    }

    if (typeof value === "string" && value.includes("T") && value.includes(":")) {
      // Likely a timestamp
      return new Date(value).toLocaleDateString()
    }

    return String(value)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-80 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="border rounded-lg">
          <div className="h-12 bg-muted animate-pulse" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 border-t bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={String(column.key)}
                  className="capitalize"
                  checked={visibleColumns.has(String(column.key))}
                  onCheckedChange={() => toggleColumnVisibility(String(column.key))}
                >
                  {column.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedRows.size} selected
            </Badge>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.data.length && data.data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
              )}
              {visibleColumnsList.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={column.sortable ? "cursor-pointer select-none" : ""}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable && getSortIcon(String(column.key))}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnsList.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`
                    ${selectedRows.has(rowIndex) ? "bg-muted/50" : ""}
                    ${onRowSelect ? "cursor-pointer hover:bg-muted/30" : ""}
                  `}
                  onClick={() => onRowSelect?.(row)}
                >
                  {selectable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={(e) => handleRowSelection(rowIndex, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                  )}
                  {visibleColumnsList.map((column) => (
                    <TableCell key={String(column.key)}>
                      {renderCellValue(column, (row as any)[column.key], row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(data.page - 1) * data.per_page + 1} to{" "}
            {Math.min(data.page * data.per_page, data.total)} of {data.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange({ ...filters, page: data.page - 1 })}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                const pageNum = data.page <= 3 ? i + 1 : data.page - 2 + i
                if (pageNum > data.last_page) return null
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === data.page ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                    onClick={() => handleFilterChange({ ...filters, page: pageNum })}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange({ ...filters, page: data.page + 1 })}
              disabled={data.page >= data.last_page}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}