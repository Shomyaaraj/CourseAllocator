import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, profileData) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userDoc = {
      uid: cred.user.uid,
      email,
      role: 'student',
      name: profileData.name,
      registrationNumber: profileData.registrationNumber,
      department: profileData.department,
      semester: profileData.semester,
      completedCourses: [],
      preferences: [],
      allocatedCourse: null,
      createdAt: new Date().toISOString()
    };
    // Save profile data locally immediately
    setUserProfile(userDoc);
    // Attempt to write to Firestore in the background, without blocking
    setDoc(doc(db, 'users', cred.user.uid), userDoc)
      .catch(err => {
        console.error('Error writing user profile to Firestore in background:', err);
        // Here you might implement a retry mechanism or notify the user
      });
    return cred;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Set loading to false immediately after auth state is known

      if (user) {
        // Fetch user profile in the background, without blocking the main flow
        getDoc(doc(db, 'users', user.uid))
          .then(docSnap => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              // If profile doesn't exist in Firestore, store a basic profile in memory
              // This might happen if signup failed to write to Firestore initially
              setUserProfile(prev => prev || { uid: user.uid, email: user.email, role: 'student' });
            }
          })
          .catch(err => {
            console.error('Error fetching user profile from Firestore in background:', err);
            // If Firestore is unavailable or fails, store a basic profile in memory
            setUserProfile(prev => prev || { uid: user.uid, email: user.email, role: 'student' });
          });
      } else {
        setUserProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    signup,
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
