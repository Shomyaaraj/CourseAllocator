/* global global */
if (typeof localStorage === 'undefined') {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

import { getLocalUsers, saveLocalUser } from '../src/utils/mockDatabase.js';

function simulateSignup(email, password, profileData) {
  const localUsers = getLocalUsers();

  if (profileData.registrationNumber) {
    const existing = localUsers.find(u => u.registrationNumber === profileData.registrationNumber);
    if (existing) {
      throw new Error('This registration number is already in use.');
    }
  }

  const mockUid = 'usr_' + Date.now();
  const mockUserObj = {
    uid: mockUid,
    email,
    password,
    role: 'student',
    name: profileData.name,
    registrationNumber: profileData.registrationNumber,
    department: profileData.department,
    semester: profileData.semester,
    cgpa: profileData.cgpa ? Number(profileData.cgpa) : null,
    completedCourses: [],
    preferences: [],
    allocatedCourse: null,
    createdAt: new Date().toISOString(),
  };

  saveLocalUser(mockUserObj);
  return mockUserObj;
}

function simulateAdminSignup(email, password, profileData, inviteCode) {
  if (inviteCode !== 'VUCA2026' && inviteCode !== 'ADMIN123') {
    throw new Error('Invalid invite code. Try default code "VUCA2026".');
  }

  const localUsers = getLocalUsers();
  if (profileData.employeeId) {
    const existing = localUsers.find(u => u.employeeId === profileData.employeeId);
    if (existing) {
      throw new Error('This Employee ID is already registered.');
    }
  }

  const mockUid = 'adm_' + Date.now();
  const mockAdminObj = {
    uid: mockUid,
    email,
    password,
    role: 'admin',
    name: profileData.name,
    employeeId: profileData.employeeId,
    department: profileData.department,
    designation: profileData.designation,
    createdAt: new Date().toISOString(),
  };

  saveLocalUser(mockAdminObj);
  return mockAdminObj;
}

console.log('=== STARTING REGISTRATION TEST ===');

try {
  const student = simulateSignup('priya.patel@vignan.ac.in', 'Password@123', {
    name: 'Priya Patel',
    registrationNumber: '211FA04250',
    department: 'Computer Science',
    semester: 6,
    cgpa: 9.10,
  });
  console.log('✅ Student Registration Successful:', student.name, '(' + student.email + ')');
} catch (err) {
  console.error('❌ Student Registration Error:', err.message);
}

try {
  const admin = simulateAdminSignup('prof.verma@vignan.ac.in', 'Admin@123', {
    name: 'Prof. R. K. Verma',
    employeeId: 'ADM002',
    department: 'Electronics',
    designation: 'Associate Dean',
  }, 'VUCA2026');
  console.log('✅ Admin Registration Successful:', admin.name, '(' + admin.email + ')');
} catch (err) {
  console.error('❌ Admin Registration Error:', err.message);
}

console.log('=== REGISTRATION TEST COMPLETE ===');
