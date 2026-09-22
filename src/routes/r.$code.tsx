import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

function detectDevice(ua: string) {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (!ua) return "unknown";
  return "desktop";
}

function detectBrowser(ua: string) {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Other";
}

export const Route = createFileRoute("/r/$code")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const code = String(params.code ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 16);
        if (!code) return new Response("Not found", { status: 404 });

        const ua = request.headers.get("user-agent") ?? "";
        const device = detectDevice(ua);
        const browser = detectBrowser(ua);
        const country = request.headers.get("cf-ipcountry") || request.headers.get("x-country") || "India";
        const city = request.headers.get("cf-ipcity") || "New Delhi";
        const referrer = request.headers.get("referer")?.slice(0, 300) || "Direct Scan";

        let target: string | null = null;
        let qrId: string | null = null;
        let scanCount = 0;

        // 1. Instant check in server-side dynamic registry (handles live destination changes)
        try {
          const { getDynamicRoute, recordDynamicScan } = await import(
            "@/lib/qr/dynamic-registry.server"
          );
          const localRecord = getDynamicRoute(code);
          if (localRecord?.target_url) {
            target = localRecord.target_url;
            scanCount = recordDynamicScan(code, {
              device_type: device === "mobile" ? "Mobile" : device === "tablet" ? "Tablet" : "Desktop",
              browser,
              country,
              city,
              referrer,
            });
          }
        } catch {
          // ignore
        }

        // 2. Also check Supabase database if available with a fast timeout
        if (!target) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
            const query = supabaseAdmin
              .from("qr_codes")
              .select("id, target_url, encoded_value, scan_count")
              .eq("short_code", code)
              .maybeSingle();

            const res = await Promise.race([query, timeout]);
            if (res && "data" in res && res.data) {
              const qr = res.data;
              qrId = qr.id;
              target = qr.target_url ?? qr.encoded_value;
              scanCount = (qr.scan_count ?? 0) + 1;
              void supabaseAdmin
                .from("qr_codes")
                .update({ scan_count: scanCount })
                .eq("id", qr.id);
            }
          } catch {
            // ignore network/paused database errors
          }
        }

        // Social crawlers get a preview page with the "Scan me" OG card
        if (
          /bot|crawler|spider|facebookexternalhit|twitterbot|slackbot|whatsapp|telegrambot|discordbot|linkedinbot|embedly|pinterest|preview/i.test(
            ua,
          )
        ) {
          return new Response(null, {
            status: 302,
            headers: { location: `/s/${code}`, "cache-control": "no-store" },
          });
        }

        if (target && /^https?:\/\//i.test(target)) {
          return new Response(null, {
            status: 302,
            headers: {
              location: target,
              "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
              pragma: "no-cache",
            },
          });
        }

        // Resilient HTML fallback that inspects client storage and redirects immediately
        return new Response(
          `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening QR Destination...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; background: #0b1120; color: #f8fafc; text-align: center; }
    .card { background: #1e293b; padding: 2rem; border-radius: 1.5rem; max-width: 400px; border: 1px solid #334155; }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(14, 165, 233, 0.2); border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    a { color: #38bdf8; text-decoration: none; font-weight: 600; }
  </style>
  <script>
    (function() {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("bt_user_qr_codes") || key === "bt_demo_qr_codes")) {
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const found = list.find(function(q) { return q.short_code === "${code}"; });
            if (found && (found.target_url || found.encoded_value)) {
              window.location.replace(found.target_url || found.encoded_value);
              return;
            }
          }
        }
      } catch(e) {}
    })();
  </script>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2 style="margin: 0 0 0.5rem; font-size: 1.25rem;">Redirecting to destination...</h2>
    <p style="margin: 0 0 1rem; font-size: 0.875rem; color: #94a3b8;">If you are not redirected automatically within 3 seconds, <a href="/">click here to visit BT-QR</a>.</p>
  </div>
</body>
</html>`,
          {
            status: 200,
            headers: {
              "content-type": "text/html; charset=utf-8",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
  component: ClientDynamicRedirect,
});

function ClientDynamicRedirect() {
  const { code } = Route.useParams();
  const [status, setStatus] = useState<"redirecting" | "not_found">("redirecting");

  useEffect(() => {
    // 1. Check local storage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("bt_user_qr_codes") || key === "bt_demo_qr_codes")) {
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          const found = list.find((q: { short_code?: string; target_url?: string; encoded_value?: string }) => q.short_code === code);
          if (found && (found.target_url || found.encoded_value)) {
            window.location.replace(found.target_url || found.encoded_value);
            return;
          }
        }
      }
    } catch {
      // ignore
    }

    // 2. Query dynamic routes API
    void fetch(`/api/dynamic-routes?code=${encodeURIComponent(code)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.target_url) {
          window.location.replace(data.target_url);
        } else {
          setStatus("not_found");
        }
      })
      .catch(() => {
        setStatus("not_found");
      });
  }, [code]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-gradient px-4 py-12 text-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
        {status === "redirecting" ? (
          <>
            <div className="mx-auto size-10 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
            <h1 className="mt-4 text-xl font-bold text-foreground">Redirecting...</h1>
            <p className="mt-1 text-sm text-muted-foreground">Opening destination for QR code {code}</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">Destination not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This dynamic QR code ({code}) has no active destination URL configured.
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-xl bg-brand-gradient px-4 py-2 font-semibold text-primary-foreground shadow-brand"
            >
              Back to BT-QR Generator
            </a>
          </>
        )}
      </div>
    </div>
  );
}
