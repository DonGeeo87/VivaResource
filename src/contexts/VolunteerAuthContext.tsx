"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import type { VolunteerUser } from "@/types/volunteer";

interface VolunteerAuthContextType {
  user: VolunteerUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const VolunteerAuthContext = createContext<VolunteerAuthContextType | undefined>(undefined);

export function VolunteerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VolunteerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Check if user exists in volunteer_users collection
          const userDoc = await getDoc(doc(db, "volunteer_users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              phone: userData.phone || "",
              status: userData.status || "pending",
              registrationId: userData.registrationId,
              joinedAt: userData.joinedAt?.toDate() || new Date(),
              lastLoginAt: userData.lastLoginAt?.toDate(),
              language: userData.language || "en",
              notificationsEnabled: userData.notificationsEnabled ?? true,
              unreadMessages: userData.unreadMessages || 0,
              upcomingTasks: userData.upcomingTasks || 0,
            });

            // Update last login
            await setDoc(doc(db, "volunteer_users", firebaseUser.uid), {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          } else {
            // User authenticated but not in volunteer_users - sign out
            await firebaseSignOut(auth);
            setUser(null);
          }
        } catch (err) {
          console.error("Error loading volunteer user:", err);
          await firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check if user is a volunteer
      const userDoc = await getDoc(doc(db, "volunteer_users", userCredential.user.uid));
      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        setError("Esta cuenta no está registrada como voluntario. Contacta al administrador.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      throw err;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create volunteer user document
      await setDoc(doc(db, "volunteer_users", userCredential.user.uid), {
        email,
        firstName,
        lastName,
        status: "pending",
        joinedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        language: "en",
        notificationsEnabled: true,
        unreadMessages: 0,
        upcomingTasks: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear cuenta";
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <VolunteerAuthContext.Provider value={{ user, loading, login, signup, logout, error }}>
      {children}
    </VolunteerAuthContext.Provider>
  );
}

export function useVolunteerAuth(): VolunteerAuthContextType {
  const context = useContext(VolunteerAuthContext);
  if (context === undefined) {
    throw new Error("useVolunteerAuth must be used within a VolunteerAuthProvider");
  }
  return context;
}
