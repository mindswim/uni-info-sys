# Project Cleanup Recommendations

**Generated:** October 1, 2025
**Status:** Recommendations Only - No Changes Made Yet

This document outlines recommended cleanup actions to streamline the project, remove unused dependencies, and eliminate outdated files.

---

## Executive Summary

After comprehensive audit of the codebase, found:
- ✅ **1 complete unused folder** (website/) - ~350KB with dependencies
- ✅ **6 old documentation files** in docs/
- ✅ **1 unused backend package** (Inertia.js)
- ✅ **5 backup/temp files** that can be deleted
- ✅ **3 old frontend documentation files**
- ⚠️ **Frontend stores** - Auth store unused but others active
- ⚠️ **Some Radix UI components** - Need usage verification

**Estimated disk space savings:** ~400MB (mostly node_modules)

---

## 🔴 HIGH PRIORITY - Safe to Delete

### 1. **Entire `/website` Folder** (UNUSED)
- **Path:** `/Users/juan/dev/student-admissions-system/university-admissions/website/`
- **Size:** ~350KB + node_modules (~100MB)
- **Why:** Old prototype Next.js app that's not referenced anywhere
- **Referenced in:** Only in archived docs (already moved to archive/)
- **Action:** DELETE entire folder

```bash
rm -rf website/
```

### 2. **Old Documentation Files in `/docs`**
Delete these numbered guides (superseded by PRODUCTION_ROADMAP.md):
- `docs/00-project-overview-and-guide.md`
- `docs/01-project-health-analysis-and-next-steps.md`
- `docs/02-database-spreadsheet-visualization-guide.md`
- `docs/03-backend-completion-and-frontend-roadmap.md`
- `docs/04-testing-audit-framework.md`
- `docs/05-backend-to-frontend-audit-framework.md`

**Action:** DELETE all 6 files

```bash
rm docs/00-*.md docs/01-*.md docs/02-*.md docs/03-*.md docs/04-*.md docs/05-*.md
```

### 3. **Old Frontend Documentation Files**
Delete completion tracking docs (no longer relevant):
- `frontend/APP_AUDIT.md`
- `frontend/LAUNCH_PLAN.md`
- `frontend/PHASE2_COMPLETE.md`
- `frontend/PHASE3_COMPLETE.md`
- `frontend/README.md` (redundant with root README)

**Action:** DELETE all 5 files

```bash
cd frontend
rm APP_AUDIT.md LAUNCH_PLAN.md PHASE2_COMPLETE.md PHASE3_COMPLETE.md README.md
```

### 4. **Backup and Temp Files**
- `.env.backup` (root) - old env file
- `frontend/token.tmp` - temporary token file
- `frontend/src/contexts/auth-context.tsx.backup` - old backup
- `frontend/src/components/layout/app-sidebar.tsx.backup` - old backup

**Action:** DELETE all backup files

```bash
rm .env.backup
rm frontend/token.tmp
rm frontend/src/contexts/auth-context.tsx.backup
rm frontend/src/components/layout/app-sidebar.tsx.backup
```

### 5. **Unused Backend Package: Inertia.js**
- **Package:** `inertiajs/inertia-laravel`
- **Why Unused:** No references in codebase (0 matches for "Inertia")
- **We use:** Separate Next.js frontend with API, not Inertia SSR

**Action:** Remove from composer.json

```bash
composer remove inertiajs/inertia-laravel
```

---

## 🟡 MEDIUM PRIORITY - Needs Verification

### 6. **Unused Zustand Store: auth-store.ts**
- **Path:** `frontend/src/stores/auth-store.ts`
- **Status:** Commented out in usage (switched to React Context)
- **Other stores still used:** registration, dashboard, notifications, documents

**Action:** If confirmed unused, delete auth-store.ts

```bash
# Verify first:
grep -r "useAuthStore" frontend/src/
# If no active usage:
rm frontend/src/stores/auth-store.ts
```

### 7. **Potentially Unused Frontend Dependencies**
Need usage verification:
- `tw-animate-css` - Tailwind animation utilities (check if used)
- `@hookform/resolvers` - Form validation (check if forms use it)

**Action:** Check usage before removing

```bash
# Check tw-animate-css usage:
grep -r "tw-animate\|animate-" frontend/src/

# Check hookform/resolvers usage:
grep -r "@hookform/resolvers" frontend/src/
```

### 8. **Build Artifacts in Tracked Files**
The `.next` folder shouldn't be tracked but appears to have cached files:
- `website/.next/` - entire build cache
- `frontend/.next/` - should be in .gitignore

**Action:** Verify .gitignore and clean

```bash
# Should already be in .gitignore, but verify:
cat frontend/.gitignore | grep ".next"
cat website/.gitignore | grep ".next"

# Clean build artifacts:
rm -rf frontend/.next
rm -rf website/.next
```

---

## 🟢 LOW PRIORITY - Nice to Have

### 9. **Consolidate Environment Files**
Currently have:
- `.env` (active)
- `.env.example` (template)
- `.env.backup` (DELETE - see above)
- `frontend/.env.local` (active)
- `frontend/.env.local.example` (template)

**Recommendation:** Ensure .env.example is up-to-date, document all variables

### 10. **Component Organization**
Frontend has 148 TSX files. Some categories to consider organizing:
- Old UI components from `components/` that might not be used
- Duplicate shadcn components vs custom components

**Action:** Run usage analysis

```bash
# Find components that might be unused:
cd frontend
for file in src/components/**/*.tsx; do
  name=$(basename "$file" .tsx)
  if [ $(grep -r "import.*$name" src/ | wc -l) -eq 0 ]; then
    echo "Potentially unused: $file"
  fi
done
```

### 11. **Old Migration Files**
Check if any migrations are development-only and can be consolidated:
- Currently have 4 extra migrations beyond base schema
- Consider squashing into schema dump for cleaner migration history

**Action:** Review migration files (after full development complete)

---

## 📊 Cleanup Impact Summary

### Immediate Benefits:
| Category | Files | Est. Space | Impact |
|----------|-------|------------|--------|
| Unused website folder | 1 folder | ~350KB + 100MB deps | High |
| Old documentation | 11 files | ~200KB | Medium |
| Backup files | 4 files | ~50KB | Low |
| Backend package (Inertia) | 1 package | ~5MB | Low |
| **TOTAL** | **~15 files/folders** | **~105MB** | **Significant** |

### Code Quality Benefits:
- ✅ Clearer project structure
- ✅ Faster dependency installation
- ✅ Reduced confusion from old docs
- ✅ Smaller repository size
- ✅ Better maintainability

---

## 🚀 Recommended Cleanup Order

### Phase 1: Safe Deletions (Do Now)
1. ✅ Delete `/website` folder entirely
2. ✅ Delete 6 old docs from `/docs`
3. ✅ Delete 5 frontend doc files
4. ✅ Delete 4 backup/temp files
5. ✅ Remove Inertia.js composer package

**Commands:**
```bash
# From project root:
rm -rf website/
rm docs/00-*.md docs/01-*.md docs/02-*.md docs/03-*.md docs/04-*.md docs/05-*.md
cd frontend && rm APP_AUDIT.md LAUNCH_PLAN.md PHASE2_COMPLETE.md PHASE3_COMPLETE.md README.md
rm token.tmp src/contexts/auth-context.tsx.backup src/components/layout/app-sidebar.tsx.backup
cd ..
rm .env.backup
composer remove inertiajs/inertia-laravel
git add -A
git commit -m "Clean up unused files, folders, and dependencies

- Removed entire /website folder (old prototype)
- Deleted 11 old documentation files
- Removed 4 backup/temp files
- Removed unused Inertia.js backend package
- Saves ~105MB disk space"
```

### Phase 2: Verification Needed (Do After Testing)
1. ⚠️ Verify auth-store.ts is unused → Delete if confirmed
2. ⚠️ Check tw-animate-css usage → Remove if unused
3. ⚠️ Check @hookform/resolvers usage → Remove if unused
4. ⚠️ Clean .next build artifacts
5. ⚠️ Update .env.example with current variables

### Phase 3: Deep Cleanup (Do Before Production)
1. 🔍 Component usage analysis
2. 🔍 Migration consolidation
3. 🔍 Unused route cleanup
4. 🔍 Dead code elimination

---

## ⚠️ Important Notes

### DO NOT Delete:
- ❌ `docs/archive/` - Historical reference, already archived properly
- ❌ `frontend/src/stores/` - Most stores ARE being used (registration, dashboard, etc)
- ❌ Any `.env` or `.env.local` files (except .backup)
- ❌ `components.json` - shadcn configuration
- ❌ Package lock files

### Backup Strategy:
Before cleanup, ensure:
1. ✅ All changes committed to git
2. ✅ Can rollback if needed: `git revert HEAD`
3. ✅ Test application after cleanup
4. ✅ Rebuild dependencies: `npm install` and `composer install`

---

## 🎯 Expected Outcomes

### After Phase 1 Cleanup:
- **Disk space freed:** ~105MB
- **Files removed:** ~15 files/folders
- **Packages removed:** 1 backend package
- **Cleaner structure:** ✅ Clear project organization
- **Faster builds:** ✅ Fewer dependencies to process
- **Better docs:** ✅ Only relevant documentation remains

### Post-Cleanup Testing:
```bash
# Backend tests:
./vendor/bin/sail artisan test

# Frontend build:
cd frontend
npm run build

# Verify no broken imports:
npm run lint
```

---

## 📝 Cleanup Checklist

- [ ] Backup current state with git commit
- [ ] Delete `/website` folder
- [ ] Delete old documentation files (11 files)
- [ ] Delete backup/temp files (4 files)
- [ ] Remove Inertia.js package
- [ ] Run `composer install` to update lock file
- [ ] Test backend API (verify no breaking changes)
- [ ] Test frontend build (verify no import errors)
- [ ] Run lint checks
- [ ] Commit cleanup changes
- [ ] Update PRODUCTION_ROADMAP.md if needed

---

**Next Step:** Review this document and approve Phase 1 cleanup, or request modifications before proceeding.
