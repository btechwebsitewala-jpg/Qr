import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Globe2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

function detectDevice(ua: string): string {
  if (!ua) return "Mobile";
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectBrowser(ua: string): string {
  if (!ua) return "Chrome";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/UCBrowser/i.test(ua)) return "UC Browser";
  if (/CriOS/i.test(ua)) return "Chrome";
  if (/FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Mobile Browser";
}

function isBot(ua: string): boolean {
  return /bot|crawler|spider|facebookexternalhit|twitterbot|slackbot|whatsapp|telegrambot|discordbot|linkedinbot|embedly|pinterest|preview/i.test(
    ua,
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const Route = createFileRoute("/r/$code")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const rawCode = String(params.code ?? "").trim();
        const code = rawCode.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
        if (!code) return new Response("Not found", { status: 404 });

        const urlObj = new URL(request.url);
        const forceInstant = urlObj.searchParams.get("instant") === "true" || urlObj.searchParams.get("direct") === "true";

        const ua = request.headers.get("user-agent") ?? "";
        const device = detectDevice(ua);
        const browser = detectBrowser(ua);
        const country =
          request.headers.get("cf-ipcountry") ||
          request.headers.get("x-country") ||
          request.headers.get("x-real-ip-country") ||
          "India";
        const city = request.headers.get("cf-ipcity") || request.headers.get("x-city") || "New Delhi";
        const referrer = request.headers.get("referer")?.slice(0, 300) || "Direct Camera Scan";

        let target: string | null = null;
        let qrName: string = "BT-QR Dynamic Link";
        let scanCount = 0;

        // 1. Instant check in server-side dynamic registry
        let localRecord: import("@/lib/qr/dynamic-registry.server").DynamicRouteRecord | null = null;
        try {
          const { getDynamicRoute, recordDynamicScan } = await import(
            "@/lib/qr/dynamic-registry.server"
          );
          localRecord = getDynamicRoute(code);
          if (localRecord?.target_url) {
            target = localRecord.target_url;
            if (localRecord.name) qrName = localRecord.name;
            scanCount = recordDynamicScan(code, {
              device_type: device,
              browser,
              country,
              city,
              referrer,
            });
          }
        } catch {
          // ignore
        }

        // 2. Database fallback (Supabase) if not already found in local registry
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
          const query = supabaseAdmin
            .from("qr_codes")
            .select("id, name, target_url, encoded_value, scan_count, updated_at")
            .eq("short_code", code)
            .maybeSingle();

          const res = await Promise.race([query, timeout]);
          if (res && "data" in res && res.data) {
            const qr = res.data;
            const dbTarget = qr.target_url ?? qr.encoded_value;

            if (qr.name && (!qrName || qrName === "BT-QR Dynamic Link")) {
              qrName = qr.name;
            }

            // Fallback to DB only if registry did not have a target URL
            if (!target && dbTarget) {
              target = dbTarget;
              try {
                const { setDynamicRoute, recordDynamicScan } = await import(
                  "@/lib/qr/dynamic-registry.server"
                );
                setDynamicRoute({
                  short_code: code,
                  target_url: dbTarget,
                  name: qr.name || qrName,
                  scan_count: (qr.scan_count ?? 0) + 1,
                });
                scanCount = recordDynamicScan(code, {
                  device_type: device,
                  browser,
                  country,
                  city,
                  referrer,
                });
              } catch {
                // ignore
              }
            }

            // Sync scan count to Supabase
            void supabaseAdmin
              .from("qr_codes")
              .update({ scan_count: scanCount || (qr.scan_count ?? 0) + 1 })
              .eq("id", qr.id);
          }
        } catch {
          // ignore network/database errors
        }

        // Ensure target protocol is valid
        if (target && !/^https?:\/\//i.test(target)) {
          target = `https://${target}`;
        }

        // Social crawlers get metadata/preview page
        if (isBot(ua)) {
          if (target) {
            return new Response(
              `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(qrName)} | BT-QR</title>
  <meta property="og:title" content="${escapeHtml(qrName)}">
  <meta property="og:description" content="Scan to open destination: ${escapeHtml(target)}">
  <meta property="og:url" content="${escapeHtml(target)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(target)}">${escapeHtml(target)}</a>...</p>
</body>
</html>`,
              {
                status: 200,
                headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
              },
            );
          }
          return new Response(null, {
            status: 302,
            headers: { location: `/s/${code}`, "cache-control": "no-store" },
          });
        }

        // Instant redirect directly to target website (record scan and navigate immediately)
        if (target && /^https?:\/\//i.test(target) && urlObj.searchParams.get("landing") !== "true") {
          return new Response(null, {
            status: 302,
            headers: {
              location: target,
              "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
              pragma: "no-cache",
            },
          });
        }

        // Optional Scan Interstitial Landing Page (if explicitly requested with ?landing=true)
        if (target && /^https?:\/\//i.test(target)) {
          const safeTarget = escapeHtml(target);
          const safeName = escapeHtml(qrName);

          return new Response(
            `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta http-equiv="refresh" content="2;url=${safeTarget}">
  <title>${safeName} — QR Scan Landing | BT-QR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      background: radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%);
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
    }
    .wrapper {
      width: 100%;
      max-width: 440px;
      text-align: center;
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 1.75rem;
      padding: 2.25rem 1.75rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(14, 165, 233, 0.15);
    }
    .shield-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      letter-spacing: 0.02em;
      margin-bottom: 1.5rem;
    }
    .shield-dot {
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .qr-icon-wrap {
      position: relative;
      width: 72px;
      height: 72px;
      margin: 0 auto 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2));
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 1.25rem;
      box-shadow: 0 0 25px rgba(14, 165, 233, 0.25);
    }
    .qr-icon-svg {
      width: 38px;
      height: 38px;
      color: #38bdf8;
    }
    .qr-name {
      font-size: 1.45rem;
      font-weight: 800;
      line-height: 1.3;
      color: #ffffff;
      margin-bottom: 0.75rem;
      word-break: break-word;
      letter-spacing: -0.01em;
    }
    .dest-container {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 1rem;
      padding: 0.85rem 1rem;
      margin: 1.25rem 0 1.5rem;
      text-align: left;
    }
    .dest-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }
    .dest-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #38bdf8;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      word-break: break-all;
      transition: color 0.15s ease;
    }
    .dest-link:hover {
      color: #7dd3fc;
      text-decoration: underline;
    }
    .globe-icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      color: #0ea5e9;
    }
    .arrow-icon {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      margin-left: auto;
      opacity: 0.7;
    }
    .progress-bar-wrap {
      width: 100%;
      height: 6px;
      background: rgba(51, 65, 85, 0.5);
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }
    .progress-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #0ea5e9, #6366f1);
      border-radius: 9999px;
      transition: width 1.8s linear;
    }
    .countdown-text {
      font-size: 0.82rem;
      color: #94a3b8;
      margin-bottom: 1.5rem;
    }
    .countdown-number {
      color: #38bdf8;
      font-weight: 700;
    }
    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.95rem 1.25rem;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      border-radius: 1rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(14, 165, 233, 0.4);
      transition: transform 0.15s ease, opacity 0.15s ease;
    }
    .action-btn:active {
      transform: scale(0.98);
    }
    .footer-note {
      margin-top: 1.5rem;
      font-size: 0.75rem;
      color: #64748b;
    }
    .footer-brand {
      color: #94a3b8;
      font-weight: 600;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="shield-badge">
        <span class="shield-dot"></span>
        Verified QR Destination
      </div>

      <div class="qr-icon-wrap">
        <svg class="qr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
          <line x1="17" y1="7" x2="17.01" y2="7"></line>
          <line x1="7" y1="17" x2="7.01" y2="17"></line>
          <line x1="17" y1="17" x2="17.01" y2="17"></line>
        </svg>
      </div>

      <!-- QR Name Display -->
      <h1 class="qr-name" id="display-name">${safeName}</h1>

      <!-- Website Line / Destination URL Display -->
      <div class="dest-container">
        <div class="dest-label">Website Destination:</div>
        <a href="${safeTarget}" class="dest-link" id="display-link">
          <svg class="globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeTarget}</span>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" id="progress-bar"></div>
      </div>

      <p class="countdown-text">
        Opening website in <span class="countdown-number" id="countdown-num">2</span>s...
      </p>

      <a href="${safeTarget}" class="action-btn" id="direct-btn">
        <span>Open Website Now</span>
        <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </a>
    </div>

    <div class="footer-note">
      Powered by <a href="/" class="footer-brand">BT-QR / BTech Websitewala</a>
    </div>
  </div>

  <script>
    (function() {
      var targetUrl = ${JSON.stringify(target)};
      var bar = document.getElementById('progress-bar');
      var num = document.getElementById('countdown-num');
      var seconds = 2;

      // Animate progress bar fill smoothly
      if (bar) {
        setTimeout(function() {
          bar.style.width = '100%';
        }, 50);
      }

      var timer = setInterval(function() {
        seconds--;
        if (num) num.textContent = seconds > 0 ? seconds : '1';
        if (seconds <= 0) {
          clearInterval(timer);
          window.location.replace(targetUrl);
        }
      }, 900);

      // Fast auto-redirect safety trigger
      setTimeout(function() {
        window.location.replace(targetUrl);
      }, 1800);
    })();
  </script>
</body>
</html>`,
            {
              status: 200,
              headers: {
                "content-type": "text/html; charset=utf-8",
                "cache-control": "no-store, no-cache, must-revalidate",
              },
            },
          );
        }

        // Resilient Fallback: If not registered on server yet, check client localStorage
        return new Response(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening QR Destination... | BT-QR</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; background: #0b1120; color: #f8fafc; text-align: center; padding: 1rem; }
    .card { background: #1e293b; padding: 2.25rem 1.75rem; border-radius: 1.75rem; max-width: 420px; width: 100%; border: 1px solid #334155; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(14, 165, 233, 0.2); border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.25rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .name-title { font-size: 1.35rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem; word-break: break-word; }
    .url-badge { background: #0f172a; border: 1px solid #334155; padding: 0.75rem; border-radius: 0.85rem; color: #38bdf8; font-weight: 600; font-size: 0.9rem; word-break: break-all; margin: 1rem 0; display: block; text-decoration: none; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff; padding: 0.8rem 1.5rem; border-radius: 0.85rem; text-decoration: none; font-weight: 700; font-size: 0.9rem; margin-top: 0.75rem; width: 100%; box-sizing: border-box; }
  </style>
  <script>
    (function() {
      var code = "${code}";
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key && (key.startsWith("bt_user_qr_codes") || key === "bt_demo_qr_codes")) {
            var list = JSON.parse(localStorage.getItem(key) || "[]");
            var found = list.find(function(q) { return q.short_code && q.short_code.toLowerCase() === code; });
            if (found && (found.target_url || found.encoded_value)) {
              var target = (found.target_url || found.encoded_value).trim();
              if (!/^https?:\\/\\//i.test(target)) target = 'https://' + target;
              var nameEl = document.getElementById('qr-name');
              var linkEl = document.getElementById('qr-link');
              var btnEl = document.getElementById('qr-btn');
              if (nameEl && found.name) nameEl.textContent = found.name;
              if (linkEl) { linkEl.textContent = target; linkEl.href = target; linkEl.style.display = 'block'; }
              if (btnEl) { btnEl.href = target; btnEl.style.display = 'block'; }
              
              // Record scan in background
              try {
                fetch('/api/dynamic-routes', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ action: 'record_scan', short_code: code, target_url: target, name: found.name })
                });
              } catch(e) {}

              setTimeout(function() {
                window.location.replace(target);
              }, 1200);
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
    <h2 class="name-title" id="qr-name">BT-QR Code Scanner</h2>
    <a href="#" class="url-badge" id="qr-link" style="display: none;"></a>
    <p style="margin: 0.5rem 0 1rem; font-size: 0.875rem; color: #94a3b8;">Connecting to destination...</p>
    <a href="#" class="btn" id="qr-btn" style="display: none;">Open Destination Now &rarr;</a>
    <p style="margin-top: 1.25rem; font-size: 0.75rem; color: #64748b;">If destination does not open, <a href="/" style="color: #38bdf8;">visit BT-QR Home</a>.</p>
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
  const cleanCode = (code ?? "").toLowerCase().trim();
  const [status, setStatus] = useState<"redirecting" | "not_found">("redirecting");
  const [qrName, setQrName] = useState<string>("BT-QR Dynamic Link");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(2);

  useEffect(() => {
    let active = true;

    function applyTarget(url: string, name?: string) {
      if (!active) return;
      let cleanUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;
      setTargetUrl(cleanUrl);
      if (name) setQrName(name);

      // Record scan
      try {
        fetch("/api/dynamic-routes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "record_scan", short_code: cleanCode, target_url: cleanUrl, name }),
        });
      } catch {
        // ignore
      }

      // Smooth countdown & redirect
      let c = 2;
      const interval = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(interval);
          window.location.replace(cleanUrl);
        }
      }, 900);

      setTimeout(() => {
        window.location.replace(cleanUrl);
      }, 1900);
    }

    function checkLocalFallback() {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("bt_user_qr_codes") || key === "bt_demo_qr_codes")) {
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const found = list.find(
              (q: { short_code?: string; target_url?: string; encoded_value?: string; name?: string }) =>
                q.short_code?.toLowerCase() === cleanCode,
            );
            if (found && (found.target_url || found.encoded_value)) {
              applyTarget(found.target_url || found.encoded_value, found.name);
              return;
            }
          }
        }
      } catch {
        // ignore
      }
      if (active) setStatus("not_found");
    }

    // 1. Query server dynamic routes API
    fetch(`/api/dynamic-routes?code=${encodeURIComponent(cleanCode)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.target_url) {
          applyTarget(data.target_url, data.name);
        } else {
          checkLocalFallback();
        }
      })
      .catch(() => {
        checkLocalFallback();
      });

    return () => {
      active = false;
    };
  }, [cleanCode]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-900 to-slate-950 px-4 py-12 text-center text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-primary/25 bg-card/85 p-8 shadow-2xl backdrop-blur-md">
        {status === "redirecting" ? (
          <>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified QR Destination
            </div>

            <div className="mx-auto mt-5 flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/10">
              <ShieldCheck className="size-8" />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">{qrName}</h1>

            {targetUrl ? (
              <div className="mt-4 rounded-2xl border border-border bg-background/80 p-3.5 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Website Destination:
                </p>
                <a
                  href={targetUrl}
                  className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary hover:underline truncate"
                >
                  <Globe2 className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{targetUrl}</span>
                  <ExternalLink className="size-3.5 shrink-0 opacity-70 ml-auto" />
                </a>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" /> Connecting to website...
              </div>
            )}

            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-brand-gradient transition-all duration-1000 ease-linear rounded-full"
                style={{ width: countdown <= 1 ? "100%" : "50%" }}
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Opening website in <span className="font-bold text-primary">{Math.max(1, countdown)}</span>s...
            </p>

            {targetUrl && (
              <a
                href={targetUrl}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-3.5 text-sm font-bold text-white shadow-brand transition-transform active:scale-95"
              >
                Open Website Now &rarr;
              </a>
            )}
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">Destination Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This dynamic QR code ({code}) has no active destination URL configured.
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-xl bg-brand-gradient px-5 py-2.5 font-semibold text-primary-foreground shadow-brand"
            >
              Back to BT-QR Generator
            </a>
          </>
        )}
      </div>
    </div>
  );
}
