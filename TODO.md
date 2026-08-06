# Fix Plan for Registration Issue — ✅ COMPLETE

## Summary of Changes

### 1. `src/firebase.js`
- Added `isDemoFirebase` export flag — derived from whether `VITE_FIREBASE_API_KEY` is missing or uses the demo placeholder.

### 2. `src/contexts/AuthContext.jsx`
- **`signup`**: In demo mode, skips Firebase entirely → creates local mock user instantly with `console.warn`.
- **`signupAdmin`**: Same demo-mode shortcut (validates invite code first, then local creation).
- **`login`**: In demo mode, searches local users directly and returns both `{ user, profile }`. In real mode, falls back to local lookup on network errors.
- **`onAuthStateChanged`**: In demo mode, skips Firebase listener and sets `loading=false` (preserving local session). In real mode, keeps `currentUser` intact when Firebase returns `null`. Added safety timeout.

### 3. `src/pages/LoginPage.jsx`
- Role verification now uses `cred.profile?.role` first (works for demo/local users), then falls back to Firestore `getDoc` wrapped in try/catch.

### 4. `src/pages/RegisterPage.jsx`
- Added error mappings for `auth/network-request-failed`, `auth/invalid-api-key`, `auth/api-key-not-valid`.

### 5. `src/pages/AdminRegisterPage.jsx`
- Added same network/api-key error mappings + `finally` to reset loading state.

### 6. `src/pages/student/StudentDashboard.jsx`
- `fetchAppData` uses `getLocalCourses()` / `getLocalSettings()` when `isDemoFirebase` is true.

### 7. `src/pages/student/PreferencePage.jsx`
- All `getDocs`/`getDoc` calls wrapped with `isDemoFirebase` → local fallback.

### 8. `src/pages/student/ResultsPage.jsx`
- Same `isDemoFirebase` → local data fallback.

### 9. `src/pages/admin/AdminDashboard.jsx`
- `fetchStats` uses `getLocalUsers()`/`getLocalCourses()`/`getLocalSettings()` when `isDemoFirebase` is true.

### 10. `src/pages/admin/CourseManagement.jsx`
- All CRUD operations check `isDemoFirebase` → localStorage operations.

### 11. `src/pages/admin/StudentPreferences.jsx`
- Fetches students from `getLocalUsers()` when `isDemoFirebase` is true.

### 12. `src/pages/admin/AllocationPage.jsx`
- Uses `getLocalUsers()`/`getLocalCourses()`/`getLocalSettings()` when `isDemoFirebase` is true.

### 13. `src/pages/admin/ReportsPage.jsx`
- Uses `getLocalCourses()`/`getLocalUsers()` + local allocations when `isDemoFirebase` is true.

### 14. `src/pages/admin/SettingsPage.jsx`
- Uses `getLocalSettings()`/`saveLocalSettings()` when `isDemoFirebase` is true.

### 15. `src/utils/allocationEngine.js` — FIX: allocations were not being created
- **Root cause**: The engine filtered students via `s.id`, but local mock users only have `uid`. In demo mode, `getLocalUsers()` returns objects with `uid` and no `id`, so `activeStudents` was empty → 0 allocations.
- **Fix**: Added `studentKey(student)` helper (`id || uid`) and replaced all `s.id`/`student.id`/`worst.id` references in the engine so it works with both Firestore docs (`id`) and local mock users (`uid`).
- **Verified**: Node test with `uid`-based students → all 3 students allocated (2 by preference, 1 random fallback), seat counts decremented correctly.

## Verification
- ✅ `npm run build` — 0 errors, 1247 modules transformed
- ✅ `node scripts/testRegistrationFlow.js` — Student + Admin registration both pass
- ✅ `node` allocation-engine smoke test — `uid`-based local students now allocate correctly
