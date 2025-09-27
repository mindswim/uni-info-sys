"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { Calendar } from '@/components/ui/calendar'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Filter,
  X,
  Save,
  RotateCcw,
  Calendar as CalendarIcon,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  Eye,
  EyeOff,
  Columns
} from 'lucide-react'

export interface FilterField {
  id: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'range' | 'boolean'
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
}

export interface FilterValue {
  [key: string]: any
}

export interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: FilterValue
  isDefault?: boolean
}

interface AdvancedFilterProps {
  fields: FilterField[]
  values: FilterValue
  onChange: (values: FilterValue) => void
  onReset?: () => void
  presets?: FilterPreset[]
  onSavePreset?: (name: string, filters: FilterValue) => void
  onDeletePreset?: (id: string) => void
  columnVisibility?: { [key: string]: boolean }
  onColumnVisibilityChange?: (visibility: { [key: string]: boolean }) => void
  availableColumns?: { id: string; label: string }[]
}

export function AdvancedFilter({
  fields,
  values,
  onChange,
  onReset,
  presets = [],
  onSavePreset,
  onDeletePreset,
  columnVisibility,
  onColumnVisibilityChange,
  availableColumns = []
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const activeFilterCount = Object.values(values).filter(v =>
    v !== undefined && v !== null && v !== '' &&
    (Array.isArray(v) ? v.length > 0 : true)
  ).length

  const handleFieldChange = (fieldId: string, value: any) => {
    onChange({ ...values, [fieldId]: value })
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      onChange(preset.filters)
      setSelectedPreset(presetId)
    }
  }

  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName, values)
      setPresetName('')
      setShowSavePreset(false)
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
      setSelectedPreset(null)
    }
  }

  const renderFilterField = (field: FilterField) => {
    const value = values[field.id]

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id={field.id}
                placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
                value={value || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        )

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={value || ''}
              onValueChange={(v) => handleFieldChange(field.id, v)}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {value && value.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {value.slice(0, 2).map((v: string) => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {field.options?.find(o => o.value === v)?.label || v}
                        </Badge>
                      ))}
                      {value.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{value.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select...</span>
                  )}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2">
                <div className="space-y-2">
                  {field.options?.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.id}-${option.value}`}
                        checked={value?.includes(option.value) || false}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...(value || []), option.value]
                            : (value || []).filter((v: string) => v !== option.value)
                          handleFieldChange(field.id, newValue)
                        }}
                      />
                      <Label
                        htmlFor={`${field.id}-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )

      case 'date':
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleFieldChange(field.id, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )

      case 'daterange':
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !value?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.from ? format(new Date(value.from), 'PP') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.from ? new Date(value.from) : undefined}
                    onSelect={(date) => handleFieldChange(field.id, {
                      ...value,
                      from: date?.toISOString()
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !value?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.to ? format(new Date(value.to), 'PP') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.to ? new Date(value.to) : undefined}
                    onSelect={(date) => handleFieldChange(field.id, {
                      ...value,
                      to: date?.toISOString()
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value ? Number(e.target.value) : null)}
              min={field.min}
              max={field.max}
            />
          </div>
        )

      case 'range':
        return (
          <div className="space-y-2">
            <Label>{field.label}</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{field.min || 0}</span>
                <span className="font-medium">{value?.min || field.min || 0} - {value?.max || field.max || 100}</span>
                <span>{field.max || 100}</span>
              </div>
              <div className="space-y-2">
                <Slider
                  min={field.min || 0}
                  max={field.max || 100}
                  step={1}
                  value={[value?.min || field.min || 0, value?.max || field.max || 100]}
                  onValueChange={([min, max]) => handleFieldChange(field.id, { min, max })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )

      case 'boolean':
        return (
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor={field.id} className="flex-1">{field.label}</Label>
            <Switch
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Configure filters to refine your data view
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Preset Filters */}
              {presets.length > 0 && (
                <div className="space-y-3">
                  <Label>Filter Presets</Label>
                  <Select value={selectedPreset || ''} onValueChange={handlePresetSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map(preset => (
                        <SelectItem key={preset.id} value={preset.id}>
                          <div>
                            <div>{preset.name}</div>
                            {preset.description && (
                              <div className="text-xs text-muted-foreground">
                                {preset.description}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Filter Fields */}
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.id}>
                    {renderFilterField(field)}
                  </div>
                ))}
              </div>

              {/* Column Visibility */}
              {availableColumns.length > 0 && columnVisibility && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Column Visibility</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (onColumnVisibilityChange) {
                            const allVisible = Object.fromEntries(
                              availableColumns.map(col => [col.id, true])
                            )
                            onColumnVisibilityChange(allVisible)
                          }
                        }}
                      >
                        Show All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {availableColumns.map(column => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`col-${column.id}`}
                            checked={columnVisibility[column.id] !== false}
                            onCheckedChange={(checked) => {
                              if (onColumnVisibilityChange) {
                                onColumnVisibilityChange({
                                  ...columnVisibility,
                                  [column.id]: checked as boolean
                                })
                              }
                            }}
                          />
                          <Label
                            htmlFor={`col-${column.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {column.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <SheetFooter className="mt-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {onSavePreset && (
                    <Popover open={showSavePreset} onOpenChange={setShowSavePreset}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save Preset
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="preset-name">Preset Name</Label>
                            <Input
                              id="preset-name"
                              placeholder="Enter preset name..."
                              value={presetName}
                              onChange={(e) => setPresetName(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPresetName('')
                                setShowSavePreset(false)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSavePreset}>
                              Save
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <Button onClick={() => setIsOpen(false)}>Apply Filters</Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(values).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null
              const field = fields.find(f => f.id === key)
              if (!field) return null

              return (
                <Badge key={key} variant="secondary" className="gap-1">
                  <span className="text-xs">{field.label}:</span>
                  <span className="font-medium text-xs">
                    {Array.isArray(value)
                      ? `${value.length} selected`
                      : typeof value === 'object'
                      ? 'Range'
                      : String(value)}
                  </span>
                  <button
                    onClick={() => handleFieldChange(key, null)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 px-2"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </>
  )
}