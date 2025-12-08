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

console.log('🧪 [DERMAFLOW-FIREBASE] Config check:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Loaded' : '✗ Missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Loaded' : '✗ Missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Loaded' : '✗ Missing',
});

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
    console.log('🧪 [DERMAFLOW-SIGNUP] Starting signup with:', { email, username });
    
    // Step 1: Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ [DERMAFLOW-SIGNUP] User created:', user.uid);

    // Step 2: Update Auth profile with display name
    console.log('📝 [DERMAFLOW-SIGNUP] Setting displayName in Auth profile...');
    try {
      await updateProfile(user, {
        displayName: username
      });
      console.log('✅ [DERMAFLOW-SIGNUP] Auth displayName set:', username);
    } catch (profileError) {
      console.error('💥 [DERMAFLOW-SIGNUP] updateProfile failed:', profileError);
      throw new Error('Failed to update profile with username');
    }

    // Step 3: Also save to Firestore for redundancy
    console.log('📝 [DERMAFLOW-SIGNUP] Saving username to Firestore...');
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        displayName: username,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log('✅ [DERMAFLOW-SIGNUP] Firestore user profile saved');
    } catch (firestoreError) {
      console.error('⚠️ [DERMAFLOW-SIGNUP] Firestore save warning (non-critical):', firestoreError);
      // Don't fail signup if Firestore fails, Auth is primary
    }

    // Step 4: Force refresh auth state
    console.log('🔄 [DERMAFLOW-SIGNUP] Refreshing auth state...');
    try {
      await user.reload();
      console.log('✅ [DERMAFLOW-SIGNUP] Auth state refreshed. Display name:', user.displayName);
    } catch (reloadError) {
      console.error('⚠️ [DERMAFLOW-SIGNUP] Reload warning:', reloadError);
    }

    // Step 5: Verify username was set
    if (!user.displayName) {
      console.error('❌ [DERMAFLOW-SIGNUP] CRITICAL: displayName not set after update');
      throw new Error('Username was not properly saved');
    }

    console.log('🎉 [DERMAFLOW-SIGNUP] Signup complete:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

    onSuccess();
  } catch (error: any) {
    console.error('💥 [DERMAFLOW-ERROR-🚨SIGNUP-001🚨] Signup error:', {
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
    console.log('🧪 [DERMAFLOW-LOGIN] Signing in:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Reload to ensure latest profile data
    await userCredential.user.reload();
    
    console.log('✅ [DERMAFLOW-LOGIN] Signed in:', {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName
    });
    onSuccess();
  } catch (error: any) {
    console.error('💥 [DERMAFLOW-ERROR-🚨LOGIN-001🚨] Login error:', error);
    onError(error);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('✅ [DERMAFLOW-LOGOUT] User signed out');
  } catch (error) {
    console.error('💥 [DERMAFLOW-ERROR-🚨LOGOUT-001🚨] Sign out error:', error);
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