# Core Frontend Components Specification

## 1. AuthProvider Component
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Features:
// - Auto-refresh token management
// - Role/permission checking helpers
// - Persistent auth state (localStorage)
// - Auto-logout on 401 responses
```

## 2. ApiClient Service
```typescript
// src/services/api.ts
class ApiClient {
  private token: string | null;
  
  constructor() {
    this.setupInterceptors();
  }
  
  // Generic CRUD methods
  async get<T>(endpoint: string, params?: any): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete(endpoint: string): Promise<void>
  
  // File upload helper
  async upload(endpoint: string, file: File, data?: any): Promise<any>
  
  // Pagination helper
  async paginate<T>(endpoint: string, page: number, params?: any): Promise<PaginatedResponse<T>>
}
```

## 3. DataTable Component
```typescript
// src/components/common/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  actions?: ActionButton<T>[];
  filters?: FilterConfig[];
  pagination?: PaginationConfig;
  loading?: boolean;
  emptyMessage?: string;
}

// Features:
// - Sortable columns
// - Inline search
// - Bulk selection
// - Export to CSV
// - Responsive design
// - Loading states
```

## 4. FormBuilder Component
```typescript
// src/components/common/FormBuilder.tsx
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'date' | 'file' | 'number';
  validation?: any; // Zod schema
  options?: SelectOption[]; // For select fields
  multiple?: boolean;
  accept?: string; // For file inputs
}

interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  submitLabel?: string;
  layout?: 'vertical' | 'horizontal';
}

// Auto-generates forms from field configs
// Handles validation and error display
// Supports nested fields and arrays
```

## 5. StatusBadge Component
```typescript
// src/components/common/StatusBadge.tsx
type StatusType = 
  | 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' // Applications
  | 'enrolled' | 'waitlisted' | 'completed' | 'withdrawn' // Enrollments
  | 'active' | 'inactive' | 'pending'; // General

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

// Consistent status visualization across the app
// Color-coded with semantic meaning
// Optional icons for better UX
```

## 6. FileUpload Component
```typescript
// src/components/common/FileUpload.tsx
interface FileUploadProps {
  accept?: string; // "application/pdf,application/msword"
  maxSize?: number; // in MB
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  existingFiles?: UploadedFile[];
  documentType?: string;
}

// Features:
// - Drag & drop
// - File validation
// - Progress tracking
// - Preview for PDFs
// - Delete existing files
// - Version history display
```

## 7. NotificationCenter Component
```typescript
// src/components/layout/NotificationCenter.tsx
interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    application_id?: number;
    status?: string;
  };
  read_at: string | null;
  created_at: string;
}

// Features:
// - Bell icon with unread count
// - Dropdown list of recent notifications
// - Mark as read functionality
// - Click to navigate to related resource
// - Real-time updates (polling or websocket)
```

## 8. RoleGuard Component
```typescript
// src/components/auth/RoleGuard.tsx
interface RoleGuardProps {
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
  redirect?: string;
  children: React.ReactNode;
}

// Usage:
// <RoleGuard roles={['admin', 'faculty']}>
//   <AdminOnlyComponent />
// </RoleGuard>

// Features:
// - Checks user roles/permissions
// - Shows fallback or redirects
// - Works with React Router
```

## 9. StatsCard Component
```typescript
// src/components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

// For dashboard summaries
// Animated number transitions
// Trend indicators
// Clickable for drill-down
```

## 10. SearchableSelect Component
```typescript
// src/components/common/SearchableSelect.tsx
interface SearchableSelectProps<T> {
  options: T[];
  value: T | T[] | null;
  onChange: (value: T | T[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  placeholder?: string;
  multiple?: boolean;
  async?: boolean;
  loadOptions?: (query: string) => Promise<T[]>;
}

// For course selection, program selection, etc.
// Supports async loading for large datasets
// Multi-select for program choices
// Search/filter functionality
```

## Component Development Priority

### Week 1: Foundation
1. ✅ AuthProvider & ApiClient
2. ✅ Layout with RoleGuard
3. ✅ DataTable & StatusBadge
4. ✅ Basic routing structure

### Week 2: Forms & Interactions  
1. ✅ FormBuilder with validation
2. ✅ FileUpload component
3. ✅ SearchableSelect
4. ✅ Student profile form

### Week 3: Dashboards
1. ✅ StatsCard variations
2. ✅ NotificationCenter
3. ✅ Role-specific dashboards
4. ✅ Quick action cards

### Week 4: Complex Workflows
1. ✅ Multi-step application wizard
2. ✅ Course registration flow
3. ✅ Grade upload interface
4. ✅ Bulk operations UI