// 📁 firebase/index.ts
// ✅ FIXED: Signup with guaranteed username persistence

'use client';

import React from 'react';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Firebase instances
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION (Firebase App Hosting compatible)
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Attempt Firebase App Hosting auto-initialization (production)
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback to config (development)
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  app = firebaseApp;
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);

  return {
    firebaseApp,
    auth,
    firestore: db
  };
}

// Initialize on client-side
if (typeof window !== 'undefined' && !getApps().length) {
  initializeFirebase();
}

// Export Firebase instances
export { app, auth, db };

// ✅ FIXED SIGNUP: Ensures username is saved to both Auth profile AND Firestore
export const initiateEmailSignUp = async (
  email: string,
  password: string,
  username: string,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  try {
    // Step 1: Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Update Auth profile with display name
    try {
      await updateProfile(user, {
        displayName: username
      });
    } catch (profileError) {
      console.error('💥 updateProfile failed:', profileError);
      throw new Error('Failed to update profile with username');
    }

    // Step 3: Also save to Firestore for redundancy
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        displayName: username,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (firestoreError) {
      console.error('⚠️ Firestore save warning (non-critical):', firestoreError);
      // Don't fail signup if Firestore fails, Auth is primary
    }

    // Step 4: Force refresh auth state
    try {
      await user.reload();
    } catch (reloadError) {
      console.error('⚠️ Reload warning:', reloadError);
    }

    // Step 5: Verify username was set
    if (!user.displayName) {
      console.error('❌ CRITICAL: displayName not set after update');
      throw new Error('Username was not properly saved');
    }

    onSuccess();
  } catch (error: any) {
    console.error('💥 Signup error:', {
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    onError(error);
  }
};

export const initiateEmailSignIn = async (
  email: string,
  password: string,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Reload to ensure latest profile data
    await userCredential.user.reload();
    
    onSuccess();
  } catch (error: any) {
    console.error('💥 Login error:', error);
    onError(error);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('💥 Sign out error:', error);
  }
};

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      console.log('👤 [DERMAFLOW-AUTH] State changed:', {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  return {
    user: context?.user || null,
    isUserLoading: context?.loading || false,
    userError: null
  };
};

// Re-export existing hooks
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';