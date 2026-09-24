import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

interface AuthValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { full_name?: string | undefined; avatar_url?: string | undefined }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateUserProfile: async () => {},
  refreshUser: async () => {},
});

export const DEMO_USER: User = {
  id: "demo-user-123",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Demo User", name: "Demo User" },
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
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // If returning from an OAuth callback, clear demo flags to prioritize real OAuth user
        if (window.location.search.includes("code=") || window.location.hash.includes("access_token=")) {
          localStorage.removeItem("bt_demo_session");
          localStorage.removeItem("bt_demo_user");
        } else if (localStorage.getItem("bt_demo_session") === "true") {
          setIsDemo(true);
          setDemoUser(getDemoUser());
          setLoading(false);
          return;
        }
      }
    } catch {
      // Storage unavailable
    }

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        setIsDemo(false);
      }
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: current }) => {
        setSession(current?.session ?? null);
        if (current?.session?.user) {
          setIsDemo(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });

    return () => data.subscription.unsubscribe();
  }, []);

  const updateUserProfile = async (updates: { full_name?: string | undefined; avatar_url?: string | undefined }) => {
    if (isDemo || (typeof window !== "undefined" && localStorage.getItem("bt_demo_session") === "true")) {
      const current = getDemoUser();
      const existingMeta = current.user_metadata ?? {};
      const updatedUser: User = {
        ...current,
        user_metadata: {
          ...existingMeta,
          ...updates,
          name: updates.full_name ?? (typeof existingMeta["name"] === "string" ? existingMeta["name"] : undefined),
          full_name: updates.full_name ?? (typeof existingMeta["full_name"] === "string" ? existingMeta["full_name"] : undefined),
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("bt_demo_user", JSON.stringify(updatedUser));
      }
      setDemoUser(updatedUser);
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
    if (data.user) {
      setSession((prev) => (prev ? { ...prev, user: data.user } : prev));
    }
  };

  const refreshUser = async () => {
    if (isDemo || (typeof window !== "undefined" && localStorage.getItem("bt_demo_session") === "true")) {
      setDemoUser(getDemoUser());
      return;
    }
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setSession((prev) => (prev ? { ...prev, user: data.user } : prev));
    }
  };

  const value = useMemo<AuthValue>(
    () => ({
      user: isDemo ? (demoUser ?? getDemoUser()) : (session?.user ?? null),
      session,
      loading,
      signOut: async () => {
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("bt_demo_session");
            localStorage.removeItem("bt_demo_user");
            localStorage.removeItem("bt_admin_token");
            localStorage.removeItem("bt_user_plan");
          }
        } catch {
          // ignore
        }
        setIsDemo(false);
        setDemoUser(null);
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
      updateUserProfile,
      refreshUser,
    }),
    [session, loading, isDemo, demoUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
