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
    const cleanEmail = user.email?.toLowerCase().trim();
    if (cleanEmail === "rahulkushwaha1842003@gmail.com") {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // No other user has admin privileges
    setIsAdmin(false);
    setLoading(false);
  }, [user]);

  return { isAdmin, loading };
}
