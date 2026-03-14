"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db, googleProvider } from "@/lib/firebase";

export type UserRole = "regional" | "head" | "accounts";

export type AuthUser = {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role: UserRole;
  city?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  accessDenied: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function resolveUser(firebaseUser: FirebaseUser): Promise<AuthUser | null> {
  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
  if (!userDoc.exists()) return null;
  const data = userDoc.data();
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    name: firebaseUser.displayName ?? "",
    photoURL: firebaseUser.photoURL ?? "",
    role: data.role as UserRole,
    city: data.city,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter(); // used by signOut

  useEffect(() => {
    // Handle the redirect result when Google sends the user back
    getRedirectResult(auth).catch(() => {
      // Ignore — onAuthStateChanged handles the actual auth state
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        document.cookie = "ygpt-auth=; path=/; max-age=0";
        return;
      }

      try {
        const resolved = await resolveUser(firebaseUser);
        if (!resolved) {
          // Email not registered in Firestore — sign out and show denied
          await firebaseSignOut(auth);
          setUser(null);
          setAccessDenied(true);
          document.cookie = "ygpt-auth=; path=/; max-age=0";
        } else {
          setUser(resolved);
          setAccessDenied(false);
          document.cookie = "ygpt-auth=1; path=/; max-age=3600; SameSite=Strict";
          // Hard redirect so middleware sees the cookie on a fresh request
          if (window.location.pathname === "/login") {
            window.location.href = "/";
          }
        }
      } catch (err) {
        setUser(null);
        setAuthError(err instanceof Error ? err.message : "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setAccessDenied(false);
    await signInWithRedirect(auth, googleProvider);
    // Page will redirect to Google, then back here.
    // getRedirectResult is handled in the useEffect below.
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    document.cookie = "ygpt-auth=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessDenied, authError, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
