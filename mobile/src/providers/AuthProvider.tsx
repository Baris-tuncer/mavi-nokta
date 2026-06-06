import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../lib/database.types";

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: { id: string; name: string; email: string; role: UserRole } | null;
  loading: boolean;
};

type AuthContextType = AuthState & {
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  async function fetchProfile(user: User) {
    const { data } = await supabase
      .from("profiles")
      .select("id, role, full_name, phone, city")
      .eq("id", user.id)
      .single();

    if (data) {
      const name =
        data.full_name ||
        user.user_metadata?.full_name ||
        user.email ||
        "Kullanici";

      // Sync full_name from auth metadata to profiles table if missing
      if (!data.full_name && user.user_metadata?.full_name) {
        supabase
          .from("profiles")
          .update({ full_name: user.user_metadata.full_name })
          .eq("id", user.id)
          .then();
      }

      setState((prev) => ({
        ...prev,
        profile: {
          id: data.id,
          name,
          email: user.email || "",
          role: data.role as UserRole,
        },
      }));
    }
  }

  async function refreshProfile() {
    if (state.user) {
      await fetchProfile(state.user);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
      if (session?.user) {
        fetchProfile(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        profile: session ? prev.profile : null,
        loading: false,
      }));
      if (session?.user) {
        fetchProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
