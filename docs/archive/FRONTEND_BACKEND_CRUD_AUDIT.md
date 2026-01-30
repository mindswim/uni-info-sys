# Frontend-Backend CRUD Audit
**Generated:** 2025-01-09
**Purpose:** Map all backend API endpoints to frontend UI implementation by user role

---

## Legend
- ✅ **Fully Implemented** - Complete UI with forms/actions
- 🟡 **Read Only** - Can view but not create/edit/delete
- ❌ **Not Implemented** - No UI exists
- 🔒 **Backend Only** - API exists but no frontend

---

## 1. STUDENT ROLE FEATURES

### 1.1 Admission Applications
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **View Applications** | `GET /admission-applications` | ❌ | Missing | None |
| **Create Application** | `POST /admission-applications` | ❌ | Missing | Need application form |
| **View Single Application** | `GET /admission-applications/{id}` | ❌ | Missing | None |
| **Update Application** | `PUT /admission-applications/{id}` | ❌ | Missing | None |

**Impact:** 🚨 **CRITICAL** - Students cannot apply to university

---

### 1.2 Course Registration & Enrollment
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **Browse Courses** | `GET /course-catalog` | ❌ | Missing | Need course browser |
| **View Course Sections** | `GET /course-sections` | ❌ | Missing | Need section list with enroll button |
| **Enroll in Course** | `POST /enrollments` | ❌ | Missing | Need "Enroll" button + confirmation |
| **View My Enrollments** | `GET /enrollments/me` | ✅ | Working | `/student/enrollments` |
| **Withdraw from Course** | `POST /enrollments/{id}/withdraw` | ❌ | Missing | Need "Withdraw" button on enrollment cards |
| **Swap Courses** | `POST /enrollments/swap` | ❌ | Missing | None |

**Impact:** 🚨 **CRITICAL** - Students cannot register for courses
**Current State:** Registration tab shows "Registration Not Open" placeholder

---

### 1.3 Grades & Academic Records
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **View My Grades** | `GET /enrollments/me` | ✅ | Working | `/student/grades` - Beautiful GPA calc |
| **View Academic Records** | `GET /students/me/academic-records` | 🟡 | Read Only | `/student/academic-records` |
| **Request Grade Change** | `POST /grade-change-requests` | ❌ | Missing | Need "Request Change" button |

**Impact:** ⚠️ **Medium** - View works great, but can't dispute grades

---

### 1.4 Schedule & Transcripts
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **View Schedule** | `GET /enrollments/me` | ✅ | Working | `/student/schedule` |
| **View Transcripts** | Various | 🟡 | Read Only | `/student/transcripts` |

**Impact:** ✅ **Good** - These are view-only features

---

### 1.5 Profile & Notifications
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **View Profile** | `GET /students/me` | ✅ | Working | `/profile` |
| **View Notifications** | `GET /notifications` | ✅ | Working | `/notifications` |
| **Mark as Read** | `POST /notifications/{id}/read` | ✅ | Working | Notification cards |

**Impact:** ✅ **Good** - Working

---

## 2. FACULTY ROLE FEATURES

### 2.1 Course Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **View My Sections** | `GET /staff/me/sections` | ✅ | Working | `/faculty/sections` |
| **View Course Details** | `GET /courses/{id}` | 🟡 | Read Only | `/faculty/courses` |
| **Update Course** | `PUT /courses/{id}` | ❌ | Missing | Need edit form |

**Impact:** ⚠️ **Medium** - Can view but not edit

---

### 2.2 Grading System ⭐ BEST FEATURE
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **View Section Enrollments** | `GET /course-sections/{id}/enrollments` | ✅ | Working | `/faculty/grades` |
| **Bulk Submit Grades** | `POST /course-sections/{id}/grades/bulk` | ✅ | Working | Gradebook table |
| **Grade Distribution** | `GET /course-sections/{id}/grade-distribution` | ✅ | Working | Chart display |
| **Grading Progress** | `GET /course-sections/{id}/grading-progress` | ✅ | Working | Progress stats |
| **Export Grades** | Client-side CSV | ✅ | Working | Export button |

**Impact:** ✅ **EXCELLENT** - Production-quality feature

---

### 2.3 Student Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **View My Students** | `GET /staff/me/students` (inferred) | 🟡 | Partial | `/faculty/students` - may be incomplete |
| **View Student Details** | `GET /students/{id}` | ❌ | Missing | Need student detail view |

**Impact:** ⚠️ **Medium** - Can view list but limited detail

---

## 3. ADMIN ROLE FEATURES

### 3.1 Student Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Students** | `GET /students` | ✅ | Working | `/admin/students` |
| **Create Student** | `POST /students` | ❌ | Missing | Need "Add Student" form |
| **View Student** | `GET /students/{id}` | 🟡 | Basic | List view only |
| **Update Student** | `PUT /students/{id}` | ❌ | Missing | Need edit dialog |
| **Delete Student** | `DELETE /students/{id}` | ❌ | Missing | Need delete confirmation |
| **Restore Student** | `POST /students/{id}/restore` | ❌ | Missing | None |

**Impact:** 🚨 **HIGH** - Can't manage students beyond viewing

---

### 3.2 Faculty/Staff Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Faculty** | `GET /staff?type=faculty` | ✅ | Working | `/admin/faculty` |
| **Create Faculty** | `POST /staff` | ❌ | Missing | Need "Add Faculty" form |
| **Update Faculty** | `PUT /staff/{id}` | ❌ | Missing | Need edit dialog |
| **Delete Faculty** | `DELETE /staff/{id}` | ❌ | Missing | None |
| **List Staff** | `GET /staff` | ✅ | Working | `/admin/staff` |
| **Create Staff** | `POST /staff` | ❌ | Missing | Need "Add Staff" form |
| **Update Staff** | `PUT /staff/{id}` | ❌ | Missing | Need edit dialog |

**Impact:** 🚨 **HIGH** - Can't manage employees

---

### 3.3 Admissions Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Applications** | `GET /admission-applications` | ❌ | Missing | `/admin/admissions` shows fake stats |
| **View Application** | `GET /admission-applications/{id}` | ❌ | Missing | Need detail view |
| **Update Status** | `PUT /admission-applications/{id}` | ❌ | Missing | Need approve/reject buttons |
| **Create Application (Admin)** | `POST /admission-applications` | ❌ | Missing | Optional |

**Impact:** 🚨 **CRITICAL** - Admissions workflow completely missing

---

### 3.4 Academic Structure Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Faculties** | `GET /faculties` | ✅ | Working | `/admin/faculty` |
| **Create Faculty** | `POST /faculties` | ❌ | Missing | Need "Add Faculty" form |
| **Update Faculty** | `PUT /faculties/{id}` | ❌ | Missing | Need edit dialog |
| **Delete Faculty** | `DELETE /faculties/{id}` | ❌ | Missing | None |
| **List Departments** | `GET /departments` | ✅ | Working | `/admin/faculty` |
| **Create Department** | `POST /departments` | ❌ | Missing | Need form |
| **Update Department** | `PUT /departments/{id}` | ❌ | Missing | Need edit dialog |
| **List Programs** | `GET /programs` | ✅ | Working | `/admin/faculty` tab |
| **Create Program** | `POST /programs` | ❌ | Missing | Need form |

**Impact:** 🚨 **HIGH** - Can't build academic structure

---

### 3.5 Course & Section Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Courses** | `GET /courses` | ✅ | Working | Various admin views |
| **Create Course** | `POST /courses` | ❌ | Missing | Need course form |
| **Update Course** | `PUT /courses/{id}` | ❌ | Missing | Need edit dialog |
| **Delete Course** | `DELETE /courses/{id}` | ❌ | Missing | None |
| **List Sections** | `GET /course-sections` | ✅ | Working | Faculty sections view |
| **Create Section** | `POST /course-sections` | ❌ | Missing | Need section form |
| **Update Section** | `PUT /course-sections/{id}` | ❌ | Missing | Need edit dialog |

**Impact:** 🚨 **HIGH** - Can't build course catalog

---

### 3.6 Infrastructure Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Buildings** | `GET /buildings` | ✅ | Working | `/admin/buildings` |
| **Create Building** | `POST /buildings` | ❌ | Missing | "Add Building" button exists but no form |
| **Update Building** | `PUT /buildings/{id}` | ❌ | Missing | Need edit dialog |
| **List Rooms** | `GET /rooms` | ✅ | Working | `/admin/buildings` rooms tab |
| **Create Room** | `POST /rooms` | ❌ | Missing | "Add Room" button exists but no form |
| **Update Room** | `PUT /rooms/{id}` | ❌ | Missing | Need edit dialog |

**Impact:** ⚠️ **Medium** - Can view infrastructure

---

### 3.7 Term Management
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Terms** | `GET /terms` | ✅ | Working | `/admin/terms` |
| **Create Term** | `POST /terms` | ❌ | Missing | Need term form |
| **Update Term** | `PUT /terms/{id}` | ❌ | Missing | Need edit dialog |
| **Get Current Term** | `GET /terms/current` | ✅ | Working | Dashboard uses this |

**Impact:** 🚨 **HIGH** - Can't create academic calendar

---

### 3.8 Grade Change Requests (Admin Review)
| Operation | Endpoint | Frontend UI | Status | Location |
|-----------|----------|-------------|--------|----------|
| **List Requests** | `GET /grade-change-requests` | 🟡 | Partial | Dashboard shows count |
| **Approve Request** | `POST /grade-change-requests/{id}/approve` | ❌ | Missing | No review interface |
| **Deny Request** | `POST /grade-change-requests/{id}/deny` | ❌ | Missing | No review interface |

**Impact:** ⚠️ **Medium** - Can see count but can't act

---

## SUMMARY BY PRIORITY

### 🚨 P0 - CRITICAL (App is not functional without these)
1. **Student: Apply to University** - `POST /admission-applications` + form
2. **Admin: Review Applications** - `GET /admission-applications` + approve/reject UI
3. **Student: Browse & Register for Courses** - Course catalog + `POST /enrollments`
4. **Student: Withdraw from Courses** - `POST /enrollments/{id}/withdraw` button

**These 4 features are the minimum for a "working university system"**

---

### 🔴 P1 - HIGH (Major administrative gaps)
5. **Admin: Create Students** - `POST /students` + form
6. **Admin: Create Faculty/Staff** - `POST /staff` + form
7. **Admin: Create Courses** - `POST /courses` + form
8. **Admin: Create Course Sections** - `POST /course-sections` + form
9. **Admin: Create Terms** - `POST /terms` + form
10. **Admin: Create Departments/Faculties** - `POST /departments`, `/faculties` + forms

**These are needed to set up the system**

---

### 🟡 P2 - MEDIUM (Enhanced functionality)
11. **Admin: Edit/Delete Forms** - All `PUT` and `DELETE` endpoints + dialogs
12. **Student: Request Grade Changes** - `POST /grade-change-requests` + form
13. **Admin: Review Grade Changes** - Approve/deny interface
14. **Admin: Create Buildings/Rooms** - Infrastructure forms
15. **Faculty: Edit Courses** - `PUT /courses` + form

---

### 🟢 P3 - LOW (Nice to have)
16. **Enrollment Swapping** - `POST /enrollments/swap` + UI
17. **Course Import** - `POST /imports/courses` + file upload
18. **Grade Import** - `POST /course-sections/{id}/import-grades` + file upload
19. **Soft Delete Management** - Restore/force delete UIs

---

## IMPLEMENTATION PLAN

### Phase 1: Student Journey (2-3 days)
**Goal:** Students can apply and register for courses
- [ ] Build admission application form
- [ ] Build application review interface (admin)
- [ ] Build course catalog browser
- [ ] Add "Enroll" button to course sections
- [ ] Add "Withdraw" button to enrollments

### Phase 2: Admin Setup (2-3 days)
**Goal:** Admins can set up the system
- [ ] Create reusable CRUD form component
- [ ] Add Create forms for: Students, Staff, Courses, Sections, Terms
- [ ] Add Edit dialogs for major entities
- [ ] Add Delete confirmations

### Phase 3: Polish (1-2 days)
**Goal:** Enhanced functionality
- [ ] Grade change request workflow
- [ ] Edit forms for remaining entities
- [ ] Infrastructure management forms

---

## TECHNICAL NOTES

### What Works Great
- ✅ Faculty grading system (production-quality)
- ✅ Data fetching and display
- ✅ Authentication and authorization
- ✅ Backend API is complete and robust

### What's Missing
- ❌ Form components (create/edit dialogs)
- ❌ Action buttons (enroll, withdraw, approve, reject)
- ❌ Workflows (application → review → accept → enroll)

### Pattern to Follow
The **Faculty Grades Tab** (`/faculty/grades`) is the perfect template:
1. Fetch data from API ✅
2. Display in table ✅
3. Allow user input (grades) ✅
4. Validate ✅
5. Submit to API ✅
6. Show success/error ✅
7. Refresh data ✅

**Copy this pattern for all CRUD operations.**

---

## NEXT STEPS

1. **Start with Priority 0** - The 4 critical features
2. **Build a reusable form component** - Don't rebuild forms each time
3. **Use shadcn Dialog component** - For create/edit modals
4. **Copy the grading tab patterns** - Proven working code
5. **Test each workflow end-to-end** - Apply → Review → Accept → Enroll

**Estimated effort to working demo:** 5-7 days of focused work
**Current completion:** 50% (viewing works, actions missing)
