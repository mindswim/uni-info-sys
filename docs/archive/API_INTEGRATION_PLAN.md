# API Integration Plan

**Last Updated**: December 26, 2024
**Status**: Ready for execution

## Current State Assessment

### What We Have ✅
- **Backend**: Laravel 11 with 32 database tables, 100+ API endpoints, comprehensive business logic
- **Frontend**: Next.js 15 with 80 page components (~33,000 lines of code)
- **UI Coverage**: ~60-65% of planned features have UI implementations
- **Data**: Mock data in most components, partial API integration

### What's Missing ❌
- **Authentication Flow**: No working login/session management
- **API Integration**: Most pages use mock/demo data instead of real API calls
- **State Management**: No centralized API client or data fetching pattern
- **Error Handling**: Inconsistent error handling across pages
- **Loading States**: Partial loading state implementations

---

## Phase 1: Documentation Cleanup (Day 1)

### 1.1 Archive Outdated Planning Documents
Move to `/docs/archive/` folder:
- `CURRENT_STATUS_AND_ACTION_PLAN.md` (outdated Sept 26)
- `FRONTEND_ENGINEERING_PLAN.md` (outdated Sept 12)
- `FRONTEND_PLAN.md` (outdated Sept 12)
- `SIS_IMPLEMENTATION_PLAN.md` (planning only, not current state)
- `UNIVERSITY_WEBSITE_IMPLEMENTATION.md` (website, not SIS)
- `project_analysis_notes.md` (old analysis from June)
- `project_documentation.md` (old documentation from June)

### 1.2 Update Core Documentation
Keep and update these files:
- `README.md` - Update with current state, remove outdated info
- `CLAUDE.md` - Update with accurate feature list, API integration status
- `DATABASE_STRUCTURE.md` - Verify accuracy, add any missing tables
- `PROJECT_FEATURES.md` - Update with actual implementation status

### 1.3 Create New Documentation
Create these new files:
- `CURRENT_STATE.md` - Accurate snapshot of what exists today
- `API_INTEGRATION_GUIDE.md` - Developer guide for API integration patterns
- `DEPLOYMENT.md` - Deployment instructions for production

---

## Phase 2: Authentication & API Infrastructure (Days 2-3)

### 2.1 Authentication Setup

**Goal**: Working login flow with token management

**Tasks**:
1. Create authentication context (`frontend/src/contexts/auth-context.tsx`)
   - Login/logout methods
   - Token storage (localStorage with expiry)
   - Current user state
   - Role-based permissions helper

2. Update API config (`frontend/src/config/api.ts`)
   - Centralize all API endpoints
   - Add auth interceptor for Axios
   - Handle token refresh
   - Consistent error handling

3. Create login page (`frontend/src/app/auth/login/page.tsx`)
   - Use real `/api/v1/login` endpoint
   - Store token on success
   - Redirect to dashboard

4. Add protected route wrapper
   - Check authentication before rendering
   - Redirect to login if not authenticated
   - Show loading state during auth check

**Files to Create/Update**:
```
frontend/src/contexts/auth-context.tsx          [NEW]
frontend/src/hooks/use-auth.ts                  [NEW]
frontend/src/middleware/auth-middleware.ts      [NEW]
frontend/src/config/api.ts                      [UPDATE]
frontend/src/app/auth/login/page.tsx            [UPDATE]
frontend/src/app/layout.tsx                     [UPDATE - wrap with AuthProvider]
```

### 2.2 API Service Layer

**Goal**: Centralized, typed API client for all backend calls

**Tasks**:
1. Create base API client (`frontend/src/lib/api-client.ts`)
   - Axios instance with interceptors
   - Automatic auth header injection
   - Error handling
   - Request/response logging

2. Create typed API services for each domain:
   - `frontend/src/services/student-service.ts`
   - `frontend/src/services/course-service.ts`
   - `frontend/src/services/enrollment-service.ts`
   - `frontend/src/services/faculty-service.ts`
   - `frontend/src/services/admin-service.ts`

3. Create TypeScript types from backend models
   - Generate types from Laravel models
   - Store in `frontend/src/types/api-types.ts`
   - Match exact API response structure

**Example Service Structure**:
```typescript
// frontend/src/services/student-service.ts
import { apiClient } from '@/lib/api-client'
import type { Student, APIResponse } from '@/types/api-types'

export const studentService = {
  getAll: (params?: QueryParams) =>
    apiClient.get<APIResponse<Student[]>>('/v1/students', { params }),

  getById: (id: number) =>
    apiClient.get<APIResponse<Student>>(`/v1/students/${id}`),

  update: (id: number, data: Partial<Student>) =>
    apiClient.put<APIResponse<Student>>(`/v1/students/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/v1/students/${id}`)
}
```

---

## Phase 3: Connect Student Pages (Days 4-5)

### 3.1 Student Dashboard
**File**: `frontend/src/app/dashboard/page.tsx`

**Changes**:
- Replace mock widget data with real API calls
- Fetch student's current enrollments, GPA, upcoming classes
- Use `studentService.getCurrentStudent()` and `enrollmentService.getCurrent()`

### 3.2 Student Detail Page
**File**: `frontend/src/app/students/[id]/page.tsx`

**Status**: ✅ Already partially integrated!

**Improvements Needed**:
- Remove fallback to demo endpoint
- Add better error handling
- Show loading skeleton instead of "Loading..."
- Add real-time data refresh option

### 3.3 Academic Records
**File**: `frontend/src/app/academic-records/page.tsx`

**Changes**:
- Fetch from `/api/v1/students/{id}/academic-records`
- Display all semesters with GPA calculations
- Add filtering by term/year
- Export transcript functionality

### 3.4 Course Catalog & Enrollment
**File**: `frontend/src/app/course-catalog/page.tsx`

**Status**: ✅ Partially integrated

**Improvements**:
- Connect to `/api/v1/courses` with proper pagination
- Real enrollment via `/api/v1/enrollments` POST
- Show real-time capacity updates
- Handle prerequisite checking via backend

### 3.5 Schedule View
**File**: `frontend/src/app/schedule/page.tsx`

**Changes**:
- Fetch enrolled sections from API
- Generate weekly calendar view
- Add conflict detection
- Print/export schedule

---

## Phase 4: Connect Course & Enrollment Pages (Days 6-7)

### 4.1 Course Management
**File**: `frontend/src/app/course-management/page.tsx`

**Changes**:
- CRUD operations for courses via API
- Department and program filtering
- Prerequisite management
- Bulk operations (import/export)

### 4.2 Course Sections
**File**: `frontend/src/app/sections/page.tsx`

**Changes**:
- Section CRUD via `/api/v1/course-sections`
- Instructor assignment
- Room assignment with conflict checking
- Capacity management

### 4.3 Enrollment Management
**File**: `frontend/src/app/enrollments/page.tsx`

**Changes**:
- List all enrollments with filters
- Bulk enrollment operations
- Waitlist management
- Grade entry interface

---

## Phase 5: Connect Faculty Pages (Day 8)

### 5.1 Gradebook
**File**: `frontend/src/app/gradebook/page.tsx`

**Status**: ✅ UI complete

**Changes**:
- Fetch instructor's course sections
- Grade entry via `/api/v1/enrollments/{id}/grade`
- Grade distribution calculations
- Export gradebook

### 5.2 Course Attendance
**File**: `frontend/src/app/attendance/page.tsx`

**Changes**:
- Attendance recording via API
- Historical view
- Attendance reports
- Alert system for low attendance

---

## Phase 6: Connect Admin Dashboards (Days 9-10)

### 6.1 Advisor Dashboard
**File**: `frontend/src/app/advisor-dashboard/page.tsx`

**Status**: ✅ UI complete with mock data

**Changes**:
- Connect to advisor caseload API
- Real appointment scheduling
- Early alert system
- Student progress tracking

### 6.2 Registrar Dashboard
**File**: `frontend/src/app/registrar-dashboard/page.tsx`

**Status**: ✅ UI complete

**Changes**:
- Connect to transcript requests API
- Grade change workflows
- Enrollment verification processing
- Graduation clearance checks

### 6.3 Financial Aid
**File**: `frontend/src/app/financial-aid/page.tsx`

**Status**: ✅ UI complete

**Changes**:
- Fetch award packages from API
- SAP (Satisfactory Academic Progress) calculations
- Disbursement scheduling
- Document management

---

## Phase 7: Testing & Polish (Days 11-12)

### 7.1 End-to-End Testing
Test complete workflows:
1. **Student Registration Flow**
   - Login → Browse courses → Enroll → View schedule

2. **Faculty Grading Flow**
   - Login → View roster → Enter grades → Submit

3. **Admin Management Flow**
   - Login → View students → Update records → Generate reports

### 7.2 Error Handling
- Implement global error boundary
- Add toast notifications for errors
- Retry logic for failed requests
- Offline mode detection

### 7.3 Performance Optimization
- Implement data caching (React Query or SWR)
- Lazy load heavy components
- Optimize bundle size
- Add loading skeletons everywhere

### 7.4 Documentation Updates
- Update README with setup instructions
- Create API integration guide
- Document common patterns
- Add troubleshooting section

---

## Implementation Order Priority

### Week 1 (Days 1-5)
1. ✅ Documentation cleanup
2. ✅ Authentication setup
3. ✅ API service layer
4. ✅ Student pages integration

### Week 2 (Days 6-10)
5. ✅ Course/enrollment pages
6. ✅ Faculty pages
7. ✅ Admin dashboards

### Week 3 (Days 11-12)
8. ✅ Testing & polish

---

## Success Criteria

### Phase Complete When:
- [ ] User can log in with real credentials
- [ ] All student pages fetch data from Laravel API
- [ ] Course enrollment works end-to-end
- [ ] Faculty can enter grades via API
- [ ] Admin dashboards show real data
- [ ] Error handling is consistent
- [ ] No more mock data in production code paths
- [ ] Documentation is accurate and up-to-date

---

## Technical Debt to Address

### Authentication
- Implement token refresh mechanism
- Add "Remember Me" functionality
- Multi-factor authentication (future)

### API Integration
- Add request caching layer
- Implement optimistic updates
- Add WebSocket for real-time updates (future)

### Code Quality
- Add ESLint rules for API calls
- Create custom hooks for data fetching
- Standardize loading/error states

---

## Rollback Plan

If integration issues arise:
1. Keep mock data functions as fallback
2. Feature flags for API vs mock mode
3. Gradual rollout per page/feature
4. Monitor error rates and rollback if >5%

---

## Notes

- This plan assumes the Laravel backend is stable and tested
- Each phase should be committed separately with descriptive messages
- Run `npm run build` after each phase to catch TypeScript errors
- Test in both development and production build modes
