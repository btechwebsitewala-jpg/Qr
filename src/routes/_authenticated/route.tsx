import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

import { getDemoUser } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("bt_demo_session") === "true") {
        return { user: getDemoUser() };
      }
      let { data, error } = await supabase.auth.getUser();
      if (!data?.user) {
        const sessionResult = await supabase.auth.getSession();
        if (sessionResult.data?.session?.user) {
          return { user: sessionResult.data.session.user };
        }
      }
      if (error || !data?.user) throw redirect({ to: "/auth" });
      return { user: data.user };
    } catch (err) {
      if (typeof err === "object" && err !== null && "to" in err) throw err;
      throw redirect({ to: "/auth" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
