# 🧪 UniSys User Testing Guide

This guide will help you test the University Admissions System like a real user. Follow these scenarios to ensure everything works smoothly and feels professional.

## 🚀 Getting Started

### Prerequisites
1. **Backend Running**: Ensure Laravel backend is running on `http://localhost`
2. **Frontend Running**: Ensure Next.js frontend is running on `http://localhost:3002`
3. **Fresh Data**: Run `./vendor/bin/sail artisan migrate:fresh --seed` to reset with demo data

### Demo Accounts
```
Admin:     admin@demo.com / password
Student 1: maria@demo.com / password (Just applied from Mexico)
Student 2: david@demo.com / password (Enrolled from Korea)
Student 3: sophie@demo.com / password (Waitlisted American student)
```

---

## 📝 Testing Scenarios

### Scenario 1: First-Time Admin Experience
**Goal**: Experience onboarding and navigation

**Steps**:
1. Visit `http://localhost:3002`
2. Login with `admin@demo.com / password`
3. **Check**: Welcome card appears with quick actions
4. Click each quick action link to verify navigation works
5. Dismiss the welcome card (X button)
6. **Check**: Card doesn't reappear on refresh
7. Explore sidebar navigation - all links should work

**What to Look For**:
- ✅ Clear welcome message
- ✅ Intuitive quick action buttons
- ✅ Welcome card can be dismissed permanently
- ✅ Sidebar navigation is organized and labeled clearly
- ✅ No broken links or 404 errors

---

### Scenario 2: Processing Student Applications
**Goal**: Approve/reject applications like a real admissions officer

**Steps**:
1. Click **Applications** in sidebar
2. **Check**: See Maria Rodriguez's application
3. **Review**: Click on her application to see details
4. **Approve**: Click "Approve" button
   - **Check**: Green success toast appears
   - **Check**: Status updates to "accepted"
   - **Check**: Stats card updates counts
5. **Edit**: Try the Edit button
   - Change status to "pending"
   - Add admin comments
   - Save and verify changes
6. **Search**: Use search bar to find applications
7. **Filter**: Try filtering by status

**What to Look For**:
- ✅ Application data displays clearly
- ✅ Approve/Reject buttons work instantly
- ✅ Toast notifications provide feedback
- ✅ Stats update in real-time
- ✅ Edit dialog shows current values
- ✅ Search and filters work correctly

---

### Scenario 3: Managing Course Enrollments
**Goal**: Handle student course registrations

**Steps**:
1. Navigate to **Enrollments**
2. **Check**: See David Park's enrollments
3. **Check**: Notice "AI Course" shows 2/2 capacity
4. **Check**: Sophie Turner is waitlisted for AI Course
5. **Create**: Click "Create Enrollment"
   - Select a student
   - Select a course section with capacity
   - Set enrollment date
   - **Check**: Success toast on creation
6. **Edit Grade**: Click Edit on an enrollment
   - Enter a grade (A, B+, C, etc.)
   - **Check**: Grade validation works
   - **Check**: Invalid grades are rejected
7. **Delete**: Try deleting an enrollment
   - **Check**: Confirmation dialog appears
   - **Check**: Can cancel or proceed

**What to Look For**:
- ✅ Capacity indicators are clear (2/2, 15/20)
- ✅ Waitlist status is obvious
- ✅ Create form has all necessary fields
- ✅ Dropdowns are populated with real data
- ✅ Grade validation prevents invalid entries
- ✅ Delete requires confirmation

---

### Scenario 4: Student Shopping Cart Experience
**Goal**: Register for courses like a real student

**Steps**:
1. **Logout**: Click user menu → Log out
2. **Login as Student**: Use `david@demo.com / password`
3. Navigate to **Registration**
4. **Browse**: Scroll through available courses
5. **Add to Cart**:
   - Click "Add to Cart" on 2-3 courses
   - **Check**: Cart button shows count (e.g., "Cart (3)")
   - **Check**: Success toast appears
6. **View Cart**: Click cart button in header
   - **Check**: Cart panel slides out
   - **Check**: Shows all added courses
   - **Check**: Shows total credits
7. **Remove from Cart**: Click remove on one course
   - **Check**: Updates immediately
8. **Schedule Conflict**:
   - Try adding courses with same time slots
   - **Check**: Warning message appears
9. **Bulk Enroll**: Click "Enroll in All Courses"
   - **Check**: Progress indication
   - **Check**: Success/failure summary
   - **Check**: Individual course feedback

**What to Look For**:
- ✅ "Add to Cart" is clearly visible
- ✅ Cart badge shows accurate count
- ✅ Cart panel is easy to open/close
- ✅ Course details visible in cart
- ✅ Conflict detection prevents errors
- ✅ Bulk enrollment provides clear feedback
- ✅ Feels like online shopping experience

---

### Scenario 5: Analytics Dashboard
**Goal**: Get insights into university operations

**Steps**:
1. **Login as Admin** if not already
2. Navigate to **Analytics**
3. **Review Summary Cards**:
   - **Check**: Shows total students, enrollments, applications
   - **Check**: Shows average GPA
4. **Enrollment Trends Tab**:
   - **Check**: Line chart displays correctly
   - **Check**: Shows total, active, completed enrollments
   - **Check**: Hover shows exact values
   - Click "Export" → **Check**: CSV downloads
5. **Applications Tab**:
   - **Check**: Bar chart shows status breakdown
   - **Check**: Export works
6. **Programs Tab**:
   - **Check**: Pie chart displays distribution
   - **Check**: Labels are readable
   - **Check**: Export works
7. **Grades Tab**:
   - **Check**: Grade distribution makes sense
   - **Check**: Export works
8. **Term Filter**:
   - Change term dropdown
   - **Check**: Data updates accordingly

**What to Look For**:
- ✅ Charts load without errors
- ✅ Data is accurate and makes sense
- ✅ Export functionality works
- ✅ Responsive design (resize browser)
- ✅ Professional appearance
- ✅ Clear legends and labels

---

### Scenario 6: User & Role Management
**Goal**: Manage users and permissions

**Steps**:
1. Navigate to **User Management**
2. **Users Tab**:
   - **Check**: See list of all users
   - Click "Assign Roles" on a user
   - **Check**: Checkboxes for available roles
   - Assign a role → **Check**: Success toast
3. **Roles Tab**:
   - Click "Create Role"
   - Enter name and assign permissions
   - **Check**: Save works
   - Try editing a role
   - **Check**: Shows current permissions
4. **Permissions Tab**:
   - **Check**: Lists all system permissions
   - Try creating a new permission

**What to Look For**:
- ✅ User list displays clearly
- ✅ Role assignment is intuitive
- ✅ Permissions are grouped logically
- ✅ Changes save successfully
- ✅ Validation prevents errors

---

### Scenario 7: Buildings & Rooms Management
**Goal**: Manage campus facilities

**Steps**:
1. Navigate to **Buildings**
2. **Buildings Tab**:
   - **Check**: See stats (total buildings, rooms, capacity)
   - Click "Create Building"
   - Fill in name, code, address
   - **Check**: Creates successfully
   - Try editing → **Check**: Shows current values
3. **Rooms Tab**:
   - Click "Create Room"
   - Select building from dropdown
   - Enter room number, type, capacity
   - Add features (comma-separated)
   - **Check**: Creates successfully
   - **Check**: Features display as badges

**What to Look For**:
- ✅ Dual-tab interface is clear
- ✅ Stats cards provide overview
- ✅ Building selector in rooms works
- ✅ Features are easy to add
- ✅ Everything saves correctly

---

## 🎯 What Makes This Feel Like a Real App?

As you test, evaluate these professional qualities:

### Navigation & Layout
- [ ] Sidebar is always visible and organized
- [ ] Breadcrumbs show current location
- [ ] Active page is highlighted in sidebar
- [ ] Mobile responsive (test by resizing browser)

### Feedback & Communication
- [ ] Every action shows toast notification
- [ ] Success = green, error = red
- [ ] Loading states appear during operations
- [ ] Error messages are helpful, not cryptic

### Data Entry
- [ ] Forms have clear labels
- [ ] Required fields are marked
- [ ] Dropdowns are populated
- [ ] Validation happens before submission
- [ ] Error messages appear on fields

### Data Display
- [ ] Tables are sortable/searchable
- [ ] Pagination works when needed
- [ ] Empty states have helpful messages
- [ ] Stats update in real-time
- [ ] Data is formatted (dates, numbers)

### Professional Polish
- [ ] Consistent design throughout
- [ ] Icons match actions
- [ ] Colors have meaning (red=delete, blue=info)
- [ ] Spacing is uniform
- [ ] No broken images or missing icons

---

## 🐛 Bug Checklist

Test these common issues:

### Data Integrity
- [ ] Can't delete items that are in use (e.g., enrolled courses)
- [ ] Can't create duplicates (same student in same course)
- [ ] Required fields can't be skipped
- [ ] Dates must be in correct format

### Edge Cases
- [ ] What happens with empty search results?
- [ ] What if no data exists yet?
- [ ] Can you exceed course capacity?
- [ ] What if you logout mid-action?

### Performance
- [ ] Pages load within 2 seconds
- [ ] No console errors (open browser DevTools)
- [ ] Charts render smoothly
- [ ] Bulk operations handle 10+ items

---

## 📊 Professional Standards Checklist

Rate the app on these criteria (1-5):

**Usability**
- [ ] Can a new user navigate without help? ___/5
- [ ] Are actions clearly labeled? ___/5
- [ ] Is feedback immediate and clear? ___/5

**Design**
- [ ] Looks professional and modern? ___/5
- [ ] Consistent design language? ___/5
- [ ] Good use of color and spacing? ___/5

**Functionality**
- [ ] All features work as expected? ___/5
- [ ] No broken links or errors? ___/5
- [ ] Data is accurate and makes sense? ___/5

**Overall Feel**
- [ ] Feels like a real production app? ___/5
- [ ] Would you be proud to demo this? ___/5

---

## 💡 Tips for Testing

1. **Think Like a User**: Don't just click buttons - ask "Would I understand this?"
2. **Try to Break It**: Enter weird data, click rapidly, use browser back button
3. **Check Mobile**: Resize browser to phone size
4. **Test Edge Cases**: Empty lists, full capacity, missing data
5. **Note Your Feelings**: If something feels confusing, it probably is

---

## 🎓 What Professionals Do

Real companies test like this:

1. **Manual Testing** (what you're doing now)
   - User flows and scenarios
   - Exploratory testing
   - Visual regression

2. **Automated Testing** (future step)
   - Unit tests for components
   - Integration tests for API calls
   - End-to-end tests with Playwright

3. **User Acceptance Testing** (UAT)
   - Real users try the app
   - Collect feedback
   - Iterate and improve

You're doing **UAT** right now - this is exactly what professionals do before launch!

---

## 📝 Feedback Template

After testing, note down:

**What worked well:**
-
-
-

**What felt confusing:**
-
-
-

**Bugs found:**
-
-
-

**Suggestions for improvement:**
-
-
-

---

## ✅ Final Checklist

Before considering the app "done":

- [ ] All demo accounts work
- [ ] All sidebar links navigate correctly
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Search and filters function properly
- [ ] Charts display accurately
- [ ] Exports download correctly
- [ ] Mobile view is usable
- [ ] No console errors in browser DevTools
- [ ] Toast notifications appear for all actions
- [ ] Welcome card appears for new users
- [ ] App feels professional and polished

---

**Happy Testing!** 🚀

Remember: If you can navigate the app easily and accomplish tasks without frustration, you've built something real and professional!
