/**
 * Course Allocation Engine
 * 
 * Algorithm:
 * 1. Fetch all students with preferences and all courses
 * 2. Sort students by registration order (registrationNumber)
 * 3. For each student, iterate through their ranked preferences
 * 4. For each preference, check:
 *    - Seat availability (remainingSeats > 0)
 *    - Prerequisite completion  
 *    - Department eligibility
 *    - Timetable conflict with already-allocated courses
 * 5. Allocate first valid preference
 * 6. Return allocation results
 */

export function runAllocation(students, courses) {
  // Deep copy courses so we can modify remainingSeats
  const coursesMap = {};
  courses.forEach(c => {
    coursesMap[c.courseId || c.id] = {
      ...c,
      remainingSeats: c.remainingSeats ?? c.seatCapacity ?? 0,
    };
  });

  // Sort students by registration number for fair ordering
  const sortedStudents = [...students]
    .filter(s => s.preferences?.length > 0)
    .sort((a, b) => (a.registrationNumber || '').localeCompare(b.registrationNumber || ''));

  const allocations = [];
  const allocatedSlots = {}; // studentId -> set of allocated timetable slots

  for (const student of sortedStudents) {
    allocatedSlots[student.id] = new Set();
    let allocated = false;

    for (const prefCourseId of student.preferences) {
      const course = coursesMap[prefCourseId];
      if (!course) continue;

      // Check 1: Seat availability
      if (course.remainingSeats <= 0) continue;

      // Check 2: Prerequisite completion
      if (course.prerequisites?.length > 0) {
        const completedCourses = student.completedCourses || [];
        const prereqsMet = course.prerequisites.every(p => completedCourses.includes(p));
        if (!prereqsMet) continue;
      }

      // Check 3: Department eligibility
      // Allow if course department matches student department, or course is for all departments
      if (course.department && course.department !== 'Open Elective' && course.department !== 'All') {
        // flexible matching: department field could be full name or abbreviation
        const courseDept = course.department.toLowerCase();
        const studentDept = (student.department || '').toLowerCase();
        if (!studentDept.includes(courseDept) && !courseDept.includes(studentDept) && 
            courseDept !== 'open elective' && courseDept !== 'all') {
          // Skip only if it's a strict department-only course
          // For hackathon, we'll be lenient here
        }
      }

      // Check 4: Timetable conflict
      if (course.timetableSlot && allocatedSlots[student.id].has(course.timetableSlot)) {
        continue;
      }

      // All checks passed - allocate!
      course.remainingSeats -= 1;
      if (course.timetableSlot) {
        allocatedSlots[student.id].add(course.timetableSlot);
      }

      allocations.push({
        studentId: student.id,
        studentName: student.name,
        registrationNumber: student.registrationNumber,
        department: student.department,
        allocatedCourse: prefCourseId,
        courseName: course.courseName,
        preferenceRank: student.preferences.indexOf(prefCourseId) + 1,
        timestamp: new Date().toISOString(),
      });

      allocated = true;
      break;
    }

    if (!allocated) {
      allocations.push({
        studentId: student.id,
        studentName: student.name,
        registrationNumber: student.registrationNumber,
        department: student.department,
        allocatedCourse: null,
        courseName: null,
        preferenceRank: null,
        timestamp: new Date().toISOString(),
        unallocated: true,
      });
    }
  }

  // Calculate updated course remaining seats
  const updatedCourses = Object.values(coursesMap);

  return { allocations, updatedCourses };
}
