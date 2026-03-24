/**
 * Gale-Shapley Stable Matching — Course Allocation Engine
 *
 * Student-Proposing Variant with Random Fallback:
 * 1. All students are "free" and have a pointer to their next un-tried preference.
 * 2. While any free student still has untried preferences:
 *    a. Student proposes to their next preferred course.
 *    b. If the course has a free seat → tentatively accept.
 *    c. If the course is full → compare the proposing student against the worst
 *       current enrollee (ranked by CGPA descending; ties broken by
 *       registrationNumber ascending = lower number is "earlier/better").
 *       - Proposing student wins → eject worst, accept challenger.
 *       - Proposing student loses → reject challenger; try next preference.
 * 3. Terminates when all students are allocated or have no more preferences.
 * 4. After Gale-Shapley: students with NO preferences OR who went unallocated
 *    are randomly assigned to any course that still has remaining seats.
 *
 * Stability guarantee: no student-course pair both prefer each other over
 * their current assignment (for preference-based allocations).
 */

/**
 * Numeric priority for a student. Higher = better seat claim.
 * Primary: CGPA (higher wins). Secondary: reg. number length+lex (shorter/earlier wins).
 */
function priority(student) {
  if (!student) return 0;
  return parseFloat(student.cgpa) || 0;
}

/**
 * Returns true if `a` should DISPLACE `b` from a course seat.
 */
function beats(a, b) {
  const pa = priority(a);
  const pb = priority(b);
  if (pa !== pb) return pa > pb;
  const ra = a.registrationNumber || '';
  const rb = b.registrationNumber || '';
  return ra < rb;
}

/** Find the index of the student with the LOWEST priority in the array. */
function worstIndex(enrolledArr) {
  let idx = 0;
  for (let i = 1; i < enrolledArr.length; i++) {
    if (beats(enrolledArr[idx], enrolledArr[i])) idx = i;
  }
  return idx;
}

/** Check eligibility of student for a course given their current timetable. */
function isEligible(student, course, occupiedSlots) {
  if (course.prerequisites?.length > 0) {
    const done = student.completedCourses || [];
    if (!course.prerequisites.every(p => done.includes(p))) return false;
  }
  if (course.timetableSlot && occupiedSlots.has(course.timetableSlot)) return false;
  return true;
}

/**
 * Shuffle array in-place (Fisher-Yates).
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Run the Gale-Shapley course allocation.
 *
 * @param {Object[]} students        Firestore student objects
 * @param {Object[]} courses         Firestore course objects
 * @param {string[]} [skipStudentIds] Student IDs to skip (already allocated — for partial re-run)
 * @returns {{ allocations: Object[], updatedCourses: Object[] }}
 */
export function runAllocation(students, courses, skipStudentIds = []) {
  const skipSet = new Set(skipStudentIds);

  /* ── Build course state ── */
  const courseMap = {};
  for (const c of courses) {
    const key = c.courseId || c.id;
    const cap = Math.max(0, c.remainingSeats ?? c.seatCapacity ?? 0);
    courseMap[key] = { ...c, _key: key, seatCapacity: cap, enrolled: [] };
  }

  /* ── Separate students to process vs skip ── */
  // Filter out any undefined/null entries or students without an id to prevent crashes
  const activeStudents = students
    .filter(s => s && s.id && !skipSet.has(s.id));
  const studentsWithPrefs = activeStudents.filter(s => s.preferences?.length > 0);
  const studentsWithoutPrefs = activeStudents.filter(s => !s.preferences?.length);

  /* ── Build state for preference-having students ── */
  const state = new Map();
  for (const s of studentsWithPrefs) {
    state.set(s.id, { student: s, propIdx: 0, allocKey: null, occupiedSlots: new Set() });
  }

  /* ── Gale-Shapley main loop ── */
  let free = [...studentsWithPrefs];
  while (free.length > 0) {
    const nextFree = [];
    for (const student of free) {
      const st = state.get(student.id);
      while (st.propIdx < student.preferences.length) {
        const key = student.preferences[st.propIdx++];
        const course = courseMap[key];
        if (!course) continue;
        if (course.seatCapacity <= 0) continue; // zero-capacity course → skip, random fallback will handle
        if (!isEligible(student, course, st.occupiedSlots)) continue;

        if (course.enrolled.length < course.seatCapacity) {
          course.enrolled.push(student);
          st.allocKey = key;
          if (course.timetableSlot) st.occupiedSlots.add(course.timetableSlot);
          break;
        } else {
          const wi = worstIndex(course.enrolled);
          const worst = course.enrolled[wi];
          if (!worst) continue; // safety guard: enrolled array had a gap, skip this course
          if (beats(student, worst)) {
            course.enrolled.splice(wi, 1);
            course.enrolled.push(student);
            st.allocKey = key;
            if (course.timetableSlot) st.occupiedSlots.add(course.timetableSlot);
            const wst = state.get(worst.id);
            if (wst) {
              wst.allocKey = null;
              if (course.timetableSlot) wst.occupiedSlots.delete(course.timetableSlot);
              nextFree.push(worst);
            }
            break;
          }
        }
      }
    }
    free = nextFree;
  }

  /* ── Collect unallocated from preference group ── */
  const unallocatedFromPrefs = [];
  for (const [, st] of state) {
    if (!st.allocKey) unallocatedFromPrefs.push(st.student);
  }

  /* ── Random fallback: no-preference students + unallocated preference students ── */
  const needsRandom = shuffle([...studentsWithoutPrefs, ...unallocatedFromPrefs]);
  const randomAssignments = new Map(); // studentId → { allocKey, courseName, timetableSlot }

  for (const student of needsRandom) {
    // Find courses with remaining seats that are eligible
    const availableCourseKeys = Object.keys(courseMap).filter(key => {
      const c = courseMap[key];
      const remainingSeats = c.seatCapacity - c.enrolled.length;
      if (remainingSeats <= 0) return false;
      // Basic eligibility (no timetable state tracked for random, so skip slot check)
      if (c.prerequisites?.length > 0) {
        const done = student.completedCourses || [];
        if (!c.prerequisites.every(p => done.includes(p))) return false;
      }
      return true;
    });

    if (availableCourseKeys.length === 0) continue;

    // Pick a random available course
    const randomKey = availableCourseKeys[Math.floor(Math.random() * availableCourseKeys.length)];
    const course = courseMap[randomKey];
    course.enrolled.push(student);
    randomAssignments.set(student.id, {
      allocKey: randomKey,
      courseName: course.courseName || null,
      timetableSlot: course.timetableSlot || null,
    });
  }

  /* ── Compile results ── */
  const allocations = [];

  // Students who went through Gale-Shapley
  for (const [, st] of state) {
    const { student, allocKey } = st;
    const randomFallback = randomAssignments.get(student.id);
    const finalKey = allocKey || randomFallback?.allocKey || null;
    const course = finalKey ? courseMap[finalKey] : null;
    allocations.push({
      studentId: student.id,
      studentName: student.name,
      registrationNumber: student.registrationNumber || null,
      department: student.department || null,
      cgpa: student.cgpa ?? null,
      preferences: student.preferences,
      allocatedCourse: finalKey || null,
      courseName: course?.courseName || randomFallback?.courseName || null,
      timetableSlot: course?.timetableSlot || randomFallback?.timetableSlot || null,
      preferenceRank: allocKey ? student.preferences.indexOf(allocKey) + 1 : null,
      // Flag: was this a random fallback?
      randomlyAssigned: !allocKey && !!randomFallback?.allocKey,
      unallocated: !finalKey,
      timestamp: new Date().toISOString(),
    });
  }

  // Students with no preferences
  for (const student of studentsWithoutPrefs) {
    const randomFallback = randomAssignments.get(student.id);
    allocations.push({
      studentId: student.id,
      studentName: student.name,
      registrationNumber: student.registrationNumber || null,
      department: student.department || null,
      cgpa: student.cgpa ?? null,
      preferences: [],
      allocatedCourse: randomFallback?.allocKey || null,
      courseName: randomFallback?.courseName || null,
      timetableSlot: randomFallback?.timetableSlot || null,
      preferenceRank: null,
      randomlyAssigned: !!randomFallback?.allocKey,
      unallocated: !randomFallback?.allocKey,
      timestamp: new Date().toISOString(),
    });
  }

  /* ── Updated course seats ── */
  const updatedCourses = Object.values(courseMap).map(({ enrolled, _key, ...rest }) => ({
    ...rest,
    remainingSeats: Math.max(0, rest.seatCapacity - enrolled.length),
  }));

  return { allocations, updatedCourses };
}