import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let { data, error } = await supabase.auth.getUser();
    if (!data?.user) {
      const sessionResult = await supabase.auth.getSession();
      if (sessionResult.data?.session?.user) {
        return { user: sessionResult.data.session.user };
      }
    }
    if (error || !data?.user) throw redirect({ to: "/auth" });
    return { user: data.user };
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
