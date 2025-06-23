import { useState } from 'react'
import type { ApiCallEntry as ApiCall } from '@/lib/api-store'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Clock, Zap } from 'lucide-react'

interface ApiCallEntryProps {
  call: ApiCall
}

export function ApiCallEntry({ call }: ApiCallEntryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-500'
      case 'POST': return 'bg-green-500'
      case 'PUT': return 'bg-yellow-500'
      case 'PATCH': return 'bg-orange-500'
      case 'DELETE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500'
    if (status >= 200 && status < 300) return 'bg-green-500'
    if (status >= 300 && status < 400) return 'bg-blue-500'
    if (status >= 400 && status < 500) return 'bg-yellow-500'
    if (status >= 500) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'pending...'
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const formatJson = (obj: any) => {
    if (obj === null || obj === undefined) return 'null'
    if (typeof obj === 'string') return obj
    return JSON.stringify(obj, null, 2)
  }

  const getEndpoint = (url: string) => {
    // Remove /api prefix for cleaner display
    return url.replace(/^\/api/, '')
  }

  return (
    <Card className="p-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full p-0 h-auto justify-start">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                {/* Expand Icon */}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                
                {/* HTTP Method */}
                <Badge className={`${getMethodColor(call.method)} text-white text-xs font-mono`}>
                  {call.method}
                </Badge>
                
                {/* Endpoint */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono truncate text-left">
                    {getEndpoint(call.url)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {/* Status Code */}
                {call.responseStatus && (
                  <Badge className={`${getStatusColor(call.responseStatus)} text-white text-xs`}>
                    {call.responseStatus}
                  </Badge>
                )}
                
                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {call.duration ? (
                    <>
                      <Zap className="h-3 w-3" />
                      {formatDuration(call.duration)}
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 animate-spin" />
                      pending...
                    </>
                  )}
                </div>
                
                {/* Time */}
                <div className="text-xs text-muted-foreground font-mono">
                  {formatTime(call.timestamp)}
                </div>
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3 space-y-3">
          {/* Request Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-600">Request</h4>
            
            {/* Request Headers */}
            {call.requestHeaders && Object.keys(call.requestHeaders).length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Headers:</p>
                <div className="bg-muted/50 rounded-md p-2 text-xs font-mono">
                  <pre className="whitespace-pre-wrap break-all">
                    {formatJson(call.requestHeaders)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Request Body */}
            {call.requestBody && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Body:</p>
                <div className="bg-muted/50 rounded-md p-2 text-xs font-mono">
                  <pre className="whitespace-pre-wrap break-all">
                    {formatJson(call.requestBody)}
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          {/* Response Details */}
          {(call.responseStatus || call.error) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-blue-600">Response</h4>
                {call.responseStatus && (
                  <Badge className={`${getStatusColor(call.responseStatus)} text-white text-xs`}>
                    {call.responseStatus}
                  </Badge>
                )}
              </div>
              
              {/* Error */}
              {call.error && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1">Error:</p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-2 text-xs">
                    {call.error}
                  </div>
                </div>
              )}
              
              {/* Response Headers */}
              {call.responseHeaders && Object.keys(call.responseHeaders).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Headers:</p>
                  <div className="bg-muted/50 rounded-md p-2 text-xs font-mono">
                    <pre className="whitespace-pre-wrap break-all">
                      {formatJson(call.responseHeaders)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Response Body */}
              {call.responseBody && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Body:</p>
                  <div className="bg-muted/50 rounded-md p-2 text-xs font-mono max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-all">
                      {formatJson(call.responseBody)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
} 