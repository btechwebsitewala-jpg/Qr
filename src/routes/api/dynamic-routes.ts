import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/dynamic-routes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const allCounts = url.searchParams.get("all_counts") === "true";
        const includeScans = url.searchParams.get("scans") === "true";

        const {
          getDynamicRoute,
          listAllDynamicRoutes,
          getScansForCode,
        } = await import("@/lib/qr/dynamic-registry.server");

        if (allCounts) {
          const all = listAllDynamicRoutes();
          const countMap: Record<string, number> = {};
          for (const item of all) {
            countMap[item.short_code.toLowerCase()] = item.scan_count ?? 0;
          }
          return new Response(JSON.stringify(countMap), {
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          });
        }

        if (code) {
          const found = getDynamicRoute(code);
          if (!found) {
            return new Response(JSON.stringify(null), {
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            });
          }

          if (includeScans) {
            const scans = getScansForCode(code);
            return new Response(
              JSON.stringify({
                ...found,
                scans,
              }),
              {
                headers: { "content-type": "application/json", "cache-control": "no-store" },
              },
            );
          }

          return new Response(JSON.stringify(found), {
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          });
        }

        const all = listAllDynamicRoutes();
        return new Response(JSON.stringify(all), {
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        });
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            action?: string;
            short_code?: string;
            target_url?: string;
            name?: string;
            scan_count?: number;
          };

          const {
            setDynamicRoute,
            recordDynamicScan,
            getDynamicRoute,
          } = await import("@/lib/qr/dynamic-registry.server");

          // Test / simulate scan action
          if (body?.action === "simulate_scan" && body?.short_code) {
            const code = body.short_code.toLowerCase().trim();
            const newCount = recordDynamicScan(code, {
              device_type: "Mobile",
              browser: "Chrome Mobile",
              country: "India",
              city: "New Delhi",
              referrer: "QR Code Scan Test",
            });
            const updated = getDynamicRoute(code);
            return new Response(
              JSON.stringify({ success: true, scan_count: newCount, record: updated }),
              { headers: { "content-type": "application/json" } },
            );
          }

          if (!body?.short_code || !body?.target_url) {
            return new Response(
              JSON.stringify({ error: "Missing required short_code or target_url" }),
              { status: 400, headers: { "content-type": "application/json" } },
            );
          }

          const saved = setDynamicRoute({
            short_code: body.short_code,
            target_url: body.target_url,
            name: body.name,
            scan_count: body.scan_count,
          });

          return new Response(JSON.stringify({ success: true, record: saved }), {
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
