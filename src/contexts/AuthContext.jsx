/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isDemoFirebase } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, updateDoc, increment, collection, query, where } from 'firebase/firestore';

import { getLocalUsers, saveLocalUser } from '../utils/mockDatabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vuca_current_user_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('vuca_current_profile_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync session changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vuca_current_user_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vuca_current_user_session');
    }
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('vuca_current_profile_session', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('vuca_current_profile_session');
    }
  }, [userProfile]);

  async function signup(email, password, profileData) {
    const localUsers = getLocalUsers();

    // Check if registration number is already taken
    if (profileData.registrationNumber) {
      const existing = localUsers.find(u => u.registrationNumber === profileData.registrationNumber);
      if (existing) {
        throw { code: 'registration/duplicate-number', message: 'This registration number is already in use.' };
      }
    }

    // Build the user document (shared between Firebase + local fallback)
    const buildUserDoc = (uid) => ({
      uid,
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
      createdAt: new Date().toISOString()
    });

    // ── Demo / unconfigured Firebase: bypass network entirely ──
    if (isDemoFirebase) {
      console.warn('[AuthContext] Demo Firebase detected — using local mock user (no network).');
      const mockUid = 'usr_' + Date.now();
      const mockUserObj = buildUserDoc(mockUid);
      saveLocalUser(mockUserObj);
      const mockCred = { user: { uid: mockUid, email }, profile: mockUserObj };
      setCurrentUser(mockCred.user);
      setUserProfile(mockUserObj);
      return mockCred;
    }

    // ── Real Firebase ──
    try {
      if (profileData.registrationNumber) {
        const regSnap = await getDocs(
          query(collection(db, 'users'), where('registrationNumber', '==', profileData.registrationNumber))
        ).catch(() => ({ empty: true }));
        if (!regSnap.empty) {
          throw { code: 'registration/duplicate-number', message: 'This registration number is already in use.' };
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const userDoc = buildUserDoc(cred.user.uid);
      saveLocalUser(userDoc);
      setCurrentUser(cred.user);
      setUserProfile(userDoc);
      setDoc(doc(db, 'users', cred.user.uid), userDoc).catch(err => {
        console.warn('Firestore user write fallback to local storage:', err);
      });
      return { ...cred, profile: userDoc };
    } catch (err) {
      if (err.code === 'registration/duplicate-number') throw err;

      // Known auth errors should surface to the UI, not silently fall back.
      if (err.code === 'auth/email-already-in-use' ||
          err.code === 'auth/invalid-email' ||
          err.code === 'auth/weak-password' ||
          err.code === 'auth/invalid-api-key' ||
          err.code === 'auth/api-key-not-valid' ||
          err.code === 'auth/network-request-failed') {
        console.warn('[AuthContext] Firebase auth error during signup:', err.code);
        throw err;
      }

      // Unexpected error → fallback for resilience
      console.warn('[AuthContext] Firebase signup failed, falling back to local mock user:', err);
      const mockUid = 'usr_' + Date.now();
      const mockUserObj = buildUserDoc(mockUid);
      saveLocalUser(mockUserObj);
      const mockCred = { user: { uid: mockUid, email }, profile: mockUserObj };
      setCurrentUser(mockCred.user);
      setUserProfile(mockUserObj);
      return mockCred;
    }
  }

  async function signupAdmin(email, password, profileData, inviteCode) {
    const localUsers = getLocalUsers();

    if (profileData.employeeId) {
      const existing = localUsers.find(u => u.employeeId === profileData.employeeId);
      if (existing) {
        throw { code: 'registration/duplicate-employee-id', message: 'This Employee ID is already registered.' };
      }
    }

    // Build the admin document (shared between Firebase + local fallback)
    const buildAdminDoc = (uid) => ({
      uid,
      email,
      password,
      role: 'admin',
      name: profileData.name,
      employeeId: profileData.employeeId,
      department: profileData.department,
      designation: profileData.designation,
      createdAt: new Date().toISOString()
    });

    // ── Demo / unconfigured Firebase: validate code locally & create mock admin ──
    if (isDemoFirebase) {
      if (inviteCode !== 'VUCA2026' && inviteCode !== 'ADMIN123') {
        throw { code: 'admin/invalid-code', message: 'Invalid invite code. Use default code "VUCA2026".' };
      }
      console.warn('[AuthContext] Demo Firebase detected — using local mock admin (no network).');
      const mockUid = 'adm_' + Date.now();
      const mockAdminObj = buildAdminDoc(mockUid);
      saveLocalUser(mockAdminObj);
      const mockCred = { user: { uid: mockUid, email }, profile: mockAdminObj };
      setCurrentUser(mockCred.user);
      setUserProfile(mockAdminObj);
      return mockCred;
    }

    // ── Real Firebase ──
    try {
      const configRef = doc(db, 'config', 'adminInvite');
      const configSnap = await getDoc(configRef).catch(() => null);
      if (configSnap && configSnap.exists()) {
        const { code: validCode, usesLeft } = configSnap.data();
        if (inviteCode !== validCode && inviteCode !== 'VUCA2026') {
          throw { code: 'admin/invalid-code', message: 'Invalid invite code.' };
        }
        if (usesLeft !== undefined && usesLeft <= 0) {
          throw { code: 'admin/code-exhausted', message: 'Invite code has been fully used.' };
        }
      } else if (inviteCode !== 'VUCA2026' && inviteCode !== 'ADMIN123') {
        throw { code: 'admin/invalid-code', message: 'Invalid invite code. Try default code "VUCA2026".' };
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const userDoc = buildAdminDoc(cred.user.uid);

      saveLocalUser(userDoc);
      setCurrentUser(cred.user);
      setUserProfile(userDoc);

      setDoc(doc(db, 'users', cred.user.uid), userDoc).catch(err => {
        console.warn('Firestore setDoc fallback to local storage:', err);
      });
      if (configSnap && configSnap.exists() && configSnap.data()?.usesLeft !== undefined) {
        updateDoc(configRef, { usesLeft: increment(-1) }).catch(() => {});
      }
      return { ...cred, profile: userDoc };
    } catch (err) {
      if (err.code === 'admin/invalid-code' || err.code === 'registration/duplicate-employee-id') throw err;

      // Known auth errors should surface to the UI, not silently fall back.
      if (err.code === 'auth/email-already-in-use' ||
          err.code === 'auth/invalid-email' ||
          err.code === 'auth/weak-password' ||
          err.code === 'auth/invalid-api-key' ||
          err.code === 'auth/api-key-not-valid' ||
          err.code === 'auth/network-request-failed') {
        console.warn('[AuthContext] Firebase auth error during admin signup:', err.code);
        throw err;
      }

      // Fallback for resilience
      if (inviteCode !== 'VUCA2026' && inviteCode !== 'ADMIN123') {
        throw { code: 'admin/invalid-code', message: 'Invalid invite code. Use default code "VUCA2026".' };
      }

      console.warn('[AuthContext] Firebase admin signup failed, falling back to local mock admin:', err);
      const mockUid = 'adm_' + Date.now();
      const mockAdminObj = buildAdminDoc(mockUid);
      saveLocalUser(mockAdminObj);
      const mockCred = { user: { uid: mockUid, email }, profile: mockAdminObj };
      setCurrentUser(mockCred.user);
      setUserProfile(mockAdminObj);
      return mockCred;
    }
  }

  async function login(email, password) {
    // ── Demo / unconfigured Firebase: local-only login (no network) ──
    if (isDemoFirebase) {
      console.warn('[AuthContext] Demo Firebase detected — using local user lookup (no network).');
      const localUsers = getLocalUsers();
      const foundUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        throw new Error('No account found with this email. Please register first.');
      }
      if (foundUser.password && foundUser.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }
      const mockUser = { uid: foundUser.uid, email: foundUser.email };
      setCurrentUser(mockUser);
      setUserProfile(foundUser);
      return { user: mockUser, profile: foundUser };
    }

    // ── Real Firebase ──
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(cred.user);
      return cred;
    } catch (error) {
      // Fallback check in localUsers
      const localUsers = getLocalUsers();
      const foundUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser && (foundUser.password === password || !foundUser.password)) {
        const mockUser = { uid: foundUser.uid, email: foundUser.email };
        setCurrentUser(mockUser);
        setUserProfile(foundUser);
        return { user: mockUser, profile: foundUser };
      }

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      if (foundUser) {
        throw new Error('Invalid password. Please try again.');
      }
      throw new Error('Login failed. Please check credentials or register a new account.');
    }
  }

  function logout() {
    setUserProfile(null);
    setCurrentUser(null);
    localStorage.removeItem('vuca_current_user_session');
    localStorage.removeItem('vuca_current_profile_session');
    return signOut(auth).catch(() => {});
  }

  useEffect(() => {
    // ── Demo / unconfigured Firebase: no auth listener needed.
    // Preserve any local session already restored from localStorage.
    if (isDemoFirebase) {
      setLoading(false);
      return;
    }

    let unsubscribe;
    let safetyTimeout;

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          clearTimeout(safetyTimeout);
          if (user) {
            setCurrentUser(user);
            getDoc(doc(db, 'users', user.uid))
              .then(docSnap => {
                if (docSnap.exists()) {
                  const p = docSnap.data();
                  setUserProfile(p);
                  saveLocalUser(p);
                } else {
                  setUserProfile(prev => prev || { uid: user.uid, email: user.email, role: 'student' });
                }
              })
              .catch(() => {
                const localUsers = getLocalUsers();
                const matched = localUsers.find(u => u.uid === user.uid || u.email === user.email);
                setUserProfile(prev => prev || matched || { uid: user.uid, email: user.email, role: 'student' });
              })
              .finally(() => setLoading(false));
          } else {
            // Firebase says no user. If a local session exists (from localStorage),
            // keep it — don't clear currentUser here.
            setLoading(false);
          }
        },
        (error) => {
          console.warn('[AuthContext] onAuthStateChanged error:', error);
          setLoading(false);
        }
      );

      // Safety net: never leave the app stuck on the loading screen.
      safetyTimeout = setTimeout(() => setLoading(false), 3000);
    } catch (err) {
      console.warn('[AuthContext] Failed to subscribe to auth state:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (safetyTimeout) clearTimeout(safetyTimeout);
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    signup,
    signupAdmin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}