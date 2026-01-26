# Frontend-Backend Wiring Status

> Status of connecting frontend pages to backend API endpoints

---

## Legend

| Status | Meaning |
|--------|---------|
| [x] Wired | Frontend calls real API, displays real data |
| [~] Partial | Some features wired, others use mock data |
| [ ] Mock | Frontend uses hardcoded mock data |
| [-] Missing | Backend endpoint doesn't exist |

---

## Student Pages

### Dashboard (`/student`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Holds banner | [x] Exists | [x] Wired | `GET /api/v1/holds/summary` |
| Action items | [x] Exists | [x] Wired | `GET /api/v1/action-items/dashboard` |
| Current enrollments | [x] Exists | [x] Wired | `GET /api/v1/enrollments/me` |
| GPA display | [x] Exists | [ ] Mock | Via student profile |
| Upcoming assignments | [x] Exists | [ ] Mock | `GET /api/v1/assignments/me/upcoming` |

### Registration (`/student/registration`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Course catalog | [x] Exists | [x] Wired | `GET /api/v1/course-catalog` |
| Shopping cart | [x] Exists | [x] Wired | `POST /api/v1/enrollments` |
| Prerequisite check | [x] Exists | [ ] Mock | Via EnrollmentService |
| Schedule conflicts | [x] Exists | [ ] Mock | Via EnrollmentService |
| Waitlist | [x] Exists | [~] Partial | Automatic via capacity |

### Drop/Add (`/student/drop-add`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Current enrollments | [x] Exists | [x] Wired | `GET /api/v1/enrollments/me` |
| Withdraw action | [x] Exists | [x] Wired | `POST /api/v1/enrollments/{id}/withdraw` |
| Deadline checking | [x] Exists | [ ] Mock | Via Term model |
| Refund percentage | [-] Missing | [ ] Mock | Need to add |

### Schedule (`/student/schedule`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Weekly calendar | [x] Exists | [~] Partial | `GET /api/v1/class-sessions/me` |
| Class details | [x] Exists | [~] Partial | Via course sections |

### Grades (`/student/grades`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Term grades | [x] Exists | [~] Partial | `GET /api/v1/gradebook/me` |
| GPA calculation | [x] Exists | [ ] Mock | Via StudentService |
| Transcript | [~] Partial | [ ] Mock | Academic records exist |

### Degree Audit (`/student/degree-audit`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Requirements | [x] Exists | [ ] Mock | `DegreeRequirement` model exists |
| Progress tracking | [x] Exists | [ ] Mock | Via StudentService |
| What-if analysis | [-] Missing | [ ] Mock | Need to add |

### Financial Aid (`/student/financial-aid`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Aid package | [x] Exists | [ ] Mock | `GET /api/v1/financial-aid/me` |
| Scholarships | [x] Exists | [ ] Mock | `GET /api/v1/financial-aid/scholarships` |
| Disbursements | [x] Exists | [ ] Mock | `AidDisbursement` model |
| Checklist | [-] Missing | [ ] Mock | Need action items integration |

### Payment (`/student/payment`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Account balance | [x] Exists | [ ] Mock | `GET /api/v1/invoices/student-summary` |
| Invoice list | [x] Exists | [ ] Mock | `GET /api/v1/invoices` |
| Make payment | [x] Exists | [ ] Mock | `POST /api/v1/payments` |
| Payment gateway | [-] Missing | [ ] Mock | Need Stripe/etc integration |

### Advisor (`/student/advisor`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Advisor info | [x] Exists | [x] Wired | `GET /api/v1/students/me/advisor` |
| Appointments | [x] Exists | [x] Wired | `GET /api/v1/appointments/me` |
| Book appointment | [x] Exists | [x] Wired | `POST /api/v1/appointments` |
| Cancel appointment | [x] Exists | [x] Wired | `POST /api/v1/appointments/{id}/cancel` |

### Holds (`/student/holds`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| List holds | [x] Exists | [ ] Mock | `GET /api/v1/holds` |
| Hold details | [x] Exists | [ ] Mock | `GET /api/v1/holds/{id}` |

---

## Faculty Pages

### Dashboard (`/faculty`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| My sections | [x] Exists | [~] Partial | `GET /api/v1/staff/me/sections` |
| Grading progress | [x] Exists | [ ] Mock | Via GradingProgress |

### Courses (`/faculty/courses`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Section roster | [x] Exists | [x] Wired | `GET /api/v1/course-sections/{id}/enrollments` |
| Gradebook | [x] Exists | [~] Partial | `GET /api/v1/course-sections/{id}/gradebook` |
| Assignments | [x] Exists | [~] Partial | `GET /api/v1/course-sections/{id}/assignments` |
| Materials | [x] Exists | [ ] Mock | `GET /api/v1/course-sections/{id}/materials` |
| Attendance | [x] Exists | [ ] Mock | Via AttendanceController |

### Advisees (`/faculty/advisees`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Advisee list | [x] Exists | [x] Wired | `GET /api/v1/staff/me/advisees` |
| Student details | [x] Exists | [x] Wired | Via student data in response |
| Holds view | [x] Exists | [ ] Mock | Via HoldController |

### Appointments (`/faculty/appointments`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Calendar | [-] Missing | [ ] Mock | Need `Appointment` model |
| Booking | [-] Missing | [ ] Mock | Need appointment system |
| Meeting notes | [-] Missing | [ ] Mock | Need appointment system |

---

## Admin Pages

### Dashboard (`/admin`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| KPIs | [~] Partial | [ ] Mock | Various stats endpoints |
| Application pipeline | [x] Exists | [ ] Mock | `GET /api/v1/admission-applications/stats` |
| Holds overview | [x] Exists | [ ] Mock | Via HoldController |

### Admissions (`/admin/admissions`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Application list | [x] Exists | [x] Wired | `GET /api/v1/admission-applications` |
| Application detail | [x] Exists | [x] Wired | `GET /api/v1/admission-applications/{id}` |
| Accept/Reject | [x] Exists | [x] Wired | `POST .../accept` or `.../reject` |
| Bulk actions | [x] Exists | [ ] Mock | `POST .../bulk-actions` |

### Review Queue (`/admin/admissions/review`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Queue view | [x] Exists | [x] Wired | `GET /api/v1/admission-applications?status=submitted` |
| Accept/Reject flow | [x] Exists | [x] Wired | `POST .../accept` or `.../reject` |

### Waitlists (`/admin/waitlists`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Waitlist entries | [~] Partial | [x] Wired | `GET /api/v1/waitlist` |
| Promote action | [x] Exists | [x] Wired | `POST /api/v1/enrollments/{id}/promote` |
| Remove action | [x] Exists | [x] Wired | `DELETE /api/v1/enrollments/{id}` |

### Holds Management (`/admin/holds`)
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| All holds | [x] Exists | [x] Wired | `GET /api/v1/holds` |
| Place hold | [x] Exists | [x] Wired | `POST /api/v1/holds` |
| Resolve hold | [x] Exists | [x] Wired | `POST /api/v1/holds/{id}/resolve` |
| Filter/search | [x] Exists | [x] Wired | Query params supported |

### Billing (`/admin/billing`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Invoice list | [x] Exists | [x] Wired | `GET /api/v1/invoices` |
| Invoice detail | [x] Exists | [ ] Mock | `GET /api/v1/invoices/{id}` |
| Create invoice | [x] Exists | [ ] Mock | Via BillingService |
| Process payment | [x] Exists | [ ] Mock | `POST /api/v1/payments` |
| Refund | [x] Exists | [ ] Mock | `POST /api/v1/payments/{id}/refund` |

### Financial Aid Admin (`/admin/financial-aid`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Package list | [x] Exists | [ ] Mock | `FinancialAidPackage` model |
| Award management | [x] Exists | [ ] Mock | `AidAward` model |
| FAFSA status | [-] Missing | [ ] Mock | Need field on student |
| Disbursement | [x] Exists | [ ] Mock | `AidDisbursement` model |

### Settings (`/admin/settings`) - NEW PAGE
| Feature | Backend Status | Frontend Status | API Endpoint |
|---------|---------------|-----------------|--------------|
| Registration toggle | [x] Exists | [x] Wired | `GET/PATCH /api/v1/settings/system/registration` |
| Notifications config | [x] Exists | [x] Wired | `GET/PATCH /api/v1/settings/system/notifications` |
| Academic config | [x] Exists | [x] Wired | `GET/PATCH /api/v1/settings/system/academic` |
| System info | [x] Exists | [x] Wired | `GET /api/v1/settings/system/info` |
| Clear cache | [x] Exists | [x] Wired | `POST /api/v1/settings/system/cache/clear` |
| Maintenance mode | [x] Exists | [x] Wired | `POST /api/v1/settings/system/maintenance` |

---

## What Needs to Be Built

### Backend - New Models/Tables Needed

1. **Appointment System**
   ```
   appointments
   - id
   - student_id
   - advisor_id (staff_id)
   - scheduled_at
   - duration_minutes
   - type (advising, registration, career, etc.)
   - status (scheduled, completed, cancelled, no_show)
   - meeting_notes
   - created_at, updated_at
   ```

2. **Advisor Relationship**
   - Add `advisor_id` to `students` table (FK to staff)
   - Or create `student_advisor` pivot table for multiple advisors

3. **System Settings**
   ```
   system_settings
   - key
   - value
   - type (boolean, string, integer, json)
   - group (registration, notifications, academic, etc.)
   - updated_by
   - updated_at
   ```

4. **FAFSA Status** (if not using action items)
   - Add `fafsa_status` to students or financial_aid_packages

### Backend - API Endpoints Needed

1. **Waitlist Management**
   - `GET /api/v1/waitlists` - List all waitlisted enrollments with course info
   - `POST /api/v1/waitlists/{enrollment}/promote` - Manually promote

2. **Advisor System**
   - `GET /api/v1/students/me/advisor` - Get my advisor
   - `GET /api/v1/staff/me/advisees` - Get my advisees
   - `GET /api/v1/appointments` - List appointments
   - `POST /api/v1/appointments` - Book appointment
   - `PUT /api/v1/appointments/{id}` - Update/add notes
   - `DELETE /api/v1/appointments/{id}` - Cancel

3. **Settings**
   - `GET /api/v1/settings` - Get all settings (admin only)
   - `PUT /api/v1/settings` - Update settings (admin only)
   - `GET /api/v1/settings/public` - Get public settings (registration open, etc.)

4. **Drop/Add Enhancements**
   - Add refund percentage calculation to withdraw endpoint
   - Add deadline info to enrollment response

### Frontend - Wire Existing APIs

These pages have mock data but backend APIs exist:

| Priority | Page | API to Wire | Status |
|----------|------|-------------|--------|
| P1 | Student Dashboard | Holds, Action Items | DONE |
| P1 | Admin Holds | HoldController (full CRUD) | DONE |
| P1 | Student Drop/Add | Enrollments withdraw | DONE |
| P2 | Admin Billing | InvoiceController, PaymentController | Partial (list only) |
| P2 | Student Payment | InvoiceController, PaymentController | TODO |
| P2 | Admin Waitlists | Filter enrollments by waitlisted | DONE |
| P2 | Review Queue | Filter applications by status | DONE |
| P3 | Financial Aid (both) | FinancialAidController | TODO |
| P3 | Faculty Gradebook | GradebookController | TODO |
| P3 | Degree Audit | StudentService.checkDegreeProgress | TODO |

---

## Quick Win: Wire These First

These require **zero backend changes** - just connect frontend to existing APIs:

1. ~~**Student Holds Banner** - Wire `GET /api/v1/holds/summary`~~ DONE
2. ~~**Admin Holds Page** - Wire full CRUD from HoldController~~ DONE
3. ~~**Student Drop/Add** - Wire `GET /api/v1/enrollments/me` + withdraw~~ DONE
4. ~~**Admin Waitlists** - Filter `GET /api/v1/enrollments?status=waitlisted`~~ DONE
5. ~~**Admin Billing** - Wire InvoiceController + PaymentController~~ DONE (list only)
6. ~~**Admin Review Queue** - Filter applications by status~~ DONE

---

## Estimated Effort

| Task | Backend | Frontend | Total | Status |
|------|---------|----------|-------|--------|
| Wire existing APIs (P1/P2 priority) | 0h | 8-12h | 8-12h | DONE |
| Wire remaining APIs (P3 priority) | 0h | 4-6h | 4-6h | TODO |
| Appointment system | 4-6h | 4-6h | 8-12h | DONE |
| Settings system | 2-3h | 3-4h | 5-7h | DONE |
| Advisor relationship | 1-2h | 2-3h | 3-5h | DONE |
| Payment gateway integration | 4-6h | 2-3h | 6-9h | TODO |
| **Total Remaining** | ~6h | ~3h | ~9h | |

---

*Last updated: January 2025*
