import { useApiStore } from '@/lib/api-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApiCallEntry } from './ApiCallEntry'
import { Trash2, Download, Activity } from 'lucide-react'

export function ApiActivityLog() {
  const { calls, clearCalls, exportCalls } = useApiStore()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">API Activity</h3>
          {calls.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {calls.length}
            </Badge>
          )}
        </div>
        
        {calls.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCalls}
              title="Export API calls as JSON"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCalls}
              title="Clear all API calls"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* API Calls List */}
      <div className="flex-1 min-h-0">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No API calls yet
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              When you interact with the demo, API requests will appear here in real-time
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {calls.map((call) => (
                <ApiCallEntry key={call.id} call={call} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      {/* Footer Info */}
      {calls.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Showing last {calls.length} calls • Automatically cleared after 50 calls
          </p>
        </div>
      )}
    </div>
  )
} 