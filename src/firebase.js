import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for vuca-course-allocation-app
const firebaseConfig = {
  apiKey: "AIzaSyA8Z76pLvgw8tydMIn_JNSdl4X74zu8Qcc",
  authDomain: "vuca-course-allocation-app.firebaseapp.com",
  projectId: "vuca-course-allocation-app",
  storageBucket: "vuca-course-allocation-app.firebasestorage.app",
  messagingSenderId: "755086485622",
  appId: "1:755086485622:web:dd8d0405a109f5798e5757"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
