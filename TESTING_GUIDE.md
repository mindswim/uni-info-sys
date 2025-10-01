# Testing Guide - API Integration

## Current Status

### ✅ Services Running
- **Backend**: http://localhost (Laravel + Docker)
- **Frontend**: http://localhost:3000 (Next.js)
- **Health Check**: http://localhost/api/health - PASSING

### ✅ Integration Complete
We've integrated **14 pages** with real APIs:

**Student Pages (5):**
1. Academic Records - `/academic-records`
2. Schedule - `/schedule`
3. Course Catalog - `/course-catalog`
4. Profile - `/profile`
5. Registration - `/registration`

**Admin Pages (3):**
6. Students Management - `/students`
7. Enrollments Management - `/enrollments`
8. Course Sections - `/course-sections`

**Faculty Pages (3):**
9. Gradebook - `/gradebook`
10. Course Management - `/course-management`
11. Attendance - `/attendance`

---

## Authentication Issue

### Problem
The login endpoint (`/api/v1/tokens/create`) exists and works, but:
- Database has users with Argon2id password hashes
- Factory-generated passwords don't match
- Test credentials need to be reset

### Solution - Create Test User

Run this command to create a working test user:

```bash
cd /Users/juan/dev/student-admissions-system/university-admissions

./vendor/bin/sail artisan tinker --execute="
\$student = App\Models\Student::with('user')->first();
if (\$student && \$student->user) {
    \$user = \$student->user;
    \$user->password = \Illuminate\Support\Facades\Hash::make('test123');
    \$user->save();
    echo 'Test credentials created:\n';
    echo 'Email: ' . \$user->email . '\n';
    echo 'Password: test123\n';
    echo 'Role: Student\n';
}
"
```

Or manually create one:

```bash
./vendor/bin/sail artisan tinker --execute="
App\Models\User::create([
    'name' => 'Test Student',
    'email' => 'student@test.com',
    'password' => bcrypt('password123')
]);
echo 'Created: student@test.com / password123';
"
```

---

## Manual Testing Checklist

### 1. Test Login Flow
- [ ] Go to http://localhost:3000
- [ ] Click login or go to `/auth/login`
- [ ] Enter test credentials
- [ ] Verify token is stored in localStorage
- [ ] Verify redirect to dashboard

### 2. Test Student Pages

**Academic Records** (`/academic-records`)
- [ ] Page loads without errors
- [ ] Shows real course history from API
- [ ] Displays GPA and credit information
- [ ] Loading spinner appears initially
- [ ] Error handling works (try logging out)

**Schedule** (`/schedule`)
- [ ] Shows current class schedule
- [ ] Displays meeting times and locations
- [ ] Shows instructor names
- [ ] Calendar view renders correctly

**Course Catalog** (`/course-catalog`)
- [ ] Lists available courses
- [ ] Search/filter works
- [ ] Enroll button triggers API call
- [ ] Enrollment count updates
- [ ] Drop course works

**Profile** (`/profile`)
- [ ] Shows student information
- [ ] Edit mode allows changes
- [ ] Save triggers API update
- [ ] Emergency contact info displays

**Registration** (`/registration`)
- [ ] Shows current term info
- [ ] Displays enrolled credits
- [ ] Credit limits shown correctly
- [ ] Registration wizard opens

### 3. Test Admin Pages

**Students Management** (`/students`)
- [ ] Lists all students with pagination
- [ ] Search works
- [ ] Status filter works
- [ ] Create student form opens
- [ ] Edit student works
- [ ] Delete confirmation appears

**Enrollments Management** (`/enrollments`)
- [ ] Shows all enrollments
- [ ] Filter by status works
- [ ] Withdraw action works
- [ ] Pagination works

**Course Sections** (`/course-sections`)
- [ ] Lists all sections
- [ ] Shows enrollment counts
- [ ] Filter works
- [ ] Delete action works

### 4. Test Faculty Pages

**Gradebook** (`/gradebook`)
- [ ] Shows instructor's courses
- [ ] Student count displays
- [ ] Course list populates
- [ ] Stats cards show data

**Course Management** (`/course-management`)
- [ ] Lists sections taught
- [ ] Search works
- [ ] Course details display

**Attendance** (`/attendance`)
- [ ] Shows courses for attendance
- [ ] Loads without errors
- [ ] UI renders properly

---

## Known Issues

### 1. Auth Context Import
Some pages may reference old auth provider:
```typescript
// OLD (may cause errors)
import { useAuth } from '@/components/auth/auth-provider'

// NEW (correct)
import { useAuth } from '@/contexts/auth-context'
```

### 2. Dev Bypass Mode
Frontend supports bypassing auth for development:

In `frontend/.env.local`:
```bash
NEXT_PUBLIC_DEV_BYPASS_AUTH=true
NEXT_PUBLIC_API_LOGGING=true
```

### 3. Type Mismatches
Some API responses may have different property names than TypeScript types expect:
- Backend uses snake_case: `first_name`, `course_code`
- Frontend expects camelCase or needs transformation

### 4. Missing Endpoints
Some service methods may call endpoints that don't exist yet in the backend:
- Attendance records endpoint
- Gradebook details endpoint
- Some analytics endpoints

---

## API Testing with cURL

### Get Token
```bash
curl -X POST 'http://localhost/api/v1/tokens/create' \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@test.com","password":"password123","device_name":"Test"}'
```

### Test Student Endpoint
```bash
TOKEN="your_token_here"

curl -H "Authorization: Bearer $TOKEN" \
     -H "Accept: application/json" \
     http://localhost/api/v1/students/me
```

### Test Course Catalog
```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "Accept: application/json" \
     http://localhost/api/v1/courses
```

---

## Debugging Tips

### Check Browser Console
- Open DevTools (F12)
- Look for API errors
- Check Network tab for failed requests
- Verify token in localStorage

### Check Backend Logs
```bash
./vendor/bin/sail logs -f
```

### Verify API Response
```bash
# Test any endpoint
curl -H "Authorization: Bearer $TOKEN" \
     -H "Accept: application/json" \
     http://localhost/api/v1/students/me | python3 -m json.tool
```

### Check Service Worker
If pages aren't updating, clear service worker:
- DevTools > Application > Service Workers
- Click "Unregister"
- Hard refresh (Cmd+Shift+R)

---

## Next Steps

1. **Fix Auth**: Create working test credentials (see above)
2. **Test All 14 Pages**: Go through checklist
3. **Fix Bugs**: Document any errors found
4. **Add Missing Endpoints**: Implement any 404 endpoints
5. **Type Safety**: Fix type mismatches between API and frontend
6. **Error Handling**: Improve error messages
7. **Loading States**: Verify all loading spinners work

---

## Success Criteria

✅ Login works with test credentials
✅ All 14 pages load without console errors
✅ API calls return data (not 404)
✅ Loading states appear correctly
✅ Error states display helpful messages
✅ User can navigate between pages
✅ Data persists after refresh (token valid)

---

## Contact

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify API endpoints exist
4. Check TypeScript types match API response
5. Test with cURL to isolate frontend vs backend issues
