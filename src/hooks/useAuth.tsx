import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

interface AuthValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const DEMO_USER: User = {
  id: "demo-user-123",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Demo Admin", name: "Demo Admin" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "demo@bt-qr.app",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

export function createLocalUser(
  email: string,
  name?: string,
  provider: "google" | "email" = "google",
): User {
  const cleanEmail = email.trim().toLowerCase();
  const userName = name?.trim() || cleanEmail.split("@")[0] || "User";
  const userId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  return {
    id: userId,
    app_metadata: { provider },
    user_metadata: {
      full_name: userName,
      name: userName,
      email: cleanEmail,
      avatar_url:
        provider === "google"
          ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
          : undefined,
    },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: cleanEmail,
    phone: "",
    role: "authenticated",
    updated_at: new Date().toISOString(),
  };
}

export function signInLocally(
  email: string,
  name?: string,
  provider: "google" | "email" = "google",
): User {
  const user = createLocalUser(email, name, provider);
  if (typeof window !== "undefined") {
    localStorage.setItem("bt_demo_session", "true");
    localStorage.setItem("bt_demo_user", JSON.stringify(user));
  }
  return user;
}

export function getDemoUser(): User {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bt_demo_user");
      if (stored) return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return DEMO_USER;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("bt_demo_session") === "true") {
        setIsDemo(true);
        setLoading(false);
        return;
      }
    } catch {
      // Storage unavailable
    }

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: current }) => {
        setSession(current?.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user: isDemo ? getDemoUser() : (session?.user ?? null),
      session,
      loading,
      signOut: async () => {
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("bt_demo_session");
            localStorage.removeItem("bt_demo_user");
          }
        } catch {
          // ignore
        }
        setIsDemo(false);
        setSession(null);
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore network failure
        }
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      },
    }),
    [session, loading, isDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
