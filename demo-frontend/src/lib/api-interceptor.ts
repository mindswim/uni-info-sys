import axios from 'axios'
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useApiStore } from './api-store'

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: '/api', // This will proxy to Laravel backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Store for tracking active requests
const activeRequests = new Map<string, { callId: string; startTime: number }>()

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestId = crypto.randomUUID()
    const startTime = Date.now()
    
    // Add request to store
    const callId = useApiStore.getState().addCall({
      method: config.method?.toUpperCase() || 'GET',
      url: config.url || '',
      requestHeaders: config.headers as Record<string, string>,
      requestBody: config.data,
    }) as string
    
    // Track this request
    activeRequests.set(requestId, { callId, startTime })
    
    // Add request ID to config so we can match it in response
    config.metadata = { requestId }
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestId = response.config.metadata?.requestId
    
    if (requestId && activeRequests.has(requestId)) {
      const { callId, startTime } = activeRequests.get(requestId)!
      const duration = Date.now() - startTime
      
      // Update call with response data
      useApiStore.getState().updateCall(callId, {
        responseStatus: response.status,
        responseHeaders: response.headers as Record<string, string>,
        responseBody: response.data,
        duration
      })
      
      // Clean up
      activeRequests.delete(requestId)
    }
    
    return response
  },
  (error: AxiosError) => {
    const requestId = error.config?.metadata?.requestId
    
    if (requestId && activeRequests.has(requestId)) {
      const { callId, startTime } = activeRequests.get(requestId)!
      const duration = Date.now() - startTime
      
      // Update call with error data
      useApiStore.getState().updateCall(callId, {
        responseStatus: error.response?.status,
        responseHeaders: error.response?.headers as Record<string, string>,
        responseBody: error.response?.data,
        duration,
        error: error.message
      })
      
      // Clean up
      activeRequests.delete(requestId)
    }
    
    return Promise.reject(error)
  }
)

// Extend AxiosRequestConfig type to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      requestId: string
    }
  }
} 