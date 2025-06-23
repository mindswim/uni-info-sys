import { create } from 'zustand'

export interface ApiCallEntry {
  id: string
  timestamp: Date
  method: string
  url: string
  requestHeaders?: Record<string, string>
  requestBody?: any
  responseStatus?: number
  responseHeaders?: Record<string, string>
  responseBody?: any
  duration?: number
  error?: string
}

interface ApiStore {
  calls: ApiCallEntry[]
  addCall: (call: Omit<ApiCallEntry, 'id' | 'timestamp'>) => string
  updateCall: (id: string, updates: Partial<ApiCallEntry>) => void
  clearCalls: () => void
  exportCalls: () => void
}

export const useApiStore = create<ApiStore>((set, get) => ({
  calls: [],
  
  addCall: (call) => {
    const newCall: ApiCallEntry = {
      ...call,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }
    
    set((state) => ({
      calls: [newCall, ...state.calls].slice(0, 50) // Keep only last 50 calls
    }))
    
    return newCall.id
  },
  
  updateCall: (id, updates) => {
    set((state) => ({
      calls: state.calls.map(call => 
        call.id === id ? { ...call, ...updates } : call
      )
    }))
  },
  
  clearCalls: () => {
    set({ calls: [] })
  },
  
  exportCalls: () => {
    const calls = get().calls
    const dataStr = JSON.stringify(calls, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `api-calls-${new Date().toISOString().slice(0, 10)}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }
})) 