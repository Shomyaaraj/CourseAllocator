/**
 * Gale-Shapley Stable Matching — Course Allocation Engine
 *
 * Student-Proposing Variant:
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
 *
 * Stability guarantee: no student-course pair both prefer each other over
 * their current assignment.
 */

/**
 * Numeric priority for a student. Higher = better seat claim.
 * Primary: CGPA (higher wins). Secondary: reg. number length+lex (shorter/earlier wins).
 */
function priority(student) {
  return parseFloat(student.cgpa) || 0;
}

/**
 * Returns true if `a` should DISPLACE `b` from a course seat.
 * (i.e., a has strictly higher claim than b)
 */
function beats(a, b) {
  const pa = priority(a);
  const pb = priority(b);
  if (pa !== pb) return pa > pb;
  // Tiebreak: lexicographically earlier registration number "wins"
  const ra = a.registrationNumber || '';
  const rb = b.registrationNumber || '';
  return ra < rb;
}

/** Find the index of the student with the LOWEST priority in the array. */
function worstIndex(enrolledArr) {
  let idx = 0;
  for (let i = 1; i < enrolledArr.length; i++) {
    // If enrolledArr[idx] beats enrolledArr[i], then i is "worse" than idx — update idx
    if (beats(enrolledArr[idx], enrolledArr[i])) {
      idx = i;
    }
  }
  return idx;
}

/** Check eligibility of student for a course given their current timetable. */
function isEligible(student, course, occupiedSlots) {
  // Prerequisite check
  if (course.prerequisites?.length > 0) {
    const done = student.completedCourses || [];
    if (!course.prerequisites.every(p => done.includes(p))) return false;
  }
  // Timetable conflict
  if (course.timetableSlot && occupiedSlots.has(course.timetableSlot)) return false;
  return true;
}

/**
 * Run the Gale-Shapley course allocation.
 *
 * @param {Object[]} students  Firestore student objects
 * @param {Object[]} courses   Firestore course objects
 * @returns {{ allocations: Object[], updatedCourses: Object[] }}
 */
export function runAllocation(students, courses) {
  /* ── Build course state ──────────────────────────────────────────────────── */
  const courseMap = {};
  for (const c of courses) {
    const key = c.courseId || c.id;
    const cap = Math.max(0, c.seatCapacity ?? c.remainingSeats ?? 0);
    courseMap[key] = { ...c, _key: key, seatCapacity: cap, enrolled: [] };
  }

  /* ── Build student state ─────────────────────────────────────────────────── */
  const eligible_students = students.filter(s => s.preferences?.length > 0);
  const state = new Map(); // studentId → { student, propIdx, allocKey, occupiedSlots }
  for (const s of eligible_students) {
    state.set(s.id, { student: s, propIdx: 0, allocKey: null, occupiedSlots: new Set() });
  }

  /* ── Free pool ───────────────────────────────────────────────────────────── */
  let free = [...eligible_students];

  /* ── Main loop ───────────────────────────────────────────────────────────── */
  while (free.length > 0) {
    const nextFree = [];

    for (const student of free) {
      const st = state.get(student.id);

      while (st.propIdx < student.preferences.length) {
        const key = student.preferences[st.propIdx++];
        const course = courseMap[key];
        if (!course) continue;
        if (!isEligible(student, course, st.occupiedSlots)) continue;

        if (course.enrolled.length < course.seatCapacity) {
          /* ── Seat available ── */
          course.enrolled.push(student);
          st.allocKey = key;
          if (course.timetableSlot) st.occupiedSlots.add(course.timetableSlot);
          break; // accepted, exit while-loop
        } else {
          /* ── Course full — compare against worst enrollee ── */
          const wi = worstIndex(course.enrolled);
          const worst = course.enrolled[wi];

          if (beats(student, worst)) {
            /* ── Challenger wins → eject worst ── */
            course.enrolled.splice(wi, 1);
            course.enrolled.push(student);
            st.allocKey = key;
            if (course.timetableSlot) st.occupiedSlots.add(course.timetableSlot);

            const wst = state.get(worst.id);
            if (wst) {
              wst.allocKey = null;
              if (course.timetableSlot) wst.occupiedSlots.delete(course.timetableSlot);
              nextFree.push(worst); // ejected student re-enters free pool
            }
            break; // accepted
          }
          // else: lost → try next preference
        }
      }
      // If we exhausted all preferences → stays unallocated (no push to nextFree)
    }

    free = nextFree;
  }

  /* ── Compile results ─────────────────────────────────────────────────────── */
  const allocations = [];
  for (const [, st] of state) {
    const { student, allocKey } = st;
    const course = allocKey ? courseMap[allocKey] : null;
    allocations.push({
      studentId: student.id,
      studentName: student.name,
      registrationNumber: student.registrationNumber || null,
      department: student.department || null,
      cgpa: student.cgpa ?? null,
      preferences: student.preferences,
      allocatedCourse: allocKey || null,
      courseName: course?.courseName || null,
      timetableSlot: course?.timetableSlot || null,
      preferenceRank: allocKey ? student.preferences.indexOf(allocKey) + 1 : null,
      unallocated: !allocKey,
      timestamp: new Date().toISOString(),
    });
  }

  /* ── Updated course seats ────────────────────────────────────────────────── */
  const updatedCourses = Object.values(courseMap).map(({ enrolled, _key, ...rest }) => ({
    ...rest,
    remainingSeats: Math.max(0, rest.seatCapacity - enrolled.length),
  }));

  return { allocations, updatedCourses };
}
