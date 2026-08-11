/**
 * Demo-mode flag.
 * True when no real Firebase API key is provided (placeholder/demo key is in use).
 * Computed at module load time so all downstream code can check it instantly.
 */
export const isDemoFirebase =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  String(import.meta.env.VITE_FIREBASE_API_KEY).includes('DemoApiKey');

let app = null;
let auth = null;
let db = null;
let storage = null;

/**
 * Firestore-compatible mock for demo mode.
 * Provides `collection`, `doc`, `getDoc`, `getDocs`, `setDoc`, etc. that throw
 * a clear error instead of silently hanging on network timeouts.
 * This ensures that if any code path accidentally calls Firestore in demo mode,
 * it fails fast with a descriptive message rather than hanging indefinitely.
 */
const demoFirestoreProxy = new Proxy({}, {
  get(_, prop) {
    if (prop === 'then') return undefined; // not a promise
    return (...args) => {
      console.warn(`[Firebase] Demo mode: Firestore.${String(prop)}() called with`, args);
      throw new Error(
        'Firestore is unavailable in demo mode. ' +
        'All data is served from localStorage via mockDatabase.js. ' +
        'Set a real VITE_FIREBASE_API_KEY in .env to use Firestore.'
      );
    };
  },
});

/**
 * Auth-compatible mock for demo mode.
 * Provides `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`,
 * `onAuthStateChanged`, `signOut` that throw a clear error.
 */
const demoAuthProxy = new Proxy({}, {
  get(_, prop) {
    if (prop === 'then') return undefined;
    return (...args) => {
      console.warn(`[Firebase] Demo mode: auth.${String(prop)}() called with`, args);
      throw new Error(
        'Firebase Auth is unavailable in demo mode. ' +
        'All authentication is handled via localStorage by AuthContext. ' +
        'Set a real VITE_FIREBASE_API_KEY in .env to use Firebase Auth.'
      );
    };
  },
});

if (!isDemoFirebase) {
  // ── Real Firebase: only initialize when a real API key is configured ──
  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  const { getStorage } = await import('firebase/storage');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.log('[Firebase] Demo mode — Firebase SDK not loaded. Using localStorage mock.');
}

// ✅ IMPORTANT: always export valid references
// In demo mode, auth/db are null — consumer code must check isDemoFirebase first.
export { auth, db, storage };
export default app;
