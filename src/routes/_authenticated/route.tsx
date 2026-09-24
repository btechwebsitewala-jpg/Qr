import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

import { getDemoUser } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      if (typeof window !== "undefined") {
        // 1. Check if OAuth error was returned in hash or query parameters
        const hash = window.location.hash;
        const search = window.location.search;
        if (
          hash.includes("error=") ||
          hash.includes("error_description=") ||
          search.includes("error=") ||
          search.includes("error_description=")
        ) {
          const params = new URLSearchParams(
            hash.includes("error") ? hash.replace(/^#/, "?") : search,
          );
          const err = params.get("error_description") || params.get("error") || "Authentication failed";
          throw redirect({
            to: "/auth",
            search: { error_description: err },
          });
        }

        // 2. Demo session check
        if (localStorage.getItem("bt_demo_session") === "true") {
          return { user: getDemoUser() };
        }
      }

      // 3. Await Supabase getSession (which waits for initializePromise / PKCE code exchange)
      let sessionResult = await supabase.auth.getSession();
      if (sessionResult.data?.session?.user) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bt_demo_session");
          localStorage.removeItem("bt_demo_user");
        }
        return { user: sessionResult.data.session.user };
      }

      // If returning with code or access_token in URL, give brief time for background exchange
      if (
        typeof window !== "undefined" &&
        (window.location.search.includes("code=") || window.location.hash.includes("access_token="))
      ) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        sessionResult = await supabase.auth.getSession();
        if (sessionResult.data?.session?.user) {
          localStorage.removeItem("bt_demo_session");
          localStorage.removeItem("bt_demo_user");
          return { user: sessionResult.data.session.user };
        }
      }

      // 4. Fallback to getUser()
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bt_demo_session");
          localStorage.removeItem("bt_demo_user");
        }
        return { user: data.user };
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
