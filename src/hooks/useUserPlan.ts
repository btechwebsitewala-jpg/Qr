import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type PlanTier = "free" | "lite" | "premium";

export function useUserPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage override first (useful for testing & demo simulation)
    const stored = typeof window !== "undefined" ? localStorage.getItem("bt_user_plan") : null;
    if (stored === "lite" || stored === "premium" || stored === "free") {
      setPlan(stored as PlanTier);
      setLoading(false);
      return;
    }

    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }

    // Demo user gets premium by default
    if (user.email === "demo@bt-qr.app") {
      setPlan("premium");
      setLoading(false);
      return;
    }

    let active = true;
    const fetchPlan = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle();

        if (active && data?.plan) {
          const p = data.plan.toLowerCase();
          setPlan(p === "premium" ? "premium" : p === "lite" ? "lite" : "free");
        }
      } catch {
        if (active) setPlan("free");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPlan();
    return () => {
      active = false;
    };
  }, [user]);

  const setSimulatedPlan = (newPlan: PlanTier | null) => {
    if (newPlan) {
      localStorage.setItem("bt_user_plan", newPlan);
      setPlan(newPlan);
    } else {
      localStorage.removeItem("bt_user_plan");
      setPlan(user?.email === "demo@bt-qr.app" ? "premium" : "free");
    }
  };

  const isPaid = plan === "lite" || plan === "premium";
  const isPremium = plan === "premium";

  return {
    plan,
    isPaid,
    isPremium,
    loading,
    setSimulatedPlan,
  };
}
