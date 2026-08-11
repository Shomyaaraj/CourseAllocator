// src/utils/mockDatabase.js

const INITIAL_COURSES = [
  {
    id: 'course-1',
    courseId: 'CS301',
    courseName: 'Machine Learning & AI',
    department: 'Computer Science',
    seatCapacity: 60,
    remainingSeats: 60,
    prerequisites: [],
    timetableSlot: 'Monday 09:00–10:30',
  },
  {
    id: 'course-2',
    courseId: 'CS302',
    courseName: 'Cloud Computing Architecture',
    department: 'Computer Science',
    seatCapacity: 45,
    remainingSeats: 45,
    prerequisites: [],
    timetableSlot: 'Tuesday 11:00–12:30',
  },
  {
    id: 'course-3',
    courseId: 'EC301',
    courseName: 'Digital Signal Processing',
    department: 'Electronics & Communication',
    seatCapacity: 50,
    remainingSeats: 50,
    prerequisites: [],
    timetableSlot: 'Wednesday 10:00–11:30',
  },
  {
    id: 'course-4',
    courseId: 'OE101',
    courseName: 'Cyber Security Fundamentals',
    department: 'Open Elective',
    seatCapacity: 80,
    remainingSeats: 80,
    prerequisites: [],
    timetableSlot: 'Thursday 14:00–15:30',
  },
  {
    id: 'course-5',
    courseId: 'OE102',
    courseName: 'Data Analytics & Visualization',
    department: 'Open Elective',
    seatCapacity: 75,
    remainingSeats: 75,
    prerequisites: [],
    timetableSlot: 'Friday 09:00–10:30',
  },
];

const INITIAL_USERS = [
  {
    uid: 'demo-admin-1',
    email: 'admin@vignan.ac.in',
    password: 'password123',
    role: 'admin',
    name: 'Dr. S. K. Sharma',
    employeeId: 'ADM001',
    department: 'Computer Science',
    designation: 'Head of Department',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'demo-student-1',
    email: 'student@vignan.ac.in',
    password: 'password123',
    role: 'student',
    name: 'Rahul Kumar',
    registrationNumber: '211FA04001',
    department: 'Computer Science',
    semester: '6',
    cgpa: 8.75,
    completedCourses: [],
    preferences: ['course-1', 'course-4'],
    allocatedCourse: null,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'demo-student-2',
    email: 'ananya.sharma@vignan.ac.in',
    password: 'Password@123',
    role: 'student',
    name: 'Ananya Sharma',
    registrationNumber: '211FA04199',
    department: 'Computer Science',
    semester: '6',
    cgpa: 8.95,
    completedCourses: [],
    preferences: ['course-1', 'course-2', 'course-4'],
    allocatedCourse: null,
    createdAt: new Date().toISOString(),
  },
];

export function getLocalUsers() {
  const data = localStorage.getItem('vuca_mock_users');
  if (!data) {
    localStorage.setItem('vuca_mock_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveLocalUser(user) {
  const users = getLocalUsers();
  const index = users.findIndex(u => u.uid === user.uid || u.email === user.email);
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem('vuca_mock_users', JSON.stringify(users));
  return user;
}

export function getLocalCourses() {
  const data = localStorage.getItem('vuca_mock_courses');
  if (!data) {
    localStorage.setItem('vuca_mock_courses', JSON.stringify(INITIAL_COURSES));
    return INITIAL_COURSES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_COURSES;
  }
}

export function saveLocalCourses(courses) {
  localStorage.setItem('vuca_mock_courses', JSON.stringify(courses));
}

export function getLocalSettings() {
  const data = localStorage.getItem('vuca_mock_settings');
  if (!data) {
    const defaultSettings = {
      preferenceDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxPreferencesPerStudent: 6,
      minCgpaRequirement: 5.0,
      autoAllocationMode: 'cgpa_preference',
    };
    localStorage.setItem('vuca_mock_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function saveLocalSettings(settings) {
  localStorage.setItem('vuca_mock_settings', JSON.stringify(settings));
}
