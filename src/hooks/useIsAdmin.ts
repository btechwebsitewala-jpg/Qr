import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/** True when the signed-in user holds the admin role. */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    if (user.email === "demo@bt-qr.app") {
      setIsAdmin(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    const checkAdmin = async () => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!active) return;
        setIsAdmin(Boolean(data));
      } catch {
        if (!active) return;
        setIsAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    };
    checkAdmin();
    return () => {
      active = false;
    };
  }, [user]);

  return { isAdmin, loading };
}
