import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, updateDoc, increment, collection, query, where } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, profileData) {
    // Check if registration number is already taken
    if (profileData.registrationNumber) {
      const regSnap = await getDocs(
        query(collection(db, 'users'), where('registrationNumber', '==', profileData.registrationNumber))
      );
      if (!regSnap.empty) {
        throw { code: 'registration/duplicate-number', message: 'This registration number is already in use.' };
      }
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userDoc = {
      uid: cred.user.uid,
      email,
      role: 'student',
      name: profileData.name,
      registrationNumber: profileData.registrationNumber,
      department: profileData.department,
      semester: profileData.semester,
      cgpa: profileData.cgpa ?? null,
      completedCourses: [],
      preferences: [],
      allocatedCourse: null,
      createdAt: new Date().toISOString()
    };
    setUserProfile(userDoc);
    setDoc(doc(db, 'users', cred.user.uid), userDoc)
      .catch(err => {
        console.error('Error writing user profile to Firestore in background:', err);
      });
    return cred;
  }

  async function signupAdmin(email, password, profileData, inviteCode) {
    const configRef = doc(db, 'config', 'adminInvite');
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      throw { code: 'admin/no-config', message: 'Admin registration is not configured.' };
    }
    const { code: validCode, usesLeft } = configSnap.data();
    if (inviteCode !== validCode) {
      throw { code: 'admin/invalid-code', message: 'Invalid invite code.' };
    }
    if (usesLeft !== undefined && usesLeft <= 0) {
      throw { code: 'admin/code-exhausted', message: 'Invite code has been fully used.' };
    }

    // Check if employee ID is already taken
    if (profileData.employeeId) {
      const empSnap = await getDocs(
        query(collection(db, 'users'), where('employeeId', '==', profileData.employeeId))
      );
      if (!empSnap.empty) {
        throw { code: 'registration/duplicate-employee-id', message: 'This Employee ID is already registered.' };
      }
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userDoc = {
      uid: cred.user.uid,
      email,
      role: 'admin',
      name: profileData.name,
      employeeId: profileData.employeeId,
      department: profileData.department,
      designation: profileData.designation,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', cred.user.uid), userDoc);
    if (usesLeft !== undefined) {
      await updateDoc(configRef, { usesLeft: increment(-1) });
    }

    setUserProfile(userDoc);
    return cred;
  }

  // ✅ FIXED: login now throws user-friendly errors
  async function login(email, password) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-credential':
          // Fired when Email Enumeration Protection is ON
          // Covers both wrong password and non-existent email
          throw new Error('Invalid email or password. Please try again.');

        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');

        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support.');

        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later.');

        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');

        default:
          throw new Error('Login failed. Please try again.');
      }
    }
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Keep loading=true until we have the role from Firestore
        getDoc(doc(db, 'users', user.uid))
          .then(docSnap => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              setUserProfile(prev => prev || { uid: user.uid, email: user.email, role: 'student' });
            }
          })
          .catch(err => {
            console.error('Error fetching user profile:', err);
            setUserProfile(prev => prev || { uid: user.uid, email: user.email, role: 'student' });
          })
          .finally(() => {
            setLoading(false); // Only done after role is known
          });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
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